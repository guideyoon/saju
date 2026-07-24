import type { BirthInput, ReadingResponse } from "../saju/types";
import {
  createRecoveryToken,
  openPayload,
  sealPayload,
  secretHash,
} from "./crypto";

type StoredPayload = {
  input: BirthInput;
  reading: ReadingResponse;
};

type StoredRow = {
  order_id: string;
  user_id?: string | null;
  payment_key_hash: string;
  amount: number;
  status: "DONE" | "CANCELED" | "PARTIAL_CANCELED";
  method: string;
  approved_at: string;
  reading_fingerprint: string;
  recovery_token_hash: string;
  payload_ciphertext: string;
  payload_iv: string;
  payload_auth_tag: string;
};

export type AccountReadingSummary = {
  orderId: string;
  amount: number;
  method: string;
  approvedAt: string;
};

function configuration() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey || !process.env.READING_ENCRYPTION_KEY) {
    throw new Error("Reading persistence is not configured.");
  }
  return { url, serviceKey };
}

export function hasPersistenceConfiguration() {
  return Boolean(
    process.env.SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() &&
      process.env.READING_ENCRYPTION_KEY?.trim(),
  );
}

async function databaseRequest(
  path: string,
  init: RequestInit = {},
  timeoutMs = 10_000,
) {
  const { url, serviceKey } = configuration();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) {
    throw new Error(`Reading database request failed: ${response.status}`);
  }
  return response;
}

function decodeRow(row: StoredRow): StoredPayload {
  return openPayload<StoredPayload>({
    ciphertext: row.payload_ciphertext,
    iv: row.payload_iv,
    authTag: row.payload_auth_tag,
  });
}

async function findRows(query: string) {
  const response = await databaseRequest(
    `myeongun_orders?select=*&${query}&limit=1`,
  );
  return (await response.json()) as StoredRow[];
}

export async function findReadingByPayment({
  orderId,
  paymentKey,
  fingerprint,
  userId,
}: {
  orderId: string;
  paymentKey: string;
  fingerprint: string;
  userId?: string | null;
}) {
  if (!hasPersistenceConfiguration()) return null;
  const rows = await findRows(
    `order_id=eq.${encodeURIComponent(orderId)}&payment_key_hash=eq.${secretHash(paymentKey)}&status=eq.DONE`,
  );
  const row = rows[0];
  if (!row || row.reading_fingerprint !== fingerprint) return null;

  const recoveryToken = createRecoveryToken();
  await databaseRequest(
    `myeongun_orders?order_id=eq.${encodeURIComponent(orderId)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        recovery_token_hash: secretHash(recoveryToken),
        ...(userId ? { user_id: userId } : {}),
        updated_at: new Date().toISOString(),
      }),
    },
  );

  return { ...decodeRow(row), recoveryToken };
}

export async function findReadingByRecovery({
  orderId,
  recoveryToken,
}: {
  orderId: string;
  recoveryToken: string;
}) {
  if (!hasPersistenceConfiguration()) return null;
  const rows = await findRows(
    `order_id=eq.${encodeURIComponent(orderId)}&recovery_token_hash=eq.${secretHash(recoveryToken)}&status=eq.DONE`,
  );
  return rows[0] ? decodeRow(rows[0]) : null;
}

export async function listUserReadings(userId: string) {
  if (!hasPersistenceConfiguration()) return [];
  const response = await databaseRequest(
    `myeongun_orders?select=order_id,amount,method,approved_at&user_id=eq.${encodeURIComponent(userId)}&status=eq.DONE&order=approved_at.desc&limit=50`,
  );
  const rows = (await response.json()) as Array<
    Pick<StoredRow, "order_id" | "amount" | "method" | "approved_at">
  >;
  return rows.map(
    (row): AccountReadingSummary => ({
      orderId: row.order_id,
      amount: row.amount,
      method: row.method,
      approvedAt: row.approved_at,
    }),
  );
}

export async function findReadingForUser({
  userId,
  orderId,
}: {
  userId: string;
  orderId: string;
}) {
  if (!hasPersistenceConfiguration()) return null;
  const rows = await findRows(
    `order_id=eq.${encodeURIComponent(orderId)}&user_id=eq.${encodeURIComponent(userId)}&status=eq.DONE`,
  );
  return rows[0] ? decodeRow(rows[0]) : null;
}

export async function updatePaymentStatus({
  orderId,
  paymentKey,
  amount,
  status,
}: {
  orderId: string;
  paymentKey: string;
  amount: number;
  status: "DONE" | "CANCELED" | "PARTIAL_CANCELED";
}) {
  const response = await databaseRequest(
    `myeongun_orders?order_id=eq.${encodeURIComponent(orderId)}&payment_key_hash=eq.${secretHash(paymentKey)}&amount=eq.${amount}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        status,
        updated_at: new Date().toISOString(),
      }),
    },
    2_000,
  );
  const rows = (await response.json()) as Array<Pick<StoredRow, "order_id">>;
  return rows.length > 0;
}

export async function storePaidReading({
  input,
  reading,
  paymentKey,
  fingerprint,
  userId,
}: {
  input: BirthInput;
  reading: ReadingResponse;
  paymentKey: string;
  fingerprint: string;
  userId?: string | null;
}) {
  const recoveryToken = createRecoveryToken();
  const sealed = sealPayload({ input, reading } satisfies StoredPayload);
  const payment = reading.payment;
  if (!payment) throw new Error("Paid reading is missing payment metadata.");

  await databaseRequest("myeongun_orders?on_conflict=order_id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({
      order_id: payment.orderId,
      user_id: userId || null,
      payment_key_hash: secretHash(paymentKey),
      amount: payment.amount,
      status: "DONE",
      method: payment.method,
      approved_at: payment.approvedAt,
      reading_fingerprint: fingerprint,
      recovery_token_hash: secretHash(recoveryToken),
      payload_ciphertext: sealed.ciphertext,
      payload_iv: sealed.iv,
      payload_auth_tag: sealed.authTag,
      updated_at: new Date().toISOString(),
    }),
  });

  return recoveryToken;
}

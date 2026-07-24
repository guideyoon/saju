import { z } from "zod";
import {
  isValidOrderId,
  REPORT_PRODUCT,
} from "../../../../lib/payments/catalog";
import { noStoreJson } from "../../../../lib/server/http";
import {
  hasPersistenceConfiguration,
  updatePaymentStatus,
} from "../../../../lib/storage/supabase";

export const dynamic = "force-dynamic";

const webhookSchema = z.object({
  eventType: z.literal("PAYMENT_STATUS_CHANGED"),
  data: z.object({
    paymentKey: z.string().min(1).max(200),
    orderId: z.string().min(6).max(64),
  }),
});

const storedStatuses = new Set([
  "DONE",
  "CANCELED",
  "PARTIAL_CANCELED",
] as const);

type StoredStatus = "DONE" | "CANCELED" | "PARTIAL_CANCELED";

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  try {
    const parsed = webhookSchema.safeParse(await request.json());
    if (!parsed.success) {
      return noStoreJson(
        { error: "지원하지 않거나 올바르지 않은 웹훅입니다." },
        { status: 400, requestId },
      );
    }

    const secretKey = process.env.TOSS_SECRET_KEY?.trim();
    if (!secretKey || !hasPersistenceConfiguration()) {
      return noStoreJson(
        { error: "결제 동기화 설정이 완료되지 않았습니다." },
        { status: 503, requestId },
      );
    }

    const { paymentKey, orderId } = parsed.data.data;
    if (!isValidOrderId(orderId)) {
      return noStoreJson({ received: true }, { requestId });
    }

    const authorization = Buffer.from(`${secretKey}:`).toString("base64");
    const tossResponse = await fetch(
      `https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}`,
      {
        headers: {
          Authorization: `Basic ${authorization}`,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(6_000),
      },
    );
    if (!tossResponse.ok) {
      throw new Error(`Toss payment lookup failed: ${tossResponse.status}`);
    }

    const payment = (await tossResponse.json()) as {
      paymentKey?: string;
      orderId?: string;
      totalAmount?: number;
      status?: string;
    };
    if (
      payment.paymentKey !== paymentKey ||
      payment.orderId !== orderId ||
      payment.totalAmount !== REPORT_PRODUCT.amount
    ) {
      return noStoreJson(
        { error: "조회된 결제 정보가 주문과 일치하지 않습니다." },
        { status: 409, requestId },
      );
    }

    if (!storedStatuses.has(payment.status as StoredStatus)) {
      return noStoreJson({ received: true, updated: false }, { requestId });
    }

    const updated = await updatePaymentStatus({
      orderId,
      paymentKey,
      amount: payment.totalAmount,
      status: payment.status as StoredStatus,
    });
    return noStoreJson({ received: true, updated }, { requestId });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return noStoreJson(
        { error: "올바른 JSON 형식으로 요청해 주세요." },
        { status: 400, requestId },
      );
    }
    console.error(`[${requestId}] Toss webhook synchronization failed.`, error);
    return noStoreJson(
      { error: "결제 상태 동기화에 실패했습니다." },
      { status: 500, requestId },
    );
  }
}

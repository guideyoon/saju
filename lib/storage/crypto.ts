import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

export type SealedPayload = {
  ciphertext: string;
  iv: string;
  authTag: string;
};

function encryptionKey() {
  const encoded = process.env.READING_ENCRYPTION_KEY;
  if (!encoded) throw new Error("READING_ENCRYPTION_KEY is not configured.");
  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    throw new Error("READING_ENCRYPTION_KEY must decode to 32 bytes.");
  }
  return key;
}

export function sealPayload(payload: unknown): SealedPayload {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  };
}

export function openPayload<T>(sealed: SealedPayload): T {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(sealed.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(sealed.authTag, "base64"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(sealed.ciphertext, "base64")),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}

export function secretHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function createRecoveryToken() {
  return randomBytes(32).toString("base64url");
}

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createRecoveryToken,
  openPayload,
  sealPayload,
  secretHash,
} from "./crypto";

afterEach(() => vi.unstubAllEnvs());

describe("encrypted reading storage", () => {
  it("round-trips a payload with AES-256-GCM", () => {
    vi.stubEnv("READING_ENCRYPTION_KEY", Buffer.alloc(32, 7).toString("base64"));
    const sealed = sealPayload({ name: "홍길동", score: 72 });
    expect(sealed.ciphertext).not.toContain("홍길동");
    expect(openPayload(sealed)).toEqual({ name: "홍길동", score: 72 });
  });

  it("rejects a wrong encryption key", () => {
    vi.stubEnv("READING_ENCRYPTION_KEY", Buffer.alloc(32, 7).toString("base64"));
    const sealed = sealPayload({ private: true });
    vi.stubEnv("READING_ENCRYPTION_KEY", Buffer.alloc(32, 8).toString("base64"));
    expect(() => openPayload(sealed)).toThrow();
  });

  it("creates non-reversible hashes and strong recovery tokens", () => {
    const token = createRecoveryToken();
    expect(token.length).toBeGreaterThanOrEqual(40);
    expect(secretHash(token)).toMatch(/^[0-9a-f]{64}$/);
    expect(secretHash(token)).not.toContain(token);
  });
});

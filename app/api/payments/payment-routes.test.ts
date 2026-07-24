import { describe, expect, it, vi } from "vitest";
import { GET as getAccountReadings } from "../account/readings/route";
import { POST as createPreview } from "../readings/route";
import { POST as recoverReading } from "../readings/recover/route";
import { GET as getHealth } from "../health/route";
import { POST as confirmPayment } from "./confirm/route";
import { POST as preparePayment } from "./prepare/route";

const input = {
  name: "홍길동",
  gender: "male",
  calendar: "solar",
  isLeapMonth: false,
  birthDate: "1990-05-20",
  birthTime: "14:30",
  birthPlace: "서울",
  concern: "앞으로의 직업 방향과 시기를 구체적으로 알고 싶습니다.",
  topic: "career",
};

describe("reading and payment boundary", () => {
  it("returns only a free preview before payment", async () => {
    const response = await createPreview(
      new Request("http://localhost/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.chart.pillars).toHaveLength(4);
    expect(payload.preview.nature.evidence.length).toBeGreaterThan(0);
    expect(payload).not.toHaveProperty("report");
    expect(payload.preview).not.toHaveProperty("sections");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("x-request-id")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f-]{27}$/i,
    );
    expect(response.headers.get("ratelimit-limit")).toBe("12");
  });

  it("creates a server-priced checkout order", async () => {
    const response = await preparePayment(
      new Request("http://localhost/api/payments/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.amount).toBe(14900);
    expect(payload.orderId).toMatch(/^MYEONGUN-/);
    expect(payload.mode).toBe("test");
    expect(payload.readingFingerprint).toMatch(/^[0-9a-f]{64}$/);
  });

  it("rejects client-side amount tampering before generating a report", async () => {
    const response = await confirmPayment(
      new Request("http://localhost/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          orderId: "MYEONGUN-6ba7b810-9dad-41d1-80b4-00c04fd430c8",
          amount: 100,
          test: true,
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("금액");
    expect(payload).not.toHaveProperty("report");
  });

  it("treats malformed JSON as a client error without leaking internals", async () => {
    const response = await createPreview(
      new Request("http://localhost/api/readings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": "malformed-json-test",
        },
        body: "{broken",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("JSON");
    expect(payload.error).not.toContain("SyntaxError");
  });

  it("publishes a secret-free operational readiness response", async () => {
    const response = await getHealth();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.services.calculation).toBe("ready");
    expect(payload.services.persistence).toBe("browser_only");
    expect(JSON.stringify(payload)).not.toMatch(/secret|api[_-]?key/i);
  });

  it("fails closed when account persistence is not configured", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.stubEnv("READING_ENCRYPTION_KEY", "");
    try {
      const recovery = await recoverReading(
        new Request("http://localhost/api/readings/recover", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "test-recovery-no-store",
          },
          body: JSON.stringify({
            orderId: "MYEONGUN-6ba7b810-9dad-41d1-80b4-00c04fd430c8",
            recoveryToken: "x".repeat(43),
          }),
        }),
      );
      const account = await getAccountReadings(
        new Request("http://localhost/api/account/readings", {
          headers: { "x-forwarded-for": "test-account-no-store" },
        }),
      );
      expect(recovery.status).toBe(503);
      expect(account.status).toBe(503);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

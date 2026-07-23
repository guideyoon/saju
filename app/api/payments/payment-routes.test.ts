import { describe, expect, it } from "vitest";
import { POST as createPreview } from "../readings/route";
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
});

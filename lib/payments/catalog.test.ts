import { afterEach, describe, expect, it, vi } from "vitest";
import {
  canUseTestCheckout,
  isValidOrderId,
  REPORT_PRODUCT,
} from "./catalog";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("payment catalog", () => {
  it("keeps the server-authoritative product amount", () => {
    expect(REPORT_PRODUCT.amount).toBe(14900);
    expect(REPORT_PRODUCT.currency).toBe("KRW");
  });

  it("accepts only service-generated UUID order IDs", () => {
    expect(
      isValidOrderId("MYEONGUN-6ba7b810-9dad-41d1-80b4-00c04fd430c8"),
    ).toBe(true);
    expect(isValidOrderId("MYEONGUN-cheap-order")).toBe(false);
    expect(isValidOrderId("../MYEONGUN-6ba7b810-9dad-41d1-80b4-00c04fd430c8")).toBe(
      false,
    );
  });

  it("disables test checkout in production unless explicitly enabled", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PAYMENT_TEST_MODE", "");
    expect(canUseTestCheckout()).toBe(false);
    vi.stubEnv("PAYMENT_TEST_MODE", "true");
    expect(canUseTestCheckout()).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { SlidingWindowRateLimiter } from "./rate-limit";

describe("SlidingWindowRateLimiter", () => {
  it("blocks requests over the limit and exposes remaining capacity", () => {
    const limiter = new SlidingWindowRateLimiter(2, 1000);
    expect(limiter.check("client", 1000)).toMatchObject({
      allowed: true,
      state: { remaining: 1 },
    });
    expect(limiter.check("client", 1100)).toMatchObject({
      allowed: true,
      state: { remaining: 0 },
    });
    expect(limiter.check("client", 1200)).toMatchObject({
      allowed: false,
      state: { remaining: 0 },
    });
  });

  it("allows requests again after the window expires", () => {
    const limiter = new SlidingWindowRateLimiter(1, 1000);
    expect(limiter.check("client", 1000).allowed).toBe(true);
    expect(limiter.check("client", 1500).allowed).toBe(false);
    expect(limiter.check("client", 2001).allowed).toBe(true);
  });
});

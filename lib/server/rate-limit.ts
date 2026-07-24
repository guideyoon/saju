import type { RateLimitState } from "./http";

type Entry = {
  timestamps: number[];
  touchedAt: number;
};

export class SlidingWindowRateLimiter {
  private readonly entries = new Map<string, Entry>();
  private checks = 0;

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  check(key: string, now = Date.now()) {
    this.checks += 1;
    if (this.checks % 100 === 0) this.prune(now);

    const cutoff = now - this.windowMs;
    const current = this.entries.get(key);
    const timestamps = (current?.timestamps || []).filter(
      (timestamp) => timestamp > cutoff,
    );
    const allowed = timestamps.length < this.limit;
    if (allowed) timestamps.push(now);
    this.entries.set(key, { timestamps, touchedAt: now });

    const oldest = timestamps[0] ?? now;
    const state: RateLimitState = {
      limit: this.limit,
      remaining: Math.max(0, this.limit - timestamps.length),
      resetAt: oldest + this.windowMs,
    };
    return { allowed, state };
  }

  private prune(now: number) {
    const staleBefore = now - this.windowMs * 2;
    for (const [key, entry] of this.entries) {
      if (entry.touchedAt < staleBefore) this.entries.delete(key);
    }
  }
}

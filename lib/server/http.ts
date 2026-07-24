import { NextResponse } from "next/server";

export type RateLimitState = {
  limit: number;
  remaining: number;
  resetAt: number;
};

export function clientAddress(request: Request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  );
}

export function noStoreJson(
  payload: unknown,
  options: {
    status?: number;
    requestId?: string;
    rateLimit?: RateLimitState;
  } = {},
) {
  const headers: Record<string, string> = {
    "Cache-Control": "no-store, private",
    "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
  };
  if (options.requestId) headers["X-Request-Id"] = options.requestId;
  if (options.rateLimit) {
    headers["RateLimit-Limit"] = String(options.rateLimit.limit);
    headers["RateLimit-Remaining"] = String(options.rateLimit.remaining);
    headers["RateLimit-Reset"] = String(
      Math.max(0, Math.ceil((options.rateLimit.resetAt - Date.now()) / 1000)),
    );
  }

  return NextResponse.json(payload, {
    status: options.status ?? 200,
    headers,
  });
}

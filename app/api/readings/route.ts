import { clientAddress, noStoreJson } from "../../../lib/server/http";
import { SlidingWindowRateLimiter } from "../../../lib/server/rate-limit";
import { generatePreview } from "../../../lib/saju/generate";
import { birthInputSchema } from "../../../lib/saju/schema";

export const dynamic = "force-dynamic";

const limiter = new SlidingWindowRateLimiter(12, 60_000);

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const rateLimit = limiter.check(clientAddress(request));
  if (!rateLimit.allowed) {
    return noStoreJson(
      { error: "요청이 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429, requestId, rateLimit: rateLimit.state },
    );
  }

  try {
    const json = await request.json();
    const parsed = birthInputSchema.safeParse(json);
    if (!parsed.success) {
      return noStoreJson(
        {
          error: parsed.error.issues[0]?.message || "입력값을 확인해 주세요.",
        },
        { status: 400, requestId, rateLimit: rateLimit.state },
      );
    }

    return noStoreJson(
      generatePreview(parsed.data),
      { requestId, rateLimit: rateLimit.state },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return noStoreJson(
        { error: "올바른 JSON 형식으로 요청해 주세요." },
        { status: 400, requestId, rateLimit: rateLimit.state },
      );
    }
    console.error(`[${requestId}] Reading generation failed.`, error);
    return noStoreJson(
      { error: "결과 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500, requestId, rateLimit: rateLimit.state },
    );
  }
}

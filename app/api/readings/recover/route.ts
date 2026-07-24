import { z } from "zod";
import { isValidOrderId } from "../../../../lib/payments/catalog";
import { clientAddress, noStoreJson } from "../../../../lib/server/http";
import { SlidingWindowRateLimiter } from "../../../../lib/server/rate-limit";
import {
  findReadingByRecovery,
  hasPersistenceConfiguration,
} from "../../../../lib/storage/supabase";

export const dynamic = "force-dynamic";

const schema = z.object({
  orderId: z.string().min(6).max(64),
  recoveryToken: z.string().min(40).max(100),
});

const limiter = new SlidingWindowRateLimiter(5, 60_000);

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const rateLimit = limiter.check(clientAddress(request));
  if (!rateLimit.allowed) {
    return noStoreJson(
      { error: "복구 요청이 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429, requestId, rateLimit: rateLimit.state },
    );
  }

  try {
    if (!hasPersistenceConfiguration()) {
      return noStoreJson(
        { error: "서버 결과 보관 기능이 아직 설정되지 않았습니다." },
        { status: 503, requestId, rateLimit: rateLimit.state },
      );
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success || !isValidOrderId(parsed.data.orderId)) {
      return noStoreJson(
        { error: "주문번호와 복구 코드를 확인해 주세요." },
        { status: 400, requestId, rateLimit: rateLimit.state },
      );
    }

    const stored = await findReadingByRecovery(parsed.data);
    if (!stored) {
      return noStoreJson(
        { error: "일치하는 구매 결과를 찾지 못했습니다." },
        { status: 404, requestId, rateLimit: rateLimit.state },
      );
    }
    return noStoreJson(stored, {
      requestId,
      rateLimit: rateLimit.state,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return noStoreJson(
        { error: "올바른 JSON 형식으로 요청해 주세요." },
        { status: 400, requestId, rateLimit: rateLimit.state },
      );
    }
    console.error(`[${requestId}] Reading recovery failed.`, error);
    return noStoreJson(
      { error: "결과 복구 중 오류가 발생했습니다. 요청 ID를 고객지원에 알려주세요." },
      { status: 500, requestId, rateLimit: rateLimit.state },
    );
  }
}

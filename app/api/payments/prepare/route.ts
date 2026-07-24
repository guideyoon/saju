import {
  canUseTestCheckout,
  hasTossConfiguration,
  REPORT_PRODUCT,
} from "../../../../lib/payments/catalog";
import { readingFingerprint } from "../../../../lib/payments/fingerprint";
import { clientAddress, noStoreJson } from "../../../../lib/server/http";
import { SlidingWindowRateLimiter } from "../../../../lib/server/rate-limit";
import { birthInputSchema } from "../../../../lib/saju/schema";
import { hasPersistenceConfiguration } from "../../../../lib/storage/supabase";

export const dynamic = "force-dynamic";

const limiter = new SlidingWindowRateLimiter(8, 60_000);

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const rateLimit = limiter.check(clientAddress(request));
  if (!rateLimit.allowed) {
    return noStoreJson(
      { error: "결제 준비 요청이 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429, requestId, rateLimit: rateLimit.state },
    );
  }

  try {
    const parsed = birthInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return noStoreJson(
        { error: parsed.error.issues[0]?.message || "입력 정보를 확인해 주세요." },
        { status: 400, requestId, rateLimit: rateLimit.state },
      );
    }

    const tossReady = hasTossConfiguration();
    if (tossReady && !hasPersistenceConfiguration()) {
      return noStoreJson(
        {
          error:
            "안전한 결과 보관 설정이 완료되지 않아 결제를 일시 중단했습니다.",
        },
        { status: 503, requestId, rateLimit: rateLimit.state },
      );
    }
    if (!tossReady && !canUseTestCheckout()) {
      return noStoreJson(
        { error: "결제 시스템 점검 중입니다. 잠시 후 다시 이용해 주세요." },
        { status: 503, requestId, rateLimit: rateLimit.state },
      );
    }

    return noStoreJson(
      {
        mode: tossReady ? "toss" : "test",
        clientKey: tossReady ? process.env.TOSS_CLIENT_KEY : undefined,
        orderId: `MYEONGUN-${crypto.randomUUID()}`,
        orderName: REPORT_PRODUCT.name,
        amount: REPORT_PRODUCT.amount,
        currency: REPORT_PRODUCT.currency,
        readingFingerprint: readingFingerprint(parsed.data),
      },
      { requestId, rateLimit: rateLimit.state },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return noStoreJson(
        { error: "올바른 JSON 형식으로 요청해 주세요." },
        { status: 400, requestId, rateLimit: rateLimit.state },
      );
    }
    console.error(`[${requestId}] Payment preparation failed.`, error);
    return noStoreJson(
      { error: "결제 준비 중 오류가 발생했습니다." },
      { status: 500, requestId, rateLimit: rateLimit.state },
    );
  }
}

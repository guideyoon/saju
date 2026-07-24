import { z } from "zod";
import { verifySupabaseAccessToken } from "../../../../lib/auth/server";
import { isValidOrderId } from "../../../../lib/payments/catalog";
import { clientAddress, noStoreJson } from "../../../../lib/server/http";
import { SlidingWindowRateLimiter } from "../../../../lib/server/rate-limit";
import {
  findReadingForUser,
  hasPersistenceConfiguration,
  listUserReadings,
} from "../../../../lib/storage/supabase";

export const dynamic = "force-dynamic";

const limiter = new SlidingWindowRateLimiter(20, 60_000);
const openSchema = z.object({ orderId: z.string().min(6).max(64) });

function bearerToken(request: Request) {
  const authorization = request.headers.get("authorization") || "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7) : undefined;
}

async function authenticate(request: Request) {
  return verifySupabaseAccessToken(bearerToken(request));
}

export async function GET(request: Request) {
  const requestId = crypto.randomUUID();
  const rateLimit = limiter.check(clientAddress(request));
  if (!rateLimit.allowed) {
    return noStoreJson(
      { error: "요청이 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429, requestId, rateLimit: rateLimit.state },
    );
  }
  if (!hasPersistenceConfiguration()) {
    return noStoreJson(
      { error: "계정 보관 기능이 아직 설정되지 않았습니다." },
      { status: 503, requestId, rateLimit: rateLimit.state },
    );
  }
  const userId = await authenticate(request);
  if (!userId) {
    return noStoreJson(
      { error: "로그인이 필요합니다." },
      { status: 401, requestId, rateLimit: rateLimit.state },
    );
  }

  try {
    return noStoreJson(
      { readings: await listUserReadings(userId) },
      { requestId, rateLimit: rateLimit.state },
    );
  } catch (error) {
    console.error(`[${requestId}] Account reading list failed.`, error);
    return noStoreJson(
      { error: "보관된 결과를 불러오지 못했습니다." },
      { status: 500, requestId, rateLimit: rateLimit.state },
    );
  }
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const rateLimit = limiter.check(clientAddress(request));
  if (!rateLimit.allowed) {
    return noStoreJson(
      { error: "요청이 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429, requestId, rateLimit: rateLimit.state },
    );
  }
  if (!hasPersistenceConfiguration()) {
    return noStoreJson(
      { error: "계정 보관 기능이 아직 설정되지 않았습니다." },
      { status: 503, requestId, rateLimit: rateLimit.state },
    );
  }
  const userId = await authenticate(request);
  if (!userId) {
    return noStoreJson(
      { error: "로그인이 필요합니다." },
      { status: 401, requestId, rateLimit: rateLimit.state },
    );
  }

  try {
    const parsed = openSchema.safeParse(await request.json());
    if (!parsed.success || !isValidOrderId(parsed.data.orderId)) {
      return noStoreJson(
        { error: "주문번호를 확인해 주세요." },
        { status: 400, requestId, rateLimit: rateLimit.state },
      );
    }
    const stored = await findReadingForUser({
      userId,
      orderId: parsed.data.orderId,
    });
    if (!stored) {
      return noStoreJson(
        { error: "계정에 연결된 결과를 찾지 못했습니다." },
        { status: 404, requestId, rateLimit: rateLimit.state },
      );
    }
    return noStoreJson(stored, {
      requestId,
      rateLimit: rateLimit.state,
    });
  } catch (error) {
    console.error(`[${requestId}] Account reading open failed.`, error);
    return noStoreJson(
      { error: "보관된 결과를 열지 못했습니다." },
      { status: 500, requestId, rateLimit: rateLimit.state },
    );
  }
}

import { z } from "zod";
import {
  canUseTestCheckout,
  hasTossConfiguration,
  isValidOrderId,
  REPORT_PRODUCT,
} from "../../../../lib/payments/catalog";
import { readingFingerprint } from "../../../../lib/payments/fingerprint";
import { clientAddress, noStoreJson } from "../../../../lib/server/http";
import { SlidingWindowRateLimiter } from "../../../../lib/server/rate-limit";
import { generateFullReading } from "../../../../lib/saju/generate";
import { birthInputSchema } from "../../../../lib/saju/schema";
import type { ReadingResponse } from "../../../../lib/saju/types";
import {
  findReadingByPayment,
  hasPersistenceConfiguration,
  storePaidReading,
} from "../../../../lib/storage/supabase";
import { verifySupabaseAccessToken } from "../../../../lib/auth/server";

export const dynamic = "force-dynamic";

const confirmSchema = z.object({
  input: birthInputSchema,
  orderId: z.string().min(6).max(64),
  amount: z.number().int().positive(),
  paymentKey: z.string().min(1).max(200).optional(),
  authToken: z.string().min(20).max(4096).optional(),
  test: z.boolean().optional().default(false),
});

const limiter = new SlidingWindowRateLimiter(8, 60_000);

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const rateLimit = limiter.check(clientAddress(request));
  if (!rateLimit.allowed) {
    return noStoreJson(
      { error: "결제 확인 요청이 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429, requestId, rateLimit: rateLimit.state },
    );
  }

  try {
    const parsed = confirmSchema.safeParse(await request.json());
    if (!parsed.success) {
      return noStoreJson(
        { error: parsed.error.issues[0]?.message || "결제 정보를 확인해 주세요." },
        { status: 400, requestId, rateLimit: rateLimit.state },
      );
    }

    const { input, orderId, amount, paymentKey, test, authToken } = parsed.data;
    const fingerprint = readingFingerprint(input);
    const userId = await verifySupabaseAccessToken(authToken);
    if (!isValidOrderId(orderId) || amount !== REPORT_PRODUCT.amount) {
      return noStoreJson(
        { error: "주문번호 또는 결제 금액이 일치하지 않습니다." },
        { status: 400, requestId, rateLimit: rateLimit.state },
      );
    }

    let payment = {
      orderId,
      amount,
      method: "테스트 결제",
      approvedAt: new Date().toISOString(),
      mode: "test" as "test" | "toss",
    };

    if (test) {
      if (!canUseTestCheckout()) {
        return noStoreJson(
          { error: "운영 환경에서는 테스트 결제를 사용할 수 없습니다." },
          { status: 403, requestId, rateLimit: rateLimit.state },
        );
      }
    } else {
      if (!hasTossConfiguration() || !paymentKey) {
        return noStoreJson(
          { error: "결제 승인 정보가 부족합니다." },
          { status: 400, requestId, rateLimit: rateLimit.state },
        );
      }

      if (!hasPersistenceConfiguration()) {
        return noStoreJson(
          { error: "안전한 결과 보관 설정이 완료되지 않았습니다." },
          { status: 503, requestId, rateLimit: rateLimit.state },
        );
      }

      try {
        const existing = await findReadingByPayment({
          orderId,
          paymentKey,
          fingerprint,
          userId,
        });
        if (existing) {
          return noStoreJson(
            {
              ...existing.reading,
              payment: {
                ...existing.reading.payment,
                recoveryToken: existing.recoveryToken,
              },
            },
            { requestId, rateLimit: rateLimit.state },
          );
        }
      } catch (error) {
        console.error(`[${requestId}] Existing payment lookup failed.`, error);
      }

      const secretKey = process.env.TOSS_SECRET_KEY as string;
      const authorization = Buffer.from(`${secretKey}:`).toString("base64");
      let tossResponse = await fetch(
        "https://api.tosspayments.com/v1/payments/confirm",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${authorization}`,
            "Content-Type": "application/json",
            "Idempotency-Key": orderId.slice("MYEONGUN-".length),
          },
          body: JSON.stringify({ paymentKey, orderId, amount }),
          signal: AbortSignal.timeout(15_000),
        },
      );
      let tossPayload = (await tossResponse.json()) as {
        orderId?: string;
        totalAmount?: number;
        status?: string;
        method?: string;
        approvedAt?: string;
        message?: string;
        metadata?: Record<string, string>;
      };

      const recoveredApproval = !tossResponse.ok;
      if (recoveredApproval && paymentKey) {
        tossResponse = await fetch(
          `https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}`,
          {
            headers: {
              Authorization: `Basic ${authorization}`,
              "Content-Type": "application/json",
            },
            signal: AbortSignal.timeout(15_000),
          },
        );
        tossPayload = (await tossResponse.json()) as typeof tossPayload;
      }

      if (
        !tossResponse.ok ||
        tossPayload.orderId !== orderId ||
        tossPayload.totalAmount !== amount ||
        tossPayload.status !== "DONE" ||
        tossPayload.metadata?.readingFingerprint !== fingerprint
      ) {
        return noStoreJson(
          {
            error:
              tossPayload.message ||
              "결제가 승인되지 않았습니다. 결제 내역을 확인해 주세요.",
          },
          {
            status: tossResponse.ok ? 409 : tossResponse.status,
            requestId,
            rateLimit: rateLimit.state,
          },
        );
      }

      payment = {
        orderId,
        amount,
        method: tossPayload.method || "토스페이먼츠",
        approvedAt: tossPayload.approvedAt || new Date().toISOString(),
        mode: "toss",
      };

      const reading = await generateFullReading(input, {
        enhanceWithAI: !recoveredApproval,
      });
      const paidReading: ReadingResponse = { ...reading, payment };
      try {
        const recoveryToken = await storePaidReading({
          input,
          reading: paidReading,
          paymentKey,
          fingerprint,
          userId,
        });
        paidReading.payment = { ...payment, recoveryToken };
      } catch (error) {
        console.error(`[${requestId}] Paid reading persistence failed.`, error);
      }
      return noStoreJson(
        paidReading,
        { requestId, rateLimit: rateLimit.state },
      );
    }

    const reading = await generateFullReading(input, { enhanceWithAI: false });
    return noStoreJson(
      { ...reading, payment },
      { requestId, rateLimit: rateLimit.state },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return noStoreJson(
        { error: "올바른 JSON 형식으로 요청해 주세요." },
        { status: 400, requestId, rateLimit: rateLimit.state },
      );
    }
    console.error(`[${requestId}] Payment confirmation failed.`, error);
    return noStoreJson(
      { error: "결제 확인 중 오류가 발생했습니다. 요청 ID를 고객지원에 알려주세요." },
      { status: 500, requestId, rateLimit: rateLimit.state },
    );
  }
}

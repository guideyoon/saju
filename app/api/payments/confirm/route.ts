import { NextResponse } from "next/server";
import { z } from "zod";
import {
  canUseTestCheckout,
  hasTossConfiguration,
  isValidOrderId,
  REPORT_PRODUCT,
} from "../../../../lib/payments/catalog";
import { readingFingerprint } from "../../../../lib/payments/fingerprint";
import { generateFullReading } from "../../../../lib/saju/generate";
import { birthInputSchema } from "../../../../lib/saju/schema";

export const dynamic = "force-dynamic";

const confirmSchema = z.object({
  input: birthInputSchema,
  orderId: z.string().min(6).max(64),
  amount: z.number().int().positive(),
  paymentKey: z.string().min(1).max(200).optional(),
  test: z.boolean().optional().default(false),
});

const attempts = new Map<string, number[]>();

function isRateLimited(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") || "local";
  const key = forwarded.split(",")[0].trim();
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter(
    (timestamp) => now - timestamp < 60_000,
  );
  recent.push(now);
  attempts.set(key, recent);
  return recent.length > 8;
}

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return NextResponse.json(
      { error: "결제 확인 요청이 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429 },
    );
  }

  try {
    const parsed = confirmSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "결제 정보를 확인해 주세요." },
        { status: 400 },
      );
    }

    const { input, orderId, amount, paymentKey, test } = parsed.data;
    if (!isValidOrderId(orderId) || amount !== REPORT_PRODUCT.amount) {
      return NextResponse.json(
        { error: "주문번호 또는 결제 금액이 일치하지 않습니다." },
        { status: 400 },
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
        return NextResponse.json(
          { error: "운영 환경에서는 테스트 결제를 사용할 수 없습니다." },
          { status: 403 },
        );
      }
    } else {
      if (!hasTossConfiguration() || !paymentKey) {
        return NextResponse.json(
          { error: "결제 승인 정보가 부족합니다." },
          { status: 400 },
        );
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
          },
        );
        tossPayload = (await tossResponse.json()) as typeof tossPayload;
      }

      if (
        !tossResponse.ok ||
        tossPayload.orderId !== orderId ||
        tossPayload.totalAmount !== amount ||
        tossPayload.status !== "DONE" ||
        tossPayload.metadata?.readingFingerprint !== readingFingerprint(input)
      ) {
        return NextResponse.json(
          {
            error:
              tossPayload.message ||
              "결제가 승인되지 않았습니다. 결제 내역을 확인해 주세요.",
          },
          { status: tossResponse.ok ? 409 : tossResponse.status },
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
      return NextResponse.json(
        { ...reading, payment },
        {
          headers: {
            "Cache-Control": "no-store, private",
            "X-Content-Type-Options": "nosniff",
          },
        },
      );
    }

    const reading = await generateFullReading(input, { enhanceWithAI: false });
    return NextResponse.json(
      { ...reading, payment },
      {
        headers: {
          "Cache-Control": "no-store, private",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    console.error("Payment confirmation failed.", error);
    return NextResponse.json(
      { error: "결제 확인 중 오류가 발생했습니다. 결제 내역을 확인해 주세요." },
      { status: 500 },
    );
  }
}

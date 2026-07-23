import { NextResponse } from "next/server";
import {
  canUseTestCheckout,
  hasTossConfiguration,
  REPORT_PRODUCT,
} from "../../../../lib/payments/catalog";
import { readingFingerprint } from "../../../../lib/payments/fingerprint";
import { birthInputSchema } from "../../../../lib/saju/schema";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsed = birthInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "입력 정보를 확인해 주세요." },
      { status: 400 },
    );
  }

  const tossReady = hasTossConfiguration();
  if (!tossReady && !canUseTestCheckout()) {
    return NextResponse.json(
      { error: "결제 시스템 점검 중입니다. 잠시 후 다시 이용해 주세요." },
      { status: 503 },
    );
  }

  return NextResponse.json(
    {
      mode: tossReady ? "toss" : "test",
      clientKey: tossReady ? process.env.TOSS_CLIENT_KEY : undefined,
      orderId: `MYEONGUN-${crypto.randomUUID()}`,
      orderName: REPORT_PRODUCT.name,
      amount: REPORT_PRODUCT.amount,
      currency: REPORT_PRODUCT.currency,
      readingFingerprint: readingFingerprint(parsed.data),
    },
    {
      headers: {
        "Cache-Control": "no-store, private",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

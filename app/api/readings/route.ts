import { NextResponse } from "next/server";
import { generatePreview } from "../../../lib/saju/generate";
import { birthInputSchema } from "../../../lib/saju/schema";

export const dynamic = "force-dynamic";

const requestLog = new Map<string, number[]>();

function isRateLimited(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") || "local";
  const key = forwarded.split(",")[0].trim();
  const now = Date.now();
  const recent = (requestLog.get(key) || []).filter(
    (timestamp) => now - timestamp < 60_000,
  );
  recent.push(now);
  requestLog.set(key, recent);
  return recent.length > 12;
}

export async function POST(request: Request) {
  if (isRateLimited(request)) {
    return NextResponse.json(
      { error: "요청이 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429 },
    );
  }

  try {
    const json = await request.json();
    const parsed = birthInputSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message || "입력값을 확인해 주세요.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      generatePreview(parsed.data),
      {
        headers: {
          "Cache-Control": "no-store, private",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "결과 생성 중 오류가 발생했습니다.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

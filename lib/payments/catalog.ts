export const REPORT_PRODUCT = {
  id: "focus",
  name: "상세 사주 리포트",
  amount: 14900,
  currency: "KRW" as const,
  features: [
    "사주 원국·오행·십성 분석",
    "현재 대운·세운과 6개월 월운",
    "근거가 표시된 6개 상세 해석",
    "PDF 및 이 기기 저장",
  ],
} as const;

export function isValidOrderId(value: string) {
  return /^MYEONGUN-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function canUseTestCheckout() {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.PAYMENT_TEST_MODE === "true"
  );
}

export function hasTossConfiguration() {
  return Boolean(
    process.env.TOSS_CLIENT_KEY?.trim() && process.env.TOSS_SECRET_KEY?.trim(),
  );
}

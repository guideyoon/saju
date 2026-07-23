"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const FRIENDLY_MESSAGES: Record<string, string> = {
  PAY_PROCESS_CANCELED: "결제가 취소됐습니다. 원하실 때 다시 시도할 수 있습니다.",
  PAY_PROCESS_ABORTED: "결제 처리가 중단됐습니다. 결제수단을 확인해 주세요.",
  REJECT_CARD_COMPANY: "카드사에서 결제를 승인하지 않았습니다. 다른 결제수단을 이용해 주세요.",
};

export default function PaymentFailPage() {
  const [message, setMessage] = useState("결제가 완료되지 않았습니다.");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code") || "";
    const providerMessage = params.get("message");
    setMessage(
      FRIENDLY_MESSAGES[code] ||
        providerMessage ||
        "결제가 완료되지 않았습니다. 잠시 후 다시 시도해 주세요.",
    );
  }, []);

  return (
    <main className="content-shell">
      <section className="legal-page payment-status-page">
        <p className="kicker">결제 미완료</p>
        <h1>결제가 진행되지 않았습니다</h1>
        <p>{message}</p>
        <p>승인되지 않은 결제에는 상세 리포트가 생성되지 않습니다.</p>
        <div className="result-actions">
          <Link href="/">무료 결과로 돌아가기</Link>
        </div>
      </section>
    </main>
  );
}

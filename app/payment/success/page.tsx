"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BirthInput, ReadingResponse } from "../../../lib/saju/types";

type PendingPayment = {
  input: BirthInput;
  orderId: string;
  amount: number;
};

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState("결제 승인 정보를 확인하고 있습니다.");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function confirm() {
      try {
        const params = new URLSearchParams(window.location.search);
        const paymentKey = params.get("paymentKey");
        const orderId = params.get("orderId");
        const amount = Number(params.get("amount"));
        const rawPending = sessionStorage.getItem("myeongun-pending-payment");
        if (!paymentKey || !orderId || !amount || !rawPending) {
          throw new Error("결제 정보를 찾지 못했습니다. 결제 내역을 확인해 주세요.");
        }

        const pending = JSON.parse(rawPending) as PendingPayment;
        if (pending.orderId !== orderId || pending.amount !== amount) {
          throw new Error("결제 요청 금액과 승인 금액이 일치하지 않습니다.");
        }

        const response = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: pending.input,
            paymentKey,
            orderId,
            amount,
          }),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "결제를 승인하지 못했습니다.");
        }
        if (cancelled) return;

        sessionStorage.setItem(
          "myeongun-unlocked-reading",
          JSON.stringify({
            input: pending.input,
            reading: payload as ReadingResponse,
          }),
        );
        setStatus("결제가 승인됐습니다. 상세 리포트로 이동합니다.");
        window.location.replace("/?paid=1");
      } catch (caught) {
        if (cancelled) return;
        setError(
          caught instanceof Error
            ? caught.message
            : "결제 확인 중 오류가 발생했습니다.",
        );
      }
    }

    void confirm();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="content-shell">
      <section className="legal-page payment-status-page">
        <p className="kicker">결제 승인</p>
        <h1>{error ? "결제를 확인하지 못했습니다" : "잠시만 기다려 주세요"}</h1>
        <p>{error || status}</p>
        {error && (
          <div className="result-actions">
            <Link href="/">처음 화면으로 돌아가기</Link>
          </div>
        )}
      </section>
    </main>
  );
}

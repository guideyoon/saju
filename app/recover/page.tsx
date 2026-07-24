"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import type { BirthInput, ReadingResponse } from "../../lib/saju/types";

export default function RecoverPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function recover(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/readings/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: String(data.get("orderId") || "").trim(),
          recoveryToken: String(data.get("recoveryToken") || "").trim(),
        }),
      });
      const payload = (await response.json()) as {
        error?: string;
        input?: BirthInput;
        reading?: ReadingResponse;
      };
      if (!response.ok || !payload.input || !payload.reading) {
        throw new Error(payload.error || "결과를 복구하지 못했습니다.");
      }

      sessionStorage.setItem(
        "myeongun-unlocked-reading",
        JSON.stringify({ input: payload.input, reading: payload.reading }),
      );
      window.location.replace("/?recovered=1");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "결과 복구 중 오류가 발생했습니다.",
      );
      setLoading(false);
    }
  }

  return (
    <main className="content-shell">
      <header className="content-header">
        <Link href="/" className="brand">
          <span className="brand-mark">命</span>
          <span>
            <strong>명운서재</strong>
            <small>RECOVER</small>
          </span>
        </Link>
        <Link href="/">← 서비스로 돌아가기</Link>
      </header>
      <section className="content-page recovery-page">
        <p className="kicker">구매 결과 복구</p>
        <h1>주문번호와 복구 코드로<br />상세 리포트를 다시 엽니다.</h1>
        <p className="content-lead">
          복구 코드는 결제 완료 화면에서 한 번 제공됩니다. 서버에는 코드 원문이 아닌
          단방향 해시만 저장됩니다.
        </p>
        <form className="profile-form recovery-form" onSubmit={recover}>
          {error && <div className="form-error">{error}</div>}
          <label>
            <span>주문번호</span>
            <input
              name="orderId"
              required
              autoComplete="off"
              placeholder="MYEONGUN-00000000-0000-4000-8000-000000000000"
            />
          </label>
          <label>
            <span>복구 코드</span>
            <input
              name="recoveryToken"
              required
              minLength={40}
              autoComplete="off"
              placeholder="결제 완료 시 받은 복구 코드"
            />
          </label>
          <button className="primary-button" disabled={loading}>
            {loading ? "복구 중입니다" : "구매 결과 복구하기"}
          </button>
        </form>
        <p className="demo-notice">
          현재 로컬 테스트 결제나 서버 저장 기능이 설정되기 전의 결과는 복구 대상이
          아닙니다.
        </p>
      </section>
    </main>
  );
}

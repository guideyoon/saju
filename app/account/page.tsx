"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getAccessToken,
  getSupabaseBrowserClient,
} from "../../lib/auth/client";
import type { BirthInput, ReadingResponse } from "../../lib/saju/types";
import type { AccountReadingSummary } from "../../lib/storage/supabase";

export default function AccountPage() {
  const [readings, setReadings] = useState<AccountReadingSummary[]>([]);
  const [status, setStatus] = useState("로그인 상태를 확인하고 있습니다.");
  const [busyOrder, setBusyOrder] = useState("");

  useEffect(() => {
    async function load() {
      const token = await getAccessToken();
      if (!token) {
        setStatus("카카오 로그인 후 구매한 상세 결과를 확인할 수 있습니다.");
        return;
      }
      const response = await fetch("/api/account/readings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok) {
        setStatus(payload.error || "보관 결과를 불러오지 못했습니다.");
        return;
      }
      setReadings(payload.readings || []);
      setStatus(payload.readings?.length ? "" : "계정에 연결된 구매 결과가 없습니다.");
    }
    void load();
  }, []);

  async function signIn() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setStatus("카카오 로그인 설정이 아직 완료되지 않았습니다.");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function openReading(orderId: string) {
    setBusyOrder(orderId);
    const token = await getAccessToken();
    if (!token) {
      setStatus("로그인이 만료됐습니다. 다시 로그인해 주세요.");
      setBusyOrder("");
      return;
    }
    const response = await fetch("/api/account/readings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId }),
    });
    const payload = (await response.json()) as {
      error?: string;
      input?: BirthInput;
      reading?: ReadingResponse;
    };
    if (!response.ok || !payload.input || !payload.reading) {
      setStatus(payload.error || "결과를 열지 못했습니다.");
      setBusyOrder("");
      return;
    }
    sessionStorage.setItem(
      "myeongun-unlocked-reading",
      JSON.stringify({ input: payload.input, reading: payload.reading }),
    );
    window.location.replace("/?account=1");
  }

  return (
    <main className="content-shell">
      <header className="content-header">
        <Link href="/" className="brand">
          <span className="brand-mark">命</span>
          <span>
            <strong>명운서재</strong>
            <small>MY LIBRARY</small>
          </span>
        </Link>
        <Link href="/">← 서비스로 돌아가기</Link>
      </header>
      <section className="content-page account-page">
        <p className="kicker">내 명운서재</p>
        <h1>계정에 보관된<br />상세 리포트</h1>
        {status && <p className="content-lead">{status}</p>}
        {!readings.length && (
          <button className="primary-button account-login" onClick={signIn}>
            카카오 로그인
          </button>
        )}
        <div className="account-reading-list">
          {readings.map((item) => (
            <article key={item.orderId}>
              <div>
                <small>{new Date(item.approvedAt).toLocaleDateString("ko-KR")}</small>
                <strong>{item.orderId}</strong>
                <span>
                  {item.method} · {item.amount.toLocaleString("ko-KR")}원
                </span>
              </div>
              <button
                onClick={() => openReading(item.orderId)}
                disabled={busyOrder === item.orderId}
              >
                {busyOrder === item.orderId ? "여는 중" : "결과 열기"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../../lib/auth/client";

export default function AuthCallbackPage() {
  const [error, setError] = useState("");

  useEffect(() => {
    async function exchange() {
      const code = new URLSearchParams(window.location.search).get("code");
      const supabase = getSupabaseBrowserClient();
      if (!code || !supabase) {
        setError("로그인 설정이나 인증 코드를 확인하지 못했습니다.");
        return;
      }
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        setError("카카오 로그인을 완료하지 못했습니다. 다시 시도해 주세요.");
        return;
      }
      window.location.replace("/");
    }
    void exchange();
  }, []);

  return (
    <main className="content-shell">
      <section
        className="legal-page payment-status-page"
        aria-live="polite"
        aria-busy={!error}
      >
        <p className="kicker">카카오 로그인</p>
        <h1>{error ? "로그인을 완료하지 못했습니다" : "로그인을 확인하고 있습니다"}</h1>
        <p role={error ? "alert" : "status"}>
          {error || "인증이 끝나면 서비스 화면으로 돌아갑니다."}
        </p>
        {error && <Link href="/">처음 화면으로 돌아가기</Link>}
      </section>
    </main>
  );
}

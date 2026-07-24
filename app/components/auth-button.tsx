"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import {
  getSupabaseBrowserClient,
  isClientAuthConfigured,
} from "../../lib/auth/client";

export default function AuthButton({ onAction }: { onAction?: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const configured = isClientAuthConfigured();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!configured) return null;

  async function toggleAuth() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || busy) return;
    onAction?.();
    setBusy(true);
    if (user) {
      await supabase.auth.signOut();
      setBusy(false);
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("Kakao sign-in failed.", error);
      setBusy(false);
    }
  }

  const nickname =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.preferred_username;

  return user ? (
    <span className="auth-actions">
      <Link href="/account" onClick={onAction}>
        {nickname || "내 서재"}
      </Link>
      <button className="auth-button" onClick={toggleAuth} disabled={busy}>
        {busy ? "처리 중" : "로그아웃"}
      </button>
    </span>
  ) : (
    <button className="auth-button" onClick={toggleAuth} disabled={busy}>
      {busy ? "처리 중" : "카카오 로그인"}
    </button>
  );
}

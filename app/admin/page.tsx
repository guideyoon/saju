"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReadingResponse } from "../../lib/saju/types";

type SavedReading = {
  id: string;
  createdAt: string;
  topic: string;
  name: string;
  product: string;
  score: number;
  keywords?: string[];
  reading?: ReadingResponse;
};

type Review = {
  id: number;
  name: string;
  product: string;
  rating: number;
  content: string;
  createdAt: string;
  verified: boolean;
};

function readLocal<T>(key: string): T[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export default function AdminPage() {
  const [readings, setReadings] = useState<SavedReading[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    setReadings(readLocal<SavedReading>("myeongun-readings"));
    setReviews(readLocal<Review>("myeongun-reviews"));
  }, []);

  const averageScore = useMemo(() => {
    if (!readings.length) return "—";
    return `${Math.round(readings.reduce((sum, item) => sum + item.score, 0) / readings.length)}점`;
  }, [readings]);

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/" className="brand">
          <span className="brand-mark">命</span>
          <span>
            <strong>명운서재</strong>
            <small>LOCAL ADMIN</small>
          </span>
        </Link>
        <nav>
          <button className="active">운영 현황</button>
          <button disabled>결제 내역 · 미연결</button>
          <button disabled>회원 관리 · 미연결</button>
        </nav>
        <Link href="/" className="admin-back">
          ← 사용자 화면
        </Link>
      </aside>

      <section className="admin-main">
        <header>
          <div>
            <p>현재 브라우저의 로컬 데이터</p>
            <h1>운영 점검판</h1>
          </div>
          <span className="admin-user">개발·검증용</span>
        </header>

        <div className="metric-grid">
          <article>
            <small>저장된 풀이</small>
            <strong>{readings.length}건</strong>
            <span>이 기기의 브라우저 기준</span>
          </article>
          <article>
            <small>등록된 후기</small>
            <strong>{reviews.length}건</strong>
            <span>서버에는 전송되지 않음</span>
          </article>
          <article>
            <small>평균 균형 지수</small>
            <strong>{averageScore}</strong>
            <span>길흉 점수가 아닌 참고 지수</span>
          </article>
          <article>
            <small>실결제 매출</small>
            <strong>미연결</strong>
            <span>현재 결제 단계는 테스트 전용</span>
          </article>
        </div>

        <article className="admin-panel">
          <div className="panel-heading">
            <div>
              <small>출시 전 필수 연동</small>
              <h2>운영 준비 상태</h2>
            </div>
          </div>
          <div className="calculation-notes">
            <p>✓ 만세력 계산 API · 규칙 기반 해석 · 선택적 AI 문장화</p>
            <p>✓ 입력 검증 · 호출 제한 · 계산 근거·한계 고지</p>
            <p>△ 회원 인증 · 영구 데이터베이스 · 관리자 권한 분리</p>
            <p>△ PG 실결제·환불 · 사업자 정보 · 개인정보 처리 위탁 고지</p>
          </div>
        </article>

        <article className="admin-panel table-panel">
          <div className="panel-heading">
            <div>
              <small>사용자가 직접 저장한 항목</small>
              <h2>최근 상담 결과</h2>
            </div>
            <span>{readings.length}건</span>
          </div>
          {readings.length ? (
            <div className="data-table">
              <div className="table-head">
                <span>사용자</span>
                <span>고민</span>
                <span>상품</span>
                <span>균형 지수</span>
                <span>저장일</span>
              </div>
              {readings.map((reading) => (
                <div className="table-row" key={reading.id}>
                  <strong>{reading.name}</strong>
                  <span>{reading.topic}</span>
                  <span>{reading.product}</span>
                  <span>{reading.score}점</span>
                  <span>{new Date(reading.createdAt).toLocaleDateString("ko-KR")}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">
              아직 저장된 풀이가 없습니다. 사용자 화면에서 풀이를 만든 뒤 ‘이 기기에
              저장’을 누르면 여기에 표시됩니다.
            </p>
          )}
        </article>

        <article className="admin-panel review-panel">
          <div className="panel-heading">
            <div>
              <small>현재 브라우저에 저장됨</small>
              <h2>후기 점검</h2>
            </div>
            <span>{reviews.length}건</span>
          </div>
          {reviews.length ? (
            reviews.map((review) => (
              <div className="admin-review" key={review.id}>
                <div>
                  <strong>{review.name}</strong>
                  <span>
                    {review.verified ? "결과 생성 확인" : "미확인"} · {review.product}
                  </span>
                </div>
                <p>
                  {"★".repeat(Math.max(0, Math.min(5, review.rating)))} {review.content}
                </p>
              </div>
            ))
          ) : (
            <p className="empty-state">등록된 후기가 없습니다.</p>
          )}
        </article>

        <p className="admin-disclaimer">
          이 화면은 현재 로그인이나 서버 권한 검사를 하지 않습니다. 사이트를 공개하기
          전 관리자 인증을 연결하고 일반 사용자에게 경로를 노출하지 않아야 합니다.
        </p>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Reading = {
  id: string;
  createdAt: string;
  topic: string;
  name: string;
  product: string;
  score: number;
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

export default function AdminPage() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    setReadings(JSON.parse(localStorage.getItem("myeongun-readings") || "[]"));
    setReviews(JSON.parse(localStorage.getItem("myeongun-reviews") || "[]"));
  }, []);

  const demoReadings = readings.length
    ? readings
    : [
        { id: "demo-1", createdAt: new Date().toISOString(), topic: "상대방 속마음", name: "하늘", product: "집중 사주 상담", score: 78 },
        { id: "demo-2", createdAt: new Date(Date.now() - 86400000).toISOString(), topic: "올해 재물·직장운", name: "윤슬", product: "종합 인생 리포트", score: 72 },
      ];

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/" className="brand">
          <span className="brand-mark">命</span>
          <span><strong>명운서재</strong><small>ADMIN</small></span>
        </Link>
        <nav>
          <button className="active">개요</button>
          <button>상담 결과</button>
          <button>결제 내역</button>
          <button>구매 후기</button>
          <button>쿠폰 관리</button>
        </nav>
        <Link href="/" className="admin-back">← 사용자 화면</Link>
      </aside>
      <section className="admin-main">
        <header>
          <div><p>2026년 7월 23일</p><h1>운영 현황</h1></div>
          <span className="admin-user">관리자 데모</span>
        </header>
        <div className="metric-grid">
          <article><small>무료 결과 완료율</small><strong>74.2%</strong><span>목표 70% ↑</span></article>
          <article><small>상품 클릭률</small><strong>23.8%</strong><span>목표 20% ↑</span></article>
          <article><small>결제 전환율</small><strong>2.4%</strong><span>목표 1–3%</span></article>
          <article><small>평균 결제 금액</small><strong>16,840원</strong><span>이번 달 데모</span></article>
        </div>
        <div className="admin-grid">
          <article className="admin-panel chart-panel">
            <div className="panel-heading"><div><small>최근 7일</small><h2>무료 → 결제 전환</h2></div><span>총 148건</span></div>
            <div className="bars">
              {[38, 54, 46, 68, 61, 82, 73].map((value, index) => (
                <div key={index}><span style={{ height: `${value}%` }} /><small>{["금", "토", "일", "월", "화", "수", "목"][index]}</small></div>
              ))}
            </div>
          </article>
          <article className="admin-panel">
            <div className="panel-heading"><div><small>상품별</small><h2>매출 구성</h2></div></div>
            <div className="sales-list">
              <div><span className="sales-dot focus" /><p>집중 사주 상담<small>52%</small></p><strong>₩1,117,500</strong></div>
              <div><span className="sales-dot life" /><p>종합 인생 리포트<small>31%</small></p><strong>₩667,000</strong></div>
              <div><span className="sales-dot question" /><p>한 가지 질문<small>17%</small></p><strong>₩365,400</strong></div>
            </div>
          </article>
        </div>
        <article className="admin-panel table-panel">
          <div className="panel-heading">
            <div><small>실시간 저장 데이터</small><h2>최근 상담 결과</h2></div>
            <span>{demoReadings.length}건</span>
          </div>
          <div className="data-table">
            <div className="table-head"><span>고객</span><span>고민</span><span>상품</span><span>흐름 지수</span><span>저장일</span></div>
            {demoReadings.map((reading) => (
              <div className="table-row" key={reading.id}>
                <strong>{reading.name}</strong>
                <span>{reading.topic}</span>
                <span>{reading.product}</span>
                <span>{reading.score}점</span>
                <span>{new Date(reading.createdAt).toLocaleDateString("ko-KR")}</span>
              </div>
            ))}
          </div>
        </article>
        <article className="admin-panel review-panel">
          <div className="panel-heading">
            <div><small>구매 인증</small><h2>후기 관리</h2></div>
            <span>{reviews.length}건 등록</span>
          </div>
          {reviews.length ? reviews.map((review) => (
            <div className="admin-review" key={review.id}>
              <div><strong>{review.name}</strong><span>구매 인증 · {review.product}</span></div>
              <p>{"★".repeat(review.rating)} {review.content}</p>
            </div>
          )) : <p className="empty-state">사용자 화면에서 후기를 등록하면 여기에 바로 표시됩니다.</p>}
        </article>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type {
  BirthInput,
  ReadingResponse,
  TopicId,
} from "../lib/saju/types";

type Topic = {
  id: TopicId;
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  teacher: string;
};

type Product = {
  id: "question" | "focus" | "life";
  name: string;
  price: number;
  description: string;
  features: string[];
  badge?: string;
};

type Step = "topics" | "profile" | "loading" | "preview" | "products" | "result";

const topics: Topic[] = [
  {
    id: "heart",
    eyebrow: "연애 · 속마음",
    title: "그 사람은 나를 어떻게 생각할까",
    description: "엇갈린 표현 속 관계의 흐름과 대응 방식을 읽어요.",
    icon: "心",
    teacher: "연화",
  },
  {
    id: "reunion",
    eyebrow: "재회 · 타이밍",
    title: "다시 만날 가능성이 있을까",
    description: "그리움보다 중요한 회복 조건과 시기를 살펴봐요.",
    icon: "緣",
    teacher: "연화",
  },
  {
    id: "career",
    eyebrow: "직장 · 이직",
    title: "지금 직장을 계속 다녀야 할까",
    description: "소진인지 전환의 신호인지 원국과 흐름으로 구분해요.",
    icon: "業",
    teacher: "현담",
  },
  {
    id: "money",
    eyebrow: "재물 · 기회",
    title: "올해 돈이 들어오는 시기는 언제일까",
    description: "나에게 맞는 수입 구조와 움직일 시기를 찾아요.",
    icon: "財",
    teacher: "현담",
  },
];

const products: Product[] = [
  {
    id: "question",
    name: "한 가지 질문",
    price: 4900,
    description: "지금 가장 답답한 한 가지에 집중합니다.",
    features: ["원국 기반 핵심 원인", "3개월 흐름", "행동 조언", "1년 보관"],
  },
  {
    id: "focus",
    name: "집중 사주 상담",
    price: 14900,
    description: "원국과 대운, 앞으로 6개월을 함께 읽습니다.",
    features: ["사주 원국·오행", "현재 대운·세운", "6개월 월별 흐름", "PDF 저장"],
    badge: "가장 많이 선택",
  },
  {
    id: "life",
    name: "종합 인생 리포트",
    price: 29900,
    description: "연애·재물·직업과 1년의 큰 흐름을 살핍니다.",
    features: ["전 분야 종합 분석", "대운·세운·월운", "추가 질문 1회", "영구 보관"],
  },
];

const initialProfile: Omit<BirthInput, "topic"> = {
  name: "",
  gender: "female",
  calendar: "solar",
  isLeapMonth: false,
  birthDate: "",
  birthTime: null,
  birthPlace: "서울",
  concern: "",
};

const loadingLines = [
  "양력·음력과 절기 기준을 맞추고 있습니다",
  "연주·월주·일주·시주를 계산하고 있습니다",
  "오행·십성·지장간과 대운을 분석하고 있습니다",
  "고민에 맞는 6개월 행동 방향을 정리하고 있습니다",
];

function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

export default function Home() {
  const [step, setStep] = useState<Step>("topics");
  const [topic, setTopic] = useState<Topic>(topics[0]);
  const [profile, setProfile] = useState(initialProfile);
  const [reading, setReading] = useState<ReadingResponse | null>(null);
  const [error, setError] = useState("");
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [product, setProduct] = useState(products[1]);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const discount = couponApplied ? Math.floor(product.price * 0.2) : 0;
  const finalPrice = product.price - discount;

  useEffect(() => {
    if (step !== "loading") return;
    setLoadingIndex(0);
    const timer = window.setInterval(() => {
      setLoadingIndex((current) =>
        Math.min(current + 1, loadingLines.length - 1),
      );
    }, 650);
    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  function go(next: Step) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function chooseTopic(nextTopic: Topic) {
    setTopic(nextTopic);
    setReading(null);
    setError("");
    go("profile");
  }

  async function submitProfile(event: FormEvent) {
    event.preventDefault();
    setError("");
    go("loading");
    try {
      const response = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, topic: topic.id }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "결과를 생성하지 못했습니다.");
      }
      setReading(payload as ReadingResponse);
      go("preview");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "결과 생성 중 오류가 발생했습니다.",
      );
      go("profile");
    }
  }

  function applyCoupon() {
    const isValid = coupon.trim().toUpperCase() === "FIRST20";
    setCouponApplied(isValid);
    if (!isValid) setError("쿠폰 코드를 확인해 주세요. 테스트 코드는 FIRST20입니다.");
    else setError("");
  }

  function completeTestCheckout() {
    go("loading");
    window.setTimeout(() => go("result"), 2600);
  }

  function saveResult() {
    if (!reading) return;
    const previous = JSON.parse(
      localStorage.getItem("myeongun-readings") || "[]",
    );
    const entry = {
      id: `reading-${Date.now()}`,
      createdAt: reading.generatedAt,
      topic: topic.title,
      name: profile.name,
      product: product.name,
      score: reading.report.score,
      keywords: reading.report.keywords,
      reading,
    };
    localStorage.setItem(
      "myeongun-readings",
      JSON.stringify([entry, ...previous].slice(0, 30)),
    );
    setSaved(true);
  }

  function restart() {
    setStep("topics");
    setProfile(initialProfile);
    setReading(null);
    setError("");
    setCoupon("");
    setCouponApplied(false);
    setSaved(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const progressMap: Record<Step, number> = {
    topics: 16,
    profile: 32,
    loading: 48,
    preview: 64,
    products: 82,
    result: 100,
  };

  return (
    <main>
      <header className="site-header">
        <button className="brand" onClick={restart} aria-label="명운서재 처음으로">
          <span className="brand-mark">命</span>
          <span>
            <strong>명운서재</strong>
            <small>MYEONGUN LIBRARY</small>
          </span>
        </button>
        <nav className={menuOpen ? "nav open" : "nav"}>
          <button onClick={() => go("topics")}>무료 사주</button>
          <button onClick={() => go("products")}>상담 상품</button>
          <Link href="/method">해석 방식</Link>
          <Link href="/admin">관리자</Link>
        </nav>
        <button
          className="menu-button"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="메뉴 열기"
        >
          {menuOpen ? "닫기" : "메뉴"}
        </button>
      </header>
      <div className="progress-wrap">
        <div className="progress" style={{ width: `${progressMap[step]}%` }} />
      </div>

      {step === "topics" && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <p className="kicker">절기 기준 만세력 · 첫 해석 무료</p>
              <h1>
                운명을 단정하지 않고,
                <br />
                <em>선택의 근거</em>를 읽습니다.
              </h1>
              <p className="hero-description">
                생년월일시로 사주 원국과 오행·십성·대운을 계산하고,
                지금의 고민에 연결해 앞으로 6개월의 행동 방향을 안내합니다.
              </p>
              <div className="trust-row">
                <span>로그인 없이 시작</span>
                <span>계산 근거 공개</span>
                <span>AI 활용 명시</span>
              </div>
            </div>
            <div className="hero-seal" aria-hidden="true">
              <span>四柱</span>
              <strong>命</strong>
              <small>원국에서 선택까지</small>
            </div>
          </section>

          <section className="topic-section">
            <div className="section-heading">
              <span>01 · 고민 선택</span>
              <h2>지금 가장 알고 싶은 것을 골라주세요.</h2>
              <p>같은 사주도 질문에 따라 살펴봐야 할 십성과 시기가 달라집니다.</p>
            </div>
            <div className="topic-grid">
              {topics.map((item, index) => (
                <button
                  className="topic-card"
                  key={item.id}
                  onClick={() => chooseTopic(item)}
                >
                  <span className="topic-index">0{index + 1}</span>
                  <span className="topic-icon">{item.icon}</span>
                  <small>{item.eyebrow}</small>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                  <span className="card-link">원국 계산 시작하기 →</span>
                </button>
              ))}
            </div>
          </section>

          <section className="method-section">
            <div>
              <p className="kicker light">명운서재 계산 원칙</p>
              <h2>계산은 정확하게,<br />해석은 조건부로.</h2>
            </div>
            <div className="principles">
              <article>
                <span>一</span>
                <div>
                  <strong>절기 기준 사주 원국</strong>
                  <p>입춘과 절입 시각을 반영해 연주·월주·일주·시주를 계산합니다.</p>
                </div>
              </article>
              <article>
                <span>二</span>
                <div>
                  <strong>근거가 보이는 해석</strong>
                  <p>오행 비율, 일간, 십성, 대운·세운을 결과와 함께 공개합니다.</p>
                </div>
              </article>
              <article>
                <span>三</span>
                <div>
                  <strong>예언이 아닌 행동 제안</strong>
                  <p>가능성과 조건을 설명하고 해야 할 일과 피할 일을 구분합니다.</p>
                </div>
              </article>
            </div>
          </section>
        </>
      )}

      {step === "profile" && (
        <section className="flow-section">
          <button className="back-button" onClick={() => go("topics")}>
            ← 질문 다시 고르기
          </button>
          <div className="flow-layout">
            <div className="flow-intro">
              <p className="kicker">02 · 출생 정보</p>
              <span className="teacher-chip">{topic.teacher} 선생 · {topic.eyebrow}</span>
              <h1>{topic.title}</h1>
              <p>
                사주 원국은 날짜뿐 아니라 양·음력과 출생 시각에 따라 달라집니다.
                모르는 정보는 모름으로 선택할 수 있습니다.
              </p>
              <div className="privacy-note">
                무료 계산 단계에서는 계정 생성 없이 처리하며 결과는 사용자가 저장할 때만 이 기기에 보관합니다.
              </div>
            </div>
            <form className="profile-form" onSubmit={submitProfile}>
              {error && <div className="form-error">{error}</div>}
              <label>
                <span>이름 또는 닉네임</span>
                <input
                  required
                  maxLength={30}
                  value={profile.name}
                  onChange={(event) =>
                    setProfile({ ...profile, name: event.target.value })
                  }
                  placeholder="결과에서 불러드릴 이름"
                />
              </label>

              <div className="form-row">
                <fieldset>
                  <legend>성별 <small>대운 방향 계산에 필요</small></legend>
                  <div className="segment">
                    {[
                      ["female", "여성"],
                      ["male", "남성"],
                      ["other", "기타"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={profile.gender === value ? "active" : ""}
                        onClick={() =>
                          setProfile({
                            ...profile,
                            gender: value as BirthInput["gender"],
                          })
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>달력 기준</legend>
                  <div className="segment">
                    {[
                      ["solar", "양력"],
                      ["lunar", "음력"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={profile.calendar === value ? "active" : ""}
                        onClick={() =>
                          setProfile({
                            ...profile,
                            calendar: value as BirthInput["calendar"],
                            isLeapMonth: false,
                          })
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>

              <label>
                <span>생년월일</span>
                <input
                  required
                  type="date"
                  min="1900-01-01"
                  max={new Date().toISOString().slice(0, 10)}
                  value={profile.birthDate}
                  onChange={(event) =>
                    setProfile({ ...profile, birthDate: event.target.value })
                  }
                />
              </label>

              {profile.calendar === "lunar" && (
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={profile.isLeapMonth}
                    onChange={(event) =>
                      setProfile({
                        ...profile,
                        isLeapMonth: event.target.checked,
                      })
                    }
                  />
                  입력한 음력 월은 윤달입니다
                </label>
              )}

              <label>
                <span>태어난 시간 <small>분 단위 권장</small></span>
                <input
                  type="time"
                  value={profile.birthTime || ""}
                  onChange={(event) =>
                    setProfile({
                      ...profile,
                      birthTime: event.target.value || null,
                    })
                  }
                />
                <small className="field-help">
                  모르면 비워두세요. 시주는 제외하고 계산하며 결과에 정확도 제한을 표시합니다.
                </small>
              </label>

              <label>
                <span>출생지</span>
                <select
                  value={profile.birthPlace}
                  onChange={(event) =>
                    setProfile({ ...profile, birthPlace: event.target.value })
                  }
                >
                  {["서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주", "해외"].map(
                    (place) => <option key={place}>{place}</option>,
                  )}
                </select>
              </label>

              <label>
                <span>현재 고민 <small>{profile.concern.length}/500</small></span>
                <textarea
                  required
                  minLength={10}
                  maxLength={500}
                  value={profile.concern}
                  onChange={(event) =>
                    setProfile({ ...profile, concern: event.target.value })
                  }
                  placeholder="현재 상황, 이미 해본 행동, 가장 알고 싶은 점을 구체적으로 적어주세요."
                />
              </label>
              <button className="primary-button" type="submit">
                무료 원국과 핵심 해석 보기
              </button>
            </form>
          </div>
        </section>
      )}

      {step === "loading" && (
        <section className="loading-section">
          <div className="orbit">
            <span>木</span><span>火</span><span>土</span><span>金</span><span>水</span>
            <strong>命</strong>
          </div>
          <p className="kicker">명리 데이터 분석 중</p>
          <h1>{profile.name || "고객"}님의 원국을<br />근거부터 살펴보고 있습니다.</h1>
          <div className="loading-list">
            {loadingLines.map((line, index) => (
              <div className={index <= loadingIndex ? "done" : ""} key={line}>
                <span>{index < loadingIndex ? "✓" : index === loadingIndex ? "·" : ""}</span>
                {line}
              </div>
            ))}
          </div>
        </section>
      )}

      {step === "preview" && reading && (
        <PreviewResult
          reading={reading}
          profile={profile}
          topic={topic}
          saved={saved}
          onSave={saveResult}
          onProducts={() => go("products")}
        />
      )}

      {step === "products" && (
        <section className="product-section">
          <button
            className="back-button"
            onClick={() => go(reading ? "preview" : "topics")}
          >
            ← 이전 화면
          </button>
          <div className="section-heading center">
            <span>상세 상담 선택</span>
            <h1>필요한 분석 범위를 선택하세요.</h1>
            <p>모든 상품은 같은 원국을 바탕으로 하며 분석 기간과 제공 범위가 다릅니다.</p>
          </div>
          <div className="product-grid">
            {products.map((item) => (
              <button
                className={`product-card ${product.id === item.id ? "selected" : ""}`}
                key={item.id}
                onClick={() => setProduct(item)}
              >
                {item.badge && <span className="popular-badge">{item.badge}</span>}
                <span className="radio-dot" />
                <h2>{item.name}</h2>
                <p>{item.description}</p>
                <strong className="price">{formatPrice(item.price)}</strong>
                <ul>{item.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
              </button>
            ))}
          </div>
          <div className="checkout-card">
            {error && <div className="form-error">{error}</div>}
            <div className="coupon-area">
              <label htmlFor="coupon">쿠폰 코드</label>
              <div>
                <input
                  id="coupon"
                  value={coupon}
                  onChange={(event) => setCoupon(event.target.value)}
                  placeholder="FIRST20"
                />
                <button onClick={applyCoupon}>적용</button>
              </div>
              {couponApplied && <small className="success">첫 상담 20% 쿠폰이 적용됐습니다.</small>}
            </div>
            <div className="price-summary">
              <span>선택 상품 <strong>{product.name}</strong></span>
              {discount > 0 && <span>쿠폰 할인 <strong>-{formatPrice(discount)}</strong></span>}
              <span className="total">결제 금액 <strong>{formatPrice(finalPrice)}</strong></span>
            </div>
            <button
              className="kakao-button"
              onClick={completeTestCheckout}
              disabled={!reading}
            >
              <span>TEST</span>
              {reading ? "테스트 결제로 상세 결과 열기" : "먼저 무료 원국을 계산해 주세요"}
            </button>
            <p className="demo-notice">
              현재는 결제 검증 단계입니다. 실제 과금은 발생하지 않으며 운영 전 PG 계약과 카카오 로그인을 연결해야 합니다.
            </p>
            <div className="ai-disclosure">
              사주 원국과 오행·대운 계산은 역법 엔진이 수행합니다. AI는 계산된 근거를 상담 문장으로 정리하는 역할만 하며,
              API 키가 없을 때는 검증된 규칙 기반 문장을 제공합니다.
            </div>
          </div>
        </section>
      )}

      {step === "result" && reading && (
        <PaidResult
          reading={reading}
          profile={profile}
          topic={topic}
          product={product}
          saved={saved}
          onSave={saveResult}
          onRestart={restart}
        />
      )}

      <footer>
        <div className="footer-brand">
          <span className="brand-mark">命</span>
          <div>
            <strong>명운서재</strong>
            <p>내 운명을 읽고, 다음 선택을 설계하다.</p>
          </div>
        </div>
        <div className="footer-links">
          <Link href="/method">사주 해석 방식</Link>
          <Link href="/terms">이용약관</Link>
          <Link href="/privacy">개인정보처리방침</Link>
          <Link href="/admin">관리자</Link>
        </div>
        <p className="copyright">© 2026 Myeongun Library. 결과는 참고용 해석입니다.</p>
      </footer>
    </main>
  );
}

function PreviewResult({
  reading,
  profile,
  topic,
  saved,
  onSave,
  onProducts,
}: {
  reading: ReadingResponse;
  profile: Omit<BirthInput, "topic">;
  topic: Topic;
  saved: boolean;
  onSave: () => void;
  onProducts: () => void;
}) {
  return (
    <section className="result-section preview-result">
      <div className="result-top">
        <div>
          <p className="kicker">무료 원국 · 핵심 해석</p>
          <h1>{profile.name}님의 지금 흐름</h1>
          <p>
            {topic.teacher} 선생 · {topic.eyebrow} ·{" "}
            {reading.interpretationSource === "openai-assisted" ? "AI 보조 해석" : "규칙 기반 해석"}
          </p>
        </div>
        <div className="score-ring">
          <strong>{reading.report.score}</strong>
          <span>{reading.report.scoreLabel}</span>
        </div>
      </div>

      <ChartSummary reading={reading} />

      <div className="keyword-row">
        {reading.report.keywords.map((keyword) => (
          <span key={keyword}>#{keyword}</span>
        ))}
      </div>
      <article className="reading-card lead-reading">
        <small>{reading.report.sections.nature.title}</small>
        <h2>{reading.report.summary}</h2>
        <p>{reading.report.preview}</p>
        <Evidence items={reading.report.sections.nature.evidence} />
      </article>

      <div className="locked-reading">
        <div className="locked-card">
          <span>03</span><strong>상대 또는 주변 상황</strong>
          <p>현재 대운과 세운이 주변 환경에 미치는 영향을 분석합니다.</p>
        </div>
        <div className="locked-card">
          <span>04</span><strong>앞으로 6개월</strong>
          <p>월별 간지와 일간의 관계를 비교해 기회·정비·주의 시기를 구분합니다.</p>
        </div>
        <div className="fade-lock">
          <span>✦</span>
          <strong>현재 대운과 6개월 행동 분석이<br />아직 남아 있습니다.</strong>
          <p>원국의 가능성을 현실적인 다음 행동으로 연결해 보세요.</p>
        </div>
      </div>

      <div className="action-quote">
        <small>핵심 한 문장</small>
        <blockquote>{reading.report.coreMessage}</blockquote>
      </div>
      <button className="primary-button wide" onClick={onProducts}>
        상세 상담 범위 비교하기
      </button>
      <button className="text-button" onClick={onSave}>
        {saved ? "이 기기에 저장되었습니다 ✓" : "무료 결과를 이 기기에 저장하기"}
      </button>
    </section>
  );
}

function ChartSummary({ reading }: { reading: ReadingResponse }) {
  return (
    <div className="chart-summary">
      <div className="pillars-card">
        <div className="chart-heading">
          <div>
            <small>사주 원국</small>
            <strong>일간 {reading.chart.dayMaster.stem} · {reading.chart.dayMaster.yinYang}{reading.chart.dayMaster.element}</strong>
          </div>
          <span>{reading.chart.timeAccuracy === "unknown" ? "시주 미상" : "시주 포함"}</span>
        </div>
        <div className="pillars-grid">
          {reading.chart.pillars.map((pillar) => (
            <article key={pillar.key} className={pillar.key === "day" ? "day-pillar" : ""}>
              <small>{pillar.label}</small>
              <strong>{pillar.ganZhi}</strong>
              <span>{pillar.stemElement} · {pillar.branchElement}</span>
              <em>{pillar.tenGodStem}</em>
            </article>
          ))}
        </div>
      </div>
      <div className="elements-card">
        <div className="chart-heading">
          <div><small>오행 분포</small><strong>강약 참고 지표</strong></div>
          <span>월지 가중</span>
        </div>
        <div className="element-bars">
          {reading.chart.elements.map((item) => (
            <div key={item.element}>
              <span>{item.element}</span>
              <div><i style={{ width: `${Math.max(4, item.percentage)}%` }} /></div>
              <strong>{item.percentage}%</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Evidence({ items }: { items: string[] }) {
  return (
    <div className="evidence-list">
      <span>해석 근거</span>
      {items.map((item) => <small key={item}>{item}</small>)}
    </div>
  );
}

function PaidResult({
  reading,
  profile,
  topic,
  product,
  saved,
  onSave,
  onRestart,
}: {
  reading: ReadingResponse;
  profile: Omit<BirthInput, "topic">;
  topic: Topic;
  product: Product;
  saved: boolean;
  onSave: () => void;
  onRestart: () => void;
}) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const report = reading.report;
  const sections = Object.values(report.sections);

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const previous = JSON.parse(localStorage.getItem("myeongun-reviews") || "[]");
    previous.unshift({
      id: Date.now(),
      name: profile.name,
      product: product.name,
      rating: Number(data.get("rating")),
      content: data.get("content"),
      createdAt: new Date().toISOString(),
      verified: true,
    });
    localStorage.setItem("myeongun-reviews", JSON.stringify(previous.slice(0, 50)));
    setReviewDone(true);
    setReviewOpen(false);
  }

  return (
    <section className="result-section paid-result">
      <div className="result-label">상세 상담 · {product.name}</div>
      <div className="result-top">
        <div>
          <p className="kicker">{topic.teacher} 선생의 {topic.eyebrow} 해석</p>
          <h1>{profile.name}님의<br />사주 상담 리포트</h1>
          <p>{reading.chart.solarDateTime} · {profile.calendar === "solar" ? "양력" : "음력"} · {profile.birthPlace}</p>
        </div>
        <div className="score-ring large">
          <strong>{report.score}</strong>
          <span>{report.scoreLabel}</span>
        </div>
      </div>

      <ChartSummary reading={reading} />

      <div className="summary-grid">
        <div><small>핵심 키워드</small><strong>{report.keywords.slice(0, 3).join(" · ")}</strong></div>
        <div><small>활용하기 좋은 시기</small><strong>{report.timing}</strong></div>
        <div><small>현재 대운</small><strong>{reading.chart.luckPeriods.find((item) => item.active)?.ganZhi || "경계 구간"}</strong></div>
      </div>

      {sections.map((section, index) => (
        <article
          className={`reading-card ${index === 1 ? "accent" : ""}`}
          key={section.title}
        >
          <span className="chapter">{String(index + 1).padStart(2, "0")}</span>
          <small>{section.title}</small>
          <h2>{index === 0 ? report.summary : section.title}</h2>
          <p>{section.body}</p>
          <Evidence items={section.evidence} />
        </article>
      ))}

      <div className="timeline-section">
        <p className="kicker">앞으로 6개월의 월별 흐름</p>
        <h2>날짜를 예언하지 않고,<br />월별 기운과 대응 방식을 함께 봅니다.</h2>
        <div className="timeline six-months">
          {reading.chart.monthlyFlow.map((month, index) => (
            <article key={`${month.year}-${month.month}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <small>{month.year}.{String(month.month).padStart(2, "0")} · {month.ganZhi}</small>
              <strong>{month.tone} · {month.score}</strong>
              <p>{month.guidance}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="luck-table">
        <div className="chart-heading">
          <div><small>대운 흐름</small><strong>{reading.chart.luckStart}</strong></div>
          <span>10년 단위</span>
        </div>
        <div>
          {reading.chart.luckPeriods.slice(0, 8).map((period) => (
            <article className={period.active ? "active" : ""} key={`${period.ganZhi}-${period.startYear}`}>
              <strong>{period.ganZhi}</strong>
              <span>{period.startYear}–{period.endYear}</span>
              <small>{period.startAge}–{period.endAge}세</small>
            </article>
          ))}
        </div>
      </div>

      <div className="do-dont-grid">
        <article className="do-card">
          <span>해야 할 행동</span>
          <h2>{report.actions[0]}</h2>
          <ul>{report.actions.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article className="dont-card">
          <span>피해야 할 행동</span>
          <h2>{report.avoid[0]}</h2>
          <ul>{report.avoid.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </div>

      <div className="final-quote">
        <span>명운서재가 드리는 한 문장</span>
        <blockquote>“{report.coreMessage}”</blockquote>
        <p>{report.disclaimer}</p>
      </div>

      <details className="calculation-notes">
        <summary>계산 기준과 정확도 안내</summary>
        <ul>{reading.chart.calculationNotes.map((note) => <li key={note}>{note}</li>)}</ul>
        <p>생성 방식: {reading.interpretationSource === "openai-assisted" ? `AI 보조 (${reading.model})` : "규칙 기반 해석 엔진"}</p>
      </details>

      <div className="result-actions">
        <button onClick={() => window.print()}>PDF로 저장</button>
        <button onClick={onSave}>{saved ? "저장 완료 ✓" : "내 결과 저장"}</button>
        <button onClick={() => setReviewOpen(true)}>구매 후기 남기기</button>
        <button onClick={onRestart}>다른 고민 보기</button>
      </div>
      {reviewDone && <div className="toast">구매 인증 후기가 등록됐습니다.</div>}

      {reviewOpen && (
        <div className="modal-backdrop" onClick={() => setReviewOpen(false)}>
          <form
            className="review-modal"
            onSubmit={submitReview}
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="modal-close" onClick={() => setReviewOpen(false)}>×</button>
            <p className="kicker">구매 인증 후기</p>
            <h2>해석이 어떠셨나요?</h2>
            <label>
              만족도
              <select name="rating" defaultValue="5">
                <option value="5">★★★★★ 아주 좋아요</option>
                <option value="4">★★★★☆ 좋아요</option>
                <option value="3">★★★☆☆ 보통이에요</option>
              </select>
            </label>
            <label>
              후기
              <textarea name="content" required minLength={10} placeholder="도움이 된 부분을 10자 이상 적어주세요." />
            </label>
            <button className="primary-button">후기 등록하기</button>
          </form>
        </div>
      )}
    </section>
  );
}

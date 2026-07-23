"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Topic = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  teacher: string;
};

type Profile = {
  name: string;
  gender: string;
  calendar: string;
  birth: string;
  birthTime: string;
  concern: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  badge?: string;
};

type SavedReading = {
  id: string;
  createdAt: string;
  topic: string;
  name: string;
  product: string;
  score: number;
  keywords: string[];
};

const topics: Topic[] = [
  {
    id: "heart",
    eyebrow: "연애 · 속마음",
    title: "그 사람은 나를 어떻게 생각할까",
    description: "엇갈린 표현 속에 숨은 관계의 흐름을 읽어요.",
    icon: "心",
    teacher: "연화",
  },
  {
    id: "reunion",
    eyebrow: "재회 · 타이밍",
    title: "다시 만날 가능성이 있을까",
    description: "붙잡을 때와 여백을 둘 때를 구분해 드려요.",
    icon: "緣",
    teacher: "연화",
  },
  {
    id: "career",
    eyebrow: "직장 · 이직",
    title: "지금 직장을 계속 다녀야 할까",
    description: "피로인지 전환의 신호인지 현실적으로 살펴봐요.",
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
    description: "지금 가장 답답한 한 가지에 집중해요.",
    features: ["핵심 원인 분석", "오늘부터의 행동 조언", "결과 1년 보관"],
  },
  {
    id: "focus",
    name: "집중 사주 상담",
    price: 14900,
    description: "현재부터 앞으로 6개월까지 깊이 읽어요.",
    features: ["원인 · 현재 흐름", "6개월 중요 시기", "해야 할 일 / 피할 일", "PDF 저장"],
    badge: "가장 많이 선택",
  },
  {
    id: "life",
    name: "종합 인생 리포트",
    price: 29900,
    description: "연애·재물·직업과 1년 흐름을 한 번에.",
    features: ["5개 분야 종합 분석", "12개월 흐름", "추가 질문 1회", "영구 보관 · PDF"],
  },
];

const initialProfile: Profile = {
  name: "",
  gender: "여성",
  calendar: "양력",
  birth: "",
  birthTime: "모름",
  concern: "",
};

const loadingLines = [
  "사주의 오행을 확인하고 있습니다",
  "현재 대운과 세운을 비교하고 있습니다",
  "고민과 가장 관련된 시기를 찾고 있습니다",
  "당신에게 필요한 행동을 정리하고 있습니다",
];

function hashText(value: string) {
  return [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

function formatPrice(price: number) {
  return `${price.toLocaleString("ko-KR")}원`;
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState<Topic>(topics[0]);
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [product, setProduct] = useState<Product>(products[1]);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const seed = useMemo(
    () => hashText(`${profile.birth}${profile.name}${topic.id}`),
    [profile.birth, profile.name, topic.id],
  );
  const score = 67 + (seed % 19);
  const discount = couponApplied ? Math.floor(product.price * 0.2) : 0;
  const finalPrice = product.price - discount;

  useEffect(() => {
    if (step !== 4) return;
    setLoadingIndex(0);
    const timer = window.setInterval(() => {
      setLoadingIndex((current) => {
        if (current >= loadingLines.length - 1) {
          window.clearInterval(timer);
          window.setTimeout(() => setStep(5), 700);
          return current;
        }
        return current + 1;
      });
    }, 780);
    return () => window.clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  function chooseTopic(nextTopic: Topic) {
    setTopic(nextTopic);
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitProfile(event: FormEvent) {
    event.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function applyCoupon() {
    setCouponApplied(coupon.trim().toUpperCase() === "FIRST20");
  }

  function finishPayment() {
    if (!loggedIn) {
      setLoggedIn(true);
      window.setTimeout(() => setStep(4), 450);
      return;
    }
    setStep(4);
  }

  function saveResult() {
    const current: SavedReading = {
      id: `reading-${Date.now()}`,
      createdAt: new Date().toISOString(),
      topic: topic.title,
      name: profile.name || "고객",
      product: product.name,
      score,
      keywords: getKeywords(topic.id),
    };
    const previous = JSON.parse(
      window.localStorage.getItem("myeongun-readings") || "[]",
    ) as SavedReading[];
    window.localStorage.setItem(
      "myeongun-readings",
      JSON.stringify([current, ...previous]),
    );
    setSaved(true);
  }

  function restart() {
    setStep(0);
    setProfile(initialProfile);
    setCoupon("");
    setCouponApplied(false);
    setLoggedIn(false);
    setSaved(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
          <button onClick={() => setStep(0)}>무료 운세</button>
          <button onClick={() => setStep(3)}>상담 상품</button>
          <a href="#method">해석 방식</a>
          <Link href="/admin">관리자 데모</Link>
        </nav>
        <button
          className="menu-button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="메뉴 열기"
        >
          {menuOpen ? "닫기" : "메뉴"}
        </button>
      </header>

      <div className="progress-wrap" aria-label={`전체 6단계 중 ${Math.min(step + 1, 6)}단계`}>
        <div className="progress" style={{ width: `${((Math.min(step, 5) + 1) / 6) * 100}%` }} />
      </div>

      {step === 0 && (
        <>
          <section className="hero">
            <div className="hero-copy">
              <p className="kicker">AI 명리 상담 · 첫 해석 무료</p>
              <h1>
                마음이 머무는 고민,
                <br />
                <em>다음 선택</em>이 보이도록.
              </h1>
              <p className="hero-description">
                운명을 단정하지 않습니다. 타고난 흐름과 지금의 고민을 함께 읽고,
                오늘부터 취할 수 있는 현실적인 행동을 알려드려요.
              </p>
              <div className="trust-row">
                <span>로그인 없이 시작</span>
                <span>약 2분 소요</span>
                <span>개인정보 최소 수집</span>
              </div>
            </div>
            <div className="hero-seal" aria-hidden="true">
              <span>今日</span>
              <strong>{new Date().getDate()}</strong>
              <small>당신의 흐름을 읽는 날</small>
            </div>
          </section>

          <section className="topic-section">
            <div className="section-heading">
              <span>01 · 고민 선택</span>
              <h2>지금, 가장 알고 싶은 것은 무엇인가요?</h2>
              <p>구체적인 질문을 고르면 무료 핵심 해석을 바로 시작합니다.</p>
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
                  <span className="card-link">무료로 확인하기 →</span>
                </button>
              ))}
            </div>
          </section>

          <section className="method-section" id="method">
            <div>
              <p className="kicker light">명운서재의 해석 원칙</p>
              <h2>예언보다 방향,<br />불안보다 선택.</h2>
            </div>
            <div className="principles">
              <article>
                <span>一</span>
                <div>
                  <strong>흐름을 읽습니다</strong>
                  <p>오행과 생년 정보를 바탕으로 반복되는 성향과 시기를 살펴봅니다.</p>
                </div>
              </article>
              <article>
                <span>二</span>
                <div>
                  <strong>고민에 연결합니다</strong>
                  <p>두루뭉술한 풀이 대신 지금 입력한 고민과 직접 연결해 설명합니다.</p>
                </div>
              </article>
              <article>
                <span>三</span>
                <div>
                  <strong>행동으로 끝맺습니다</strong>
                  <p>해야 할 일과 피해야 할 일을 한 문장으로 명확하게 제안합니다.</p>
                </div>
              </article>
            </div>
          </section>
        </>
      )}

      {step === 1 && (
        <section className="flow-section">
          <button className="back-button" onClick={() => setStep(0)}>← 질문 다시 고르기</button>
          <div className="flow-layout">
            <div className="flow-intro">
              <p className="kicker">02 · 기본 정보</p>
              <span className="teacher-chip">{topic.teacher} 선생의 해석</span>
              <h1>{topic.title}</h1>
              <p>정확한 흐름을 찾기 위해 꼭 필요한 정보만 여쭤볼게요.</p>
              <div className="privacy-note">입력 정보는 이 기기의 결과 생성에만 사용됩니다.</div>
            </div>
            <form className="profile-form" onSubmit={submitProfile}>
              <label>
                <span>이름 또는 닉네임</span>
                <input
                  required
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="어떻게 불러드릴까요?"
                />
              </label>
              <div className="form-row">
                <fieldset>
                  <legend>성별</legend>
                  <div className="segment">
                    {["여성", "남성", "선택 안 함"].map((item) => (
                      <button
                        type="button"
                        className={profile.gender === item ? "active" : ""}
                        onClick={() => setProfile({ ...profile, gender: item })}
                        key={item}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend>달력 기준</legend>
                  <div className="segment">
                    {["양력", "음력"].map((item) => (
                      <button
                        type="button"
                        className={profile.calendar === item ? "active" : ""}
                        onClick={() => setProfile({ ...profile, calendar: item })}
                        key={item}
                      >
                        {item}
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
                  max={new Date().toISOString().slice(0, 10)}
                  value={profile.birth}
                  onChange={(e) => setProfile({ ...profile, birth: e.target.value })}
                />
              </label>
              <label>
                <span>태어난 시간 <small>몰라도 괜찮아요</small></span>
                <select
                  value={profile.birthTime}
                  onChange={(e) => setProfile({ ...profile, birthTime: e.target.value })}
                >
                  <option>모름</option>
                  {Array.from({ length: 24 }, (_, hour) => (
                    <option key={hour}>{String(hour).padStart(2, "0")}:00 전후</option>
                  ))}
                </select>
              </label>
              <label>
                <span>현재 고민 <small>{profile.concern.length}/300</small></span>
                <textarea
                  required
                  maxLength={300}
                  value={profile.concern}
                  onChange={(e) => setProfile({ ...profile, concern: e.target.value })}
                  placeholder="지금 상황과 가장 궁금한 점을 편하게 적어주세요."
                />
              </label>
              <button className="primary-button" type="submit">무료 핵심 해석 보기</button>
            </form>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="result-section preview-result">
          <div className="result-top">
            <div>
              <p className="kicker">무료 핵심 해석</p>
              <h1>{profile.name}님의 지금 흐름</h1>
              <p>{topic.teacher} 선생 · {topic.eyebrow}</p>
            </div>
            <div className="score-ring">
              <strong>{score}</strong>
              <span>흐름 지수</span>
            </div>
          </div>
          <div className="keyword-row">
            {getKeywords(topic.id).map((keyword) => <span key={keyword}>#{keyword}</span>)}
          </div>
          <article className="reading-card lead-reading">
            <small>타고난 반응 패턴</small>
            <h2>{getPreviewTitle(topic.id, profile.name)}</h2>
            <p>{getPreviewBody(topic.id, profile.concern)}</p>
          </article>
          <div className="locked-reading">
            <div className="locked-card">
              <span>03</span><strong>상대 또는 주변 상황</strong>
              <p>지금 드러나지 않는 감정과 환경의 영향을 분석합니다.</p>
            </div>
            <div className="locked-card">
              <span>04</span><strong>앞으로의 변화</strong>
              <p>3개월·6개월의 중요한 전환 시기를 확인합니다.</p>
            </div>
            <div className="fade-lock">
              <span>✦</span>
              <strong>현재 운의 흐름에서<br />가장 중요한 부분이 아직 남아 있습니다.</strong>
              <p>결정을 내리기 전, 유리한 시기와 피해야 할 행동을 확인해 보세요.</p>
            </div>
          </div>
          <div className="action-quote">
            <small>오늘의 한 문장</small>
            <blockquote>{getActionLine(topic.id)}</blockquote>
          </div>
          <button className="primary-button wide" onClick={() => setStep(3)}>
            나에게 맞는 상세 상담 비교하기
          </button>
          <button className="text-button" onClick={saveResult}>
            {saved ? "무료 결과가 저장되었습니다 ✓" : "무료 결과만 저장하기"}
          </button>
        </section>
      )}

      {step === 3 && (
        <section className="product-section">
          <button className="back-button" onClick={() => setStep(2)}>← 무료 결과로 돌아가기</button>
          <div className="section-heading center">
            <span>상세 상담 선택</span>
            <h1>어디까지 알고 싶으신가요?</h1>
            <p>모든 상품은 구매 후 다시 볼 수 있으며, AI 활용 사실을 명확히 안내합니다.</p>
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
            <div className="coupon-area">
              <label htmlFor="coupon">쿠폰 코드</label>
              <div>
                <input
                  id="coupon"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="FIRST20"
                />
                <button onClick={applyCoupon}>적용</button>
              </div>
              {coupon && (
                <small className={couponApplied ? "success" : "hint"}>
                  {couponApplied ? "첫 상담 20% 쿠폰이 적용됐어요." : "데모 쿠폰은 FIRST20 입니다."}
                </small>
              )}
            </div>
            <div className="price-summary">
              <span>선택 상품 <strong>{product.name}</strong></span>
              {discount > 0 && <span>쿠폰 할인 <strong>-{formatPrice(discount)}</strong></span>}
              <span className="total">최종 결제 금액 <strong>{formatPrice(finalPrice)}</strong></span>
            </div>
            <button className="kakao-button" onClick={finishPayment}>
              <span>kakao</span>
              {loggedIn ? `${formatPrice(finalPrice)} 데모 결제하기` : "카카오로 로그인하고 계속"}
            </button>
            <p className="demo-notice">
              데모 모드: 실제 결제는 발생하지 않습니다. 운영 시 카카오 OAuth와 결제 모듈을 연결합니다.
            </p>
            <div className="ai-disclosure">
              본 서비스는 전통 명리학 해석 체계와 AI 기술을 활용해 개인별 결과를 제공합니다.
              결과는 절대적인 예언이 아닌 선택을 위한 참고 자료입니다.
            </div>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="loading-section">
          <div className="orbit">
            <span>木</span><span>火</span><span>土</span><span>金</span><span>水</span>
            <strong>命</strong>
          </div>
          <p className="kicker">개인 해석 생성 중</p>
          <h1>{profile.name}님의 흐름을<br />차분히 읽고 있습니다.</h1>
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

      {step === 5 && (
        <PaidResult
          profile={profile}
          topic={topic}
          product={product}
          score={score}
          saved={saved}
          onSave={saveResult}
          onRestart={restart}
        />
      )}

      <footer>
        <div className="footer-brand">
          <span className="brand-mark">命</span>
          <div><strong>명운서재</strong><p>내 운명을 읽고, 다음 선택을 설계하다.</p></div>
        </div>
        <div className="footer-links">
          <a href="#method">사주 해석 방식</a>
          <span>이용약관</span>
          <span>개인정보처리방침</span>
          <Link href="/admin">관리자</Link>
        </div>
        <p className="copyright">© 2026 Myeongun Library. MVP demo.</p>
      </footer>
    </main>
  );
}

function PaidResult({
  profile,
  topic,
  product,
  score,
  saved,
  onSave,
  onRestart,
}: {
  profile: Profile;
  topic: Topic;
  product: Product;
  score: number;
  saved: boolean;
  onSave: () => void;
  onRestart: () => void;
}) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const keywords = getKeywords(topic.id);
  const months = ["지금–4주", "2–3개월", "4–6개월"];

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const reviews = JSON.parse(localStorage.getItem("myeongun-reviews") || "[]");
    reviews.unshift({
      id: Date.now(),
      name: profile.name,
      product: product.name,
      rating: Number(form.get("rating")),
      content: form.get("content"),
      createdAt: new Date().toISOString(),
      verified: true,
    });
    localStorage.setItem("myeongun-reviews", JSON.stringify(reviews));
    setReviewDone(true);
    setReviewOpen(false);
  }

  return (
    <section className="result-section paid-result">
      <div className="result-label">PURCHASED READING · {product.name}</div>
      <div className="result-top">
        <div>
          <p className="kicker">{topic.teacher} 선생의 해석</p>
          <h1>{profile.name}님의<br />{topic.eyebrow} 리포트</h1>
          <p>{profile.birth} · {profile.calendar} · {profile.birthTime}</p>
        </div>
        <div className="score-ring large"><strong>{score}</strong><span>현재 흐름</span></div>
      </div>
      <div className="summary-grid">
        <div><small>핵심 키워드</small><strong>{keywords.join(" · ")}</strong></div>
        <div><small>중요한 시기</small><strong>{getTiming(topic.id)}</strong></div>
        <div><small>가장 필요한 행동</small><strong>{getShortAction(topic.id)}</strong></div>
      </div>
      <article className="reading-card">
        <span className="chapter">01</span>
        <small>타고난 성향</small>
        <h2>{getPreviewTitle(topic.id, profile.name)}</h2>
        <p>{getDetailedReading(topic.id, 0)}</p>
        <p>{getDetailedReading(topic.id, 1)}</p>
      </article>
      <article className="reading-card accent">
        <span className="chapter">02</span>
        <small>현재 고민의 근본 원인</small>
        <h2>문제의 시작점은 생각보다 가까운 곳에 있습니다.</h2>
        <p>
          “{profile.concern.slice(0, 90)}{profile.concern.length > 90 ? "…" : ""}”라는 고민에서
          가장 크게 보이는 것은 상황 자체보다 오래 누적된 피로입니다. 마음은 이미 신호를 보냈지만,
          확신이 생길 때까지 결정을 미루는 패턴이 현재의 답답함을 키웠을 가능성이 큽니다.
        </p>
      </article>
      <div className="timeline-section">
        <p className="kicker">앞으로의 흐름</p>
        <h2>변화는 한 번에 오지 않고,<br />세 번의 파동으로 들어옵니다.</h2>
        <div className="timeline">
          {months.map((month, index) => (
            <article key={month}>
              <span>0{index + 1}</span>
              <small>{month}</small>
              <strong>{getTimelineTitle(topic.id, index)}</strong>
              <p>{getTimelineBody(topic.id, index)}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="do-dont-grid">
        <article className="do-card">
          <span>해야 할 행동</span>
          <h2>{getShortAction(topic.id)}</h2>
          <ul>
            <li>감정이 아닌 관찰한 사실을 세 문장으로 적어보기</li>
            <li>결정 기준을 상대의 반응보다 나의 지속 가능성에 두기</li>
            <li>{getActionLine(topic.id)}</li>
          </ul>
        </article>
        <article className="dont-card">
          <span>피해야 할 행동</span>
          <h2>불안을 없애기 위한 성급한 확답</h2>
          <ul>
            <li>하루의 기분만으로 관계나 일을 단정하기</li>
            <li>주변의 속도와 나의 속도를 비교하기</li>
            <li>상대의 말보다 내 추측을 사실로 믿기</li>
          </ul>
        </article>
      </div>
      <div className="final-quote">
        <span>명운서재가 드리는 한 문장</span>
        <blockquote>“{getActionLine(topic.id)}”</blockquote>
        <p>구체적인 시기와 결과는 절대적인 예언이 아닌, 선택을 위한 참고 해석입니다.</p>
      </div>
      <div className="result-actions">
        <button onClick={() => window.print()}>PDF로 저장</button>
        <button onClick={onSave}>{saved ? "저장 완료 ✓" : "내 결과 저장"}</button>
        <button onClick={() => setReviewOpen(true)}>구매 후기 남기기</button>
        <button onClick={onRestart}>다른 고민 보기</button>
      </div>
      {reviewDone && <div className="toast">구매 인증 후기가 등록됐어요. 감사합니다.</div>}
      {reviewOpen && (
        <div className="modal-backdrop" onClick={() => setReviewOpen(false)}>
          <form className="review-modal" onSubmit={submitReview} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setReviewOpen(false)}>×</button>
            <p className="kicker">구매 인증 후기</p>
            <h2>해석이 어떠셨나요?</h2>
            <label>만족도
              <select name="rating" defaultValue="5">
                <option value="5">★★★★★ 아주 좋아요</option>
                <option value="4">★★★★☆ 좋아요</option>
                <option value="3">★★★☆☆ 보통이에요</option>
              </select>
            </label>
            <label>후기
              <textarea name="content" required placeholder="가장 도움이 된 부분을 알려주세요." />
            </label>
            <button className="primary-button">후기 등록하기</button>
          </form>
        </div>
      )}
    </section>
  );
}

function getKeywords(id: string) {
  const map: Record<string, string[]> = {
    heart: ["관찰", "표현의 온도", "여백"],
    reunion: ["거리 조절", "회복", "타이밍"],
    career: ["기준 재설정", "준비", "이동"],
    money: ["구조", "집중", "현금 흐름"],
  };
  return map[id] || map.heart;
}

function getPreviewTitle(id: string, name: string) {
  const map: Record<string, string> = {
    heart: `${name}님은 마음이 깊어질수록 상대의 작은 변화까지 읽으려 합니다.`,
    reunion: `${name}님은 끝난 관계에서도 충분히 이해한 뒤에야 마음을 놓는 편입니다.`,
    career: `${name}님은 버티는 힘이 강하지만, 인정받지 못한다는 감정에 오래 지칩니다.`,
    money: `${name}님은 한 번에 크게 얻기보다 실력을 반복해서 수입으로 바꾸는 흐름이 강합니다.`,
  };
  return map[id] || map.heart;
}

function getPreviewBody(id: string, concern: string) {
  const base: Record<string, string> = {
    heart: "관계가 불안해질수록 상대의 마음을 확인하고 싶은 성향이 강해집니다. 현재의 어려움은 애정 부족보다 서로 다른 표현 방식에서 시작됐을 가능성이 큽니다.",
    reunion: "마음이 남아 있을수록 마지막 장면을 반복해서 해석하는 경향이 있습니다. 지금은 상대의 즉각적인 반응보다 관계가 멀어진 원인을 분리해서 보는 일이 먼저입니다.",
    career: "지금 그만두고 싶은 마음은 단순한 피로보다 노력에 비해 인정받지 못했다는 감정에서 시작됐을 가능성이 큽니다. 이동 자체보다 조건을 고르는 기준을 세우는 것이 중요합니다.",
    money: "돈이 모이지 않는 이유는 소비 습관 하나보다 수입의 변동성과 목표 없는 지출이 함께 작용하기 때문일 수 있습니다. 지금은 큰 기회보다 반복 가능한 수입 구조가 우선입니다.",
  };
  return `${base[id] || base.heart} “${concern.slice(0, 55)}${concern.length > 55 ? "…" : ""}”라는 고민에도 이 흐름이 선명하게 나타납니다.`;
}

function getActionLine(id: string) {
  const map: Record<string, string> = {
    heart: "지금은 관계를 붙잡기보다, 상대가 당신을 다시 바라볼 여백을 만들 때입니다.",
    reunion: "답을 재촉하기보다 한 걸음 물러나, 관계가 달라질 근거부터 만드는 편이 유리합니다.",
    career: "충동적인 퇴사보다, 다음 선택의 조건을 세 가지로 좁혀 비교할 때입니다.",
    money: "새로운 투자보다 매달 반복할 수 있는 수입의 한 축을 먼저 단단히 만드세요.",
  };
  return map[id] || map.heart;
}

function getShortAction(id: string) {
  const map: Record<string, string> = {
    heart: "반응보다 일관성을 관찰하기",
    reunion: "연락 전 관계의 원인 정리하기",
    career: "이동 조건 세 가지 적기",
    money: "반복 수입 한 축 만들기",
  };
  return map[id] || map.heart;
}

function getTiming(id: string) {
  const map: Record<string, string> = {
    heart: "앞으로 6–10주",
    reunion: "두 번째 달 후반",
    career: "3개월째 전환점",
    money: "4–5개월째 확장기",
  };
  return map[id] || map.heart;
}

function getDetailedReading(id: string, index: number) {
  const readings: Record<string, string[]> = {
    heart: [
      "당신은 말보다 태도와 분위기의 변화를 빠르게 감지합니다. 이 감각은 관계를 깊게 이해하는 장점이지만, 설명되지 않은 침묵을 만날 때는 모든 원인을 자신에게서 찾게 만들기도 합니다.",
      "사랑을 확인받으려는 마음이 커질수록 표현은 오히려 조심스러워집니다. 참다가 한 번에 마음을 꺼내는 방식보다, 작고 정확한 요청을 자주 건네는 방식이 당신의 관계운을 더 안정시킵니다.",
    ],
    reunion: [
      "당신은 인연을 쉽게 시작하지 않는 만큼 쉽게 지우지도 않습니다. 관계가 끝나도 감정의 맥락을 모두 이해해야 비로소 다음으로 움직일 수 있는 사람입니다.",
      "재회의 가능성은 그리움의 크기보다 헤어진 원인이 실제로 달라졌는지에 달려 있습니다. 지금 필요한 것은 연락의 기술보다 같은 갈등이 반복되지 않을 근거입니다.",
    ],
    career: [
      "당신은 맡은 일을 끝까지 책임지는 힘이 강합니다. 다만 애매한 기대까지 스스로 떠맡는 일이 반복되면 성취감보다 소진이 먼저 쌓입니다.",
      "이직운은 갑작스러운 탈출보다 준비된 이동에서 강하게 작동합니다. 직함보다 의사결정 권한, 보상 기준, 성장 속도를 비교할수록 후회가 줄어듭니다.",
    ],
    money: [
      "당신의 재물운은 우연한 횡재보다 오래 쌓은 감각과 전문성을 여러 번 판매할 때 강해집니다. 작게 검증하고 반복하는 구조가 잘 맞습니다.",
      "돈을 모으는 핵심은 절약보다 수입의 목적을 분리하는 것입니다. 생활·성장·안전 자금을 나누면 불안 때문에 생기는 즉흥 지출이 자연스럽게 줄어듭니다.",
    ],
  };
  return (readings[id] || readings.heart)[index];
}

function getTimelineTitle(id: string, index: number) {
  const common = [
    ["관찰과 정리", "대화의 창", "선택의 안정"],
    ["감정의 정돈", "접점의 변화", "관계의 결정"],
    ["조건 정리", "기회 탐색", "이동 판단"],
    ["지출 구조화", "작은 수익 검증", "확장 판단"],
  ];
  const ids = ["heart", "reunion", "career", "money"];
  return common[Math.max(0, ids.indexOf(id))][index];
}

function getTimelineBody(id: string, index: number) {
  const bodies = [
    "결론보다 사실을 모을 때입니다. 감정이 커지는 날에는 바로 행동하지 말고 하루의 간격을 두세요.",
    "정체돼 보이던 상황에 작은 변화가 들어옵니다. 조건을 분명히 한 대화가 흐름을 바꿀 수 있습니다.",
    "앞선 선택의 결과가 선명해집니다. 유지할 것과 놓을 것을 결정하기 좋은 시기입니다.",
  ];
  return bodies[index];
}

import Link from "next/link";
import { hasPersistenceConfiguration } from "../../lib/storage/supabase";

export default function PrivacyPage() {
  const supportEmail = process.env.SERVICE_SUPPORT_EMAIL;
  const persistenceEnabled = hasPersistenceConfiguration();

  return (
    <main className="content-shell">
      <header className="content-header">
        <Link href="/" className="brand">
          <span className="brand-mark">命</span>
          <span><strong>명운서재</strong><small>PRIVACY</small></span>
        </Link>
        <Link href="/">← 서비스로 돌아가기</Link>
      </header>
      <article className="content-page legal-page">
        <p className="kicker">개인정보처리방침 · 서비스 준비본</p>
        <h1>개인정보는 해석에 필요한 만큼만 다룹니다.</h1>
        <p className="content-lead">
          시행일 2026년 7월 24일. 현재 서비스는 로그인을 사용하지 않으며 영구 데이터베이스를
          연결하지 않았습니다. 사용자가 저장한 결과와 후기는 브라우저의 로컬 저장소에 보관됩니다.
        </p>
        <h2>1. 처리하는 정보</h2>
        <p>닉네임, 성별, 생년월일, 양·음력과 윤달 여부, 출생 시각·지역, 사용자가 작성한 고민을 처리합니다.</p>
        <h2>2. 이용 목적</h2>
        <p>사주 원국 계산, 개인화 해석 생성, 결과 표시와 사용자가 요청한 기기 내 저장에만 이용합니다.</p>
        <h2>3. 현재 저장 방식</h2>
        <p>
          무료 계산 입력은 결과 생성 요청 동안 처리됩니다. ‘내 결과 저장’을 선택한 경우 결과는 해당 브라우저의
          localStorage에 저장되며 다른 기기와 동기화되지 않습니다. 브라우저 데이터를 삭제하면 함께 삭제됩니다.
        </p>
        <p>
          {persistenceEnabled
            ? "운영 결제로 생성된 상세 결과는 구매 복구를 위해 Supabase 데이터베이스에 암호화하여 저장합니다. 결과 본문은 AES-256-GCM으로 암호화하며 결제 키와 복구 코드는 단방향 해시만 저장합니다."
            : "현재 서버 영구 저장소는 설정되지 않았으며, 이 상태에서는 운영 결제가 자동으로 차단됩니다."}
        </p>
        <h2>4. AI 처리</h2>
        <p>
          운영 환경에 OpenAI API가 설정된 경우 구조화된 사주 데이터와 고민 내용이 해석 문장 생성을 위해 전송될 수
          있습니다. API 키가 없으면 외부 AI 전송 없이 규칙 기반 엔진만 사용합니다. 운영 전 별도 동의 절차를 추가합니다.
        </p>
        <h2>5. 결제 처리</h2>
        <p>
          운영 결제는 토스페이먼츠 결제창을 사용합니다. 카드번호 등 결제수단 정보는 명운서재가
          직접 수집하지 않습니다. 서버는 승인 검증을 위해 주문번호, 결제 키, 금액, 결제수단과 승인
          시각을 일시적으로 처리합니다. 결제사 수탁·제공 고지와 법정 보관 기간은 실제 판매 전에
          사업자 정보와 함께 확정해 본 방침에 반영합니다. 구매 결과 보관을 활성화하면 Supabase가
          데이터 처리 수탁사에 포함됩니다.
        </p>
        <h2>6. 로그인·영구 보관 도입 시</h2>
        <p>
          카카오 로그인을 활성화하면 Supabase Auth를 통해 카카오 계정 식별자와 사용자가
          동의한 프로필 정보를 처리합니다. 로그인한 상태에서 구매한 결과에는 Supabase 사용자
          식별자를 연결해 ‘내 서재’에서 다시 열 수 있습니다. 로그인은 선택 사항이며 비회원도
          복구 코드로 구매 결과를 복구할 수 있습니다.
        </p>
        <h2>7. 이용자의 권리</h2>
        <p>
          현재 저장 결과는 브라우저 개발자 도구 또는 사이트 데이터 삭제로 직접 제거할 수
          있습니다. 문의 창구: {supportEmail || "공개 판매 전 고객지원 이메일 등록 필요"}.
        </p>
      </article>
    </main>
  );
}

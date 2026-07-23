import Link from "next/link";

export default function PrivacyPage() {
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
          시행일 2026년 7월 24일. 현재 MVP는 로그인·실결제·서버 데이터베이스를 연결하지 않았으며,
          사용자가 저장한 결과와 후기는 브라우저의 로컬 저장소에 보관됩니다.
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
        <h2>4. AI 처리</h2>
        <p>
          운영 환경에 OpenAI API가 설정된 경우 구조화된 사주 데이터와 고민 내용이 해석 문장 생성을 위해 전송될 수
          있습니다. API 키가 없으면 외부 AI 전송 없이 규칙 기반 엔진만 사용합니다. 운영 전 별도 동의 절차를 추가합니다.
        </p>
        <h2>5. 결제·로그인 도입 시</h2>
        <p>
          카카오 로그인, 결제사, 서버 저장소가 연결되기 전에 수탁사, 보유 기간, 파기 절차, 국외 이전 여부와
          개인정보 보호 책임자 정보를 확정해 본 방침을 갱신합니다.
        </p>
        <h2>6. 이용자의 권리</h2>
        <p>현재 저장 결과는 브라우저 개발자 도구 또는 사이트 데이터 삭제로 직접 제거할 수 있습니다.</p>
      </article>
    </main>
  );
}

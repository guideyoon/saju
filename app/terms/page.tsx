import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="content-shell">
      <header className="content-header">
        <Link href="/" className="brand">
          <span className="brand-mark">命</span>
          <span><strong>명운서재</strong><small>TERMS</small></span>
        </Link>
        <Link href="/">← 서비스로 돌아가기</Link>
      </header>
      <article className="content-page legal-page">
        <p className="kicker">이용약관 · 서비스 준비본</p>
        <h1>명운서재 서비스 이용 기준</h1>
        <p className="content-lead">시행일 2026년 7월 24일. 실제 유료 출시 전 사업자 정보와 환불 정책을 확정해 갱신해야 합니다.</p>
        <h2>1. 서비스 성격</h2>
        <p>
          명운서재는 전통 명리학의 상징 체계와 소프트웨어 계산, AI 또는 규칙 기반 문장 생성 기술을 활용한
          참고용 콘텐츠 서비스입니다. 무속인이나 인간 상담가가 실시간으로 직접 상담하는 서비스가 아닙니다.
        </p>
        <h2>2. 결과의 한계</h2>
        <p>
          결과는 미래 사건, 상대방의 실제 생각, 재회·합격·수익·건강 결과를 보장하지 않습니다.
          의료·법률·투자·고용 등 중요한 의사결정의 유일한 근거로 사용해서는 안 됩니다.
        </p>
        <h2>3. 입력 책임</h2>
        <p>정확한 계산을 위해 양·음력, 윤달과 출생 시각을 확인해야 하며 잘못 입력한 정보로 생성된 결과는 달라질 수 있습니다.</p>
        <h2>4. 테스트 결제</h2>
        <p>현재 MVP의 결제 화면은 전환 흐름 검증을 위한 테스트이며 실제 과금이나 유료 콘텐츠 판매가 발생하지 않습니다.</p>
        <h2>5. 실제 유료 출시 전 확정 사항</h2>
        <p>
          사업자 명칭·주소·연락처, 통신판매업 신고정보, 상품별 제공 기간, 청약철회와 환불 기준,
          미성년자 이용 기준, 분쟁 처리 절차를 결제 모듈 연결 전에 추가합니다.
        </p>
        <h2>6. 금지 행위</h2>
        <p>자동화된 과도한 요청, 서비스 역분석, 타인의 출생정보 무단 입력, 결과를 이용한 위협·사기·차별 행위를 금지합니다.</p>
      </article>
    </main>
  );
}

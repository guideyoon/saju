import Link from "next/link";

export default function TermsPage() {
  const operator = {
    name: process.env.SERVICE_OPERATOR_NAME,
    businessNumber: process.env.SERVICE_BUSINESS_NUMBER,
    ecommerceNumber: process.env.SERVICE_ECOMMERCE_NUMBER,
    address: process.env.SERVICE_OPERATOR_ADDRESS,
    email: process.env.SERVICE_SUPPORT_EMAIL,
    phone: process.env.SERVICE_SUPPORT_PHONE,
  };
  const hasOperatorInfo = Object.values(operator).every(Boolean);

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
        <h2>운영자 정보</h2>
        {hasOperatorInfo ? (
          <p>
            상호·대표자: {operator.name}<br />
            사업자등록번호: {operator.businessNumber}<br />
            통신판매업 신고번호: {operator.ecommerceNumber}<br />
            사업장 주소: {operator.address}<br />
            고객지원: {operator.email} · {operator.phone}
          </p>
        ) : (
          <p className="form-error">
            아직 사업자·통신판매업·고객지원 정보가 등록되지 않아 공개 판매를 시작할 수
            없습니다.
          </p>
        )}
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
        <h2>4. 결제와 콘텐츠 제공</h2>
        <p>
          운영 환경에서는 토스페이먼츠를 통해 14,900원의 상세 사주 리포트를 판매하도록
          설계되어 있습니다. 결제 인증만으로 구매가 완료되는 것은 아니며 서버의 금액·주문번호
          검증과 최종 승인이 끝난 뒤 상세 결과를 제공합니다. 로컬 개발 환경의 테스트 결제에는
          실제 과금이 발생하지 않습니다.
        </p>
        <h2>5. 실제 유료 출시 전 확정 사항</h2>
        <p>
          사업자 명칭·주소·연락처, 통신판매업 신고정보, 상품별 제공 기간, 청약철회와 환불 기준,
          미성년자 이용 기준, 분쟁 처리 절차를 실제 판매 개시 전에 추가합니다. 이 정보가
          확정되기 전에는 운영 결제 키를 등록하거나 공개 판매를 시작하지 않습니다.
        </p>
        <h2>6. 금지 행위</h2>
        <p>자동화된 과도한 요청, 서비스 역분석, 타인의 출생정보 무단 입력, 결과를 이용한 위협·사기·차별 행위를 금지합니다.</p>
      </article>
    </main>
  );
}

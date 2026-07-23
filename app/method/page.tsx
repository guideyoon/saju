import Link from "next/link";

export default function MethodPage() {
  return (
    <main className="content-shell">
      <header className="content-header">
        <Link href="/" className="brand">
          <span className="brand-mark">命</span>
          <span><strong>명운서재</strong><small>INTERPRETATION METHOD</small></span>
        </Link>
        <Link href="/">← 서비스로 돌아가기</Link>
      </header>

      <article className="content-page">
        <p className="kicker">사주 해석 방식</p>
        <h1>계산과 해석의 경계를<br />투명하게 공개합니다.</h1>
        <p className="content-lead">
          명운서재는 생년월일시를 역법으로 계산한 구조화 데이터와 AI 또는 규칙 기반 문장 생성을 분리합니다.
          AI가 사주팔자를 임의로 계산하거나 존재하지 않는 근거를 만들지 않도록 설계했습니다.
        </p>

        <section>
          <span>01</span>
          <div>
            <h2>입력 정보 정규화</h2>
            <p>
              양력·음력과 윤달 여부를 확인한 뒤 양력 시각으로 변환합니다. 현재 서비스는 1900년 이후 출생 정보를
              지원하며 한국 표준시를 전제로 합니다. 출생지는 기록하지만 진태양시 보정은 아직 적용하지 않습니다.
            </p>
          </div>
        </section>
        <section>
          <span>02</span>
          <div>
            <h2>절기 기준 네 기둥 계산</h2>
            <p>
              연주와 월주는 음력 설날이나 달력의 1일이 아니라 입춘과 절입 시각을 기준으로 계산합니다.
              일주는 율리우스일 기반 간지 주기를, 시주는 입력한 출생 시각의 시진을 사용합니다.
              출생 시간이 없으면 시주를 임의로 확정하지 않고 분석에서 제외합니다.
            </p>
          </div>
        </section>
        <section>
          <span>03</span>
          <div>
            <h2>오행·십성·지장간</h2>
            <p>
              네 기둥의 천간과 지지, 지장간을 일간과 비교해 오행과 십성을 계산합니다.
              화면의 오행 비율은 천간·지지 각 1, 지장간 0.6·0.3·0.1, 월지 계절 가중치 1.5를 합산한
              명운서재의 설명용 지표입니다. 이는 여러 명리 유파가 공유하는 절대 점수가 아닙니다.
            </p>
          </div>
        </section>
        <section>
          <span>04</span>
          <div>
            <h2>대운·세운·월운</h2>
            <p>
              성별과 연간 음양에 따른 순·역행 규칙으로 대운 시작 시점과 10년 단위 간지를 계산합니다.
              현재 세운과 앞으로 6개월의 월간을 일간 오행과 비교해 기회·정비·주의의 참고 흐름으로 표시합니다.
              특정 사건의 발생 날짜나 성공 여부를 확정하지 않습니다.
            </p>
          </div>
        </section>
        <section>
          <span>05</span>
          <div>
            <h2>AI가 담당하는 역할</h2>
            <p>
              AI는 원국 계산을 하지 않습니다. 서버가 계산한 사주 원국, 오행, 십성, 대운·세운 데이터와 사용자의
              고민을 받아 자연스러운 상담 문장으로 정리합니다. 모든 주요 판단에는 계산 데이터에서 가져온 근거를
              붙이며, API를 사용할 수 없을 때는 검증된 규칙 기반 해석으로 자동 전환됩니다.
            </p>
          </div>
        </section>
        <section>
          <span>06</span>
          <div>
            <h2>해석의 한계</h2>
            <p>
              사주는 전통적인 상징 해석 체계이며 과학적으로 미래를 예측하는 도구가 아닙니다.
              결과는 자기 성찰과 선택 기준을 정리하기 위한 참고 자료입니다. 의료·법률·투자·안전과 관련된 결정은
              반드시 해당 분야 전문가와 현실 정보를 함께 확인해야 합니다.
            </p>
          </div>
        </section>

        <div className="content-callout">
          <strong>계산 오류를 발견하셨나요?</strong>
          <p>입력한 양·음력, 윤달, 출생 시각과 결과의 네 기둥을 함께 보내주시면 계산 로그를 기준으로 확인합니다.</p>
        </div>
      </article>
    </main>
  );
}

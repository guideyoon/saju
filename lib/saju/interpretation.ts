import type {
  BirthInput,
  ElementName,
  ReadingReport,
  ReadingSection,
  SajuChart,
  TopicId,
} from "./types";

const DAY_MASTER: Record<
  string,
  { image: string; strength: string; shadow: string; action: string }
> = {
  甲: {
    image: "곧게 자라는 큰 나무",
    strength: "방향이 정해지면 꾸준히 밀고 나가는 힘",
    shadow: "기준이 흔들릴 때에도 혼자 버티려는 경향",
    action: "해야 할 일을 작게 나누고 주변에 진행 상황을 공유하기",
  },
  乙: {
    image: "환경에 맞춰 뻗는 덩굴과 꽃",
    strength: "관계와 상황의 미묘한 변화를 읽는 감각",
    shadow: "상대의 반응에 맞추다 자신의 기준을 늦게 확인하는 경향",
    action: "상대의 기대와 나의 필요를 따로 적어보기",
  },
  丙: {
    image: "널리 비추는 태양",
    strength: "사람과 일을 밝게 이끄는 표현력",
    shadow: "반응이 약할 때 성급하게 결론을 내리는 경향",
    action: "즉각적인 반응보다 한 달의 일관성을 관찰하기",
  },
  丁: {
    image: "집중해서 밝히는 등불",
    strength: "한 사람과 한 주제를 깊게 살피는 집중력",
    shadow: "생각을 오래 품다가 감정이 한 번에 커지는 경향",
    action: "작고 정확한 요청을 미리 말하기",
  },
  戊: {
    image: "중심을 잡는 큰 산",
    strength: "흔들리는 상황에서 책임지고 버티는 힘",
    shadow: "변화가 필요해도 익숙한 자리를 오래 지키는 경향",
    action: "유지 비용과 변화 비용을 숫자로 비교하기",
  },
  己: {
    image: "생명을 기르는 밭",
    strength: "사람과 자원을 세심하게 돌보는 실무력",
    shadow: "남의 몫까지 챙기며 자신의 소진을 늦게 알아차리는 경향",
    action: "내 책임과 상대 책임의 경계를 문장으로 정하기",
  },
  庚: {
    image: "형태를 만드는 단단한 쇠",
    strength: "복잡한 상황에서 핵심을 잘라내는 결단력",
    shadow: "옳고 그름이 분명해질수록 표현이 날카로워지는 경향",
    action: "결론보다 관찰한 사실을 먼저 말하기",
  },
  辛: {
    image: "정교하게 다듬은 보석",
    strength: "기준이 높고 완성도를 섬세하게 끌어올리는 힘",
    shadow: "부족한 부분에 시선이 오래 머무는 경향",
    action: "완벽한 답보다 충분히 좋은 다음 단계 정하기",
  },
  壬: {
    image: "넓게 흐르는 큰물",
    strength: "정보와 사람을 연결하고 가능성을 넓게 보는 힘",
    shadow: "선택지가 많아질수록 결정을 미루는 경향",
    action: "선택 기준을 세 개로 줄이고 기한을 정하기",
  },
  癸: {
    image: "조용히 스며드는 비",
    strength: "보이지 않는 감정과 맥락을 포착하는 감수성",
    shadow: "분위기를 읽느라 직접 확인해야 할 것을 추측하는 경향",
    action: "추측과 확인된 사실을 구분해서 기록하기",
  },
};

const ELEMENT_ADVICE: Record<
  ElementName,
  { gift: string; excess: string; restore: string }
> = {
  목: {
    gift: "성장과 시작",
    excess: "계획을 계속 넓히거나 한 방향을 고집하기 쉽습니다",
    restore: "끝낼 일의 우선순위를 먼저 정하세요",
  },
  화: {
    gift: "표현과 추진",
    excess: "감정과 속도가 먼저 앞서기 쉽습니다",
    restore: "결정 전 하루의 간격을 두세요",
  },
  토: {
    gift: "안정과 책임",
    excess: "익숙한 상황을 필요 이상으로 오래 붙들기 쉽습니다",
    restore: "유지해야 하는 이유를 숫자와 사실로 확인하세요",
  },
  금: {
    gift: "판단과 정리",
    excess: "관계나 상황을 너무 빠르게 옳고 그름으로 나누기 쉽습니다",
    restore: "상대의 의도보다 관찰된 행동부터 정리하세요",
  },
  수: {
    gift: "통찰과 유연함",
    excess: "생각이 깊어져 행동 시점을 놓치기 쉽습니다",
    restore: "작게 시험할 수 있는 행동을 오늘 하나 정하세요",
  },
};

const TOPIC_COPY: Record<
  TopicId,
  {
    keyword: string[];
    root: string;
    surroundings: string;
    action: string;
    avoid: string;
    core: string;
  }
> = {
  heart: {
    keyword: ["표현의 온도", "관찰", "경계"],
    root:
      "관계가 불안할 때 상대의 작은 반응을 크게 해석하면서, 직접 확인해야 할 부분까지 추측으로 채우는 흐름이 반복될 수 있습니다.",
    surroundings:
      "상대의 감정은 한 번의 연락보다 반복되는 태도에서 더 정확히 드러납니다. 말의 강도보다 행동의 일관성을 기준으로 보세요.",
    action: "감정을 묻기 전에 내가 필요한 관계의 조건을 한 문장으로 말하기",
    avoid: "답을 빨리 얻기 위해 상대의 침묵이나 단답에 의미를 덧붙이기",
    core: "상대의 마음을 맞히는 것보다, 나를 존중하는 행동이 이어지는지 확인할 때입니다.",
  },
  reunion: {
    keyword: ["원인 분리", "거리 조절", "회복 근거"],
    root:
      "그리움이 클수록 마지막 장면을 반복해서 해석하지만, 재회의 핵심은 감정의 크기보다 헤어진 원인이 실제로 달라졌는지에 있습니다.",
    surroundings:
      "상대의 연락 여부만으로 관계 전체를 판단하기 어렵습니다. 과거 갈등을 다시 만들 조건과 달라진 조건을 구분해야 합니다.",
    action: "연락 전에 같은 갈등이 반복되지 않을 근거 세 가지 확인하기",
    avoid: "불안을 줄이기 위해 사과나 설득을 반복하기",
    core: "재회의 가능성은 그리움이 아니라, 같은 문제가 달라질 수 있는 근거에서 시작됩니다.",
  },
  career: {
    keyword: ["역할 경계", "조건 비교", "준비된 이동"],
    root:
      "퇴사 충동은 단순한 피로보다 노력과 인정의 불균형, 역할의 경계가 흐려진 상태에서 커질 수 있습니다.",
    surroundings:
      "조직의 말보다 실제 권한·보상·업무 범위를 비교해야 합니다. 다음 자리 역시 같은 구조라면 이동만으로 해결되지 않습니다.",
    action: "다음 직장의 필수 조건 세 가지와 포기 가능한 조건 두 가지 정하기",
    avoid: "힘든 하루의 감정으로 퇴사 시점을 확정하기",
    core: "지금 필요한 것은 무작정 버티는 힘이 아니라, 옮겨갈 기준을 선명하게 만드는 일입니다.",
  },
  money: {
    keyword: ["현금 흐름", "반복 수입", "작은 검증"],
    root:
      "돈이 모이지 않는 문제는 소비 하나보다 수입의 변동성과 목적이 섞인 자금 구조에서 커질 수 있습니다.",
    surroundings:
      "큰 기회처럼 보이는 제안보다 반복 가능한 수입인지, 손실 한도가 정해져 있는지를 먼저 확인해야 합니다.",
    action: "생활·안전·성장 자금을 분리하고 반복 수입 한 가지를 작게 검증하기",
    avoid: "불안을 만회하기 위한 큰 투자나 단기간 고수익 선택",
    core: "재물운은 한 번의 큰 선택보다, 실력을 반복 수입으로 바꾸는 구조에서 강해집니다.",
  },
};

function section(
  title: string,
  body: string,
  evidence: string[],
): ReadingSection {
  return { title, body, evidence };
}

function balanceScore(chart: SajuChart) {
  const spread =
    Math.max(...chart.elements.map((item) => item.percentage)) -
    Math.min(...chart.elements.map((item) => item.percentage));
  return Math.max(54, Math.min(86, 82 - Math.round(spread * 0.55)));
}

function activeLuck(chart: SajuChart) {
  return chart.luckPeriods.find((item) => item.active);
}

export function createRuleBasedReport(
  input: BirthInput,
  chart: SajuChart,
): ReadingReport {
  const master = DAY_MASTER[chart.dayMaster.stem] ?? DAY_MASTER.甲;
  const topic = TOPIC_COPY[input.topic];
  const dominant = ELEMENT_ADVICE[chart.dominantElement];
  const weakest = ELEMENT_ADVICE[chart.weakestElement];
  const active = activeLuck(chart);
  const opportunityMonths = chart.monthlyFlow
    .filter((item) => item.tone === "기회")
    .slice(0, 2);
  const cautionMonths = chart.monthlyFlow
    .filter((item) => item.tone === "주의")
    .slice(0, 2);
  const strongest = chart.elements.find(
    (item) => item.element === chart.dominantElement,
  );
  const weakestBalance = chart.elements.find(
    (item) => item.element === chart.weakestElement,
  );
  const score = balanceScore(chart);

  const timing =
    opportunityMonths.length > 0
      ? opportunityMonths
          .map((item) => `${item.year}년 ${item.month}월`)
          .join(" · ")
      : "앞으로 2–3개월의 정비기";

  return {
    score,
    scoreLabel: "오행 균형 참고 지수",
    keywords: Array.from(
      new Set([
        `${chart.dayMaster.element} 일간`,
        ...topic.keyword,
        `${chart.usefulElements.join("·")} 보완`,
      ]),
    ).slice(0, 4),
    timing,
    summary: `${input.name}님은 ${master.image}에 비유되는 ${chart.dayMaster.stem} 일간입니다. ${master.strength}이 강점이며, 현재 고민에서는 ${topic.keyword[0]}을 분명히 하는 일이 중요합니다.`,
    preview: `${topic.root} 원국에서는 ${chart.dominantElement} 기운이 ${strongest?.percentage ?? 0}%로 가장 두드러지고 ${chart.weakestElement} 기운이 ${weakestBalance?.percentage ?? 0}%로 낮게 나타나, ${dominant.excess}는 패턴을 점검할 필요가 있습니다.`,
    sections: {
      nature: section(
        "타고난 성향",
        `${master.image}에 비유되는 사람으로, ${master.strength}이 두드러집니다. 다만 압박이 커지면 ${master.shadow}이 나타날 수 있습니다. ${dominant.gift}의 힘을 잘 쓰되, ${dominant.restore}`,
        [
          `일간 ${chart.dayMaster.stem}(${chart.dayMaster.yinYang}${chart.dayMaster.element})`,
          `가장 강한 오행 ${chart.dominantElement} ${strongest?.percentage ?? 0}%`,
        ],
      ),
      rootCause: section(
        "현재 고민의 근본 원인",
        `${topic.root} 입력한 고민에서 중요한 것은 사건 하나보다 반복되는 대응 방식입니다. ${master.shadow}이 현재 상황과 겹치는지 먼저 확인해 보세요.`,
        [
          `고민 분야: ${input.topic}`,
          `월주 ${chart.pillars[1].ganZhi} · ${chart.pillars[1].tenGodStem}`,
        ],
      ),
      surroundings: section(
        "상대 또는 주변 상황",
        `${topic.surroundings} 현재 ${chart.currentYear.ganZhi}년의 흐름은 원국과 별개로 환경 변화를 키우므로, 상대나 조직의 실제 행동을 기록해 판단하는 편이 안전합니다.`,
        [
          `현재 세운 ${chart.currentYear.ganZhi}`,
          active
            ? `현재 대운 ${active.ganZhi} (${active.startYear}–${active.endYear})`
            : "현재 대운 경계 구간",
        ],
      ),
      outlook: section(
        "앞으로 6개월의 흐름",
        `앞으로 6개월은 한 번의 결론보다 월별 기복을 확인하는 편이 좋습니다. ${opportunityMonths[0] ? `${opportunityMonths[0].year}년 ${opportunityMonths[0].month}월은 준비한 행동을 작게 실행하기 좋고,` : ""} ${cautionMonths[0] ? `${cautionMonths[0].year}년 ${cautionMonths[0].month}월은 확답을 서두르지 않는 편이 좋습니다.` : "큰 확장보다 기준을 다듬는 데 유리합니다."}`,
        chart.monthlyFlow.map(
          (item) =>
            `${item.year}.${item.month} ${item.ganZhi} · ${item.tone} ${item.score}`,
        ),
      ),
      opportunity: section(
        "기회가 강한 시기",
        opportunityMonths.length
          ? `${timing}에는 ${chart.usefulElements.join("·")} 기운이 보완되어, ${topic.action}을 실행하기 좋습니다. 결과를 단정하기보다 작은 행동 후 반응을 확인하세요.`
          : `이번 6개월은 확장보다 기반을 정비하는 시기입니다. ${topic.action}부터 시작하세요.`,
        opportunityMonths.map(
          (item) => `${item.ganZhi}월 · ${item.element} 기운`,
        ),
      ),
      caution: section(
        "주의해야 할 시기",
        cautionMonths.length
          ? `${cautionMonths.map((item) => `${item.year}년 ${item.month}월`).join(" · ")}에는 외부 압박이 커질 수 있습니다. ${topic.avoid}는 피하고 확인된 사실을 기준으로 결정하세요.`
          : `${chart.dominantElement} 기운이 과해질 때 ${dominant.excess} ${topic.avoid}는 피하는 편이 좋습니다.`,
        cautionMonths.map(
          (item) => `${item.ganZhi}월 · 압박 지수 ${item.score}`,
        ),
      ),
    },
    actions: [
      topic.action,
      master.action,
      `${chart.weakestElement} 기운을 보완하는 생활 리듬 만들기: ${weakest.restore}`,
    ],
    avoid: [
      topic.avoid,
      "하루의 기분만으로 관계·퇴사·투자 결정을 확정하기",
      "사주 결과를 의료·법률·투자 판단의 유일한 근거로 사용하기",
    ],
    coreMessage: topic.core,
    disclaimer:
      "이 결과는 전통 명리학의 상징 체계를 바탕으로 한 참고 해석이며 미래를 확정하지 않습니다. 중요한 결정은 현실 정보와 전문가의 조언을 함께 확인하세요.",
  };
}

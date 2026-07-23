import { Lunar, Solar } from "lunar-typescript";
import type {
  BirthInput,
  ElementBalance,
  ElementName,
  LuckPeriod,
  MonthlyFlow,
  PillarDetail,
  SajuChart,
} from "./types";

const STEM_ELEMENT: Record<string, ElementName> = {
  甲: "목",
  乙: "목",
  丙: "화",
  丁: "화",
  戊: "토",
  己: "토",
  庚: "금",
  辛: "금",
  壬: "수",
  癸: "수",
};

const BRANCH_ELEMENT: Record<string, ElementName> = {
  寅: "목",
  卯: "목",
  巳: "화",
  午: "화",
  辰: "토",
  戌: "토",
  丑: "토",
  未: "토",
  申: "금",
  酉: "금",
  亥: "수",
  子: "수",
};

const ELEMENT_FROM_HANJA: Record<string, ElementName> = {
  木: "목",
  火: "화",
  土: "토",
  金: "금",
  水: "수",
};

const ELEMENTS: ElementName[] = ["목", "화", "토", "금", "수"];
const PRODUCES: Record<ElementName, ElementName> = {
  목: "화",
  화: "토",
  토: "금",
  금: "수",
  수: "목",
};
const CONTROLS: Record<ElementName, ElementName> = {
  목: "토",
  화: "금",
  토: "수",
  금: "목",
  수: "화",
};

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) throw new Error("생년월일을 확인해 주세요.");
  return { year, month, day };
}

function parseTime(value: string | null) {
  if (!value) return { hour: 12, minute: 0, unknown: true };
  const [hour, minute] = value.split(":").map(Number);
  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error("출생 시간을 확인해 주세요.");
  }
  return { hour, minute, unknown: false };
}

function normalizeBirth(input: BirthInput) {
  const { year, month, day } = parseDate(input.birthDate);
  const { hour, minute, unknown } = parseTime(input.birthTime);

  if (year < 1900 || year > new Date().getFullYear()) {
    throw new Error("지원하는 출생연도는 1900년부터 현재까지입니다.");
  }

  let solar: Solar;
  let lunar: Lunar;
  if (input.calendar === "lunar") {
    const lunarMonth = input.isLeapMonth ? -month : month;
    lunar = Lunar.fromYmdHms(year, lunarMonth, day, hour, minute, 0);
    solar = lunar.getSolar();
  } else {
    solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
    if (solar.toYmd() !== input.birthDate) {
      throw new Error("존재하지 않는 생년월일입니다.");
    }
    lunar = solar.getLunar();
  }
  return { solar, lunar, unknown };
}

function elementOfStem(stem: string): ElementName {
  const value = STEM_ELEMENT[stem];
  if (!value) throw new Error(`알 수 없는 천간입니다: ${stem}`);
  return value;
}

function elementOfBranch(branch: string): ElementName {
  const value = BRANCH_ELEMENT[branch];
  if (!value) throw new Error(`알 수 없는 지지입니다: ${branch}`);
  return value;
}

function pillar(
  key: PillarDetail["key"],
  label: string,
  values: {
    ganZhi: string;
    stem: string;
    branch: string;
    hidden: string[];
    tenGodStem: string;
    tenGodBranch: string[];
    stage: string;
    naYin: string;
  },
  estimated = false,
): PillarDetail {
  return {
    key,
    label,
    ganZhi: values.ganZhi,
    stem: values.stem,
    branch: values.branch,
    stemElement: elementOfStem(values.stem),
    branchElement: elementOfBranch(values.branch),
    hiddenStems: values.hidden,
    tenGodStem: values.tenGodStem,
    tenGodBranch: values.tenGodBranch,
    twelveStage: values.stage,
    naYin: values.naYin,
    estimated,
  };
}

function buildPillars(lunar: Lunar, unknownTime: boolean): PillarDetail[] {
  const eight = lunar.getEightChar();
  return [
    pillar("year", "연주", {
      ganZhi: eight.getYear(),
      stem: eight.getYearGan(),
      branch: eight.getYearZhi(),
      hidden: eight.getYearHideGan(),
      tenGodStem: eight.getYearShiShenGan(),
      tenGodBranch: eight.getYearShiShenZhi(),
      stage: eight.getYearDiShi(),
      naYin: eight.getYearNaYin(),
    }),
    pillar("month", "월주", {
      ganZhi: eight.getMonth(),
      stem: eight.getMonthGan(),
      branch: eight.getMonthZhi(),
      hidden: eight.getMonthHideGan(),
      tenGodStem: eight.getMonthShiShenGan(),
      tenGodBranch: eight.getMonthShiShenZhi(),
      stage: eight.getMonthDiShi(),
      naYin: eight.getMonthNaYin(),
    }),
    pillar("day", "일주", {
      ganZhi: eight.getDay(),
      stem: eight.getDayGan(),
      branch: eight.getDayZhi(),
      hidden: eight.getDayHideGan(),
      tenGodStem: "일간",
      tenGodBranch: eight.getDayShiShenZhi(),
      stage: eight.getDayDiShi(),
      naYin: eight.getDayNaYin(),
    }),
    pillar(
      "time",
      "시주",
      {
        ganZhi: unknownTime ? "미상" : eight.getTime(),
        stem: eight.getTimeGan(),
        branch: eight.getTimeZhi(),
        hidden: unknownTime ? [] : eight.getTimeHideGan(),
        tenGodStem: unknownTime ? "미상" : eight.getTimeShiShenGan(),
        tenGodBranch: unknownTime ? [] : eight.getTimeShiShenZhi(),
        stage: unknownTime ? "미상" : eight.getTimeDiShi(),
        naYin: unknownTime ? "미상" : eight.getTimeNaYin(),
      },
      unknownTime,
    ),
  ];
}

function calculateElements(
  pillars: PillarDetail[],
  unknownTime: boolean,
): ElementBalance[] {
  const weights: Record<ElementName, number> = {
    목: 0,
    화: 0,
    토: 0,
    금: 0,
    수: 0,
  };
  const active = unknownTime
    ? pillars.filter((item) => item.key !== "time")
    : pillars;

  for (const item of active) {
    weights[item.stemElement] += 1;
    weights[item.branchElement] += 1;
    item.hiddenStems.forEach((stem, index) => {
      weights[elementOfStem(stem)] += [0.6, 0.3, 0.1][index] ?? 0.1;
    });
  }

  const month = pillars.find((item) => item.key === "month");
  if (month) weights[month.branchElement] += 1.5;

  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  return ELEMENTS.map((element) => {
    const percentage = Math.round((weights[element] / total) * 100);
    return {
      element,
      value: Number(weights[element].toFixed(2)),
      percentage,
      level: percentage >= 28 ? "강함" : percentage <= 12 ? "약함" : "보통",
    };
  });
}

function calculateUsefulElements(
  dayElement: ElementName,
  balances: ElementBalance[],
): ElementName[] {
  const sorted = [...balances].sort((a, b) => a.percentage - b.percentage);
  const producesDay = ELEMENTS.find((element) => PRODUCES[element] === dayElement);
  return Array.from(
    new Set(
      [producesDay, dayElement, sorted[0].element].filter(
        (value): value is ElementName => Boolean(value),
      ),
    ),
  ).slice(0, 2);
}

function relationScore(day: ElementName, incoming: ElementName) {
  if (incoming === day) return 8;
  if (PRODUCES[incoming] === day) return 10;
  if (PRODUCES[day] === incoming) return 4;
  if (CONTROLS[day] === incoming) return 2;
  if (CONTROLS[incoming] === day) return -6;
  return 0;
}

function monthlyGuidance(
  tone: MonthlyFlow["tone"],
  element: ElementName,
): string {
  if (tone === "기회") {
    return `${element} 기운이 일간을 돕는 달입니다. 준비한 일을 작게 공개하고 반응을 확인하기 좋습니다.`;
  }
  if (tone === "주의") {
    return `${element} 기운의 압박이 커질 수 있습니다. 중요한 결정은 조건을 문서로 확인한 뒤 진행하세요.`;
  }
  return `${element} 기운을 정리와 점검에 쓰기 좋습니다. 새로운 확장보다 기준을 다듬는 편이 유리합니다.`;
}

function buildMonthlyFlow(dayElement: ElementName, baseDate = new Date()) {
  const flows: MonthlyFlow[] = [];
  for (let offset = 0; offset < 6; offset += 1) {
    const date = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth() + offset,
      15,
      12,
    );
    const lunar = Solar.fromYmdHms(
      date.getFullYear(),
      date.getMonth() + 1,
      15,
      12,
      0,
      0,
    ).getLunar();
    const ganZhi = lunar.getMonthInGanZhiExact();
    const element = elementOfStem(ganZhi[0]);
    const raw = 65 + relationScore(dayElement, element);
    const score = Math.max(45, Math.min(88, raw));
    const tone: MonthlyFlow["tone"] =
      score >= 72 ? "기회" : score <= 60 ? "주의" : "정비";
    flows.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      ganZhi,
      element,
      score,
      tone,
      guidance: monthlyGuidance(tone, element),
    });
  }
  return flows;
}

function buildLuckPeriods(
  lunar: Lunar,
  gender: BirthInput["gender"],
  birthYear: number,
): { periods: LuckPeriod[]; start: string } {
  const eight = lunar.getEightChar();
  const genderCode = gender === "male" ? 1 : 0;
  const yun = eight.getYun(genderCode, 1);
  const currentYear = new Date().getFullYear();
  const periods = yun
    .getDaYun(10)
    .filter((item) => item.getIndex() > 0)
    .map((item) => ({
      ganZhi: item.getGanZhi(),
      startYear: item.getStartYear(),
      endYear: item.getEndYear(),
      startAge: item.getStartAge(),
      endAge: item.getEndAge(),
      active:
        currentYear >= item.getStartYear() &&
        currentYear <= item.getEndYear(),
    }));

  return {
    periods,
    start: `${yun.getStartYear()}년 ${yun.getStartMonth()}개월 ${yun.getStartDay()}일경 시작(만 ${Math.max(0, (periods[0]?.startYear ?? birthYear) - birthYear)}세 전후)`,
  };
}

export function calculateSaju(input: BirthInput): SajuChart {
  const { solar, lunar, unknown } = normalizeBirth(input);
  const pillars = buildPillars(lunar, unknown);
  const elements = calculateElements(pillars, unknown);
  const dayPillar = pillars.find((item) => item.key === "day");
  if (!dayPillar) throw new Error("일주를 계산하지 못했습니다.");
  const dayMaster = dayPillar.stem;
  const dayElement = elementOfStem(dayMaster);
  const dominant = [...elements].sort(
    (a, b) => b.percentage - a.percentage,
  )[0].element;
  const weakest = [...elements].sort(
    (a, b) => a.percentage - b.percentage,
  )[0].element;
  const usefulElements = calculateUsefulElements(dayElement, elements);
  const birthYear = solar.getYear();
  const luck = buildLuckPeriods(lunar, input.gender, birthYear);
  const now = new Date();
  const currentLunar = Solar.fromYmdHms(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    12,
    0,
    0,
  ).getLunar();

  return {
    solarDateTime: solar.toYmdHms(),
    lunarDate: `${lunar.getYearInChinese()}년 ${lunar.getMonthInChinese()}월 ${lunar.getDayInChinese()}`,
    zodiac: lunar.getYearShengXiaoExact(),
    dayMaster: {
      stem: dayMaster,
      element: dayElement,
      yinYang: "甲丙戊庚壬".includes(dayMaster) ? "양" : "음",
    },
    pillars,
    elements,
    dominantElement: dominant,
    weakestElement: weakest,
    usefulElements,
    currentYear: {
      year: now.getFullYear(),
      ganZhi: currentLunar.getYearInGanZhiExact(),
    },
    luckStart: luck.start,
    luckPeriods: luck.periods,
    monthlyFlow: buildMonthlyFlow(dayElement, now),
    timeAccuracy: unknown ? "unknown" : "exact",
    calculationNotes: [
      "연주와 월주는 입춘·절기 기준의 정확한 간지를 사용합니다.",
      "오행 비율은 천간·지지·지장간과 월지 가중치를 합산한 명운서재의 해석 지표입니다.",
      unknown
        ? "출생 시간이 없어 시주는 분석에서 제외했으며, 대운 시작 시점은 오차가 있을 수 있습니다."
        : "입력한 출생 시각을 기준으로 시주를 계산했습니다.",
      "출생지는 현재 표준시 확인용으로만 저장되며 진태양시 보정은 적용하지 않습니다.",
    ],
  };
}

export function getElementRelation(
  from: ElementName,
  to: ElementName,
): "same" | "produce" | "control" | "producedBy" | "controlledBy" {
  if (from === to) return "same";
  if (PRODUCES[from] === to) return "produce";
  if (CONTROLS[from] === to) return "control";
  if (PRODUCES[to] === from) return "producedBy";
  return "controlledBy";
}

export function elementFromHanja(value: string): ElementName {
  const result = ELEMENT_FROM_HANJA[value];
  if (!result) throw new Error(`알 수 없는 오행입니다: ${value}`);
  return result;
}

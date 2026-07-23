export type Gender = "female" | "male" | "other";
export type CalendarType = "solar" | "lunar";
export type TopicId = "heart" | "reunion" | "career" | "money";
export type ElementName = "목" | "화" | "토" | "금" | "수";

export interface BirthInput {
  name: string;
  gender: Gender;
  calendar: CalendarType;
  isLeapMonth?: boolean;
  birthDate: string;
  birthTime: string | null;
  birthPlace: string;
  concern: string;
  topic: TopicId;
}

export interface PillarDetail {
  key: "year" | "month" | "day" | "time";
  label: string;
  ganZhi: string;
  stem: string;
  branch: string;
  stemElement: ElementName;
  branchElement: ElementName;
  hiddenStems: string[];
  tenGodStem: string;
  tenGodBranch: string[];
  twelveStage: string;
  naYin: string;
  estimated?: boolean;
}

export interface ElementBalance {
  element: ElementName;
  value: number;
  percentage: number;
  level: "강함" | "보통" | "약함";
}

export interface LuckPeriod {
  ganZhi: string;
  startYear: number;
  endYear: number;
  startAge: number;
  endAge: number;
  active: boolean;
}

export interface MonthlyFlow {
  year: number;
  month: number;
  ganZhi: string;
  element: ElementName;
  score: number;
  tone: "기회" | "정비" | "주의";
  guidance: string;
}

export interface SajuChart {
  solarDateTime: string;
  lunarDate: string;
  zodiac: string;
  dayMaster: {
    stem: string;
    element: ElementName;
    yinYang: "양" | "음";
  };
  pillars: PillarDetail[];
  elements: ElementBalance[];
  dominantElement: ElementName;
  weakestElement: ElementName;
  usefulElements: ElementName[];
  currentYear: {
    year: number;
    ganZhi: string;
  };
  luckStart: string;
  luckPeriods: LuckPeriod[];
  monthlyFlow: MonthlyFlow[];
  timeAccuracy: "exact" | "unknown";
  calculationNotes: string[];
}

export interface ReadingSection {
  title: string;
  body: string;
  evidence: string[];
}

export interface ReadingReport {
  score: number;
  scoreLabel: string;
  keywords: string[];
  timing: string;
  summary: string;
  preview: string;
  sections: {
    nature: ReadingSection;
    rootCause: ReadingSection;
    surroundings: ReadingSection;
    outlook: ReadingSection;
    opportunity: ReadingSection;
    caution: ReadingSection;
  };
  actions: string[];
  avoid: string[];
  coreMessage: string;
  disclaimer: string;
}

export interface ReadingResponse {
  chart: SajuChart;
  report: ReadingReport;
  generatedAt: string;
  interpretationSource: "rule-engine" | "openai-assisted";
  model?: string;
}

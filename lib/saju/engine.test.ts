import { describe, expect, it } from "vitest";
import { calculateSaju } from "./engine";
import { createRuleBasedReport } from "./interpretation";
import type { BirthInput } from "./types";

const baseInput: BirthInput = {
  name: "테스트",
  gender: "female",
  calendar: "solar",
  birthDate: "1990-05-17",
  birthTime: "14:30",
  birthPlace: "서울",
  concern: "현재 직장에서 계속 일해야 할지 이직을 준비해야 할지 고민입니다.",
  topic: "career",
};

describe("calculateSaju", () => {
  it("절기 기준 네 기둥과 오행 합계, 대운을 계산한다", () => {
    const chart = calculateSaju(baseInput);
    expect(chart.pillars).toHaveLength(4);
    expect(chart.pillars.every((pillar) => pillar.ganZhi.length >= 2)).toBe(
      true,
    );
    expect(
      chart.elements.reduce((sum, item) => sum + item.percentage, 0),
    ).toBeGreaterThanOrEqual(98);
    expect(chart.luckPeriods.length).toBeGreaterThan(5);
    expect(chart.monthlyFlow).toHaveLength(6);
  });

  it("출생시간 미상일 때 시주를 분석에서 제외한다", () => {
    const chart = calculateSaju({ ...baseInput, birthTime: null });
    expect(chart.timeAccuracy).toBe("unknown");
    expect(chart.pillars[3].ganZhi).toBe("미상");
    expect(chart.calculationNotes.join(" ")).toContain("시주는 분석에서 제외");
  });

  it("음력 입력을 양력으로 변환한다", () => {
    const chart = calculateSaju({
      ...baseInput,
      calendar: "lunar",
      birthDate: "1990-04-23",
    });
    expect(chart.solarDateTime.startsWith("1990-05")).toBe(true);
  });
});

describe("createRuleBasedReport", () => {
  it("원국 근거가 붙은 6개 분석 섹션을 만든다", () => {
    const chart = calculateSaju(baseInput);
    const report = createRuleBasedReport(baseInput, chart);
    expect(Object.keys(report.sections)).toHaveLength(6);
    expect(report.sections.nature.evidence.length).toBeGreaterThan(0);
    expect(report.actions).toHaveLength(3);
    expect(report.disclaimer).toContain("미래를 확정하지 않습니다");
  });
});

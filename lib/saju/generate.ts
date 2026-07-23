import type { BirthInput, ReadingResponse } from "./types";
import { enhanceReportWithOpenAI } from "./ai";
import { calculateSaju } from "./engine";
import { createRuleBasedReport } from "./interpretation";

export function generatePreview(input: BirthInput) {
  const chart = calculateSaju(input);
  const report = createRuleBasedReport(input, chart);

  return {
    chart,
    preview: {
      score: report.score,
      scoreLabel: report.scoreLabel,
      keywords: report.keywords,
      summary: report.summary,
      preview: report.preview,
      nature: report.sections.nature,
      coreMessage: report.coreMessage,
    },
    generatedAt: new Date().toISOString(),
    interpretationSource: "rule-engine" as const,
  };
}

export async function generateFullReading(
  input: BirthInput,
  options: { enhanceWithAI?: boolean } = {},
): Promise<ReadingResponse> {
  const chart = calculateSaju(input);
  const fallback = createRuleBasedReport(input, chart);

  let enhanced: Awaited<ReturnType<typeof enhanceReportWithOpenAI>>;
  try {
    if (options.enhanceWithAI === false) {
      enhanced = { report: fallback };
    } else {
      enhanced = await enhanceReportWithOpenAI({ input, chart, fallback });
    }
  } catch (error) {
    console.error("AI enhancement failed; using rule engine.", error);
    enhanced = { report: fallback };
  }

  return {
    chart,
    report: enhanced.report,
    generatedAt: new Date().toISOString(),
    interpretationSource: enhanced.model ? "openai-assisted" : "rule-engine",
    model: enhanced.model,
  };
}

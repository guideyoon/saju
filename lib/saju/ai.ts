import { createHash } from "node:crypto";
import { z } from "zod";
import type {
  BirthInput,
  ReadingReport,
  SajuChart,
} from "./types";

const sectionSchema = z.object({
  title: z.string(),
  body: z.string().min(80).max(900),
  evidence: z.array(z.string()).min(1).max(5),
});

const reportSchema = z.object({
  score: z.number().int().min(0).max(100),
  scoreLabel: z.string(),
  keywords: z.array(z.string()).min(3).max(5),
  timing: z.string(),
  summary: z.string().min(80).max(700),
  preview: z.string().min(80).max(700),
  sections: z.object({
    nature: sectionSchema,
    rootCause: sectionSchema,
    surroundings: sectionSchema,
    outlook: sectionSchema,
    opportunity: sectionSchema,
    caution: sectionSchema,
  }),
  actions: z.array(z.string()).min(3).max(5),
  avoid: z.array(z.string()).min(3).max(5),
  coreMessage: z.string().min(20).max(180),
  disclaimer: z.string().min(20).max(300),
});

function reportJsonSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: [
      "score",
      "scoreLabel",
      "keywords",
      "timing",
      "summary",
      "preview",
      "sections",
      "actions",
      "avoid",
      "coreMessage",
      "disclaimer",
    ],
    properties: {
      score: { type: "integer", minimum: 0, maximum: 100 },
      scoreLabel: { type: "string" },
      keywords: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
      timing: { type: "string" },
      summary: { type: "string" },
      preview: { type: "string" },
      sections: {
        type: "object",
        additionalProperties: false,
        required: [
          "nature",
          "rootCause",
          "surroundings",
          "outlook",
          "opportunity",
          "caution",
        ],
        properties: Object.fromEntries(
          [
            "nature",
            "rootCause",
            "surroundings",
            "outlook",
            "opportunity",
            "caution",
          ].map((key) => [
            key,
            {
              type: "object",
              additionalProperties: false,
              required: ["title", "body", "evidence"],
              properties: {
                title: { type: "string" },
                body: { type: "string" },
                evidence: {
                  type: "array",
                  minItems: 1,
                  maxItems: 5,
                  items: { type: "string" },
                },
              },
            },
          ]),
        ),
      },
      actions: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
      avoid: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: { type: "string" },
      },
      coreMessage: { type: "string" },
      disclaimer: { type: "string" },
    },
  };
}

export async function enhanceReportWithOpenAI({
  input,
  chart,
  fallback,
}: {
  input: BirthInput;
  chart: SajuChart;
  fallback: ReadingReport;
}): Promise<{ report: ReadingReport; model?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { report: fallback };

  const model = process.env.OPENAI_MODEL || "gpt-5.6-terra";
  const safetyIdentifier = createHash("sha256")
    .update(`${input.name}:${input.birthDate}`)
    .digest("hex")
    .slice(0, 32);

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      safety_identifier: safetyIdentifier,
      reasoning: { effort: "low" },
      text: {
        verbosity: "medium",
        format: {
          type: "json_schema",
          name: "myeongun_saju_report",
          strict: true,
          schema: reportJsonSchema(),
        },
      },
      instructions: [
        "당신은 명운서재의 한국어 명리 해석 편집자입니다.",
        "계산은 하지 말고 제공된 chart의 구조화된 사실만 사용하세요.",
        "미래를 단정하거나 재회, 합격, 수익, 질병을 확정하지 마세요.",
        "각 핵심 판단에는 chart에서 확인되는 evidence를 붙이세요.",
        "사용자의 고민을 구체적으로 반영하되 공포·결제 압박 표현은 금지합니다.",
        "의료, 법률, 투자 판단은 전문가와 현실 정보를 함께 확인하도록 안내하세요.",
      ].join("\n"),
      input: JSON.stringify({
        userConcern: input.concern,
        topic: input.topic,
        chart,
        baselineReport: fallback,
      }),
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const payload = (await response.json()) as {
    output_text?: string;
  };
  if (!payload.output_text) {
    throw new Error("OpenAI 응답에 구조화된 결과가 없습니다.");
  }

  const parsed = reportSchema.safeParse(JSON.parse(payload.output_text));
  if (!parsed.success) {
    throw new Error("OpenAI 결과가 서비스 스키마와 일치하지 않습니다.");
  }
  return { report: parsed.data, model };
}

import { z } from "zod";

export const birthInputSchema = z.object({
  name: z.string().trim().min(1, "이름 또는 닉네임을 입력해 주세요.").max(30),
  gender: z.enum(["female", "male", "other"]),
  calendar: z.enum(["solar", "lunar"]),
  isLeapMonth: z.boolean().optional().default(false),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "생년월일 형식을 확인해 주세요."),
  birthTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .nullable(),
  birthPlace: z.string().trim().min(1).max(60),
  concern: z.string().trim().min(10, "고민을 10자 이상 적어 주세요.").max(500),
  topic: z.enum(["heart", "reunion", "career", "money"]),
});

export type BirthInputPayload = z.infer<typeof birthInputSchema>;

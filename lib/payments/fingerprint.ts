import { createHash } from "node:crypto";
import type { BirthInput } from "../saju/types";

export function readingFingerprint(input: BirthInput) {
  const canonical = JSON.stringify({
    name: input.name,
    gender: input.gender,
    calendar: input.calendar,
    isLeapMonth: Boolean(input.isLeapMonth),
    birthDate: input.birthDate,
    birthTime: input.birthTime,
    birthPlace: input.birthPlace,
    concern: input.concern,
    topic: input.topic,
  });
  return createHash("sha256").update(canonical).digest("hex");
}

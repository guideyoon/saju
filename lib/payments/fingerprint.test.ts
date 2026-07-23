import { describe, expect, it } from "vitest";
import { readingFingerprint } from "./fingerprint";

const input = {
  name: "홍길동",
  gender: "male" as const,
  calendar: "solar" as const,
  isLeapMonth: false,
  birthDate: "1990-05-20",
  birthTime: "14:30",
  birthPlace: "서울",
  concern: "앞으로의 직업 방향과 시기를 구체적으로 알고 싶습니다.",
  topic: "career" as const,
};

describe("reading fingerprint", () => {
  it("is stable for the same paid reading input", () => {
    expect(readingFingerprint(input)).toBe(readingFingerprint({ ...input }));
  });

  it("changes when a paid reading field changes", () => {
    expect(readingFingerprint(input)).not.toBe(
      readingFingerprint({ ...input, concern: "다른 고민에 대한 해석을 받고 싶습니다." }),
    );
  });
});

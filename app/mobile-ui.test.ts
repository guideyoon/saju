import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");
const styles = readFileSync(new URL("./globals.css", import.meta.url), "utf8");

describe("mobile interaction safeguards", () => {
  it("exposes and closes the responsive navigation accessibly", () => {
    expect(page).toContain("setMenuOpen(false);");
    expect(page).toContain("aria-expanded={menuOpen}");
    expect(page).toContain('aria-controls="primary-navigation"');
    expect(styles).toMatch(
      /\.nav > a, \.nav > button\s*\{[\s\S]*?min-height: 48px/,
    );
  });

  it("keeps result content readable at narrow widths", () => {
    expect(styles).toMatch(/\.keyword-row\s*\{[\s\S]*?flex-wrap: wrap/);
    expect(styles).toMatch(
      /@media \(max-width: 600px\)[\s\S]*?\.pillars-grid\s*\{\s*grid-template-columns: repeat\(2, 1fr\)/,
    );
  });

  it("keeps the review dialog reachable and keyboard accessible", () => {
    expect(page).toContain('role="dialog"');
    expect(page).toContain('aria-modal="true"');
    expect(page).toContain('event.key === "Escape"');
    expect(styles).toMatch(/\.review-modal\s*\{[\s\S]*?max-height:[^;}]+/);
    expect(styles).toMatch(/\.review-modal\s*\{[\s\S]*?overflow-y: auto/);
  });

  it("respects reduced-motion preferences", () => {
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
  });
});

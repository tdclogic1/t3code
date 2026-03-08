import { describe, expect, it } from "vitest";

import { HIGHEST_RATED_SKILLS, RATED_LIVE_SKILLS, analyzeSkill } from "./skillAnalysis";
import { SALES_SKILL_CATALOG } from "./salesSkillCatalog";

describe("analyzeSkill", () => {
  it("returns bounded scores for a skill", () => {
    const analysis = analyzeSkill(SALES_SKILL_CATALOG[0]!);

    expect(analysis.usefulnessScore).toBeGreaterThanOrEqual(1);
    expect(analysis.usefulnessScore).toBeLessThanOrEqual(5);
    expect(analysis.complexityScore).toBeGreaterThanOrEqual(1);
    expect(analysis.complexityScore).toBeLessThanOrEqual(5);
    expect(analysis.specificityScore).toBeGreaterThanOrEqual(1);
    expect(analysis.specificityScore).toBeLessThanOrEqual(5);
    expect(analysis.generalityScore).toBeGreaterThanOrEqual(1);
    expect(analysis.generalityScore).toBeLessThanOrEqual(5);
    expect(analysis.overallScore).toBeGreaterThanOrEqual(1);
    expect(analysis.overallScore).toBeLessThanOrEqual(5);
  });

  it("produces a ranked cross-category list", () => {
    expect(RATED_LIVE_SKILLS.length).toBeGreaterThan(100);
    expect(HIGHEST_RATED_SKILLS).toHaveLength(24);
    expect(HIGHEST_RATED_SKILLS[0]!.analysis.overallScore).toBeGreaterThanOrEqual(
      HIGHEST_RATED_SKILLS.at(-1)!.analysis.overallScore,
    );
  });
});

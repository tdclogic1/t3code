import { describe, expect, it } from "vitest";

import { IT_SKILL_CATALOG, IT_SKILL_CATEGORIES, IT_SKILL_TOTAL } from "./itSkillCatalog";

describe("IT_SKILL_CATALOG", () => {
  it("contains 20 uniquely identifiable IT skills", () => {
    expect(IT_SKILL_TOTAL).toBe(20);
    expect(IT_SKILL_CATALOG).toHaveLength(20);
    expect(new Set(IT_SKILL_CATALOG.map((skill) => skill.id)).size).toBe(20);
    expect(new Set(IT_SKILL_CATALOG.map((skill) => skill.slug)).size).toBe(20);
  });

  it("covers all IT categories with complete specs", () => {
    expect(IT_SKILL_CATEGORIES).toHaveLength(5);
    expect(
      IT_SKILL_CATALOG.every(
        (skill) => skill.spec.workflow.length >= 4 && skill.spec.inputs.length >= 4,
      ),
    ).toBe(true);
  });
});

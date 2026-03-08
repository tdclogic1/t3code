import { describe, expect, it } from "vitest";

import {
  SALES_SKILL_CATALOG,
  SALES_SKILL_CATEGORIES,
  SALES_SKILL_TOTAL,
} from "./salesSkillCatalog";

describe("SALES_SKILL_CATALOG", () => {
  it("contains 100 uniquely identifiable sales skills", () => {
    expect(SALES_SKILL_TOTAL).toBe(100);
    expect(SALES_SKILL_CATALOG).toHaveLength(100);
    expect(new Set(SALES_SKILL_CATALOG.map((skill) => skill.id)).size).toBe(100);
    expect(new Set(SALES_SKILL_CATALOG.map((skill) => skill.slug)).size).toBe(100);
  });

  it("covers the expected sales workflow categories", () => {
    expect(SALES_SKILL_CATEGORIES).toHaveLength(10);
    expect(SALES_SKILL_CATALOG.every((skill) => skill.spec.inputs.length >= 4)).toBe(true);
    expect(SALES_SKILL_CATALOG.every((skill) => skill.spec.workflow.length >= 4)).toBe(true);
  });
});

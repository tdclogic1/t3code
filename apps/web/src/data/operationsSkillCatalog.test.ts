import { describe, expect, it } from "vitest";

import {
  OPERATIONS_SKILL_CATALOG,
  OPERATIONS_SKILL_CATEGORIES,
  OPERATIONS_SKILL_TOTAL,
} from "./operationsSkillCatalog";

describe("OPERATIONS_SKILL_CATALOG", () => {
  it("contains a substantial operations library with unique ids and slugs", () => {
    expect(OPERATIONS_SKILL_TOTAL).toBe(40);
    expect(new Set(OPERATIONS_SKILL_CATALOG.map((skill) => skill.id)).size).toBe(40);
    expect(new Set(OPERATIONS_SKILL_CATALOG.map((skill) => skill.slug)).size).toBe(40);
  });

  it("covers the expected operating lanes", () => {
    expect(OPERATIONS_SKILL_CATEGORIES).toHaveLength(5);
    expect(
      OPERATIONS_SKILL_CATALOG.every(
        (skill) => skill.spec.workflow.length >= 4 && skill.spec.inputs.length >= 4,
      ),
    ).toBe(true);
  });
});

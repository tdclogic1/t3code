import { describe, expect, it } from "vitest";

import {
  ACCOUNTING_FINANCE_SKILL_CATALOG,
  ACCOUNTING_FINANCE_SKILL_CATEGORIES,
  ACCOUNTING_FINANCE_SKILL_TOTAL,
} from "./accountingFinanceSkillCatalog";

describe("ACCOUNTING_FINANCE_SKILL_CATALOG", () => {
  it("contains a substantial accounting and finance library with unique ids and slugs", () => {
    expect(ACCOUNTING_FINANCE_SKILL_TOTAL).toBe(40);
    expect(new Set(ACCOUNTING_FINANCE_SKILL_CATALOG.map((skill) => skill.id)).size).toBe(40);
    expect(new Set(ACCOUNTING_FINANCE_SKILL_CATALOG.map((skill) => skill.slug)).size).toBe(40);
  });

  it("covers the expected finance lanes", () => {
    expect(ACCOUNTING_FINANCE_SKILL_CATEGORIES).toHaveLength(5);
    expect(
      ACCOUNTING_FINANCE_SKILL_CATALOG.every(
        (skill) => skill.spec.workflow.length >= 4 && skill.spec.inputs.length >= 4,
      ),
    ).toBe(true);
  });
});

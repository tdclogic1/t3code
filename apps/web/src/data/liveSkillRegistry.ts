import {
  ACCOUNTING_FINANCE_SKILL_CATALOG,
  ACCOUNTING_FINANCE_SKILL_CATEGORIES,
  ACCOUNTING_FINANCE_SKILL_TOTAL,
} from "./accountingFinanceSkillCatalog";
import {
  OPERATIONS_SKILL_CATALOG,
  OPERATIONS_SKILL_CATEGORIES,
  OPERATIONS_SKILL_TOTAL,
} from "./operationsSkillCatalog";
import {
  SALES_SKILL_CATALOG,
  SALES_SKILL_CATEGORIES,
  SALES_SKILL_TOTAL,
} from "./salesSkillCatalog";
import { type FunctionSkillIdea, type FunctionSkillLibrary } from "./functionSkillTypes";

export interface LiveFunctionSkillLibrary extends FunctionSkillLibrary {
  readonly summary: string;
}

export interface RatedSkillReference {
  readonly functionSlug: string;
  readonly functionName: string;
  readonly skillKey: string;
  readonly skill: FunctionSkillIdea;
}

export const LIVE_SKILL_LIBRARIES: Record<string, LiveFunctionSkillLibrary> = {
  sales: {
    functionSlug: "sales",
    functionName: "Sales",
    summary:
      "Revenue generation workflows across prospecting, qualification, forecasting, and account growth.",
    categories: SALES_SKILL_CATEGORIES,
    total: SALES_SKILL_TOTAL,
    skills: SALES_SKILL_CATALOG,
  },
  operations: {
    functionSlug: "operations",
    functionName: "Operations",
    summary:
      "Operational execution workflows across dispatch, staffing, SOP control, service quality, and escalations.",
    categories: OPERATIONS_SKILL_CATEGORIES,
    total: OPERATIONS_SKILL_TOTAL,
    skills: OPERATIONS_SKILL_CATALOG,
  },
  "accounting-finance": {
    functionSlug: "accounting-finance",
    functionName: "Accounting & Finance",
    summary:
      "Finance workflows across receivables, payables, close, treasury, controls, and reporting.",
    categories: ACCOUNTING_FINANCE_SKILL_CATEGORIES,
    total: ACCOUNTING_FINANCE_SKILL_TOTAL,
    skills: ACCOUNTING_FINANCE_SKILL_CATALOG,
  },
};

export const LIVE_FUNCTION_SLUGS = Object.keys(LIVE_SKILL_LIBRARIES);

export function skillKeyFor(functionSlug: string, skill: Pick<FunctionSkillIdea, "slug">): string {
  return `${functionSlug}:${skill.slug}`;
}

export const ALL_LIVE_SKILLS: ReadonlyArray<RatedSkillReference> = LIVE_FUNCTION_SLUGS.flatMap(
  (functionSlug) => {
    const library = LIVE_SKILL_LIBRARIES[functionSlug];
    if (!library) {
      return [];
    }
    return library.skills.map((skill) => ({
      functionSlug,
      functionName: library.functionName,
      skillKey: skillKeyFor(functionSlug, skill),
      skill,
    }));
  },
);

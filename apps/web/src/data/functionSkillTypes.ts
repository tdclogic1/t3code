export type FunctionSkillComplexity = "low" | "medium" | "high";

export interface FunctionSkillSpec {
  readonly problem: string;
  readonly trigger: string;
  readonly primaryUsers: ReadonlyArray<string>;
  readonly inputs: ReadonlyArray<string>;
  readonly workflow: ReadonlyArray<string>;
  readonly outputs: ReadonlyArray<string>;
  readonly integrations: ReadonlyArray<string>;
  readonly automations: ReadonlyArray<string>;
  readonly kpis: ReadonlyArray<string>;
  readonly guardrails: ReadonlyArray<string>;
  readonly complexity: FunctionSkillComplexity;
  readonly estimatedBuildWeeks: number;
  readonly rolloutMotion: string;
}

export interface FunctionSkillIdea<Category extends string = string> {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly category: Category;
  readonly stage: string;
  readonly idealFor: string;
  readonly value: string;
  readonly spec: FunctionSkillSpec;
}

export interface FunctionSkillLibrary<Category extends string = string> {
  readonly functionSlug: string;
  readonly functionName: string;
  readonly categories: ReadonlyArray<Category>;
  readonly total: number;
  readonly skills: ReadonlyArray<FunctionSkillIdea<Category>>;
}

export function createSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function unique(values: ReadonlyArray<string>): ReadonlyArray<string> {
  return Array.from(new Set(values));
}

import { ALL_LIVE_SKILLS } from "./liveSkillRegistry";
import { type FunctionSkillIdea } from "./functionSkillTypes";

export interface SkillAnalysis {
  readonly usefulnessScore: number;
  readonly complexityScore: number;
  readonly specificityScore: number;
  readonly generalityScore: number;
  readonly overallScore: number;
}

const SPECIALIZED_KEYWORDS = [
  "rfp",
  "rfq",
  "dispatch",
  "route",
  "permit",
  "accrual",
  "reconciliation",
  "treasury",
  "covenant",
  "meddicc",
  "redline",
  "intercompany",
  "cash application",
] as const;

function clampScore(value: number): number {
  return Math.max(1, Math.min(5, Math.round(value * 10) / 10));
}

function complexityBase(skill: FunctionSkillIdea): number {
  switch (skill.spec.complexity) {
    case "low":
      return 2;
    case "medium":
      return 3.3;
    case "high":
      return 4.4;
  }
}

export function analyzeSkill(skill: FunctionSkillIdea): SkillAnalysis {
  const weeks = skill.spec.estimatedBuildWeeks;
  const integrationCount = skill.spec.integrations.length;
  const automationCount = skill.spec.automations.length;
  const userCount = skill.spec.primaryUsers.length;

  const complexityScore = clampScore(
    complexityBase(skill) + (weeks >= 6 ? 0.4 : 0) + (integrationCount >= 5 ? 0.3 : 0),
  );

  const usefulnessScore = clampScore(
    2.8 +
      (automationCount >= 3 ? 0.6 : 0.3) +
      (userCount >= 3 ? 0.4 : 0.1) +
      (weeks <= 5 ? 0.5 : 0.2) +
      (skill.spec.kpis.length >= 4 ? 0.3 : 0),
  );

  const searchableText = [
    skill.name,
    skill.category,
    skill.stage,
    skill.idealFor,
    skill.value,
    skill.spec.problem,
  ]
    .join(" ")
    .toLowerCase();
  const specializedHits = SPECIALIZED_KEYWORDS.filter((keyword) =>
    searchableText.includes(keyword),
  ).length;

  const specificityScore = clampScore(
    2.4 +
      (specializedHits > 0 ? 1 : 0) +
      (skill.spec.primaryUsers.length <= 3 ? 0.6 : 0.2) +
      (skill.spec.integrations.length <= 4 ? 0.4 : 0.1),
  );

  const generalityScore = clampScore(6 - specificityScore);
  const overallScore = clampScore(
    usefulnessScore * 0.55 + generalityScore * 0.2 + (6 - complexityScore) * 0.25,
  );

  return {
    usefulnessScore,
    complexityScore,
    specificityScore,
    generalityScore,
    overallScore,
  };
}

export const RATED_LIVE_SKILLS = ALL_LIVE_SKILLS.map((entry) => {
  const analysis = analyzeSkill(entry.skill);
  return {
    functionSlug: entry.functionSlug,
    functionName: entry.functionName,
    skillKey: entry.skillKey,
    skill: entry.skill,
    analysis,
  };
}).toSorted((left, right) => {
  const byOverall = right.analysis.overallScore - left.analysis.overallScore;
  if (byOverall !== 0) {
    return byOverall;
  }
  const byUseful = right.analysis.usefulnessScore - left.analysis.usefulnessScore;
  if (byUseful !== 0) {
    return byUseful;
  }
  return left.skill.name.localeCompare(right.skill.name);
});

export const HIGHEST_RATED_SKILLS = RATED_LIVE_SKILLS.slice(0, 24);

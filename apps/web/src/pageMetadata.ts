export type PageMetadataKey =
  | "chatHome"
  | "chatThread"
  | "settings"
  | "smeApps"
  | "businessSkills"
  | "kpiDashboard";

export interface PageMetadataEntry {
  readonly title: string;
  readonly description: string;
  readonly summary: string;
  readonly topics: ReadonlyArray<string>;
  readonly skills: ReadonlyArray<string>;
  readonly likelyQuestions: ReadonlyArray<string>;
}

export const PAGE_METADATA: Record<PageMetadataKey, PageMetadataEntry> = {
  chatHome: {
    title: "T3 Code | Threads",
    description: "Manage coding threads and projects in T3 Code.",
    summary: "Workspace landing page for selecting projects and chat threads.",
    topics: ["thread management", "project context", "coding sessions"],
    skills: ["project navigation", "session organization", "thread triage"],
    likelyQuestions: [
      "How do I create a new thread?",
      "How do I open a project in T3 Code?",
      "Which thread was updated most recently?",
    ],
  },
  chatThread: {
    title: "T3 Code | Thread",
    description: "Run and review an active coding thread in T3 Code.",
    summary: "Interactive thread view for prompting, streaming responses, and reviewing diffs.",
    topics: ["agent interaction", "diff review", "terminal activity"],
    skills: ["prompting", "reviewing patches", "iterating on code changes"],
    likelyQuestions: [
      "How do I ask for a code change?",
      "How do I open the diff panel?",
      "How do I continue an existing thread?",
    ],
  },
  settings: {
    title: "T3 Code | Settings",
    description: "Configure app preferences, provider options, and safety defaults.",
    summary: "Settings page for runtime preferences and Codex configuration.",
    topics: ["app configuration", "provider settings", "safety controls"],
    skills: ["environment setup", "model configuration", "workflow customization"],
    likelyQuestions: [
      "How do I change the Codex binary path?",
      "How do I set a default service tier?",
      "How do I restore default settings?",
    ],
  },
  smeApps: {
    title: "SME App Opportunities | DrBios",
    description: "Catalog of 50 small-business app ideas for SME digital transformation.",
    summary: "Curated interface listing practical app opportunities we can deliver for SMEs.",
    topics: ["SME software", "workflow automation", "business operations"],
    skills: ["discovery", "MVP scoping", "solution planning"],
    likelyQuestions: [
      "Which ideas are easiest to launch first?",
      "What app opportunities fit my industry?",
      "How should we prioritize these app builds?",
    ],
  },
  businessSkills: {
    title: "Business Function AI Skills | DrBios",
    description: "Business-function map for AI skills across sales, operations, finance, IT, and more.",
    summary:
      "Business-function planning surface that maps major categories, missing functional areas, and build tasks for future AI skill libraries.",
    topics: ["business functions", "AI skills", "workflow automation", "operating systems"],
    skills: ["taxonomy design", "workflow mapping", "MVP scoping", "business systems planning"],
    likelyQuestions: [
      "Which business functions should we build after sales?",
      "What major categories are missing from the function map?",
      "What task list should we follow to build skills in each category?",
    ],
  },
  kpiDashboard: {
    title: "T3 KPI Dashboard | DrBios",
    description:
      "Operational KPI dashboard for project count, lines of code, token usage, and team size in T3.",
    summary:
      "Internal KPI dashboard showing live engineering and usage totals across active T3 projects.",
    topics: ["kpi dashboard", "project analytics", "token usage", "engineering metrics"],
    skills: ["operational reporting", "team tracking", "delivery oversight"],
    likelyQuestions: [
      "How many active projects are in T3 right now?",
      "How many lines of code exist across current project workspaces?",
      "How many tokens have we used recently?",
    ],
  },
};

const PATH_TO_METADATA_KEY: Record<string, PageMetadataKey> = {
  "/": "chatHome",
  "/settings": "settings",
  "/sme-apps": "smeApps",
  "/business-skills": "businessSkills",
  "/kpi-dashboard": "kpiDashboard",
};

export function resolvePageMetadataKey(pathname: string): PageMetadataKey | null {
  const exact = PATH_TO_METADATA_KEY[pathname];
  if (exact) {
    return exact;
  }
  if (pathname.startsWith("/")) {
    return "chatThread";
  }
  return null;
}

export function resolvePageMetadata(pathname: string): PageMetadataEntry | null {
  const key = resolvePageMetadataKey(pathname);
  if (!key) {
    return null;
  }
  return PAGE_METADATA[key];
}

export function headMetaForPage(key: PageMetadataKey) {
  const metadata = PAGE_METADATA[key];
  return [
    { title: metadata.title },
    { name: "description", content: metadata.description },
    { name: "keywords", content: metadata.topics.join(", ") },
  ];
}

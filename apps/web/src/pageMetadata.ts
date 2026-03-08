export type PageMetadataKey =
  | "chatHome"
  | "chatThread"
  | "settings"
  | "smeApps"
  | "salesSkills";

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
  salesSkills: {
    title: "Sales AI Skills | DrBios",
    description: "Catalog of 100 build-ready AI sales skills for business teams.",
    summary:
      "Structured catalog of AI sales skills with practical specs for building prospecting, qualification, forecasting, and expansion workflows.",
    topics: ["sales automation", "revenue operations", "AI skills", "sales workflows"],
    skills: ["sales system design", "workflow automation", "MVP scoping", "revenue tooling"],
    likelyQuestions: [
      "Which sales AI skills are quickest to launch first?",
      "How should we group these skills by sales workflow?",
      "What inputs, integrations, and guardrails does each skill need?",
    ],
  },
};

const PATH_TO_METADATA_KEY: Record<string, PageMetadataKey> = {
  "/": "chatHome",
  "/settings": "settings",
  "/sme-apps": "smeApps",
  "/sales-skills": "salesSkills",
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

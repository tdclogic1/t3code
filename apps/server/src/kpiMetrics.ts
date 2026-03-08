import fs from "node:fs/promises";
import path from "node:path";

import type { OrchestrationReadModel, ServerKpiSummary } from "@t3tools/contracts";

const DEFAULT_TEAM_MEMBER_COUNT = 1;
const MAX_SCANNED_FILES_PER_WORKSPACE = 8_000;
const MAX_SCANNED_FILE_BYTES = 1_500_000;
const WORKSPACE_SCAN_TIMEOUT_MS = 8_000;
const APPROX_CHARS_PER_TOKEN = 4;

const IGNORED_DIRECTORY_NAMES = new Set([
  ".git",
  ".next",
  ".turbo",
  ".cache",
  ".convex",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "out",
]);

const CODE_FILE_EXTENSIONS = new Set([
  ".c",
  ".cc",
  ".cpp",
  ".cs",
  ".css",
  ".go",
  ".h",
  ".hpp",
  ".html",
  ".java",
  ".js",
  ".json",
  ".jsx",
  ".kt",
  ".kts",
  ".mjs",
  ".php",
  ".py",
  ".rb",
  ".rs",
  ".sass",
  ".scala",
  ".scss",
  ".sh",
  ".sql",
  ".swift",
  ".toml",
  ".ts",
  ".tsx",
  ".vue",
  ".xml",
  ".yaml",
  ".yml",
  ".zsh",
]);

const TOKEN_TOTAL_KEYS = ["totalTokens", "total_tokens", "totalTokenCount", "total_token_count"];
const TOKEN_INPUT_KEYS = [
  "inputTokens",
  "input_tokens",
  "promptTokens",
  "prompt_tokens",
  "inputTokenCount",
  "input_token_count",
  "promptTokenCount",
  "prompt_token_count",
];
const TOKEN_OUTPUT_KEYS = [
  "outputTokens",
  "output_tokens",
  "completionTokens",
  "completion_tokens",
  "outputTokenCount",
  "output_token_count",
  "completionTokenCount",
  "completion_token_count",
];

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Record<string, unknown>;
}

function toNonNegativeInteger(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  if (value < 0) {
    return null;
  }
  return Math.round(value);
}

function readNumericField(
  record: Record<string, unknown>,
  keys: ReadonlyArray<string>,
): number | null {
  for (const key of keys) {
    const parsed = toNonNegativeInteger(record[key]);
    if (parsed !== null) {
      return parsed;
    }
  }
  return null;
}

function usageCandidateTotal(value: unknown): number | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const explicitTotal = readNumericField(record, TOKEN_TOTAL_KEYS);
  if (explicitTotal !== null) {
    return explicitTotal;
  }

  const inputTokens = readNumericField(record, TOKEN_INPUT_KEYS);
  const outputTokens = readNumericField(record, TOKEN_OUTPUT_KEYS);
  if (inputTokens !== null || outputTokens !== null) {
    return (inputTokens ?? 0) + (outputTokens ?? 0);
  }

  return null;
}

function extractTokenUsageTotal(value: unknown): number | null {
  const root = asRecord(value);
  if (!root) {
    return null;
  }

  const queue: Record<string, unknown>[] = [root];
  const visited = new Set<Record<string, unknown>>();
  let best: number | null = null;

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }
    visited.add(current);

    const candidate = usageCandidateTotal(current);
    if (candidate !== null) {
      best = best === null ? candidate : Math.max(best, candidate);
    }

    for (const nestedValue of Object.values(current)) {
      const nestedRecord = asRecord(nestedValue);
      if (nestedRecord) {
        queue.push(nestedRecord);
      }
    }
  }

  return best;
}

function estimateTokensFromMessages(snapshot: OrchestrationReadModel): number {
  const characterCount = snapshot.threads
    .filter((thread) => thread.deletedAt === null)
    .flatMap((thread) => thread.messages)
    .reduce((total, message) => total + message.text.length, 0);
  return Math.round(characterCount / APPROX_CHARS_PER_TOKEN);
}

function resolveTokenUsage(snapshot: OrchestrationReadModel): {
  readonly tokensUsed: number;
  readonly tokenSource: ServerKpiSummary["tokenSource"];
} {
  const maxTokenUsageByTurn = new Map<string, number>();

  for (const thread of snapshot.threads) {
    if (thread.deletedAt !== null) {
      continue;
    }
    for (const activity of thread.activities) {
      const candidateTotal = extractTokenUsageTotal(activity.payload);
      if (candidateTotal === null) {
        continue;
      }

      const key = `${thread.id}:${activity.turnId ?? "thread"}`;
      const existing = maxTokenUsageByTurn.get(key) ?? 0;
      if (candidateTotal > existing) {
        maxTokenUsageByTurn.set(key, candidateTotal);
      }
    }
  }

  const runtimeUsageTotal = [...maxTokenUsageByTurn.values()].reduce((total, value) => total + value, 0);
  if (runtimeUsageTotal > 0) {
    return {
      tokensUsed: runtimeUsageTotal,
      tokenSource: "runtime-events",
    };
  }

  return {
    tokensUsed: Math.max(0, estimateTokensFromMessages(snapshot)),
    tokenSource: "message-estimate",
  };
}

function resolveTeamMemberCount(): number {
  const raw =
    process.env.T3CODE_TEAM_MEMBER_COUNT?.trim() ?? process.env.T3CODE_TEAM_MEMBERS?.trim() ?? "";
  if (raw.length === 0) {
    return DEFAULT_TEAM_MEMBER_COUNT;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TEAM_MEMBER_COUNT;
  }
  return parsed;
}

function isCodeFile(fileName: string): boolean {
  return CODE_FILE_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

async function countLinesInFile(filePath: string): Promise<number> {
  let stats;
  try {
    stats = await fs.stat(filePath);
  } catch {
    return 0;
  }
  if (!stats.isFile()) {
    return 0;
  }
  if (stats.size === 0 || stats.size > MAX_SCANNED_FILE_BYTES) {
    return 0;
  }

  let contents: Buffer;
  try {
    contents = await fs.readFile(filePath);
  } catch {
    return 0;
  }
  if (contents.length === 0 || contents.includes(0)) {
    return 0;
  }

  let newlineCount = 0;
  for (const byte of contents) {
    if (byte === 10) {
      newlineCount += 1;
    }
  }
  return newlineCount + 1;
}

async function countLinesInWorkspace(workspaceRoot: string): Promise<number> {
  const queue = [workspaceRoot];
  let scannedFiles = 0;
  let totalLines = 0;

  while (queue.length > 0 && scannedFiles < MAX_SCANNED_FILES_PER_WORKSPACE) {
    const currentDirectory = queue.pop();
    if (!currentDirectory) {
      continue;
    }

    let entries;
    try {
      entries = await fs.readdir(currentDirectory, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (entry.isSymbolicLink()) {
        continue;
      }
      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORY_NAMES.has(entry.name)) {
          continue;
        }
        queue.push(path.join(currentDirectory, entry.name));
        continue;
      }
      if (!entry.isFile() || !isCodeFile(entry.name)) {
        continue;
      }
      if (scannedFiles >= MAX_SCANNED_FILES_PER_WORKSPACE) {
        break;
      }
      scannedFiles += 1;
      totalLines += await countLinesInFile(path.join(currentDirectory, entry.name));
    }
  }

  return totalLines;
}

async function countLinesWithTimeout(workspaceRoot: string): Promise<number> {
  const timer = new Promise<number>((resolve) => {
    setTimeout(() => resolve(0), WORKSPACE_SCAN_TIMEOUT_MS);
  });
  return Promise.race([countLinesInWorkspace(workspaceRoot), timer]);
}

export async function computeServerKpiSummary(
  snapshot: OrchestrationReadModel,
): Promise<ServerKpiSummary> {
  const activeProjects = snapshot.projects.filter((project) => project.deletedAt === null);
  const workspaceRoots = [...new Set(activeProjects.map((project) => path.resolve(project.workspaceRoot)))];

  let linesOfCode = 0;
  for (const workspaceRoot of workspaceRoots) {
    linesOfCode += await countLinesWithTimeout(workspaceRoot);
  }

  const tokenUsage = resolveTokenUsage(snapshot);
  return {
    projectCount: activeProjects.length,
    linesOfCode: Math.max(0, linesOfCode),
    tokensUsed: Math.max(0, tokenUsage.tokensUsed),
    teamMembers: resolveTeamMemberCount(),
    tokenSource: tokenUsage.tokenSource,
    measuredAt: new Date().toISOString(),
  };
}

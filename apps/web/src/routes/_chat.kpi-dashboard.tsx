import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Code2Icon, FolderKanbanIcon, GaugeIcon, UsersIcon } from "lucide-react";
import type { ReactNode } from "react";

import { isElectron } from "../env";
import { serverKpiSummaryQueryOptions } from "../lib/serverReactQuery";
import { headMetaForPage, PAGE_METADATA } from "../pageMetadata";
import { SidebarInset } from "~/components/ui/sidebar";

const CURRENT_YEAR = new Date().getFullYear();

function formatMetric(value: number | null | undefined): string {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

function formatMeasuredAt(value: string | null | undefined): string {
  if (!value) {
    return "Waiting for metrics...";
  }
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return "Updated recently";
  }
  return new Date(timestamp).toLocaleString();
}

function tokenSourceLabel(source: "runtime-events" | "message-estimate" | undefined): string {
  if (source === "runtime-events") {
    return "Runtime usage events";
  }
  if (source === "message-estimate") {
    return "Estimated from message volume";
  }
  return "Not available";
}

function KpiCard(input: {
  readonly label: string;
  readonly value: string;
  readonly description: string;
  readonly icon: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{input.label}</p>
        <span className="inline-flex size-7 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
          {input.icon}
        </span>
      </div>
      <p className="text-3xl font-semibold tracking-tight text-foreground">{input.value}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{input.description}</p>
    </article>
  );
}

function KpiDashboardRouteView() {
  const kpiQuery = useQuery(serverKpiSummaryQueryOptions());
  const kpi = kpiQuery.data;
  const hasError = kpiQuery.status === "error";

  return (
    <SidebarInset className="h-dvh min-h-0 overflow-hidden overscroll-y-none bg-background text-foreground isolate">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background text-foreground">
        {isElectron && (
          <div className="drag-region flex h-[52px] shrink-0 items-center border-b border-border px-5">
            <span className="text-xs font-medium tracking-wide text-muted-foreground/70">
              KPI Dashboard
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <script
              id="kpi-dashboard-context"
              type="application/json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  summary: PAGE_METADATA.kpiDashboard.summary,
                  topics: PAGE_METADATA.kpiDashboard.topics,
                  skills: PAGE_METADATA.kpiDashboard.skills,
                  likelyQuestions: PAGE_METADATA.kpiDashboard.likelyQuestions,
                  ...kpi,
                }),
              }}
            />

            <header className="overflow-hidden rounded-[28px] border border-border bg-[linear-gradient(145deg,color-mix(in_srgb,var(--card)_88%,var(--color-cyan-500)_12%)_0%,color-mix(in_srgb,var(--card)_90%,var(--color-lime-500)_10%)_45%,var(--card)_100%)] p-6 shadow-sm">
              <p className="text-[11px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                T3 Internal Metrics
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                KPI Dashboard
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Live KPI surface for active projects, code footprint, token usage, and team size.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
                <GaugeIcon className="size-3.5" />
                Last update: <span className="font-medium text-foreground">{formatMeasuredAt(kpi?.measuredAt)}</span>
              </div>
            </header>

            {hasError ? (
              <section className="rounded-2xl border border-dashed border-red-400/40 bg-red-500/5 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                Failed to load KPI data. Check the server logs and retry.
              </section>
            ) : null}

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Projects"
                value={formatMetric(kpi?.projectCount)}
                description="Active projects currently tracked by orchestration."
                icon={<FolderKanbanIcon className="size-4" />}
              />
              <KpiCard
                label="Lines Of Code"
                value={formatMetric(kpi?.linesOfCode)}
                description="Scanned code lines across active project workspace roots."
                icon={<Code2Icon className="size-4" />}
              />
              <KpiCard
                label="Tokens Used"
                value={formatMetric(kpi?.tokensUsed)}
                description={tokenSourceLabel(kpi?.tokenSource)}
                icon={<GaugeIcon className="size-4" />}
              />
              <KpiCard
                label="Team Members"
                value={formatMetric(kpi?.teamMembers)}
                description="Set `T3CODE_TEAM_MEMBER_COUNT` to override this value."
                icon={<UsersIcon className="size-4" />}
              />
            </section>
          </div>
        </div>

        <footer className="border-t border-border px-6 py-3 text-center text-[11px] text-muted-foreground/85">
          <p>Copyright © {CURRENT_YEAR} DrBios. All rights reserved.</p>
          <p>Created by DrBios.</p>
        </footer>
      </div>
    </SidebarInset>
  );
}

export const Route = createFileRoute("/_chat/kpi-dashboard")({
  head: () => ({
    meta: headMetaForPage("kpiDashboard"),
  }),
  component: KpiDashboardRouteView,
});

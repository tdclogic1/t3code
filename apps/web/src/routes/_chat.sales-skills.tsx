import { createFileRoute } from "@tanstack/react-router";
import { startTransition, useDeferredValue, useState } from "react";

import { isElectron } from "../env";
import { headMetaForPage, PAGE_METADATA } from "../pageMetadata";
import {
  SALES_SKILL_CATALOG,
  SALES_SKILL_CATEGORIES,
  SALES_SKILL_TOTAL,
} from "../data/salesSkillCatalog";
import { Input } from "../components/ui/input";
import { SidebarInset } from "~/components/ui/sidebar";

const CURRENT_YEAR = new Date().getFullYear();
const AVERAGE_BUILD_WEEKS = (
  SALES_SKILL_CATALOG.reduce((total, skill) => total + skill.spec.estimatedBuildWeeks, 0) /
  SALES_SKILL_TOTAL
).toFixed(1);

function SalesSkillsRouteView() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const categoryOptions = ["All", ...SALES_SKILL_CATEGORIES];

  const filtered = SALES_SKILL_CATALOG.filter((skill) => {
    const categoryMatch = selectedCategory === "All" || skill.category === selectedCategory;
    if (!categoryMatch) {
      return false;
    }
    if (normalizedQuery.length === 0) {
      return true;
    }
    const haystack = [
      skill.name,
      skill.category,
      skill.stage,
      skill.idealFor,
      skill.value,
      skill.spec.problem,
      skill.spec.trigger,
      skill.spec.rolloutMotion,
      ...skill.spec.primaryUsers,
      ...skill.spec.inputs,
      ...skill.spec.workflow,
      ...skill.spec.outputs,
      ...skill.spec.integrations,
      ...skill.spec.automations,
      ...skill.spec.kpis,
      ...skill.spec.guardrails,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });

  return (
    <SidebarInset className="h-dvh min-h-0 overflow-hidden overscroll-y-none bg-background text-foreground isolate">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background text-foreground">
        {isElectron && (
          <div className="drag-region flex h-[52px] shrink-0 items-center border-b border-border px-5">
            <span className="text-xs font-medium tracking-wide text-muted-foreground/70">
              Sales AI Skills
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <script
              id="sales-skills-context"
              type="application/json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  summary: PAGE_METADATA.salesSkills.summary,
                  topics: PAGE_METADATA.salesSkills.topics,
                  skills: PAGE_METADATA.salesSkills.skills,
                  likelyQuestions: PAGE_METADATA.salesSkills.likelyQuestions,
                  totalSkills: SALES_SKILL_TOTAL,
                  totalCategories: SALES_SKILL_CATEGORIES.length,
                  averageBuildWeeks: AVERAGE_BUILD_WEEKS,
                }),
              }}
            />

            <header className="overflow-hidden rounded-[28px] border border-border bg-[linear-gradient(135deg,color-mix(in_srgb,var(--card)_88%,var(--color-orange-500)_12%)_0%,color-mix(in_srgb,var(--card)_94%,var(--color-cyan-500)_6%)_45%,var(--card)_100%)] p-6 shadow-sm">
              <div className="max-w-4xl space-y-3">
                <p className="text-[11px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                  DrBios Sales Systems
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  100 Sales AI Skills With Build Specs
                </h1>
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  A structured catalog of business sales skills we can keep building into the
                  product. Every card starts as a usable skill concept and includes a practical spec
                  for trigger, workflow, outputs, integrations, guardrails, and rollout motion.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    Skill cards
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{SALES_SKILL_TOTAL}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sales-specific automations across prospecting, pipeline, and growth.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    Workflow groups
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {SALES_SKILL_CATEGORIES.length}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Organized around the actual operating motions revenue teams run every week.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    Avg MVP time
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {AVERAGE_BUILD_WEEKS} weeks
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Useful for sorting quick wins from heavier workflow systems.
                  </p>
                </div>
              </div>
            </header>

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <label className="block flex-1 space-y-1.5">
                  <span className="text-xs font-medium text-foreground">
                    Search skills and implementation specs
                  </span>
                  <Input
                    value={query}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      startTransition(() => {
                        setQuery(nextValue);
                      });
                    }}
                    placeholder="Try: forecasting, MEDDICC, expansion, procurement..."
                    spellCheck={false}
                  />
                </label>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                    Total: <span className="font-medium text-foreground">{SALES_SKILL_TOTAL}</span>
                  </div>
                  <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                    Showing: <span className="font-medium text-foreground">{filtered.length}</span>
                  </div>
                  <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                    Categories:{" "}
                    <span className="font-medium text-foreground">{SALES_SKILL_CATEGORIES.length}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {categoryOptions.map((category) => {
                  const isActive = category === selectedCategory;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                        isActive
                          ? "border-primary/60 bg-primary/10 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </section>

            {filtered.length === 0 ? (
              <section className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No sales skills matched your filters. Try a broader search or switch back to{" "}
                  <span className="font-medium text-foreground">All</span>.
                </p>
              </section>
            ) : (
              <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {filtered.map((skill) => (
                  <article
                    key={skill.slug}
                    className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/35"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">#{skill.id}</p>
                        <h2 className="mt-1 text-base font-semibold text-foreground">{skill.name}</h2>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                          {skill.category}
                        </span>
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                          {skill.stage}
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/90">Ideal for:</span>{" "}
                      {skill.idealFor}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {skill.value}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                      <div className="rounded-lg border border-border bg-background px-3 py-2">
                        Complexity:{" "}
                        <span className="font-medium text-foreground">{skill.spec.complexity}</span>
                      </div>
                      <div className="rounded-lg border border-border bg-background px-3 py-2">
                        MVP:{" "}
                        <span className="font-medium text-foreground">
                          {skill.spec.estimatedBuildWeeks} weeks
                        </span>
                      </div>
                    </div>

                    <details className="mt-3 rounded-xl border border-border bg-background p-3">
                      <summary className="cursor-pointer text-xs font-medium text-foreground">
                        View build spec
                      </summary>

                      <div className="mt-3 space-y-3 text-xs text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground/90">Problem:</span>{" "}
                          {skill.spec.problem}
                        </p>
                        <p>
                          <span className="font-medium text-foreground/90">Trigger:</span>{" "}
                          {skill.spec.trigger}
                        </p>
                        <p>
                          <span className="font-medium text-foreground/90">Primary users:</span>{" "}
                          {skill.spec.primaryUsers.join(", ")}
                        </p>

                        <div>
                          <p className="font-medium text-foreground/90">Inputs</p>
                          <ul className="mt-1 list-disc space-y-1 pl-4">
                            {skill.spec.inputs.map((input) => (
                              <li key={`${skill.slug}:input:${input}`}>{input}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="font-medium text-foreground/90">Workflow</p>
                          <ul className="mt-1 list-disc space-y-1 pl-4">
                            {skill.spec.workflow.map((step) => (
                              <li key={`${skill.slug}:workflow:${step}`}>{step}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="font-medium text-foreground/90">Outputs</p>
                          <ul className="mt-1 list-disc space-y-1 pl-4">
                            {skill.spec.outputs.map((output) => (
                              <li key={`${skill.slug}:output:${output}`}>{output}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <p className="font-medium text-foreground/90">Integrations</p>
                            <ul className="mt-1 list-disc space-y-1 pl-4">
                              {skill.spec.integrations.map((integration) => (
                                <li key={`${skill.slug}:integration:${integration}`}>{integration}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <p className="font-medium text-foreground/90">Automations</p>
                            <ul className="mt-1 list-disc space-y-1 pl-4">
                              {skill.spec.automations.map((automation) => (
                                <li key={`${skill.slug}:automation:${automation}`}>{automation}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <p className="font-medium text-foreground/90">KPIs</p>
                            <ul className="mt-1 list-disc space-y-1 pl-4">
                              {skill.spec.kpis.map((kpi) => (
                                <li key={`${skill.slug}:kpi:${kpi}`}>{kpi}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <p className="font-medium text-foreground/90">Guardrails</p>
                            <ul className="mt-1 list-disc space-y-1 pl-4">
                              {skill.spec.guardrails.map((guardrail) => (
                                <li key={`${skill.slug}:guardrail:${guardrail}`}>{guardrail}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <p>
                          <span className="font-medium text-foreground/90">Rollout motion:</span>{" "}
                          {skill.spec.rolloutMotion}
                        </p>
                      </div>
                    </details>
                  </article>
                ))}
              </section>
            )}
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

export const Route = createFileRoute("/_chat/sales-skills")({
  head: () => ({
    meta: headMetaForPage("salesSkills"),
  }),
  component: SalesSkillsRouteView,
});

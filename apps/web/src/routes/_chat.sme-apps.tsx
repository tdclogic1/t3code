import { createFileRoute } from "@tanstack/react-router";
import { startTransition, useDeferredValue, useState } from "react";

import { isElectron } from "../env";
import { headMetaForPage, PAGE_METADATA } from "../pageMetadata";
import { SME_APP_CATALOG } from "../data/smeAppCatalog";
import { Input } from "../components/ui/input";
import { SidebarInset } from "~/components/ui/sidebar";

const CURRENT_YEAR = new Date().getFullYear();

function SmeAppsRouteView() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const categoryOptions = [
    "All",
    ...Array.from(new Set(SME_APP_CATALOG.map((app) => app.category))).toSorted((left, right) =>
      left.localeCompare(right),
    ),
  ];

  const filtered = SME_APP_CATALOG.filter((app) => {
    const categoryMatch = selectedCategory === "All" || app.category === selectedCategory;
    if (!categoryMatch) {
      return false;
    }
    if (normalizedQuery.length === 0) {
      return true;
    }
    const haystack = [
      app.name,
      app.category,
      app.idealFor,
      app.value,
      app.spec.problem,
      app.spec.pricingModel,
      ...app.spec.targetUsers,
      ...app.spec.mvpFeatures,
      ...app.spec.integrations,
      ...app.spec.kpis,
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
              SME App Opportunities
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <script
              id="sme-apps-context"
              type="application/json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  summary: PAGE_METADATA.smeApps.summary,
                  topics: PAGE_METADATA.smeApps.topics,
                  skills: PAGE_METADATA.smeApps.skills,
                  likelyQuestions: PAGE_METADATA.smeApps.likelyQuestions,
                  totalIdeas: SME_APP_CATALOG.length,
                }),
              }}
            />

            <header className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                50 Small-Business App Opportunities
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                A practical shortlist of apps we can deliver for SME clients. Each card includes a
                build-ready product spec so we can move from idea to scoped implementation.
              </p>
            </header>

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <label className="block flex-1 space-y-1.5">
                  <span className="text-xs font-medium text-foreground">Search ideas and specs</span>
                  <Input
                    value={query}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      startTransition(() => {
                        setQuery(nextValue);
                      });
                    }}
                    placeholder="Try: dispatch, invoice, compliance, loyalty..."
                    spellCheck={false}
                  />
                </label>

                <div className="flex items-center gap-2">
                  <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                    Total ideas: <span className="font-medium text-foreground">{SME_APP_CATALOG.length}</span>
                  </div>
                  <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                    Showing: <span className="font-medium text-foreground">{filtered.length}</span>
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
                  No app ideas matched your filters. Try a broader search or switch to{" "}
                  <span className="font-medium text-foreground">All</span> categories.
                </p>
              </section>
            ) : (
              <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((app) => (
                  <article
                    key={app.id}
                    className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/35"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">#{app.id}</span>
                      <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                        {app.category}
                      </span>
                    </div>

                    <h2 className="text-sm font-semibold text-foreground">{app.name}</h2>
                    <p className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/90">Ideal for:</span>{" "}
                      {app.idealFor}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{app.value}</p>

                    <details className="mt-3 rounded-lg border border-border bg-background p-2">
                      <summary className="cursor-pointer text-xs font-medium text-foreground">
                        View product spec
                      </summary>

                      <div className="mt-2 space-y-2 text-xs text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground/90">Problem:</span>{" "}
                          {app.spec.problem}
                        </p>
                        <p>
                          <span className="font-medium text-foreground/90">Complexity:</span>{" "}
                          {app.spec.complexity} ({app.spec.estimatedBuildWeeks} weeks MVP)
                        </p>
                        <p>
                          <span className="font-medium text-foreground/90">Pricing model:</span>{" "}
                          {app.spec.pricingModel}
                        </p>
                        <p>
                          <span className="font-medium text-foreground/90">Launch motion:</span>{" "}
                          {app.spec.launchMotion}
                        </p>
                        <p className="font-medium text-foreground/90">MVP features</p>
                        <ul className="list-disc space-y-1 pl-4">
                          {app.spec.mvpFeatures.slice(0, 4).map((feature) => (
                            <li key={`${app.slug}:${feature}`}>{feature}</li>
                          ))}
                        </ul>
                        <p className="font-medium text-foreground/90">Core entities</p>
                        <ul className="list-disc space-y-1 pl-4">
                          {app.spec.coreEntities.slice(0, 4).map((entity) => (
                            <li key={`${app.slug}:${entity}`}>{entity}</li>
                          ))}
                        </ul>
                        <p className="font-medium text-foreground/90">Target KPIs</p>
                        <ul className="list-disc space-y-1 pl-4">
                          {app.spec.kpis.slice(0, 4).map((kpi) => (
                            <li key={`${app.slug}:${kpi}`}>{kpi}</li>
                          ))}
                        </ul>
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

export const Route = createFileRoute("/_chat/sme-apps")({
  head: () => ({
    meta: headMetaForPage("smeApps"),
  }),
  component: SmeAppsRouteView,
});


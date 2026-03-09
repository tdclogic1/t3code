import { createFileRoute } from "@tanstack/react-router";
import { StarIcon, TrendingUpIcon } from "lucide-react";
import { type ReactNode, startTransition, useDeferredValue, useMemo, useState } from "react";

import { isElectron } from "../env";
import { headMetaForPage, PAGE_METADATA } from "../pageMetadata";
import {
  BUSINESS_FUNCTION_CATALOG,
  CORE_BUSINESS_FUNCTIONS,
  SUGGESTED_BUSINESS_FUNCTIONS,
  TOTAL_BUSINESS_FUNCTIONS,
} from "../data/businessFunctionCatalog";
import { Input } from "../components/ui/input";
import { SidebarInset } from "~/components/ui/sidebar";
import { LIVE_SKILL_LIBRARIES, skillKeyFor } from "../data/liveSkillRegistry";
import { HIGHEST_RATED_SKILLS, analyzeSkill } from "../data/skillAnalysis";
import { useFavoriteSkillStore } from "../favoriteSkillStore";
import { type FunctionSkillIdea } from "../data/functionSkillTypes";

const CURRENT_YEAR = new Date().getFullYear();
const LIVE_LIBRARY_COUNT = Object.keys(LIVE_SKILL_LIBRARIES).length;
const TOTAL_LIVE_SKILLS = Object.values(LIVE_SKILL_LIBRARIES).reduce(
  (total, library) => total + library.total,
  0,
);
const OVERALL_AVERAGE_BUILD_WEEKS = (
  Object.values(LIVE_SKILL_LIBRARIES).reduce(
    (total, library) =>
      total +
      library.skills.reduce((skillTotal, skill) => skillTotal + skill.spec.estimatedBuildWeeks, 0),
    0,
  ) / TOTAL_LIVE_SKILLS
).toFixed(1);

type ViewMode = "favorites" | "highest-rated" | string;

function BusinessSkillsRouteView() {
  const [selectedView, setSelectedView] = useState<ViewMode>("sales");
  const [query, setQuery] = useState("");
  const [selectedLiveCategory, setSelectedLiveCategory] = useState("All");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const favorites = useFavoriteSkillStore((state) => state.favorites);
  const toggleFavorite = useFavoriteSkillStore((state) => state.toggleFavorite);

  const selectedFunction =
    BUSINESS_FUNCTION_CATALOG.find((category) => category.slug === selectedView) ??
    CORE_BUSINESS_FUNCTIONS[0] ??
    BUSINESS_FUNCTION_CATALOG[0];

  const activeLiveLibrary = LIVE_SKILL_LIBRARIES[selectedView] ?? null;
  const activeCategoryOptions = activeLiveLibrary ? ["All", ...activeLiveLibrary.categories] : ["All"];

  const favoriteSkillEntries = useMemo(
    () =>
      Object.values(LIVE_SKILL_LIBRARIES).flatMap((library) =>
        library.skills
          .filter((skill) => favorites.includes(skillKeyFor(library.functionSlug, skill)))
          .map((skill) => ({
            functionSlug: library.functionSlug,
            functionName: library.functionName,
            skillKey: skillKeyFor(library.functionSlug, skill),
            skill,
            analysis: analyzeSkill(skill),
          })),
      ),
    [favorites],
  );

  const filteredFavoriteSkills = favoriteSkillEntries.filter((entry) =>
    matchesSkillQuery(entry.skill, normalizedQuery),
  );

  const filteredHighestRatedSkills = HIGHEST_RATED_SKILLS.filter((entry) =>
    matchesSkillQuery(entry.skill, normalizedQuery),
  );

  const filteredLiveSkills = activeLiveLibrary
    ? activeLiveLibrary.skills.filter((skill) => {
        const categoryMatch =
          selectedLiveCategory === "All" || skill.category === selectedLiveCategory;
        if (!categoryMatch) {
          return false;
        }
        return matchesSkillQuery(skill, normalizedQuery);
      })
    : [];

  if (!selectedFunction) {
    return null;
  }

  return (
    <SidebarInset className="h-dvh min-h-0 overflow-hidden overscroll-y-none bg-background text-foreground isolate">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background text-foreground">
        {isElectron && (
          <div className="drag-region flex h-[52px] shrink-0 items-center border-b border-border px-5">
            <span className="text-xs font-medium tracking-wide text-muted-foreground/70">
              Business Function AI Skills
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
            <script
              id="business-skills-context"
              type="application/json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  summary: PAGE_METADATA.businessSkills.summary,
                  topics: PAGE_METADATA.businessSkills.topics,
                  skills: PAGE_METADATA.businessSkills.skills,
                  likelyQuestions: PAGE_METADATA.businessSkills.likelyQuestions,
                  totalFunctions: TOTAL_BUSINESS_FUNCTIONS,
                  coreFunctions: CORE_BUSINESS_FUNCTIONS.length,
                  suggestedFunctions: SUGGESTED_BUSINESS_FUNCTIONS.length,
                  liveLibraryCount: LIVE_LIBRARY_COUNT,
                  totalLiveSkills: TOTAL_LIVE_SKILLS,
                  favoriteCount: favorites.length,
                  highestRatedCount: HIGHEST_RATED_SKILLS.length,
                }),
              }}
            />

            <header className="overflow-hidden rounded-[28px] border border-border bg-[linear-gradient(140deg,color-mix(in_srgb,var(--card)_84%,var(--color-emerald-500)_16%)_0%,color-mix(in_srgb,var(--card)_92%,var(--color-cyan-500)_8%)_44%,var(--card)_100%)] p-6 shadow-sm">
              <div className="max-w-4xl space-y-3">
                <p className="text-[11px] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                  DrBios Business Function Map
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  Business Functions, Live Skill Libraries, Favorites, and Highest Rated Skills
                </h1>
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                  Sales, Operations, Accounting & Finance, and IT are now live skill libraries. Every
                  skill is analyzed for usefulness, complexity, and specificity so you can see the
                  highest-rated work across categories, while still keeping a build backlog for the
                  rest of the business-function map.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <MetricCard
                  label="Core categories"
                  value={CORE_BUSINESS_FUNCTIONS.length}
                  description="Top-level business functions to organize future skill families."
                />
                <MetricCard
                  label="Live libraries"
                  value={LIVE_LIBRARY_COUNT}
                  description="Sales, Operations, Accounting & Finance, and IT are now seeded."
                />
                <MetricCard
                  label="Live skill cards"
                  value={TOTAL_LIVE_SKILLS}
                  description="All live skills that can be searched, rated, and favorited."
                />
                <MetricCard
                  label="Avg MVP time"
                  value={`${OVERALL_AVERAGE_BUILD_WEEKS} weeks`}
                  description="A rough signal for how quickly a good first version can ship."
                />
              </div>
            </header>

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <label className="block flex-1 space-y-1.5">
                  <span className="text-xs font-medium text-foreground">
                    Search across live skills, favorites, and top-rated work
                  </span>
                  <Input
                    value={query}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      startTransition(() => {
                        setQuery(nextValue);
                      });
                    }}
                    placeholder="Try: dispatch, reconciliation, forecast, compliance..."
                    spellCheck={false}
                  />
                </label>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                    Favorites: <span className="font-medium text-foreground">{favorites.length}</span>
                  </div>
                  <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                    Highest rated:{" "}
                    <span className="font-medium text-foreground">{HIGHEST_RATED_SKILLS.length}</span>
                  </div>
                  <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                    Suggested adds:{" "}
                    <span className="font-medium text-foreground">
                      {SUGGESTED_BUSINESS_FUNCTIONS.length}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Quick views</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Jump straight to cross-category favorites or the highest-rated skills.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <QuickViewCard
                  title="Favorites"
                  description="Skills you mark for follow-up, regardless of which live library they belong to."
                  value={favorites.length}
                  isActive={selectedView === "favorites"}
                  onClick={() => {
                    setSelectedView("favorites");
                    setSelectedLiveCategory("All");
                  }}
                  icon={<StarIcon className="size-4" />}
                />
                <QuickViewCard
                  title="Highest Rated"
                  description="Cross-category view of the strongest skills by overall score, regardless of function."
                  value={HIGHEST_RATED_SKILLS.length}
                  isActive={selectedView === "highest-rated"}
                  onClick={() => {
                    setSelectedView("highest-rated");
                    setSelectedLiveCategory("All");
                  }}
                  icon={<TrendingUpIcon className="size-4" />}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Major categories</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Core business-function groups with live or planned status.
                  </p>
                </div>
                <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                  Total mapped:{" "}
                  <span className="font-medium text-foreground">{TOTAL_BUSINESS_FUNCTIONS}</span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {CORE_BUSINESS_FUNCTIONS.map((category) => {
                  const isActive = category.slug === selectedView;
                  return (
                    <button
                      key={category.slug}
                      type="button"
                      onClick={() => {
                        setSelectedView(category.slug);
                        setSelectedLiveCategory("All");
                      }}
                      className={`rounded-2xl border p-4 text-left transition-colors ${
                        isActive
                          ? "border-primary/60 bg-primary/8"
                          : "border-border bg-background hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{category.name}</p>
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                            {category.summary}
                          </p>
                        </div>
                        <StatusBadge status={category.status} />
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                        <div className="rounded-lg border border-border bg-card px-3 py-2">
                          Live now:{" "}
                          <span className="font-medium text-foreground">
                            {category.currentSkillCount}
                          </span>
                        </div>
                        <div className="rounded-lg border border-border bg-card px-3 py-2">
                          Target:{" "}
                          <span className="font-medium text-foreground">
                            {category.targetSkillCount}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Other function-level categories you missed
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Common business functions that should still get their own skill families later.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {SUGGESTED_BUSINESS_FUNCTIONS.map((category) => {
                  const isActive = category.slug === selectedView;
                  return (
                    <button
                      key={category.slug}
                      type="button"
                      onClick={() => {
                        setSelectedView(category.slug);
                        setSelectedLiveCategory("All");
                      }}
                      className={`rounded-2xl border p-4 text-left transition-colors ${
                        isActive
                          ? "border-primary/60 bg-primary/8"
                          : "border-border bg-background hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{category.name}</p>
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                            {category.summary}
                          </p>
                        </div>
                        <StatusBadge status={category.status} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {selectedView === "favorites" ? (
              <section className="rounded-2xl border border-border bg-card p-5">
                <SectionHeader
                  title="Favorite skills"
                  description="Cross-category list of saved skills from any live function library."
                  total={filteredFavoriteSkills.length}
                />
                {filteredFavoriteSkills.length === 0 ? (
                  <EmptyState copy="No favorite skills matched. Mark any skill with Favorite to save it here." />
                ) : (
                  <SkillGrid
                    skills={filteredFavoriteSkills}
                    toggleFavorite={toggleFavorite}
                    favorites={favorites}
                  />
                )}
              </section>
            ) : null}

            {selectedView === "highest-rated" ? (
              <section className="rounded-2xl border border-border bg-card p-5">
                <SectionHeader
                  title="Highest rated across all live categories"
                  description="Ranked by the analysis function using usefulness, implementation complexity, and general-versus-specific breadth."
                  total={filteredHighestRatedSkills.length}
                />
                {filteredHighestRatedSkills.length === 0 ? (
                  <EmptyState copy="No highest-rated skills matched the current search." />
                ) : (
                  <SkillGrid
                    skills={filteredHighestRatedSkills}
                    toggleFavorite={toggleFavorite}
                    favorites={favorites}
                  />
                )}
              </section>
            ) : null}

            {activeLiveLibrary ? (
              <>
                <section className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-semibold text-foreground">
                          {activeLiveLibrary.functionName} live library
                        </h2>
                        <StatusBadge status="live" />
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {activeLiveLibrary.summary}
                      </p>
                    </div>

                    <div className="grid min-w-[260px] gap-2 sm:grid-cols-2 xl:w-[340px] xl:grid-cols-1">
                      <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                        Current skills:{" "}
                        <span className="font-medium text-foreground">{activeLiveLibrary.total}</span>
                      </div>
                      <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                        Categories:{" "}
                        <span className="font-medium text-foreground">
                          {activeLiveLibrary.categories.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeCategoryOptions.map((category) => {
                      const isActive = category === selectedLiveCategory;
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setSelectedLiveCategory(category)}
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

                {filteredLiveSkills.length === 0 ? (
                  <EmptyState copy={`No ${activeLiveLibrary.functionName.toLowerCase()} skills matched the current filters.`} />
                ) : (
                  <section className="rounded-2xl border border-border bg-card p-5">
                    <SectionHeader
                      title={`${activeLiveLibrary.functionName} skills`}
                      description="Every card includes the build spec plus its current rating profile."
                      total={filteredLiveSkills.length}
                    />
                    <SkillGrid
                      skills={filteredLiveSkills.map((skill) => ({
                        functionSlug: activeLiveLibrary.functionSlug,
                        functionName: activeLiveLibrary.functionName,
                        skillKey: skillKeyFor(activeLiveLibrary.functionSlug, skill),
                        skill,
                        analysis: analyzeSkill(skill),
                      }))}
                      toggleFavorite={toggleFavorite}
                      favorites={favorites}
                    />
                  </section>
                )}
              </>
            ) : selectedView !== "favorites" && selectedView !== "highest-rated" ? (
              <section className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-foreground">
                        {selectedFunction.name} build plan
                      </h2>
                      <StatusBadge status={selectedFunction.status} />
                      {selectedFunction.source === "suggested" ? (
                        <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                          Suggested addition
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {selectedFunction.summary}
                    </p>
                  </div>

                  <div className="grid min-w-[260px] gap-2 sm:grid-cols-2 xl:w-[320px] xl:grid-cols-1">
                    <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                      Current skills:{" "}
                      <span className="font-medium text-foreground">
                        {selectedFunction.currentSkillCount}
                      </span>
                    </div>
                    <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                      Target skills:{" "}
                      <span className="font-medium text-foreground">
                        {selectedFunction.targetSkillCount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Build lanes
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedFunction.workflowTracks.map((track) => (
                          <span
                            key={`${selectedFunction.slug}:${track}`}
                            className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
                          >
                            {track}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Primary owners
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedFunction.owners.map((owner) => (
                          <span
                            key={`${selectedFunction.slug}:owner:${owner}`}
                            className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
                          >
                            {owner}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Key systems
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedFunction.keySystems.map((system) => (
                        <span
                          key={`${selectedFunction.slug}:system:${system}`}
                          className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
                        >
                          {system}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <SectionHeader
                    title="Task list"
                    description="Backlog to build this function into a live skill library."
                    total={selectedFunction.tasks.length}
                  />
                  <div className="mt-4 grid gap-3 xl:grid-cols-2">
                    {selectedFunction.tasks.map((task, index) => (
                      <article
                        key={`${selectedFunction.slug}:${task.phase}:${task.title}`}
                        className="rounded-2xl border border-border bg-background p-4"
                      >
                        <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                          {task.phase}
                        </p>
                        <h3 className="mt-1 text-sm font-semibold text-foreground">
                          {index + 1}. {task.title}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                          {task.deliverable}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}
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

function matchesSkillQuery(skill: FunctionSkillIdea, normalizedQuery: string): boolean {
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
}

function SkillGrid({
  skills,
  favorites,
  toggleFavorite,
}: {
  skills: ReadonlyArray<{
    readonly functionSlug: string;
    readonly functionName: string;
    readonly skillKey: string;
    readonly skill: FunctionSkillIdea;
    readonly analysis: ReturnType<typeof analyzeSkill>;
  }>;
  favorites: ReadonlyArray<string>;
  toggleFavorite: (skillKey: string) => void;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {skills.map((entry) => {
        const isFavorite = favorites.includes(entry.skillKey);
        return (
          <article
            key={entry.skillKey}
            className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/35"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">#{entry.skill.id}</span>
                  <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                    {entry.functionName}
                  </span>
                </div>
                <h3 className="mt-1 text-base font-semibold text-foreground">{entry.skill.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => toggleFavorite(entry.skillKey)}
                className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${
                  isFavorite
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                    : "border-border bg-background text-muted-foreground hover:bg-accent"
                }`}
              >
                {isFavorite ? "Favorited" : "Favorite"}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                {entry.skill.category}
              </span>
              <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                {entry.skill.stage}
              </span>
              <span className="rounded-md border border-primary/30 bg-primary/8 px-2 py-0.5 text-[11px] text-foreground">
                Overall {entry.analysis.overallScore.toFixed(1)}/5
              </span>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/90">Ideal for:</span>{" "}
              {entry.skill.idealFor}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{entry.skill.value}</p>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              <div className="rounded-lg border border-border bg-background px-3 py-2">
                Usefulness:{" "}
                <span className="font-medium text-foreground">
                  {entry.analysis.usefulnessScore.toFixed(1)}/5
                </span>
              </div>
              <div className="rounded-lg border border-border bg-background px-3 py-2">
                Complexity:{" "}
                <span className="font-medium text-foreground">
                  {entry.analysis.complexityScore.toFixed(1)}/5
                </span>
              </div>
              <div className="rounded-lg border border-border bg-background px-3 py-2">
                Specificity:{" "}
                <span className="font-medium text-foreground">
                  {entry.analysis.specificityScore.toFixed(1)}/5
                </span>
              </div>
              <div className="rounded-lg border border-border bg-background px-3 py-2">
                Generality:{" "}
                <span className="font-medium text-foreground">
                  {entry.analysis.generalityScore.toFixed(1)}/5
                </span>
              </div>
            </div>

            <details className="mt-3 rounded-xl border border-border bg-background p-3">
              <summary className="cursor-pointer text-xs font-medium text-foreground">
                View build spec and analysis
              </summary>

              <div className="mt-3 space-y-3 text-xs text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground/90">Problem:</span>{" "}
                  {entry.skill.spec.problem}
                </p>
                <p>
                  <span className="font-medium text-foreground/90">Trigger:</span>{" "}
                  {entry.skill.spec.trigger}
                </p>
                <p>
                  <span className="font-medium text-foreground/90">Primary users:</span>{" "}
                  {entry.skill.spec.primaryUsers.join(", ")}
                </p>
                <p>
                  <span className="font-medium text-foreground/90">MVP estimate:</span>{" "}
                  {entry.skill.spec.estimatedBuildWeeks} weeks, {entry.skill.spec.complexity} complexity
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="font-medium text-foreground/90">Inputs</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {entry.skill.spec.inputs.map((item) => (
                        <li key={`${entry.skillKey}:input:${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-foreground/90">Outputs</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {entry.skill.spec.outputs.map((item) => (
                        <li key={`${entry.skillKey}:output:${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-foreground/90">Workflow</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    {entry.skill.spec.workflow.map((step) => (
                      <li key={`${entry.skillKey}:workflow:${step}`}>{step}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="font-medium text-foreground/90">Integrations</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {entry.skill.spec.integrations.map((item) => (
                        <li key={`${entry.skillKey}:integration:${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-foreground/90">Automations</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {entry.skill.spec.automations.map((item) => (
                        <li key={`${entry.skillKey}:automation:${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="font-medium text-foreground/90">KPIs</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {entry.skill.spec.kpis.map((item) => (
                        <li key={`${entry.skillKey}:kpi:${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-foreground/90">Guardrails</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {entry.skill.spec.guardrails.map((item) => (
                        <li key={`${entry.skillKey}:guardrail:${item}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <p>
                  <span className="font-medium text-foreground/90">Rollout motion:</span>{" "}
                  {entry.skill.spec.rolloutMotion}
                </p>
              </div>
            </details>
          </article>
        );
      })}
    </section>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number | string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

function QuickViewCard({
  title,
  description,
  value,
  isActive,
  onClick,
  icon,
}: {
  title: string;
  description: string;
  value: number;
  isActive: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-colors ${
        isActive ? "border-primary/60 bg-primary/8" : "border-border bg-background hover:border-primary/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {icon}
            <span>{title}</span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground">
          {value}
        </div>
      </div>
    </button>
  );
}

function SectionHeader({
  title,
  description,
  total,
}: {
  title: string;
  description: string;
  total: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="rounded-md border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
        Showing: <span className="font-medium text-foreground">{total}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "live" | "planned" }) {
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[11px] ${
        status === "live"
          ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border border-border bg-background text-muted-foreground"
      }`}
    >
      {status === "live" ? "Live now" : "Planned"}
    </span>
  );
}

function EmptyState({ copy }: { copy: string }) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center">
      <p className="text-sm text-muted-foreground">{copy}</p>
    </section>
  );
}

export const Route = createFileRoute("/_chat/business-skills")({
  head: () => ({
    meta: headMetaForPage("businessSkills"),
  }),
  component: BusinessSkillsRouteView,
});

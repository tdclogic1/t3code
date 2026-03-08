import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { SME_APP_CATALOG } from "../src/data/smeAppCatalog";

const specValidator = v.object({
  problem: v.string(),
  targetUsers: v.array(v.string()),
  mvpFeatures: v.array(v.string()),
  coreEntities: v.array(v.string()),
  integrations: v.array(v.string()),
  automationOpportunities: v.array(v.string()),
  kpis: v.array(v.string()),
  complexity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  estimatedBuildWeeks: v.number(),
  pricingModel: v.string(),
  launchMotion: v.string(),
});

export const list = query({
  args: {
    category: v.optional(v.string()),
    complexity: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db.query("smeAppSpecs").collect();
    const normalizedSearch = args.search?.trim().toLowerCase() ?? "";

    return rows
      .filter((row) => (args.category ? row.category === args.category : true))
      .filter((row) => (args.complexity ? row.complexity === args.complexity : true))
      .filter((row) => {
        if (normalizedSearch.length === 0) return true;
        const haystack = [
          row.name,
          row.category,
          row.idealFor,
          row.value,
          row.spec.problem,
          row.spec.pricingModel,
          row.spec.launchMotion,
          ...row.spec.targetUsers,
          ...row.spec.mvpFeatures,
          ...row.spec.coreEntities,
          ...row.spec.integrations,
          ...row.spec.automationOpportunities,
          ...row.spec.kpis,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      })
      .toSorted((left, right) => left.sourceId - right.sourceId);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("smeAppSpecs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const upsert = mutation({
  args: {
    sourceId: v.number(),
    slug: v.string(),
    name: v.string(),
    category: v.string(),
    idealFor: v.string(),
    value: v.string(),
    spec: specValidator,
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("smeAppSpecs")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        sourceId: args.sourceId,
        name: args.name,
        category: args.category,
        idealFor: args.idealFor,
        value: args.value,
        spec: args.spec,
        complexity: args.spec.complexity,
        updatedAt: now,
      });
      return existing._id;
    }

    return ctx.db.insert("smeAppSpecs", {
      sourceId: args.sourceId,
      slug: args.slug,
      name: args.name,
      category: args.category,
      idealFor: args.idealFor,
      value: args.value,
      complexity: args.spec.complexity,
      spec: args.spec,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let inserted = 0;
    let updated = 0;

    for (const idea of SME_APP_CATALOG) {
      const existing = await ctx.db
        .query("smeAppSpecs")
        .withIndex("by_slug", (q) => q.eq("slug", idea.slug))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          sourceId: idea.id,
          name: idea.name,
          category: idea.category,
          idealFor: idea.idealFor,
          value: idea.value,
          complexity: idea.spec.complexity,
          spec: idea.spec,
          updatedAt: now,
        });
        updated += 1;
        continue;
      }

      await ctx.db.insert("smeAppSpecs", {
        sourceId: idea.id,
        slug: idea.slug,
        name: idea.name,
        category: idea.category,
        idealFor: idea.idealFor,
        value: idea.value,
        complexity: idea.spec.complexity,
        spec: idea.spec,
        createdAt: now,
        updatedAt: now,
      });
      inserted += 1;
    }

    return {
      totalCatalog: SME_APP_CATALOG.length,
      inserted,
      updated,
    };
  },
});

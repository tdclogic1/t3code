import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  smeAppSpecs: defineTable({
    slug: v.string(),
    name: v.string(),
    category: v.string(),
    idealFor: v.string(),
    value: v.string(),
    complexity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    spec: v.object({
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
    }),
    sourceId: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_complexity", ["complexity"]),
  controlPlaneEvents: defineTable({
    eventId: v.string(),
    sequence: v.number(),
    eventType: v.string(),
    aggregateKind: v.string(),
    aggregateId: v.string(),
    occurredAt: v.string(),
    commandId: v.optional(v.union(v.string(), v.null())),
    causationEventId: v.optional(v.union(v.string(), v.null())),
    correlationId: v.optional(v.union(v.string(), v.null())),
    source: v.string(),
    sentAt: v.optional(v.string()),
    receivedAt: v.number(),
    event: v.any(),
  })
    .index("by_event_id", ["eventId"])
    .index("by_sequence", ["sequence"])
    .index("by_aggregate", ["aggregateKind", "aggregateId", "sequence"])
    .index("by_type_sequence", ["eventType", "sequence"]),
});

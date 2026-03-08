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
    tenantId: v.string(),
    orgId: v.optional(v.union(v.string(), v.null())),
    workspaceId: v.string(),
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
    eventStorageMode: v.union(v.literal("raw"), v.literal("redacted")),
    eventProjection: v.optional(
      v.object({
        payloadKind: v.union(
          v.literal("null"),
          v.literal("boolean"),
          v.literal("number"),
          v.literal("string"),
          v.literal("array"),
          v.literal("object"),
          v.literal("unknown"),
        ),
        payloadSize: v.optional(v.number()),
        metadataKind: v.union(
          v.literal("null"),
          v.literal("boolean"),
          v.literal("number"),
          v.literal("string"),
          v.literal("array"),
          v.literal("object"),
          v.literal("unknown"),
        ),
        metadataSize: v.optional(v.number()),
      }),
    ),
    event: v.optional(v.any()),
  })
    .index("by_tenant_event_id", ["tenantId", "eventId"])
    .index("by_sequence", ["sequence"])
    .index("by_tenant_sequence", ["tenantId", "sequence"])
    .index("by_workspace_sequence", ["tenantId", "workspaceId", "sequence"])
    .index("by_aggregate", ["tenantId", "aggregateKind", "aggregateId", "sequence"])
    .index("by_type_sequence", ["tenantId", "eventType", "sequence"]),
});

import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

function asObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toNullableString(value: unknown): string | null {
  if (value === null) {
    return null;
  }
  return asString(value);
}

export const ingestEventInternal = internalMutation({
  args: {
    source: v.string(),
    sentAt: v.optional(v.string()),
    event: v.any(),
  },
  handler: async (ctx, args) => {
    const eventObject = asObject(args.event);
    if (!eventObject) {
      return {
        status: "rejected" as const,
        reason: "event must be an object",
      };
    }

    const eventId = asString(eventObject.eventId);
    const sequence = asNumber(eventObject.sequence);
    const eventType = asString(eventObject.type);
    const aggregateKind = asString(eventObject.aggregateKind);
    const aggregateId = asString(eventObject.aggregateId);
    const occurredAt = asString(eventObject.occurredAt);

    if (!eventId || sequence === null || !eventType || !aggregateKind || !aggregateId || !occurredAt) {
      return {
        status: "rejected" as const,
        reason:
          "event requires eventId, sequence, type, aggregateKind, aggregateId, and occurredAt",
      };
    }

    const existing = await ctx.db
      .query("controlPlaneEvents")
      .withIndex("by_event_id", (q) => q.eq("eventId", eventId))
      .unique();
    if (existing) {
      return {
        status: "duplicate" as const,
        eventId,
        sequence: existing.sequence,
        id: existing._id,
      };
    }

    const insertedId = await ctx.db.insert("controlPlaneEvents", {
      eventId,
      sequence,
      eventType,
      aggregateKind,
      aggregateId,
      occurredAt,
      commandId: toNullableString(eventObject.commandId),
      causationEventId: toNullableString(eventObject.causationEventId),
      correlationId: toNullableString(eventObject.correlationId),
      source: args.source,
      ...(args.sentAt ? { sentAt: args.sentAt } : {}),
      receivedAt: Date.now(),
      event: args.event,
    });

    return {
      status: "inserted" as const,
      eventId,
      sequence,
      id: insertedId,
    };
  },
});

export const getLatestSequence = query({
  args: {},
  handler: async (ctx) => {
    const latest = await ctx.db.query("controlPlaneEvents").withIndex("by_sequence").order("desc").first();
    if (!latest) {
      return null;
    }
    return {
      sequence: latest.sequence,
      eventId: latest.eventId,
      occurredAt: latest.occurredAt,
    };
  },
});

export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const clampedLimit = Math.max(1, Math.min(200, Math.floor(args.limit ?? 50)));
    const rows = await ctx.db
      .query("controlPlaneEvents")
      .withIndex("by_sequence")
      .order("desc")
      .take(clampedLimit);

    return rows.map((row) => ({
      _id: row._id,
      eventId: row.eventId,
      sequence: row.sequence,
      eventType: row.eventType,
      aggregateKind: row.aggregateKind,
      aggregateId: row.aggregateId,
      occurredAt: row.occurredAt,
      source: row.source,
      sentAt: row.sentAt ?? null,
      receivedAt: row.receivedAt,
    }));
  },
});


import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

const STORE_RAW_EVENT_ENVS = [
  "T3CODE_CONVEX_STORE_RAW_EVENT",
  "DR_BIOMASS_STORE_RAW_EVENT",
] as const;
type EventValueKind = "null" | "boolean" | "number" | "string" | "array" | "object" | "unknown";

interface EventProjection {
  readonly payloadKind: EventValueKind;
  readonly payloadSize?: number;
  readonly metadataKind: EventValueKind;
  readonly metadataSize?: number;
}

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

function readBooleanEnv(envNames: readonly string[], fallback: boolean): boolean {
  for (const envName of envNames) {
    const raw = process.env[envName]?.trim();
    if (!raw) {
      continue;
    }
    const normalized = raw.toLowerCase();
    if (normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on") {
      return true;
    }
    if (normalized === "0" || normalized === "false" || normalized === "no" || normalized === "off") {
      return false;
    }
  }
  return fallback;
}

function classifyValueKind(value: unknown): EventValueKind {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  const primitiveType = typeof value;
  if (primitiveType === "boolean") {
    return "boolean";
  }
  if (primitiveType === "number") {
    return Number.isFinite(value) ? "number" : "unknown";
  }
  if (primitiveType === "string") {
    return "string";
  }
  if (primitiveType === "object") {
    return "object";
  }
  return "unknown";
}

function summarizeValueSize(value: unknown): number | undefined {
  if (typeof value === "string") {
    return value.length;
  }
  if (Array.isArray(value)) {
    return value.length;
  }
  const record = asObject(value);
  if (record) {
    return Object.keys(record).length;
  }
  return undefined;
}

function buildEventProjection(eventObject: Record<string, unknown>): EventProjection {
  const payload = eventObject.payload;
  const metadata = eventObject.metadata;
  const payloadSize = summarizeValueSize(payload);
  const metadataSize = summarizeValueSize(metadata);

  return {
    payloadKind: classifyValueKind(payload),
    ...(payloadSize === undefined ? {} : { payloadSize }),
    metadataKind: classifyValueKind(metadata),
    ...(metadataSize === undefined ? {} : { metadataSize }),
  };
}

function eventForStorage(input: {
  readonly event: unknown;
  readonly eventObject: Record<string, unknown>;
}): {
  readonly mode: "raw" | "redacted";
  readonly projection: EventProjection;
  readonly rawEvent?: unknown;
} {
  const storeRaw = readBooleanEnv(STORE_RAW_EVENT_ENVS, false);
  const projection = buildEventProjection(input.eventObject);
  if (storeRaw) {
    return {
      mode: "raw",
      projection,
      rawEvent: input.event,
    };
  }
  return {
    mode: "redacted",
    projection,
  };
}

export const ingestEventInternal = internalMutation({
  args: {
    source: v.string(),
    sentAt: v.optional(v.string()),
    tenantId: v.string(),
    orgId: v.optional(v.string()),
    workspaceId: v.string(),
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
      .withIndex("by_tenant_event_id", (q) => q.eq("tenantId", args.tenantId).eq("eventId", eventId))
      .unique();
    if (existing) {
      return {
        status: "duplicate" as const,
        eventId,
        sequence: existing.sequence,
        id: existing._id,
      };
    }

    const storedEvent = eventForStorage({
      event: args.event,
      eventObject,
    });
    const insertedId = await ctx.db.insert("controlPlaneEvents", {
      tenantId: args.tenantId,
      orgId: args.orgId ?? null,
      workspaceId: args.workspaceId,
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
      eventStorageMode: storedEvent.mode,
      eventProjection: storedEvent.projection,
      ...(storedEvent.rawEvent === undefined ? {} : { event: storedEvent.rawEvent }),
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
  args: {
    tenantId: v.string(),
    workspaceId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const latest = args.workspaceId
      ? await ctx.db
          .query("controlPlaneEvents")
          .withIndex("by_workspace_sequence", (q) =>
            q.eq("tenantId", args.tenantId).eq("workspaceId", args.workspaceId!),
          )
          .order("desc")
          .first()
      : await ctx.db
          .query("controlPlaneEvents")
          .withIndex("by_tenant_sequence", (q) => q.eq("tenantId", args.tenantId))
          .order("desc")
          .first();
    if (!latest) {
      return null;
    }
    return {
      tenantId: latest.tenantId,
      workspaceId: latest.workspaceId,
      sequence: latest.sequence,
      eventId: latest.eventId,
      occurredAt: latest.occurredAt,
    };
  },
});

export const listRecent = query({
  args: {
    tenantId: v.string(),
    workspaceId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const clampedLimit = Math.max(1, Math.min(200, Math.floor(args.limit ?? 50)));
    const rows = args.workspaceId
      ? await ctx.db
          .query("controlPlaneEvents")
          .withIndex("by_workspace_sequence", (q) =>
            q.eq("tenantId", args.tenantId).eq("workspaceId", args.workspaceId!),
          )
          .order("desc")
          .take(clampedLimit)
      : await ctx.db
          .query("controlPlaneEvents")
          .withIndex("by_tenant_sequence", (q) => q.eq("tenantId", args.tenantId))
          .order("desc")
          .take(clampedLimit);

    return rows.map((row) => ({
      _id: row._id,
      tenantId: row.tenantId,
      workspaceId: row.workspaceId,
      eventId: row.eventId,
      sequence: row.sequence,
      eventType: row.eventType,
      aggregateKind: row.aggregateKind,
      aggregateId: row.aggregateId,
      occurredAt: row.occurredAt,
      source: row.source,
      sentAt: row.sentAt ?? null,
      receivedAt: row.receivedAt,
      eventStorageMode: row.eventStorageMode,
      eventProjection: row.eventProjection ?? null,
    }));
  },
});

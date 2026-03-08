import type { OrchestrationEvent } from "@t3tools/contracts";
import { Cause, Effect, Layer, Queue, Schema, Stream } from "effect";

import { OrchestrationEngineService } from "../Services/OrchestrationEngine.ts";
import {
  ControlPlaneSyncReactor,
  type ControlPlaneSyncReactorShape,
} from "../Services/ControlPlaneSyncReactor.ts";

const CONTROL_PLANE_SYNC_URL_ENVS = ["T3CODE_CONVEX_SYNC_URL", "DR_BIOMASS_SYNC_URL"] as const;
const CONTROL_PLANE_SYNC_AUTH_TOKEN_ENVS = [
  "T3CODE_CONVEX_SYNC_AUTH_TOKEN",
  "DR_BIOMASS_SYNC_AUTH_TOKEN",
] as const;
const CONTROL_PLANE_SYNC_TIMEOUT_MS_ENVS = [
  "T3CODE_CONVEX_SYNC_TIMEOUT_MS",
  "DR_BIOMASS_SYNC_TIMEOUT_MS",
] as const;
const CONTROL_PLANE_SYNC_QUEUE_CAPACITY_ENVS = [
  "T3CODE_CONVEX_SYNC_QUEUE_CAPACITY",
  "DR_BIOMASS_SYNC_QUEUE_CAPACITY",
] as const;
const CONTROL_PLANE_SYNC_REQUIRE_AUTH_ENVS = [
  "T3CODE_CONVEX_SYNC_REQUIRE_AUTH",
  "DR_BIOMASS_SYNC_REQUIRE_AUTH",
] as const;
const CONTROL_PLANE_SYNC_ALLOW_INSECURE_NO_AUTH_ENVS = [
  "T3CODE_CONVEX_SYNC_ALLOW_INSECURE_NO_AUTH",
  "DR_BIOMASS_SYNC_ALLOW_INSECURE_NO_AUTH",
] as const;
const CONTROL_PLANE_TENANT_ID_ENVS = [
  "T3CODE_CONTROL_PLANE_TENANT_ID",
  "T3CODE_TENANT_ID",
  "DR_BIOMASS_TENANT_ID",
] as const;
const CONTROL_PLANE_ORG_ID_ENVS = [
  "T3CODE_CONTROL_PLANE_ORG_ID",
  "T3CODE_ORG_ID",
  "DR_BIOMASS_ORG_ID",
] as const;
const CONTROL_PLANE_WORKSPACE_ID_ENVS = [
  "T3CODE_CONTROL_PLANE_WORKSPACE_ID",
  "T3CODE_WORKSPACE_ID",
  "DR_BIOMASS_WORKSPACE_ID",
] as const;

const DEFAULT_SYNC_TIMEOUT_MS = 5_000;
const DEFAULT_SYNC_QUEUE_CAPACITY = 2_000;
const MAX_SYNC_TIMEOUT_MS = 60_000;
const MAX_SYNC_QUEUE_CAPACITY = 20_000;
const MAX_DELIVERY_ATTEMPTS = 4;
const BASE_DELIVERY_RETRY_DELAY_MS = 250;
const MAX_DELIVERY_RETRY_DELAY_MS = 4_000;

class ControlPlaneSyncDeliveryError extends Schema.TaggedErrorClass<ControlPlaneSyncDeliveryError>()(
  "ControlPlaneSyncDeliveryError",
  {
    detail: Schema.String,
    cause: Schema.optional(Schema.Defect),
  },
) {}

interface ControlPlaneBoundary {
  readonly tenantId: string;
  readonly orgId: string | undefined;
  readonly workspaceId: string;
}

function readFirstNonEmptyEnv(envNames: readonly string[]): string | undefined {
  for (const envName of envNames) {
    const raw = process.env[envName];
    if (!raw) {
      continue;
    }
    const trimmed = raw.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }
  return undefined;
}

function readPositiveIntegerEnv(
  envNames: readonly string[],
  fallback: number,
  max: number,
): number {
  const raw = readFirstNonEmptyEnv(envNames);
  if (!raw) {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(parsed, max);
}

function readBooleanEnv(envNames: readonly string[], fallback: boolean): boolean {
  const raw = readFirstNonEmptyEnv(envNames);
  if (!raw) {
    return fallback;
  }
  const normalized = raw.toLowerCase();
  if (normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on") {
    return true;
  }
  if (normalized === "0" || normalized === "false" || normalized === "no" || normalized === "off") {
    return false;
  }
  return fallback;
}

function retryDelayMsForAttempt(attempt: number): number {
  const exponential = BASE_DELIVERY_RETRY_DELAY_MS * 2 ** Math.max(0, attempt - 1);
  return Math.min(exponential, MAX_DELIVERY_RETRY_DELAY_MS);
}

function readBoundaryConfig():
  | { readonly ok: true; readonly boundary: ControlPlaneBoundary }
  | {
      readonly ok: false;
      readonly reason: "missing-tenant-id" | "missing-workspace-id";
    } {
  const tenantId = readFirstNonEmptyEnv(CONTROL_PLANE_TENANT_ID_ENVS);
  if (!tenantId) {
    return {
      ok: false,
      reason: "missing-tenant-id",
    };
  }

  const workspaceId = readFirstNonEmptyEnv(CONTROL_PLANE_WORKSPACE_ID_ENVS);
  if (!workspaceId) {
    return {
      ok: false,
      reason: "missing-workspace-id",
    };
  }

  return {
    ok: true,
    boundary: {
      tenantId,
      orgId: readFirstNonEmptyEnv(CONTROL_PLANE_ORG_ID_ENVS),
      workspaceId,
    },
  };
}

function readSyncConfig():
  | {
      readonly enabled: false;
      readonly reason:
        | "missing-url"
        | "invalid-url"
        | "missing-auth-token"
        | "missing-tenant-id"
        | "missing-workspace-id";
      readonly rawUrl?: string;
    }
  | {
      readonly enabled: true;
      readonly url: URL;
      readonly authToken: string | undefined;
      readonly timeoutMs: number;
      readonly queueCapacity: number;
      readonly boundary: ControlPlaneBoundary;
    } {
  const rawUrl = readFirstNonEmptyEnv(CONTROL_PLANE_SYNC_URL_ENVS);
  if (!rawUrl) {
    return {
      enabled: false,
      reason: "missing-url",
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return {
      enabled: false,
      reason: "invalid-url",
      rawUrl,
    };
  }

  const allowInsecureNoAuth = readBooleanEnv(CONTROL_PLANE_SYNC_ALLOW_INSECURE_NO_AUTH_ENVS, false);
  const requireAuth = allowInsecureNoAuth
    ? false
    : readBooleanEnv(CONTROL_PLANE_SYNC_REQUIRE_AUTH_ENVS, true);
  const authToken = readFirstNonEmptyEnv(CONTROL_PLANE_SYNC_AUTH_TOKEN_ENVS);
  if (requireAuth && !authToken) {
    return {
      enabled: false,
      reason: "missing-auth-token",
      rawUrl,
    };
  }

  const boundaryConfig = readBoundaryConfig();
  if (!boundaryConfig.ok) {
    return {
      enabled: false,
      reason: boundaryConfig.reason,
      rawUrl,
    };
  }

  return {
    enabled: true,
    url: parsedUrl,
    authToken,
    timeoutMs: readPositiveIntegerEnv(
      CONTROL_PLANE_SYNC_TIMEOUT_MS_ENVS,
      DEFAULT_SYNC_TIMEOUT_MS,
      MAX_SYNC_TIMEOUT_MS,
    ),
    queueCapacity: readPositiveIntegerEnv(
      CONTROL_PLANE_SYNC_QUEUE_CAPACITY_ENVS,
      DEFAULT_SYNC_QUEUE_CAPACITY,
      MAX_SYNC_QUEUE_CAPACITY,
    ),
    boundary: boundaryConfig.boundary,
  };
}

function buildRequestHeaders(authToken: string | undefined): Record<string, string> {
  return authToken
    ? {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      }
    : {
        "Content-Type": "application/json",
      };
}

function mirrorEventToControlPlane(input: {
  readonly syncUrl: URL;
  readonly authToken: string | undefined;
  readonly timeoutMs: number;
  readonly boundary: ControlPlaneBoundary;
  readonly event: OrchestrationEvent;
}): Effect.Effect<void, ControlPlaneSyncDeliveryError> {
  return Effect.tryPromise({
    try: async () => {
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= MAX_DELIVERY_ATTEMPTS; attempt += 1) {
        const timeoutController = new AbortController();
        const timeoutHandle = setTimeout(() => {
          timeoutController.abort();
        }, input.timeoutMs);

        try {
          const response = await fetch(input.syncUrl, {
            method: "POST",
            headers: buildRequestHeaders(input.authToken),
            body: JSON.stringify({
              source: "t3code.orchestration.domain-event",
              sentAt: new Date().toISOString(),
              tenantId: input.boundary.tenantId,
              ...(input.boundary.orgId ? { orgId: input.boundary.orgId } : {}),
              workspaceId: input.boundary.workspaceId,
              event: input.event,
            }),
            signal: timeoutController.signal,
          });

          if (response.ok) {
            return;
          }

          const responseText = (await response.text().catch(() => "")).trim();
          const message =
            responseText.length > 0
              ? `Control-plane sync failed (${response.status} ${response.statusText}): ${responseText}`
              : `Control-plane sync failed (${response.status} ${response.statusText}).`;
          const retryable = response.status === 429 || response.status >= 500;
          if (!retryable || attempt >= MAX_DELIVERY_ATTEMPTS) {
            throw new Error(message);
          }
          lastError = new Error(message);
        } catch (cause) {
          const error = cause instanceof Error ? cause : new Error(String(cause));
          lastError = error;
          if (attempt >= MAX_DELIVERY_ATTEMPTS) {
            throw error;
          }
        } finally {
          clearTimeout(timeoutHandle);
        }

        await new Promise((resolve) => {
          setTimeout(resolve, retryDelayMsForAttempt(attempt));
        });
      }

      throw lastError ?? new Error("Control-plane sync failed after retries.");
    },
    catch: (cause) =>
      new ControlPlaneSyncDeliveryError({
        detail:
          cause instanceof Error
            ? cause.message
            : `Control-plane sync failed: ${String(cause)}`,
        cause,
      }),
  });
}

const make = Effect.gen(function* () {
  const orchestrationEngine = yield* OrchestrationEngineService;
  const config = readSyncConfig();

  if (!config.enabled) {
    if (config.reason === "missing-url") {
      return {
        start: Effect.void,
      } satisfies ControlPlaneSyncReactorShape;
    }

    const details = (() => {
      switch (config.reason) {
        case "invalid-url":
          return `invalid sync URL${config.rawUrl ? `: ${config.rawUrl}` : ""}`;
        case "missing-auth-token":
          return `missing auth token (${CONTROL_PLANE_SYNC_AUTH_TOKEN_ENVS.join(" or ")})`;
        case "missing-tenant-id":
          return `missing tenant id (${CONTROL_PLANE_TENANT_ID_ENVS.join(" or ")})`;
        case "missing-workspace-id":
          return `missing workspace id (${CONTROL_PLANE_WORKSPACE_ID_ENVS.join(" or ")})`;
      }
    })();
    yield* Effect.logError("control-plane sync configuration invalid", {
      reason: config.reason,
      details,
    });
    return yield* Effect.die(
      new Error(`Control-plane sync misconfigured: ${details}.`),
    );
  }

  const start: ControlPlaneSyncReactorShape["start"] = Effect.gen(function* () {
    yield* Effect.logInfo("control-plane sync enabled", {
      targetHost: config.url.host,
      timeoutMs: config.timeoutMs,
      queueCapacity: config.queueCapacity,
      authConfigured: Boolean(config.authToken),
      tenantId: config.boundary.tenantId,
      workspaceId: config.boundary.workspaceId,
      hasOrgId: Boolean(config.boundary.orgId),
    });

    const queue = yield* Queue.dropping<OrchestrationEvent>(config.queueCapacity);
    yield* Effect.addFinalizer(() => Queue.shutdown(queue).pipe(Effect.asVoid));

    const processEvent = (event: OrchestrationEvent) =>
      mirrorEventToControlPlane({
        syncUrl: config.url,
        authToken: config.authToken,
        timeoutMs: config.timeoutMs,
        boundary: config.boundary,
        event,
      }).pipe(
        Effect.catchCause((cause) =>
          Effect.logWarning("control-plane sync event delivery failed", {
            eventId: event.eventId,
            eventType: event.type,
            cause: Cause.pretty(cause),
          }),
        ),
      );

    yield* Effect.forkScoped(
      Effect.forever(Queue.take(queue).pipe(Effect.flatMap(processEvent))),
    );

    yield* Effect.forkScoped(
      Stream.runForEach(orchestrationEngine.streamDomainEvents, (event) =>
        Queue.offer(queue, event).pipe(
          Effect.flatMap((accepted) =>
            accepted
              ? Effect.void
              : Effect.logWarning("control-plane sync queue full; dropping event", {
                  eventId: event.eventId,
                  eventType: event.type,
                }),
          ),
        ),
      ),
    );
  });

  return {
    start,
  } satisfies ControlPlaneSyncReactorShape;
});

export const ControlPlaneSyncReactorLive = Layer.effect(ControlPlaneSyncReactor, make);

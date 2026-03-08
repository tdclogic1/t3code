import type { OrchestrationEvent } from "@t3tools/contracts";
import { Cause, Effect, Layer, Queue, Schema, Stream } from "effect";

import { OrchestrationEngineService } from "../Services/OrchestrationEngine.ts";
import {
  ControlPlaneSyncReactor,
  type ControlPlaneSyncReactorShape,
} from "../Services/ControlPlaneSyncReactor.ts";

const CONTROL_PLANE_SYNC_URL_ENV = "T3CODE_CONVEX_SYNC_URL";
const CONTROL_PLANE_SYNC_AUTH_TOKEN_ENV = "T3CODE_CONVEX_SYNC_AUTH_TOKEN";
const CONTROL_PLANE_SYNC_TIMEOUT_MS_ENV = "T3CODE_CONVEX_SYNC_TIMEOUT_MS";
const CONTROL_PLANE_SYNC_QUEUE_CAPACITY_ENV = "T3CODE_CONVEX_SYNC_QUEUE_CAPACITY";

const DEFAULT_SYNC_TIMEOUT_MS = 5_000;
const DEFAULT_SYNC_QUEUE_CAPACITY = 2_000;
const MAX_SYNC_TIMEOUT_MS = 60_000;
const MAX_SYNC_QUEUE_CAPACITY = 20_000;

class ControlPlaneSyncDeliveryError extends Schema.TaggedErrorClass<ControlPlaneSyncDeliveryError>()(
  "ControlPlaneSyncDeliveryError",
  {
    detail: Schema.String,
    cause: Schema.optional(Schema.Defect),
  },
) {}

function readNonEmptyEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readPositiveIntegerEnv(name: string, fallback: number, max: number): number {
  const raw = readNonEmptyEnv(name);
  if (!raw) {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(parsed, max);
}

function readSyncConfig():
  | {
      readonly enabled: false;
      readonly reason: "missing-url" | "invalid-url";
      readonly rawUrl?: string;
    }
  | {
      readonly enabled: true;
      readonly url: URL;
      readonly authToken: string | undefined;
      readonly timeoutMs: number;
      readonly queueCapacity: number;
    } {
  const rawUrl = readNonEmptyEnv(CONTROL_PLANE_SYNC_URL_ENV);
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

  return {
    enabled: true,
    url: parsedUrl,
    authToken: readNonEmptyEnv(CONTROL_PLANE_SYNC_AUTH_TOKEN_ENV),
    timeoutMs: readPositiveIntegerEnv(
      CONTROL_PLANE_SYNC_TIMEOUT_MS_ENV,
      DEFAULT_SYNC_TIMEOUT_MS,
      MAX_SYNC_TIMEOUT_MS,
    ),
    queueCapacity: readPositiveIntegerEnv(
      CONTROL_PLANE_SYNC_QUEUE_CAPACITY_ENV,
      DEFAULT_SYNC_QUEUE_CAPACITY,
      MAX_SYNC_QUEUE_CAPACITY,
    ),
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
  readonly event: OrchestrationEvent;
}): Effect.Effect<void, ControlPlaneSyncDeliveryError> {
  return Effect.tryPromise({
    try: async () => {
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
            event: input.event,
          }),
          signal: timeoutController.signal,
        });

        if (response.ok) {
          return;
        }

        const responseText = (await response.text().catch(() => "")).trim();
        throw new Error(
          responseText.length > 0
            ? `Control-plane sync failed (${response.status} ${response.statusText}): ${responseText}`
            : `Control-plane sync failed (${response.status} ${response.statusText}).`,
        );
      } finally {
        clearTimeout(timeoutHandle);
      }
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
    if (config.reason === "invalid-url") {
      yield* Effect.logWarning("control-plane sync disabled due to invalid URL", {
        env: CONTROL_PLANE_SYNC_URL_ENV,
        rawUrl: config.rawUrl,
      });
    }
    return {
      start: Effect.void,
    } satisfies ControlPlaneSyncReactorShape;
  }

  const start: ControlPlaneSyncReactorShape["start"] = Effect.gen(function* () {
    yield* Effect.logInfo("control-plane sync enabled", {
      targetHost: config.url.host,
      timeoutMs: config.timeoutMs,
      queueCapacity: config.queueCapacity,
      authConfigured: Boolean(config.authToken),
    });

    const queue = yield* Queue.dropping<OrchestrationEvent>(config.queueCapacity);
    yield* Effect.addFinalizer(() => Queue.shutdown(queue).pipe(Effect.asVoid));

    const processEvent = (event: OrchestrationEvent) =>
      mirrorEventToControlPlane({
        syncUrl: config.url,
        authToken: config.authToken,
        timeoutMs: config.timeoutMs,
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

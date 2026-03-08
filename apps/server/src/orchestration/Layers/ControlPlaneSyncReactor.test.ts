import {
  CommandId,
  EventId,
  ThreadId,
  type OrchestrationEvent,
  type OrchestrationReadModel,
} from "@t3tools/contracts";
import { Effect, Exit, Layer, ManagedRuntime, Scope, Stream } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { OrchestrationEventStoreError } from "../../persistence/Errors.ts";
import type { OrchestrationEngineShape } from "../Services/OrchestrationEngine.ts";
import { OrchestrationEngineService } from "../Services/OrchestrationEngine.ts";
import { ControlPlaneSyncReactor } from "../Services/ControlPlaneSyncReactor.ts";
import { ControlPlaneSyncReactorLive } from "./ControlPlaneSyncReactor.ts";

const CONTROL_PLANE_ENV_KEYS = [
  "T3CODE_CONVEX_SYNC_URL",
  "DR_BIOMASS_SYNC_URL",
  "T3CODE_CONVEX_SYNC_AUTH_TOKEN",
  "DR_BIOMASS_SYNC_AUTH_TOKEN",
  "T3CODE_CONVEX_SYNC_TIMEOUT_MS",
  "DR_BIOMASS_SYNC_TIMEOUT_MS",
  "T3CODE_CONVEX_SYNC_QUEUE_CAPACITY",
  "DR_BIOMASS_SYNC_QUEUE_CAPACITY",
  "T3CODE_CONVEX_SYNC_REQUIRE_AUTH",
  "DR_BIOMASS_SYNC_REQUIRE_AUTH",
  "T3CODE_CONVEX_SYNC_ALLOW_INSECURE_NO_AUTH",
  "DR_BIOMASS_SYNC_ALLOW_INSECURE_NO_AUTH",
  "T3CODE_CONTROL_PLANE_TENANT_ID",
  "T3CODE_TENANT_ID",
  "DR_BIOMASS_TENANT_ID",
  "T3CODE_CONTROL_PLANE_ORG_ID",
  "T3CODE_ORG_ID",
  "DR_BIOMASS_ORG_ID",
  "T3CODE_CONTROL_PLANE_WORKSPACE_ID",
  "T3CODE_WORKSPACE_ID",
  "DR_BIOMASS_WORKSPACE_ID",
] as const;

function setEnv(values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) {
    process.env[key] = value;
  }
}

function restoreEnv(snapshot: ReadonlyMap<string, string | undefined>) {
  for (const [key, value] of snapshot.entries()) {
    if (value === undefined) {
      delete process.env[key];
      continue;
    }
    process.env[key] = value;
  }
}

function makeNoopReadModel(): OrchestrationReadModel {
  const now = "2026-03-08T00:00:00.000Z";
  return {
    snapshotSequence: 0,
    projects: [],
    threads: [],
    updatedAt: now,
  };
}

function makeEngine(events: Stream.Stream<OrchestrationEvent>): OrchestrationEngineShape {
  return {
    getReadModel: () => Effect.succeed(makeNoopReadModel()),
    readEvents: () => Stream.empty as Stream.Stream<OrchestrationEvent, OrchestrationEventStoreError>,
    dispatch: () => Effect.die(new Error("dispatch should not be used in sync reactor tests")),
    streamDomainEvents: events,
  };
}

function makeRuntime(events: ReadonlyArray<OrchestrationEvent>) {
  return ManagedRuntime.make(
    ControlPlaneSyncReactorLive.pipe(
      Layer.provide(
        Layer.succeed(OrchestrationEngineService, makeEngine(Stream.fromIterable(events))),
      ),
    ),
  );
}

function makeTestEvent(): OrchestrationEvent {
  return {
    sequence: 1,
    eventId: EventId.makeUnsafe("evt-1"),
    type: "thread.created",
    aggregateKind: "thread",
    aggregateId: ThreadId.makeUnsafe("thread-1"),
    occurredAt: "2026-03-08T00:00:00.000Z",
    commandId: CommandId.makeUnsafe("cmd-1"),
    causationEventId: null,
    correlationId: null,
    metadata: {},
    payload: {} as never,
  };
}

describe("ControlPlaneSyncReactor", () => {
  let originalEnv = new Map<string, string | undefined>();
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    originalEnv = new Map(CONTROL_PLANE_ENV_KEYS.map((key) => [key, process.env[key]]));
    for (const key of CONTROL_PLANE_ENV_KEYS) {
      delete process.env[key];
    }
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    restoreEnv(originalEnv);
    vi.restoreAllMocks();
  });

  it("fails fast when sync URL is configured without a tenant id", async () => {
    setEnv({
      T3CODE_CONVEX_SYNC_URL: "https://control-plane.example/api/control-plane/orchestration-event",
      T3CODE_CONVEX_SYNC_AUTH_TOKEN: "test-token",
      T3CODE_CONTROL_PLANE_WORKSPACE_ID: "workspace-1",
    });

    const runtime = makeRuntime([]);
    try {
      await expect(runtime.runPromise(Effect.service(ControlPlaneSyncReactor))).rejects.toThrow(
        /missing tenant id/i,
      );
    } finally {
      await runtime.dispose();
    }
  });

  it("mirrors events using DR_BIOMASS alias envs", async () => {
    setEnv({
      DR_BIOMASS_SYNC_URL: "https://control-plane.example/api/control-plane/orchestration-event",
      DR_BIOMASS_SYNC_AUTH_TOKEN: "dr-token",
      DR_BIOMASS_TENANT_ID: "tenant-dr",
      DR_BIOMASS_ORG_ID: "org-dr",
      DR_BIOMASS_WORKSPACE_ID: "workspace-dr",
    });

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 200, statusText: "OK" }));
    globalThis.fetch = fetchMock;

    const runtime = makeRuntime([makeTestEvent()]);
    const scope = await Effect.runPromise(Scope.make("sequential"));
    try {
      const reactor = await runtime.runPromise(Effect.service(ControlPlaneSyncReactor));
      await Effect.runPromise(reactor.start.pipe(Scope.provide(scope)));

      await vi.waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(1);
      });

      const [requestUrl, requestInit] = fetchMock.mock.calls[0] ?? [];
      expect(String(requestUrl)).toBe(
        "https://control-plane.example/api/control-plane/orchestration-event",
      );
      expect(requestInit?.method).toBe("POST");
      expect((requestInit?.headers as Record<string, string>)?.Authorization).toBe(
        "Bearer dr-token",
      );

      const payload = JSON.parse(String(requestInit?.body)) as {
        tenantId: string;
        orgId?: string;
        workspaceId: string;
        event: {
          eventId: string;
        };
      };
      expect(payload.tenantId).toBe("tenant-dr");
      expect(payload.orgId).toBe("org-dr");
      expect(payload.workspaceId).toBe("workspace-dr");
      expect(payload.event.eventId).toBe("evt-1");
    } finally {
      await Effect.runPromise(Scope.close(scope, Exit.void));
      await runtime.dispose();
    }
  });
});

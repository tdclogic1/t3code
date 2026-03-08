import { httpAction, httpRouter } from "convex/server";

import { internal } from "./_generated/api";

const CONTROL_PLANE_AUTH_TOKEN_ENVS = [
  "T3CODE_CONVEX_SYNC_AUTH_TOKEN",
  "DR_BIOMASS_SYNC_AUTH_TOKEN",
] as const;
const CONTROL_PLANE_REQUIRE_AUTH_ENV = "T3CODE_CONVEX_SYNC_REQUIRE_AUTH";
const DR_BIOMASS_REQUIRE_AUTH_ENV = "DR_BIOMASS_SYNC_REQUIRE_AUTH";

function asObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
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

function readExpectedAuthToken(): string | undefined {
  return readFirstNonEmptyEnv(CONTROL_PLANE_AUTH_TOKEN_ENVS);
}

function readRequireAuthOverride(): boolean | undefined {
  const raw =
    process.env[CONTROL_PLANE_REQUIRE_AUTH_ENV]?.trim() ??
    process.env[DR_BIOMASS_REQUIRE_AUTH_ENV]?.trim();
  if (!raw) {
    return undefined;
  }
  const normalized = raw.toLowerCase();
  if (normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on") {
    return true;
  }
  if (normalized === "0" || normalized === "false" || normalized === "no" || normalized === "off") {
    return false;
  }
  return undefined;
}

function shouldRequireAuth(): boolean {
  const override = readRequireAuthOverride();
  if (override !== undefined) {
    return override;
  }
  const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase();
  return nodeEnv !== "development" && nodeEnv !== "test";
}

function readBearerToken(authorizationHeader: string | null): string | null {
  if (!authorizationHeader) {
    return null;
  }
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return null;
  }
  const token = match[1]?.trim();
  return token && token.length > 0 ? token : null;
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

const ingestOrchestrationEvent = httpAction(async (ctx, request) => {
  const requireAuth = shouldRequireAuth();
  const expectedToken = readExpectedAuthToken();
  if (requireAuth) {
    if (!expectedToken) {
      return jsonResponse(500, {
        ok: false,
        error: `Server misconfiguration: one of ${CONTROL_PLANE_AUTH_TOKEN_ENVS.join(
          " or ",
        )} is required.`,
      });
    }
    const providedToken = readBearerToken(request.headers.get("authorization"));
    if (providedToken !== expectedToken) {
      return jsonResponse(401, { ok: false, error: "Unauthorized" });
    }
  } else if (expectedToken) {
    const providedToken = readBearerToken(request.headers.get("authorization"));
    if (providedToken !== expectedToken) {
      return jsonResponse(401, { ok: false, error: "Unauthorized" });
    }
  }

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return jsonResponse(400, { ok: false, error: "Invalid JSON payload" });
  }

  const payload = asObject(parsedBody);
  if (!payload) {
    return jsonResponse(400, { ok: false, error: "Payload must be a JSON object" });
  }

  const sourceCandidate = typeof payload.source === "string" ? payload.source.trim() : "";
  const sentAtCandidate = typeof payload.sentAt === "string" ? payload.sentAt.trim() : "";
  const tenantIdCandidate = typeof payload.tenantId === "string" ? payload.tenantId.trim() : "";
  const orgIdCandidate = typeof payload.orgId === "string" ? payload.orgId.trim() : "";
  const workspaceIdCandidate =
    typeof payload.workspaceId === "string" ? payload.workspaceId.trim() : "";
  const event = payload.event;
  if (event === undefined) {
    return jsonResponse(400, { ok: false, error: "Missing event payload" });
  }
  if (tenantIdCandidate.length === 0) {
    return jsonResponse(400, { ok: false, error: "Missing tenantId" });
  }
  if (workspaceIdCandidate.length === 0) {
    return jsonResponse(400, { ok: false, error: "Missing workspaceId" });
  }

  const result = await ctx.runMutation(internal.controlPlaneSync.ingestEventInternal, {
    source: sourceCandidate.length > 0 ? sourceCandidate : "unknown",
    ...(sentAtCandidate.length > 0 ? { sentAt: sentAtCandidate } : {}),
    tenantId: tenantIdCandidate,
    ...(orgIdCandidate.length > 0 ? { orgId: orgIdCandidate } : {}),
    workspaceId: workspaceIdCandidate,
    event,
  });

  if (result.status === "rejected") {
    return jsonResponse(400, {
      ok: false,
      error: result.reason,
    });
  }

  return jsonResponse(200, {
    ok: true,
    result,
  });
});

const health = httpAction(async () =>
  jsonResponse(200, {
    ok: true,
    service: "t3code-control-plane-sync",
  }),
);

const http = httpRouter();

http.route({
  path: "/api/control-plane/orchestration-event",
  method: "POST",
  handler: ingestOrchestrationEvent,
});

http.route({
  path: "/api/control-plane/health",
  method: "GET",
  handler: health,
});

export default http;

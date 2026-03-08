import { httpAction, httpRouter } from "convex/server";

import { internal } from "./_generated/api";

const CONTROL_PLANE_AUTH_TOKEN_ENV = "T3CODE_CONVEX_SYNC_AUTH_TOKEN";

function asObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readExpectedAuthToken(): string | undefined {
  const raw = process.env[CONTROL_PLANE_AUTH_TOKEN_ENV];
  if (!raw) {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
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
  const expectedToken = readExpectedAuthToken();
  if (expectedToken) {
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
  const event = payload.event;
  if (event === undefined) {
    return jsonResponse(400, { ok: false, error: "Missing event payload" });
  }

  const result = await ctx.runMutation(internal.controlPlaneSync.ingestEventInternal, {
    source: sourceCandidate.length > 0 ? sourceCandidate : "unknown",
    ...(sentAtCandidate.length > 0 ? { sentAt: sentAtCandidate } : {}),
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


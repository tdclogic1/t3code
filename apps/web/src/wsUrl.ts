const DEFAULT_DEV_SERVER_WS_PORT = "3773";
const LOCAL_WEB_DEV_PORTS = new Set(["5173", "5733", "5734"]);

function normalizeProtocol(protocol: string | undefined): "ws:" | "wss:" {
  return protocol === "https:" ? "wss:" : "ws:";
}

function isLikelyLocalDevHost(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function shouldUseLocalDevWsFallback(input: { hostname: string; port: string }): boolean {
  return isLikelyLocalDevHost(input.hostname) && LOCAL_WEB_DEV_PORTS.has(input.port);
}

export function resolveWsUrl(explicitUrl?: string): string {
  if (explicitUrl && explicitUrl.length > 0) {
    return explicitUrl;
  }

  const bridgeUrl = window.desktopBridge?.getWsUrl();
  if (bridgeUrl && bridgeUrl.length > 0) {
    return bridgeUrl;
  }

  const envUrl = import.meta.env.VITE_WS_URL as string | undefined;
  if (envUrl && envUrl.length > 0) {
    return envUrl;
  }

  const protocol = normalizeProtocol(window.location.protocol);
  const hostname = window.location.hostname;
  const port = window.location.port;

  if (shouldUseLocalDevWsFallback({ hostname, port })) {
    return `${protocol}//${hostname}:${DEFAULT_DEV_SERVER_WS_PORT}`;
  }

  return `${protocol}//${hostname}:${port}`;
}

export function wsUrlToHttpOrigin(wsUrl: string): string {
  const httpUrl = wsUrl.replace(/^wss:/, "https:").replace(/^ws:/, "http:");
  try {
    return new URL(httpUrl).origin;
  } catch {
    return httpUrl;
  }
}

export function resolveWsHttpOrigin(): string {
  if (typeof window === "undefined") return "";
  return wsUrlToHttpOrigin(resolveWsUrl());
}

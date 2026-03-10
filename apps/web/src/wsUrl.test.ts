import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { resolveWsHttpOrigin, resolveWsUrl, wsUrlToHttpOrigin } from "./wsUrl";

function setWindow(input: {
  readonly protocol: string;
  readonly hostname: string;
  readonly port: string;
  readonly bridgeUrl?: string;
}) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      location: {
        protocol: input.protocol,
        hostname: input.hostname,
        port: input.port,
      },
      desktopBridge: input.bridgeUrl
        ? {
            getWsUrl: () => input.bridgeUrl,
          }
        : undefined,
    },
  });
}

describe("wsUrl", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_WS_URL", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers explicit url", () => {
    setWindow({ protocol: "http:", hostname: "localhost", port: "5173" });
    expect(resolveWsUrl("ws://localhost:9999")).toBe("ws://localhost:9999");
  });

  it("uses bridge url when present", () => {
    setWindow({
      protocol: "http:",
      hostname: "localhost",
      port: "5173",
      bridgeUrl: "ws://localhost:4444?token=abc",
    });
    expect(resolveWsUrl()).toBe("ws://localhost:4444?token=abc");
  });

  it("uses env ws url when present", () => {
    vi.stubEnv("VITE_WS_URL", "ws://localhost:3774");
    setWindow({ protocol: "http:", hostname: "localhost", port: "5173" });
    expect(resolveWsUrl()).toBe("ws://localhost:3774");
  });

  it("falls back to backend ws port in local web dev", () => {
    setWindow({ protocol: "http:", hostname: "localhost", port: "5173" });
    expect(resolveWsUrl()).toBe("ws://localhost:3773");
    expect(resolveWsHttpOrigin()).toBe("http://localhost:3773");
  });

  it("keeps same host and port outside known local web dev ports", () => {
    setWindow({ protocol: "http:", hostname: "localhost", port: "3020" });
    expect(resolveWsUrl()).toBe("ws://localhost:3020");
  });

  it("converts ws url to http origin", () => {
    expect(wsUrlToHttpOrigin("wss://example.com:4444/path?q=1")).toBe("https://example.com:4444");
  });
});

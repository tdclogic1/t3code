import { queryOptions } from "@tanstack/react-query";
import { ensureNativeApi } from "~/nativeApi";

export const serverQueryKeys = {
  all: ["server"] as const,
  config: () => ["server", "config"] as const,
  kpiSummary: () => ["server", "kpi-summary"] as const,
};

export function serverConfigQueryOptions() {
  return queryOptions({
    queryKey: serverQueryKeys.config(),
    queryFn: async () => {
      const api = ensureNativeApi();
      return api.server.getConfig();
    },
    staleTime: Infinity,
  });
}

export function serverKpiSummaryQueryOptions() {
  return queryOptions({
    queryKey: serverQueryKeys.kpiSummary(),
    queryFn: async () => {
      const api = ensureNativeApi();
      return api.server.getKpiSummary();
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

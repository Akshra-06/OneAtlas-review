// =============================================================================
// apps/api/src/telemetry/metrics.ts
// Simple in-memory metrics counters.
// =============================================================================

export interface MetricsSnapshot {
  requests: number;
  errors: number;
  totalLatencyMs: number;
  averageLatencyMs: number;
}

let requests = 0;
let errors = 0;
let totalLatencyMs = 0;

export async function recordRequest(): Promise<void> {
  requests += 1;
}

export async function recordError(): Promise<void> {
  errors += 1;
}

export async function recordLatency(latencyMs: number): Promise<void> {
  totalLatencyMs += Math.max(0, latencyMs);
}

export async function getMetrics(): Promise<MetricsSnapshot> {
  return {
    requests,
    errors,
    totalLatencyMs,
    averageLatencyMs: requests > 0 ? totalLatencyMs / requests : 0,
  };
}

export async function resetMetrics(): Promise<void> {
  requests = 0;
  errors = 0;
  totalLatencyMs = 0;
}

// =============================================================================
// apps/api/src/telemetry/tracer.ts
// Lightweight request tracing helpers.
// =============================================================================

import { randomUUID } from "node:crypto";

export interface TraceContext {
  traceId: string;
  parentTraceId?: string;
  startedAt: number;
}

export interface TraceSpan extends TraceContext {
  name: string;
  endedAt?: number;
  durationMs?: number;
}

export function createTraceId(): string {
  return randomUUID();
}

export function startTrace(name: string, parentTraceId?: string): TraceSpan {
  return {
    name,
    traceId: createTraceId(),
    parentTraceId,
    startedAt: Date.now(),
  };
}

export function endTrace(span: TraceSpan): TraceSpan {
  const endedAt = Date.now();
  return {
    ...span,
    endedAt,
    durationMs: endedAt - span.startedAt,
  };
}

export function withTraceHeaders(
  headers: Headers,
  traceId: string,
  parentTraceId?: string
): Headers {
  const nextHeaders = new Headers(headers);
  nextHeaders.set("x-trace-id", traceId);

  if (parentTraceId) {
    nextHeaders.set("x-parent-trace-id", parentTraceId);
  }

  return nextHeaders;
}

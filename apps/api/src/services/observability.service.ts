// =============================================================================
// apps/api/src/services/observability.service.ts
// Observability orchestration service.
// =============================================================================

import {
  logger,
  requestLogger,
  withErrorLogging,
  type LogContext,
  type LogLevel,
} from "../lib/logger";

export interface RequestLogInput extends LogContext {
  method: string;
  path: string;
  status: number;
  latencyMs?: number;
}

export class ObservabilityService {
  async log(level: LogLevel, event: string, context?: LogContext): Promise<void> {
    logger[level](event, context);
  }

  async logRequest(input: RequestLogInput): Promise<void> {
    logger.info("api.request", input);
  }

  async createRequestLogger(
    requestId: string,
    context: LogContext = {}
  ): Promise<ReturnType<typeof requestLogger>> {
    return requestLogger(requestId, context);
  }

  async withErrorLogging<T>(
    fn: () => Promise<T>,
    context: LogContext = {}
  ): Promise<T> {
    return withErrorLogging(fn, context);
  }
}

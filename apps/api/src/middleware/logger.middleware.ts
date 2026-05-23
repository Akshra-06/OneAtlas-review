// =============================================================================
// apps/api/src/middleware/logger.middleware.ts
// Structured request logging using the existing app logger.
// =============================================================================

import { logger, type LogContext } from "../lib/logger";

export interface RequestLogInput extends LogContext {
  method: string;
  path: string;
  status: number;
  latencyMs?: number;
}

export function logRequest(input: RequestLogInput): void {
  logger.info("api.request", input);
}

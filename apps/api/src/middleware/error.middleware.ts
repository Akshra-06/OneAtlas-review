// =============================================================================
// apps/api/src/middleware/error.middleware.ts
// Centralized error response helpers for route handlers.
// =============================================================================

import { logger } from "../lib/logger";
import { errorResponse as baseErrorResponse } from "../lib/response";

export function errorResponse(error: unknown) {
  return baseErrorResponse(error);
}

export function handleApiError(error: unknown) {
  logger.error("api.error", { error });
  return errorResponse(error);
}

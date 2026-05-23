// =============================================================================
// apps/api/src/utils/retry.ts
// Generic retry helper with exponential backoff and jitter.
// =============================================================================

import { logger } from "../lib/logger";

/** Retry helper options. */
export interface RetryOptions {
  maxAttempts?: number;
  backoffMs?: number;
  retryableErrors?: string[];
}

function isRetryableError(error: unknown, retryableErrors: string[]): boolean {
  if (retryableErrors.length === 0) {
    return true;
  }

  if (error instanceof Error) {
    const errorName = error.name.toLowerCase();
    const errorMessage = error.message.toLowerCase();

    return retryableErrors.some((candidate) => {
      const normalized = candidate.toLowerCase();
      return errorName.includes(normalized) || errorMessage.includes(normalized);
    });
  }

  return retryableErrors.some((candidate) =>
    String(error).toLowerCase().includes(candidate.toLowerCase())
  );
}

function getJitteredDelay(baseDelay: number, attempt: number): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.floor(exponentialDelay * 0.25 * Math.random());
  return exponentialDelay + jitter;
}

/**
 * Execute an async function with retries.
 * @param fn - Function to execute.
 * @param options - Retry configuration.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const backoffMs = options.backoffMs ?? 1_000;
  const retryableErrors = options.retryableErrors ?? [];

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      const shouldRetry = attempt < maxAttempts && isRetryableError(error, retryableErrors);
      if (!shouldRetry) {
        throw error;
      }

      const delay = getJitteredDelay(backoffMs, attempt);
      logger.warn("retry.attempt", {
        attempt,
        maxAttempts,
        delayMs: delay,
        error: error instanceof Error ? error.message : String(error),
      });

      await new Promise<void>((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Retry failed");
}

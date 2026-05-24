// =============================================================================
// apps/api/src/utils/circuit-breaker.ts
// Minimal circuit breaker for transient dependency protection.
// =============================================================================

import { logger } from "../lib/logger";

/** Circuit breaker states. */
export enum CircuitBreakerState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

/** Error thrown when the circuit breaker is open. */
export class CircuitBreakerOpenError extends Error {
  /**
   * Create a new open-circuit error.
   * @param name - Circuit breaker name.
   */
  constructor(name: string) {
    super(`Circuit breaker "${name}" is open`);
    this.name = "CircuitBreakerOpenError";
  }
}

/**
 * Circuit breaker configuration.
 */
export interface CircuitBreakerOptions {
  failureThreshold?: number;
  recoveryTimeout?: number;
  name: string;
}

/**
 * Lightweight, concurrency-safe circuit breaker.
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;

  private failureCount = 0;

  private nextAttemptAt = 0;

  private halfOpenProbeInFlight = false;

  private readonly failureThreshold: number;

  private readonly recoveryTimeout: number;

  private readonly name: string;

  /**
   * Create a circuit breaker.
   * @param options - Circuit breaker settings.
   */
  constructor(options: CircuitBreakerOptions) {
    this.name = options.name;
    this.failureThreshold = options.failureThreshold ?? 5;
    this.recoveryTimeout = options.recoveryTimeout ?? 30_000;
  }

  /** Get the current breaker state. */
  getState(): CircuitBreakerState {
    this.maybeTransitionFromOpen();
    return this.state;
  }

  /**
   * Execute a function under circuit breaker protection.
   * @param fn - Operation to execute.
   */
  async execute<T>(fn: () => Promise<T> | T): Promise<T> {
    this.maybeTransitionFromOpen();

    if (this.state === CircuitBreakerState.OPEN) {
      throw new CircuitBreakerOpenError(this.name);
    }

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      if (this.halfOpenProbeInFlight) {
        throw new CircuitBreakerOpenError(this.name);
      }

      this.halfOpenProbeInFlight = true;
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure(error);
      throw error;
    } finally {
      if (this.state === CircuitBreakerState.HALF_OPEN) {
        this.halfOpenProbeInFlight = false;
      }
    }
  }

  private maybeTransitionFromOpen(): void {
    if (this.state !== CircuitBreakerState.OPEN) {
      return;
    }

    if (Date.now() < this.nextAttemptAt) {
      return;
    }

    this.transitionTo(CircuitBreakerState.HALF_OPEN, "recovery timeout elapsed");
    this.halfOpenProbeInFlight = false;
  }

  private recordSuccess(): void {
    if (this.state !== CircuitBreakerState.CLOSED || this.failureCount > 0) {
      this.failureCount = 0;
    }

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.transitionTo(CircuitBreakerState.CLOSED, "probe succeeded");
    }
  }

  private recordFailure(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.open(message);
      return;
    }

    this.failureCount += 1;

    if (this.failureCount >= this.failureThreshold) {
      this.open(message);
    }
  }

  private open(reason: string): void {
    this.transitionTo(CircuitBreakerState.OPEN, reason);
    this.nextAttemptAt = Date.now() + this.recoveryTimeout;
    this.halfOpenProbeInFlight = false;
  }

  private transitionTo(state: CircuitBreakerState, reason: string): void {
    if (this.state === state) {
      return;
    }

    const previousState = this.state;
    this.state = state;

    if (state === CircuitBreakerState.CLOSED) {
      this.failureCount = 0;
      this.nextAttemptAt = 0;
    }

    logger.info("circuit_breaker.state_changed", {
      name: this.name,
      previousState,
      state,
      reason,
    });
  }
}

/**
 * Create a circuit breaker instance.
 * @param options - Circuit breaker settings.
 */
export function createCircuitBreaker(
  options: CircuitBreakerOptions
): CircuitBreaker {
  return new CircuitBreaker(options);
}

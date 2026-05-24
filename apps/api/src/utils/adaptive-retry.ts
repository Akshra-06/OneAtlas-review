import {
  CircuitBreakerOpenError,
  CircuitBreakerState,
  createCircuitBreaker,
} from "./circuit-breaker";
import { FailureCluster, type FailureContext } from "./failure-cluster";
import { RetryPriorityQueue, RetryPriority, type RetryJob } from "./retry-priority-queue";

export type RetryContext = {
  service: string;
  operation: string;
  orgId?: string;
  projectId?: string;
};

export interface AdaptiveRetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  priority: RetryPriority;
}

export interface AdaptiveRetryStats {
  queued: number;
  processed: number;
  succeeded: number;
  failed: number;
  retriesScheduled: number;
  systemicFailures: number;
  circuitBreaks: number;
  averageDelayMs: number;
}

type InternalRetryTask<T> = RetryJob & {
  context: RetryContext;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
};

const HIGH_FREQUENCY_FAILURES = 5;
const MEDIUM_FREQUENCY_FAILURES = 3;
const SYSTEMIC_WINDOW_MS = 5 * 60 * 1000;

function computeDelay(
  baseDelayMs: number,
  attemptCount: number,
  multiplier: number,
  maxDelayMs: number
): number {
  const exponential = baseDelayMs * Math.pow(2, Math.max(0, attemptCount - 1));
  const scaled = exponential * multiplier;
  return Math.min(maxDelayMs, Math.max(0, Math.floor(scaled)));
}

function getFailurePattern(error: Error): string {
  return (error.message || error.name || "Unknown error").replace(/\s+/g, " ").trim().slice(0, 50);
}

function toFailureContext(context: RetryContext): FailureContext {
  return {
    service: context.service,
    operation: context.operation,
    orgId: context.orgId,
    projectId: context.projectId,
    timestamp: Date.now(),
  };
}

/**
 * Adaptive retry manager that schedules retries by priority and reacts to clustered failures.
 */
export class AdaptiveRetryManager {
  private readonly queue = new RetryPriorityQueue();

  private readonly failureCluster = new FailureCluster();

  private readonly breaker = createCircuitBreaker({
    name: "adaptive-retry",
    failureThreshold: HIGH_FREQUENCY_FAILURES,
    recoveryTimeout: 30_000,
  });

  private readonly options: AdaptiveRetryOptions;

  private processing = false;

  private wakeTimer: ReturnType<typeof setTimeout> | null = null;

  private nextJobId = 0;

  private stats: AdaptiveRetryStats = {
    queued: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
    retriesScheduled: 0,
    systemicFailures: 0,
    circuitBreaks: 0,
    averageDelayMs: 0,
  };

  constructor(options: AdaptiveRetryOptions) {
    this.options = {
      maxAttempts: Math.max(1, Math.floor(options.maxAttempts)),
      baseDelayMs: Math.max(0, Math.floor(options.baseDelayMs)),
      maxDelayMs: Math.max(0, Math.floor(options.maxDelayMs)),
      priority: options.priority,
    };
  }

  async executeWithAdaptiveRetry<T>(
    fn: () => Promise<T>,
    context: RetryContext
  ): Promise<T> {
    if (this.isCircuitOpen()) {
      this.stats.circuitBreaks += 1;
      throw new CircuitBreakerOpenError(this.breakerName(context));
    }

    return await new Promise<T>((resolve, reject) => {
      const now = Date.now();
      const job: InternalRetryTask<T> = {
        id: `${context.service}:${context.operation}:${this.nextJobId}`,
        priority: this.options.priority,
        fn: () => fn(),
        maxAttempts: this.options.maxAttempts,
        attemptCount: 1,
        createdAt: now,
        nextRetryAt: now,
        context,
        resolve,
        reject,
      };

      this.nextJobId += 1;
      this.enqueue(job);
      void this.processQueue();
    });
  }

  getStats(): AdaptiveRetryStats {
    return { ...this.stats, queued: this.queue.size() };
  }

  private enqueue<T>(job: InternalRetryTask<T>): void {
    this.queue.enqueue(job);
    this.stats.queued = this.queue.size();
  }

  private isCircuitOpen(): boolean {
    return this.breaker.getState() === CircuitBreakerState.OPEN;
  }

  private breakerName(context: RetryContext): string {
    return `${context.service}:${context.operation}`;
  }

  private async processQueue(): Promise<void> {
    if (this.processing) {
      return;
    }

    this.processing = true;

    try {
      while (!this.queue.isEmpty()) {
        const job = this.queue.peek() as InternalRetryTask<unknown> | null;
        if (!job) {
          return;
        }

        const now = Date.now();
        if (job.nextRetryAt > now) {
          this.scheduleWake(job.nextRetryAt - now);
          return;
        }

        const next = this.queue.dequeue() as InternalRetryTask<unknown> | null;
        if (!next) {
          continue;
        }

        this.stats.processed += 1;

        try {
          const result = await this.breaker.execute(() => next.fn());
          this.stats.succeeded += 1;
          next.resolve(result);
        } catch (error) {
          this.handleFailure(next, error);
        }
      }
    } finally {
      this.processing = false;
      this.stats.queued = this.queue.size();

      const next = this.queue.peek();
      if (next && next.nextRetryAt <= Date.now()) {
        void this.processQueue();
      }
    }
  }

  private handleFailure<T>(job: InternalRetryTask<T>, error: unknown): void {
    if (error instanceof CircuitBreakerOpenError) {
      this.stats.circuitBreaks += 1;
      job.reject(error);
      return;
    }

    const normalizedError = error instanceof Error ? error : new Error(String(error));
    const failureContext = toFailureContext(job.context);
    this.failureCluster.recordFailure(normalizedError, failureContext);

    const recentFrequency = this.getRecentFailureFrequency(normalizedError);
    const isSystemic = this.failureCluster.isSystemicFailure(normalizedError);

    if (isSystemic || recentFrequency >= HIGH_FREQUENCY_FAILURES) {
      this.stats.systemicFailures += isSystemic ? 1 : 0;
      this.stats.circuitBreaks += 1;
      job.reject(new CircuitBreakerOpenError(this.breakerName(job.context)));
      return;
    }

    if (job.attemptCount >= job.maxAttempts) {
      this.stats.failed += 1;
      job.reject(normalizedError);
      return;
    }

    const multiplier = recentFrequency >= MEDIUM_FREQUENCY_FAILURES ? 2 : 1;
    const delay = computeDelay(
      this.options.baseDelayMs,
      job.attemptCount,
      multiplier,
      this.options.maxDelayMs
    );

    this.stats.retriesScheduled += 1;
    this.stats.averageDelayMs =
      (this.stats.averageDelayMs * (this.stats.retriesScheduled - 1) + delay) /
      this.stats.retriesScheduled;

    this.enqueue({
      ...job,
      attemptCount: job.attemptCount + 1,
      lastError: normalizedError,
      nextRetryAt: Date.now() + delay,
    });
  }

  private getRecentFailureFrequency(error: Error): number {
    const pattern = getFailurePattern(error);
    const cutoff = Date.now() - SYSTEMIC_WINDOW_MS;
    const cluster = this.failureCluster.getClusters().find((group) => {
      return group.pattern === pattern;
    });

    return cluster?.contexts.filter((entry) => entry.timestamp >= cutoff).length ?? 0;
  }

  private scheduleWake(delayMs: number): void {
    if (this.wakeTimer) {
      clearTimeout(this.wakeTimer);
    }

    this.wakeTimer = setTimeout(() => {
      this.wakeTimer = null;
      void this.processQueue();
    }, Math.max(0, delayMs));

    if (typeof this.wakeTimer.unref === "function") {
      this.wakeTimer.unref();
    }
  }
}

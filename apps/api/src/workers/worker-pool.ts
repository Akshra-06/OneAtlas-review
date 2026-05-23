// =============================================================================
// apps/api/src/workers/worker-pool.ts
// Promise-based worker pool for async task orchestration.
// =============================================================================

import { logger } from "../lib/logger";
import { executeWithTimeout } from "./parallel-executor";

/** Pool job definition. Lower priority values run first. */
export interface Job<T> {
  id: string;
  execute: () => Promise<T>;
  priority: number;
  timeoutMs: number;
}

/** Worker pool configuration. */
export interface WorkerPoolOptions {
  maxWorkers: number;
  minWorkers: number;
  idleTimeoutMs: number;
  name: string;
}

/** Worker pool runtime statistics. */
export interface WorkerPoolStats {
  active: number;
  idle: number;
  queued: number;
  completed: number;
  failed: number;
}

type QueueEntry = Job<unknown> & {
  sequence: number;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

/**
 * Async task worker pool with priority scheduling.
 */
export class WorkerPool {
  private readonly name: string;

  private readonly minWorkers: number;

  private readonly maxWorkersLimit: number;

  private readonly idleTimeoutMs: number;

  private readonly queue: QueueEntry[] = [];

  private readonly drainWaiters = new Set<() => void>();

  private activeWorkers = 0;

  private completedCount = 0;

  private failedCount = 0;

  private currentWorkers: number;

  private shuttingDown = false;

  private pumpScheduled = false;

  private sequence = 0;

  private idleTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Create a worker pool.
   * @param options - Pool configuration.
   */
  constructor(options: WorkerPoolOptions) {
    if (options.minWorkers < 0 || options.maxWorkers < 1) {
      throw new Error("WorkerPool requires positive worker bounds");
    }

    if (options.minWorkers > options.maxWorkers) {
      throw new Error("WorkerPool minWorkers cannot exceed maxWorkers");
    }

    this.name = options.name;
    this.minWorkers = options.minWorkers;
    this.maxWorkersLimit = options.maxWorkers;
    this.idleTimeoutMs = options.idleTimeoutMs;
    this.currentWorkers = options.maxWorkers;
  }

  /**
   * Submit a job to the pool.
   * @param job - Job to execute.
   */
  submit<T>(job: Job<T>): Promise<T> {
    if (this.shuttingDown) {
      return Promise.reject(new Error(`WorkerPool "${this.name}" is shutting down`));
    }

    this.clearIdleTimer();

    return new Promise<T>((resolve, reject) => {
      this.enqueue({
        ...job,
        resolve: resolve as (value: unknown) => void,
        reject: reject as (reason: unknown) => void,
        sequence: this.sequence,
      });

      this.sequence += 1;
      this.schedulePump();
    });
  }

  /**
   * Get the current worker pool statistics.
   */
  getStats(): WorkerPoolStats {
    return {
      active: this.activeWorkers,
      idle: Math.max(this.currentWorkers - this.activeWorkers, 0),
      queued: this.queue.length,
      completed: this.completedCount,
      failed: this.failedCount,
    };
  }

  /**
   * Resize the pool within configured bounds.
   * @param newMax - New maximum worker count.
   */
  resize(newMax: number): void {
    const nextWorkers = this.clampWorkers(newMax);
    if (nextWorkers === this.currentWorkers) {
      return;
    }

    const previous = this.currentWorkers;
    this.currentWorkers = nextWorkers;

    logger.info("worker_pool.resized", {
      name: this.name,
      previousWorkers: previous,
      currentWorkers: this.currentWorkers,
    });

    this.schedulePump();
    this.scheduleIdleTimeout();
  }

  /**
   * Wait for all queued and active jobs to complete.
   */
  async drain(): Promise<void> {
    if (this.queue.length === 0 && this.activeWorkers === 0) {
      return;
    }

    await new Promise<void>((resolve) => {
      this.drainWaiters.add(resolve);
      this.schedulePump();
    });
  }

  /**
   * Gracefully shut down the pool after in-flight work completes.
   */
  async shutdown(): Promise<void> {
    this.shuttingDown = true;
    this.clearIdleTimer();
    await this.drain();

    logger.info("worker_pool.shutdown", {
      name: this.name,
      completed: this.completedCount,
      failed: this.failedCount,
    });
  }

  private enqueue(entry: QueueEntry): void {
    let insertAt = this.queue.length;

    for (let index = 0; index < this.queue.length; index += 1) {
      const current = this.queue[index];
      if (!current) {
        continue;
      }

      if (entry.priority < current.priority || (entry.priority === current.priority && entry.sequence < current.sequence)) {
        insertAt = index;
        break;
      }
    }

    this.queue.splice(insertAt, 0, entry);
  }

  private schedulePump(): void {
    if (this.pumpScheduled) {
      return;
    }

    this.pumpScheduled = true;

    queueMicrotask(() => {
      this.pumpScheduled = false;
      void this.pump();
    });
  }

  private async pump(): Promise<void> {
    while (this.activeWorkers < this.currentWorkers && this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) {
        break;
      }

      this.activeWorkers += 1;
      logger.info("worker_pool.job.started", {
        name: this.name,
        jobId: job.id,
        priority: job.priority,
      });

      void this.runJob(job);
    }

    this.scheduleIdleTimeout();
    this.maybeResolveDrainWaiters();
  }

  private async runJob(job: QueueEntry): Promise<void> {
    try {
      const result = await executeWithTimeout(job.execute, job.timeoutMs);
      this.completedCount += 1;
      job.resolve(result);

      logger.info("worker_pool.job.completed", {
        name: this.name,
        jobId: job.id,
        priority: job.priority,
      });
    } catch (error) {
      this.failedCount += 1;
      job.reject(error);

      logger.error("worker_pool.job.failed", {
        name: this.name,
        jobId: job.id,
        priority: job.priority,
        error,
      });
    } finally {
      this.activeWorkers -= 1;
      this.schedulePump();
    }
  }

  private scheduleIdleTimeout(): void {
    this.clearIdleTimer();

    if (this.activeWorkers > 0 || this.queue.length > 0 || this.currentWorkers <= this.minWorkers) {
      return;
    }

    this.idleTimer = setTimeout(() => {
      if (this.activeWorkers === 0 && this.queue.length === 0 && this.currentWorkers > this.minWorkers) {
        const previous = this.currentWorkers;
        this.currentWorkers = this.minWorkers;

        logger.info("worker_pool.idle_timeout", {
          name: this.name,
          previousWorkers: previous,
          currentWorkers: this.currentWorkers,
          idleTimeoutMs: this.idleTimeoutMs,
        });
      }
    }, this.idleTimeoutMs);
  }

  private clearIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  private maybeResolveDrainWaiters(): void {
    if (this.queue.length > 0 || this.activeWorkers > 0) {
      return;
    }

    this.scheduleIdleTimeout();

    for (const resolve of this.drainWaiters) {
      resolve();
    }

    this.drainWaiters.clear();
  }

  private clampWorkers(value: number): number {
    return Math.max(this.minWorkers, Math.min(this.maxWorkersLimit, Math.floor(value)));
  }
}

/**
 * Create a worker pool instance.
 * @param options - Pool configuration.
 */
export function createWorkerPool(options: WorkerPoolOptions): WorkerPool {
  return new WorkerPool(options);
}

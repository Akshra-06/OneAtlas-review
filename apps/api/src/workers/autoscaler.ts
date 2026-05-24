// =============================================================================
// apps/api/src/workers/autoscaler.ts
// Simple auto-scaler for the in-process worker pool.
// =============================================================================

import { logger } from "../lib/logger";
import { WorkerPool } from "./worker-pool";

/** Auto-scaler configuration. */
export interface AutoScalerConfig {
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  checkIntervalMs?: number;
  maxWorkers: number;
  minWorkers: number;
}

/**
 * Periodically adjusts a worker pool based on load.
 */
export class AutoScaler {
  private timer: ReturnType<typeof setInterval> | null = null;

  /**
   * Create an auto-scaler.
   * @param pool - Worker pool to manage.
   * @param config - Scaling thresholds and bounds.
   */
  constructor(
    private readonly pool: WorkerPool,
    private readonly config: AutoScalerConfig
  ) {}

  /** Start monitoring the pool. */
  start(): void {
    if (this.timer) {
      return;
    }

    const intervalMs = this.config.checkIntervalMs ?? 5_000;
    this.timer = setInterval(() => {
      void this.check();
    }, intervalMs);
  }

  /** Stop monitoring the pool. */
  stop(): void {
    if (!this.timer) {
      return;
    }

    clearInterval(this.timer);
    this.timer = null;
  }

  private async check(): Promise<void> {
    try {
      const stats = this.pool.getStats();
      const totalWorkers = stats.active + stats.idle;
      const idlePercent = totalWorkers === 0 ? 100 : (stats.idle / totalWorkers) * 100;

      if (stats.queued > this.config.scaleUpThreshold && totalWorkers < this.config.maxWorkers) {
        const nextSize = Math.min(this.config.maxWorkers, totalWorkers + 1);
        this.pool.resize(nextSize);

        logger.info("autoscaler.scale_up", {
          queued: stats.queued,
          active: stats.active,
          idle: stats.idle,
          nextSize,
        });

        return;
      }

      if (idlePercent > this.config.scaleDownThreshold && totalWorkers > this.config.minWorkers) {
        const nextSize = Math.max(this.config.minWorkers, totalWorkers - 1);
        this.pool.resize(nextSize);

        logger.info("autoscaler.scale_down", {
          queued: stats.queued,
          active: stats.active,
          idle: stats.idle,
          idlePercent,
          nextSize,
        });
      }
    } catch (error) {
      logger.error("autoscaler.check_failed", { error });
    }
  }
}

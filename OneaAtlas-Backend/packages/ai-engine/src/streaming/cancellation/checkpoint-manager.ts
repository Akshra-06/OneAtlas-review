/**
 * Checkpoint Manager
 * 
 * Manages generation checkpoints for recovery.
 * Creates and restores generation checkpoints.
 */

import { logger } from '../../shared/utils/logger';

export interface Checkpoint {
  id: string;
  sessionId: string;
  timestamp: number;
  state: unknown;
  metadata?: Record<string, unknown>;
}

export interface CheckpointConfig {
  enableAutoCheckpoint: boolean;
  checkpointIntervalMs: number;
  maxCheckpoints: number;
  enablePersistence: boolean;
}

const DEFAULT_CONFIG: CheckpointConfig = {
  enableAutoCheckpoint: true,
  checkpointIntervalMs: 5000,
  maxCheckpoints: 10,
  enablePersistence: false,
};

/**
 * Checkpoint Manager
 * 
 * Manages generation checkpoints:
 * - Create checkpoints
 * - Restore from checkpoints
 * - Checkpoint cleanup
 * - Checkpoint history
 */
export class CheckpointManager {
  private config: CheckpointConfig;
  private checkpoints: Map<string, Checkpoint[]> = new Map();
  private checkpointTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<CheckpointConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Create a checkpoint
   */
  createCheckpoint(sessionId: string, state: unknown, metadata?: Record<string, unknown>): Checkpoint {
    const checkpoint: Checkpoint = {
      id: crypto.randomUUID(),
      sessionId,
      timestamp: Date.now(),
      state,
      metadata,
    };

    if (!this.checkpoints.has(sessionId)) {
      this.checkpoints.set(sessionId, []);
    }

    const sessionCheckpoints = this.checkpoints.get(sessionId)!;
    sessionCheckpoints.push(checkpoint);

    // Enforce max checkpoints
    if (sessionCheckpoints.length > this.config.maxCheckpoints) {
      sessionCheckpoints.shift();
    }

    logger.info('CheckpointManager', 'CHECKPOINT_CREATED', 'Checkpoint created', {
      checkpointId: checkpoint.id,
      sessionId,
    });

    return checkpoint;
  }

  /**
   * Restore from a checkpoint
   */
  restoreCheckpoint(checkpointId: string): unknown | null {
    for (const sessionCheckpoints of this.checkpoints.values()) {
      const checkpoint = sessionCheckpoints.find(c => c.id === checkpointId);
      if (checkpoint) {
        logger.info('CheckpointManager', 'CHECKPOINT_RESTORED', 'Checkpoint restored', {
          checkpointId,
          sessionId: checkpoint.sessionId,
        });

        return checkpoint.state;
      }
    }

    logger.warn('CheckpointManager', 'CHECKPOINT_NOT_FOUND', 'Checkpoint not found', {
      checkpointId,
    });

    return null;
  }

  /**
   * Restore the latest checkpoint for a session
   */
  restoreLatestCheckpoint(sessionId: string): unknown | null {
    const sessionCheckpoints = this.checkpoints.get(sessionId);
    if (!sessionCheckpoints || sessionCheckpoints.length === 0) {
      logger.warn('CheckpointManager', 'NO_CHECKPOINTS', 'No checkpoints found for session', {
        sessionId,
      });
      return null;
    }

    const latest = sessionCheckpoints[sessionCheckpoints.length - 1];
    if (!latest) {
      return null;
    }

    logger.info('CheckpointManager', 'LATEST_CHECKPOINT_RESTORED', 'Latest checkpoint restored', {
      sessionId,
      checkpointId: latest.id,
    });

    return latest.state;
  }

  /**
   * Get checkpoints for a session
   */
  getCheckpoints(sessionId: string): Checkpoint[] {
    return this.checkpoints.get(sessionId) || [];
  }

  /**
   * Get all checkpoints
   */
  getAllCheckpoints(): Checkpoint[] {
    const allCheckpoints: Checkpoint[] = [];
    for (const sessionCheckpoints of this.checkpoints.values()) {
      allCheckpoints.push(...sessionCheckpoints);
    }
    return allCheckpoints;
  }

  /**
   * Get a checkpoint by ID
   */
  getCheckpoint(checkpointId: string): Checkpoint | undefined {
    for (const sessionCheckpoints of this.checkpoints.values()) {
      const checkpoint = sessionCheckpoints.find(c => c.id === checkpointId);
      if (checkpoint) {
        return checkpoint;
      }
    }
    return undefined;
  }

  /**
   * Delete a checkpoint
   */
  deleteCheckpoint(checkpointId: string): boolean {
    for (const [sessionId, sessionCheckpoints] of this.checkpoints.entries()) {
      const index = sessionCheckpoints.findIndex(c => c.id === checkpointId);
      if (index !== -1) {
        sessionCheckpoints.splice(index, 1);

        logger.info('CheckpointManager', 'CHECKPOINT_DELETED', 'Checkpoint deleted', {
          checkpointId,
          sessionId,
        });

        return true;
      }
    }

    return false;
  }

  /**
   * Clear checkpoints for a session
   */
  clearSession(sessionId: string): void {
    this.checkpoints.delete(sessionId);

    // Stop auto-checkpoint timer if running
    const timer = this.checkpointTimers.get(sessionId);
    if (timer) {
      clearInterval(timer);
      this.checkpointTimers.delete(sessionId);
    }

    logger.info('CheckpointManager', 'SESSION_CLEARED', 'Session checkpoints cleared', {
      sessionId,
    });
  }

  /**
   * Clear all checkpoints
   */
  clearAll(): void {
    this.checkpoints.clear();

    // Stop all timers
    for (const timer of this.checkpointTimers.values()) {
      clearInterval(timer);
    }
    this.checkpointTimers.clear();

    logger.info('CheckpointManager', 'ALL_CLEARED', 'All checkpoints cleared');
  }

  /**
   * Start auto-checkpoint for a session
   */
  startAutoCheckpoint(sessionId: string, getState: () => unknown): void {
    if (!this.config.enableAutoCheckpoint) {
      return;
    }

    const timer = setInterval(() => {
      this.createCheckpoint(sessionId, getState());
    }, this.config.checkpointIntervalMs);

    this.checkpointTimers.set(sessionId, timer);

    logger.info('CheckpointManager', 'AUTO_CHECKPOINT_STARTED', 'Auto-checkpoint started', {
      sessionId,
      intervalMs: this.config.checkpointIntervalMs,
    });
  }

  /**
   * Stop auto-checkpoint for a session
   */
  stopAutoCheckpoint(sessionId: string): void {
    const timer = this.checkpointTimers.get(sessionId);
    if (timer) {
      clearInterval(timer);
      this.checkpointTimers.delete(sessionId);

      logger.info('CheckpointManager', 'AUTO_CHECKPOINT_STOPPED', 'Auto-checkpoint stopped', {
        sessionId,
      });
    }
  }

  /**
   * Get checkpoint count for a session
   */
  getCheckpointCount(sessionId: string): number {
    return this.checkpoints.get(sessionId)?.length || 0;
  }

  /**
   * Get total checkpoint count
   */
  getTotalCheckpointCount(): number {
    let total = 0;
    for (const sessionCheckpoints of this.checkpoints.values()) {
      total += sessionCheckpoints.length;
    }
    return total;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CheckpointConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('CheckpointManager', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): CheckpointConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    totalCheckpoints: number;
    averageCheckpointsPerSession: number;
    activeAutoCheckpoints: number;
    config: CheckpointConfig;
  } {
    const totalSessions = this.checkpoints.size;
    const totalCheckpoints = this.getTotalCheckpointCount();
    const averageCheckpointsPerSession = totalSessions > 0 ? totalCheckpoints / totalSessions : 0;
    const activeAutoCheckpoints = this.checkpointTimers.size;

    return {
      totalSessions,
      totalCheckpoints,
      averageCheckpointsPerSession,
      activeAutoCheckpoints,
      config: this.getConfig(),
    };
  }
}

export const checkpointManager = new CheckpointManager();

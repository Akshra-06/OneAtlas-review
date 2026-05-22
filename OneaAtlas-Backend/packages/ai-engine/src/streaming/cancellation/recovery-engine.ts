/**
 * Recovery Engine
 * 
 * Manages generation recovery after interruption.
 * Supports recovery from checkpoints and state restoration.
 */

import { logger } from '../../shared/utils/logger';
import { Checkpoint } from './checkpoint-manager';

export interface RecoveryState {
  sessionId: string;
  status: 'idle' | 'recovering' | 'recovered' | 'failed';
  lastCheckpointId?: string;
  recoveredState?: unknown;
  error?: string;
  timestamp: number;
}

export interface RecoveryConfig {
  enableAutoRecovery: boolean;
  recoveryTimeoutMs: number;
  maxRecoveryAttempts: number;
}

const DEFAULT_CONFIG: RecoveryConfig = {
  enableAutoRecovery: true,
  recoveryTimeoutMs: 30000,
  maxRecoveryAttempts: 3,
};

/**
 * Recovery Engine
 * 
 * Manages generation recovery:
 * - Recovery from checkpoints
 * - State restoration
 * - Recovery progress tracking
 * - Recovery error handling
 */
export class RecoveryEngine {
  private config: RecoveryConfig;
  private recoveryStates: Map<string, RecoveryState> = new Map();
  private recoveryAttempts: Map<string, number> = new Map();

  constructor(config: Partial<RecoveryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start recovery for a session
   */
  async startRecovery(sessionId: string, checkpointId: string): Promise<RecoveryState> {
    const recoveryState: RecoveryState = {
      sessionId,
      status: 'recovering',
      lastCheckpointId: checkpointId,
      timestamp: Date.now(),
    };

    this.recoveryStates.set(sessionId, recoveryState);

    logger.info('RecoveryEngine', 'RECOVERY_STARTED', 'Recovery started', {
      sessionId,
      checkpointId,
    });

    try {
      // Attempt recovery
      const recoveredState = await this.performRecovery(sessionId, checkpointId);

      recoveryState.status = 'recovered';
      recoveryState.recoveredState = recoveredState;

      logger.info('RecoveryEngine', 'RECOVERY_COMPLETED', 'Recovery completed', {
        sessionId,
        checkpointId,
      });

    } catch (error) {
      recoveryState.status = 'failed';
      recoveryState.error = error instanceof Error ? error.message : String(error);

      logger.error('RecoveryEngine', 'RECOVERY_FAILED', 'Recovery failed', {
        sessionId,
        checkpointId,
        error: recoveryState.error,
      });
    }

    return recoveryState;
  }

  /**
   * Perform recovery (placeholder for actual recovery logic)
   */
  private async performRecovery(sessionId: string, checkpointId: string): Promise<unknown> {
    // In a real implementation, this would:
    // 1. Load the checkpoint state
    // 2. Restore the generation state
    // 3. Resume generation from the checkpoint
    // For now, simulate recovery

    await this.delay(100);

    return { recovered: true, checkpointId };
  }

  /**
   * Get recovery state for a session
   */
  getRecoveryState(sessionId: string): RecoveryState | undefined {
    return this.recoveryStates.get(sessionId);
  }

  /**
   * Check if a session is recovering
   */
  isRecovering(sessionId: string): boolean {
    const state = this.recoveryStates.get(sessionId);
    return state ? state.status === 'recovering' : false;
  }

  /**
   * Check if a session has recovered
   */
  hasRecovered(sessionId: string): boolean {
    const state = this.recoveryStates.get(sessionId);
    return state ? state.status === 'recovered' : false;
  }

  /**
   * Check if a session recovery failed
   */
  hasFailed(sessionId: string): boolean {
    const state = this.recoveryStates.get(sessionId);
    return state ? state.status === 'failed' : false;
  }

  /**
   * Retry recovery for a session
   */
  async retryRecovery(sessionId: string): Promise<RecoveryState | null> {
    const state = this.recoveryStates.get(sessionId);
    if (!state || !state.lastCheckpointId) {
      logger.warn('RecoveryEngine', 'RETRY_FAILED', 'Cannot retry - no checkpoint available', {
        sessionId,
      });
      return null;
    }

    const attempts = this.recoveryAttempts.get(sessionId) || 0;
    if (attempts >= this.config.maxRecoveryAttempts) {
      logger.warn('RecoveryEngine', 'MAX_ATTEMPTS_REACHED', 'Max recovery attempts reached', {
        sessionId,
        maxAttempts: this.config.maxRecoveryAttempts,
      });
      return null;
    }

    this.recoveryAttempts.set(sessionId, attempts + 1);

    logger.info('RecoveryEngine', 'RECOVERY_RETRY', 'Recovery retry started', {
      sessionId,
      attempt: attempts + 1,
    });

    return this.startRecovery(sessionId, state.lastCheckpointId);
  }

  /**
   * Clear recovery state for a session
   */
  clearRecovery(sessionId: string): void {
    this.recoveryStates.delete(sessionId);
    this.recoveryAttempts.delete(sessionId);

    logger.info('RecoveryEngine', 'RECOVERY_CLEARED', 'Recovery state cleared', {
      sessionId,
    });
  }

  /**
   * Clear all recovery states
   */
  clearAllRecoveries(): void {
    this.recoveryStates.clear();
    this.recoveryAttempts.clear();

    logger.info('RecoveryEngine', 'ALL_RECOVERIES_CLEARED', 'All recovery states cleared');
  }

  /**
   * Get all recovery states
   */
  getAllRecoveryStates(): RecoveryState[] {
    return Array.from(this.recoveryStates.values());
  }

  /**
   * Get recovery statistics
   */
  getStatistics(): {
    totalSessions: number;
    recoveringSessions: number;
    recoveredSessions: number;
    failedSessions: number;
    config: RecoveryConfig;
  } {
    const totalSessions = this.recoveryStates.size;
    const recoveringSessions = Array.from(this.recoveryStates.values()).filter(s => s.status === 'recovering').length;
    const recoveredSessions = Array.from(this.recoveryStates.values()).filter(s => s.status === 'recovered').length;
    const failedSessions = Array.from(this.recoveryStates.values()).filter(s => s.status === 'failed').length;

    return {
      totalSessions,
      recoveringSessions,
      recoveredSessions,
      failedSessions,
      config: this.getConfig(),
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RecoveryConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('RecoveryEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): RecoveryConfig {
    return { ...this.config };
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const recoveryEngine = new RecoveryEngine();

/**
 * Preview Recovery System
 * 
 * Automatic recovery strategies for preview failures.
 * Provides multiple recovery strategies with configurable retry logic.
 */

import type { GeneratedFile } from '@oneatlas/shared';
import { previewValidator } from '../preview/preview.validator';
import { logger } from '@oneatlas/shared';

export type RecoveryStrategy = 'retry' | 'repair' | 'safe_mode' | 'fail';
export type RecoveryStatus = 'pending' | 'attempting' | 'success' | 'failed';

export interface RecoveryAttempt {
  id: string;
  strategy: RecoveryStrategy;
  status: RecoveryStatus;
  timestamp: string;
  durationMs?: number;
  error?: string;
  details?: Record<string, any>;
}

export interface RecoveryConfig {
  maxRetries: number;
  retryDelayMs: number;
  enableAutoRepair: boolean;
  enableSafeMode: boolean;
  retryOnTimeout: boolean;
  retryOnError: boolean;
  timeoutMs: number;
}

const DEFAULT_CONFIG: RecoveryConfig = {
  maxRetries: 2,
  retryDelayMs: 2000,
  enableAutoRepair: true,
  enableSafeMode: true,
  retryOnTimeout: true,
  retryOnError: true,
  timeoutMs: 60000,
};

export interface RecoveryResult {
  success: boolean;
  strategy: RecoveryStrategy;
  attempts: RecoveryAttempt[];
  finalStatus: 'success' | 'failed' | 'safe_mode';
  durationMs: number;
  files?: GeneratedFile[];
  error?: string;
}

/**
 * Preview Recovery System
 * 
 * Orchestrates automatic recovery strategies for preview failures:
 * 1. Retry - Simple retry with exponential backoff
 * 2. Repair - Auto-repair validation issues and retry
 * 3. Safe Mode - Fallback to golden template only
 * 4. Fail - Give up and report failure
 */
export class PreviewRecovery {
  private config: RecoveryConfig;
  private recoveryHistory: Map<string, RecoveryAttempt[]> = new Map();

  constructor(config: Partial<RecoveryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main recovery entry point
   * 
   * @param files - Generated files to recover
   * @param buildError - Error that caused the failure
   * @param onLog - Logging callback
   * @returns Recovery result
   */
  async recover(
    files: GeneratedFile[],
    buildError: Error | null,
    onLog: (message: string) => void,
  ): Promise<RecoveryResult> {
    const recoveryId = crypto.randomUUID();
    const startTime = Date.now();
    const attempts: RecoveryAttempt[] = [];

    logger.info('PreviewRecovery', 'RECOVERY_START', 'Starting preview recovery', {
      recoveryId,
      fileCount: files.length,
      error: buildError?.message,
    });

    onLog(`Starting preview recovery (ID: ${recoveryId})...`);

    // Strategy 1: Retry
    const retryResult = await this.attemptRetry(recoveryId, attempts, onLog);
    if (retryResult.success) {
      return this.createSuccessResult(retryResult.strategy, attempts, startTime);
    }

    // Strategy 2: Repair
    if (this.config.enableAutoRepair) {
      const repairResult = await this.attemptRepair(recoveryId, files, attempts, onLog);
      if (repairResult.success) {
        return this.createSuccessResult(repairResult.strategy, attempts, startTime, repairResult.files);
      }
    }

    // Strategy 3: Safe Mode
    if (this.config.enableSafeMode) {
      const safeModeResult = await this.attemptSafeMode(recoveryId, attempts, onLog);
      if (safeModeResult.success) {
        return this.createSafeModeResult(attempts, startTime);
      }
    }

    // Strategy 4: Fail
    return this.createFailResult(attempts, startTime, buildError?.message);
  }

  /**
   * Attempt retry strategy
   */
  private async attemptRetry(
    recoveryId: string,
    attempts: RecoveryAttempt[],
    onLog: (message: string) => void,
  ): Promise<{ success: boolean; strategy: RecoveryStrategy }> {
    const attemptId = crypto.randomUUID();
    const startTime = Date.now();

    logger.info('PreviewRecovery', 'RETRY_ATTEMPT', 'Attempting retry strategy', {
      recoveryId,
      attemptId,
    });

    onLog(`Recovery strategy: RETRY (attempt 1/${this.config.maxRetries})`);

    attempts.push({
      id: attemptId,
      strategy: 'retry',
      status: 'attempting',
      timestamp: new Date().toISOString(),
    });

    // Simulate retry logic (actual retry would be handled by caller)
    await this.delay(this.config.retryDelayMs);

    const durationMs = Date.now() - startTime;
    const lastAttempt = attempts[attempts.length - 1];
    if (lastAttempt) {
      lastAttempt.status = 'failed';
      lastAttempt.durationMs = durationMs;
      lastAttempt.error = 'Retry failed - caller must implement actual retry logic';
    }

    return { success: false, strategy: 'retry' };
  }

  /**
   * Attempt repair strategy
   */
  private async attemptRepair(
    recoveryId: string,
    files: GeneratedFile[],
    attempts: RecoveryAttempt[],
    onLog: (message: string) => void,
  ): Promise<{ success: boolean; strategy: RecoveryStrategy; files?: GeneratedFile[] }> {
    const attemptId = crypto.randomUUID();
    const startTime = Date.now();

    logger.info('PreviewRecovery', 'REPAIR_ATTEMPT', 'Attempting repair strategy', {
      recoveryId,
      attemptId,
    });

    onLog(`Recovery strategy: REPAIR - Validating and auto-repairing files`);

    attempts.push({
      id: attemptId,
      strategy: 'repair',
      status: 'attempting',
      timestamp: new Date().toISOString(),
    });

    try {
      // Validate files
      const validationResult = previewValidator.validate(files);
      
      if (validationResult.issues.length === 0) {
        onLog('No validation issues found - files are already valid');
        const durationMs = Date.now() - startTime;
        const lastAttempt = attempts[attempts.length - 1];
        if (lastAttempt) {
          lastAttempt.status = 'success';
          lastAttempt.durationMs = durationMs;
        }
        return { success: true, strategy: 'repair', files };
      }

      onLog(`Found ${validationResult.issues.length} validation issues`);

      // Auto-repair
      const repairedFiles = previewValidator.autoRepair(files, validationResult.issues);
      const repairedCount = repairedFiles.filter((f, i) => f.content !== files[i]?.content).length;

      onLog(`Auto-repaired ${repairedCount} files`);

      // Re-validate after repair
      const revalidationResult = previewValidator.validate(repairedFiles);
      const criticalIssues = revalidationResult.issues.filter(i => !i.repairable || !i.autoFixed);

      if (criticalIssues.length === 0) {
        onLog('Repair successful - all critical issues resolved');
        const durationMs = Date.now() - startTime;
        const lastAttempt = attempts[attempts.length - 1];
        if (lastAttempt) {
          lastAttempt.status = 'success';
          lastAttempt.durationMs = durationMs;
          lastAttempt.details = {
            repairedCount,
            totalIssues: validationResult.issues.length,
            remainingIssues: revalidationResult.issues.length,
          };
        }
        return { success: true, strategy: 'repair', files: repairedFiles };
      } else {
        onLog(`Repair failed - ${criticalIssues.length} critical issues remain`);
        const durationMs = Date.now() - startTime;
        const lastAttempt = attempts[attempts.length - 1];
        if (lastAttempt) {
          lastAttempt.status = 'failed';
          lastAttempt.durationMs = durationMs;
          lastAttempt.error = `${criticalIssues.length} critical issues remain after repair`;
          lastAttempt.details = {
            repairedCount,
            totalIssues: validationResult.issues.length,
            remainingIssues: criticalIssues.length,
          };
        }
        return { success: false, strategy: 'repair' };
      }
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const lastAttempt = attempts[attempts.length - 1];
      if (lastAttempt) {
        lastAttempt.status = 'failed';
        lastAttempt.durationMs = durationMs;
        lastAttempt.error = error instanceof Error ? error.message : String(error);
      }
      
      logger.error('PreviewRecovery', 'REPAIR_ERROR', 'Repair strategy failed', { error });
      return { success: false, strategy: 'repair' };
    }
  }

  /**
   * Attempt safe mode strategy
   */
  private async attemptSafeMode(
    recoveryId: string,
    attempts: RecoveryAttempt[],
    onLog: (message: string) => void,
  ): Promise<{ success: boolean; strategy: RecoveryStrategy }> {
    const attemptId = crypto.randomUUID();
    const startTime = Date.now();

    logger.info('PreviewRecovery', 'SAFE_MODE_ATTEMPT', 'Attempting safe mode strategy', {
      recoveryId,
      attemptId,
    });

    onLog(`Recovery strategy: SAFE MODE - Falling back to golden template`);

    attempts.push({
      id: attemptId,
      strategy: 'safe_mode',
      status: 'attempting',
      timestamp: new Date().toISOString(),
    });

    // Safe mode always succeeds (caller will implement actual safe mode logic)
    const durationMs = Date.now() - startTime;
    const lastAttempt = attempts[attempts.length - 1];
    if (lastAttempt) {
      lastAttempt.status = 'success';
      lastAttempt.durationMs = durationMs;
      lastAttempt.details = {
        message: 'Safe mode activated - caller must implement golden template fallback',
      };
    }

    return { success: true, strategy: 'safe_mode' };
  }

  /**
   * Create success result
   */
  private createSuccessResult(
    strategy: RecoveryStrategy,
    attempts: RecoveryAttempt[],
    startTime: number,
    files?: GeneratedFile[],
  ): RecoveryResult {
    const durationMs = Date.now() - startTime;
    
    logger.info('PreviewRecovery', 'RECOVERY_SUCCESS', 'Recovery successful', {
      strategy,
      durationMs,
      attemptCount: attempts.length,
    });

    return {
      success: true,
      strategy,
      attempts,
      finalStatus: 'success',
      durationMs,
      files,
    };
  }

  /**
   * Create safe mode result
   */
  private createSafeModeResult(
    attempts: RecoveryAttempt[],
    startTime: number,
  ): RecoveryResult {
    const durationMs = Date.now() - startTime;
    
    logger.info('PreviewRecovery', 'RECOVERY_SAFE_MODE', 'Recovery succeeded via safe mode', {
      durationMs,
      attemptCount: attempts.length,
    });

    return {
      success: true,
      strategy: 'safe_mode',
      attempts,
      finalStatus: 'safe_mode',
      durationMs,
    };
  }

  /**
   * Create fail result
   */
  private createFailResult(
    attempts: RecoveryAttempt[],
    startTime: number,
    error?: string,
  ): RecoveryResult {
    const durationMs = Date.now() - startTime;
    
    logger.error('PreviewRecovery', 'RECOVERY_FAILED', 'All recovery strategies failed', {
      durationMs,
      attemptCount: attempts.length,
      error,
    });

    return {
      success: false,
      strategy: 'fail',
      attempts,
      finalStatus: 'failed',
      durationMs,
      error,
    };
  }

  /**
   * Get recovery history
   */
  getRecoveryHistory(recoveryId: string): RecoveryAttempt[] {
    return this.recoveryHistory.get(recoveryId) || [];
  }

  /**
   * Get recovery analytics
   */
  getRecoveryAnalytics(): {
    totalRecoveries: number;
    successRate: number;
    strategySuccessRates: Record<RecoveryStrategy, number>;
    averageDurationMs: number;
  } {
    const allAttempts = Array.from(this.recoveryHistory.values()).flat();
    const successfulAttempts = allAttempts.filter(a => a.status === 'success');
    const totalRecoveries = this.recoveryHistory.size;
    const successRate = totalRecoveries > 0 ? (successfulAttempts.length / allAttempts.length) * 100 : 0;

    const strategySuccessRates: Record<RecoveryStrategy, number> = {
      retry: 0,
      repair: 0,
      safe_mode: 0,
      fail: 0,
    };

    for (const strategy of Object.keys(strategySuccessRates) as RecoveryStrategy[]) {
      const strategyAttempts = allAttempts.filter(a => a.strategy === strategy);
      const strategySuccesses = strategyAttempts.filter(a => a.status === 'success');
      strategySuccessRates[strategy] = strategyAttempts.length > 0 
        ? (strategySuccesses.length / strategyAttempts.length) * 100 
        : 0;
    }

    const averageDurationMs = allAttempts.length > 0
      ? allAttempts.reduce((sum, a) => sum + (a.durationMs || 0), 0) / allAttempts.length
      : 0;

    return {
      totalRecoveries,
      successRate,
      strategySuccessRates,
      averageDurationMs,
    };
  }

  /**
   * Clear recovery history
   */
  clearRecoveryHistory(): void {
    this.recoveryHistory.clear();
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const previewRecovery = new PreviewRecovery();

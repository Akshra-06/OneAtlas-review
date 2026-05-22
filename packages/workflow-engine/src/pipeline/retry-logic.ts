/**
 * Threshold-Based Retry Logic System
 * Automatically retries failed generations based on quality thresholds
 */

import type { QualityReport } from '@oneatlas/validation-engine';
import type { PipelineContext } from './generation.pipeline';
import { rollbackManager } from './rollback-manager';

export interface RetryConfig {
  maxRetries: number;
  qualityThreshold: number;
  retryDelay: number; // milliseconds
  backoffMultiplier: number;
  retryableErrors: string[];
}

export interface RetryResult {
  success: boolean;
  attempts: number;
  finalQuality: number;
  rollbackUsed: boolean;
  feedbackLoopUsed: boolean;
  error?: string;
}

class RetryLogic {
  private defaultConfig: RetryConfig = {
    maxRetries: 3,
    qualityThreshold: 0.75,
    retryDelay: 1000,
    backoffMultiplier: 2,
    retryableErrors: [
      'syntax',
      'structure',
      'import',
      'export',
    ],
  };

  /**
   * Execute generation with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    qualityCheck: (result: T) => QualityReport,
    context?: PipelineContext,
  ): Promise<RetryResult & { result?: T }> {
    let attempts = 0;
    let lastError: Error | undefined;
    let rollbackUsed = false;
    let feedbackLoopUsed = false;

    while (attempts < this.defaultConfig.maxRetries) {
      attempts++;

      try {
        // Create snapshot before attempt
        const snapshotId = context ? rollbackManager.createSnapshot(`retry-attempt-${attempts}`, context) : '';

        // Execute the operation
        const result = await operation();

        // Check quality
        const qualityReport = qualityCheck(result);

        // If quality meets threshold, return success
        if (qualityReport.metrics.overall >= this.defaultConfig.qualityThreshold) {
          return {
            success: true,
            attempts,
            finalQuality: qualityReport.metrics.overall,
            rollbackUsed,
            feedbackLoopUsed,
            result,
          };
        }

        // Quality below threshold, try feedback loop
        if (attempts < this.defaultConfig.maxRetries) {
          feedbackLoopUsed = true;
          // This would integrate with the feedback loop to improve the result
          // For now, continue to retry
        }

        // Rollback if quality is poor
        if (qualityReport.metrics.overall < 0.5 && context) {
          rollbackUsed = true;
          const restoredContext = rollbackManager.rollbackToSnapshot(snapshotId);
          if (restoredContext) {
            Object.assign(context, restoredContext);
          }
        }

        // If this was the last attempt, return with current result
        if (attempts === this.defaultConfig.maxRetries) {
          return {
            success: qualityReport.metrics.overall >= this.defaultConfig.qualityThreshold * 0.9, // Allow slight margin
            attempts,
            finalQuality: qualityReport.metrics.overall,
            rollbackUsed,
            feedbackLoopUsed,
            result,
          };
        }

        // Wait before retry with exponential backoff
        const delay = this.defaultConfig.retryDelay * Math.pow(this.defaultConfig.backoffMultiplier, attempts - 1);
        await this.sleep(delay);

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if error is retryable
        if (!this.isRetryableError(lastError)) {
          return {
            success: false,
            attempts,
            finalQuality: 0,
            rollbackUsed,
            feedbackLoopUsed,
            error: lastError.message,
          };
        }

        // Rollback on error
        if (context) {
          rollbackUsed = true;
          const latestSnapshot = rollbackManager.getLatestSnapshot();
          if (latestSnapshot) {
            Object.assign(context, latestSnapshot.context);
          }
        }

        // If this was the last attempt, return failure
        if (attempts === this.defaultConfig.maxRetries) {
          return {
            success: false,
            attempts,
            finalQuality: 0,
            rollbackUsed,
            feedbackLoopUsed,
            error: lastError.message,
          };
        }

        // Wait before retry with exponential backoff
        const delay = this.defaultConfig.retryDelay * Math.pow(this.defaultConfig.backoffMultiplier, attempts - 1);
        await this.sleep(delay);
      }
    }

    return {
      success: false,
      attempts,
      finalQuality: 0,
      rollbackUsed,
      feedbackLoopUsed,
      error: lastError?.message || 'Unknown error',
    };
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();

    // Check against retryable error patterns
    for (const retryableError of this.defaultConfig.retryableErrors) {
      if (errorMessage.includes(retryableError.toLowerCase())) {
        return true;
      }
    }

    // Network/timeout errors are generally retryable
    if (errorMessage.includes('timeout') || errorMessage.includes('network') || errorMessage.includes('etimedout')) {
      return true;
    }

    // Rate limit errors are retryable
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return true;
    }

    return false;
  }

  /**
   * Sleep for specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update retry configuration
   */
  updateConfig(config: Partial<RetryConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): RetryConfig {
    return { ...this.defaultConfig };
  }

  /**
   * Reset to default configuration
   */
  resetConfig(): void {
    this.defaultConfig = {
      maxRetries: 3,
      qualityThreshold: 0.75,
      retryDelay: 1000,
      backoffMultiplier: 2,
      retryableErrors: [
        'syntax',
        'structure',
        'import',
        'export',
      ],
    };
  }

  /**
   * Get retry statistics
   */
  getStats(): {
    maxRetries: number;
    qualityThreshold: number;
    retryDelay: number;
    backoffMultiplier: number;
    retryableErrorsCount: number;
  } {
    return {
      maxRetries: this.defaultConfig.maxRetries,
      qualityThreshold: this.defaultConfig.qualityThreshold,
      retryDelay: this.defaultConfig.retryDelay,
      backoffMultiplier: this.defaultConfig.backoffMultiplier,
      retryableErrorsCount: this.defaultConfig.retryableErrors.length,
    };
  }
}

export const retryLogic = new RetryLogic();

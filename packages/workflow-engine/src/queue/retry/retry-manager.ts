/**
 * Retry Manager
 * 
 * Provides retry logic with exponential backoff.
 * Handles transient failures with intelligent retry strategies.
 */

import { logger } from '@oneatlas/ai-engine';


export interface RetryConfig {
  maxRetries: number;
  initialDelay: number; // In milliseconds
  maxDelay: number; // In milliseconds
  backoffMultiplier: number;
  jitter: boolean; // Add randomness to prevent thundering herd
  retryableErrors: string[]; // Error types that are retryable
}

export interface RetryAttempt {
  attempt: number;
  timestamp: string;
  delay: number;
  error?: string;
  success: boolean;
}

export interface RetryResult {
  success: boolean;
  attempts: number;
  totalDuration: number;
  history: RetryAttempt[];
  finalError?: string;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'RATE_LIMIT', 'TIMEOUT'],
};

/**
 * Retry Manager
 * 
 * Manages retry logic with exponential backoff:
 * - Exponential backoff calculation
 * - Jitter for preventing thundering herd
 * - Retryable error detection
 * - Retry history tracking
 */
export class RetryManager {
  private config: RetryConfig;
  private retryHistory: Map<string, RetryAttempt[]> = new Map();

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute function with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationId: string,
  ): Promise<RetryResult & { result?: T }> {
    const history: RetryAttempt[] = [];
    let lastError: string | undefined;
    let success = false;
    let result: T | undefined;
    const startTime = Date.now();

    for (let attempt = 1; attempt <= this.config.maxRetries + 1; attempt++) {
      const attemptStart = Date.now();
      let delay = 0;

      // Add delay for retries (not first attempt)
      if (attempt > 1) {
        delay = this.calculateDelay(attempt - 1);
        await this.sleep(delay);
      }

      try {
        logger.info('RetryManager', 'ATTEMPT_START', 'Retry attempt started', {
          operationId,
          attempt,
          delay,
        });

        result = await operation();
        success = true;

        history.push({
          attempt,
          timestamp: new Date().toISOString(),
          delay,
          success: true,
        });

        logger.info('RetryManager', 'ATTEMPT_SUCCESS', 'Retry attempt succeeded', {
          operationId,
          attempt,
        });

        break;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        lastError = errorMessage;

        history.push({
          attempt,
          timestamp: new Date().toISOString(),
          delay,
          error: errorMessage,
          success: false,
        });

        logger.warn('RetryManager', 'ATTEMPT_FAILED', 'Retry attempt failed', {
          operationId,
          attempt,
          error: errorMessage,
        });

        // Check if error is retryable
        if (!this.isRetryableError(errorMessage)) {
          logger.error('RetryManager', 'NON_RETRYABLE_ERROR', 'Error is not retryable', {
            operationId,
            error: errorMessage,
          });
          break;
        }

        // Check if we've exhausted retries
        if (attempt >= this.config.maxRetries + 1) {
          logger.error('RetryManager', 'RETRIES_EXHAUSTED', 'Retries exhausted', {
            operationId,
            maxRetries: this.config.maxRetries,
          });
          break;
        }
      }
    }

    const totalDuration = Date.now() - startTime;

    // Store retry history
    this.retryHistory.set(operationId, history);

    const retryResult: RetryResult & { result?: T } = {
      success,
      attempts: history.length,
      totalDuration,
      history,
      finalError: lastError,
      result,
    };

    logger.info('RetryManager', 'RETRY_COMPLETE', 'Retry operation complete', {
      operationId,
      success,
      attempts: retryResult.attempts,
      totalDuration,
    });

    return retryResult;
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  calculateDelay(attempt: number): number {
    // Exponential backoff: initialDelay * (backoffMultiplier ^ attempt)
    let delay = this.config.initialDelay * Math.pow(this.config.backoffMultiplier, attempt - 1);

    // Cap at max delay
    delay = Math.min(delay, this.config.maxDelay);

    // Add jitter if enabled
    if (this.config.jitter) {
      delay = this.addJitter(delay);
    }

    return Math.round(delay);
  }

  /**
   * Add jitter to delay to prevent thundering herd
   */
  private addJitter(delay: number): number {
    // Add random jitter of ±25%
    const jitter = delay * 0.25 * (Math.random() * 2 - 1);
    return delay + jitter;
  }

  /**
   * Check if error is retryable
   */
  isRetryableError(error: string): boolean {
    // Check if error message contains retryable error types
    for (const retryableError of this.config.retryableErrors) {
      if (error.includes(retryableError)) {
        return true;
      }
    }

    // Check for common retryable patterns
    const retryablePatterns = [
      /timeout/i,
      /network/i,
      /connection/i,
      /rate limit/i,
      /5\d{2}/, // 5xx HTTP errors
    ];

    for (const pattern of retryablePatterns) {
      if (pattern.test(error)) {
        return true;
      }
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
   * Get retry history for operation
   */
  getRetryHistory(operationId: string): RetryAttempt[] {
    return this.retryHistory.get(operationId) || [];
  }

  /**
   * Clear retry history
   */
  clearRetryHistory(operationId?: string): void {
    if (operationId) {
      this.retryHistory.delete(operationId);
    } else {
      this.retryHistory.clear();
    }

    logger.info('RetryManager', 'HISTORY_CLEARED', 'Retry history cleared', { operationId });
  }

  /**
   * Get retry statistics
   */
  getStatistics(): {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageAttempts: number;
    averageDuration: number;
  } {
    const allHistory = Array.from(this.retryHistory.values());
    const totalOperations = allHistory.length;
    const successfulOperations = allHistory.filter(h => h[h.length - 1]?.success).length;
    const failedOperations = totalOperations - successfulOperations;

    const totalAttempts = allHistory.reduce((sum, h) => sum + h.length, 0);
    const averageAttempts = totalOperations > 0 ? totalAttempts / totalOperations : 0;

    // Calculate average duration from history
    let totalDuration = 0;
    let durationCount = 0;

    for (const history of allHistory) {
      if (history.length > 0) {
        const first = history[0];
        const last = history[history.length - 1];
        if (first && last) {
          const firstTime = new Date(first.timestamp).getTime();
          const lastTime = new Date(last.timestamp).getTime();
          totalDuration += lastTime - firstTime;
          durationCount++;
        }
      }
    }

    const averageDuration = durationCount > 0 ? totalDuration / durationCount : 0;

    return {
      totalOperations,
      successfulOperations,
      failedOperations,
      averageAttempts,
      averageDuration,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...config };
    
    logger.info('RetryManager', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): RetryConfig {
    return { ...this.config };
  }

  /**
   * Generate retry report
   */
  generateReport(): string {
    const stats = this.getStatistics();
    const successRate = stats.totalOperations > 0
      ? (stats.successfulOperations / stats.totalOperations * 100).toFixed(2)
      : '0.00';

    return `
Retry Manager Report
====================
Total Operations: ${stats.totalOperations}
Successful: ${stats.successfulOperations}
Failed: ${stats.failedOperations}
Success Rate: ${successRate}%
Average Attempts: ${stats.averageAttempts.toFixed(2)}
Average Duration: ${stats.averageDuration.toFixed(2)}ms

Configuration:
- Max Retries: ${this.config.maxRetries}
- Initial Delay: ${this.config.initialDelay}ms
- Max Delay: ${this.config.maxDelay}ms
- Backoff Multiplier: ${this.config.backoffMultiplier}
- Jitter: ${this.config.jitter ? 'Enabled' : 'Disabled'}
    `.trim();
  }
}

export const retryManager = new RetryManager();

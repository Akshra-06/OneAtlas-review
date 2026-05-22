/**
 * Cancellation Manager
 * 
 * Provides job cancellation capabilities.
 * Allows cancelling running or queued operations.
 */

import { logger } from '@oneatlas/ai-engine';


export interface CancellationToken {
  id: string;
  cancelled: boolean;
  reason?: string;
  cancelledAt?: string;
  handlers: Array<() => void>;
}

export interface CancellationConfig {
  enableCancellation: boolean;
  timeout: number; // Auto-cancel after timeout (0 = no timeout)
}

const DEFAULT_CONFIG: CancellationConfig = {
  enableCancellation: true,
  timeout: 0,
};

/**
 * Cancellation Manager
 * 
 * Manages operation cancellation:
 * - Cancellation token creation
 * - Cancellation signal propagation
 * - Cancellation handler registration
 * - Timeout-based cancellation
 */
export class CancellationManager {
  private config: CancellationConfig;
  private tokens: Map<string, CancellationToken> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<CancellationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Create cancellation token
   */
  createToken(operationId: string): CancellationToken {
    const token: CancellationToken = {
      id: crypto.randomUUID(),
      cancelled: false,
      handlers: [],
    };

    this.tokens.set(token.id, token);

    // Set timeout if configured
    if (this.config.timeout > 0) {
      const timeout = setTimeout(() => {
        this.cancel(token.id, 'Operation timeout');
      }, this.config.timeout);

      this.timeouts.set(token.id, timeout);
    }

    logger.info('CancellationManager', 'TOKEN_CREATED', 'Cancellation token created', {
      tokenId: token.id,
      operationId,
    });

    return token;
  }

  /**
   * Cancel operation
   */
  cancel(tokenId: string, reason?: string): boolean {
    const token = this.tokens.get(tokenId);
    
    if (!token || token.cancelled) {
      return false;
    }

    token.cancelled = true;
    token.reason = reason;
    token.cancelledAt = new Date().toISOString();

    // Execute cancellation handlers
    for (const handler of token.handlers) {
      try {
        handler();
      } catch (error) {
        logger.error('CancellationManager', 'HANDLER_ERROR', 'Cancellation handler error', {
          tokenId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Clear timeout if exists
    const timeout = this.timeouts.get(tokenId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(tokenId);
    }

    logger.info('CancellationManager', 'OPERATION_CANCELLED', 'Operation cancelled', {
      tokenId,
      reason,
    });

    return true;
  }

  /**
   * Check if operation is cancelled
   */
  isCancelled(tokenId: string): boolean {
    const token = this.tokens.get(tokenId);
    return token?.cancelled || false;
  }

  /**
   * Get cancellation token
   */
  getToken(tokenId: string): CancellationToken | undefined {
    return this.tokens.get(tokenId);
  }

  /**
   * Register cancellation handler
   */
  registerHandler(tokenId: string, handler: () => void): boolean {
    const token = this.tokens.get(tokenId);
    
    if (!token || token.cancelled) {
      return false;
    }

    token.handlers.push(handler);

    logger.info('CancellationManager', 'HANDLER_REGISTERED', 'Cancellation handler registered', {
      tokenId,
    });

    return true;
  }

  /**
   * Throw if cancelled
   */
  throwIfCancelled(tokenId: string): void {
    const token = this.tokens.get(tokenId);
    
    if (token?.cancelled) {
      const error = new Error(`Operation cancelled${token.reason ? `: ${token.reason}` : ''}`);
      (error as any).cancelled = true;
      (error as any).tokenId = tokenId;
      throw error;
    }
  }

  /**
   * Delete cancellation token
   */
  deleteToken(tokenId: string): boolean {
    const token = this.tokens.get(tokenId);
    
    if (!token) {
      return false;
    }

    // Clear timeout if exists
    const timeout = this.timeouts.get(tokenId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(tokenId);
    }

    this.tokens.delete(tokenId);

    logger.info('CancellationManager', 'TOKEN_DELETED', 'Cancellation token deleted', {
      tokenId,
    });

    return true;
  }

  /**
   * Cancel all operations
   */
  cancelAll(reason?: string): number {
    let cancelled = 0;

    for (const [tokenId, token] of this.tokens.entries()) {
      if (!token.cancelled) {
        this.cancel(tokenId, reason || 'Global cancellation');
        cancelled++;
      }
    }

    logger.info('CancellationManager', 'ALL_CANCELLED', 'All operations cancelled', {
      count: cancelled,
      reason,
    });

    return cancelled;
  }

  /**
   * Get cancellation statistics
   */
  getStatistics(): {
    totalTokens: number;
    cancelledTokens: number;
    activeTokens: number;
    tokensWithHandlers: number;
  } {
    const tokens = Array.from(this.tokens.values());
    const cancelledTokens = tokens.filter(t => t.cancelled).length;
    const activeTokens = tokens.length - cancelledTokens;
    const tokensWithHandlers = tokens.filter(t => t.handlers.length > 0).length;

    return {
      totalTokens: tokens.length,
      cancelledTokens,
      activeTokens,
      tokensWithHandlers,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CancellationConfig>): void {
    this.config = { ...this.config, ...config };
    
    logger.info('CancellationManager', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): CancellationConfig {
    return { ...this.config };
  }

  /**
   * Clear all tokens
   */
  clearAll(): void {
    // Clear all timeouts
    for (const timeout of this.timeouts.values()) {
      clearTimeout(timeout);
    }
    this.timeouts.clear();

    this.tokens.clear();
    
    logger.info('CancellationManager', 'ALL_CLEARED', 'All cancellation tokens cleared');
  }

  /**
   * Create abort controller compatible with fetch
   */
  createAbortController(tokenId: string): AbortController | null {
    const token = this.tokens.get(tokenId);
    
    if (!token) {
      return null;
    }

    const controller = new AbortController();

    // Register handler to abort when token is cancelled
    this.registerHandler(tokenId, () => {
      controller.abort();
    });

    // If already cancelled, abort immediately
    if (token.cancelled) {
      controller.abort();
    }

    return controller;
  }

  /**
   * Wrap async operation with cancellation support
   */
  async withCancellation<T>(
    operationId: string,
    operation: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    const token = this.createToken(operationId);
    const controller = this.createAbortController(token.id);

    if (!controller) {
      throw new Error('Failed to create abort controller');
    }

    try {
      const result = await operation(controller.signal);
      return result;
    } finally {
      this.deleteToken(token.id);
    }
  }

  /**
   * Get cancellation reason
   */
  getCancellationReason(tokenId: string): string | undefined {
    const token = this.tokens.get(tokenId);
    return token?.reason;
  }

  /**
   * Get cancellation time
   */
  getCancellationTime(tokenId: string): string | undefined {
    const token = this.tokens.get(tokenId);
    return token?.cancelledAt;
  }
}

export const cancellationManager = new CancellationManager();

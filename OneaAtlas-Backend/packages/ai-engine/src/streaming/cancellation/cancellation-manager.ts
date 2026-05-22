/**
 * Cancellation Manager
 * 
 * Manages generation cancellation.
 * Supports graceful cancellation and cleanup.
 */

import { logger } from '../../shared/utils/logger';

export interface CancellationToken {
  id: string;
  sessionId: string;
  cancelled: boolean;
  reason?: string;
  timestamp: number;
}

export interface CancellationConfig {
  enableGracefulCancellation: boolean;
  cancellationTimeoutMs: number;
  enableCleanup: boolean;
}

const DEFAULT_CONFIG: CancellationConfig = {
  enableGracefulCancellation: true,
  cancellationTimeoutMs: 5000,
  enableCleanup: true,
};

/**
 * Cancellation Manager
 * 
 * Manages generation cancellation:
 * - Graceful cancellation
 * - Cleanup on cancellation
 * - Cancellation token management
 * - Cancellation reason tracking
 */
export class CancellationManager {
  private config: CancellationConfig;
  private tokens: Map<string, CancellationToken> = new Map();
  private callbacks: Map<string, Set<() => void>> = new Map();

  constructor(config: Partial<CancellationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Create a cancellation token
   */
  createToken(sessionId: string): CancellationToken {
    const token: CancellationToken = {
      id: crypto.randomUUID(),
      sessionId,
      cancelled: false,
      timestamp: Date.now(),
    };

    this.tokens.set(token.id, token);

    logger.info('CancellationManager', 'TOKEN_CREATED', 'Cancellation token created', {
      tokenId: token.id,
      sessionId,
    });

    return token;
  }

  /**
   * Cancel a generation
   */
  cancel(tokenId: string, reason?: string): boolean {
    const token = this.tokens.get(tokenId);
    if (!token) {
      logger.warn('CancellationManager', 'TOKEN_NOT_FOUND', 'Cancellation token not found', {
        tokenId,
      });
      return false;
    }

    if (token.cancelled) {
      logger.warn('CancellationManager', 'ALREADY_CANCELLED', 'Token already cancelled', {
        tokenId,
      });
      return false;
    }

    token.cancelled = true;
    token.reason = reason;

    // Execute cancellation callbacks
    this.executeCallbacks(tokenId);

    // Cleanup if enabled
    if (this.config.enableCleanup) {
      this.cleanup(tokenId);
    }

    logger.info('CancellationManager', 'GENERATION_CANCELLED', 'Generation cancelled', {
      tokenId,
      sessionId: token.sessionId,
      reason,
    });

    return true;
  }

  /**
   * Check if a token is cancelled
   */
  isCancelled(tokenId: string): boolean {
    const token = this.tokens.get(tokenId);
    return token ? token.cancelled : false;
  }

  /**
   * Check if a session is cancelled
   */
  isSessionCancelled(sessionId: string): boolean {
    for (const token of this.tokens.values()) {
      if (token.sessionId === sessionId && token.cancelled) {
        return true;
      }
    }
    return false;
  }

  /**
   * Register a cancellation callback
   */
  registerCallback(tokenId: string, callback: () => void): void {
    if (!this.callbacks.has(tokenId)) {
      this.callbacks.set(tokenId, new Set());
    }

    this.callbacks.get(tokenId)!.add(callback);

    logger.info('CancellationManager', 'CALLBACK_REGISTERED', 'Cancellation callback registered', {
      tokenId,
    });
  }

  /**
   * Unregister a cancellation callback
   */
  unregisterCallback(tokenId: string, callback: () => void): void {
    const callbacks = this.callbacks.get(tokenId);
    if (callbacks) {
      callbacks.delete(callback);

      logger.info('CancellationManager', 'CALLBACK_UNREGISTERED', 'Cancellation callback unregistered', {
        tokenId,
      });
    }
  }

  /**
   * Execute cancellation callbacks
   */
  private executeCallbacks(tokenId: string): void {
    const callbacks = this.callbacks.get(tokenId);
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback();
        } catch (error) {
          logger.error('CancellationManager', 'CALLBACK_ERROR', 'Cancellation callback error', {
            tokenId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
  }

  /**
   * Cleanup a token
   */
  private cleanup(tokenId: string): void {
    this.tokens.delete(tokenId);
    this.callbacks.delete(tokenId);

    logger.info('CancellationManager', 'TOKEN_CLEANED', 'Token cleaned up', {
      tokenId,
    });
  }

  /**
   * Get a token by ID
   */
  getToken(tokenId: string): CancellationToken | undefined {
    return this.tokens.get(tokenId);
  }

  /**
   * Get tokens for a session
   */
  getSessionTokens(sessionId: string): CancellationToken[] {
    return Array.from(this.tokens.values()).filter(t => t.sessionId === sessionId);
  }

  /**
   * Get all tokens
   */
  getAllTokens(): CancellationToken[] {
    return Array.from(this.tokens.values());
  }

  /**
   * Get active tokens (not cancelled)
   */
  getActiveTokens(): CancellationToken[] {
    return Array.from(this.tokens.values()).filter(t => !t.cancelled);
  }

  /**
   * Get cancelled tokens
   */
  getCancelledTokens(): CancellationToken[] {
    return Array.from(this.tokens.values()).filter(t => t.cancelled);
  }

  /**
   * Clear all tokens
   */
  clearAll(): void {
    this.tokens.clear();
    this.callbacks.clear();

    logger.info('CancellationManager', 'ALL_CLEARED', 'All tokens cleared');
  }

  /**
   * Clear tokens for a session
   */
  clearSession(sessionId: string): void {
    const tokens = this.getSessionTokens(sessionId);
    for (const token of tokens) {
      this.cleanup(token.id);
    }

    logger.info('CancellationManager', 'SESSION_CLEARED', 'Session tokens cleared', {
      sessionId,
      count: tokens.length,
    });
  }

  /**
   * Get token count
   */
  getTokenCount(): number {
    return this.tokens.size;
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
   * Get statistics
   */
  getStatistics(): {
    totalTokens: number;
    activeTokens: number;
    cancelledTokens: number;
    registeredCallbacks: number;
    config: CancellationConfig;
  } {
    const totalTokens = this.tokens.size;
    const activeTokens = this.getActiveTokens().length;
    const cancelledTokens = this.getCancelledTokens().length;
    const registeredCallbacks = Array.from(this.callbacks.values()).reduce(
      (sum, callbacks) => sum + callbacks.size,
      0
    );

    return {
      totalTokens,
      activeTokens,
      cancelledTokens,
      registeredCallbacks,
      config: this.getConfig(),
    };
  }
}

export const cancellationManager = new CancellationManager();

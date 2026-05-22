import { logger } from '@oneatlas/ai-engine';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  halfOpenMaxCalls: number;
}

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime?: number;
  successCount: number;
  lastStateChange: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeout: 60000,
  monitoringPeriod: 60000,
  halfOpenMaxCalls: 3,
};

class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitBreakerState;
  private failureHistory: number[] = [];

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      lastStateChange: Date.now(),
    };
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
    if (this.state.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.transitionToHalfOpen();
      } else {
        throw new Error(`Circuit breaker is OPEN for ${operationName}. Rejecting call.`);
      }
    }

    if (this.state.state === 'half-open' && this.state.successCount >= this.config.halfOpenMaxCalls) {
      this.transitionToClosed();
    }

    try {
      const result = await operation();
      this.onSuccess(operationName);
      return result;
    } catch (error) {
      this.onFailure(operationName, error);
      throw error;
    }
  }

  /**
   * Check if circuit breaker should attempt reset
   */
  private shouldAttemptReset(): boolean {
    const now = Date.now();
    return (
      this.state.lastFailureTime !== undefined &&
      now - this.state.lastFailureTime >= this.config.recoveryTimeout
    );
  }

  /**
   * Transition to half-open state
   */
  private transitionToHalfOpen(): void {
    logger.info('CircuitBreaker', 'STATE_TRANSITION_HALF_OPEN', 'Circuit breaker transitioning to HALF-OPEN', {
      previousState: this.state.state,
      failureCount: this.state.failureCount,
    });
    
    this.state = {
      ...this.state,
      state: 'half-open',
      successCount: 0,
      lastStateChange: Date.now(),
    };
  }

  /**
   * Transition to closed state
   */
  private transitionToClosed(): void {
    logger.info('CircuitBreaker', 'STATE_TRANSITION_CLOSED', 'Circuit breaker transitioning to CLOSED', {
      previousState: this.state.state,
    });

    this.state = {
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      lastStateChange: Date.now(),
    };
    this.failureHistory = [];
  }

  /**
   * Transition to open state
   */
  private transitionToOpen(): void {
    logger.info('CircuitBreaker', 'STATE_TRANSITION_OPEN', 'Circuit breaker transitioning to OPEN', {
      previousState: this.state.state,
      failureCount: this.state.failureCount,
    });

    this.state = {
      ...this.state,
      state: 'open',
      lastFailureTime: Date.now(),
      lastStateChange: Date.now(),
    };
  }

  /**
   * Handle successful operation
   */
  private onSuccess(operationName: string): void {
    this.state.successCount++;
    
    if (this.state.state === 'half-open') {
      logger.info('CircuitBreaker', 'HALF_OPEN_CALL_SUCCEEDED', 'Circuit breaker HALF-OPEN call succeeded', {
        operationName,
        successCount: this.state.successCount,
        halfOpenMaxCalls: this.config.halfOpenMaxCalls,
      });
    }

    if (this.state.state === 'closed') {
      this.state.failureCount = Math.max(0, this.state.failureCount - 1);
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(operationName: string, error: unknown): void {
    this.state.failureCount++;
    this.state.lastFailureTime = Date.now();
    
    this.recordFailure();

    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn('CircuitBreaker', 'FAILURE_RECORDED', 'Circuit breaker recorded failure', {
      operationName,
      failureCount: this.state.failureCount,
      threshold: this.config.failureThreshold,
      error: errorMessage,
    });

    if (this.state.failureCount >= this.config.failureThreshold) {
      this.transitionToOpen();
    }
  }

  /**
   * Record failure timestamp for monitoring
   */
  private recordFailure(): void {
    const now = Date.now();
    this.failureHistory.push(now);
    
    const cutoffTime = now - this.config.monitoringPeriod;
    this.failureHistory = this.failureHistory.filter(time => time > cutoffTime);
  }

  /**
   * Get current circuit breaker state
   */
  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  /**
   * Get failure rate in current monitoring period
   */
  getFailureRate(): number {
    const now = Date.now();
    const recentFailures = this.failureHistory.filter(
      time => now - time <= this.config.monitoringPeriod
    );
    
    if (recentFailures.length === 0) {
      return 0;
    }

    const failureRate = recentFailures.length / this.config.failureThreshold;
    return Math.min(failureRate, 1);
  }

  /**
   * Manually reset circuit breaker
   */
  reset(): void {
    logger.info('CircuitBreaker', 'MANUAL_RESET', 'Circuit breaker manually reset', {
      previousState: this.state.state,
    });

    this.state = {
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      lastStateChange: Date.now(),
    };
    this.failureHistory = [];
  }

  /**
   * Check if circuit breaker allows requests
   */
  allowRequest(): boolean {
    return this.state.state !== 'open' || this.shouldAttemptReset();
  }
}

class CircuitBreakerRegistry {
  private circuitBreakers = new Map<string, CircuitBreaker>();

  /**
   * Get or create circuit breaker for a service
   */
  getCircuitBreaker(serviceName: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, new CircuitBreaker(config));
    }
    return this.circuitBreakers.get(serviceName)!;
  }

  /**
   * Get all circuit breaker states
   */
  getAllStates(): Record<string, CircuitBreakerState> {
    const states: Record<string, CircuitBreakerState> = {};
    for (const [serviceName, breaker] of this.circuitBreakers.entries()) {
      states[serviceName] = breaker.getState();
    }
    return states;
  }

  /**
   * Reset specific circuit breaker
   */
  resetService(serviceName: string): void {
    const breaker = this.circuitBreakers.get(serviceName);
    if (breaker) {
      breaker.reset();
    }
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.circuitBreakers.values()) {
      breaker.reset();
    }
  }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry();
export { CircuitBreaker };
export default circuitBreakerRegistry;
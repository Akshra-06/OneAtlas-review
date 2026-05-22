/**
 * Streaming Optimizer
 * 
 * Optimizes streaming performance.
 * Manages streaming efficiency and resource usage.
 */

import { logger } from '../../shared/utils/logger';

export interface OptimizationMetrics {
  sessionId: string;
  throughput: number; // bytes per second
  latency: number; // milliseconds
  bufferSize: number;
  compressionRatio: number;
  timestamp: number;
}

export interface OptimizationConfig {
  enableCompression: boolean;
  enableBuffering: boolean;
  bufferSize: number;
  targetLatencyMs: number;
}

const DEFAULT_CONFIG: OptimizationConfig = {
  enableCompression: true,
  enableBuffering: true,
  bufferSize: 1024 * 1024, // 1MB
  targetLatencyMs: 100,
};

/**
 * Streaming Optimizer
 * 
 * Optimizes streaming performance:
 * - Throughput optimization
 * - Latency reduction
 * - Buffer management
 * - Compression
 */
export class StreamingOptimizer {
  private config: OptimizationConfig;
  private metrics: Map<string, OptimizationMetrics[]> = new Map();
  private currentMetrics: Map<string, OptimizationMetrics | null> = new Map();

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Record optimization metrics
   */
  recordMetrics(sessionId: string, metrics: Omit<OptimizationMetrics, 'timestamp'>): void {
    const optimizationMetrics: OptimizationMetrics = {
      ...metrics,
      timestamp: Date.now(),
    };

    if (!this.metrics.has(sessionId)) {
      this.metrics.set(sessionId, []);
    }

    this.metrics.get(sessionId)!.push(optimizationMetrics);
    this.currentMetrics.set(sessionId, optimizationMetrics);

    logger.info('StreamingOptimizer', 'METRICS_RECORDED', 'Metrics recorded', {
      sessionId,
      throughput: metrics.throughput,
      latency: metrics.latency,
    });
  }

  /**
   * Get current metrics for a session
   */
  getCurrentMetrics(sessionId: string): OptimizationMetrics | null {
    return this.currentMetrics.get(sessionId) || null;
  }

  /**
   * Get metrics history for a session
   */
  getMetricsHistory(sessionId: string): OptimizationMetrics[] {
    return this.metrics.get(sessionId) || [];
  }

  /**
   * Calculate average throughput for a session
   */
  getAverageThroughput(sessionId: string): number | undefined {
    const history = this.metrics.get(sessionId);
    if (!history || history.length === 0) {
      return undefined;
    }

    const total = history.reduce((sum, m) => sum + m.throughput, 0);
    return total / history.length;
  }

  /**
   * Calculate average latency for a session
   */
  getAverageLatency(sessionId: string): number | undefined {
    const history = this.metrics.get(sessionId);
    if (!history || history.length === 0) {
      return undefined;
    }

    const total = history.reduce((sum, m) => sum + m.latency, 0);
    return total / history.length;
  }

  /**
   * Optimize streaming parameters based on metrics
   */
  optimize(sessionId: string): Partial<OptimizationConfig> {
    const currentMetrics = this.getCurrentMetrics(sessionId);
    if (!currentMetrics) {
      return {};
    }

    const optimizations: Partial<OptimizationConfig> = {};

    // Adjust buffer size based on throughput
    if (currentMetrics.throughput < 1024 * 1024) {
      // Low throughput, increase buffer
      optimizations.bufferSize = this.config.bufferSize * 2;
    } else if (currentMetrics.throughput > 10 * 1024 * 1024) {
      // High throughput, decrease buffer
      optimizations.bufferSize = Math.max(this.config.bufferSize / 2, 256 * 1024);
    }

    // Adjust compression based on latency
    if (currentMetrics.latency > this.config.targetLatencyMs * 2) {
      // High latency, enable compression
      optimizations.enableCompression = true;
    } else if (currentMetrics.latency < this.config.targetLatencyMs / 2) {
      // Low latency, disable compression
      optimizations.enableCompression = false;
    }

    logger.info('StreamingOptimizer', 'OPTIMIZATION_APPLIED', 'Optimization applied', {
      sessionId,
      optimizations,
    });

    return optimizations;
  }

  /**
   * Clear metrics for a session
   */
  clearMetrics(sessionId: string): void {
    this.metrics.delete(sessionId);
    this.currentMetrics.delete(sessionId);

    logger.info('StreamingOptimizer', 'METRICS_CLEARED', 'Metrics cleared', {
      sessionId,
    });
  }

  /**
   * Clear all metrics
   */
  clearAllMetrics(): void {
    this.metrics.clear();
    this.currentMetrics.clear();

    logger.info('StreamingOptimizer', 'ALL_METRICS_CLEARED', 'All metrics cleared');
  }

  /**
   * Get statistics for a session
   */
  getSessionStatistics(sessionId: string): {
    averageThroughput: number | undefined;
    averageLatency: number | undefined;
    currentMetrics: OptimizationMetrics | null;
  } {
    return {
      averageThroughput: this.getAverageThroughput(sessionId),
      averageLatency: this.getAverageLatency(sessionId),
      currentMetrics: this.getCurrentMetrics(sessionId),
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('StreamingOptimizer', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): OptimizationConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    totalMetrics: number;
    averageMetricsPerSession: number;
    config: OptimizationConfig;
  } {
    const totalSessions = this.metrics.size;
    const totalMetrics = Array.from(this.metrics.values()).reduce(
      (sum, metrics) => sum + metrics.length,
      0
    );
    const averageMetricsPerSession = totalSessions > 0 ? totalMetrics / totalSessions : 0;

    return {
      totalSessions,
      totalMetrics,
      averageMetricsPerSession,
      config: this.getConfig(),
    };
  }
}

export const streamingOptimizer = new StreamingOptimizer();

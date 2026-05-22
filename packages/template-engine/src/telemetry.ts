/**
 * Telemetry System for AI Modification Performance
 * Tracks and analyzes AI modification metrics
 */

export interface ModificationMetric {
  timestamp: string;
  entityName: string;
  domain: string;
  taskType: string;
  complexity: string;
  cached: boolean;
  success: boolean;
  duration: number;
  provider?: string;
  model?: string;
  confidence: number;
  errorCode?: string;
}

class ModificationTelemetry {
  private metrics: ModificationMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics

  /**
   * Record a modification metric
   */
  record(metric: ModificationMetric): void {
    this.metrics.push(metric);
    
    // Keep only the last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * Get metrics for a specific entity
   */
  getMetricsForEntity(entityName: string): ModificationMetric[] {
    return this.metrics.filter(m => m.entityName === entityName);
  }

  /**
   * Get metrics for a specific domain
   */
  getMetricsForDomain(domain: string): ModificationMetric[] {
    return this.metrics.filter(m => m.domain === domain);
  }

  /**
   * Get success rate
   */
  getSuccessRate(): number {
    if (this.metrics.length === 0) return 0;
    const successful = this.metrics.filter(m => m.success).length;
    return successful / this.metrics.length;
  }

  /**
   * Get cache hit rate
   */
  getCacheHitRate(): number {
    if (this.metrics.length === 0) return 0;
    const cached = this.metrics.filter(m => m.cached).length;
    return cached / this.metrics.length;
  }

  /**
   * Get average duration
   */
  getAverageDuration(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / this.metrics.length;
  }

  /**
   * Get average confidence
   */
  getAverageConfidence(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, m) => sum + m.confidence, 0);
    return total / this.metrics.length;
  }

  /**
   * Get metrics by provider
   */
  getMetricsByProvider(): Record<string, number> {
    const providerCounts: Record<string, number> = {};
    for (const metric of this.metrics) {
      if (metric.provider) {
        providerCounts[metric.provider] = (providerCounts[metric.provider] || 0) + 1;
      }
    }
    return providerCounts;
  }

  /**
   * Get error distribution
   */
  getErrorDistribution(): Record<string, number> {
    const errorCounts: Record<string, number> = {};
    for (const metric of this.metrics) {
      if (metric.errorCode) {
        errorCounts[metric.errorCode] = (errorCounts[metric.errorCode] || 0) + 1;
      }
    }
    return errorCounts;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalModifications: number;
    successRate: number;
    cacheHitRate: number;
    averageDuration: number;
    averageConfidence: number;
    providerDistribution: Record<string, number>;
    errorDistribution: Record<string, number>;
  } {
    return {
      totalModifications: this.metrics.length,
      successRate: this.getSuccessRate(),
      cacheHitRate: this.getCacheHitRate(),
      averageDuration: this.getAverageDuration(),
      averageConfidence: this.getAverageConfidence(),
      providerDistribution: this.getMetricsByProvider(),
      errorDistribution: this.getErrorDistribution(),
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Get recent metrics (last N)
   */
  getRecent(count: number = 10): ModificationMetric[] {
    return this.metrics.slice(-count);
  }
}

export const modificationTelemetry = new ModificationTelemetry();

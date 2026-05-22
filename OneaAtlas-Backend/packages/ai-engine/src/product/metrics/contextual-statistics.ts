/**
 * Contextual Statistics
 * 
 * Generates contextual statistics and aggregations.
 * Provides statistical context for metrics.
 */

import { logger } from '../../shared/utils/logger';
import { MetricDefinition } from './semantic-metrics-engine';

export interface StatisticDefinition {
  id: string;
  name: string;
  description: string;
  metricId: string;
  type: 'average' | 'sum' | 'min' | 'max' | 'median' | 'percentile' | 'trend' | 'comparison';
  timeWindow: string;
  aggregation: string;
}

export interface StatisticsConfig {
  enableAutoAggregation: boolean;
  enableTrendAnalysis: boolean;
  enableComparison: boolean;
}

const DEFAULT_CONFIG: StatisticsConfig = {
  enableAutoAggregation: true,
  enableTrendAnalysis: true,
  enableComparison: true,
};

/**
 * Contextual Statistics
 * 
 * Generates contextual statistics:
 * - Statistical aggregations
 * - Trend analysis
 * - Comparisons
 * - Percentiles
 */
export class ContextualStatistics {
  private config: StatisticsConfig;

  constructor(config: Partial<StatisticsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate statistics for metrics
   */
  generateStatistics(metrics: MetricDefinition[]): StatisticDefinition[] {
    const statistics: StatisticDefinition[] = [];

    for (const metric of metrics) {
      const metricStats = this.generateMetricStatistics(metric);
      statistics.push(...metricStats);
    }

    logger.info('ContextualStatistics', 'STATISTICS_GENERATED', 'Statistics generated', {
      metricCount: metrics.length,
      statisticCount: statistics.length,
    });

    return statistics;
  }

  /**
   * Generate statistics for a single metric
   */
  private generateMetricStatistics(metric: MetricDefinition): StatisticDefinition[] {
    const statistics: StatisticDefinition[] = [];

    // Generate aggregations based on metric type
    switch (metric.type) {
      case 'count':
        statistics.push(...this.generateCountStatistics(metric));
        break;
      case 'percentage':
        statistics.push(...this.generatePercentageStatistics(metric));
        break;
      case 'currency':
        statistics.push(...this.generateCurrencyStatistics(metric));
        break;
      case 'duration':
        statistics.push(...this.generateDurationStatistics(metric));
        break;
      case 'rate':
        statistics.push(...this.generateRateStatistics(metric));
        break;
      case 'score':
        statistics.push(...this.generateScoreStatistics(metric));
        break;
    }

    return statistics;
  }

  /**
   * Generate statistics for count metrics
   */
  private generateCountStatistics(metric: MetricDefinition): StatisticDefinition[] {
    const statistics: StatisticDefinition[] = [];

    if (this.config.enableAutoAggregation) {
      statistics.push({
        id: `stat_${metric.id}_sum`,
        name: `Total ${metric.name}`,
        description: `Sum of ${metric.name}`,
        metricId: metric.id,
        type: 'sum',
        timeWindow: 'all',
        aggregation: 'sum',
      });

      statistics.push({
        id: `stat_${metric.id}_avg`,
        name: `Average ${metric.name}`,
        description: `Average of ${metric.name}`,
        metricId: metric.id,
        type: 'average',
        timeWindow: 'daily',
        aggregation: 'average',
      });
    }

    if (this.config.enableTrendAnalysis) {
      statistics.push({
        id: `stat_${metric.id}_trend`,
        name: `${metric.name} Trend`,
        description: `Trend of ${metric.name}`,
        metricId: metric.id,
        type: 'trend',
        timeWindow: 'weekly',
        aggregation: 'trend',
      });
    }

    if (this.config.enableComparison) {
      statistics.push({
        id: `stat_${metric.id}_comparison`,
        name: `${metric.name} Comparison`,
        description: `Comparison of ${metric.name} to previous period`,
        metricId: metric.id,
        type: 'comparison',
        timeWindow: 'monthly',
        aggregation: 'comparison',
      });
    }

    return statistics;
  }

  /**
   * Generate statistics for percentage metrics
   */
  private generatePercentageStatistics(metric: MetricDefinition): StatisticDefinition[] {
    const statistics: StatisticDefinition[] = [];

    if (this.config.enableAutoAggregation) {
      statistics.push({
        id: `stat_${metric.id}_avg`,
        name: `Average ${metric.name}`,
        description: `Average of ${metric.name}`,
        metricId: metric.id,
        type: 'average',
        timeWindow: 'daily',
        aggregation: 'average',
      });

      statistics.push({
        id: `stat_${metric.id}_median`,
        name: `Median ${metric.name}`,
        description: `Median of ${metric.name}`,
        metricId: metric.id,
        type: 'median',
        timeWindow: 'weekly',
        aggregation: 'median',
      });
    }

    if (this.config.enableTrendAnalysis) {
      statistics.push({
        id: `stat_${metric.id}_trend`,
        name: `${metric.name} Trend`,
        description: `Trend of ${metric.name}`,
        metricId: metric.id,
        type: 'trend',
        timeWindow: 'weekly',
        aggregation: 'trend',
      });
    }

    return statistics;
  }

  /**
   * Generate statistics for currency metrics
   */
  private generateCurrencyStatistics(metric: MetricDefinition): StatisticDefinition[] {
    const statistics: StatisticDefinition[] = [];

    if (this.config.enableAutoAggregation) {
      statistics.push({
        id: `stat_${metric.id}_sum`,
        name: `Total ${metric.name}`,
        description: `Sum of ${metric.name}`,
        metricId: metric.id,
        type: 'sum',
        timeWindow: 'all',
        aggregation: 'sum',
      });

      statistics.push({
        id: `stat_${metric.id}_avg`,
        name: `Average ${metric.name}`,
        description: `Average of ${metric.name}`,
        metricId: metric.id,
        type: 'average',
        timeWindow: 'daily',
        aggregation: 'average',
      });
    }

    if (this.config.enableComparison) {
      statistics.push({
        id: `stat_${metric.id}_comparison`,
        name: `${metric.name} Comparison`,
        description: `Comparison of ${metric.name} to previous period`,
        metricId: metric.id,
        type: 'comparison',
        timeWindow: 'monthly',
        aggregation: 'comparison',
      });
    }

    return statistics;
  }

  /**
   * Generate statistics for duration metrics
   */
  private generateDurationStatistics(metric: MetricDefinition): StatisticDefinition[] {
    const statistics: StatisticDefinition[] = [];

    if (this.config.enableAutoAggregation) {
      statistics.push({
        id: `stat_${metric.id}_avg`,
        name: `Average ${metric.name}`,
        description: `Average of ${metric.name}`,
        metricId: metric.id,
        type: 'average',
        timeWindow: 'daily',
        aggregation: 'average',
      });

      statistics.push({
        id: `stat_${metric.id}_median`,
        name: `Median ${metric.name}`,
        description: `Median of ${metric.name}`,
        metricId: metric.id,
        type: 'median',
        timeWindow: 'weekly',
        aggregation: 'median',
      });

      statistics.push({
        id: `stat_${metric.id}_p95`,
        name: `95th Percentile ${metric.name}`,
        description: `95th percentile of ${metric.name}`,
        metricId: metric.id,
        type: 'percentile',
        timeWindow: 'weekly',
        aggregation: 'percentile_95',
      });
    }

    if (this.config.enableTrendAnalysis) {
      statistics.push({
        id: `stat_${metric.id}_trend`,
        name: `${metric.name} Trend`,
        description: `Trend of ${metric.name}`,
        metricId: metric.id,
        type: 'trend',
        timeWindow: 'weekly',
        aggregation: 'trend',
      });
    }

    return statistics;
  }

  /**
   * Generate statistics for rate metrics
   */
  private generateRateStatistics(metric: MetricDefinition): StatisticDefinition[] {
    const statistics: StatisticDefinition[] = [];

    if (this.config.enableAutoAggregation) {
      statistics.push({
        id: `stat_${metric.id}_avg`,
        name: `Average ${metric.name}`,
        description: `Average of ${metric.name}`,
        metricId: metric.id,
        type: 'average',
        timeWindow: 'daily',
        aggregation: 'average',
      });
    }

    if (this.config.enableTrendAnalysis) {
      statistics.push({
        id: `stat_${metric.id}_trend`,
        name: `${metric.name} Trend`,
        description: `Trend of ${metric.name}`,
        metricId: metric.id,
        type: 'trend',
        timeWindow: 'weekly',
        aggregation: 'trend',
      });
    }

    return statistics;
  }

  /**
   * Generate statistics for score metrics
   */
  private generateScoreStatistics(metric: MetricDefinition): StatisticDefinition[] {
    const statistics: StatisticDefinition[] = [];

    if (this.config.enableAutoAggregation) {
      statistics.push({
        id: `stat_${metric.id}_avg`,
        name: `Average ${metric.name}`,
        description: `Average of ${metric.name}`,
        metricId: metric.id,
        type: 'average',
        timeWindow: 'daily',
        aggregation: 'average',
      });

      statistics.push({
        id: `stat_${metric.id}_median`,
        name: `Median ${metric.name}`,
        description: `Median of ${metric.name}`,
        metricId: metric.id,
        type: 'median',
        timeWindow: 'weekly',
        aggregation: 'median',
      });

      statistics.push({
        id: `stat_${metric.id}_min`,
        name: `Minimum ${metric.name}`,
        description: `Minimum of ${metric.name}`,
        metricId: metric.id,
        type: 'min',
        timeWindow: 'weekly',
        aggregation: 'min',
      });

      statistics.push({
        id: `stat_${metric.id}_max`,
        name: `Maximum ${metric.name}`,
        description: `Maximum of ${metric.name}`,
        metricId: metric.id,
        type: 'max',
        timeWindow: 'weekly',
        aggregation: 'max',
      });
    }

    if (this.config.enableTrendAnalysis) {
      statistics.push({
        id: `stat_${metric.id}_trend`,
        name: `${metric.name} Trend`,
        description: `Trend of ${metric.name}`,
        metricId: metric.id,
        type: 'trend',
        timeWindow: 'weekly',
        aggregation: 'trend',
      });
    }

    return statistics;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<StatisticsConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ContextualStatistics', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): StatisticsConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: StatisticsConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const contextualStatistics = new ContextualStatistics();

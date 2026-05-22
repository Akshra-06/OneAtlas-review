/**
 * Metrics Inference
 * 
 * Infers metrics from data schema and domain context.
 * Determines relevant metrics based on data structure.
 */

import { logger } from '../../shared/utils/logger';
import { MetricDefinition } from './semantic-metrics-engine';

export interface InferenceRequest {
  schema: Record<string, unknown>;
  domain: string;
  context?: Record<string, unknown>;
}

export interface InferenceResult {
  metrics: MetricDefinition[];
  confidence: number;
  reasoning: string;
}

export interface InferenceConfig {
  enableSchemaAnalysis: boolean;
  enableContextInference: boolean;
  minConfidence: number;
}

const DEFAULT_CONFIG: InferenceConfig = {
  enableSchemaAnalysis: true,
  enableContextInference: true,
  minConfidence: 0.5,
};

/**
 * Metrics Inference
 * 
 * Infers metrics from schema:
 * - Schema analysis
 * - Context inference
 * - Metric suggestion
 * - Confidence scoring
 */
export class MetricsInference {
  private config: InferenceConfig;

  constructor(config: Partial<InferenceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Infer metrics from schema and context
   */
  inferMetrics(request: InferenceRequest): InferenceResult {
    const { schema, domain, context } = request;
    const metrics: MetricDefinition[] = [];
    let confidence = 0;

    // Analyze schema
    if (this.config.enableSchemaAnalysis) {
      const schemaMetrics = this.analyzeSchema(schema, domain);
      metrics.push(...schemaMetrics);
    }

    // Infer from context
    if (this.config.enableContextInference && context) {
      const contextMetrics = this.inferFromContext(context, domain);
      metrics.push(...contextMetrics);
    }

    // Calculate confidence
    confidence = this.calculateConfidence(metrics, request);

    // Generate reasoning
    const reasoning = this.generateReasoning(metrics, request);

    logger.info('MetricsInference', 'METRICS_INFERRED', 'Metrics inferred', {
      domain,
      metricCount: metrics.length,
      confidence,
    });

    return {
      metrics,
      confidence,
      reasoning,
    };
  }

  /**
   * Analyze schema for metric opportunities
   */
  private analyzeSchema(schema: Record<string, unknown>, domain: string): MetricDefinition[] {
    const metrics: MetricDefinition[] = [];
    const schemaKeys = Object.keys(schema);

    for (const key of schemaKeys) {
      const value = schema[key];
      const lowerKey = key.toLowerCase();

      // Count metrics
      if (lowerKey.includes('count') || lowerKey.includes('total') || lowerKey.includes('number')) {
        metrics.push({
          id: `metric_${key}`,
          name: this.formatMetricName(key),
          description: `Total count of ${key}`,
          domain,
          type: 'count',
          category: 'operational',
          priority: 0.7,
        });
      }

      // Percentage metrics
      if (lowerKey.includes('rate') || lowerKey.includes('percentage') || lowerKey.includes('ratio')) {
        metrics.push({
          id: `metric_${key}`,
          name: this.formatMetricName(key),
          description: `Percentage of ${key}`,
          domain,
          type: 'percentage',
          category: 'performance',
          priority: 0.8,
        });
      }

      // Currency metrics
      if (lowerKey.includes('price') || lowerKey.includes('cost') || lowerKey.includes('revenue') || lowerKey.includes('amount')) {
        metrics.push({
          id: `metric_${key}`,
          name: this.formatMetricName(key),
          description: `Monetary value of ${key}`,
          domain,
          type: 'currency',
          category: 'financial',
          priority: 0.9,
        });
      }

      // Duration metrics
      if (lowerKey.includes('time') || lowerKey.includes('duration') || lowerKey.includes('latency')) {
        metrics.push({
          id: `metric_${key}`,
          name: this.formatMetricName(key),
          description: `Time duration for ${key}`,
          domain,
          type: 'duration',
          category: 'performance',
          priority: 0.8,
        });
      }

      // Score metrics
      if (lowerKey.includes('score') || lowerKey.includes('rating') || lowerKey.includes('satisfaction')) {
        metrics.push({
          id: `metric_${key}`,
          name: this.formatMetricName(key),
          description: `Score for ${key}`,
          domain,
          type: 'score',
          category: 'quality',
          priority: 0.7,
        });
      }
    }

    return metrics;
  }

  /**
   * Infer metrics from context
   */
  private inferFromContext(context: Record<string, unknown>, domain: string): MetricDefinition[] {
    const metrics: MetricDefinition[] = [];
    const contextKeys = Object.keys(context);

    for (const key of contextKeys) {
      const value = context[key];
      const lowerKey = key.toLowerCase();

      // User-related metrics
      if (lowerKey.includes('user') || lowerKey.includes('customer') || lowerKey.includes('patient')) {
        metrics.push({
          id: `metric_${key}`,
          name: this.formatMetricName(key),
          description: `User-related metric for ${key}`,
          domain,
          type: 'count',
          category: 'user',
          priority: 0.6,
        });
      }

      // Performance-related metrics
      if (lowerKey.includes('performance') || lowerKey.includes('efficiency') || lowerKey.includes('throughput')) {
        metrics.push({
          id: `metric_${key}`,
          name: this.formatMetricName(key),
          description: `Performance metric for ${key}`,
          domain,
          type: 'rate',
          category: 'performance',
          priority: 0.7,
        });
      }

      // Quality-related metrics
      if (lowerKey.includes('quality') || lowerKey.includes('error') || lowerKey.includes('defect')) {
        metrics.push({
          id: `metric_${key}`,
          name: this.formatMetricName(key),
          description: `Quality metric for ${key}`,
          domain,
          type: 'percentage',
          category: 'quality',
          priority: 0.7,
        });
      }
    }

    return metrics;
  }

  /**
   * Calculate confidence for inferred metrics
   */
  private calculateConfidence(metrics: MetricDefinition[], request: InferenceRequest): number {
    if (metrics.length === 0) {
      return 0;
    }

    let confidence = 0;

    // Schema analysis contributes to confidence
    if (this.config.enableSchemaAnalysis && Object.keys(request.schema).length > 0) {
      confidence += 0.4;
    }

    // Context inference contributes to confidence
    if (this.config.enableContextInference && request.context && Object.keys(request.context).length > 0) {
      confidence += 0.3;
    }

    // Metric count contributes to confidence
    confidence += Math.min(metrics.length * 0.05, 0.3);

    return Math.min(confidence, 1.0);
  }

  /**
   * Generate reasoning for inference
   */
  private generateReasoning(metrics: MetricDefinition[], request: InferenceRequest): string {
    const parts: string[] = [];

    if (this.config.enableSchemaAnalysis && Object.keys(request.schema).length > 0) {
      parts.push('analyzed schema structure');
    }

    if (this.config.enableContextInference && request.context && Object.keys(request.context).length > 0) {
      parts.push('inferred from context');
    }

    if (metrics.length > 0) {
      parts.push(`identified ${metrics.length} potential metrics`);
    }

    return parts.join(', ') || 'no metrics inferred';
  }

  /**
   * Format metric name from key
   */
  private formatMetricName(key: string): string {
    return key
      .split(/[_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<InferenceConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('MetricsInference', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): InferenceConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: InferenceConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const metricsInference = new MetricsInference();

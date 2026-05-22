import type { AppUnderstanding, EntitySchema, GenerationResult } from '@oneatlas/shared';
import type { PipelineContext } from '../pipeline/generation.pipeline';
import { logger } from '@oneatlas/ai-engine';

export interface PipelineMetrics {
  runId: string;
  stage: string;
  timestamp: number;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface ResourceMetrics {
  timestamp: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  eventLoopLag: number;
  activeHandles: number;
  activeRequests: number;
}

export interface AIMetrics {
  timestamp: number;
  provider: string;
  model: string;
  tokensUsed: number;
  costUsd: number;
  latency: number;
  success: boolean;
  error?: string;
}

export interface GenerationMetrics {
  runId: string;
  entityCount: number;
  fieldCount: number;
  relationCount: number;
  fileCount: number;
  totalSize: number;
  validationIssues: number;
  repairCount: number;
  generationTime: number;
}

class MonitoringService {
  private pipelineMetrics: PipelineMetrics[] = [];
  private resourceMetrics: ResourceMetrics[] = [];
  private aiMetrics: AIMetrics[] = [];
  private generationMetrics: GenerationMetrics[] = [];
  private maxMetricsHistory = 1000;

  /**
   * Record pipeline stage metrics
   */
  recordPipelineMetric(metric: PipelineMetrics): void {
    this.pipelineMetrics.push(metric);
    
    if (this.pipelineMetrics.length > this.maxMetricsHistory) {
      this.pipelineMetrics.shift();
    }

    logger.info('MonitoringService', 'PIPELINE_STAGE_COMPLETED', 'Pipeline stage completed', {
      runId: metric.runId,
      stage: metric.stage,
      duration: metric.duration,
      success: metric.success,
    });
  }

  /**
   * Record resource usage metrics
   */
  recordResourceMetric(): ResourceMetrics {
    const metric: ResourceMetrics = {
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      eventLoopLag: this.measureEventLoopLag(),
      activeHandles: (process as any)._getActiveHandles()?.length || 0,
      activeRequests: (process as any)._getActiveRequests()?.length || 0,
    };

    this.resourceMetrics.push(metric);
    
    if (this.resourceMetrics.length > this.maxMetricsHistory) {
      this.resourceMetrics.shift();
    }

    return metric;
  }

  /**
   * Measure event loop lag
   */
  private measureEventLoopLag(): number {
    const start = Date.now();
    return new Promise((resolve) => {
      setImmediate(() => {
        resolve(Date.now() - start);
      });
    }) as unknown as number;
  }

  /**
   * Record AI service metrics
   */
  recordAIMetric(metric: AIMetrics): void {
    this.aiMetrics.push(metric);
    
    if (this.aiMetrics.length > this.maxMetricsHistory) {
      this.aiMetrics.shift();
    }

    logger.info('MonitoringService', 'AI_CALL_COMPLETED', 'AI service call completed', {
      provider: metric.provider,
      model: metric.model,
      tokensUsed: metric.tokensUsed,
      costUsd: metric.costUsd,
      latency: metric.latency,
      success: metric.success,
    });
  }

  /**
   * Record generation metrics
   */
  recordGenerationMetric(metric: GenerationMetrics): void {
    this.generationMetrics.push(metric);
    
    if (this.generationMetrics.length > this.maxMetricsHistory) {
      this.generationMetrics.shift();
    }

    logger.info('MonitoringService', 'GENERATION_COMPLETED', 'Generation completed', {
      runId: metric.runId,
      entityCount: metric.entityCount,
      fileCount: metric.fileCount,
      validationIssues: metric.validationIssues,
      generationTime: metric.generationTime,
    });
  }

  /**
   * Get pipeline performance summary
   */
  getPipelineSummary(runId: string): {
    totalDuration: number;
    stageBreakdown: Record<string, { count: number; avgDuration: number; successRate: number }>;
    errorRate: number;
  } {
    const runMetrics = this.pipelineMetrics.filter(m => m.runId === runId);
    
    if (runMetrics.length === 0) {
      return {
        totalDuration: 0,
        stageBreakdown: {},
        errorRate: 0,
      };
    }

    const stageBreakdown: Record<string, { count: number; avgDuration: number; successRate: number }> = {};
    let totalDuration = 0;
    let errorCount = 0;

    for (const metric of runMetrics) {
      totalDuration += metric.duration;
      
      if (!metric.success) {
        errorCount++;
      }

      let stage = stageBreakdown[metric.stage];
      if (!stage) {
        stage = {
          count: 0,
          avgDuration: 0,
          successRate: 1,
        };
        stageBreakdown[metric.stage] = stage;
      }
      stage.count++;
      stage.avgDuration = (stage.avgDuration * (stage.count - 1) + metric.duration) / stage.count;
      stage.successRate = metric.success ? 
        (stage.successRate * (stage.count - 1) + 1) / stage.count :
        (stage.successRate * (stage.count - 1)) / stage.count;
    }

    return {
      totalDuration,
      stageBreakdown,
      errorRate: errorCount / runMetrics.length,
    };
  }

  /**
   * Get AI service performance summary
   */
  getAISummary(): {
    totalCalls: number;
    successRate: number;
    avgLatency: number;
    totalTokens: number;
    totalCost: number;
    byProvider: Record<string, { calls: number; successRate: number; avgLatency: number }>;
    byModel: Record<string, { calls: number; successRate: number; avgLatency: number }>;
  } {
    if (this.aiMetrics.length === 0) {
      return {
        totalCalls: 0,
        successRate: 1,
        avgLatency: 0,
        totalTokens: 0,
        totalCost: 0,
        byProvider: {},
        byModel: {},
      };
    }

    let totalCalls = 0;
    let successCount = 0;
    let totalLatency = 0;
    let totalTokens = 0;
    let totalCost = 0;

    const byProvider: Record<string, { calls: number; successRate: number; avgLatency: number }> = {};
    const byModel: Record<string, { calls: number; successRate: number; avgLatency: number }> = {};

    for (const metric of this.aiMetrics) {
      totalCalls++;
      if (metric.success) {
        successCount++;
      }
      totalLatency += metric.latency;
      totalTokens += metric.tokensUsed;
      totalCost += metric.costUsd;

      let provider = byProvider[metric.provider];
      if (!provider) {
        provider = { calls: 0, successRate: 1, avgLatency: 0 };
        byProvider[metric.provider] = provider;
      }
      provider.calls++;
      provider.successRate = metric.success ? 
        (provider.successRate * (provider.calls - 1) + 1) / provider.calls :
        (provider.successRate * (provider.calls - 1)) / provider.calls;
      provider.avgLatency = (provider.avgLatency * (provider.calls - 1) + metric.latency) / provider.calls;

      let model = byModel[metric.model];
      if (!model) {
        model = { calls: 0, successRate: 1, avgLatency: 0 };
        byModel[metric.model] = model;
      }
      model.calls++;
      model.successRate = metric.success ? 
        (model.successRate * (model.calls - 1) + 1) / model.calls :
        (model.successRate * (model.calls - 1)) / model.calls;
      model.avgLatency = (model.avgLatency * (model.calls - 1) + metric.latency) / model.calls;
    }

    return {
      totalCalls,
      successRate: successCount / totalCalls,
      avgLatency: totalLatency / totalCalls,
      totalTokens,
      totalCost,
      byProvider,
      byModel,
    };
  }

  /**
   * Get resource usage trends
   */
  getResourceTrends(durationMs: number = 60000): {
    avgMemoryUsage: number;
    maxMemoryUsage: number;
    avgCpuUsage: number;
    maxEventLoopLag: number;
    memoryTrend: 'increasing' | 'decreasing' | 'stable';
  } {
    const cutoffTime = Date.now() - durationMs;
    const recentMetrics = this.resourceMetrics.filter(m => m.timestamp >= cutoffTime);

    if (recentMetrics.length === 0) {
      return {
        avgMemoryUsage: 0,
        maxMemoryUsage: 0,
        avgCpuUsage: 0,
        maxEventLoopLag: 0,
        memoryTrend: 'stable',
      };
    }

    let totalMemory = 0;
    let maxMemory = 0;
    let totalCpu = 0;
    let maxEventLoopLag = 0;

    for (const metric of recentMetrics) {
      const memory = metric.memoryUsage.heapUsed;
      totalMemory += memory;
      maxMemory = Math.max(maxMemory, memory);
      
      const cpu = metric.cpuUsage.user + metric.cpuUsage.system;
      totalCpu += cpu;
      
      maxEventLoopLag = Math.max(maxEventLoopLag, metric.eventLoopLag);
    }

    const avgMemoryUsage = totalMemory / recentMetrics.length;
    const avgCpuUsage = totalCpu / recentMetrics.length;

    let memoryTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentMetrics.length >= 10) {
      const firstHalf = recentMetrics.slice(0, Math.floor(recentMetrics.length / 2));
      const secondHalf = recentMetrics.slice(Math.floor(recentMetrics.length / 2));
      
      const firstHalfAvg = firstHalf.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, m) => sum + m.memoryUsage.heapUsed, 0) / secondHalf.length;
      
      const changePercent = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;
      if (changePercent > 0.1) {
        memoryTrend = 'increasing';
      } else if (changePercent < -0.1) {
        memoryTrend = 'decreasing';
      }
    }

    return {
      avgMemoryUsage,
      maxMemoryUsage: maxMemory,
      avgCpuUsage,
      maxEventLoopLag,
      memoryTrend,
    };
  }

  /**
   * Detect anomalies in metrics
   */
  detectAnomalies(): {
    pipeline: string[];
    resource: string[];
    ai: string[];
  } {
    const anomalies = {
      pipeline: [] as string[],
      resource: [] as string[],
      ai: [] as string[],
    };

    if (this.pipelineMetrics.length > 10) {
      const recentFailures = this.pipelineMetrics
        .slice(-10)
        .filter(m => !m.success).length;
      
      if (recentFailures > 5) {
        anomalies.pipeline.push('High failure rate in recent pipeline stages');
      }
    }

    const resourceTrends = this.getResourceTrends();
    if (resourceTrends.memoryTrend === 'increasing' && resourceTrends.avgMemoryUsage > 500 * 1024 * 1024) {
      anomalies.resource.push('Memory usage trending upward (> 500MB average)');
    }

    if (resourceTrends.maxEventLoopLag > 100) {
      anomalies.resource.push(`High event loop lag detected (${resourceTrends.maxEventLoopLag}ms)`);
    }

    if (this.aiMetrics.length > 10) {
      const recentFailures = this.aiMetrics
        .slice(-10)
        .filter(m => !m.success).length;
      
      if (recentFailures > 5) {
        anomalies.ai.push('High AI service failure rate in recent calls');
      }
    }

    const aiSummary = this.getAISummary();
    if (aiSummary.avgLatency > 30000) {
      anomalies.ai.push(`High AI service latency (${aiSummary.avgLatency}ms average)`);
    }

    if (aiSummary.successRate < 0.8) {
      anomalies.ai.push(`Low AI service success rate (${(aiSummary.successRate * 100).toFixed(1)}%)`);
    }

    return anomalies;
  }

  /**
   * Export metrics for external monitoring
   */
  exportMetrics(): {
    pipeline: PipelineMetrics[];
    resource: ResourceMetrics[];
    ai: AIMetrics[];
    generation: GenerationMetrics[];
    summary: {
      pipeline: ReturnType<MonitoringService['getPipelineSummary']>;
      ai: ReturnType<MonitoringService['getAISummary']>;
      resource: ReturnType<MonitoringService['getResourceTrends']>;
      anomalies: ReturnType<MonitoringService['detectAnomalies']>;
    };
  } {
    return {
      pipeline: this.pipelineMetrics,
      resource: this.resourceMetrics,
      ai: this.aiMetrics,
      generation: this.generationMetrics,
      summary: {
        pipeline: this.getPipelineSummary('all'),
        ai: this.getAISummary(),
        resource: this.getResourceTrends(),
        anomalies: this.detectAnomalies(),
      },
    };
  }

  /**
   * Clear old metrics
   */
  clearMetrics(olderThanMs: number = 3600000): void {
    const cutoffTime = Date.now() - olderThanMs;

    this.pipelineMetrics = this.pipelineMetrics.filter(m => m.timestamp >= cutoffTime);
    this.resourceMetrics = this.resourceMetrics.filter(m => m.timestamp >= cutoffTime);
    this.aiMetrics = this.aiMetrics.filter(m => m.timestamp >= cutoffTime);
    this.generationMetrics = this.generationMetrics.filter(m => 
      this.pipelineMetrics.some(pm => pm.runId === m.runId && pm.timestamp >= cutoffTime)
    );
  }

  /**
   * Start resource monitoring
   */
  startResourceMonitoring(intervalMs: number = 5000): NodeJS.Timeout {
    return setInterval(() => {
      this.recordResourceMetric();
    }, intervalMs);
  }

  /**
   * Stop resource monitoring
   */
  stopResourceMonitoring(intervalId: NodeJS.Timeout): void {
    clearInterval(intervalId);
  }
}

export const monitoringService = new MonitoringService();
export { MonitoringService };
export default monitoringService;
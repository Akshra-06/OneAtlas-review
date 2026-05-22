/**
 * Job Monitoring
 * 
 * Provides job monitoring and metrics.
 * Tracks job performance and generates alerts.
 */

import { logger } from '@oneatlas/ai-engine';


export interface JobMetrics {
  jobId: string;
  jobType: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  attempts: number;
  error?: string;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface MonitoringConfig {
  enableMonitoring: boolean;
  alertOnFailure: boolean;
  alertOnLongRunning: boolean;
  longRunningThreshold: number; // In milliseconds
  metricsRetentionDays: number;
}

const DEFAULT_CONFIG: MonitoringConfig = {
  enableMonitoring: true,
  alertOnFailure: true,
  alertOnLongRunning: true,
  longRunningThreshold: 300000, // 5 minutes
  metricsRetentionDays: 7,
};

/**
 * Job Monitoring Manager
 * 
 * Monitors job execution:
 * - Job status tracking
 * - Performance metrics
 * - Alert generation
 * - Metrics retention
 */
export class JobMonitoringManager {
  private config: MonitoringConfig;
  private metrics: Map<string, JobMetrics> = new Map();
  private alerts: Array<{ timestamp: string; type: string; message: string; jobId: string }> = [];

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start monitoring job
   */
  startJob(jobId: string, jobType: string): JobMetrics {
    const metrics: JobMetrics = {
      jobId,
      jobType,
      startTime: new Date().toISOString(),
      status: 'running',
      attempts: 1,
    };

    this.metrics.set(jobId, metrics);

    logger.info('JobMonitoringManager', 'JOB_STARTED', 'Job monitoring started', {
      jobId,
      jobType,
    });

    return metrics;
  }

  /**
   * Update job status
   */
  updateJobStatus(
    jobId: string,
    status: JobMetrics['status'],
    error?: string,
  ): boolean {
    const metrics = this.metrics.get(jobId);
    
    if (!metrics) {
      return false;
    }

    metrics.status = status;

    if (status !== 'running') {
      metrics.endTime = new Date().toISOString();
      if (metrics.startTime) {
        metrics.duration = new Date(metrics.endTime).getTime() - new Date(metrics.startTime).getTime();
      }
    }

    if (error) {
      metrics.error = error;
    }

    // Generate alerts based on status
    if (status === 'failed' && this.config.alertOnFailure) {
      this.generateAlert('FAILURE', `Job failed: ${error}`, jobId);
    }

    if (status === 'cancelled') {
      this.generateAlert('CANCELLATION', 'Job was cancelled', jobId);
    }

    logger.info('JobMonitoringManager', 'JOB_STATUS_UPDATED', 'Job status updated', {
      jobId,
      status,
      duration: metrics.duration,
    });

    return true;
  }

  /**
   * Increment job attempts
   */
  incrementAttempts(jobId: string): boolean {
    const metrics = this.metrics.get(jobId);
    
    if (!metrics) {
      return false;
    }

    metrics.attempts++;

    logger.info('JobMonitoringManager', 'ATTEMPT_INCREMENTED', 'Job attempt incremented', {
      jobId,
      attempts: metrics.attempts,
    });

    return true;
  }

  /**
   * Update resource usage
   */
  updateResourceUsage(jobId: string, memoryUsage?: number, cpuUsage?: number): boolean {
    const metrics = this.metrics.get(jobId);
    
    if (!metrics) {
      return false;
    }

    metrics.memoryUsage = memoryUsage;
    metrics.cpuUsage = cpuUsage;

    return true;
  }

  /**
   * Get job metrics
   */
  getJobMetrics(jobId: string): JobMetrics | undefined {
    return this.metrics.get(jobId);
  }

  /**
   * List all job metrics
   */
  listJobMetrics(): JobMetrics[] {
    return Array.from(this.metrics.values()).sort((a, b) =>
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  /**
   * List jobs by status
   */
  listJobsByStatus(status: JobMetrics['status']): JobMetrics[] {
    return this.listJobMetrics().filter(m => m.status === status);
  }

  /**
   * List jobs by type
   */
  listJobsByType(jobType: string): JobMetrics[] {
    return this.listJobMetrics().filter(m => m.jobType === jobType);
  }

  /**
   * Check for long-running jobs
   */
  checkLongRunningJobs(): JobMetrics[] {
    const longRunning: JobMetrics[] = [];
    const now = Date.now();

    for (const metrics of this.metrics.values()) {
      if (metrics.status === 'running') {
        const startTime = new Date(metrics.startTime).getTime();
        const duration = now - startTime;

        if (duration > this.config.longRunningThreshold) {
          longRunning.push(metrics);

          if (this.config.alertOnLongRunning) {
            this.generateAlert(
              'LONG_RUNNING',
              `Job running for ${Math.floor(duration / 1000)}s`,
              metrics.jobId,
            );
          }
        }
      }
    }

    return longRunning;
  }

  /**
   * Generate alert
   */
  private generateAlert(type: string, message: string, jobId: string): void {
    const alert = {
      timestamp: new Date().toISOString(),
      type,
      message,
      jobId,
    };

    this.alerts.push(alert);

    logger.warn('JobMonitoringManager', 'ALERT_GENERATED', 'Alert generated', {
      type,
      message,
      jobId,
    });
  }

  /**
   * Get alerts
   */
  getAlerts(limit?: number): Array<{ timestamp: string; type: string; message: string; jobId: string }> {
    const sorted = this.alerts.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return limit ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Get alerts for job
   */
  getAlertsForJob(jobId: string): Array<{ timestamp: string; type: string; message: string; jobId: string }> {
    return this.alerts.filter(a => a.jobId === jobId);
  }

  /**
   * Clear alerts
   */
  clearAlerts(jobId?: string): void {
    if (jobId) {
      this.alerts = this.alerts.filter(a => a.jobId !== jobId);
    } else {
      this.alerts = [];
    }

    logger.info('JobMonitoringManager', 'ALERTS_CLEARED', 'Alerts cleared', { jobId });
  }

  /**
   * Get monitoring statistics
   */
  getStatistics(): {
    totalJobs: number;
    runningJobs: number;
    completedJobs: number;
    failedJobs: number;
    cancelledJobs: number;
    averageDuration: number;
    averageAttempts: number;
    totalAlerts: number;
  } {
    const metrics = this.listJobMetrics();

    const runningJobs = metrics.filter(m => m.status === 'running').length;
    const completedJobs = metrics.filter(m => m.status === 'completed').length;
    const failedJobs = metrics.filter(m => m.status === 'failed').length;
    const cancelledJobs = metrics.filter(m => m.status === 'cancelled').length;

    const completedMetrics = metrics.filter(m => m.status === 'completed' && m.duration !== undefined);
    const averageDuration = completedMetrics.length > 0
      ? completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / completedMetrics.length
      : 0;

    const averageAttempts = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + m.attempts, 0) / metrics.length
      : 0;

    return {
      totalJobs: metrics.length,
      runningJobs,
      completedJobs,
      failedJobs,
      cancelledJobs,
      averageDuration,
      averageAttempts,
      totalAlerts: this.alerts.length,
    };
  }

  /**
   * Cleanup old metrics
   */
  cleanupOldMetrics(): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.metricsRetentionDays);

    let deleted = 0;

    for (const [jobId, metrics] of this.metrics.entries()) {
      const startTime = new Date(metrics.startTime);
      if (startTime < cutoffDate && metrics.status !== 'running') {
        this.metrics.delete(jobId);
        deleted++;
      }
    }

    if (deleted > 0) {
      logger.info('JobMonitoringManager', 'OLD_METRICS_CLEANED', 'Old metrics cleaned', {
        count: deleted,
        cutoffDate: cutoffDate.toISOString(),
      });
    }

    return deleted;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...config };
    
    logger.info('JobMonitoringManager', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  /**
   * Clear all metrics
   */
  clearAll(): void {
    this.metrics.clear();
    this.alerts = [];
    
    logger.info('JobMonitoringManager', 'ALL_CLEARED', 'All monitoring data cleared');
  }

  /**
   * Generate monitoring report
   */
  generateReport(): string {
    const stats = this.getStatistics();
    const longRunning = this.checkLongRunningJobs();

    let report = `
Job Monitoring Report
=====================
Total Jobs: ${stats.totalJobs}
Running: ${stats.runningJobs}
Completed: ${stats.completedJobs}
Failed: ${stats.failedJobs}
Cancelled: ${stats.cancelledJobs}
Average Duration: ${stats.averageDuration.toFixed(2)}ms
Average Attempts: ${stats.averageAttempts.toFixed(2)}
Total Alerts: ${stats.totalAlerts}
`;

    if (longRunning.length > 0) {
      report += `\nLong Running Jobs (${longRunning.length}):\n`;
      for (const job of longRunning) {
        const duration = Date.now() - new Date(job.startTime).getTime();
        report += `- ${job.jobId} (${job.jobType}): ${Math.floor(duration / 1000)}s\n`;
      }
    }

    return report.trim();
  }

  /**
   * Get job performance summary
   */
  getPerformanceSummary(jobType: string): {
    totalJobs: number;
    successRate: number;
    averageDuration: number;
    averageAttempts: number;
    failureRate: number;
  } {
    const jobs = this.listJobsByType(jobType);
    
    if (jobs.length === 0) {
      return {
        totalJobs: 0,
        successRate: 0,
        averageDuration: 0,
        averageAttempts: 0,
        failureRate: 0,
      };
    }

    const completed = jobs.filter(j => j.status === 'completed');
    const failed = jobs.filter(j => j.status === 'failed');

    const successRate = jobs.length > 0 ? (completed.length / jobs.length) * 100 : 0;
    const failureRate = jobs.length > 0 ? (failed.length / jobs.length) * 100 : 0;

    const completedWithDuration = completed.filter(j => j.duration !== undefined);
    const averageDuration = completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, j) => sum + (j.duration || 0), 0) / completedWithDuration.length
      : 0;

    const averageAttempts = jobs.reduce((sum, j) => sum + j.attempts, 0) / jobs.length;

    return {
      totalJobs: jobs.length,
      successRate,
      averageDuration,
      averageAttempts,
      failureRate,
    };
  }
}

export const jobMonitoringManager = new JobMonitoringManager();

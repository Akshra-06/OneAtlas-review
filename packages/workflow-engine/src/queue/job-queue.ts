/**
 * Job Queue Manager
 * 
 * Manages job queue for async processing.
 * Provides BullMQ integration for Redis-backed queue.
 */

import { logger } from '@oneatlas/ai-engine';


export interface JobData {
  type: string;
  payload: Record<string, unknown>;
  priority?: number;
  attempts?: number;
  backoff?: {
    type: 'exponential' | 'fixed';
    delay: number;
  };
}

export interface JobRecord {
  id: string;
  data: JobData;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  timestamp: string;
  completedAt?: string;
  failedAt?: string;
  error?: string;
  attempts: number;
  result?: unknown;
}

export interface QueueConfig {
  enableQueue: boolean;
  maxRetries: number;
  defaultPriority: number;
  concurrency: number;
}

const DEFAULT_CONFIG: QueueConfig = {
  enableQueue: false, // Disabled by default until Redis is configured
  maxRetries: 3,
  defaultPriority: 5,
  concurrency: 5,
};

/**
 * Job Queue Manager
 * 
 * Manages job queue operations:
 * - Job scheduling
 * - Job processing
 * - Retry logic
 * - Status tracking
 */
export class JobQueueManager {
  private config: QueueConfig;
  private queue: Map<string, JobRecord> = new Map();
  private processors: Map<string, (data: JobData) => Promise<unknown>> = new Map();

  constructor(config: Partial<QueueConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Add job to queue
   */
  async addJob(data: JobData): Promise<string> {
    const id = crypto.randomUUID();
    
    const record: JobRecord = {
      id,
      data,
      status: 'waiting',
      timestamp: new Date().toISOString(),
      attempts: 0,
    };

    this.queue.set(id, record);

    logger.info('JobQueueManager', 'JOB_ADDED', 'Job added to queue', {
      id,
      type: data.type,
      priority: data.priority || this.config.defaultPriority,
    });

    // Process immediately if queue is enabled
    if (this.config.enableQueue) {
      await this.processJob(id);
    }

    return id;
  }

  /**
   * Process job
   */
  private async processJob(jobId: string): Promise<void> {
    const job = this.queue.get(jobId);
    
    if (!job || job.status !== 'waiting') {
      return;
    }

    job.status = 'active';
    job.attempts++;

    const processor = this.processors.get(job.data.type);
    
    if (!processor) {
      job.status = 'failed';
      job.failedAt = new Date().toISOString();
      job.error = `No processor registered for job type: ${job.data.type}`;
      
      logger.error('JobQueueManager', 'JOB_FAILED', 'Job failed - no processor', {
        jobId,
        type: job.data.type,
      });
      
      return;
    }

    try {
      logger.info('JobQueueManager', 'JOB_PROCESSING', 'Processing job', {
        jobId,
        type: job.data.type,
        attempt: job.attempts,
      });

      const result = await processor(job.data);

      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.result = result;

      logger.info('JobQueueManager', 'JOB_COMPLETED', 'Job completed successfully', {
        jobId,
        type: job.data.type,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check if we should retry
      const shouldRetry = job.attempts < this.config.maxRetries;
      
      if (shouldRetry) {
        job.status = 'waiting';
        
        // Calculate backoff delay
        const backoffDelay = this.calculateBackoff(job.attempts, job.data.backoff);
        
        logger.warn('JobQueueManager', 'JOB_RETRY', 'Job will be retried', {
          jobId,
          type: job.data.type,
          attempt: job.attempts,
          maxRetries: this.config.maxRetries,
          backoffDelay,
        });

        // Schedule retry
        setTimeout(() => this.processJob(jobId), backoffDelay);
      } else {
        job.status = 'failed';
        job.failedAt = new Date().toISOString();
        job.error = errorMessage;

        logger.error('JobQueueManager', 'JOB_FAILED', 'Job failed after retries', {
          jobId,
          type: job.data.type,
          attempts: job.attempts,
          error: errorMessage,
        });
      }
    }
  }

  /**
   * Calculate backoff delay
   */
  private calculateBackoff(attempt: number, backoff?: JobData['backoff']): number {
    if (backoff?.type === 'fixed') {
      return backoff.delay;
    }

    // Exponential backoff: 2^attempt * 1000ms
    return Math.pow(2, attempt) * 1000;
  }

  /**
   * Register processor for job type
   */
  registerProcessor(type: string, processor: (data: JobData) => Promise<unknown>): void {
    this.processors.set(type, processor);
    
    logger.info('JobQueueManager', 'PROCESSOR_REGISTERED', 'Processor registered', {
      type,
    });
  }

  /**
   * Unregister processor
   */
  unregisterProcessor(type: string): boolean {
    const deleted = this.processors.delete(type);
    
    if (deleted) {
      logger.info('JobQueueManager', 'PROCESSOR_UNREGISTERED', 'Processor unregistered', {
        type,
      });
    }

    return deleted;
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): JobRecord | undefined {
    return this.queue.get(jobId);
  }

  /**
   * List all jobs
   */
  listJobs(): JobRecord[] {
    return Array.from(this.queue.values()).sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * List jobs by status
   */
  listJobsByStatus(status: JobRecord['status']): JobRecord[] {
    return this.listJobs().filter(j => j.status === status);
  }

  /**
   * Cancel job
   */
  cancelJob(jobId: string): boolean {
    const job = this.queue.get(jobId);
    
    if (!job || (job.status !== 'waiting' && job.status !== 'delayed')) {
      return false;
    }

    this.queue.delete(jobId);

    logger.info('JobQueueManager', 'JOB_CANCELLED', 'Job cancelled', {
      jobId,
      type: job.data.type,
    });

    return true;
  }

  /**
   * Retry failed job
   */
  async retryJob(jobId: string): Promise<boolean> {
    const job = this.queue.get(jobId);
    
    if (!job || job.status !== 'failed') {
      return false;
    }

    job.status = 'waiting';
    job.attempts = 0;
    job.error = undefined;
    job.failedAt = undefined;

    logger.info('JobQueueManager', 'JOB_RETRIED', 'Job queued for retry', {
      jobId,
      type: job.data.type,
    });

    if (this.config.enableQueue) {
      await this.processJob(jobId);
    }

    return true;
  }

  /**
   * Clear completed jobs
   */
  clearCompletedJobs(): number {
    let cleared = 0;

    for (const [id, job] of this.queue.entries()) {
      if (job.status === 'completed') {
        this.queue.delete(id);
        cleared++;
      }
    }

    if (cleared > 0) {
      logger.info('JobQueueManager', 'COMPLETED_JOBS_CLEARED', 'Completed jobs cleared', {
        count: cleared,
      });
    }

    return cleared;
  }

  /**
   * Clear failed jobs
   */
  clearFailedJobs(): number {
    let cleared = 0;

    for (const [id, job] of this.queue.entries()) {
      if (job.status === 'failed') {
        this.queue.delete(id);
        cleared++;
      }
    }

    if (cleared > 0) {
      logger.info('JobQueueManager', 'FAILED_JOBS_CLEARED', 'Failed jobs cleared', {
        count: cleared,
      });
    }

    return cleared;
  }

  /**
   * Get queue statistics
   */
  getStatistics(): {
    totalJobs: number;
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  } {
    const jobs = this.listJobs();

    return {
      totalJobs: jobs.length,
      waiting: jobs.filter(j => j.status === 'waiting').length,
      active: jobs.filter(j => j.status === 'active').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
      delayed: jobs.filter(j => j.status === 'delayed').length,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<QueueConfig>): void {
    this.config = { ...this.config, ...config };
    
    logger.info('JobQueueManager', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): QueueConfig {
    return { ...this.config };
  }

  /**
   * Clear all jobs
   */
  clearAll(): void {
    this.queue.clear();
    
    logger.info('JobQueueManager', 'ALL_JOBS_CLEARED', 'All jobs cleared');
  }

  /**
   * Process waiting jobs
   */
  async processWaitingJobs(): Promise<number> {
    const waitingJobs = this.listJobsByStatus('waiting');
    let processed = 0;

    for (const job of waitingJobs) {
      await this.processJob(job.id);
      processed++;
    }

    logger.info('JobQueueManager', 'WAITING_JOBS_PROCESSED', 'Waiting jobs processed', {
      count: processed,
    });

    return processed;
  }
}

export const jobQueueManager = new JobQueueManager();

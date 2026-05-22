/**
 * Progress Visualizer
 * 
 * Visualizes generation progress.
 * Provides progress tracking and visualization.
 */

import { logger } from '../../shared/utils/logger';

export interface ProgressUpdate {
  sessionId: string;
  progress: number;
  step: string;
  message?: string;
  timestamp: number;
}

export interface VisualizationConfig {
  enableProgressBar: boolean;
  enableStepIndicator: boolean;
  enableTimeEstimate: boolean;
  updateIntervalMs: number;
}

const DEFAULT_CONFIG: VisualizationConfig = {
  enableProgressBar: true,
  enableStepIndicator: true,
  enableTimeEstimate: true,
  updateIntervalMs: 100,
};

/**
 * Progress Visualizer
 * 
 * Visualizes generation progress:
 * - Progress bar updates
 * - Step indicators
 * - Time estimates
 * - Progress history
 */
export class ProgressVisualizer {
  private config: VisualizationConfig;
  private progressHistory: Map<string, ProgressUpdate[]> = new Map();
  private currentProgress: Map<string, number> = new Map();
  private startTime: Map<string, number> = new Map();

  constructor(config: Partial<VisualizationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start progress tracking for a session
   */
  startTracking(sessionId: string): void {
    this.currentProgress.set(sessionId, 0);
    this.startTime.set(sessionId, Date.now());

    logger.info('ProgressVisualizer', 'TRACKING_STARTED', 'Progress tracking started', {
      sessionId,
    });
  }

  /**
   * Update progress for a session
   */
  updateProgress(sessionId: string, progress: number, step: string, message?: string): void {
    const update: ProgressUpdate = {
      sessionId,
      progress,
      step,
      message,
      timestamp: Date.now(),
    };

    if (!this.progressHistory.has(sessionId)) {
      this.progressHistory.set(sessionId, []);
    }

    this.progressHistory.get(sessionId)!.push(update);
    this.currentProgress.set(sessionId, progress);

    logger.info('ProgressVisualizer', 'PROGRESS_UPDATED', 'Progress updated', {
      sessionId,
      progress,
      step,
    });
  }

  /**
   * Get current progress for a session
   */
  getCurrentProgress(sessionId: string): number | undefined {
    return this.currentProgress.get(sessionId);
  }

  /**
   * Get progress history for a session
   */
  getProgressHistory(sessionId: string): ProgressUpdate[] {
    return this.progressHistory.get(sessionId) || [];
  }

  /**
   * Get the latest progress update for a session
   */
  getLatestUpdate(sessionId: string): ProgressUpdate | undefined {
    const history = this.progressHistory.get(sessionId);
    if (!history || history.length === 0) {
      return undefined;
    }

    return history[history.length - 1];
  }

  /**
   * Calculate estimated time remaining
   */
  getEstimatedTimeRemaining(sessionId: string): number | undefined {
    const currentProgress = this.currentProgress.get(sessionId);
    const startTime = this.startTime.get(sessionId);

    if (currentProgress === undefined || startTime === undefined || currentProgress === 0) {
      return undefined;
    }

    const elapsed = Date.now() - startTime;
    const estimatedTotal = (elapsed / currentProgress) * 100;
    const remaining = estimatedTotal - elapsed;

    return Math.max(0, remaining);
  }

  /**
   * Calculate average speed (progress per second)
   */
  getAverageSpeed(sessionId: string): number | undefined {
    const currentProgress = this.currentProgress.get(sessionId);
    const startTime = this.startTime.get(sessionId);

    if (currentProgress === undefined || startTime === undefined) {
      return undefined;
    }

    const elapsed = (Date.now() - startTime) / 1000; // Convert to seconds
    if (elapsed === 0) {
      return undefined;
    }

    return currentProgress / elapsed;
  }

  /**
   * Stop progress tracking for a session
   */
  stopTracking(sessionId: string): void {
    this.currentProgress.delete(sessionId);
    this.startTime.delete(sessionId);

    logger.info('ProgressVisualizer', 'TRACKING_STOPPED', 'Progress tracking stopped', {
      sessionId,
    });
  }

  /**
   * Clear progress history for a session
   */
  clearHistory(sessionId: string): void {
    this.progressHistory.delete(sessionId);

    logger.info('ProgressVisualizer', 'HISTORY_CLEARED', 'Progress history cleared', {
      sessionId,
    });
  }

  /**
   * Clear all progress data
   */
  clearAll(): void {
    this.progressHistory.clear();
    this.currentProgress.clear();
    this.startTime.clear();

    logger.info('ProgressVisualizer', 'ALL_CLEARED', 'All progress data cleared');
  }

  /**
   * Get statistics for a session
   */
  getSessionStatistics(sessionId: string): {
    currentProgress: number | undefined;
    totalUpdates: number;
    elapsedMs: number;
    estimatedRemainingMs: number | undefined;
    averageSpeed: number | undefined;
  } {
    const currentProgress = this.currentProgress.get(sessionId);
    const startTime = this.startTime.get(sessionId);
    const history = this.progressHistory.get(sessionId);
    const elapsedMs = startTime ? Date.now() - startTime : 0;

    return {
      currentProgress,
      totalUpdates: history ? history.length : 0,
      elapsedMs,
      estimatedRemainingMs: this.getEstimatedTimeRemaining(sessionId),
      averageSpeed: this.getAverageSpeed(sessionId),
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VisualizationConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ProgressVisualizer', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): VisualizationConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    totalUpdates: number;
    averageUpdatesPerSession: number;
    config: VisualizationConfig;
  } {
    const totalSessions = this.progressHistory.size;
    const totalUpdates = Array.from(this.progressHistory.values()).reduce(
      (sum, history) => sum + history.length,
      0
    );
    const averageUpdatesPerSession = totalSessions > 0 ? totalUpdates / totalSessions : 0;

    return {
      totalSessions,
      totalUpdates,
      averageUpdatesPerSession,
      config: this.getConfig(),
    };
  }
}

export const progressVisualizer = new ProgressVisualizer();

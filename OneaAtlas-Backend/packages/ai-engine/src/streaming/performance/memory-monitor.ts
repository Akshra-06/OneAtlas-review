/**
 * Memory Monitor
 * 
 * Monitors memory usage during streaming.
 * Tracks memory consumption and provides alerts.
 */

import { logger } from '../../shared/utils/logger';

export interface MemorySnapshot {
  sessionId: string;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  timestamp: number;
}

export interface MemoryConfig {
  enableMonitoring: boolean;
  monitoringIntervalMs: number;
  alertThresholdMB: number;
  enableAutoCleanup: boolean;
}

const DEFAULT_CONFIG: MemoryConfig = {
  enableMonitoring: true,
  monitoringIntervalMs: 5000,
  alertThresholdMB: 500, // 500MB
  enableAutoCleanup: false,
};

/**
 * Memory Monitor
 * 
 * Monitors memory usage:
 * - Memory tracking
 * - Memory alerts
 * - Memory cleanup
 * - Memory statistics
 */
export class MemoryMonitor {
  private config: MemoryConfig;
  private snapshots: Map<string, MemorySnapshot[]> = new Map();
  private monitoringTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<MemoryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start monitoring for a session
   */
  startMonitoring(sessionId: string): void {
    if (!this.config.enableMonitoring) {
      return;
    }

    // Take initial snapshot
    this.takeSnapshot(sessionId);

    // Start periodic monitoring
    const timer = setInterval(() => {
      this.takeSnapshot(sessionId);
      this.checkThresholds(sessionId);
    }, this.config.monitoringIntervalMs);

    this.monitoringTimers.set(sessionId, timer);

    logger.info('MemoryMonitor', 'MONITORING_STARTED', 'Memory monitoring started', {
      sessionId,
      intervalMs: this.config.monitoringIntervalMs,
    });
  }

  /**
   * Stop monitoring for a session
   */
  stopMonitoring(sessionId: string): void {
    const timer = this.monitoringTimers.get(sessionId);
    if (timer) {
      clearInterval(timer);
      this.monitoringTimers.delete(sessionId);

      logger.info('MemoryMonitor', 'MONITORING_STOPPED', 'Memory monitoring stopped', {
        sessionId,
      });
    }
  }

  /**
   * Take a memory snapshot
   */
  takeSnapshot(sessionId: string): MemorySnapshot {
    const memoryUsage = process.memoryUsage();

    const snapshot: MemorySnapshot = {
      sessionId,
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
      arrayBuffers: memoryUsage.arrayBuffers,
      timestamp: Date.now(),
    };

    if (!this.snapshots.has(sessionId)) {
      this.snapshots.set(sessionId, []);
    }

    this.snapshots.get(sessionId)!.push(snapshot);

    // Keep only last 100 snapshots
    const sessionSnapshots = this.snapshots.get(sessionId)!;
    if (sessionSnapshots.length > 100) {
      sessionSnapshots.shift();
    }

    return snapshot;
  }

  /**
   * Get current memory usage for a session
   */
  getCurrentUsage(sessionId: string): MemorySnapshot | undefined {
    const snapshots = this.snapshots.get(sessionId);
    if (!snapshots || snapshots.length === 0) {
      return undefined;
    }

    return snapshots[snapshots.length - 1];
  }

  /**
   * Get memory snapshots for a session
   */
  getSnapshots(sessionId: string): MemorySnapshot[] {
    return this.snapshots.get(sessionId) || [];
  }

  /**
   * Calculate average memory usage for a session
   */
  getAverageUsage(sessionId: string): {
    heapUsed: number;
    heapTotal: number;
    external: number;
  } | undefined {
    const snapshots = this.snapshots.get(sessionId);
    if (!snapshots || snapshots.length === 0) {
      return undefined;
    }

    const totalHeapUsed = snapshots.reduce((sum, s) => sum + s.heapUsed, 0);
    const totalHeapTotal = snapshots.reduce((sum, s) => sum + s.heapTotal, 0);
    const totalExternal = snapshots.reduce((sum, s) => sum + s.external, 0);
    const count = snapshots.length;

    return {
      heapUsed: totalHeapUsed / count,
      heapTotal: totalHeapTotal / count,
      external: totalExternal / count,
    };
  }

  /**
   * Check memory thresholds and alert if exceeded
   */
  private checkThresholds(sessionId: string): void {
    const current = this.getCurrentUsage(sessionId);
    if (!current) {
      return;
    }

    const heapUsedMB = current.heapUsed / (1024 * 1024);
    const thresholdMB = this.config.alertThresholdMB;

    if (heapUsedMB > thresholdMB) {
      logger.warn('MemoryMonitor', 'MEMORY_THRESHOLD_EXCEEDED', 'Memory threshold exceeded', {
        sessionId,
        heapUsedMB: heapUsedMB.toFixed(2),
        thresholdMB,
      });

      // Auto-cleanup if enabled
      if (this.config.enableAutoCleanup) {
        this.performCleanup(sessionId);
      }
    }
  }

  /**
   * Perform memory cleanup
   */
  private performCleanup(sessionId: string): void {
    // Clear old snapshots
    const snapshots = this.snapshots.get(sessionId);
    if (snapshots) {
      // Keep only last 10 snapshots
      if (snapshots.length > 10) {
        this.snapshots.set(sessionId, snapshots.slice(-10));
      }
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    logger.info('MemoryMonitor', 'CLEANUP_PERFORMED', 'Memory cleanup performed', {
      sessionId,
    });
  }

  /**
   * Get memory usage in MB
   */
  getUsageMB(sessionId: string): {
    heapUsed: number;
    heapTotal: number;
    external: number;
  } | undefined {
    const current = this.getCurrentUsage(sessionId);
    if (!current) {
      return undefined;
    }

    return {
      heapUsed: current.heapUsed / (1024 * 1024),
      heapTotal: current.heapTotal / (1024 * 1024),
      external: current.external / (1024 * 1024),
    };
  }

  /**
   * Clear snapshots for a session
   */
  clearSnapshots(sessionId: string): void {
    this.snapshots.delete(sessionId);

    logger.info('MemoryMonitor', 'SNAPSHOTS_CLEARED', 'Memory snapshots cleared', {
      sessionId,
    });
  }

  /**
   * Clear all snapshots
   */
  clearAllSnapshots(): void {
    this.snapshots.clear();

    logger.info('MemoryMonitor', 'ALL_SNAPSHOTS_CLEARED', 'All memory snapshots cleared');
  }

  /**
   * Get statistics for a session
   */
  getSessionStatistics(sessionId: string): {
    currentUsage: MemorySnapshot | undefined;
    averageUsage: {
      heapUsed: number;
      heapTotal: number;
      external: number;
    } | undefined;
    usageMB: {
      heapUsed: number;
      heapTotal: number;
      external: number;
    } | undefined;
  } {
    return {
      currentUsage: this.getCurrentUsage(sessionId),
      averageUsage: this.getAverageUsage(sessionId),
      usageMB: this.getUsageMB(sessionId),
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MemoryConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('MemoryMonitor', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): MemoryConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    totalSnapshots: number;
    averageSnapshotsPerSession: number;
    activeMonitoring: number;
    config: MemoryConfig;
  } {
    const totalSessions = this.snapshots.size;
    const totalSnapshots = Array.from(this.snapshots.values()).reduce(
      (sum, snapshots) => sum + snapshots.length,
      0
    );
    const averageSnapshotsPerSession = totalSessions > 0 ? totalSnapshots / totalSessions : 0;
    const activeMonitoring = this.monitoringTimers.size;

    return {
      totalSessions,
      totalSnapshots,
      averageSnapshotsPerSession,
      activeMonitoring,
      config: this.getConfig(),
    };
  }
}

export const memoryMonitor = new MemoryMonitor();

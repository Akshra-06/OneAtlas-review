/**
 * Concurrent Session Manager
 * 
 * Manages concurrent streaming sessions.
 * Handles session pooling and resource allocation.
 */

import { logger } from '../../shared/utils/logger';

export interface SessionInfo {
  id: string;
  status: 'active' | 'idle' | 'completed' | 'failed';
  startTime: number;
  lastActivity: number;
  resourceUsage: {
    memory: number;
    cpu: number;
  };
}

export interface ConcurrentConfig {
  maxConcurrentSessions: number;
  enableSessionPooling: boolean;
  sessionTimeoutMs: number;
  enableLoadBalancing: boolean;
}

const DEFAULT_CONFIG: ConcurrentConfig = {
  maxConcurrentSessions: 10,
  enableSessionPooling: true,
  sessionTimeoutMs: 300000, // 5 minutes
  enableLoadBalancing: false,
};

/**
 * Concurrent Session Manager
 * 
 * Manages concurrent sessions:
 * - Session pooling
 * - Resource allocation
 * - Load balancing
 * - Session cleanup
 */
export class ConcurrentSessionManager {
  private config: ConcurrentConfig;
  private sessions: Map<string, SessionInfo> = new Map();
  private sessionQueue: string[] = [];
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<ConcurrentConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanupTimer();
  }

  /**
   * Start a new session
   */
  startSession(sessionId: string): boolean {
    // Check if we've reached max concurrent sessions
    const activeCount = this.getActiveSessionCount();
    if (activeCount >= this.config.maxConcurrentSessions) {
      // Queue the session
      this.sessionQueue.push(sessionId);

      logger.info('ConcurrentSessionManager', 'SESSION_QUEUED', 'Session queued', {
        sessionId,
        queuePosition: this.sessionQueue.length,
      });

      return false;
    }

    // Start the session
    const sessionInfo: SessionInfo = {
      id: sessionId,
      status: 'active',
      startTime: Date.now(),
      lastActivity: Date.now(),
      resourceUsage: {
        memory: 0,
        cpu: 0,
      },
    };

    this.sessions.set(sessionId, sessionInfo);

    logger.info('ConcurrentSessionManager', 'SESSION_STARTED', 'Session started', {
      sessionId,
      activeCount: activeCount + 1,
    });

    return true;
  }

  /**
   * Complete a session
   */
  completeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    session.status = 'completed';
    session.lastActivity = Date.now();

    // Process queue
    this.processQueue();

    logger.info('ConcurrentSessionManager', 'SESSION_COMPLETED', 'Session completed', {
      sessionId,
    });
  }

  /**
   * Fail a session
   */
  failSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    session.status = 'failed';
    session.lastActivity = Date.now();

    // Process queue
    this.processQueue();

    logger.error('ConcurrentSessionManager', 'SESSION_FAILED', 'Session failed', {
      sessionId,
    });
  }

  /**
   * Update session activity
   */
  updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    session.lastActivity = Date.now();
  }

  /**
   * Update resource usage for a session
   */
  updateResourceUsage(sessionId: string, memory: number, cpu: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    session.resourceUsage = { memory, cpu };
  }

  /**
   * Get session info
   */
  getSession(sessionId: string): SessionInfo | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions
   */
  getAllSessions(): SessionInfo[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get active sessions
   */
  getActiveSessions(): SessionInfo[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active');
  }

  /**
   * Get active session count
   */
  getActiveSessionCount(): number {
    return this.getActiveSessions().length;
  }

  /**
   * Get queued sessions
   */
  getQueuedSessions(): string[] {
    return [...this.sessionQueue];
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.sessionQueue.length;
  }

  /**
   * Process the session queue
   */
  private processQueue(): void {
    if (this.sessionQueue.length === 0) {
      return;
    }

    const activeCount = this.getActiveSessionCount();
    const availableSlots = this.config.maxConcurrentSessions - activeCount;

    if (availableSlots <= 0) {
      return;
    }

    // Start queued sessions
    for (let i = 0; i < Math.min(availableSlots, this.sessionQueue.length); i++) {
      const sessionId = this.sessionQueue.shift();
      if (sessionId) {
        this.startSession(sessionId);
      }
    }

    logger.info('ConcurrentSessionManager', 'QUEUE_PROCESSED', 'Queue processed', {
      processed: Math.min(availableSlots, this.sessionQueue.length),
      remaining: this.sessionQueue.length,
    });
  }

  /**
   * Remove a session
   */
  removeSession(sessionId: string): boolean {
    const removed = this.sessions.delete(sessionId);

    // Also remove from queue if present
    const queueIndex = this.sessionQueue.indexOf(sessionId);
    if (queueIndex !== -1) {
      this.sessionQueue.splice(queueIndex, 1);
    }

    if (removed) {
      logger.info('ConcurrentSessionManager', 'SESSION_REMOVED', 'Session removed', {
        sessionId,
      });
    }

    return removed;
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupInactiveSessions();
    }, 60000); // Check every minute
  }

  /**
   * Cleanup inactive sessions
   */
  private cleanupInactiveSessions(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      const inactiveTime = now - session.lastActivity;

      // Remove inactive sessions
      if (inactiveTime > this.config.sessionTimeoutMs) {
        this.removeSession(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info('ConcurrentSessionManager', 'INACTIVE_SESSIONS_CLEANED', 'Inactive sessions cleaned', {
        count: cleaned,
      });
    }
  }

  /**
   * Stop cleanup timer
   */
  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Clear all sessions
   */
  clearAll(): void {
    this.sessions.clear();
    this.sessionQueue = [];

    logger.info('ConcurrentSessionManager', 'ALL_CLEARED', 'All sessions cleared');
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    activeSessions: number;
    queuedSessions: number;
    averageResourceUsage: {
      memory: number;
      cpu: number;
    };
    config: ConcurrentConfig;
  } {
    const sessions = this.getAllSessions();
    const activeSessions = this.getActiveSessions();

    const totalMemory = sessions.reduce((sum, s) => sum + s.resourceUsage.memory, 0);
    const totalCpu = sessions.reduce((sum, s) => sum + s.resourceUsage.cpu, 0);
    const averageResourceUsage = sessions.length > 0 ? {
      memory: totalMemory / sessions.length,
      cpu: totalCpu / sessions.length,
    } : { memory: 0, cpu: 0 };

    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      queuedSessions: this.sessionQueue.length,
      averageResourceUsage,
      config: this.getConfig(),
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ConcurrentConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ConcurrentSessionManager', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ConcurrentConfig {
    return { ...this.config };
  }

  /**
   * Shutdown
   */
  shutdown(): void {
    this.stopCleanupTimer();
    this.clearAll();

    logger.info('ConcurrentSessionManager', 'SHUTDOWN_COMPLETE', 'Concurrent session manager shutdown complete');
  }
}

export const concurrentSessionManager = new ConcurrentSessionManager();

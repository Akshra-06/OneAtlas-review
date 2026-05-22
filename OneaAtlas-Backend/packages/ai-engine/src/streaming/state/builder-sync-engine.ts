/**
 * Builder Sync Engine
 * 
 * Synchronizes builder state across the application.
 * Manages real-time state synchronization.
 */

import { logger } from '../../shared/utils/logger';

export interface BuilderState {
  sessionId: string;
  generationStatus: 'idle' | 'generating' | 'completed' | 'failed';
  previewStatus: 'idle' | 'rendering' | 'ready' | 'error';
  componentCount: number;
  progress: number;
  lastUpdate: number;
}

export interface SyncConfig {
  enableAutoSync: boolean;
  syncIntervalMs: number;
  enableConflictResolution: boolean;
}

const DEFAULT_CONFIG: SyncConfig = {
  enableAutoSync: true,
  syncIntervalMs: 100,
  enableConflictResolution: true,
};

/**
 * Builder Sync Engine
 * 
 * Synchronizes builder state:
 * - Live builder updates
 * - Real-time generation state
 * - Synchronized preview status
 * - State conflict resolution
 */
export class BuilderSyncEngine {
  private config: SyncConfig;
  private state: Map<string, BuilderState> = new Map();
  private subscribers: Map<string, Set<(state: BuilderState) => void>> = new Map();
  private syncIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize a session
   */
  initializeSession(sessionId: string): BuilderState {
    const initialState: BuilderState = {
      sessionId,
      generationStatus: 'idle',
      previewStatus: 'idle',
      componentCount: 0,
      progress: 0,
      lastUpdate: Date.now(),
    };

    this.state.set(sessionId, initialState);

    // Start auto-sync if enabled
    if (this.config.enableAutoSync) {
      this.startAutoSync(sessionId);
    }

    logger.info('BuilderSyncEngine', 'SESSION_INITIALIZED', 'Session initialized', {
      sessionId,
    });

    return initialState;
  }

  /**
   * Update builder state
   */
  updateState(sessionId: string, updates: Partial<BuilderState>): BuilderState | null {
    const currentState = this.state.get(sessionId);
    if (!currentState) {
      logger.warn('BuilderSyncEngine', 'SESSION_NOT_FOUND', 'Session not found for update', {
        sessionId,
      });
      return null;
    }

    const updatedState: BuilderState = {
      ...currentState,
      ...updates,
      lastUpdate: Date.now(),
    };

    this.state.set(sessionId, updatedState);

    // Notify subscribers
    this.notifySubscribers(sessionId, updatedState);

    logger.info('BuilderSyncEngine', 'STATE_UPDATED', 'State updated', {
      sessionId,
      updates,
    });

    return updatedState;
  }

  /**
   * Get builder state
   */
  getState(sessionId: string): BuilderState | undefined {
    return this.state.get(sessionId);
  }

  /**
   * Get all states
   */
  getAllStates(): BuilderState[] {
    return Array.from(this.state.values());
  }

  /**
   * Subscribe to state changes
   */
  subscribe(sessionId: string, callback: (state: BuilderState) => void): () => void {
    if (!this.subscribers.has(sessionId)) {
      this.subscribers.set(sessionId, new Set());
    }

    this.subscribers.get(sessionId)!.add(callback);

    logger.info('BuilderSyncEngine', 'SUBSCRIBER_ADDED', 'Subscriber added', {
      sessionId,
    });

    // Return unsubscribe function
    return () => {
      this.unsubscribe(sessionId, callback);
    };
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(sessionId: string, callback: (state: BuilderState) => void): void {
    const subscribers = this.subscribers.get(sessionId);
    if (subscribers) {
      subscribers.delete(callback);

      logger.info('BuilderSyncEngine', 'SUBSCRIBER_REMOVED', 'Subscriber removed', {
        sessionId,
      });
    }
  }

  /**
   * Notify all subscribers for a session
   */
  private notifySubscribers(sessionId: string, state: BuilderState): void {
    const subscribers = this.subscribers.get(sessionId);
    if (subscribers) {
      for (const callback of subscribers) {
        try {
          callback(state);
        } catch (error) {
          logger.error('BuilderSyncEngine', 'SUBSCRIBER_ERROR', 'Subscriber callback error', {
            sessionId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
  }

  /**
   * Start auto-sync for a session
   */
  private startAutoSync(sessionId: string): void {
    const interval = setInterval(() => {
      this.syncState(sessionId);
    }, this.config.syncIntervalMs);

    this.syncIntervals.set(sessionId, interval);
  }

  /**
   * Stop auto-sync for a session
   */
  private stopAutoSync(sessionId: string): void {
    const interval = this.syncIntervals.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.syncIntervals.delete(sessionId);
    }
  }

  /**
   * Sync state (placeholder for actual sync logic)
   */
  private syncState(sessionId: string): void {
    const state = this.state.get(sessionId);
    if (!state) {
      return;
    }

    // In a real implementation, this would sync state with external systems
    // For now, just notify subscribers
    this.notifySubscribers(sessionId, state);
  }

  /**
   * Cleanup a session
   */
  cleanupSession(sessionId: string): void {
    this.state.delete(sessionId);
    this.subscribers.delete(sessionId);
    this.stopAutoSync(sessionId);

    logger.info('BuilderSyncEngine', 'SESSION_CLEANED', 'Session cleaned up', {
      sessionId,
    });
  }

  /**
   * Cleanup all sessions
   */
  cleanupAll(): void {
    for (const sessionId of this.state.keys()) {
      this.cleanupSession(sessionId);
    }

    logger.info('BuilderSyncEngine', 'ALL_SESSIONS_CLEANED', 'All sessions cleaned up');
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.state.size;
  }

  /**
   * Get subscriber count for a session
   */
  getSubscriberCount(sessionId: string): number {
    return this.subscribers.get(sessionId)?.size || 0;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('BuilderSyncEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): SyncConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    totalSubscribers: number;
    activeSyncIntervals: number;
    config: SyncConfig;
  } {
    const totalSessions = this.state.size;
    const totalSubscribers = Array.from(this.subscribers.values()).reduce(
      (sum, subs) => sum + subs.size,
      0
    );
    const activeSyncIntervals = this.syncIntervals.size;

    return {
      totalSessions,
      totalSubscribers,
      activeSyncIntervals,
      config: this.getConfig(),
    };
  }
}

export const builderSyncEngine = new BuilderSyncEngine();

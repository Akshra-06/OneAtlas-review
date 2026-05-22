/**
 * State Persistence
 * 
 * Manages state persistence for recovery.
 * Saves and loads generation state.
 */

import { logger } from '../../shared/utils/logger';

export interface PersistedState {
  id: string;
  sessionId: string;
  state: unknown;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface PersistenceConfig {
  enableAutoSave: boolean;
  autoSaveIntervalMs: number;
  maxPersistedStates: number;
  enableCompression: boolean;
}

const DEFAULT_CONFIG: PersistenceConfig = {
  enableAutoSave: true,
  autoSaveIntervalMs: 10000,
  maxPersistedStates: 20,
  enableCompression: false,
};

/**
 * State Persistence
 * 
 * Manages state persistence:
 * - Save state to storage
 * - Load state from storage
 * - Auto-save functionality
 * - State cleanup
 */
export class StatePersistence {
  private config: PersistenceConfig;
  private persistedStates: Map<string, PersistedState[]> = new Map();
  private autoSaveTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<PersistenceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Save state
   */
  saveState(sessionId: string, state: unknown, metadata?: Record<string, unknown>): PersistedState {
    const persistedState: PersistedState = {
      id: crypto.randomUUID(),
      sessionId,
      state,
      timestamp: Date.now(),
      metadata,
    };

    if (!this.persistedStates.has(sessionId)) {
      this.persistedStates.set(sessionId, []);
    }

    const sessionStates = this.persistedStates.get(sessionId)!;
    sessionStates.push(persistedState);

    // Enforce max persisted states
    if (sessionStates.length > this.config.maxPersistedStates) {
      sessionStates.shift();
    }

    logger.info('StatePersistence', 'STATE_SAVED', 'State saved', {
      stateId: persistedState.id,
      sessionId,
    });

    return persistedState;
  }

  /**
   * Load state by ID
   */
  loadState(stateId: string): unknown | null {
    for (const sessionStates of this.persistedStates.values()) {
      const persistedState = sessionStates.find(s => s.id === stateId);
      if (persistedState) {
        logger.info('StatePersistence', 'STATE_LOADED', 'State loaded', {
          stateId,
          sessionId: persistedState.sessionId,
        });

        return persistedState.state;
      }
    }

    logger.warn('StatePersistence', 'STATE_NOT_FOUND', 'State not found', {
      stateId,
    });

    return null;
  }

  /**
   * Load the latest state for a session
   */
  loadLatestState(sessionId: string): unknown | null {
    const sessionStates = this.persistedStates.get(sessionId);
    if (!sessionStates || sessionStates.length === 0) {
      logger.warn('StatePersistence', 'NO_STATES', 'No states found for session', {
        sessionId,
      });
      return null;
    }

    const latest = sessionStates[sessionStates.length - 1];
    if (!latest) {
      return null;
    }

    logger.info('StatePersistence', 'LATEST_STATE_LOADED', 'Latest state loaded', {
      sessionId,
      stateId: latest.id,
    });

    return latest.state;
  }

  /**
   * Get persisted states for a session
   */
  getStates(sessionId: string): PersistedState[] {
    return this.persistedStates.get(sessionId) || [];
  }

  /**
   * Get all persisted states
   */
  getAllStates(): PersistedState[] {
    const allStates: PersistedState[] = [];
    for (const sessionStates of this.persistedStates.values()) {
      allStates.push(...sessionStates);
    }
    return allStates;
  }

  /**
   * Delete a persisted state
   */
  deleteState(stateId: string): boolean {
    for (const [sessionId, sessionStates] of this.persistedStates.entries()) {
      const index = sessionStates.findIndex(s => s.id === stateId);
      if (index !== -1) {
        sessionStates.splice(index, 1);

        logger.info('StatePersistence', 'STATE_DELETED', 'State deleted', {
          stateId,
          sessionId,
        });

        return true;
      }
    }

    return false;
  }

  /**
   * Clear persisted states for a session
   */
  clearSession(sessionId: string): void {
    this.persistedStates.delete(sessionId);

    // Stop auto-save timer if running
    const timer = this.autoSaveTimers.get(sessionId);
    if (timer) {
      clearInterval(timer);
      this.autoSaveTimers.delete(sessionId);
    }

    logger.info('StatePersistence', 'SESSION_CLEARED', 'Session states cleared', {
      sessionId,
    });
  }

  /**
   * Clear all persisted states
   */
  clearAll(): void {
    this.persistedStates.clear();

    // Stop all timers
    for (const timer of this.autoSaveTimers.values()) {
      clearInterval(timer);
    }
    this.autoSaveTimers.clear();

    logger.info('StatePersistence', 'ALL_CLEARED', 'All states cleared');
  }

  /**
   * Start auto-save for a session
   */
  startAutoSave(sessionId: string, getState: () => unknown): void {
    if (!this.config.enableAutoSave) {
      return;
    }

    const timer = setInterval(() => {
      this.saveState(sessionId, getState());
    }, this.config.autoSaveIntervalMs);

    this.autoSaveTimers.set(sessionId, timer);

    logger.info('StatePersistence', 'AUTO_SAVE_STARTED', 'Auto-save started', {
      sessionId,
      intervalMs: this.config.autoSaveIntervalMs,
    });
  }

  /**
   * Stop auto-save for a session
   */
  stopAutoSave(sessionId: string): void {
    const timer = this.autoSaveTimers.get(sessionId);
    if (timer) {
      clearInterval(timer);
      this.autoSaveTimers.delete(sessionId);

      logger.info('StatePersistence', 'AUTO_SAVE_STOPPED', 'Auto-save stopped', {
        sessionId,
      });
    }
  }

  /**
   * Get state count for a session
   */
  getStateCount(sessionId: string): number {
    return this.persistedStates.get(sessionId)?.length || 0;
  }

  /**
   * Get total state count
   */
  getTotalStateCount(): number {
    let total = 0;
    for (const sessionStates of this.persistedStates.values()) {
      total += sessionStates.length;
    }
    return total;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PersistenceConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('StatePersistence', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): PersistenceConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    totalStates: number;
    averageStatesPerSession: number;
    activeAutoSaves: number;
    config: PersistenceConfig;
  } {
    const totalSessions = this.persistedStates.size;
    const totalStates = this.getTotalStateCount();
    const averageStatesPerSession = totalSessions > 0 ? totalStates / totalSessions : 0;
    const activeAutoSaves = this.autoSaveTimers.size;

    return {
      totalSessions,
      totalStates,
      averageStatesPerSession,
      activeAutoSaves,
      config: this.getConfig(),
    };
  }
}

export const statePersistence = new StatePersistence();

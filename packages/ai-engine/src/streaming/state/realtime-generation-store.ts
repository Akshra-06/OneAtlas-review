/**
 * Real-Time Generation Store
 * 
 * Manages real-time generation state.
 * Provides reactive state management for generation.
 */

import { logger } from '../../shared/utils/logger';

export interface GenerationStoreState {
  sessionId: string;
  currentStep: string;
  progress: number;
  components: string[];
  errors: string[];
  warnings: string[];
  metadata: Record<string, unknown>;
}

export interface StoreConfig {
  enablePersistence: boolean;
  enableHistory: boolean;
  maxHistorySize: number;
}

const DEFAULT_CONFIG: StoreConfig = {
  enablePersistence: false,
  enableHistory: true,
  maxHistorySize: 50,
};

/**
 * Real-Time Generation Store
 * 
 * Manages real-time generation state:
 * - Reactive state management
 * - State history tracking
 * - State persistence
 * - State queries
 */
export class RealtimeGenerationStore {
  private config: StoreConfig;
  private state: Map<string, GenerationStoreState> = new Map();
  private history: Map<string, GenerationStoreState[]> = new Map();
  private listeners: Map<string, Set<(state: GenerationStoreState) => void>> = new Map();

  constructor(config: Partial<StoreConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize a session
   */
  initializeSession(sessionId: string, initialState: Partial<GenerationStoreState> = {}): GenerationStoreState {
    const state: GenerationStoreState = {
      sessionId,
      currentStep: 'initialized',
      progress: 0,
      components: [],
      errors: [],
      warnings: [],
      metadata: {},
      ...initialState,
    };

    this.state.set(sessionId, state);

    if (this.config.enableHistory) {
      this.history.set(sessionId, []);
    }

    logger.info('RealtimeGenerationStore', 'SESSION_INITIALIZED', 'Session initialized', {
      sessionId,
    });

    return state;
  }

  /**
   * Update state for a session
   */
  updateState(sessionId: string, updates: Partial<GenerationStoreState>): GenerationStoreState | null {
    const currentState = this.state.get(sessionId);
    if (!currentState) {
      logger.warn('RealtimeGenerationStore', 'SESSION_NOT_FOUND', 'Session not found for update', {
        sessionId,
      });
      return null;
    }

    // Add to history if enabled
    if (this.config.enableHistory) {
      const sessionHistory = this.history.get(sessionId);
      if (sessionHistory) {
        sessionHistory.push({ ...currentState });
        // Enforce max history size
        if (sessionHistory.length > this.config.maxHistorySize) {
          sessionHistory.shift();
        }
      }
    }

    // Update state
    const updatedState: GenerationStoreState = {
      ...currentState,
      ...updates,
    };

    this.state.set(sessionId, updatedState);

    // Notify listeners
    this.notifyListeners(sessionId, updatedState);

    logger.info('RealtimeGenerationStore', 'STATE_UPDATED', 'State updated', {
      sessionId,
      updates,
    });

    return updatedState;
  }

  /**
   * Get state for a session
   */
  getState(sessionId: string): GenerationStoreState | undefined {
    return this.state.get(sessionId);
  }

  /**
   * Get all states
   */
  getAllStates(): GenerationStoreState[] {
    return Array.from(this.state.values());
  }

  /**
   * Subscribe to state changes
   */
  subscribe(sessionId: string, callback: (state: GenerationStoreState) => void): () => void {
    if (!this.listeners.has(sessionId)) {
      this.listeners.set(sessionId, new Set());
    }

    this.listeners.get(sessionId)!.add(callback);

    logger.info('RealtimeGenerationStore', 'LISTENER_ADDED', 'Listener added', {
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
  unsubscribe(sessionId: string, callback: (state: GenerationStoreState) => void): void {
    const listeners = this.listeners.get(sessionId);
    if (listeners) {
      listeners.delete(callback);

      logger.info('RealtimeGenerationStore', 'LISTENER_REMOVED', 'Listener removed', {
        sessionId,
      });
    }
  }

  /**
   * Notify all listeners for a session
   */
  private notifyListeners(sessionId: string, state: GenerationStoreState): void {
    const listeners = this.listeners.get(sessionId);
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback(state);
        } catch (error) {
          logger.error('RealtimeGenerationStore', 'LISTENER_ERROR', 'Listener callback error', {
            sessionId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
  }

  /**
   * Add a component to the state
   */
  addComponent(sessionId: string, componentId: string): void {
    const state = this.state.get(sessionId);
    if (!state) {
      return;
    }

    const updatedComponents = [...state.components, componentId];
    this.updateState(sessionId, { components: updatedComponents });
  }

  /**
   * Remove a component from the state
   */
  removeComponent(sessionId: string, componentId: string): void {
    const state = this.state.get(sessionId);
    if (!state) {
      return;
    }

    const updatedComponents = state.components.filter(c => c !== componentId);
    this.updateState(sessionId, { components: updatedComponents });
  }

  /**
   * Add an error to the state
   */
  addError(sessionId: string, error: string): void {
    const state = this.state.get(sessionId);
    if (!state) {
      return;
    }

    const updatedErrors = [...state.errors, error];
    this.updateState(sessionId, { errors: updatedErrors });
  }

  /**
   * Add a warning to the state
   */
  addWarning(sessionId: string, warning: string): void {
    const state = this.state.get(sessionId);
    if (!state) {
      return;
    }

    const updatedWarnings = [...state.warnings, warning];
    this.updateState(sessionId, { warnings: updatedWarnings });
  }

  /**
   * Update progress
   */
  updateProgress(sessionId: string, progress: number, step?: string): void {
    const updates: Partial<GenerationStoreState> = { progress };
    if (step) {
      updates.currentStep = step;
    }
    this.updateState(sessionId, updates);
  }

  /**
   * Get history for a session
   */
  getHistory(sessionId: string): GenerationStoreState[] {
    return this.history.get(sessionId) || [];
  }

  /**
   * Restore from history
   */
  restoreFromHistory(sessionId: string, index: number): boolean {
    const sessionHistory = this.history.get(sessionId);
    if (!sessionHistory || index < 0 || index >= sessionHistory.length) {
      return false;
    }

    const restoredState = sessionHistory[index];
    if (!restoredState) {
      return false;
    }

    this.state.set(sessionId, {
      sessionId,
      currentStep: restoredState.currentStep,
      progress: restoredState.progress,
      components: restoredState.components,
      errors: restoredState.errors,
      warnings: restoredState.warnings,
      metadata: restoredState.metadata,
    });

    logger.info('RealtimeGenerationStore', 'STATE_RESTORED', 'State restored from history', {
      sessionId,
      index,
    });

    return true;
  }

  /**
   * Clear history for a session
   */
  clearHistory(sessionId: string): void {
    this.history.delete(sessionId);

    logger.info('RealtimeGenerationStore', 'HISTORY_CLEARED', 'History cleared', {
      sessionId,
    });
  }

  /**
   * Cleanup a session
   */
  cleanupSession(sessionId: string): void {
    this.state.delete(sessionId);
    this.history.delete(sessionId);
    this.listeners.delete(sessionId);

    logger.info('RealtimeGenerationStore', 'SESSION_CLEANED', 'Session cleaned up', {
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

    logger.info('RealtimeGenerationStore', 'ALL_SESSIONS_CLEANED', 'All sessions cleaned up');
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.state.size;
  }

  /**
   * Get listener count for a session
   */
  getListenerCount(sessionId: string): number {
    return this.listeners.get(sessionId)?.size || 0;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<StoreConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('RealtimeGenerationStore', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): StoreConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    totalListeners: number;
    totalHistoryEntries: number;
    config: StoreConfig;
  } {
    const totalSessions = this.state.size;
    const totalListeners = Array.from(this.listeners.values()).reduce(
      (sum, listeners) => sum + listeners.size,
      0
    );
    const totalHistoryEntries = Array.from(this.history.values()).reduce(
      (sum, history) => sum + history.length,
      0
    );

    return {
      totalSessions,
      totalListeners,
      totalHistoryEntries,
      config: this.getConfig(),
    };
  }
}

export const realtimeGenerationStore = new RealtimeGenerationStore();

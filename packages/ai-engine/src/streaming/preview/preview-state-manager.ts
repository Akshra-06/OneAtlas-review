/**
 * Preview State Manager
 * 
 * Manages preview state during incremental updates.
 * Preserves state during updates and supports optimistic rendering.
 */

import { PreviewComponent } from './partial-preview-renderer';
import { logger } from '../../shared/utils/logger';

export interface PreviewState {
  components: Map<string, PreviewComponent>;
  componentState: Map<string, unknown>;
  layout: string;
  theme: string;
  metadata: Record<string, unknown>;
}

export interface StateSnapshot {
  timestamp: number;
  state: PreviewState;
}

/**
 * Preview State Manager
 * 
 * Manages preview state:
 * - Preserve preview state during updates
 * - Support optimistic rendering
 * - State snapshots for rollback
 * - State synchronization
 */
export class PreviewStateManager {
  private currentState: PreviewState;
  private stateHistory: StateSnapshot[] = [];
  private maxHistorySize = 20;

  constructor() {
    this.currentState = {
      components: new Map(),
      componentState: new Map(),
      layout: 'grid',
      theme: 'light',
      metadata: {},
    };
  }

  /**
   * Get current state
   */
  getState(): PreviewState {
    return {
      components: new Map(this.currentState.components),
      componentState: new Map(this.currentState.componentState),
      layout: this.currentState.layout,
      theme: this.currentState.theme,
      metadata: { ...this.currentState.metadata },
    };
  }

  /**
   * Set current state
   */
  setState(state: Partial<PreviewState>): void {
    // Create snapshot before changing state
    this.createSnapshot();

    // Update state
    if (state.components) {
      this.currentState.components = new Map(state.components);
    }
    if (state.componentState) {
      this.currentState.componentState = new Map(state.componentState);
    }
    if (state.layout) {
      this.currentState.layout = state.layout;
    }
    if (state.theme) {
      this.currentState.theme = state.theme;
    }
    if (state.metadata) {
      this.currentState.metadata = { ...state.metadata };
    }

    logger.info('PreviewStateManager', 'STATE_UPDATED', 'State updated', {
      layout: this.currentState.layout,
      theme: this.currentState.theme,
    });
  }

  /**
   * Update a component
   */
  updateComponent(componentId: string, component: PreviewComponent): void {
    this.currentState.components.set(componentId, component);

    logger.info('PreviewStateManager', 'COMPONENT_UPDATED', 'Component updated in state', {
      componentId,
    });
  }

  /**
   * Remove a component
   */
  removeComponent(componentId: string): void {
    this.currentState.components.delete(componentId);
    this.currentState.componentState.delete(componentId);

    logger.info('PreviewStateManager', 'COMPONENT_REMOVED', 'Component removed from state', {
      componentId,
    });
  }

  /**
   * Set component state
   */
  setComponentState(componentId: string, state: unknown): void {
    this.currentState.componentState.set(componentId, state);

    logger.info('PreviewStateManager', 'COMPONENT_STATE_SET', 'Component state set', {
      componentId,
    });
  }

  /**
   * Get component state
   */
  getComponentState(componentId: string): unknown | undefined {
    return this.currentState.componentState.get(componentId);
  }

  /**
   * Set layout
   */
  setLayout(layout: string): void {
    this.currentState.layout = layout;

    logger.info('PreviewStateManager', 'LAYOUT_SET', 'Layout set', {
      layout,
    });
  }

  /**
   * Get layout
   */
  getLayout(): string {
    return this.currentState.layout;
  }

  /**
   * Set theme
   */
  setTheme(theme: string): void {
    this.currentState.theme = theme;

    logger.info('PreviewStateManager', 'THEME_SET', 'Theme set', {
      theme,
    });
  }

  /**
   * Get theme
   */
  getTheme(): string {
    return this.currentState.theme;
  }

  /**
   * Set metadata
   */
  setMetadata(key: string, value: unknown): void {
    this.currentState.metadata[key] = value;

    logger.info('PreviewStateManager', 'METADATA_SET', 'Metadata set', {
      key,
    });
  }

  /**
   * Get metadata
   */
  getMetadata(key: string): unknown | undefined {
    return this.currentState.metadata[key];
  }

  /**
   * Create state snapshot
   */
  createSnapshot(): void {
    const snapshot: StateSnapshot = {
      timestamp: Date.now(),
      state: this.getState(),
    };

    this.stateHistory.push(snapshot);

    // Limit history size
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }

    logger.info('PreviewStateManager', 'SNAPSHOT_CREATED', 'State snapshot created', {
      timestamp: snapshot.timestamp,
    });
  }

  /**
   * Restore from snapshot
   */
  restoreFromSnapshot(timestamp: number): boolean {
    const snapshot = this.stateHistory.find(s => s.timestamp === timestamp);
    if (!snapshot) {
      logger.warn('PreviewStateManager', 'SNAPSHOT_NOT_FOUND', 'Snapshot not found', {
        timestamp,
      });
      return false;
    }

    this.currentState = snapshot.state;

    logger.info('PreviewStateManager', 'SNAPSHOT_RESTORED', 'State restored from snapshot', {
      timestamp,
    });

    return true;
  }

  /**
   * Restore from latest snapshot
   */
  restoreLatest(): boolean {
    if (this.stateHistory.length === 0) {
      logger.warn('PreviewStateManager', 'NO_SNAPSHOTS', 'No snapshots available');
      return false;
    }

    const latest = this.stateHistory[this.stateHistory.length - 1];
    if (latest) {
      this.currentState = latest.state;

      logger.info('PreviewStateManager', 'LATEST_RESTORED', 'State restored from latest snapshot', {
        timestamp: latest.timestamp,
      });

      return true;
    }

    return false;
  }

  /**
   * Clear state history
   */
  clearHistory(): void {
    this.stateHistory = [];

    logger.info('PreviewStateManager', 'HISTORY_CLEARED', 'State history cleared');
  }

  /**
   * Get state history
   */
  getHistory(): StateSnapshot[] {
    return [...this.stateHistory];
  }

  /**
   * Reset state to initial
   */
  reset(): void {
    this.createSnapshot();

    this.currentState = {
      components: new Map(),
      componentState: new Map(),
      layout: 'grid',
      theme: 'light',
      metadata: {},
    };

    logger.info('PreviewStateManager', 'STATE_RESET', 'State reset to initial');
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    componentCount: number;
    stateHistorySize: number;
    layout: string;
    theme: string;
  } {
    return {
      componentCount: this.currentState.components.size,
      stateHistorySize: this.stateHistory.length,
      layout: this.currentState.layout,
      theme: this.currentState.theme,
    };
  }
}

export const previewStateManager = new PreviewStateManager();

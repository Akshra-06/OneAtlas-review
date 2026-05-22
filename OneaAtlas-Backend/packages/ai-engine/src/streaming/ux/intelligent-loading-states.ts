/**
 * Intelligent Loading States
 * 
 * Manages intelligent loading states for streaming.
 * Provides context-aware loading messages and states.
 */

import { logger } from '../../shared/utils/logger';

export interface LoadingState {
  id: string;
  sessionId: string;
  type: 'skeleton' | 'spinner' | 'progress' | 'shimmer' | 'blur';
  message: string;
  context: string;
  timestamp: number;
}

export interface LoadingConfig {
  enableContextAwareStates: boolean;
  enableSmartMessages: boolean;
  maxStates: number;
}

const DEFAULT_CONFIG: LoadingConfig = {
  enableContextAwareStates: true,
  enableSmartMessages: true,
  maxStates: 50,
};

/**
 * Intelligent Loading States
 * 
 * Manages intelligent loading states:
 * - Context-aware loading states
 * - Smart loading messages
 * - State transitions
 * - Loading state history
 */
export class IntelligentLoadingStates {
  private config: LoadingConfig;
  private states: Map<string, LoadingState[]> = new Map();
  private currentState: Map<string, LoadingState | null> = new Map();

  constructor(config: Partial<LoadingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set a loading state
   */
  setState(sessionId: string, type: LoadingState['type'], context: string, message?: string): LoadingState {
    const state: LoadingState = {
      id: crypto.randomUUID(),
      sessionId,
      type,
      message: message || this.generateSmartMessage(type, context),
      context,
      timestamp: Date.now(),
    };

    if (!this.states.has(sessionId)) {
      this.states.set(sessionId, []);
    }

    const sessionStates = this.states.get(sessionId)!;
    sessionStates.push(state);

    // Enforce max states
    if (sessionStates.length > this.config.maxStates) {
      sessionStates.shift();
    }

    this.currentState.set(sessionId, state);

    logger.info('IntelligentLoadingStates', 'STATE_SET', 'Loading state set', {
      sessionId,
      type,
      context,
    });

    return state;
  }

  /**
   * Get current loading state for a session
   */
  getCurrentState(sessionId: string): LoadingState | null {
    return this.currentState.get(sessionId) || null;
  }

  /**
   * Get loading states for a session
   */
  getStates(sessionId: string): LoadingState[] {
    return this.states.get(sessionId) || [];
  }

  /**
   * Clear loading state for a session
   */
  clearState(sessionId: string): void {
    this.currentState.set(sessionId, null);

    logger.info('IntelligentLoadingStates', 'STATE_CLEARED', 'Loading state cleared', {
      sessionId,
    });
  }

  /**
   * Clear states for a session
   */
  clearStates(sessionId: string): void {
    this.states.delete(sessionId);
    this.currentState.delete(sessionId);

    logger.info('IntelligentLoadingStates', 'STATES_CLEARED', 'States cleared', {
      sessionId,
    });
  }

  /**
   * Clear all states
   */
  clearAll(): void {
    this.states.clear();
    this.currentState.clear();

    logger.info('IntelligentLoadingStates', 'ALL_CLEARED', 'All states cleared');
  }

  /**
   * Generate smart loading message based on type and context
   */
  private generateSmartMessage(type: LoadingState['type'], context: string): string {
    if (!this.config.enableSmartMessages) {
      return 'Loading...';
    }

    const contextLower = context.toLowerCase();

    switch (type) {
      case 'skeleton':
        if (contextLower.includes('dashboard')) {
          return 'Building your dashboard...';
        } else if (contextLower.includes('form')) {
          return 'Creating form structure...';
        } else if (contextLower.includes('chart')) {
          return 'Preparing charts...';
        }
        return 'Loading content...';

      case 'spinner':
        if (contextLower.includes('data')) {
          return 'Processing data...';
        } else if (contextLower.includes('ai')) {
          return 'AI is thinking...';
        }
        return 'Processing...';

      case 'progress':
        if (contextLower.includes('generation')) {
          return 'Generating application...';
        } else if (contextLower.includes('component')) {
          return 'Building components...';
        }
        return 'In progress...';

      case 'shimmer':
        return 'Loading content...';

      case 'blur':
        return 'Preparing view...';

      default:
        return 'Loading...';
    }
  }

  /**
   * Determine appropriate loading type based on context
   */
  determineLoadingType(context: string): LoadingState['type'] {
    if (!this.config.enableContextAwareStates) {
      return 'spinner';
    }

    const contextLower = context.toLowerCase();

    if (contextLower.includes('dashboard') || contextLower.includes('grid')) {
      return 'skeleton';
    } else if (contextLower.includes('data') || contextLower.includes('api')) {
      return 'spinner';
    } else if (contextLower.includes('progress') || contextLower.includes('generation')) {
      return 'progress';
    } else if (contextLower.includes('image') || contextLower.includes('media')) {
      return 'blur';
    }

    return 'shimmer';
  }

  /**
   * Set context-aware loading state
   */
  setContextAwareState(sessionId: string, context: string): LoadingState {
    const type = this.determineLoadingType(context);
    return this.setState(sessionId, type, context);
  }

  /**
   * Get state count for a session
   */
  getStateCount(sessionId: string): number {
    return this.states.get(sessionId)?.length || 0;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LoadingConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('IntelligentLoadingStates', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): LoadingConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    totalStates: number;
    averageStatesPerSession: number;
    config: LoadingConfig;
  } {
    const totalSessions = this.states.size;
    const totalStates = Array.from(this.states.values()).reduce(
      (sum, states) => sum + states.length,
      0
    );
    const averageStatesPerSession = totalSessions > 0 ? totalStates / totalSessions : 0;

    return {
      totalSessions,
      totalStates,
      averageStatesPerSession,
      config: this.getConfig(),
    };
  }
}

export const intelligentLoadingStates = new IntelligentLoadingStates();

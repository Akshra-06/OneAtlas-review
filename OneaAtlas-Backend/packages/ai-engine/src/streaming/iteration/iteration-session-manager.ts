/**
 * Iteration Session Manager
 * 
 * Manages conversational iterative editing sessions.
 * Supports contextual edits and preserves generation memory.
 */

import { logger } from '../../shared/utils/logger';
import { Patch } from '../patch/patch-generator';

export interface IterationSession {
  id: string;
  originalPrompt: string;
  iterations: Iteration[];
  currentPrompt: string;
  createdAt: number;
  updatedAt: number;
}

export interface Iteration {
  id: string;
  prompt: string;
  timestamp: number;
  patches: Patch[];
  result?: unknown;
}

export interface IterationConfig {
  maxIterations: number;
  enableContextMemory: boolean;
  enableHistoryTracking: boolean;
}

const DEFAULT_CONFIG: IterationConfig = {
  maxIterations: 50,
  enableContextMemory: true,
  enableHistoryTracking: true,
};

/**
 * Iteration Session Manager
 * 
 * Manages conversational iterative editing:
 * - User can modify generated app via chat
 * - Support contextual edits
 * - Preserve generation memory
 * - Maintain generation history
 * - Support undo/redo across generations
 */
export class IterationSessionManager {
  private config: IterationConfig;
  private sessions: Map<string, IterationSession> = new Map();

  constructor(config: Partial<IterationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Create a new iteration session
   */
  createSession(originalPrompt: string): IterationSession {
    const session: IterationSession = {
      id: crypto.randomUUID(),
      originalPrompt,
      iterations: [],
      currentPrompt: originalPrompt,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.sessions.set(session.id, session);

    logger.info('IterationSessionManager', 'SESSION_CREATED', 'Iteration session created', {
      sessionId: session.id,
      originalPrompt,
    });

    return session;
  }

  /**
   * Add an iteration to a session
   */
  addIteration(sessionId: string, prompt: string, patches: Patch[]): Iteration | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      logger.warn('IterationSessionManager', 'SESSION_NOT_FOUND', 'Session not found', {
        sessionId,
      });
      return null;
    }

    // Check max iterations
    if (session.iterations.length >= this.config.maxIterations) {
      logger.warn('IterationSessionManager', 'MAX_ITERATIONS_REACHED', 'Max iterations reached', {
        sessionId,
        maxIterations: this.config.maxIterations,
      });
      return null;
    }

    const iteration: Iteration = {
      id: crypto.randomUUID(),
      prompt,
      timestamp: Date.now(),
      patches,
    };

    session.iterations.push(iteration);
    session.currentPrompt = prompt;
    session.updatedAt = Date.now();

    logger.info('IterationSessionManager', 'ITERATION_ADDED', 'Iteration added', {
      sessionId,
      iterationId: iteration.id,
      prompt,
      patchesCount: patches.length,
    });

    return iteration;
  }

  /**
   * Get a session by ID
   */
  getSession(sessionId: string): IterationSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all sessions
   */
  getAllSessions(): IterationSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get iterations for a session
   */
  getIterations(sessionId: string): Iteration[] {
    const session = this.sessions.get(sessionId);
    return session ? session.iterations : [];
  }

  /**
   * Get the latest iteration for a session
   */
  getLatestIteration(sessionId: string): Iteration | undefined {
    const session = this.sessions.get(sessionId);
    if (!session || session.iterations.length === 0) {
      return undefined;
    }

    return session.iterations[session.iterations.length - 1];
  }

  /**
   * Undo the latest iteration
   */
  undoIteration(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || session.iterations.length === 0) {
      logger.warn('IterationSessionManager', 'UNDO_FAILED', 'Undo failed - no iterations', {
        sessionId,
      });
      return false;
    }

    const removed = session.iterations.pop();
    session.updatedAt = Date.now();

    // Update current prompt to previous iteration
    if (session.iterations.length > 0) {
      const latestIteration = session.iterations[session.iterations.length - 1];
      if (latestIteration) {
        session.currentPrompt = latestIteration.prompt;
      }
    } else {
      session.currentPrompt = session.originalPrompt;
    }

    logger.info('IterationSessionManager', 'ITERATION_UNDONE', 'Iteration undone', {
      sessionId,
      iterationId: removed?.id,
    });

    return true;
  }

  /**
   * Redo the last undone iteration
   */
  redoIteration(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      logger.warn('IterationSessionManager', 'REDO_FAILED', 'Redo failed - session not found', {
        sessionId,
      });
      return false;
    }

    // In a real implementation, this would require tracking undone iterations
    // For now, just return false
    logger.warn('IterationSessionManager', 'REDO_NOT_SUPPORTED', 'Redo not yet implemented', {
      sessionId,
    });

    return false;
  }

  /**
   * Delete a session
   */
  deleteSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    this.sessions.delete(sessionId);

    logger.info('IterationSessionManager', 'SESSION_DELETED', 'Session deleted', {
      sessionId,
    });

    return true;
  }

  /**
   * Clear all sessions
   */
  clearAllSessions(): void {
    this.sessions.clear();

    logger.info('IterationSessionManager', 'ALL_SESSIONS_CLEARED', 'All sessions cleared');
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Get total iteration count across all sessions
   */
  getTotalIterationCount(): number {
    let total = 0;
    for (const session of this.sessions.values()) {
      total += session.iterations.length;
    }
    return total;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<IterationConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('IterationSessionManager', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): IterationConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    totalIterations: number;
    averageIterationsPerSession: number;
    config: IterationConfig;
  } {
    const totalSessions = this.sessions.size;
    const totalIterations = this.getTotalIterationCount();
    const averageIterationsPerSession = totalSessions > 0 ? totalIterations / totalSessions : 0;

    return {
      totalSessions,
      totalIterations,
      averageIterationsPerSession,
      config: this.getConfig(),
    };
  }
}

export const iterationSessionManager = new IterationSessionManager();

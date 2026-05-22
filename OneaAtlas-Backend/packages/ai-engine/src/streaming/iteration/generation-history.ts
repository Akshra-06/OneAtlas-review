/**
 * Generation History
 * 
 * Maintains generation history for undo/redo.
 * Tracks all generations across iterations.
 */

import { logger } from '../../shared/utils/logger';
import { Patch } from '../patch/patch-generator';

export interface HistoryEntry {
  id: string;
  sessionId: string;
  prompt: string;
  timestamp: number;
  patches: Patch[];
  result?: unknown;
  metadata?: Record<string, unknown>;
}

export interface HistoryConfig {
  maxHistorySize: number;
  enablePersistence: boolean;
  enableCompression: boolean;
}

const DEFAULT_CONFIG: HistoryConfig = {
  maxHistorySize: 100,
  enablePersistence: false,
  enableCompression: false,
};

/**
 * Generation History
 * 
 * Maintains generation history:
 * - Track all generations
 * - Support undo/redo
 * - History navigation
 * - History queries
 */
export class GenerationHistory {
  private config: HistoryConfig;
  private history: HistoryEntry[] = [];
  private currentIndex: number = -1;
  private sessionHistory: Map<string, HistoryEntry[]> = new Map();

  constructor(config: Partial<HistoryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Add a history entry
   */
  addEntry(entry: HistoryEntry): void {
    // Remove any entries after current index (for redo support)
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new entry
    this.history.push(entry);
    this.currentIndex = this.history.length - 1;

    // Also add to session history
    if (!this.sessionHistory.has(entry.sessionId)) {
      this.sessionHistory.set(entry.sessionId, []);
    }
    this.sessionHistory.get(entry.sessionId)!.push(entry);

    // Enforce max history size
    this.enforceMaxHistorySize();

    logger.info('GenerationHistory', 'ENTRY_ADDED', 'History entry added', {
      entryId: entry.id,
      sessionId: entry.sessionId,
      prompt: entry.prompt,
    });
  }

  /**
   * Get the current history entry
   */
  getCurrent(): HistoryEntry | undefined {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
      return undefined;
    }

    return this.history[this.currentIndex];
  }

  /**
   * Undo to previous entry
   */
  undo(): HistoryEntry | undefined {
    if (this.currentIndex < 0) {
      logger.warn('GenerationHistory', 'UNDO_FAILED', 'Cannot undo - at beginning of history');
      return undefined;
    }

    const previousEntry = this.history[this.currentIndex];
    this.currentIndex--;

    logger.info('GenerationHistory', 'UNDO', 'Undo performed', {
      fromIndex: this.currentIndex + 1,
      toIndex: this.currentIndex,
    });

    return previousEntry;
  }

  /**
   * Redo to next entry
   */
  redo(): HistoryEntry | undefined {
    if (this.currentIndex >= this.history.length - 1) {
      logger.warn('GenerationHistory', 'REDO_FAILED', 'Cannot redo - at end of history');
      return undefined;
    }

    this.currentIndex++;
    const nextEntry = this.history[this.currentIndex];

    logger.info('GenerationHistory', 'REDO', 'Redo performed', {
      fromIndex: this.currentIndex - 1,
      toIndex: this.currentIndex,
    });

    return nextEntry;
  }

  /**
   * Navigate to a specific index
   */
  navigateTo(index: number): HistoryEntry | undefined {
    if (index < 0 || index >= this.history.length) {
      logger.warn('GenerationHistory', 'NAVIGATE_FAILED', 'Invalid history index', {
        index,
        maxIndex: this.history.length - 1,
      });
      return undefined;
    }

    this.currentIndex = index;
    const entry = this.history[index];

    logger.info('GenerationHistory', 'NAVIGATED', 'Navigated to history index', {
      index,
    });

    return entry;
  }

  /**
   * Get history for a session
   */
  getSessionHistory(sessionId: string): HistoryEntry[] {
    return this.sessionHistory.get(sessionId) || [];
  }

  /**
   * Get all history entries
   */
  getAll(): HistoryEntry[] {
    return [...this.history];
  }

  /**
   * Get history entry by ID
   */
  getById(id: string): HistoryEntry | undefined {
    return this.history.find(entry => entry.id === id);
  }

  /**
   * Get history entries in a range
   */
  getRange(startIndex: number, endIndex: number): HistoryEntry[] {
    if (startIndex < 0 || endIndex >= this.history.length || startIndex > endIndex) {
      return [];
    }

    return this.history.slice(startIndex, endIndex + 1);
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
    this.sessionHistory.clear();

    logger.info('GenerationHistory', 'ALL_CLEARED', 'All history cleared');
  }

  /**
   * Clear history for a session
   */
  clearSession(sessionId: string): void {
    const sessionEntries = this.sessionHistory.get(sessionId);
    if (!sessionEntries) {
      return;
    }

    // Remove entries from main history
    const entryIds = new Set(sessionEntries.map(e => e.id));
    this.history = this.history.filter(entry => !entryIds.has(entry.id));
    this.currentIndex = Math.min(this.currentIndex, this.history.length - 1);

    // Remove session history
    this.sessionHistory.delete(sessionId);

    logger.info('GenerationHistory', 'SESSION_CLEARED', 'Session history cleared', {
      sessionId,
      entriesRemoved: sessionEntries.length,
    });
  }

  /**
   * Get history size
   */
  size(): number {
    return this.history.length;
  }

  /**
   * Get session history size
   */
  sessionSize(sessionId: string): number {
    const sessionEntries = this.sessionHistory.get(sessionId);
    return sessionEntries ? sessionEntries.length : 0;
  }

  /**
   * Check if can undo
   */
  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  /**
   * Check if can redo
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Enforce max history size
   */
  private enforceMaxHistorySize(): void {
    if (this.history.length <= this.config.maxHistorySize) {
      return;
    }

    // Remove oldest entries
    const toRemove = this.history.length - this.config.maxHistorySize;
    const removed = this.history.splice(0, toRemove);

    // Update session histories
    const removedIds = new Set(removed.map(e => e.id));
    for (const [sessionId, entries] of this.sessionHistory.entries()) {
      this.sessionHistory.set(
        sessionId,
        entries.filter(entry => !removedIds.has(entry.id))
      );
    }

    // Update current index
    this.currentIndex = Math.max(-1, this.currentIndex - toRemove);

    logger.info('GenerationHistory', 'HISTORY_TRUNCATED', 'History truncated to max size', {
      removedCount: toRemove,
      maxSize: this.config.maxHistorySize,
    });
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HistoryConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('GenerationHistory', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): HistoryConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalEntries: number;
    currentIndex: number;
    totalSessions: number;
    averageEntriesPerSession: number;
    config: HistoryConfig;
  } {
    const totalEntries = this.history.length;
    const totalSessions = this.sessionHistory.size;
    const averageEntriesPerSession = totalSessions > 0 ? totalEntries / totalSessions : 0;

    return {
      totalEntries,
      currentIndex: this.currentIndex,
      totalSessions,
      averageEntriesPerSession,
      config: this.getConfig(),
    };
  }
}

export const generationHistory = new GenerationHistory();

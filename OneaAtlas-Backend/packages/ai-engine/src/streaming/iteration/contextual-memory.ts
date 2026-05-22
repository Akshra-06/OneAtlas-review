/**
 * Contextual Memory
 * 
 * Preserves context across iterations.
 * Maintains generation memory for conversational editing.
 */

import { logger } from '../../shared/utils/logger';

export interface MemoryEntry {
  key: string;
  value: unknown;
  timestamp: number;
  iterationId?: string;
}

export interface ContextualMemoryConfig {
  maxEntries: number;
  enablePersistence: boolean;
  enableTTL: boolean;
  ttlMs: number;
}

const DEFAULT_CONFIG: ContextualMemoryConfig = {
  maxEntries: 1000,
  enablePersistence: false,
  enableTTL: false,
  ttlMs: 3600000, // 1 hour
};

/**
 * Contextual Memory
 * 
 * Preserves context across iterations:
 * - Store context from previous iterations
 * - Retrieve context for current iteration
 * - Manage memory lifecycle
 * - Support context inheritance
 */
export class ContextualMemory {
  private config: ContextualMemoryConfig;
  private memory: Map<string, MemoryEntry> = new Map();
  private sessionMemory: Map<string, Map<string, MemoryEntry>> = new Map();

  constructor(config: Partial<ContextualMemoryConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set a memory entry
   */
  set(key: string, value: unknown, iterationId?: string): void {
    const entry: MemoryEntry = {
      key,
      value,
      timestamp: Date.now(),
      iterationId,
    };

    this.memory.set(key, entry);

    // Also store in session memory if iterationId provided
    if (iterationId) {
      if (!this.sessionMemory.has(iterationId)) {
        this.sessionMemory.set(iterationId, new Map());
      }
      this.sessionMemory.get(iterationId)!.set(key, entry);
    }

    // Enforce max entries
    this.enforceMaxEntries();

    logger.info('ContextualMemory', 'ENTRY_SET', 'Memory entry set', {
      key,
      iterationId,
    });
  }

  /**
   * Get a memory entry
   */
  get(key: string): unknown | undefined {
    const entry = this.memory.get(key);

    if (!entry) {
      return undefined;
    }

    // Check TTL if enabled
    if (this.config.enableTTL) {
      const age = Date.now() - entry.timestamp;
      if (age > this.config.ttlMs) {
        this.delete(key);
        return undefined;
      }
    }

    return entry.value;
  }

  /**
   * Get a memory entry for a specific iteration
   */
  getForIteration(key: string, iterationId: string): unknown | undefined {
    const sessionMem = this.sessionMemory.get(iterationId);
    if (!sessionMem) {
      return undefined;
    }

    const entry = sessionMem.get(key);
    if (!entry) {
      return undefined;
    }

    // Check TTL if enabled
    if (this.config.enableTTL) {
      const age = Date.now() - entry.timestamp;
      if (age > this.config.ttlMs) {
        this.deleteForIteration(key, iterationId);
        return undefined;
      }
    }

    return entry.value;
  }

  /**
   * Delete a memory entry
   */
  delete(key: string): boolean {
    const deleted = this.memory.delete(key);

    // Also delete from all session memories
    for (const sessionMem of this.sessionMemory.values()) {
      sessionMem.delete(key);
    }

    if (deleted) {
      logger.info('ContextualMemory', 'ENTRY_DELETED', 'Memory entry deleted', { key });
    }

    return deleted;
  }

  /**
   * Delete a memory entry for a specific iteration
   */
  deleteForIteration(key: string, iterationId: string): boolean {
    const sessionMem = this.sessionMemory.get(iterationId);
    if (!sessionMem) {
      return false;
    }

    const deleted = sessionMem.delete(key);

    if (deleted) {
      logger.info('ContextualMemory', 'ENTRY_DELETED_FOR_ITERATION', 'Memory entry deleted for iteration', {
        key,
        iterationId,
      });
    }

    return deleted;
  }

  /**
   * Clear all memory for an iteration
   */
  clearIteration(iterationId: string): void {
    const sessionMem = this.sessionMemory.get(iterationId);
    if (sessionMem) {
      sessionMem.clear();
      this.sessionMemory.delete(iterationId);

      logger.info('ContextualMemory', 'ITERATION_CLEARED', 'Iteration memory cleared', {
        iterationId,
      });
    }
  }

  /**
   * Clear all memory
   */
  clear(): void {
    this.memory.clear();
    this.sessionMemory.clear();

    logger.info('ContextualMemory', 'ALL_CLEARED', 'All memory cleared');
  }

  /**
   * Get all memory entries
   */
  getAll(): MemoryEntry[] {
    return Array.from(this.memory.values());
  }

  /**
   * Get all memory entries for an iteration
   */
  getAllForIteration(iterationId: string): MemoryEntry[] {
    const sessionMem = this.sessionMemory.get(iterationId);
    return sessionMem ? Array.from(sessionMem.values()) : [];
  }

  /**
   * Check if a key exists
   */
  has(key: string): boolean {
    return this.memory.has(key);
  }

  /**
   * Check if a key exists for an iteration
   */
  hasForIteration(key: string, iterationId: string): boolean {
    const sessionMem = this.sessionMemory.get(iterationId);
    return sessionMem ? sessionMem.has(key) : false;
  }

  /**
   * Get memory size
   */
  size(): number {
    return this.memory.size;
  }

  /**
   * Get memory size for an iteration
   */
  sizeForIteration(iterationId: string): number {
    const sessionMem = this.sessionMemory.get(iterationId);
    return sessionMem ? sessionMem.size : 0;
  }

  /**
   * Enforce max entries limit
   */
  private enforceMaxEntries(): void {
    if (this.memory.size <= this.config.maxEntries) {
      return;
    }

    // Remove oldest entries
    const entries = Array.from(this.memory.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = entries.length - this.config.maxEntries;
    for (let i = 0; i < toRemove; i++) {
      const entry = entries[i];
      if (entry) {
        this.delete(entry[0]);
      }
    }
  }

  /**
   * Clean up expired entries (if TTL enabled)
   */
  cleanupExpired(): number {
    if (!this.config.enableTTL) {
      return 0;
    }

    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.memory.entries()) {
      const age = now - entry.timestamp;
      if (age > this.config.ttlMs) {
        this.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info('ContextualMemory', 'EXPIRED_CLEANED', 'Expired entries cleaned', {
        count: cleaned,
      });
    }

    return cleaned;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ContextualMemoryConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ContextualMemory', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ContextualMemoryConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalEntries: number;
    totalIterations: number;
    averageEntriesPerIteration: number;
    config: ContextualMemoryConfig;
  } {
    const totalEntries = this.memory.size;
    const totalIterations = this.sessionMemory.size;
    const averageEntriesPerIteration = totalIterations > 0 ? totalEntries / totalIterations : 0;

    return {
      totalEntries,
      totalIterations,
      averageEntriesPerIteration,
      config: this.getConfig(),
    };
  }
}

export const contextualMemory = new ContextualMemory();

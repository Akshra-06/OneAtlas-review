/**
 * Generation Cache
 * 
 * Caches generation results to avoid redundant AI calls.
 * Improves performance and reduces costs.
 */

import { logger } from '../../shared/utils/logger';
import { reproducibilityManager } from '../determinism/reproducibility-manager';

export interface CacheEntry {
  key: string;
  value: unknown;
  timestamp: string;
  ttl: number;
  accessCount: number;
  lastAccess: string;
  size: number;
}

export interface CacheConfig {
  enabled: boolean;
  maxSize: number;
  defaultTTL: number; // Time to live in milliseconds
  enableStats: boolean;
}

const DEFAULT_CONFIG: CacheConfig = {
  enabled: true,
  maxSize: 100,
  defaultTTL: 3600000, // 1 hour
  enableStats: true,
};

/**
 * Generation Cache
 * 
 * Caches generation results:
 * - In-memory caching
 * - TTL-based expiration
 * - LRU eviction
 * - Cache statistics
 */
export class GenerationCache {
  private config: CacheConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    sets: 0,
    deletes: 0,
  };

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get cached value
   */
  get(key: string): unknown | null {
    if (!this.config.enabled) {
      return null;
    }

    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.delete(key);
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccess = new Date().toISOString();

    this.stats.hits++;

    logger.info('GenerationCache', 'CACHE_HIT', 'Cache hit', { key });

    return entry.value;
  }

  /**
   * Set cached value
   */
  set(key: string, value: unknown, ttl?: number): void {
    if (!this.config.enabled) {
      return;
    }

    const entry: CacheEntry = {
      key,
      value,
      timestamp: new Date().toISOString(),
      ttl: ttl ?? this.config.defaultTTL,
      accessCount: 0,
      lastAccess: new Date().toISOString(),
      size: this.estimateSize(value),
    };

    // Evict if necessary
    this.evictIfNeeded();

    this.cache.set(key, entry);
    this.stats.sets++;

    logger.info('GenerationCache', 'CACHE_SET', 'Cache set', { key, size: entry.size });
  }

  /**
   * Delete cached value
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    
    if (deleted) {
      this.stats.deletes++;
      logger.info('GenerationCache', 'CACHE_DELETE', 'Cache delete', { key });
    }

    return deleted;
  }

  /**
   * Clear all cache
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    
    logger.info('GenerationCache', 'CACHE_CLEARED', 'Cache cleared', { size });
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    hits: number;
    misses: number;
    hitRate: number;
    evictions: number;
    sets: number;
    deletes: number;
    size: number;
  } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      ...this.stats,
      hitRate,
      size: this.cache.size,
    };
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      sets: 0,
      deletes: 0,
    };

    logger.info('GenerationCache', 'STATS_RESET', 'Statistics reset');
  }

  /**
   * Evict expired entries
   */
  evictExpired(): number {
    let evicted = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        evicted++;
      }
    }

    if (evicted > 0) {
      logger.info('GenerationCache', 'EXPIRED_EVICTED', 'Expired entries evicted', { count: evicted });
    }

    return evicted;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
    
    logger.info('GenerationCache', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    const now = Date.now();
    const entryTime = new Date(entry.timestamp).getTime();
    return (now - entryTime) > entry.ttl;
  }

  /**
   * Evict entries if cache is full
   */
  private evictIfNeeded(): void {
    if (this.cache.size >= this.config.maxSize) {
      // Evict least recently used
      let lruKey: string | null = null;
      let lruTime = Date.now();

      for (const [key, entry] of this.cache.entries()) {
        const lastAccess = new Date(entry.lastAccess).getTime();
        if (lastAccess < lruTime) {
          lruTime = lastAccess;
          lruKey = key;
        }
      }

      if (lruKey) {
        this.cache.delete(lruKey);
        this.stats.evictions++;

        logger.info('GenerationCache', 'LRU_EVICTED', 'LRU entry evicted', { key: lruKey });
      }
    }
  }

  /**
   * Estimate size of value in bytes
   */
  private estimateSize(value: unknown): number {
    try {
      return JSON.stringify(value).length * 2; // Approximate bytes
    } catch {
      return 0;
    }
  }

  /**
   * Generate cache key from inputs
   */
  generateKey(inputs: Record<string, unknown>): string {
    return reproducibilityManager.computeInputHash(inputs);
  }

  /**
   * Get or set with generator function
   */
  async getOrSet(
    key: string,
    generator: () => Promise<unknown>,
    ttl?: number,
  ): Promise<unknown> {
    const cached = this.get(key);
    
    if (cached !== null) {
      return cached;
    }

    const value = await generator();
    this.set(key, value, ttl);
    
    return value;
  }

  /**
   * Get cache entries
   */
  getEntries(): CacheEntry[] {
    return Array.from(this.cache.values());
  }

  /**
   * Get cache keys
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }
}

export const generationCache = new GenerationCache();

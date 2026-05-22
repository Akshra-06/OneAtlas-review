/**
 * AI Response Cache for Template Modifications
 * Caches AI responses to avoid redundant calls and improve performance
 */

import crypto from 'crypto';

export interface CacheEntry {
  response: string;
  timestamp: number;
  ttl: number;
  metadata: {
    provider: string;
    model: string;
    complexity: string;
    taskType: string;
  };
}

class AICache {
  private cache: Map<string, CacheEntry> = new Map();
  private defaultTTL = 3600000; // 1 hour in milliseconds

  /**
   * Generate cache key from request parameters
   */
  private generateKey(
    template: string,
    entityName: string,
    userPrompt: string,
    domain: string,
    taskType: string,
  ): string {
    const keyData = `${template}:${entityName}:${userPrompt}:${domain}:${taskType}`;
    return crypto.createHash('sha256').update(keyData).digest('hex');
  }

  /**
   * Get cached response if available and not expired
   */
  get(
    template: string,
    entityName: string,
    userPrompt: string,
    domain: string,
    taskType: string,
  ): CacheEntry | null {
    const key = this.generateKey(template, entityName, userPrompt, domain, taskType);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  /**
   * Set cache entry
   */
  set(
    template: string,
    entityName: string,
    userPrompt: string,
    domain: string,
    taskType: string,
    response: string,
    metadata: CacheEntry['metadata'],
    ttl?: number,
  ): void {
    const key = this.generateKey(template, entityName, userPrompt, domain, taskType);
    const entry: CacheEntry = {
      response,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      metadata,
    };
    this.cache.set(key, entry);
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Set default TTL
   */
  setDefaultTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }
}

export const aiCache = new AICache();

// Auto-clear expired entries every 5 minutes
setInterval(() => {
  aiCache.clearExpired();
}, 300000);

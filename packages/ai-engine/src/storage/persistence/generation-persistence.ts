/**
 * Generation Persistence
 * 
 * Stores and retrieves generation results.
 * Provides persistent storage for generated applications.
 */

import type { GeneratedFile } from '@oneatlas/shared';
import { logger } from '../../shared/utils/logger';

export interface GenerationRecord {
  id: string;
  appId: string;
  appName: string;
  timestamp: string;
  files: GeneratedFile[];
  prismaSchema: string;
  metadata: Record<string, unknown>;
  size: number;
  checksum: string;
}

export interface PersistenceConfig {
  enabled: boolean;
  maxStorageSize: number; // In bytes
  autoCleanup: boolean;
  retentionDays: number;
}

const DEFAULT_CONFIG: PersistenceConfig = {
  enabled: true,
  maxStorageSize: 1073741824, // 1GB
  autoCleanup: true,
  retentionDays: 30,
};

/**
 * Generation Persistence
 * 
 * Manages persistent storage of generations:
 * - Store generation results
 * - Retrieve generation results
 * - Cleanup old generations
 * - Storage management
 */
export class GenerationPersistence {
  private config: PersistenceConfig;
  private storage: Map<string, GenerationRecord> = new Map();

  constructor(config: Partial<PersistenceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Store generation result
   */
  storeGeneration(
    appId: string,
    appName: string,
    files: GeneratedFile[],
    prismaSchema: string,
    metadata: Record<string, unknown>,
  ): GenerationRecord {
    const id = crypto.randomUUID();
    const size = this.calculateSize(files, prismaSchema);
    const checksum = this.calculateChecksum(files, prismaSchema);

    const record: GenerationRecord = {
      id,
      appId,
      appName,
      timestamp: new Date().toISOString(),
      files,
      prismaSchema,
      metadata,
      size,
      checksum,
    };

    // Check storage limits
    if (this.config.autoCleanup) {
      this.cleanupIfNeeded();
    }

    this.storage.set(id, record);

    logger.info('GenerationPersistence', 'GENERATION_STORED', 'Generation stored', {
      id,
      appId,
      appName,
      size,
    });

    return record;
  }

  /**
   * Retrieve generation by ID
   */
  getGeneration(id: string): GenerationRecord | undefined {
    const record = this.storage.get(id);
    
    if (record) {
      logger.info('GenerationPersistence', 'GENERATION_RETRIEVED', 'Generation retrieved', { id });
    }

    return record;
  }

  /**
   * Retrieve generation by app ID
   */
  getGenerationByAppId(appId: string): GenerationRecord | undefined {
    for (const record of this.storage.values()) {
      if (record.appId === appId) {
        logger.info('GenerationPersistence', 'GENERATION_RETRIEVED', 'Generation retrieved by app ID', {
          appId,
          generationId: record.id,
        });
        return record;
      }
    }

    return undefined;
  }

  /**
   * List all generations
   */
  listGenerations(): GenerationRecord[] {
    return Array.from(this.storage.values()).sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * List generations for app
   */
  listGenerationsForApp(appId: string): GenerationRecord[] {
    return this.listGenerations().filter(r => r.appId === appId);
  }

  /**
   * Delete generation
   */
  deleteGeneration(id: string): boolean {
    const deleted = this.storage.delete(id);
    
    if (deleted) {
      logger.info('GenerationPersistence', 'GENERATION_DELETED', 'Generation deleted', { id });
    }

    return deleted;
  }

  /**
   * Delete all generations for app
   */
  deleteGenerationsForApp(appId: string): number {
    let deleted = 0;
    
    for (const [id, record] of this.storage.entries()) {
      if (record.appId === appId) {
        this.storage.delete(id);
        deleted++;
      }
    }

    if (deleted > 0) {
      logger.info('GenerationPersistence', 'APP_GENERATIONS_DELETED', 'App generations deleted', {
        appId,
        count: deleted,
      });
    }

    return deleted;
  }

  /**
   * Clear all generations
   */
  clearAll(): void {
    const size = this.storage.size;
    this.storage.clear();
    
    logger.info('GenerationPersistence', 'ALL_GENERATIONS_CLEARED', 'All generations cleared', {
      count: size,
    });
  }

  /**
   * Cleanup old generations
   */
  cleanupOldGenerations(): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    let deleted = 0;

    for (const [id, record] of this.storage.entries()) {
      const recordDate = new Date(record.timestamp);
      if (recordDate < cutoffDate) {
        this.storage.delete(id);
        deleted++;
      }
    }

    if (deleted > 0) {
      logger.info('GenerationPersistence', 'OLD_GENERATIONS_CLEANED', 'Old generations cleaned', {
        count: deleted,
        cutoffDate: cutoffDate.toISOString(),
      });
    }

    return deleted;
  }

  /**
   * Cleanup if storage limit exceeded
   */
  private cleanupIfNeeded(): void {
    const currentSize = this.getTotalStorageSize();
    
    if (currentSize > this.config.maxStorageSize) {
      logger.warn('GenerationPersistence', 'STORAGE_LIMIT_EXCEEDED', 'Storage limit exceeded, cleaning up', {
        currentSize,
        maxSize: this.config.maxStorageSize,
      });

      // Delete oldest generations until under limit
      const sorted = this.listGenerations();
      let deleted = 0;

      for (const record of sorted) {
        this.storage.delete(record.id);
        deleted++;
        
        const newSize = this.getTotalStorageSize();
        if (newSize <= this.config.maxStorageSize * 0.8) {
          break; // Stop when under 80% of limit
        }
      }

      logger.info('GenerationPersistence', 'STORAGE_CLEANED', 'Storage cleaned', {
        deleted,
        newSize: this.getTotalStorageSize(),
      });
    }
  }

  /**
   * Get total storage size
   */
  getTotalStorageSize(): number {
    let total = 0;
    
    for (const record of this.storage.values()) {
      total += record.size;
    }

    return total;
  }

  /**
   * Get storage statistics
   */
  getStatistics(): {
    totalGenerations: number;
    totalApps: number;
    totalSize: number;
    averageSize: number;
    oldestGeneration: string | null;
    newestGeneration: string | null;
  } {
    const generations = this.listGenerations();
    const totalSize = this.getTotalStorageSize();
    const uniqueApps = new Set(generations.map(g => g.appId)).size;
    
    let oldestGeneration: string | null = null;
    let newestGeneration: string | null = null;

    if (generations.length > 0) {
      const oldest = generations[generations.length - 1];
      const newest = generations[0];
      oldestGeneration = oldest?.timestamp || null;
      newestGeneration = newest?.timestamp || null;
    }

    return {
      totalGenerations: generations.length,
      totalApps: uniqueApps,
      totalSize,
      averageSize: generations.length > 0 ? totalSize / generations.length : 0,
      oldestGeneration,
      newestGeneration,
    };
  }

  /**
   * Calculate size of generation
   */
  private calculateSize(files: GeneratedFile[], prismaSchema: string): number {
    let size = prismaSchema.length;
    
    for (const file of files) {
      size += file.content.length;
    }

    return size;
  }

  /**
   * Calculate checksum of generation
   */
  private calculateChecksum(files: GeneratedFile[], prismaSchema: string): string {
    const content = prismaSchema + files.map(f => f.content).join('');
    let hash = 0;
    
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(36);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PersistenceConfig>): void {
    this.config = { ...this.config, ...config };
    
    logger.info('GenerationPersistence', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): PersistenceConfig {
    return { ...this.config };
  }

  /**
   * Export generation as JSON
   */
  exportGeneration(id: string): string | null {
    const record = this.storage.get(id);
    
    if (!record) {
      return null;
    }

    return JSON.stringify(record, null, 2);
  }

  /**
   * Import generation from JSON
   */
  importGeneration(json: string): { success: boolean; id?: string; error?: string } {
    try {
      const record = JSON.parse(json) as GenerationRecord;
      
      // Validate structure
      if (!record.id || !record.appId || !record.files) {
        return {
          success: false,
          error: 'Invalid generation record structure',
        };
      }

      this.storage.set(record.id, record);

      logger.info('GenerationPersistence', 'GENERATION_IMPORTED', 'Generation imported', {
        id: record.id,
        appId: record.appId,
      });

      return {
        success: true,
        id: record.id,
      };
    } catch (error) {
      logger.error('GenerationPersistence', 'IMPORT_FAILED', 'Failed to import generation', {
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

export const generationPersistence = new GenerationPersistence();

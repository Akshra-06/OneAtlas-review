/**
 * Backup Manager
 * 
 * Manages automated backups of generations.
 * Provides backup and restore capabilities.
 */

import type { GeneratedFile } from '@oneatlas/shared';
import { logger } from '../../shared/utils/logger';

export interface BackupRecord {
  id: string;
  appId: string;
  appName: string;
  timestamp: string;
  files: GeneratedFile[];
  prismaSchema: string;
  metadata: Record<string, unknown>;
  size: number;
  checksum: string;
  backupType: 'manual' | 'scheduled' | 'auto';
  retentionDays: number;
}

export interface BackupConfig {
  enableAutoBackup: boolean;
  backupInterval: number; // In milliseconds
  retentionDays: number;
  maxBackups: number;
}

const DEFAULT_CONFIG: BackupConfig = {
  enableAutoBackup: false,
  backupInterval: 3600000, // 1 hour
  retentionDays: 30,
  maxBackups: 10,
};

/**
 * Backup Manager
 * 
 * Manages backups of generations:
 * - Create backups
 * - Restore from backups
 * - Schedule backups
 * - Cleanup old backups
 */
export class BackupManager {
  private config: BackupConfig;
  private backups: Map<string, BackupRecord> = new Map();
  private appBackups: Map<string, string[]> = new Map(); // appId -> backup IDs
  private backupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<BackupConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Create backup
   */
  createBackup(
    appId: string,
    appName: string,
    files: GeneratedFile[],
    prismaSchema: string,
    metadata: Record<string, unknown>,
    backupType: BackupRecord['backupType'] = 'manual',
  ): BackupRecord {
    const id = crypto.randomUUID();
    const size = this.calculateSize(files, prismaSchema);
    const checksum = this.calculateChecksum(files, prismaSchema);

    const record: BackupRecord = {
      id,
      appId,
      appName,
      timestamp: new Date().toISOString(),
      files,
      prismaSchema,
      metadata,
      size,
      checksum,
      backupType,
      retentionDays: this.config.retentionDays,
    };

    // Check backup limits
    this.cleanupIfNeeded(appId);

    this.backups.set(id, record);

    // Update app backups
    if (!this.appBackups.has(appId)) {
      this.appBackups.set(appId, []);
    }
    const backups = this.appBackups.get(appId);
    if (backups) {
      backups.push(id);
    }

    logger.info('BackupManager', 'BACKUP_CREATED', 'Backup created', {
      id,
      appId,
      appName,
      backupType,
      size,
    });

    return record;
  }

  /**
   * Restore from backup
   */
  restoreBackup(backupId: string): { success: boolean; backup?: BackupRecord; error?: string } {
    const backup = this.backups.get(backupId);
    
    if (!backup) {
      return {
        success: false,
        error: 'Backup not found',
      };
    }

    logger.info('BackupManager', 'BACKUP_RESTORED', 'Backup restored', {
      backupId,
      appId: backup.appId,
      appName: backup.appName,
    });

    return {
      success: true,
      backup,
    };
  }

  /**
   * Get backup by ID
   */
  getBackup(backupId: string): BackupRecord | undefined {
    return this.backups.get(backupId);
  }

  /**
   * List backups for app
   */
  listBackups(appId: string): BackupRecord[] {
    const backupIds = this.appBackups.get(appId) || [];
    
    return backupIds
      .map(id => this.backups.get(id))
      .filter((b): b is BackupRecord => b !== undefined)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * List all backups
   */
  listAllBackups(): BackupRecord[] {
    return Array.from(this.backups.values()).sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Delete backup
   */
  deleteBackup(backupId: string): boolean {
    const backup = this.backups.get(backupId);
    
    if (!backup) {
      return false;
    }

    this.backups.delete(backupId);

    // Remove from app backups
    const appBackups = this.appBackups.get(backup.appId);
    if (appBackups) {
      const index = appBackups.indexOf(backupId);
      if (index !== -1) {
        appBackups.splice(index, 1);
      }
    }

    logger.info('BackupManager', 'BACKUP_DELETED', 'Backup deleted', {
      backupId,
      appId: backup.appId,
    });

    return true;
  }

  /**
   * Delete all backups for app
   */
  deleteBackupsForApp(appId: string): number {
    const backupIds = this.appBackups.get(appId) || [];
    
    for (const id of backupIds) {
      this.backups.delete(id);
    }

    this.appBackups.delete(appId);

    logger.info('BackupManager', 'APP_BACKUPS_DELETED', 'All backups deleted for app', {
      appId,
      count: backupIds.length,
    });

    return backupIds.length;
  }

  /**
   * Cleanup old backups
   */
  cleanupOldBackups(): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    let deleted = 0;

    for (const [id, backup] of this.backups.entries()) {
      const backupDate = new Date(backup.timestamp);
      if (backupDate < cutoffDate) {
        this.deleteBackup(id);
        deleted++;
      }
    }

    if (deleted > 0) {
      logger.info('BackupManager', 'OLD_BACKUPS_CLEANED', 'Old backups cleaned', {
        count: deleted,
        cutoffDate: cutoffDate.toISOString(),
      });
    }

    return deleted;
  }

  /**
   * Cleanup if backup limit exceeded
   */
  private cleanupIfNeeded(appId: string): void {
    const backupIds = this.appBackups.get(appId) || [];
    
    if (backupIds.length >= this.config.maxBackups) {
      // Delete oldest backups
      const toDelete = backupIds.slice(0, backupIds.length - this.config.maxBackups + 1);
      
      for (const id of toDelete) {
        this.deleteBackup(id);
      }

      logger.info('BackupManager', 'BACKUPS_CLEANED', 'Backups cleaned due to limit', {
        appId,
        deleted: toDelete.length,
      });
    }
  }

  /**
   * Start automatic backup scheduling
   */
  startAutoBackup(): void {
    if (this.backupInterval) {
      this.stopAutoBackup();
    }

    if (this.config.enableAutoBackup) {
      this.backupInterval = setInterval(() => {
        logger.info('BackupManager', 'AUTO_BACKUP_TRIGGERED', 'Auto backup triggered');
        // Auto backup logic would be implemented here
        // This would typically iterate through apps and create backups
      }, this.config.backupInterval);

      logger.info('BackupManager', 'AUTO_BACKUP_STARTED', 'Auto backup started', {
        interval: this.config.backupInterval,
      });
    }
  }

  /**
   * Stop automatic backup scheduling
   */
  stopAutoBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      
      logger.info('BackupManager', 'AUTO_BACKUP_STOPPED', 'Auto backup stopped');
    }
  }

  /**
   * Get backup statistics
   */
  getStatistics(): {
    totalBackups: number;
    totalApps: number;
    totalSize: number;
    averageSize: number;
    byType: Record<string, number>;
  } {
    const backups = this.listAllBackups();
    const totalSize = backups.reduce((sum, b) => sum + b.size, 0);
    const uniqueApps = new Set(backups.map(b => b.appId)).size;
    
    const byType: Record<string, number> = {
      manual: 0,
      scheduled: 0,
      auto: 0,
    };

    for (const backup of backups) {
      byType[backup.backupType] = (byType[backup.backupType] || 0) + 1;
    }

    return {
      totalBackups: backups.length,
      totalApps: uniqueApps,
      totalSize,
      averageSize: backups.length > 0 ? totalSize / backups.length : 0,
      byType,
    };
  }

  /**
   * Calculate size
   */
  private calculateSize(files: GeneratedFile[], prismaSchema: string): number {
    let size = prismaSchema.length;
    
    for (const file of files) {
      size += file.content.length;
    }

    return size;
  }

  /**
   * Calculate checksum
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
  updateConfig(config: Partial<BackupConfig>): void {
    const wasEnabled = this.config.enableAutoBackup;
    this.config = { ...this.config, ...config };
    
    // Restart auto backup if configuration changed
    if (wasEnabled !== this.config.enableAutoBackup) {
      if (this.config.enableAutoBackup) {
        this.startAutoBackup();
      } else {
        this.stopAutoBackup();
      }
    }

    logger.info('BackupManager', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): BackupConfig {
    return { ...this.config };
  }

  /**
   * Export backup as JSON
   */
  exportBackup(backupId: string): string | null {
    const backup = this.backups.get(backupId);
    
    if (!backup) {
      return null;
    }

    return JSON.stringify(backup, null, 2);
  }

  /**
   * Import backup from JSON
   */
  importBackup(json: string): { success: boolean; id?: string; error?: string } {
    try {
      const backup = JSON.parse(json) as BackupRecord;
      
      // Validate structure
      if (!backup.id || !backup.appId || !backup.files) {
        return {
          success: false,
          error: 'Invalid backup record structure',
        };
      }

      this.backups.set(backup.id, backup);

      // Update app backups
      if (!this.appBackups.has(backup.appId)) {
        this.appBackups.set(backup.appId, []);
      }
      const backups = this.appBackups.get(backup.appId);
      if (backups && !backups.includes(backup.id)) {
        backups.push(backup.id);
      }

      logger.info('BackupManager', 'BACKUP_IMPORTED', 'Backup imported', {
        id: backup.id,
        appId: backup.appId,
      });

      return {
        success: true,
        id: backup.id,
      };
    } catch (error) {
      logger.error('BackupManager', 'IMPORT_FAILED', 'Failed to import backup', {
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Clear all backups
   */
  clearAll(): void {
    this.stopAutoBackup();
    this.backups.clear();
    this.appBackups.clear();
    
    logger.info('BackupManager', 'ALL_BACKUPS_CLEARED', 'All backups cleared');
  }
}

export const backupManager = new BackupManager();

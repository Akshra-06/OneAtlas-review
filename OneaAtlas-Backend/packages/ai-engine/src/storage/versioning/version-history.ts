/**
 * Version History
 * 
 * Tracks versions of generated applications.
 * Provides version comparison and rollback capabilities.
 */

import type { GeneratedFile } from '@oneatlas/shared';
import { logger } from '../../shared/utils/logger';

export interface VersionRecord {
  id: string;
  appId: string;
  version: string;
  timestamp: string;
  files: GeneratedFile[];
  prismaSchema: string;
  metadata: Record<string, unknown>;
  checksum: string;
  changeDescription?: string;
  parentVersionId?: string;
}

export interface VersionDiff {
  added: string[];
  removed: string[];
  modified: string[];
  unchanged: string[];
}

/**
 * Version History Manager
 * 
 * Manages version history of generations:
 * - Version tracking
 * - Version comparison
 * - Version rollback
 * - Version metadata
 */
export class VersionHistoryManager {
  private versions: Map<string, VersionRecord> = new Map();
  private appVersions: Map<string, string[]> = new Map(); // appId -> version IDs

  /**
   * Create new version
   */
  createVersion(
    appId: string,
    version: string,
    files: GeneratedFile[],
    prismaSchema: string,
    metadata: Record<string, unknown>,
    changeDescription?: string,
  ): VersionRecord {
    const id = crypto.randomUUID();
    const checksum = this.calculateChecksum(files, prismaSchema);

    // Get parent version (latest version of app)
    const appVersionIds = this.appVersions.get(appId) || [];
    const parentVersionId = appVersionIds.length > 0 ? appVersionIds[appVersionIds.length - 1] : undefined;

    const record: VersionRecord = {
      id,
      appId,
      version,
      timestamp: new Date().toISOString(),
      files,
      prismaSchema,
      metadata,
      checksum,
      changeDescription,
      parentVersionId,
    };

    this.versions.set(id, record);

    // Update app versions
    if (!this.appVersions.has(appId)) {
      this.appVersions.set(appId, []);
    }
    const versions = this.appVersions.get(appId);
    if (versions) {
      versions.push(id);
    }

    logger.info('VersionHistoryManager', 'VERSION_CREATED', 'New version created', {
      id,
      appId,
      version,
      parentVersionId,
    });

    return record;
  }

  /**
   * Get version by ID
   */
  getVersion(id: string): VersionRecord | undefined {
    return this.versions.get(id);
  }

  /**
   * Get version by app and version number
   */
  getVersionByNumber(appId: string, version: string): VersionRecord | undefined {
    for (const record of this.versions.values()) {
      if (record.appId === appId && record.version === version) {
        return record;
      }
    }
    return undefined;
  }

  /**
   * Get latest version for app
   */
  getLatestVersion(appId: string): VersionRecord | undefined {
    const versionIds = this.appVersions.get(appId);
    
    if (!versionIds || versionIds.length === 0) {
      return undefined;
    }

    const latestId = versionIds[versionIds.length - 1];
    if (!latestId) {
      return undefined;
    }
    return this.versions.get(latestId);
  }

  /**
   * List all versions for app
   */
  listVersions(appId: string): VersionRecord[] {
    const versionIds = this.appVersions.get(appId) || [];
    
    return versionIds
      .map(id => this.versions.get(id))
      .filter((v): v is VersionRecord => v !== undefined)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Compare two versions
   */
  compareVersions(versionId1: string, versionId2: string): VersionDiff {
    const version1 = this.versions.get(versionId1);
    const version2 = this.versions.get(versionId2);

    if (!version1 || !version2) {
      return {
        added: [],
        removed: [],
        modified: [],
        unchanged: [],
      };
    }

    const files1 = new Map(version1.files.map(f => [f.filePath, f.content]));
    const files2 = new Map(version2.files.map(f => [f.filePath, f.content]));

    const allPaths = new Set([...files1.keys(), ...files2.keys()]);

    const added: string[] = [];
    const removed: string[] = [];
    const modified: string[] = [];
    const unchanged: string[] = [];

    for (const path of allPaths) {
      const content1 = files1.get(path);
      const content2 = files2.get(path);

      if (content1 === undefined && content2 !== undefined) {
        added.push(path);
      } else if (content1 !== undefined && content2 === undefined) {
        removed.push(path);
      } else if (content1 !== undefined && content2 !== undefined) {
        if (content1 === content2) {
          unchanged.push(path);
        } else {
          modified.push(path);
        }
      }
    }

    return {
      added,
      removed,
      modified,
      unchanged,
    };
  }

  /**
   * Rollback to specific version
   */
  rollbackToVersion(versionId: string): { success: boolean; version?: VersionRecord; error?: string } {
    const version = this.versions.get(versionId);
    
    if (!version) {
      return {
        success: false,
        error: 'Version not found',
      };
    }

    logger.info('VersionHistoryManager', 'ROLLBACK_SUCCESS', 'Rolled back to version', {
      versionId,
      appId: version.appId,
      version: version.version,
    });

    return {
      success: true,
      version,
    };
  }

  /**
   * Delete version
   */
  deleteVersion(versionId: string): boolean {
    const version = this.versions.get(versionId);
    
    if (!version) {
      return false;
    }

    this.versions.delete(versionId);

    // Remove from app versions
    const appVersions = this.appVersions.get(version.appId);
    if (appVersions) {
      const index = appVersions.indexOf(versionId);
      if (index !== -1) {
        appVersions.splice(index, 1);
      }
    }

    logger.info('VersionHistoryManager', 'VERSION_DELETED', 'Version deleted', {
      versionId,
      appId: version.appId,
      version: version.version,
    });

    return true;
  }

  /**
   * Delete all versions for app
   */
  deleteVersionsForApp(appId: string): number {
    const versionIds = this.appVersions.get(appId) || [];
    
    for (const id of versionIds) {
      this.versions.delete(id);
    }

    this.appVersions.delete(appId);

    logger.info('VersionHistoryManager', 'APP_VERSIONS_DELETED', 'All versions deleted for app', {
      appId,
      count: versionIds.length,
    });

    return versionIds.length;
  }

  /**
   * Get version statistics
   */
  getStatistics(): {
    totalVersions: number;
    totalApps: number;
    versionsPerApp: Record<string, number>;
  } {
    const versionsPerApp: Record<string, number> = {};

    for (const [appId, versionIds] of this.appVersions.entries()) {
      versionsPerApp[appId] = versionIds.length;
    }

    return {
      totalVersions: this.versions.size,
      totalApps: this.appVersions.size,
      versionsPerApp,
    };
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
   * Get version lineage
   */
  getVersionLineage(versionId: string): VersionRecord[] {
    const lineage: VersionRecord[] = [];
    let currentId: string | undefined = versionId;

    while (currentId) {
      const version = this.versions.get(currentId);
      if (!version) {
        break;
      }

      lineage.unshift(version);
      currentId = version.parentVersionId;
    }

    return lineage;
  }

  /**
   * Export version as JSON
   */
  exportVersion(versionId: string): string | null {
    const version = this.versions.get(versionId);
    
    if (!version) {
      return null;
    }

    return JSON.stringify(version, null, 2);
  }

  /**
   * Import version from JSON
   */
  importVersion(json: string): { success: boolean; id?: string; error?: string } {
    try {
      const version = JSON.parse(json) as VersionRecord;
      
      // Validate structure
      if (!version.id || !version.appId || !version.version) {
        return {
          success: false,
          error: 'Invalid version record structure',
        };
      }

      this.versions.set(version.id, version);

      // Update app versions
      if (!this.appVersions.has(version.appId)) {
        this.appVersions.set(version.appId, []);
      }
      const versions = this.appVersions.get(version.appId);
      if (versions && !versions.includes(version.id)) {
        versions.push(version.id);
      }

      logger.info('VersionHistoryManager', 'VERSION_IMPORTED', 'Version imported', {
        id: version.id,
        appId: version.appId,
        version: version.version,
      });

      return {
        success: true,
        id: version.id,
      };
    } catch (error) {
      logger.error('VersionHistoryManager', 'IMPORT_FAILED', 'Failed to import version', {
        error: error instanceof Error ? error.message : String(error),
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Clear all version history
   */
  clearHistory(): void {
    this.versions.clear();
    this.appVersions.clear();
    
    logger.info('VersionHistoryManager', 'HISTORY_CLEARED', 'Version history cleared');
  }
}

export const versionHistoryManager = new VersionHistoryManager();

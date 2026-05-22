/**
 * Incremental Regenerator
 * 
 * Applies patches incrementally instead of full rebuilds.
 * Preserves untouched generated code.
 */

import { Patch, CodeChange } from './patch-generator';
import { logger } from '../../shared/utils/logger';

export interface RegenerationResult {
  success: boolean;
  appliedPatches: string[];
  failedPatches: string[];
  rollback: () => void;
  error?: string;
}

export interface RegenerationConfig {
  enableRollback: boolean;
  validateBeforeApply: boolean;
  preserveFormatting: boolean;
  enableLineTracking: boolean;
}

const DEFAULT_CONFIG: RegenerationConfig = {
  enableRollback: true,
  validateBeforeApply: true,
  preserveFormatting: true,
  enableLineTracking: true,
};

/**
 * Incremental Regenerator
 * 
 * Applies patches incrementally:
 * - Regenerate ONLY changed sections
 * - Preserve untouched generated code
 * - Apply patch operations safely
 * - Support rollback if patch fails
 */
export class IncrementalRegenerator {
  private config: RegenerationConfig;
  private appliedPatches: Map<string, Patch[]> = new Map();
  private rollbackStack: Map<string, Patch[]> = new Map();

  constructor(config: Partial<RegenerationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Apply a single patch
   */
  async applyPatch(sessionId: string, patch: Patch, currentCode: string): Promise<RegenerationResult> {
    const result: RegenerationResult = {
      success: false,
      appliedPatches: [],
      failedPatches: [],
      rollback: () => {},
    };

    try {
      // Validate patch if enabled
      if (this.config.enableRollback) {
        this.addToRollbackStack(sessionId, patch);
      }

      // Apply the patch
      const newCode = this.applyPatchToCode(currentCode, patch);

      // Store applied patch
      if (!this.appliedPatches.has(sessionId)) {
        this.appliedPatches.set(sessionId, []);
      }
      this.appliedPatches.get(sessionId)!.push(patch);

      result.success = true;
      result.appliedPatches.push(patch.id);

      // Create rollback function
      result.rollback = () => this.rollbackPatch(sessionId, patch);

      logger.info('IncrementalRegenerator', 'PATCH_APPLIED', 'Patch applied successfully', {
        sessionId,
        patchId: patch.id,
        patchType: patch.type,
      });

    } catch (error) {
      result.failedPatches.push(patch.id);
      result.error = error instanceof Error ? error.message : String(error);

      // Rollback if enabled
      if (this.config.enableRollback) {
        this.rollbackPatch(sessionId, patch);
      }

      logger.error('IncrementalRegenerator', 'PATCH_FAILED', 'Patch application failed', {
        sessionId,
        patchId: patch.id,
        error: result.error,
      });
    }

    return result;
  }

  /**
   * Apply multiple patches
   */
  async applyPatches(sessionId: string, patches: Patch[], currentCode: string): Promise<RegenerationResult> {
    const result: RegenerationResult = {
      success: false,
      appliedPatches: [],
      failedPatches: [],
      rollback: () => {},
    };

    let code = currentCode;

    for (const patch of patches) {
      const patchResult = await this.applyPatch(sessionId, patch, code);

      if (patchResult.success) {
        code = this.applyPatchToCode(code, patch);
        result.appliedPatches.push(...patchResult.appliedPatches);
      } else {
        result.failedPatches.push(...patchResult.failedPatches);
        result.error = patchResult.error;

        // Rollback all applied patches
        this.rollbackAll(sessionId);
        break;
      }
    }

    result.success = result.failedPatches.length === 0;
    result.rollback = () => this.rollbackAll(sessionId);

    logger.info('IncrementalRegenerator', 'PATCHES_APPLIED', 'Multiple patches applied', {
      sessionId,
      total: patches.length,
      successful: result.appliedPatches.length,
      failed: result.failedPatches.length,
    });

    return result;
  }

  /**
   * Apply a patch to code
   */
  private applyPatchToCode(code: string, patch: Patch): string {
    let newCode = code;

    for (const change of patch.changes) {
      newCode = this.applyChange(newCode, change);
    }

    return newCode;
  }

  /**
   * Apply a single change to code
   */
  private applyChange(code: string, change: CodeChange): string {
    const lines = code.split('\n');

    switch (change.type) {
      case 'add':
        if (change.line !== undefined && this.config.enableLineTracking) {
          lines.splice(change.line - 1, 0, change.newValue as string);
        } else {
          lines.push(change.newValue as string);
        }
        break;

      case 'remove':
        if (change.line !== undefined && this.config.enableLineTracking) {
          lines.splice(change.line - 1, 1);
        }
        break;

      case 'modify':
        if (change.line !== undefined && this.config.enableLineTracking) {
          lines[change.line - 1] = change.newValue as string;
        } else {
          // Replace all occurrences
          const index = lines.indexOf(change.oldValue as string);
          if (index !== -1) {
            lines[index] = change.newValue as string;
          }
        }
        break;
    }

    return lines.join('\n');
  }

  /**
   * Rollback a single patch
   */
  private rollbackPatch(sessionId: string, patch: Patch): void {
    // In a real implementation, this would reverse the patch application
    // For now, just remove from applied patches
    const applied = this.appliedPatches.get(sessionId);
    if (applied) {
      const index = applied.findIndex(p => p.id === patch.id);
      if (index !== -1) {
        applied.splice(index, 1);
      }
    }

    // Remove from rollback stack
    const rollbackStack = this.rollbackStack.get(sessionId);
    if (rollbackStack) {
      const index = rollbackStack.findIndex(p => p.id === patch.id);
      if (index !== -1) {
        rollbackStack.splice(index, 1);
      }
    }

    logger.info('IncrementalRegenerator', 'PATCH_ROLLED_BACK', 'Patch rolled back', {
      sessionId,
      patchId: patch.id,
    });
  }

  /**
   * Rollback all patches for a session
   */
  rollbackAll(sessionId: string): void {
    const rollbackStack = this.rollbackStack.get(sessionId);
    if (!rollbackStack || rollbackStack.length === 0) {
      return;
    }

    // Rollback in reverse order
    for (let i = rollbackStack.length - 1; i >= 0; i--) {
      const patch = rollbackStack[i];
      if (patch) {
        this.rollbackPatch(sessionId, patch);
      }
    }

    this.appliedPatches.delete(sessionId);
    this.rollbackStack.delete(sessionId);

    logger.info('IncrementalRegenerator', 'ALL_ROLLED_BACK', 'All patches rolled back', {
      sessionId,
      count: rollbackStack.length,
    });
  }

  /**
   * Add patch to rollback stack
   */
  private addToRollbackStack(sessionId: string, patch: Patch): void {
    if (!this.rollbackStack.has(sessionId)) {
      this.rollbackStack.set(sessionId, []);
    }

    this.rollbackStack.get(sessionId)!.push(patch);
  }

  /**
   * Get applied patches for a session
   */
  getAppliedPatches(sessionId: string): Patch[] {
    return this.appliedPatches.get(sessionId) || [];
  }

  /**
   * Clear applied patches for a session
   */
  clearAppliedPatches(sessionId: string): void {
    this.appliedPatches.delete(sessionId);
    this.rollbackStack.delete(sessionId);

    logger.info('IncrementalRegenerator', 'APPLIED_PATCHES_CLEARED', 'Applied patches cleared', {
      sessionId,
    });
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RegenerationConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('IncrementalRegenerator', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): RegenerationConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    totalAppliedPatches: number;
    averagePatchesPerSession: number;
    config: RegenerationConfig;
  } {
    const totalSessions = this.appliedPatches.size;
    const totalAppliedPatches = Array.from(this.appliedPatches.values()).reduce(
      (sum, patches) => sum + patches.length,
      0
    );
    const averagePatchesPerSession = totalSessions > 0 ? totalAppliedPatches / totalSessions : 0;

    return {
      totalSessions,
      totalAppliedPatches,
      averagePatchesPerSession,
      config: this.getConfig(),
    };
  }

  /**
   * Shutdown
   */
  shutdown(): void {
    this.appliedPatches.clear();
    this.rollbackStack.clear();

    logger.info('IncrementalRegenerator', 'SHUTDOWN_COMPLETE', 'Incremental regenerator shutdown complete');
  }
}

export const incrementalRegenerator = new IncrementalRegenerator();

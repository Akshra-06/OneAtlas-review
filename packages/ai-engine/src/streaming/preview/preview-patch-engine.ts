/**
 * Preview Patch Engine
 * 
 * Applies patches to the preview incrementally.
 * Supports safe patch application with rollback capability.
 */

import { PreviewPatch, PreviewComponent } from './partial-preview-renderer';
import { logger } from '../../shared/utils/logger';

export interface PatchOperation {
  type: 'insert' | 'update' | 'delete' | 'replace';
  path: string;
  value?: unknown;
  oldValue?: unknown;
}

export interface PatchResult {
  success: boolean;
  applied: boolean;
  rollback: () => void;
  error?: string;
}

/**
 * Preview Patch Engine
 * 
 * Applies patches to the preview:
 * - Insert new components
 * - Update existing components
 * - Delete components
 * - Replace entire sections
 * - Support rollback on failure
 */
export class PreviewPatchEngine {
  private patchHistory: Map<string, PatchOperation[]> = new Map();
  private maxHistorySize = 50;

  /**
   * Apply a patch operation
   */
  applyPatch(sessionId: string, operation: PatchOperation): PatchResult {
    const result: PatchResult = {
      success: false,
      applied: false,
      rollback: () => {},
    };

    try {
      // Apply the operation
      const success = this.applyOperation(operation);

      if (success) {
        result.success = true;
        result.applied = true;

        // Add to history
        this.addToHistory(sessionId, operation);

        // Create rollback function
        result.rollback = () => this.rollbackOperation(operation);

        logger.info('PreviewPatchEngine', 'PATCH_APPLIED', 'Patch applied successfully', {
          sessionId,
          operationType: operation.type,
          path: operation.path,
        });
      } else {
        result.error = 'Failed to apply patch operation';
        logger.error('PreviewPatchEngine', 'PATCH_FAILED', 'Patch operation failed', {
          sessionId,
          operationType: operation.type,
          path: operation.path,
        });
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      logger.error('PreviewPatchEngine', 'PATCH_ERROR', 'Patch error', {
        sessionId,
        error: result.error,
      });
    }

    return result;
  }

  /**
   * Apply multiple patch operations
   */
  applyPatches(sessionId: string, operations: PatchOperation[]): PatchResult[] {
    const results: PatchResult[] = [];

    for (const operation of operations) {
      const result = this.applyPatch(sessionId, operation);
      results.push(result);

      // Stop if a patch fails
      if (!result.success) {
        // Rollback previous successful patches
        for (let i = results.length - 2; i >= 0; i--) {
          const prevResult = results[i];
          if (prevResult && prevResult.success) {
            prevResult.rollback();
          }
        }
        break;
      }
    }

    logger.info('PreviewPatchEngine', 'PATCHES_APPLIED', 'Multiple patches applied', {
      sessionId,
      total: operations.length,
      successful: results.filter(r => r.success).length,
    });

    return results;
  }

  /**
   * Apply a single operation
   */
  private applyOperation(operation: PatchOperation): boolean {
    // In a real implementation, this would apply the operation to the actual preview
    // For now, simulate successful application
    return true;
  }

  /**
   * Rollback an operation
   */
  private rollbackOperation(operation: PatchOperation): void {
    // In a real implementation, this would rollback the operation
    // For now, simulate rollback
    logger.info('PreviewPatchEngine', 'OPERATION_ROLLED_BACK', 'Operation rolled back', {
      operationType: operation.type,
      path: operation.path,
    });
  }

  /**
   * Add operation to history
   */
  private addToHistory(sessionId: string, operation: PatchOperation): void {
    if (!this.patchHistory.has(sessionId)) {
      this.patchHistory.set(sessionId, []);
    }

    const history = this.patchHistory.get(sessionId)!;
    history.push(operation);

    // Limit history size
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }

  /**
   * Get patch history for a session
   */
  getHistory(sessionId: string): PatchOperation[] {
    return this.patchHistory.get(sessionId) || [];
  }

  /**
   * Clear patch history for a session
   */
  clearHistory(sessionId: string): void {
    this.patchHistory.delete(sessionId);

    logger.info('PreviewPatchEngine', 'HISTORY_CLEARED', 'Patch history cleared', {
      sessionId,
    });
  }

  /**
   * Rollback all patches for a session
   */
  rollbackAll(sessionId: string): void {
    const history = this.getHistory(sessionId);

    // Rollback in reverse order
    for (let i = history.length - 1; i >= 0; i--) {
      const operation = history[i];
      if (operation) {
        this.rollbackOperation(operation);
      }
    }

    this.clearHistory(sessionId);

    logger.info('PreviewPatchEngine', 'ALL_ROLLED_BACK', 'All patches rolled back', {
      sessionId,
      count: history.length,
    });
  }

  /**
   * Convert PreviewPatch to PatchOperation
   */
  previewPatchToOperation(patch: PreviewPatch): PatchOperation {
    const operation: PatchOperation = {
      type: patch.type === 'remove' ? 'delete' : patch.type === 'add' ? 'insert' : patch.type,
      path: patch.path,
      value: patch.data,
    };

    return operation;
  }

  /**
   * Convert PatchOperation to PreviewPatch
   */
  operationToPreviewPatch(operation: PatchOperation): PreviewPatch {
    const patch: PreviewPatch = {
      type: operation.type === 'delete' ? 'remove' : operation.type === 'insert' ? 'add' : operation.type as 'add' | 'update',
      path: operation.path,
      data: operation.value,
    };

    return patch;
  }

  /**
   * Validate a patch operation
   */
  validateOperation(operation: PatchOperation): { valid: boolean; error?: string } {
    if (!operation.path) {
      return { valid: false, error: 'Path is required' };
    }

    if (operation.type === 'insert' || operation.type === 'replace') {
      if (operation.value === undefined) {
        return { valid: false, error: 'Value is required for insert/replace operations' };
      }
    }

    return { valid: true };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    totalOperations: number;
    averageOperationsPerSession: number;
  } {
    const totalSessions = this.patchHistory.size;
    const totalOperations = Array.from(this.patchHistory.values()).reduce(
      (sum, history) => sum + history.length,
      0
    );
    const averageOperationsPerSession = totalSessions > 0 ? totalOperations / totalSessions : 0;

    return {
      totalSessions,
      totalOperations,
      averageOperationsPerSession,
    };
  }

  /**
   * Clear all history
   */
  clearAll(): void {
    this.patchHistory.clear();

    logger.info('PreviewPatchEngine', 'ALL_CLEARED', 'All patch history cleared');
  }
}

export const previewPatchEngine = new PreviewPatchEngine();

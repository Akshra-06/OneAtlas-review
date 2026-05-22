/**
 * Repair Undo System
 * 
 * Provides rollback functionality for repair operations.
 * Allows undoing individual or multiple repairs.
 */

import type { GeneratedFile } from '@oneatlas/shared';
import { repairHistoryTracker, type RepairRecord } from './repair-history';
import { logger } from '@oneatlas/shared';

export interface UndoOperation {
  id: string;
  timestamp: string;
  repairId: string;
  filePath: string;
  originalContent: string;
  currentContent: string;
  undone: boolean;
}

export interface UndoResult {
  success: boolean;
  undoneRepairs: string[];
  remainingRepairs: number;
  error?: string;
}

/**
 * Repair Undo System
 * 
 * Manages undo operations for repairs:
 * - Single repair undo
 * - Batch repair undo
 * - Undo stack management
 * - Undo history tracking
 */
export class RepairUndoSystem {
  private undoStack: UndoOperation[] = [];
  private maxUndoStackSize = 100;

  /**
   * Record a repair for potential undo
   */
  recordRepairForUndo(repairId: string, filePath: string, originalContent: string, currentContent: string): UndoOperation {
    const operation: UndoOperation = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      repairId,
      filePath,
      originalContent,
      currentContent,
      undone: false,
    };

    this.undoStack.push(operation);

    // Trim stack if needed
    if (this.undoStack.length > this.maxUndoStackSize) {
      this.undoStack.shift();
    }

    logger.info('RepairUndoSystem', 'REPAIR_RECORDED', 'Repair recorded for undo', {
      operationId: operation.id,
      repairId,
      filePath,
    });

    return operation;
  }

  /**
   * Undo a specific repair
   */
  undoRepair(repairId: string, files: GeneratedFile[]): UndoResult {
    const operation = this.undoStack.find(op => op.repairId === repairId && !op.undone);
    
    if (!operation) {
      logger.warn('RepairUndoSystem', 'UNDO_FAILED', 'Repair not found or already undone', { repairId });
      return {
        success: false,
        undoneRepairs: [],
        remainingRepairs: this.undoStack.filter(op => !op.undone).length,
        error: 'Repair not found or already undone',
      };
    }

    // Rollback using repair history
    const rollbackResult = repairHistoryTracker.rollbackRepair(repairId);
    
    if (!rollbackResult.success || !rollbackResult.originalContent) {
      return {
        success: false,
        undoneRepairs: [],
        remainingRepairs: this.undoStack.filter(op => !op.undone).length,
        error: 'Failed to rollback repair',
      };
    }

    // Update files
    const updatedFiles = this.applyUndoContent(files, operation.filePath, rollbackResult.originalContent);

    // Mark as undone
    operation.undone = true;

    logger.info('RepairUndoSystem', 'UNDO_SUCCESS', 'Repair undone successfully', {
      repairId,
      filePath: operation.filePath,
    });

    return {
      success: true,
      undoneRepairs: [repairId],
      remainingRepairs: this.undoStack.filter(op => !op.undone).length,
    };
  }

  /**
   * Undo all repairs for a specific file
   */
  undoRepairsForFile(filePath: string, files: GeneratedFile[]): UndoResult {
    const fileOperations = this.undoStack.filter(op => op.filePath === filePath && !op.undone);
    
    if (fileOperations.length === 0) {
      logger.warn('RepairUndoSystem', 'NO_REPAIRS', 'No repairs to undo for file', { filePath });
      return {
        success: false,
        undoneRepairs: [],
        remainingRepairs: this.undoStack.filter(op => !op.undone).length,
        error: 'No repairs to undo for file',
      };
    }

    // Get the earliest (original) content
    const originalContent = fileOperations[0]?.originalContent;
    if (!originalContent) {
      return {
        success: false,
        undoneRepairs: [],
        remainingRepairs: this.undoStack.filter(op => !op.undone).length,
        error: 'Could not retrieve original content',
      };
    }
    
    // Apply undo
    const updatedFiles = this.applyUndoContent(files, filePath, originalContent);

    // Mark all as undone
    for (const op of fileOperations) {
      op.undone = true;
    }

    const undoneRepairIds = fileOperations.map(op => op.repairId);

    logger.info('RepairUndoSystem', 'FILE_UNDO_SUCCESS', 'All repairs undone for file', {
      filePath,
      count: undoneRepairIds.length,
    });

    return {
      success: true,
      undoneRepairs: undoneRepairIds,
      remainingRepairs: this.undoStack.filter(op => !op.undone).length,
    };
  }

  /**
   * Undo all repairs (global undo)
   */
  undoAllRepairs(files: GeneratedFile[]): UndoResult {
    const pendingOperations = this.undoStack.filter(op => !op.undone);
    
    if (pendingOperations.length === 0) {
      logger.warn('RepairUndoSystem', 'NO_PENDING_UNDO', 'No pending repairs to undo');
      return {
        success: false,
        undoneRepairs: [],
        remainingRepairs: 0,
        error: 'No pending repairs to undo',
      };
    }

    // Group by file
    const fileGroups = new Map<string, UndoOperation[]>();
    for (const op of pendingOperations) {
      if (!fileGroups.has(op.filePath)) {
        fileGroups.set(op.filePath, []);
      }
      const group = fileGroups.get(op.filePath);
      if (group) {
        group.push(op);
      }
    }

    let updatedFiles = [...files];
    const undoneRepairIds: string[] = [];

    // Undo each file's repairs
    for (const [filePath, operations] of fileGroups.entries()) {
      if (operations.length === 0) continue;
      
      const originalContent = operations[0]?.originalContent;
      if (!originalContent) continue;
      
      updatedFiles = this.applyUndoContent(updatedFiles, filePath, originalContent);
      
      for (const op of operations) {
        op.undone = true;
        undoneRepairIds.push(op.repairId);
      }
    }

    logger.info('RepairUndoSystem', 'GLOBAL_UNDO_SUCCESS', 'All repairs undone', {
      count: undoneRepairIds.length,
    });

    return {
      success: true,
      undoneRepairs: undoneRepairIds,
      remainingRepairs: 0,
    };
  }

  /**
   * Undo recent N repairs
   */
  undoRecentRepairs(count: number, files: GeneratedFile[]): UndoResult {
    const pendingOperations = this.undoStack.filter(op => !op.undone).slice(-count);
    
    if (pendingOperations.length === 0) {
      return {
        success: false,
        undoneRepairs: [],
        remainingRepairs: this.undoStack.filter(op => !op.undone).length,
        error: 'No pending repairs to undo',
      };
    }

    let updatedFiles = [...files];
    const undoneRepairIds: string[] = [];

    for (const op of pendingOperations) {
      const rollbackResult = repairHistoryTracker.rollbackRepair(op.repairId);
      
      if (rollbackResult.success && rollbackResult.originalContent) {
        updatedFiles = this.applyUndoContent(updatedFiles, op.filePath, rollbackResult.originalContent);
        op.undone = true;
        undoneRepairIds.push(op.repairId);
      }
    }

    logger.info('RepairUndoSystem', 'RECENT_UNDO_SUCCESS', 'Recent repairs undone', {
      count: undoneRepairIds.length,
      requested: count,
    });

    return {
      success: true,
      undoneRepairs: undoneRepairIds,
      remainingRepairs: this.undoStack.filter(op => !op.undone).length,
    };
  }

  /**
   * Apply undo content to files
   */
  private applyUndoContent(files: GeneratedFile[], filePath: string, content: string): GeneratedFile[] {
    const fileIndex = files.findIndex(f => f.filePath === filePath);
    
    if (fileIndex === -1) {
      logger.warn('RepairUndoSystem', 'FILE_NOT_FOUND', 'File not found for undo', { filePath });
      return files;
    }

    const updatedFiles = [...files];
    const file = updatedFiles[fileIndex];
    
    if (!file || file.filePath === undefined) {
      return files;
    }

    updatedFiles[fileIndex] = {
      ...file,
      filePath: file.filePath,
      content,
    };

    return updatedFiles;
  }

  /**
   * Get pending undo operations
   */
  getPendingUndoOperations(): UndoOperation[] {
    return this.undoStack.filter(op => !op.undone);
  }

  /**
   * Get undo operations for a file
   */
  getUndoOperationsForFile(filePath: string): UndoOperation[] {
    return this.undoStack.filter(op => op.filePath === filePath);
  }

  /**
   * Get undo history
   */
  getUndoHistory(): UndoOperation[] {
    return [...this.undoStack];
  }

  /**
   * Clear undo stack
   */
  clearUndoStack(): void {
    this.undoStack = [];
    logger.info('RepairUndoSystem', 'STACK_CLEARED', 'Undo stack cleared');
  }

  /**
   * Set max undo stack size
   */
  setMaxUndoStackSize(size: number): void {
    this.maxUndoStackSize = Math.max(1, size);
    
    if (this.undoStack.length > this.maxUndoStackSize) {
      this.undoStack = this.undoStack.slice(-this.maxUndoStackSize);
    }

    logger.info('RepairUndoSystem', 'MAX_SIZE_UPDATED', 'Max undo stack size updated', {
      maxSize: this.maxUndoStackSize,
    });
  }

  /**
   * Get undo stack size
   */
  getUndoStackSize(): number {
    return this.undoStack.length;
  }

  /**
   * Get pending undo count
   */
  getPendingUndoCount(): number {
    return this.undoStack.filter(op => !op.undone).length;
  }
}

export const repairUndoSystem = new RepairUndoSystem();

/**
 * Repair History Tracker
 * 
 * Tracks all repair operations for audit and rollback purposes.
 * Provides a complete history of repairs with before/after states.
 */

import type { GeneratedFile } from '@oneatlas/shared';
import { logger } from '@oneatlas/shared';

export interface RepairRecord {
  id: string;
  timestamp: string;
  issueId: string;
  issueCode: string;
  issueStage: string;
  issueSeverity: string;
  filePath: string;
  originalContent: string;
  repairedContent: string;
  success: boolean;
  confidence: number;
  durationMs: number;
  repairStrategy: string;
}

export interface RepairHistorySummary {
  totalRepairs: number;
  successfulRepairs: number;
  failedRepairs: number;
  averageConfidence: number;
  averageDurationMs: number;
  byStage: Record<string, number>;
  bySeverity: Record<string, number>;
  byCode: Record<string, number>;
}

/**
 * Repair History Tracker
 * 
 * Tracks all repair operations with:
 * - Before/after content states
 * - Success/failure status
 * - Confidence scores
 * - Duration metrics
 * - Repair strategy used
 */
export class RepairHistoryTracker {
  private history: RepairRecord[] = [];
  private maxHistorySize = 1000; // Keep last 1000 repairs

  /**
   * Record a repair operation
   */
  recordRepair(record: Omit<RepairRecord, 'id' | 'timestamp'>): RepairRecord {
    const fullRecord: RepairRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      ...record,
    };

    this.history.push(fullRecord);

    // Trim history if needed
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    logger.info('RepairHistoryTracker', 'REPAIR_RECORDED', 'Repair operation recorded', {
      repairId: fullRecord.id,
      issueCode: fullRecord.issueCode,
      success: fullRecord.success,
      confidence: fullRecord.confidence,
    });

    return fullRecord;
  }

  /**
   * Get repair history for a specific file
   */
  getHistoryForFile(filePath: string): RepairRecord[] {
    return this.history.filter(r => r.filePath === filePath);
  }

  /**
   * Get repair history for a specific issue code
   */
  getHistoryForCode(issueCode: string): RepairRecord[] {
    return this.history.filter(r => r.issueCode === issueCode);
  }

  /**
   * Get repair history for a specific issue ID
   */
  getHistoryForIssue(issueId: string): RepairRecord[] {
    return this.history.filter(r => r.issueId === issueId);
  }

  /**
   * Get recent repairs
   */
  getRecentRepairs(limit: number = 10): RepairRecord[] {
    return this.history.slice(-limit).reverse();
  }

  /**
   * Get repair history summary
   */
  getSummary(): RepairHistorySummary {
    const totalRepairs = this.history.length;
    const successfulRepairs = this.history.filter(r => r.success).length;
    const failedRepairs = totalRepairs - successfulRepairs;

    const averageConfidence = totalRepairs > 0
      ? this.history.reduce((sum, r) => sum + r.confidence, 0) / totalRepairs
      : 0;

    const averageDurationMs = totalRepairs > 0
      ? this.history.reduce((sum, r) => sum + r.durationMs, 0) / totalRepairs
      : 0;

    const byStage: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byCode: Record<string, number> = {};

    for (const record of this.history) {
      byStage[record.issueStage] = (byStage[record.issueStage] || 0) + 1;
      bySeverity[record.issueSeverity] = (bySeverity[record.issueSeverity] || 0) + 1;
      byCode[record.issueCode] = (byCode[record.issueCode] || 0) + 1;
    }

    return {
      totalRepairs,
      successfulRepairs,
      failedRepairs,
      averageConfidence,
      averageDurationMs,
      byStage,
      bySeverity,
      byCode,
    };
  }

  /**
   * Get repair record by ID
   */
  getRepairById(id: string): RepairRecord | undefined {
    return this.history.find(r => r.id === id);
  }

  /**
   * Get original content before repair
   */
  getOriginalContent(repairId: string): string | undefined {
    const record = this.getRepairById(repairId);
    return record?.originalContent;
  }

  /**
   * Get repaired content
   */
  getRepairedContent(repairId: string): string | undefined {
    const record = this.getRepairById(repairId);
    return record?.repairedContent;
  }

  /**
   * Rollback a repair (return to original content)
   */
  rollbackRepair(repairId: string): { success: boolean; originalContent?: string } {
    const record = this.getRepairById(repairId);
    if (!record) {
      logger.warn('RepairHistoryTracker', 'ROLLBACK_FAILED', 'Repair record not found', { repairId });
      return { success: false };
    }

    logger.info('RepairHistoryTracker', 'ROLLBACK_SUCCESS', 'Repair rolled back', {
      repairId,
      filePath: record.filePath,
    });

    return {
      success: true,
      originalContent: record.originalContent,
    };
  }

  /**
   * Clear repair history
   */
  clearHistory(): void {
    this.history = [];
    logger.info('RepairHistoryTracker', 'HISTORY_CLEARED', 'Repair history cleared');
  }

  /**
   * Export repair history as JSON
   */
  exportHistory(): string {
    return JSON.stringify(this.history, null, 2);
  }

  /**
   * Import repair history from JSON
   */
  importHistory(json: string): { success: boolean; count: number } {
    try {
      const imported = JSON.parse(json) as RepairRecord[];
      
      // Validate structure
      if (!Array.isArray(imported)) {
        throw new Error('Invalid format: expected array');
      }

      this.history = imported.slice(0, this.maxHistorySize);
      
      logger.info('RepairHistoryTracker', 'HISTORY_IMPORTED', 'Repair history imported', {
        count: this.history.length,
      });

      return { success: true, count: this.history.length };
    } catch (error) {
      logger.error('RepairHistoryTracker', 'IMPORT_FAILED', 'Failed to import repair history', {
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false, count: 0 };
    }
  }

  /**
   * Get history size
   */
  getHistorySize(): number {
    return this.history.length;
  }

  /**
   * Set max history size
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = Math.max(1, size);
    
    // Trim if needed
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }

    logger.info('RepairHistoryTracker', 'MAX_SIZE_UPDATED', 'Max history size updated', {
      maxSize: this.maxHistorySize,
    });
  }
}

export const repairHistoryTracker = new RepairHistoryTracker();

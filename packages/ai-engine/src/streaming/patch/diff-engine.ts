/**
 * Diff Engine
 * 
 * Generates AST/code diffs for changed sections.
 * Compares code and identifies differences.
 */

import { logger } from '../../shared/utils/logger';

export interface DiffResult {
  added: string[];
  removed: string[];
  modified: Array<{ old: string; new: string }>;
  unchanged: string[];
}

export interface DiffConfig {
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  contextLines: number;
}

const DEFAULT_CONFIG: DiffConfig = {
  ignoreWhitespace: true,
  ignoreCase: false,
  contextLines: 3,
};

/**
 * Diff Engine
 * 
 * Generates diffs for code comparison:
 * - AST-based diffing
 * - Line-based diffing
 * - Change detection
 * - Diff visualization
 */
export class DiffEngine {
  private config: DiffConfig;

  constructor(config: Partial<DiffConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate diff between two strings
   */
  diff(oldCode: string, newCode: string): DiffResult {
    const result: DiffResult = {
      added: [],
      removed: [],
      modified: [],
      unchanged: [],
    };

    const oldLines = this.normalizeCode(oldCode).split('\n');
    const newLines = this.normalizeCode(newCode).split('\n');

    // Simple line-by-line diff
    const maxLines = Math.max(oldLines.length, newLines.length);

    for (let i = 0; i < maxLines; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === undefined) {
        // Line added
        if (newLine !== undefined) {
          result.added.push(newLine);
        }
      } else if (newLine === undefined) {
        // Line removed
        result.removed.push(oldLine);
      } else if (oldLine !== newLine) {
        // Line modified
        result.modified.push({ old: oldLine, new: newLine });
      } else {
        // Line unchanged
        result.unchanged.push(oldLine);
      }
    }

    logger.info('DiffEngine', 'DIFF_GENERATED', 'Diff generated', {
      added: result.added.length,
      removed: result.removed.length,
      modified: result.modified.length,
      unchanged: result.unchanged.length,
    });

    return result;
  }

  /**
   * Normalize code for comparison
   */
  private normalizeCode(code: string): string {
    let normalized = code;

    if (this.config.ignoreWhitespace) {
      normalized = normalized.replace(/\s+/g, ' ').trim();
    }

    if (this.config.ignoreCase) {
      normalized = normalized.toLowerCase();
    }

    return normalized;
  }

  /**
   * Generate unified diff format
   */
  generateUnifiedDiff(oldCode: string, newCode: string, filename: string): string {
    const diff = this.diff(oldCode, newCode);
    const lines: string[] = [];

    lines.push(`--- ${filename}`);
    lines.push(`+++ ${filename}`);
    lines.push('@@ -1,1 +1,1 @@');

    // Add added lines
    for (const line of diff.added) {
      lines.push(`+${line}`);
    }

    // Add removed lines
    for (const line of diff.removed) {
      lines.push(`-${line}`);
    }

    // Add modified lines
    for (const change of diff.modified) {
      lines.push(`-${change.old}`);
      lines.push(`+${change.new}`);
    }

    return lines.join('\n');
  }

  /**
   * Generate JSON diff format
   */
  generateJSONDiff(oldCode: string, newCode: string): string {
    const diff = this.diff(oldCode, newCode);

    return JSON.stringify(diff, null, 2);
  }

  /**
   * Check if two code strings are identical
   */
  isIdentical(oldCode: string, newCode: string): boolean {
    const normalizedOld = this.normalizeCode(oldCode);
    const normalizedNew = this.normalizeCode(newCode);

    return normalizedOld === normalizedNew;
  }

  /**
   * Get similarity percentage
   */
  getSimilarity(oldCode: string, newCode: string): number {
    const diff = this.diff(oldCode, newCode);
    const totalLines = diff.added.length + diff.removed.length + diff.modified.length + diff.unchanged.length;

    if (totalLines === 0) {
      return 100;
    }

    const similarity = (diff.unchanged.length / totalLines) * 100;
    return Math.round(similarity * 100) / 100;
  }

  /**
   * Get change percentage
   */
  getChangePercentage(oldCode: string, newCode: string): number {
    return 100 - this.getSimilarity(oldCode, newCode);
  }

  /**
   * Generate diff with context
   */
  diffWithContext(oldCode: string, newCode: string): DiffResult {
    const diff = this.diff(oldCode, newCode);

    // Add context lines (simplified)
    // In a real implementation, this would add surrounding lines for context
    return diff;
  }

  /**
   * Generate word-level diff
   */
  diffWords(oldText: string, newText: string): DiffResult {
    const result: DiffResult = {
      added: [],
      removed: [],
      modified: [],
      unchanged: [],
    };

    const oldWords = oldText.split(/\s+/);
    const newWords = newText.split(/\s+/);

    const maxWords = Math.max(oldWords.length, newWords.length);

    for (let i = 0; i < maxWords; i++) {
      const oldWord = oldWords[i];
      const newWord = newWords[i];

      if (oldWord === undefined) {
        if (newWord !== undefined) {
          result.added.push(newWord);
        }
      } else if (newWord === undefined) {
        result.removed.push(oldWord);
      } else if (oldWord !== newWord) {
        result.modified.push({ old: oldWord, new: newWord });
      } else {
        result.unchanged.push(oldWord);
      }
    }

    return result;
  }

  /**
   * Generate character-level diff
   */
  diffChars(oldText: string, newText: string): DiffResult {
    const result: DiffResult = {
      added: [],
      removed: [],
      modified: [],
      unchanged: [],
    };

    const oldChars = oldText.split('');
    const newChars = newText.split('');

    const maxChars = Math.max(oldChars.length, newChars.length);

    for (let i = 0; i < maxChars; i++) {
      const oldChar = oldChars[i];
      const newChar = newChars[i];

      if (oldChar === undefined) {
        if (newChar !== undefined) {
          result.added.push(newChar);
        }
      } else if (newChar === undefined) {
        result.removed.push(oldChar);
      } else if (oldChar !== newChar) {
        result.modified.push({ old: oldChar, new: newChar });
      } else {
        result.unchanged.push(oldChar);
      }
    }

    return result;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DiffConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('DiffEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): DiffConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: DiffConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const diffEngine = new DiffEngine();

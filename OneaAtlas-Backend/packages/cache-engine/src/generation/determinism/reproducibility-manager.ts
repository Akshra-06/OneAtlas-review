/**
 * Reproducibility Manager
 * 
 * Ensures reproducible outputs for the same inputs.
 * Validates that same inputs produce same outputs.
 */

import { logger } from '../../shared/utils/logger';
import { seedManager } from './seed-manager';

export interface InputHash {
  hash: string;
  timestamp: string;
  inputs: Record<string, unknown>;
  seed: string;
}

export interface OutputRecord {
  inputHash: string;
  outputHash: string;
  timestamp: string;
  output: unknown;
  reproducible: boolean;
}

export interface ReproducibilityConfig {
  enableValidation: boolean;
  strictMode: boolean;
  maxHistorySize: number;
}

const DEFAULT_CONFIG: ReproducibilityConfig = {
  enableValidation: true,
  strictMode: false,
  maxHistorySize: 1000,
};

/**
 * Reproducibility Manager
 * 
 * Ensures reproducible outputs:
 * - Input hashing
 * - Output tracking
 * - Reproducibility validation
 * - Drift detection
 */
export class ReproducibilityManager {
  private config: ReproducibilityConfig;
  private inputHistory: Map<string, InputHash> = new Map();
  private outputHistory: Map<string, OutputRecord[]> = new Map();

  constructor(config: Partial<ReproducibilityConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Compute hash of inputs
   */
  computeInputHash(inputs: Record<string, unknown>): string {
    const sortedInputs = this.sortObjectKeys(inputs);
    const inputString = JSON.stringify(sortedInputs);
    return this.hashString(inputString);
  }

  /**
   * Compute hash of outputs
   */
  computeOutputHash(output: unknown): string {
    const outputString = JSON.stringify(output);
    return this.hashString(outputString);
  }

  /**
   * Record input hash
   */
  recordInput(inputs: Record<string, unknown>, seed: string): InputHash {
    const hash = this.computeInputHash(inputs);
    
    const record: InputHash = {
      hash,
      timestamp: new Date().toISOString(),
      inputs,
      seed,
    };

    this.inputHistory.set(hash, record);

    logger.info('ReproducibilityManager', 'INPUT_RECORDED', 'Input hash recorded', {
      hash,
      seed,
    });

    return record;
  }

  /**
   * Record output for input
   */
  recordOutput(inputHash: string, output: unknown): OutputRecord {
    const outputHash = this.computeOutputHash(output);
    
    const record: OutputRecord = {
      inputHash,
      outputHash,
      timestamp: new Date().toISOString(),
      output,
      reproducible: this.validateReproducibility(inputHash, outputHash),
    };

    if (!this.outputHistory.has(inputHash)) {
      this.outputHistory.set(inputHash, []);
    }

    const history = this.outputHistory.get(inputHash);
    if (history) {
      history.push(record);

      // Trim history if needed
      if (history.length > this.config.maxHistorySize) {
        history.shift();
      }
    }

    logger.info('ReproducibilityManager', 'OUTPUT_RECORDED', 'Output recorded', {
      inputHash,
      outputHash,
      reproducible: record.reproducible,
    });

    return record;
  }

  /**
   * Validate reproducibility
   */
  validateReproducibility(inputHash: string, outputHash: string): boolean {
    const history = this.outputHistory.get(inputHash);
    
    if (!history || history.length === 0) {
      return true; // First output for this input
    }

    const lastRecord = history[history.length - 1];
    if (!lastRecord) {
      return true;
    }

    const matches = lastRecord.outputHash === outputHash;

    if (this.config.enableValidation && !matches) {
      logger.error('ReproducibilityManager', 'REPRODUCIBILITY_VIOLATION', 'Output differs for same input', {
        inputHash,
        previousHash: lastRecord.outputHash,
        currentHash: outputHash,
      });

      if (this.config.strictMode) {
        throw new Error('Reproducibility violation detected in strict mode');
      }
    }

    return matches;
  }

  /**
   * Check if inputs are reproducible
   */
  isReproducible(inputs: Record<string, unknown>, expectedOutput: unknown): boolean {
    const inputHash = this.computeInputHash(inputs);
    const outputHash = this.computeOutputHash(expectedOutput);
    
    return this.validateReproducibility(inputHash, outputHash);
  }

  /**
   * Get output history for input
   */
  getOutputHistory(inputs: Record<string, unknown>): OutputRecord[] {
    const inputHash = this.computeInputHash(inputs);
    return this.outputHistory.get(inputHash) || [];
  }

  /**
   * Get input record
   */
  getInputRecord(inputs: Record<string, unknown>): InputHash | undefined {
    const hash = this.computeInputHash(inputs);
    return this.inputHistory.get(hash);
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.inputHistory.clear();
    this.outputHistory.clear();
    
    logger.info('ReproducibilityManager', 'HISTORY_CLEARED', 'History cleared');
  }

  /**
   * Hash string
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Sort object keys for consistent hashing
   */
  private sortObjectKeys(obj: unknown): unknown {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }

    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(obj).sort();
    
    for (const key of keys) {
      sorted[key] = this.sortObjectKeys((obj as Record<string, unknown>)[key]);
    }

    return sorted;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ReproducibilityConfig>): void {
    this.config = { ...this.config, ...config };
    
    logger.info('ReproducibilityManager', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ReproducibilityConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalInputs: number;
    totalOutputs: number;
    reproducibleOutputs: number;
    nonReproducibleOutputs: number;
  } {
    let totalOutputs = 0;
    let reproducibleOutputs = 0;
    let nonReproducibleOutputs = 0;

    for (const history of this.outputHistory.values()) {
      for (const record of history) {
        totalOutputs++;
        if (record.reproducible) {
          reproducibleOutputs++;
        } else {
          nonReproducibleOutputs++;
        }
      }
    }

    return {
      totalInputs: this.inputHistory.size,
      totalOutputs,
      reproducibleOutputs,
      nonReproducibleOutputs,
    };
  }

  /**
   * Generate reproducibility report
   */
  generateReport(): string {
    const stats = this.getStatistics();
    const reproducibilityRate = stats.totalOutputs > 0
      ? (stats.reproducibleOutputs / stats.totalOutputs * 100).toFixed(2)
      : '0.00';

    return `
Reproducibility Report
======================
Total Inputs: ${stats.totalInputs}
Total Outputs: ${stats.totalOutputs}
Reproducible Outputs: ${stats.reproducibleOutputs}
Non-Reproducible Outputs: ${stats.nonReproducibleOutputs}
Reproducibility Rate: ${reproducibilityRate}%
    `.trim();
  }
}

export const reproducibilityManager = new ReproducibilityManager();

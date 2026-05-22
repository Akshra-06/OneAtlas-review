/**
 * Drift Detection
 * 
 * Detects when outputs change over time for the same inputs.
 * Alerts when deterministic outputs drift from expected values.
 */

import { logger } from '../../shared/utils/logger';
import { reproducibilityManager } from './reproducibility-manager';

export interface DriftRecord {
  inputHash: string;
  expectedHash: string;
  actualHash: string;
  timestamp: string;
  driftDetected: boolean;
  driftSeverity: 'none' | 'minor' | 'moderate' | 'major';
  driftDetails?: string;
}

export interface DriftConfig {
  enableDetection: boolean;
  alertOnDrift: boolean;
  maxDriftHistory: number;
  sensitivity: 'low' | 'medium' | 'high';
}

const DEFAULT_CONFIG: DriftConfig = {
  enableDetection: true,
  alertOnDrift: true,
  maxDriftHistory: 100,
  sensitivity: 'medium',
};

/**
 * Drift Detection
 * 
 * Detects output drift:
 * - Hash comparison
 * - Drift severity assessment
 * - Alert generation
 * - History tracking
 */
export class DriftDetection {
  private config: DriftConfig;
  private driftHistory: Map<string, DriftRecord[]> = new Map();

  constructor(config: Partial<DriftConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Check for drift in output
   */
  checkDrift(inputs: Record<string, unknown>, output: unknown): DriftRecord {
    const inputHash = reproducibilityManager.computeInputHash(inputs);
    const actualHash = reproducibilityManager.computeOutputHash(output);
    
    // Get expected hash from history
    const history = this.driftHistory.get(inputHash);
    const expectedHash = history && history.length > 0 && history[0] !== undefined
      ? history[0].expectedHash 
      : actualHash; // First run, use current as expected

    const driftDetected = expectedHash !== actualHash;
    const driftSeverity = this.assessDriftSeverity(expectedHash, actualHash);
    const driftDetails = driftDetected 
      ? this.generateDriftDetails(expectedHash, actualHash)
      : undefined;

    const record: DriftRecord = {
      inputHash,
      expectedHash,
      actualHash,
      timestamp: new Date().toISOString(),
      driftDetected,
      driftSeverity,
      driftDetails,
    };

    // Record drift
    if (!this.driftHistory.has(inputHash)) {
      this.driftHistory.set(inputHash, []);
    }

    const inputHistory = this.driftHistory.get(inputHash);
    if (inputHistory) {
      inputHistory.push(record);

      // Trim history
      if (inputHistory.length > this.config.maxDriftHistory) {
        inputHistory.shift();
      }
    }

    // Alert if drift detected
    if (this.config.enableDetection && driftDetected && this.config.alertOnDrift) {
      this.alertDrift(record);
    }

    logger.info('DriftDetection', 'DRIFT_CHECK', 'Drift check complete', {
      inputHash,
      driftDetected,
      driftSeverity,
    });

    return record;
  }

  /**
   * Assess drift severity
   */
  private assessDriftSeverity(expectedHash: string, actualHash: string): DriftRecord['driftSeverity'] {
    if (expectedHash === actualHash) {
      return 'none';
    }

    // Simple hash difference assessment
    const expected = parseInt(expectedHash, 36);
    const actual = parseInt(actualHash, 36);
    const difference = Math.abs(expected - actual);

    if (difference < 1000) {
      return 'minor';
    } else if (difference < 10000) {
      return 'moderate';
    } else {
      return 'major';
    }
  }

  /**
   * Generate drift details
   */
  private generateDriftDetails(expectedHash: string, actualHash: string): string {
    return `Expected hash: ${expectedHash}, Actual hash: ${actualHash}`;
  }

  /**
   * Alert on drift
   */
  private alertDrift(record: DriftRecord): void {
    logger.warn('DriftDetection', 'DRIFT_DETECTED', 'Output drift detected', {
      inputHash: record.inputHash,
      expectedHash: record.expectedHash,
      actualHash: record.actualHash,
      severity: record.driftSeverity,
      details: record.driftDetails,
    });
  }

  /**
   * Get drift history for input
   */
  getDriftHistory(inputs: Record<string, unknown>): DriftRecord[] {
    const inputHash = reproducibilityManager.computeInputHash(inputs);
    return this.driftHistory.get(inputHash) || [];
  }

  /**
   * Get all drift records
   */
  getAllDriftRecords(): DriftRecord[] {
    const allRecords: DriftRecord[] = [];
    
    for (const history of this.driftHistory.values()) {
      allRecords.push(...history);
    }

    return allRecords.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Get drift records with drift detected
   */
  getDriftDetectedRecords(): DriftRecord[] {
    return this.getAllDriftRecords().filter(r => r.driftDetected);
  }

  /**
   * Get drift statistics
   */
  getStatistics(): {
    totalChecks: number;
    driftDetected: number;
    driftRate: number;
    bySeverity: Record<string, number>;
  } {
    const allRecords = this.getAllDriftRecords();
    const driftDetected = allRecords.filter(r => r.driftDetected).length;
    
    const bySeverity: Record<string, number> = {
      none: 0,
      minor: 0,
      moderate: 0,
      major: 0,
    };

    for (const record of allRecords) {
      bySeverity[record.driftSeverity] = (bySeverity[record.driftSeverity] || 0) + 1;
    }

    return {
      totalChecks: allRecords.length,
      driftDetected,
      driftRate: allRecords.length > 0 ? (driftDetected / allRecords.length) * 100 : 0,
      bySeverity,
    };
  }

  /**
   * Clear drift history
   */
  clearHistory(): void {
    this.driftHistory.clear();
    
    logger.info('DriftDetection', 'HISTORY_CLEARED', 'Drift history cleared');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DriftConfig>): void {
    this.config = { ...this.config, ...config };
    
    logger.info('DriftDetection', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): DriftConfig {
    return { ...this.config };
  }

  /**
   * Set expected hash for input
   */
  setExpectedHash(inputs: Record<string, unknown>, expectedHash: string): void {
    const inputHash = reproducibilityManager.computeInputHash(inputs);
    
    if (!this.driftHistory.has(inputHash)) {
      this.driftHistory.set(inputHash, []);
    }

    const history = this.driftHistory.get(inputHash);
    if (history && history.length > 0 && history[0] !== undefined) {
      history[0].expectedHash = expectedHash;
    }

    logger.info('DriftDetection', 'EXPECTED_HASH_SET', 'Expected hash set', {
      inputHash,
      expectedHash,
    });
  }

  /**
   * Generate drift report
   */
  generateReport(): string {
    const stats = this.getStatistics();
    const driftRecords = this.getDriftDetectedRecords();

    let report = `
Drift Detection Report
======================
Total Checks: ${stats.totalChecks}
Drift Detected: ${stats.driftDetected}
Drift Rate: ${stats.driftRate.toFixed(2)}%

Severity Breakdown:
- None: ${stats.bySeverity.none}
- Minor: ${stats.bySeverity.minor}
- Moderate: ${stats.bySeverity.moderate}
- Major: ${stats.bySeverity.major}
`;

    if (driftRecords.length > 0) {
      report += '\nRecent Drifts:\n';
      for (const record of driftRecords.slice(0, 10)) {
        report += `- ${record.timestamp}: ${record.driftSeverity} (${record.inputHash})\n`;
      }
    }

    return report.trim();
  }
}

export const driftDetection = new DriftDetection();

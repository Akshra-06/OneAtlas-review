/**
 * Repair Confidence Scoring
 * 
 * Provides confidence scores (0-100) for repair operations.
 * Helps determine whether auto-repair should be attempted.
 */

import type { OrchestrationResult } from '../orchestrator/validation.orchestrator';
import { logger } from '@oneatlas/shared';

export interface ValidationIssue {
  id: string;
  stage: string;
  severity: string;
  code?: string;
  message: string;
  filePath?: string;
  line?: number;
}

export interface RepairConfidenceResult {
  issueId: string;
  confidence: number; // 0-100
  shouldAttempt: boolean;
  reason: string;
}

export interface RepairConfidenceConfig {
  confidenceThreshold: number; // Minimum confidence to attempt repair
  stageWeights: Record<string, number>; // Weight different stages differently
  severityWeights: Record<string, number>; // Weight different severities differently
}

const DEFAULT_CONFIG: RepairConfidenceConfig = {
  confidenceThreshold: 70,
  stageWeights: {
    preview: 0.9,
    compile: 0.7,
    component: 0.8,
    semantic: 0.6,
    accessibility: 0.5,
    performance: 0.4,
  },
  severityWeights: {
    critical: 0.5,
    error: 0.7,
    warning: 0.9,
    info: 0.95,
  },
};

/**
 * Repair Confidence Scorer
 * 
 * Calculates confidence scores for repair operations based on:
 * - Issue type and stage
 * - Severity level
 * - Repair history
 * - Code complexity
 * - Known repair patterns
 */
export class RepairConfidenceScorer {
  private config: RepairConfidenceConfig;
  private repairHistory: Map<string, { success: boolean; confidence: number }[]> = new Map();

  constructor(config: Partial<RepairConfidenceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Calculate confidence score for a repair operation
   */
  calculateConfidence(issue: ValidationIssue): RepairConfidenceResult {
    let confidence = 100;

    // Apply stage weight
    const stageWeight = this.config.stageWeights[issue.stage] || 0.5;
    confidence *= stageWeight;

    // Apply severity weight
    const severityWeight = this.config.severityWeights[issue.severity] || 0.5;
    confidence *= severityWeight;

    // Adjust based on repair history
    const history = this.repairHistory.get(issue.code || 'unknown') || [];
    if (history.length > 0) {
      const successRate = history.filter(h => h.success).length / history.length;
      confidence *= (0.5 + successRate * 0.5); // Scale between 0.5 and 1.0
    }

    // Adjust based on issue-specific patterns
    confidence *= this.getPatternConfidence(issue);

    // Clamp to 0-100
    confidence = Math.max(0, Math.min(100, confidence));

    const shouldAttempt = confidence >= this.config.confidenceThreshold;
    const reason = this.getReason(confidence, issue);

    logger.info('RepairConfidenceScorer', 'CONFIDENCE_CALCULATED', `Confidence: ${confidence.toFixed(1)}%`, {
      issueId: issue.id,
      stage: issue.stage,
      severity: issue.severity,
      shouldAttempt,
    });

    return {
      issueId: issue.id,
      confidence: Math.round(confidence),
      shouldAttempt,
      reason,
    };
  }

  /**
   * Calculate confidence scores for multiple issues
   */
  calculateBatchConfidence(issues: ValidationIssue[]): RepairConfidenceResult[] {
    return issues.map(issue => this.calculateConfidence(issue));
  }

  /**
   * Get pattern-based confidence adjustment
   */
  private getPatternConfidence(issue: ValidationIssue): number {
    const code = issue.code || '';
    
    // High confidence patterns
    const highConfidencePatterns = [
      'missing_use_client',
      'invalid_import',
      'missing_export',
      'unused_import',
      'empty_alt_text',
      'missing_lang',
    ];

    // Low confidence patterns
    const lowConfidencePatterns = [
      'server_client_violation',
      'broken_async',
      'circular_dependency',
      'business_logic',
    ];

    if (highConfidencePatterns.includes(code)) {
      return 1.0;
    }

    if (lowConfidencePatterns.includes(code)) {
      return 0.5;
    }

    return 0.8; // Default
  }

  /**
   * Get reason for confidence decision
   */
  private getReason(confidence: number, issue: ValidationIssue): string {
    if (confidence >= 90) {
      return 'High confidence - repair pattern well understood';
    } else if (confidence >= 70) {
      return 'Moderate confidence - repair likely to succeed';
    } else if (confidence >= 50) {
      return 'Low confidence - repair may fail';
    } else {
      return 'Very low confidence - repair not recommended';
    }
  }

  /**
   * Record repair result for learning
   */
  recordRepairResult(issueCode: string, success: boolean, confidence: number): void {
    if (!this.repairHistory.has(issueCode)) {
      this.repairHistory.set(issueCode, []);
    }

    const history = this.repairHistory.get(issueCode);
    if (history) {
      history.push({ success, confidence });

      // Keep only last 10 results
      if (history.length > 10) {
        history.shift();
      }
    }

    logger.info('RepairConfidenceScorer', 'REPAIR_RECORDED', `Repair result recorded`, {
      issueCode,
      success,
      confidence,
      historySize: history?.length || 0,
    });
  }

  /**
   * Get repair statistics
   */
  getRepairStatistics(): {
    totalRepairs: number;
    successRate: number;
    averageConfidence: number;
    byCode: Record<string, { attempts: number; successRate: number }>;
  } {
    let totalRepairs = 0;
    let totalSuccess = 0;
    let totalConfidence = 0;

    const byCode: Record<string, { attempts: number; successRate: number }> = {};

    for (const [code, history] of this.repairHistory.entries()) {
      const attempts = history.length;
      const successes = history.filter(h => h.success).length;
      const avgConfidence = history.reduce((sum, h) => sum + h.confidence, 0) / attempts;

      totalRepairs += attempts;
      totalSuccess += successes;
      totalConfidence += avgConfidence * attempts;

      byCode[code] = {
        attempts,
        successRate: successes / attempts,
      };
    }

    return {
      totalRepairs,
      successRate: totalRepairs > 0 ? totalSuccess / totalRepairs : 0,
      averageConfidence: totalRepairs > 0 ? totalConfidence / totalRepairs : 0,
      byCode,
    };
  }

  /**
   * Clear repair history
   */
  clearHistory(): void {
    this.repairHistory.clear();
    logger.info('RepairConfidenceScorer', 'HISTORY_CLEARED', 'Repair history cleared');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RepairConfidenceConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('RepairConfidenceScorer', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get current configuration
   */
  getConfig(): RepairConfidenceConfig {
    return { ...this.config };
  }
}

export const repairConfidenceScorer = new RepairConfidenceScorer();

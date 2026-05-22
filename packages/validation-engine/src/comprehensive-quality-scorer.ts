/**
 * Comprehensive Quality Scoring System
 * Combines multiple quality metrics for comprehensive code quality assessment
 */

import type { ValidationResult } from './generated-output.validator';
import type { CodeReviewResult } from '@oneatlas/shared';

export interface QualityMetrics {
  syntax: number; // 0-1
  structure: number; // 0-1
  completeness: number; // 0-1
  bestPractices: number; // 0-1
  aiReview: number; // 0-1
  overall: number; // 0-1
}

export interface QualityReport {
  metrics: QualityMetrics;
  passed: boolean;
  threshold: number;
  recommendations: string[];
  scoreBreakdown: Record<string, number>;
}

class ComprehensiveQualityScorer {
  private defaultThreshold = 0.75;

  /**
   * Calculate comprehensive quality score
   */
  calculateQuality(
    code: string,
    fileType: string,
    validation: ValidationResult,
    review: CodeReviewResult,
  ): QualityReport {
    const syntaxScore = this.calculateSyntaxScore(code);
    const structureScore = this.calculateStructureScore(code, fileType);
    const completenessScore = this.calculateCompletenessScore(code, fileType);
    const bestPracticesScore = this.calculateBestPracticesScore(validation);
    const aiReviewScore = review.overallScore ?? review.score ?? 0.5;

    const metrics: QualityMetrics = {
      syntax: syntaxScore,
      structure: structureScore,
      completeness: completenessScore,
      bestPractices: bestPracticesScore,
      aiReview: aiReviewScore,
      overall: this.calculateOverallScore({
        syntax: syntaxScore,
        structure: structureScore,
        completeness: completenessScore,
        bestPractices: bestPracticesScore,
        aiReview: aiReviewScore,
      }),
    };

    const passed = metrics.overall >= this.defaultThreshold;
    const recommendations = this.generateRecommendations(metrics, validation, review);

    return {
      metrics,
      passed,
      threshold: this.defaultThreshold,
      recommendations,
      scoreBreakdown: {
        syntax: syntaxScore,
        structure: structureScore,
        completeness: completenessScore,
        bestPractices: bestPracticesScore,
        aiReview: aiReviewScore,
      },
    };
  }

  /**
   * Calculate syntax score
   */
  private calculateSyntaxScore(code: string): number {
    let score = 1.0;

    // Check for balanced brackets
    const bracketCount = (code.match(/\[/g) || []).length - (code.match(/\]/g) || []).length;
    if (bracketCount !== 0) score -= 0.3;

    // Check for balanced parentheses
    const parenCount = (code.match(/\(/g) || []).length - (code.match(/\)/g) || []).length;
    if (parenCount !== 0) score -= 0.3;

    // Check for balanced braces
    const braceCount = (code.match(/\{/g) || []).length - (code.match(/\}/g) || []).length;
    if (braceCount !== 0) score -= 0.3;

    // Check for common syntax errors
    if (code.includes(';;')) score -= 0.1;
    if (code.includes(',,')) score -= 0.1;

    return Math.max(0, score);
  }

  /**
   * Calculate structure score
   */
  private calculateStructureScore(code: string, fileType: string): number {
    let score = 1.0;

    // Check for empty file
    if (!code.trim()) return 0;

    // Check for minimum length
    if (code.length < 50) score -= 0.3;

    // File-type specific structure checks
    switch (fileType) {
      case 'validation':
        if (!code.includes('z.')) score -= 0.4;
        if (!code.includes('export')) score -= 0.2;
        break;
      case 'page':
        if (!code.includes('React') && !code.includes('useState')) score -= 0.3;
        if (!code.includes('return')) score -= 0.3;
        break;
      case 'api-route':
        if (!code.includes('async')) score -= 0.3;
        if (!code.includes('export')) score -= 0.2;
        break;
    }

    return Math.max(0, score);
  }

  /**
   * Calculate completeness score
   */
  private calculateCompletenessScore(code: string, fileType: string): number {
    let score = 1.0;

    // Check for imports
    if (!code.includes('import')) score -= 0.2;

    // Check for exports
    if (!code.includes('export')) score -= 0.3;

    // Check for comments/documentation
    if (!code.includes('//') && !code.includes('/*')) score -= 0.1;

    return Math.max(0, score);
  }

  /**
   * Calculate best practices score
   */
  private calculateBestPracticesScore(validation: ValidationResult): number {
    let score = 1.0;

    // Penalize for errors
    const errorCount = validation.errors.filter(e => e.severity === 'error').length;
    score -= errorCount * 0.2;

    // Penalize for warnings
    const warningCount = validation.warnings.length;
    score -= warningCount * 0.1;

    return Math.max(0, score);
  }

  /**
   * Calculate overall score from individual metrics
   */
  private calculateOverallScore(metrics: Omit<QualityMetrics, 'overall'>): number {
    // Weighted average
    const weights = {
      syntax: 0.25,
      structure: 0.25,
      completeness: 0.2,
      bestPractices: 0.15,
      aiReview: 0.15,
    };

    return (
      metrics.syntax * weights.syntax +
      metrics.structure * weights.structure +
      metrics.completeness * weights.completeness +
      metrics.bestPractices * weights.bestPractices +
      metrics.aiReview * weights.aiReview
    );
  }

  /**
   * Generate recommendations based on quality metrics
   */
  private generateRecommendations(
    metrics: QualityMetrics,
    validation: ValidationResult,
    review: CodeReviewResult,
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.syntax < 0.8) {
      recommendations.push('Review and fix syntax errors in the code');
    }

    if (metrics.structure < 0.8) {
      recommendations.push('Improve code structure and organization');
    }

    if (metrics.completeness < 0.8) {
      recommendations.push('Add missing imports, exports, or documentation');
    }

    if (metrics.bestPractices < 0.8) {
      recommendations.push('Address best practice violations and warnings');
    }

    if (metrics.aiReview < 0.8) {
      recommendations.push('Consider AI review suggestions for improvement');
    }

    // Add specific validation recommendations
    validation.errors.forEach(error => {
      if (error.severity === 'error') {
        recommendations.push(`Fix error: ${error.message}`);
      }
    });

    // Add AI review suggestions
    review.suggestions.forEach(suggestion => {
      recommendations.push(suggestion);
    });

    return recommendations;
  }

  /**
   * Set quality threshold
   */
  setThreshold(threshold: number): void {
    this.defaultThreshold = Math.max(0, Math.min(1, threshold));
  }

  /**
   * Get current threshold
   */
  getThreshold(): number {
    return this.defaultThreshold;
  }

  /**
   * Batch score multiple files
   */
  batchScore(
    files: Array<{
      code: string;
      fileType: string;
      validation: ValidationResult;
      review: CodeReviewResult;
    }>,
  ): Map<string, QualityReport> {
    const results = new Map<string, QualityReport>();

    for (const file of files) {
      const report = this.calculateQuality(
        file.code,
        file.fileType,
        file.validation,
        file.review,
      );
      results.set(file.fileType, report);
    }

    return results;
  }

  /**
   * Get aggregate quality statistics
   */
  getAggregateStats(reports: QualityReport[]): {
    averageOverall: number;
    passRate: number;
    averageSyntax: number;
    averageStructure: number;
    averageCompleteness: number;
    averageBestPractices: number;
    averageAIReview: number;
  } {
    if (reports.length === 0) {
      return {
        averageOverall: 0,
        passRate: 0,
        averageSyntax: 0,
        averageStructure: 0,
        averageCompleteness: 0,
        averageBestPractices: 0,
        averageAIReview: 0,
      };
    }

    const totalOverall = reports.reduce((sum, r) => sum + r.metrics.overall, 0);
    const passedCount = reports.filter(r => r.passed).length;
    const totalSyntax = reports.reduce((sum, r) => sum + r.metrics.syntax, 0);
    const totalStructure = reports.reduce((sum, r) => sum + r.metrics.structure, 0);
    const totalCompleteness = reports.reduce((sum, r) => sum + r.metrics.completeness, 0);
    const totalBestPractices = reports.reduce((sum, r) => sum + r.metrics.bestPractices, 0);
    const totalAIReview = reports.reduce((sum, r) => sum + r.metrics.aiReview, 0);

    return {
      averageOverall: totalOverall / reports.length,
      passRate: passedCount / reports.length,
      averageSyntax: totalSyntax / reports.length,
      averageStructure: totalStructure / reports.length,
      averageCompleteness: totalCompleteness / reports.length,
      averageBestPractices: totalBestPractices / reports.length,
      averageAIReview: totalAIReview / reports.length,
    };
  }
}

export const comprehensiveQualityScorer = new ComprehensiveQualityScorer();

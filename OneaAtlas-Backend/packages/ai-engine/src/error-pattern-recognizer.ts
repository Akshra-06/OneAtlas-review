/**
 * Error Pattern Recognition System
 * Identifies recurring error patterns and suggests preventive measures
 */

import type { CodeValidationError } from '@oneatlas/shared';

export interface ErrorPattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  lastSeen: string;
  severity: 'low' | 'medium' | 'high';
  prevention: string;
  examples: string[];
}

export interface PatternMatch {
  patternId: string;
  confidence: number;
  context: string;
}

class ErrorPatternRecognizer {
  private patterns: Map<string, ErrorPattern> = new Map();
  private errorHistory: CodeValidationError[] = [];
  private maxHistorySize = 1000;

  /**
   * Initialize with common error patterns
   */
  constructor() {
    this.initializeCommonPatterns();
  }

  /**
   * Initialize common error patterns
   */
  private initializeCommonPatterns(): void {
    // Common syntax patterns
    this.addPattern({
      id: 'syntax-unbalanced-brackets',
      name: 'Unbalanced Brackets',
      description: 'Code contains unbalanced square brackets',
      frequency: 0,
      lastSeen: '',
      severity: 'high',
      prevention: 'Always ensure brackets are properly closed. Use a linter to catch bracket mismatches.',
      examples: ['Unbalanced brackets []'],
    });

    this.addPattern({
      id: 'syntax-unbalanced-parentheses',
      name: 'Unbalanced Parentheses',
      description: 'Code contains unbalanced parentheses',
      frequency: 0,
      lastSeen: '',
      severity: 'high',
      prevention: 'Always ensure parentheses are properly closed. Use a linter to catch parenthesis mismatches.',
      examples: ['Unbalanced parentheses ()'],
    });

    this.addPattern({
      id: 'syntax-double-semicolon',
      name: 'Double Semicolon',
      description: 'Code contains double semicolons',
      frequency: 0,
      lastSeen: '',
      severity: 'low',
      prevention: 'Review generated code for duplicate punctuation marks.',
      examples: ['Double semicolon detected'],
    });

    // Import patterns
    this.addPattern({
      id: 'import-duplicate',
      name: 'Duplicate Imports',
      description: 'Same module imported multiple times',
      frequency: 0,
      lastSeen: '',
      severity: 'medium',
      prevention: 'Deduplicate imports before code generation.',
      examples: ['Duplicate import:'],
    });

    // Type patterns
    this.addPattern({
      id: 'type-any-usage',
      name: 'Any Type Usage',
      description: 'Code uses "any" type instead of specific types',
      frequency: 0,
      lastSeen: '',
      severity: 'medium',
      prevention: 'Use specific types instead of "any" for better type safety.',
      examples: ["Found usage(s) of 'any' type"],
    });

    // Structure patterns
    this.addPattern({
      id: 'structure-empty-file',
      name: 'Empty File',
      description: 'Generated file is empty',
      frequency: 0,
      lastSeen: '',
      severity: 'high',
      prevention: 'Ensure generation logic always produces output.',
      examples: ['Generated file is empty'],
    });

    this.addPattern({
      id: 'structure-too-short',
      name: 'File Too Short',
      description: 'Generated file is too short',
      frequency: 0,
      lastSeen: '',
      severity: 'medium',
      prevention: 'Ensure generation logic produces complete code.',
      examples: ['Generated file is too short'],
    });
  }

  /**
   * Add a custom error pattern
   */
  addPattern(pattern: ErrorPattern): void {
    this.patterns.set(pattern.id, pattern);
  }

  /**
   * Analyze errors and identify patterns
   */
  analyzeErrors(errors: CodeValidationError[]): PatternMatch[] {
    const matches: PatternMatch[] = [];

    for (const error of errors) {
      const patternMatch = this.matchErrorToPattern(error);
      if (patternMatch) {
        matches.push(patternMatch);
      }

      // Add to history for pattern learning
      this.addToHistory(error);
    }

    // Update pattern frequencies
    this.updatePatternFrequencies();

    return matches;
  }

  /**
   * Match an error to a known pattern
   */
  private matchErrorToPattern(error: CodeValidationError): PatternMatch | null {
    for (const [patternId, pattern] of this.patterns.entries()) {
      if (this.isMatch(error, pattern)) {
        return {
          patternId,
          confidence: this.calculateConfidence(error, pattern),
          context: error.message,
        };
      }
    }

    return null;
  }

  /**
   * Check if an error matches a pattern
   */
  private isMatch(error: CodeValidationError, pattern: ErrorPattern): boolean {
    return pattern.examples.some(example => 
      error.message.toLowerCase().includes(example.toLowerCase())
    );
  }

  /**
   * Calculate confidence score for pattern match
   */
  private calculateConfidence(error: CodeValidationError, pattern: ErrorPattern): number {
    let confidence = 0.5;

    // Boost confidence if error type matches pattern category
    if (error.type === 'syntax' && pattern.id.includes('syntax')) {
      confidence += 0.3;
    }
    if (error.type === 'import' && pattern.id.includes('import')) {
      confidence += 0.3;
    }
    if (error.type === 'type' && pattern.id.includes('type')) {
      confidence += 0.3;
    }
    if (error.type === 'structure' && pattern.id.includes('structure')) {
      confidence += 0.3;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Add error to history for pattern learning
   */
  private addToHistory(error: CodeValidationError): void {
    this.errorHistory.push(error);

    // Maintain history size
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }
  }

  /**
   * Update pattern frequencies based on history
   */
  private updatePatternFrequencies(): void {
    // Reset frequencies
    for (const pattern of this.patterns.values()) {
      pattern.frequency = 0;
    }

    // Count occurrences
    for (const error of this.errorHistory) {
      for (const [patternId, pattern] of this.patterns.entries()) {
        if (this.isMatch(error, pattern)) {
          pattern.frequency++;
          pattern.lastSeen = new Date().toISOString();
        }
      }
    }
  }

  /**
   * Get most frequent patterns
   */
  getMostFrequentPatterns(limit: number = 5): ErrorPattern[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit);
  }

  /**
   * Get patterns by severity
   */
  getPatternsBySeverity(severity: 'low' | 'medium' | 'high'): ErrorPattern[] {
    return Array.from(this.patterns.values())
      .filter(pattern => pattern.severity === severity)
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get prevention suggestions for a set of errors
   */
  getPreventionSuggestions(errors: CodeValidationError[]): string[] {
    const matches = this.analyzeErrors(errors);
    const suggestions: Set<string> = new Set();

    for (const match of matches) {
      const pattern = this.patterns.get(match.patternId);
      if (pattern) {
        suggestions.add(pattern.prevention);
      }
    }

    return Array.from(suggestions);
  }

  /**
   * Learn from new errors to create new patterns
   */
  learnFromErrors(errors: CodeValidationError[]): void {
    // Group similar errors
    const errorGroups = this.groupSimilarErrors(errors);

    // Create new patterns for recurring error types
    for (const [key, groupErrors] of errorGroups.entries()) {
      if (groupErrors.length >= 3 && groupErrors[0]) {
        // This error type occurs frequently, create a pattern
        const sampleError = groupErrors[0];
        const newPattern: ErrorPattern = {
          id: `learned-${key.toLowerCase().replace(/\s+/g, '-')}`,
          name: key,
          description: `Recurring error: ${sampleError.message}`,
          frequency: groupErrors.length,
          lastSeen: new Date().toISOString(),
          severity: sampleError.severity === 'error' ? 'high' : 'medium',
          prevention: 'Review generation logic for this error type.',
          examples: groupErrors.slice(0, 3).map(e => e.message),
        };

        this.addPattern(newPattern);
      }
    }
  }

  /**
   * Group similar errors
   */
  private groupSimilarErrors(errors: CodeValidationError[]): Map<string, CodeValidationError[]> {
    const groups = new Map<string, CodeValidationError[]>();

    for (const error of errors) {
      const key = this.getErrorGroupKey(error);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(error);
    }

    return groups;
  }

  /**
   * Get grouping key for an error
   */
  private getErrorGroupKey(error: CodeValidationError): string {
    // Group by type and message keywords
    const messageWords = error.message
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 3)
      .slice(0, 2)
      .join('-');
    
    return `${error.type}-${messageWords}`;
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Get pattern statistics
   */
  getStatistics(): {
    totalPatterns: number;
    totalErrorsAnalyzed: number;
    mostFrequentPattern: ErrorPattern | null;
    highSeverityPatterns: number;
  } {
    const mostFrequent = this.getMostFrequentPatterns(1)[0] || null;
    const highSeverity = this.getPatternsBySeverity('high').length;

    return {
      totalPatterns: this.patterns.size,
      totalErrorsAnalyzed: this.errorHistory.length,
      mostFrequentPattern: mostFrequent,
      highSeverityPatterns: highSeverity,
    };
  }
}

export const errorPatternRecognizer = new ErrorPatternRecognizer();

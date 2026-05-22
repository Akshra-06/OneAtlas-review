/**
 * Modification Quality Scoring System
 * Assesses the quality of AI modifications based on multiple criteria
 */

export interface QualityScore {
  overall: number; // 0-1
  syntax: number; // 0-1
  structure: number; // 0-1
  completeness: number; // 0-1
  relevance: number; // 0-1
  details: Record<string, number>;
}

class ModificationQualityScorer {
  /**
   * Score the quality of a modification
   */
  scoreModification(
    original: string,
    modified: string,
    entityName: string,
    taskType: string,
  ): QualityScore {
    const syntax = this.scoreSyntax(modified);
    const structure = this.scoreStructure(original, modified);
    const completeness = this.scoreCompleteness(modified, entityName, taskType);
    const relevance = this.scoreRelevance(modified, entityName);

    const overall = (syntax * 0.3) + (structure * 0.3) + (completeness * 0.2) + (relevance * 0.2);

    return {
      overall,
      syntax,
      structure,
      completeness,
      relevance,
      details: {
        syntax,
        structure,
        completeness,
        relevance,
      },
    };
  }

  /**
   * Score syntax correctness
   */
  private scoreSyntax(code: string): number {
    let score = 1.0;

    // Check for basic syntax errors
    const errors = this.detectSyntaxErrors(code);
    score -= errors.length * 0.2;

    // Check for balanced brackets
    if (!this.hasBalancedBrackets(code)) {
      score -= 0.3;
    }

    // Check for balanced parentheses
    if (!this.hasBalancedParentheses(code)) {
      score -= 0.3;
    }

    // Check for balanced braces
    if (!this.hasBalancedBraces(code)) {
      score -= 0.3;
    }

    return Math.max(0, score);
  }

  /**
   * Score structure preservation
   */
  private scoreStructure(original: string, modified: string): number {
    let score = 1.0;

    // Check if imports are preserved
    const originalImports = this.extractImports(original);
    const modifiedImports = this.extractImports(modified);
    const importPreservation = this.calculateOverlap(originalImports, modifiedImports);
    score += importPreservation * 0.3;

    // Check if exports are preserved
    const originalExports = this.extractExports(original);
    const modifiedExports = this.extractExports(modified);
    const exportPreservation = this.calculateOverlap(originalExports, modifiedExports);
    score += exportPreservation * 0.3;

    // Check if function structure is similar
    const structureSimilarity = this.calculateStructureSimilarity(original, modified);
    score += structureSimilarity * 0.4;

    return Math.min(1, score);
  }

  /**
   * Score completeness
   */
  private scoreCompleteness(code: string, entityName: string, taskType: string): number {
    let score = 1.0;

    // Check if entity name is present
    if (!code.includes(entityName)) {
      score -= 0.2;
    }

    // Check for required elements based on task type
    switch (taskType) {
      case 'validation':
        if (!code.includes('z.object')) score -= 0.3;
        if (!code.includes('export')) score -= 0.2;
        break;
      case 'page':
        if (!code.includes('React') && !code.includes('useState')) score -= 0.2;
        if (!code.includes('return')) score -= 0.3;
        break;
      case 'api':
        if (!code.includes('async')) score -= 0.2;
        if (!code.includes('export')) score -= 0.2;
        break;
    }

    // Check if code is not too short
    if (code.length < 100) {
      score -= 0.3;
    }

    return Math.max(0, score);
  }

  /**
   * Score relevance to entity
   */
  private scoreRelevance(code: string, entityName: string): number {
    let score = 1.0;

    // Check if entity name appears multiple times (indicates relevance)
    const entityNameCount = (code.match(new RegExp(entityName, 'g')) || []).length;
    if (entityNameCount < 2) {
      score -= 0.3;
    }

    // Check for common patterns related to entity
    const patterns = [
      `${entityName}Create`,
      `${entityName}Update`,
      `${entityName}Schema`,
      `${entityName.toLowerCase()}`,
    ];
    
    const patternMatches = patterns.filter(pattern => code.includes(pattern)).length;
    score += (patternMatches / patterns.length) * 0.3;

    return Math.min(1, score);
  }

  /**
   * Detect basic syntax errors
   */
  private detectSyntaxErrors(code: string): string[] {
    const errors: string[] = [];

    // Check for common syntax errors
    if (code.includes(';;')) errors.push('Double semicolon');
    if (code.includes(',,')) errors.push('Double comma');
    if (code.includes('..')) errors.push('Double dot');
    if (code.includes('::')) errors.push('Double colon (unless in type)');

    return errors;
  }

  /**
   * Check for balanced brackets
   */
  private hasBalancedBrackets(code: string): boolean {
    let count = 0;
    for (const char of code) {
      if (char === '[') count++;
      if (char === ']') count--;
      if (count < 0) return false;
    }
    return count === 0;
  }

  /**
   * Check for balanced parentheses
   */
  private hasBalancedParentheses(code: string): boolean {
    let count = 0;
    for (const char of code) {
      if (char === '(') count++;
      if (char === ')') count--;
      if (count < 0) return false;
    }
    return count === 0;
  }

  /**
   * Check for balanced braces
   */
  private hasBalancedBraces(code: string): boolean {
    let count = 0;
    for (const char of code) {
      if (char === '{') count++;
      if (char === '}') count--;
      if (count < 0) return false;
    }
    return count === 0;
  }

  /**
   * Extract imports from code
   */
  private extractImports(code: string): string[] {
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    const imports: string[] = [];
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      if (match[1]) {
        imports.push(match[1]);
      }
    }
    return imports;
  }

  /**
   * Extract exports from code
   */
  private extractExports(code: string): string[] {
    const exportRegex = /export\s+(?:const|function|class|interface|type)\s+(\w+)/g;
    const exports: string[] = [];
    let match;
    while ((match = exportRegex.exec(code)) !== null) {
      if (match[1]) {
        exports.push(match[1]);
      }
    }
    return exports;
  }

  /**
   * Calculate overlap between two arrays
   */
  private calculateOverlap(arr1: string[], arr2: string[]): number {
    if (arr1.length === 0 || arr2.length === 0) return 0;
    const intersection = arr1.filter(item => arr2.includes(item));
    return intersection.length / Math.max(arr1.length, arr2.length);
  }

  /**
   * Calculate structure similarity
   */
  private calculateStructureSimilarity(original: string, modified: string): number {
    const originalLines = original.split('\n').length;
    const modifiedLines = modified.split('\n').length;
    
    // Penalize drastic line count changes
    const lineRatio = Math.min(originalLines, modifiedLines) / Math.max(originalLines, modifiedLines);
    
    return lineRatio;
  }
}

export const qualityScorer = new ModificationQualityScorer();

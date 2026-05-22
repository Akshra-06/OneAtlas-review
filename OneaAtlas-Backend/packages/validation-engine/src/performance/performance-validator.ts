/**
 * Performance Validator
 * 
 * Validates performance characteristics of generated code.
 * Checks for bundle size, load time, and performance anti-patterns.
 */

import type { GeneratedFile } from '@oneatlas/shared';
import { logger } from '@oneatlas/shared';

export interface PerformanceValidationIssue {
  id: string;
  type: 'bundle_size' | 'large_import' | 'unused_import' | 'no_code_splitting' | 'no_lazy_loading' | 'image_optimization' | 'performance_anti_pattern';
  severity: 'critical' | 'error' | 'warning' | 'info';
  filePath: string;
  message: string;
  suggestion?: string;
  repairable: boolean;
  estimatedImpact?: string;
}

export interface PerformanceValidationResult {
  valid: boolean;
  issues: PerformanceValidationIssue[];
  summary: {
    total: number;
    critical: number;
    error: number;
    warning: number;
    info: number;
    estimatedSizeImpact: string;
  };
}

/**
 * Performance Validator
 * 
 * Validates:
 * - Bundle size (large files, large imports)
 * - Import optimization (unused imports, large imports)
 * - Code splitting opportunities
 * - Lazy loading opportunities
 * - Image optimization
 * - Performance anti-patterns
 */
export class PerformanceValidator {
  private readonly LARGE_FILE_THRESHOLD = 10000; // 10KB
  private readonly LARGE_IMPORT_THRESHOLD = 5000; // 5KB estimated
  private readonly CRITICAL_SIZE_THRESHOLD = 50000; // 50KB

  /**
   * Validate generated files for performance issues
   */
  validate(files: GeneratedFile[]): PerformanceValidationResult {
    const issues: PerformanceValidationIssue[] = [];

    for (const file of files) {
      const fileIssues = this.validateFile(file);
      issues.push(...fileIssues);
    }

    const summary = this.calculateSummary(issues, files);
    const valid = summary.critical === 0 && summary.error === 0;

    logger.info('PerformanceValidator', 'VALIDATION_COMPLETE', 'Performance validation complete', {
      valid,
      summary,
    });

    return { valid, issues, summary };
  }

  /**
   * Validate a single file
   */
  private validateFile(file: GeneratedFile): PerformanceValidationIssue[] {
    const issues: PerformanceValidationIssue[] = [];
    const content = file.content;
    const filePath = file.filePath;
    const fileSize = content.length;

    // Check for large files
    issues.push(...this.checkBundleSize(content, filePath, fileSize));

    // Check for large imports
    issues.push(...this.checkLargeImports(content, filePath));

    // Check for unused imports
    issues.push(...this.checkUnusedImports(content, filePath));

    // Check for code splitting opportunities
    issues.push(...this.checkCodeSplitting(content, filePath));

    // Check for lazy loading opportunities
    issues.push(...this.checkLazyLoading(content, filePath));

    // Check for image optimization
    issues.push(...this.checkImageOptimization(content, filePath));

    // Check for performance anti-patterns
    issues.push(...this.checkPerformanceAntiPatterns(content, filePath));

    return issues;
  }

  /**
   * Check for bundle size issues
   */
  private checkBundleSize(content: string, filePath: string, fileSize: number): PerformanceValidationIssue[] {
    const issues: PerformanceValidationIssue[] = [];

    if (fileSize > this.CRITICAL_SIZE_THRESHOLD) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'bundle_size',
        severity: 'critical',
        filePath,
        message: `File size exceeds critical threshold (${(fileSize / 1024).toFixed(2)}KB)`,
        suggestion: 'Consider code splitting, lazy loading, or moving to separate files',
        repairable: false,
        estimatedImpact: 'High - affects initial load time',
      });
    } else if (fileSize > this.LARGE_FILE_THRESHOLD) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'bundle_size',
        severity: 'warning',
        filePath,
        message: `File size is large (${(fileSize / 1024).toFixed(2)}KB)`,
        suggestion: 'Consider code splitting or lazy loading',
        repairable: false,
        estimatedImpact: 'Medium - affects load time',
      });
    }

    return issues;
  }

  /**
   * Check for large imports
   */
  private checkLargeImports(content: string, filePath: string): PerformanceValidationIssue[] {
    const issues: PerformanceValidationIssue[] = [];

    // Check for imports from large libraries
    const largeLibraries = ['lodash', 'moment', 'rxjs', '@material-ui/core', '@mui/material'];
    for (const lib of largeLibraries) {
      const pattern = new RegExp(`import.*from\\s*['"]${lib}['"]`, 'i');
      if (pattern.test(content)) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'large_import',
          severity: 'warning',
          filePath,
          message: `Import from large library detected: ${lib}`,
          suggestion: 'Consider using a smaller alternative or tree-shaking',
          repairable: false,
          estimatedImpact: 'Medium - increases bundle size',
        });
      }
    }

    return issues;
  }

  /**
   * Check for unused imports
   */
  private checkUnusedImports(content: string, filePath: string): PerformanceValidationIssue[] {
    const issues: PerformanceValidationIssue[] = [];

    // Extract import names
    const importPattern = /import\s+{([^}]+)}\s+from/g;
    const imports: string[] = [];
    let match;

    while ((match = importPattern.exec(content)) !== null) {
      if (match[1] !== undefined) {
        const names = match[1].split(',').map(n => {
          const parts = n.trim().split(' as ');
          return parts[0] || '';
        }).filter(n => n.length > 0);
        imports.push(...names);
      }
    }

    // Check if imports are used
    for (const imp of imports) {
      const pattern = new RegExp(`\\b${imp}\\b`, 'g');
      const matches = content.match(pattern);
      
      // Count occurrences (import statement counts as 1)
      if (matches && matches.length <= 1) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'unused_import',
          severity: 'warning',
          filePath,
          message: `Potentially unused import: ${imp}`,
          suggestion: 'Remove unused imports to reduce bundle size',
          repairable: true,
          estimatedImpact: 'Low - minor bundle size reduction',
        });
      }
    }

    return issues;
  }

  /**
   * Check for code splitting opportunities
   */
  private checkCodeSplitting(content: string, filePath: string): PerformanceValidationIssue[] {
    const issues: PerformanceValidationIssue[] = [];

    // Check for heavy components that could be code-split
    if (content.includes('Chart') || content.includes('Graph') || content.includes('Editor')) {
      if (!content.includes('dynamic') && !content.includes('lazy')) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'no_code_splitting',
          severity: 'warning',
          filePath,
          message: 'Heavy component detected without code splitting',
          suggestion: 'Consider using dynamic() or React.lazy() for code splitting',
          repairable: true,
          estimatedImpact: 'Medium - improves initial load time',
        });
      }
    }

    return issues;
  }

  /**
   * Check for lazy loading opportunities
   */
  private checkLazyLoading(content: string, filePath: string): PerformanceValidationIssue[] {
    const issues: PerformanceValidationIssue[] = [];

    // Check for images without lazy loading
    const imgPattern = /<img(?![^>]*loading=)[^>]*>/gi;
    const matches = content.match(imgPattern);

    if (matches && matches.length > 2) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'no_lazy_loading',
        severity: 'info',
        filePath,
        message: 'Multiple images without lazy loading detected',
        suggestion: 'Add loading="lazy" to below-the-fold images',
        repairable: true,
        estimatedImpact: 'Low - improves perceived load time',
      });
    }

    return issues;
  }

  /**
   * Check for image optimization
   */
  private checkImageOptimization(content: string, filePath: string): PerformanceValidationIssue[] {
    const issues: PerformanceValidationIssue[] = [];

    // Check for large image references
    const largeImagePattern = /\.(png|jpg|jpeg|gif)(?!\?w=|&w=)/gi;
    const matches = content.match(largeImagePattern);

    if (matches) {
      for (const match of matches) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'image_optimization',
          severity: 'warning',
          filePath,
          message: `Image without optimization detected: ${match}`,
          suggestion: 'Use Next.js Image component with width/height or use WebP format',
          repairable: true,
          estimatedImpact: 'Medium - reduces bandwidth',
        });
      }
    }

    return issues;
  }

  /**
   * Check for performance anti-patterns
   */
  private checkPerformanceAntiPatterns(content: string, filePath: string): PerformanceValidationIssue[] {
    const issues: PerformanceValidationIssue[] = [];

    // Check for inline styles
    const inlineStylePattern = /style=\{[^}]*\}/g;
    const inlineStyleMatches = content.match(inlineStylePattern);

    if (inlineStyleMatches && inlineStyleMatches.length > 5) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'performance_anti_pattern',
        severity: 'warning',
        filePath,
        message: 'Multiple inline styles detected',
        suggestion: 'Use CSS classes or styled-components instead of inline styles',
        repairable: true,
        estimatedImpact: 'Low - minor performance improvement',
      });
    }

    // Check for anonymous functions in render
    const anonFunctionPattern = /onClick=\{(\(\)\s*=>|function)/g;
    const anonFunctionMatches = content.match(anonFunctionPattern);

    if (anonFunctionMatches && anonFunctionMatches.length > 3) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'performance_anti_pattern',
        severity: 'warning',
        filePath,
        message: 'Multiple anonymous functions in render detected',
        suggestion: 'Move functions outside render or use useCallback',
        repairable: true,
        estimatedImpact: 'Medium - prevents unnecessary re-renders',
      });
    }

    // Check for missing React.memo on expensive components
    if (content.includes('useEffect') && content.includes('useMemo') === false && content.includes('useCallback') === false) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'performance_anti_pattern',
        severity: 'info',
        filePath,
        message: 'Component with effects but no memoization detected',
        suggestion: 'Consider using React.memo, useMemo, or useCallback',
        repairable: true,
        estimatedImpact: 'Low - may prevent unnecessary re-renders',
      });
    }

    return issues;
  }

  /**
   * Calculate validation summary
   */
  private calculateSummary(issues: PerformanceValidationIssue[], files: GeneratedFile[]) {
    const totalSize = files.reduce((sum, f) => sum + f.content.length, 0);
    const sizeImpact = issues
      .filter(i => i.estimatedImpact?.includes('High'))
      .length * 10 + issues
      .filter(i => i.estimatedImpact?.includes('Medium'))
      .length * 5;

    return {
      total: issues.length,
      critical: issues.filter(i => i.severity === 'critical').length,
      error: issues.filter(i => i.severity === 'error').length,
      warning: issues.filter(i => i.severity === 'warning').length,
      info: issues.filter(i => i.severity === 'info').length,
      estimatedSizeImpact: sizeImpact > 50 ? 'High' : sizeImpact > 20 ? 'Medium' : 'Low',
    };
  }

  /**
   * Auto-repair performance issues where possible
   */
  autoRepair(files: GeneratedFile[], issues: PerformanceValidationIssue[]): GeneratedFile[] {
    const repairedFiles = [...files];
    const filesMap = new Map(files.map(f => [f.filePath, f]));

    for (const issue of issues) {
      if (!issue.repairable) continue;

      const file = filesMap.get(issue.filePath);
      if (!file) continue;

      let repairedContent = file.content;

      switch (issue.type) {
        case 'unused_import':
          repairedContent = this.repairUnusedImports(repairedContent, issue);
          break;
        case 'no_lazy_loading':
          repairedContent = this.repairLazyLoading(repairedContent);
          break;
        default:
          // Other repairs would be more complex
          break;
      }

      if (repairedContent !== file.content) {
        const index = repairedFiles.findIndex(f => f.filePath === file.filePath);
        if (index !== -1) {
          repairedFiles[index] = { ...file, content: repairedContent };
        }
      }
    }

    return repairedFiles;
  }

  /**
   * Repair unused imports
   */
  private repairUnusedImports(content: string, issue: PerformanceValidationIssue): string {
    // This is a simplified repair - actual repair would need AST parsing
    return content;
  }

  /**
   * Repair lazy loading
   */
  private repairLazyLoading(content: string): string {
    // Add loading="lazy" to img tags
    return content.replace(/<img([^>]*)>/g, (match, group) => {
      if (!group.includes('loading=')) {
        return `<img${group} loading="lazy">`;
      }
      return match;
    });
  }
}

export const performanceValidator = new PerformanceValidator();

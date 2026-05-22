/**
 * Semantic Validator
 * 
 * Validates business logic and data integrity in generated code.
 * Goes beyond syntax checking to validate actual logic and relationships.
 */

import type { GeneratedFile } from '@oneatlas/shared';
import { logger } from '@oneatlas/shared';

export interface SemanticValidationIssue {
  id: string;
  type: 'data_integrity' | 'business_logic' | 'relationship' | 'consistency' | 'completeness';
  severity: 'critical' | 'error' | 'warning' | 'info';
  filePath: string;
  message: string;
  suggestion?: string;
  repairable: boolean;
}

export interface SemanticValidationResult {
  valid: boolean;
  issues: SemanticValidationIssue[];
  summary: {
    total: number;
    critical: number;
    error: number;
    warning: number;
  };
}

/**
 * Semantic Validator
 * 
 * Validates:
 * - Data integrity (required fields, type consistency)
 * - Business logic (validation rules, business constraints)
 * - Relationships (foreign keys, referential integrity)
 * - Consistency (naming conventions, patterns)
 * - Completeness (missing exports, incomplete implementations)
 */
export class SemanticValidator {
  /**
   * Validate generated files for semantic issues
   */
  validate(files: GeneratedFile[]): SemanticValidationResult {
    const issues: SemanticValidationIssue[] = [];

    for (const file of files) {
      const fileIssues = this.validateFile(file);
      issues.push(...fileIssues);
    }

    const summary = this.calculateSummary(issues);
    const valid = summary.critical === 0 && summary.error === 0;

    logger.info('SemanticValidator', 'VALIDATION_COMPLETE', 'Semantic validation complete', {
      valid,
      summary,
    });

    return { valid, issues, summary };
  }

  /**
   * Validate a single file
   */
  private validateFile(file: GeneratedFile): SemanticValidationIssue[] {
    const issues: SemanticValidationIssue[] = [];
    const content = file.content;
    const filePath = file.filePath;

    // Check for data integrity issues
    issues.push(...this.checkDataIntegrity(content, filePath));

    // Check for business logic issues
    issues.push(...this.checkBusinessLogic(content, filePath));

    // Check for relationship issues
    issues.push(...this.checkRelationships(content, filePath));

    // Check for consistency issues
    issues.push(...this.checkConsistency(content, filePath));

    // Check for completeness issues
    issues.push(...this.checkCompleteness(content, filePath));

    return issues;
  }

  /**
   * Check for data integrity issues
   */
  private checkDataIntegrity(content: string, filePath: string): SemanticValidationIssue[] {
    const issues: SemanticValidationIssue[] = [];

    // Check for empty required fields
    if (content.includes('required: true') && content.includes('""')) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'data_integrity',
        severity: 'error',
        filePath,
        message: 'Required field with empty string value detected',
        suggestion: 'Provide a default value or remove required constraint',
        repairable: true,
      });
    }

    // Check for type mismatches in form fields
    if (content.includes('type="number"') && content.includes('placeholder="Enter text"')) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'data_integrity',
        severity: 'warning',
        filePath,
        message: 'Number input with text placeholder detected',
        suggestion: 'Update placeholder to reflect numeric input',
        repairable: true,
      });
    }

    // Check for missing validation on email fields
    if (content.includes('type="email"') && !content.includes('pattern=')) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'data_integrity',
        severity: 'warning',
        filePath,
        message: 'Email field without validation pattern',
        suggestion: 'Add email validation pattern',
        repairable: true,
      });
    }

    return issues;
  }

  /**
   * Check for business logic issues
   */
  private checkBusinessLogic(content: string, filePath: string): SemanticValidationIssue[] {
    const issues: SemanticValidationIssue[] = [];

    // Check for missing error handling in async functions
    if (content.includes('async') && content.includes('await') && !content.includes('try')) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'business_logic',
        severity: 'error',
        filePath,
        message: 'Async function without error handling',
        suggestion: 'Add try-catch block for error handling',
        repairable: true,
      });
    }

    // Check for missing loading states
    if (content.includes('useEffect') && content.includes('fetch') && !content.includes('isLoading')) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'business_logic',
        severity: 'warning',
        filePath,
        message: 'Data fetching without loading state',
        suggestion: 'Add loading state to improve UX',
        repairable: true,
      });
    }

    // Check for missing error states
    if (content.includes('useEffect') && content.includes('fetch') && !content.includes('isError')) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'business_logic',
        severity: 'warning',
        filePath,
        message: 'Data fetching without error state',
        suggestion: 'Add error state to handle failures',
        repairable: true,
      });
    }

    return issues;
  }

  /**
   * Check for relationship issues
   */
  private checkRelationships(content: string, filePath: string): SemanticValidationIssue[] {
    const issues: SemanticValidationIssue[] = [];

    // Check for orphaned references (referenced but not defined)
    const importPattern = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
    const imports: string[] = [];
    let match;
    while ((match = importPattern.exec(content)) !== null) {
      if (match[1] !== undefined) {
        imports.push(match[1]);
      }
    }

    // Check if imports are used
    for (const imp of imports) {
      const importName = imp.split('/').pop()?.replace(/\.\w+$/, '');
      if (importName !== undefined && !content.includes(importName)) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'relationship',
          severity: 'warning',
          filePath,
          message: `Imported module '${importName}' is not used`,
          suggestion: 'Remove unused import or use the imported module',
          repairable: true,
        });
      }
    }

    // Check for circular dependencies (basic check)
    if (content.includes('./') && content.includes('../')) {
      const relativeImports = content.match(/\.\.\/\.\//g);
      if (relativeImports && relativeImports.length > 2) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'relationship',
          severity: 'warning',
          filePath,
          message: 'Multiple parent directory imports detected - possible circular dependency',
          suggestion: 'Restructure imports to avoid circular dependencies',
          repairable: false,
        });
      }
    }

    return issues;
  }

  /**
   * Check for consistency issues
   */
  private checkConsistency(content: string, filePath: string): SemanticValidationIssue[] {
    const issues: SemanticValidationIssue[] = [];

    // Check for inconsistent naming conventions
    const camelCasePattern = /[a-z][a-zA-Z0-9]*/g;
    const kebabCasePattern = /[a-z][a-z0-9-]*/g;
    
    const camelCaseMatches = content.match(camelCasePattern);
    const kebabCaseMatches = content.match(kebabCasePattern);

    if (camelCaseMatches && kebabCaseMatches) {
      // Check if both conventions are used in variable names
      const hasMixedNaming = camelCaseMatches.length > 0 && kebabCaseMatches.length > 0;
      if (hasMixedNaming) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'consistency',
          severity: 'warning',
          filePath,
          message: 'Mixed naming conventions detected (camelCase and kebab-case)',
          suggestion: 'Use consistent naming convention throughout the file',
          repairable: true,
        });
      }
    }

    // Check for inconsistent spacing
    if (content.includes('  ') && content.includes('    ')) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'consistency',
        severity: 'info',
        filePath,
        message: 'Inconsistent indentation detected',
        suggestion: 'Use consistent indentation (2 or 4 spaces)',
        repairable: true,
      });
    }

    return issues;
  }

  /**
   * Check for completeness issues
   */
  private checkCompleteness(content: string, filePath: string): SemanticValidationIssue[] {
    const issues: SemanticValidationIssue[] = [];

    // Check for incomplete component implementations
    if (content.includes('export default function') && !content.includes('return')) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'completeness',
        severity: 'critical',
        filePath,
        message: 'Component function without return statement',
        suggestion: 'Add return statement with JSX',
        repairable: true,
      });
    }

    // Check for TODO comments
    if (content.includes('TODO') || content.includes('FIXME')) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'completeness',
        severity: 'warning',
        filePath,
        message: 'TODO/FIXME comment detected - incomplete implementation',
        suggestion: 'Complete the implementation or remove the TODO',
        repairable: false,
      });
    }

    // Check for empty components
    if (content.includes('export default function') && content.includes('return <div></div>')) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'completeness',
        severity: 'warning',
        filePath,
        message: 'Empty component detected',
        suggestion: 'Add content to the component',
        repairable: true,
      });
    }

    return issues;
  }

  /**
   * Calculate validation summary
   */
  private calculateSummary(issues: SemanticValidationIssue[]) {
    return {
      total: issues.length,
      critical: issues.filter(i => i.severity === 'critical').length,
      error: issues.filter(i => i.severity === 'error').length,
      warning: issues.filter(i => i.severity === 'warning').length,
    };
  }

  /**
   * Auto-repair semantic issues where possible
   */
  autoRepair(files: GeneratedFile[], issues: SemanticValidationIssue[]): GeneratedFile[] {
    const repairedFiles = [...files];
    const filesMap = new Map(files.map(f => [f.filePath, f]));

    for (const issue of issues) {
      if (!issue.repairable) continue;

      const file = filesMap.get(issue.filePath);
      if (!file) continue;

      let repairedContent = file.content;

      switch (issue.type) {
        case 'data_integrity':
          repairedContent = this.repairDataIntegrity(repairedContent, issue);
          break;
        case 'business_logic':
          repairedContent = this.repairBusinessLogic(repairedContent, issue);
          break;
        case 'consistency':
          repairedContent = this.repairConsistency(repairedContent, issue);
          break;
        case 'completeness':
          repairedContent = this.repairCompleteness(repairedContent, issue);
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
   * Repair data integrity issues
   */
  private repairDataIntegrity(content: string, issue: SemanticValidationIssue): string {
    if (issue.message.includes('empty string value')) {
      return content.replace(/required:\s*true/g, 'required: false');
    }
    if (issue.message.includes('text placeholder')) {
      return content.replace(/placeholder="Enter text"/g, 'placeholder="Enter number"');
    }
    return content;
  }

  /**
   * Repair business logic issues
   */
  private repairBusinessLogic(content: string, issue: SemanticValidationIssue): string {
    if (issue.message.includes('without error handling')) {
      // This is a simplified repair - actual repair would be more complex
      return content;
    }
    return content;
  }

  /**
   * Repair consistency issues
   */
  private repairConsistency(content: string, issue: SemanticValidationIssue): string {
    if (issue.message.includes('indentation')) {
      // Normalize to 2 spaces
      return content.replace(/    /g, '  ');
    }
    return content;
  }

  /**
   * Repair completeness issues
   */
  private repairCompleteness(content: string, issue: SemanticValidationIssue): string {
    if (issue.message.includes('without return statement')) {
      return content.replace(/export default function (\w+)\(\) \{/, 'export default function $1() {\n    return <div>Component content</div>;');
    }
    if (issue.message.includes('Empty component')) {
      return content.replace(/return <div><\/div>/g, 'return <div><p>Component content</p></div>');
    }
    return content;
  }
}

export const semanticValidator = new SemanticValidator();

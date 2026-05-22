/**
 * Generated Output Validator
 * Validates generated code for syntax and structural correctness
 */

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'syntax' | 'structure' | 'import' | 'export' | 'type';
  message: string;
  line?: number;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  type: 'style' | 'performance' | 'best-practice';
  message: string;
  line?: number;
}

// Legacy types for validation orchestrator compatibility
export interface CompileValidationIssue {
  stage: 'typescript' | 'prisma' | 'eslint' | 'import' | 'export';
  severity: 'error' | 'warning';
  filePath: string;
  message: string;
  line?: number;
  repaired: boolean;
}

export interface CompileValidationResult {
  valid: boolean;
  issues: CompileValidationIssue[];
  files: any[];
  prismaSchema: string;
}

class GeneratedOutputValidator {
  /**
   * Validate generated code
   */
  validate(code: string, fileType: string): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Syntax validation
    const syntaxErrors = this.validateSyntax(code);
    errors.push(...syntaxErrors);

    // Import validation
    const importErrors = this.validateImports(code);
    errors.push(...importErrors);

    // Export validation
    const exportErrors = this.validateExports(code, fileType);
    errors.push(...exportErrors);

    // Type validation
    const typeErrors = this.validateTypes(code);
    errors.push(...typeErrors);

    // Structure validation
    const structureErrors = this.validateStructure(code, fileType);
    errors.push(...structureErrors);

    // Best practice warnings
    const bestPracticeWarnings = this.validateBestPractices(code, fileType);
    warnings.push(...bestPracticeWarnings);

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate and repair generated code (for compatibility with existing pipeline)
   */
  validateAndRepair(result: any): CompileValidationResult {
    // This is a compatibility method for the existing pipeline
    // For now, just validate without repair
    const files = result.files || [];
    const issues: CompileValidationIssue[] = [];

    files.forEach((file: any) => {
      const validation = this.validate(file.content, file.fileType);
      if (!validation.isValid) {
        validation.errors.forEach((error) => {
          issues.push({
            stage: error.type === 'import' || error.type === 'export' ? 'import' : 'typescript',
            severity: error.severity,
            filePath: file.filePath,
            message: error.message,
            line: error.line,
            repaired: false,
          });
        });
      }
      validation.warnings.forEach((warning) => {
        issues.push({
          stage: 'eslint',
          severity: 'warning',
          filePath: file.filePath,
          message: warning.message,
          line: warning.line,
          repaired: false,
        });
      });
    });

    return {
      valid: issues.length === 0,
      issues,
      files,
      prismaSchema: result.prismaSchema,
    };
  }

  /**
   * Validate syntax
   */
  private validateSyntax(code: string): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for balanced brackets
    if (!this.hasBalancedBrackets(code)) {
      errors.push({
        type: 'syntax',
        message: 'Unbalanced brackets []',
        severity: 'error',
      });
    }

    // Check for balanced parentheses
    if (!this.hasBalancedParentheses(code)) {
      errors.push({
        type: 'syntax',
        message: 'Unbalanced parentheses ()',
        severity: 'error',
      });
    }

    // Check for balanced braces
    if (!this.hasBalancedBraces(code)) {
      errors.push({
        type: 'syntax',
        message: 'Unbalanced braces {}',
        severity: 'error',
      });
    }

    // Check for common syntax errors
    if (code.includes(';;')) {
      errors.push({
        type: 'syntax',
        message: 'Double semicolon detected',
        severity: 'error',
      });
    }

    if (code.includes(',,')) {
      errors.push({
        type: 'syntax',
        message: 'Double comma detected',
        severity: 'error',
      });
    }

    return errors;
  }

  /**
   * Validate imports
   */
  private validateImports(code: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
    const imports: string[] = [];
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      if (match[1]) {
        imports.push(match[1]);
      }
    }

    // Check for duplicate imports
    const duplicateImports = imports.filter((item, index) => imports.indexOf(item) !== index);
    duplicateImports.forEach(imp => {
      errors.push({
        type: 'import',
        message: `Duplicate import: ${imp}`,
        severity: 'warning',
      });
    });

    return errors;
  }

  /**
   * Validate exports
   */
  private validateExports(code: string, fileType: string): ValidationError[] {
    const errors: ValidationError[] = [];
    const exportRegex = /export\s+(?:const|function|class|interface|type)\s+(\w+)/g;
    const exports: string[] = [];
    let match;

    while ((match = exportRegex.exec(code)) !== null) {
      if (match[1]) {
        exports.push(match[1]);
      }
    }

    // Check if file has exports
    if (exports.length === 0) {
      errors.push({
        type: 'export',
        message: 'No exports found in generated file',
        severity: 'warning',
      });
    }

    return errors;
  }

  /**
   * Validate types
   */
  private validateTypes(code: string): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for 'any' type usage
    const anyTypeRegex = /:\s*any\b/g;
    const anyMatches = code.match(anyTypeRegex);
    if (anyMatches && anyMatches.length > 0) {
      errors.push({
        type: 'type',
        message: `Found ${anyMatches.length} usage(s) of 'any' type. Consider using specific types.`,
        severity: 'warning',
      });
    }

    return errors;
  }

  /**
   * Validate structure
   */
  private validateStructure(code: string, fileType: string): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for empty file
    if (code.trim().length === 0) {
      errors.push({
        type: 'structure',
        message: 'Generated file is empty',
        severity: 'error',
      });
      return errors;
    }

    // Check for minimum length
    if (code.length < 50) {
      errors.push({
        type: 'structure',
        message: 'Generated file is too short',
        severity: 'warning',
      });
    }

    // File-type specific validation
    switch (fileType) {
      case 'validation':
        if (!code.includes('z.')) {
          errors.push({
            type: 'structure',
            message: 'Validation file missing Zod schema',
            severity: 'error',
          });
        }
        break;
      case 'page':
        if (!code.includes('React') && !code.includes('useState') && !code.includes('useForm')) {
          errors.push({
            type: 'structure',
            message: 'Page component missing React hooks',
            severity: 'warning',
          });
        }
        break;
      case 'api-route':
        if (!code.includes('async')) {
          errors.push({
            type: 'structure',
            message: 'API route missing async function',
            severity: 'warning',
          });
        }
        break;
    }

    return errors;
  }

  /**
   * Validate best practices
   */
  private validateBestPractices(code: string, fileType: string): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Check for console.log statements
    if (code.includes('console.log')) {
      warnings.push({
        type: 'best-practice',
        message: 'console.log statements should be removed in production',
      });
    }

    // Check for TODO comments
    if (code.includes('TODO') || code.includes('FIXME')) {
      warnings.push({
        type: 'best-practice',
        message: 'TODO/FIXME comments found - consider implementing',
      });
    }

    return warnings;
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
}

export const generatedOutputValidator = new GeneratedOutputValidator();

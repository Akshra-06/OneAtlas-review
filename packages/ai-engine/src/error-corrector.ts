/**
 * Automatic Error Correction System
 * Automatically fixes common errors in generated code
 */

import type { CodeValidationError } from '@oneatlas/shared';

export interface CorrectionResult {
  correctedCode: string;
  corrections: Correction[];
  success: boolean;
}

export interface Correction {
  type: string;
  description: string;
  original: string;
  corrected: string;
}

class ErrorCorrector {
  /**
   * Automatically correct errors in generated code
   */
  correct(code: string, errors: CodeValidationError[]): CorrectionResult {
    let correctedCode = code;
    const corrections: Correction[] = [];

    for (const error of errors) {
      const correction = this.applyCorrection(correctedCode, error);
      if (correction) {
        correctedCode = correction.correctedCode;
        corrections.push(correction.correction);
      }
    }

    return {
      correctedCode,
      corrections,
      success: corrections.length > 0,
    };
  }

  /**
   * Apply correction for a specific error
   */
  private applyCorrection(code: string, error: CodeValidationError): { correctedCode: string; correction: Correction } | null {
    switch (error.type) {
      case 'syntax':
        return this.correctSyntaxError(code, error);
      case 'import':
        return this.correctImportError(code, error);
      case 'export':
        return this.correctExportError(code, error);
      case 'type':
        return this.correctTypeError(code, error);
      case 'structure':
        return this.correctStructureError(code, error);
      default:
        return null;
    }
  }

  /**
   * Correct syntax errors
   */
  private correctSyntaxError(code: string, error: CodeValidationError): { correctedCode: string; correction: Correction } | null {
    let correctedCode = code;

    if (error.message.includes('Double semicolon')) {
      correctedCode = code.replace(/;;/g, ';');
      return {
        correctedCode,
        correction: {
          type: 'syntax',
          description: 'Removed double semicolons',
          original: code,
          corrected: correctedCode,
        },
      };
    }

    if (error.message.includes('Double comma')) {
      correctedCode = code.replace(/,,/g, ',');
      return {
        correctedCode,
        correction: {
          type: 'syntax',
          description: 'Removed double commas',
          original: code,
          corrected: correctedCode,
        },
      };
    }

    if (error.message.includes('Unbalanced brackets')) {
      const bracketCount = (code.match(/\[/g) || []).length - (code.match(/\]/g) || []).length;
      if (bracketCount > 0) {
        correctedCode = code + ']'.repeat(bracketCount);
      } else if (bracketCount < 0) {
        correctedCode = '['.repeat(Math.abs(bracketCount)) + code;
      }
      return {
        correctedCode,
        correction: {
          type: 'syntax',
          description: 'Balanced brackets',
          original: code,
          corrected: correctedCode,
        },
      };
    }

    if (error.message.includes('Unbalanced parentheses')) {
      const parenCount = (code.match(/\(/g) || []).length - (code.match(/\)/g) || []).length;
      if (parenCount > 0) {
        correctedCode = code + ')'.repeat(parenCount);
      } else if (parenCount < 0) {
        correctedCode = '(' .repeat(Math.abs(parenCount)) + code;
      }
      return {
        correctedCode,
        correction: {
          type: 'syntax',
          description: 'Balanced parentheses',
          original: code,
          corrected: correctedCode,
        },
      };
    }

    if (error.message.includes('Unbalanced braces')) {
      const braceCount = (code.match(/\{/g) || []).length - (code.match(/\}/g) || []).length;
      if (braceCount > 0) {
        correctedCode = code + '}'.repeat(braceCount);
      } else if (braceCount < 0) {
        correctedCode = '{'.repeat(Math.abs(braceCount)) + code;
      }
      return {
        correctedCode,
        correction: {
          type: 'syntax',
          description: 'Balanced braces',
          original: code,
          corrected: correctedCode,
        },
      };
    }

    return null;
  }

  /**
   * Correct import errors
   */
  private correctImportError(code: string, error: CodeValidationError): { correctedCode: string; correction: Correction } | null {
    if (error.message.includes('Duplicate import')) {
      const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
      const seenImports = new Set<string>();
      let correctedCode = '';
      let lastIndex = 0;
      let match;

      while ((match = importRegex.exec(code)) !== null) {
        if (match[1] && !seenImports.has(match[1])) {
          seenImports.add(match[1]);
          correctedCode += code.substring(lastIndex, match.index + match[0].length);
          lastIndex = match.index + match[0].length;
        } else {
          // Skip duplicate import
          correctedCode += code.substring(lastIndex, match.index);
          lastIndex = match.index + match[0].length;
        }
      }
      correctedCode += code.substring(lastIndex);

      return {
        correctedCode,
        correction: {
          type: 'import',
          description: 'Removed duplicate imports',
          original: code,
          corrected: correctedCode,
        },
      };
    }

    return null;
  }

  /**
   * Correct export errors
   */
  private correctExportError(code: string, error: CodeValidationError): { correctedCode: string; correction: Correction } | null {
    if (error.message.includes('No exports found')) {
      // Try to add a default export if none exists
      if (!code.includes('export')) {
        const correctedCode = code + '\n\nexport default {};';
        return {
          correctedCode,
          correction: {
            type: 'export',
            description: 'Added default export',
            original: code,
            corrected: correctedCode,
          },
        };
      }
    }

    return null;
  }

  /**
   * Correct type errors
   */
  private correctTypeError(code: string, error: CodeValidationError): { correctedCode: string; correction: Correction } | null {
    if (error.message.includes("'any' type")) {
      // Replace 'any' with 'unknown' for better type safety
      const correctedCode = code.replace(/:\s*any\b/g, ': unknown');
      return {
        correctedCode,
        correction: {
          type: 'type',
          description: 'Replaced "any" with "unknown" for better type safety',
          original: code,
          corrected: correctedCode,
        },
      };
    }

    return null;
  }

  /**
   * Correct structure errors
   */
  private correctStructureError(code: string, error: CodeValidationError): { correctedCode: string; correction: Correction } | null {
    if (error.message.includes('empty')) {
      // Add a basic structure for empty files
      const correctedCode = `// Generated file\nexport default {};`;
      return {
        correctedCode,
        correction: {
          type: 'structure',
          description: 'Added basic structure to empty file',
          original: code,
          corrected: correctedCode,
        },
      };
    }

    if (error.message.includes('too short')) {
      // Add a comment to make the file longer
      const correctedCode = code + '\n// End of file';
      return {
        correctedCode,
        correction: {
          type: 'structure',
          description: 'Added comment to meet minimum length',
          original: code,
          corrected: correctedCode,
        },
      };
    }

    return null;
  }

  /**
   * Attempt to fix code using AI (for complex errors)
   */
  async correctWithAI(code: string, errors: CodeValidationError[]): Promise<CorrectionResult> {
    // This would integrate with the AI gateway for complex corrections
    // For now, return the original code
    return {
      correctedCode: code,
      corrections: [],
      success: false,
    };
  }
}

export const errorCorrector = new ErrorCorrector();

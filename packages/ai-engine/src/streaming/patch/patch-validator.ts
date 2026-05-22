/**
 * Patch Validator
 * 
 * Validates patches before application.
 * Ensures patch safety and correctness.
 */

import { Patch, CodeChange } from './patch-generator';
import { logger } from '../../shared/utils/logger';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationConfig {
  enableSyntaxValidation: boolean;
  enableSemanticValidation: boolean;
  enableSecurityValidation: boolean;
  maxPatchSize: number;
}

const DEFAULT_CONFIG: ValidationConfig = {
  enableSyntaxValidation: true,
  enableSemanticValidation: true,
  enableSecurityValidation: true,
  maxPatchSize: 100000, // 100KB
};

/**
 * Patch Validator
 * 
 * Validates patches before application:
 * - Syntax validation
 * - Semantic validation
 * - Security validation
 * - Size validation
 */
export class PatchValidator {
  private config: ValidationConfig;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Validate a patch
   */
  validate(patch: Patch): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // Validate patch structure
    this.validatePatchStructure(patch, result);

    // Validate changes
    this.validateChanges(patch, result);

    // Validate size
    this.validateSize(patch, result);

    // Validate syntax if enabled
    if (this.config.enableSyntaxValidation) {
      this.validateSyntax(patch, result);
    }

    // Validate semantics if enabled
    if (this.config.enableSemanticValidation) {
      this.validateSemantics(patch, result);
    }

    // Validate security if enabled
    if (this.config.enableSecurityValidation) {
      this.validateSecurity(patch, result);
    }

    result.valid = result.errors.length === 0;

    if (result.valid) {
      logger.info('PatchValidator', 'PATCH_VALID', 'Patch validated successfully', {
        patchId: patch.id,
        patchType: patch.type,
      });
    } else {
      logger.warn('PatchValidator', 'PATCH_INVALID', 'Patch validation failed', {
        patchId: patch.id,
        patchType: patch.type,
        errors: result.errors,
      });
    }

    return result;
  }

  /**
   * Validate multiple patches
   */
  validatePatches(patches: Patch[]): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const patch of patches) {
      const result = this.validate(patch);
      results.push(result);
    }

    logger.info('PatchValidator', 'PATCHES_VALIDATED', 'Multiple patches validated', {
      total: patches.length,
      valid: results.filter(r => r.valid).length,
      invalid: results.filter(r => !r.valid).length,
    });

    return results;
  }

  /**
   * Validate patch structure
   */
  private validatePatchStructure(patch: Patch, result: ValidationResult): void {
    if (!patch.id) {
      result.errors.push('Patch ID is required');
    }

    if (!patch.type) {
      result.errors.push('Patch type is required');
    }

    if (!patch.target) {
      result.errors.push('Patch target is required');
    }

    if (!patch.changes || patch.changes.length === 0) {
      result.errors.push('Patch must have at least one change');
    }
  }

  /**
   * Validate changes
   */
  private validateChanges(patch: Patch, result: ValidationResult): void {
    for (const change of patch.changes) {
      if (!change.type) {
        result.errors.push('Change type is required');
      }

      if (!change.path) {
        result.errors.push('Change path is required');
      }

      if (change.type === 'add' && !change.newValue) {
        result.errors.push('Add change must have newValue');
      }

      if (change.type === 'remove' && !change.oldValue) {
        result.errors.push('Remove change must have oldValue');
      }

      if (change.type === 'modify' && (!change.oldValue || !change.newValue)) {
        result.errors.push('Modify change must have both oldValue and newValue');
      }
    }
  }

  /**
   * Validate patch size
   */
  private validateSize(patch: Patch, result: ValidationResult): void {
    const size = JSON.stringify(patch).length;

    if (size > this.config.maxPatchSize) {
      result.errors.push(`Patch size (${size} bytes) exceeds maximum (${this.config.maxPatchSize} bytes)`);
    }
  }

  /**
   * Validate syntax
   */
  private validateSyntax(patch: Patch, result: ValidationResult): void {
    // In a real implementation, this would validate the syntax of the code changes
    // For now, perform basic checks

    for (const change of patch.changes) {
      if (change.newValue) {
        // Check for basic syntax errors
        if (change.newValue.includes('undefined')) {
          result.warnings.push('Change contains undefined value');
        }

        if (change.newValue.includes('NaN')) {
          result.warnings.push('Change contains NaN value');
        }
      }
    }
  }

  /**
   * Validate semantics
   */
  private validateSemantics(patch: Patch, result: ValidationResult): void {
    // In a real implementation, this would validate the semantic correctness of the changes
    // For now, perform basic checks

    for (const change of patch.changes) {
      if (change.type === 'modify' && change.oldValue === change.newValue) {
        result.warnings.push('Modify change has identical old and new values');
      }
    }
  }

  /**
   * Validate security
   */
  private validateSecurity(patch: Patch, result: ValidationResult): void {
    // Check for potentially dangerous patterns
    const dangerousPatterns = [
      'eval(',
      'Function(',
      'document.write',
      'innerHTML',
      'outerHTML',
      'setTimeout(',
      'setInterval(',
    ];

    for (const change of patch.changes) {
      if (change.newValue) {
        for (const pattern of dangerousPatterns) {
          if (change.newValue.includes(pattern)) {
            result.errors.push(`Change contains potentially dangerous pattern: ${pattern}`);
          }
        }
      }
    }
  }

  /**
   * Validate a change independently
   */
  validateChange(change: CodeChange): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    if (!change.type) {
      result.errors.push('Change type is required');
    }

    if (!change.path) {
      result.errors.push('Change path is required');
    }

    if (change.type === 'add' && !change.newValue) {
      result.errors.push('Add change must have newValue');
    }

    if (change.type === 'remove' && !change.oldValue) {
      result.errors.push('Remove change must have oldValue');
    }

    if (change.type === 'modify' && (!change.oldValue || !change.newValue)) {
      result.errors.push('Modify change must have both oldValue and newValue');
    }

    result.valid = result.errors.length === 0;

    return result;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('PatchValidator', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ValidationConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: ValidationConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const patchValidator = new PatchValidator();

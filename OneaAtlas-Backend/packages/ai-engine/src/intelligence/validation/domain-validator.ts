/**
 * Domain Validator
 * 
 * Validates domain classification results.
 * Ensures accurate and appropriate domain assignment.
 */

import { logger } from '../../shared/utils/logger';
import type { ClassificationResult } from '../classification/domain-classifier';

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  suggestedDomain?: string;
  issues: string[];
  recommendations: string[];
}

export interface ValidationConfig {
  strictMode: boolean;
  confidenceThreshold: number;
  enableAutoCorrection: boolean;
}

const DEFAULT_CONFIG: ValidationConfig = {
  strictMode: false,
  confidenceThreshold: 0.7,
  enableAutoCorrection: true,
};

/**
 * Domain Validator
 * 
 * Validates domain classifications:
 * - Confidence verification
 * - Cross-domain validation
 * - Issue detection
 * - Auto-correction suggestions
 */
export class DomainValidator {
  private config: ValidationConfig;
  private validationHistory: Map<string, ValidationResult> = new Map();

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Validate classification result
   */
  validate(prompt: string, classification: ClassificationResult): ValidationResult {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let isValid = true;

    // Check confidence threshold
    if (classification.confidence < this.config.confidenceThreshold) {
      issues.push(`Low confidence score: ${classification.confidence.toFixed(2)} below threshold ${this.config.confidenceThreshold}`);
      recommendations.push('Consider providing more specific domain keywords');
      isValid = false;
    }

    // Check for domain conflicts
    if (classification.alternativeDomains.length > 0) {
      const topAlternative = classification.alternativeDomains[0];
      if (topAlternative && topAlternative.confidence > classification.confidence * 0.8) {
        issues.push(`Domain conflict: ${topAlternative.domain} has similar confidence (${topAlternative.confidence.toFixed(2)})`);
        recommendations.push(`Consider ${topAlternative.domain} as an alternative domain`);
        
        if (this.config.strictMode) {
          isValid = false;
        }
      }
    }

    // Check for generic classification
    if (classification.domain === 'generic') {
      issues.push('Generic domain classification - no specific domain detected');
      recommendations.push('Add domain-specific keywords to the prompt');
      isValid = false;
    }

    // Check for insufficient matched keywords
    if (classification.matchedKeywords.length < 2) {
      issues.push(`Insufficient domain keywords matched: ${classification.matchedKeywords.length}`);
      recommendations.push('Include more domain-specific terms in the prompt');
      
      if (this.config.strictMode) {
        isValid = false;
      }
    }

    // Validate against prompt context
    const contextValidation = this.validatePromptContext(prompt, classification);
    if (!contextValidation.isValid) {
      issues.push(...contextValidation.issues);
      recommendations.push(...contextValidation.recommendations);
      
      if (this.config.strictMode) {
        isValid = false;
      }
    }

    // Suggest alternative if invalid
    let suggestedDomain: string | undefined;
    if (!isValid && this.config.enableAutoCorrection && classification.alternativeDomains.length > 0) {
      suggestedDomain = classification.alternativeDomains[0]?.domain;
    }

    const result: ValidationResult = {
      isValid,
      confidence: classification.confidence,
      suggestedDomain,
      issues,
      recommendations,
    };

    // Store validation history
    this.validationHistory.set(prompt, result);

    logger.info('DomainValidator', 'VALIDATION_COMPLETE', 'Domain validation complete', {
      domain: classification.domain,
      isValid,
      confidence: classification.confidence,
      issues: issues.length,
    });

    return result;
  }

  /**
   * Validate prompt context against domain
   */
  private validatePromptContext(prompt: string, classification: ClassificationResult): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const lowerPrompt = prompt.toLowerCase();
    let isValid = true;

    // Domain-specific validation rules
    const domainRules: Record<string, { required: string[]; forbidden: string[] }> = {
      ecommerce: {
        required: ['product', 'store', 'shop', 'buy', 'sell'],
        forbidden: ['medical', 'health', 'patient', 'doctor'],
      },
      healthcare: {
        required: ['patient', 'doctor', 'medical', 'health', 'treatment'],
        forbidden: ['buy', 'sell', 'shop', 'store'],
      },
      finance: {
        required: ['money', 'account', 'bank', 'payment', 'transaction'],
        forbidden: ['medical', 'health', 'patient'],
      },
      education: {
        required: ['student', 'teacher', 'course', 'class', 'learning'],
        forbidden: ['buy', 'sell', 'shop'],
      },
      project_management: {
        required: ['project', 'task', 'team', 'workflow', 'milestone'],
        forbidden: [],
      },
      crm: {
        required: ['customer', 'lead', 'contact', 'sales', 'deal'],
        forbidden: [],
      },
      cms: {
        required: ['content', 'blog', 'article', 'page', 'publish'],
        forbidden: [],
      },
      analytics: {
        required: ['data', 'metric', 'chart', 'report', 'analytics'],
        forbidden: [],
      },
      hr: {
        required: ['employee', 'hiring', 'recruitment', 'payroll', 'staff'],
        forbidden: [],
      },
      inventory: {
        required: ['stock', 'inventory', 'warehouse', 'item', 'sku'],
        forbidden: [],
      },
    };

    const rules = domainRules[classification.domain];
    if (rules) {
      // Check required keywords
      const hasRequired = rules.required.some(keyword => lowerPrompt.includes(keyword));
      if (!hasRequired) {
        issues.push(`Missing required keywords for ${classification.domain}: ${rules.required.join(', ')}`);
        recommendations.push(`Include domain-specific terms like ${rules.required.slice(0, 3).join(', ')}`);
        isValid = false;
      }

      // Check forbidden keywords
      const hasForbidden = rules.forbidden.some(keyword => lowerPrompt.includes(keyword));
      if (hasForbidden) {
        issues.push(`Contains keywords that conflict with ${classification.domain}: ${rules.forbidden.join(', ')}`);
        recommendations.push('Review prompt for conflicting domain terms');
        isValid = false;
      }
    }

    return { isValid, issues, recommendations };
  }

  /**
   * Auto-correct domain classification
   */
  autoCorrect(prompt: string, classification: ClassificationResult): ClassificationResult {
    const validation = this.validate(prompt, classification);

    if (validation.isValid || !validation.suggestedDomain) {
      return classification;
    }

    logger.info('DomainValidator', 'AUTO_CORRECTION_APPLIED', 'Auto-correction applied', {
      originalDomain: classification.domain,
      suggestedDomain: validation.suggestedDomain,
    });

    // Return corrected classification
    return {
      ...classification,
      domain: validation.suggestedDomain,
    };
  }

  /**
   * Get validation history
   */
  getValidationHistory(prompt?: string): ValidationResult | Map<string, ValidationResult> | undefined {
    if (prompt) {
      return this.validationHistory.get(prompt);
    }
    return this.validationHistory;
  }

  /**
   * Clear validation history
   */
  clearHistory(): void {
    this.validationHistory.clear();

    logger.info('DomainValidator', 'HISTORY_CLEARED', 'Validation history cleared');
  }

  /**
   * Get validation statistics
   */
  getStatistics(): {
    totalValidations: number;
    validClassifications: number;
    invalidClassifications: number;
    averageConfidence: number;
    autoCorrections: number;
  } {
    const history = Array.from(this.validationHistory.values());
    const validClassifications = history.filter(v => v.isValid).length;
    const invalidClassifications = history.length - validClassifications;
    const autoCorrections = history.filter(v => v.suggestedDomain !== undefined).length;

    const averageConfidence = history.length > 0
      ? history.reduce((sum, v) => sum + v.confidence, 0) / history.length
      : 0;

    return {
      totalValidations: history.length,
      validClassifications,
      invalidClassifications,
      averageConfidence,
      autoCorrections,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('DomainValidator', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ValidationConfig {
    return { ...this.config };
  }

  /**
   * Generate validation report
   */
  generateReport(): string {
    const stats = this.getStatistics();
    const validityRate = stats.totalValidations > 0
      ? (stats.validClassifications / stats.totalValidations * 100).toFixed(2)
      : '0.00';

    return `
Domain Validation Report
========================
Total Validations: ${stats.totalValidations}
Valid: ${stats.validClassifications}
Invalid: ${stats.invalidClassifications}
Validity Rate: ${validityRate}%
Average Confidence: ${stats.averageConfidence.toFixed(2)}
Auto-Corrections: ${stats.autoCorrections}

Configuration:
- Strict Mode: ${this.config.strictMode ? 'Enabled' : 'Disabled'}
- Confidence Threshold: ${this.config.confidenceThreshold}
- Auto-Correction: ${this.config.enableAutoCorrection ? 'Enabled' : 'Disabled'}
    `.trim();
  }
}

export const domainValidator = new DomainValidator();

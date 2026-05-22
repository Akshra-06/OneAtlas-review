/**
 * Validation Feedback Loop System
 * Iteratively improves generated code based on validation feedback
 */

import type { CodeReviewResult } from './ai-code-reviewer';
import type { ValidationResult } from '@oneatlas/shared';
import { aiCodeReviewer } from './ai-code-reviewer';
import { errorCorrector } from './error-corrector';
import { errorPatternRecognizer } from './error-pattern-recognizer';
import { gateway } from './gateway/gateway';

export interface FeedbackIteration {
  iteration: number;
  validation: ValidationResult;
  review: CodeReviewResult;
  appliedCorrections: string[];
  qualityScore: number;
}

export interface FeedbackLoopResult {
  finalCode: string;
  iterations: FeedbackIteration[];
  success: boolean;
  totalIterations: number;
  finalQualityScore: number;
}

class ValidationFeedbackLoop {
  private maxIterations = 3;
  private qualityThreshold = 0.8;

  /**
   * Run feedback loop to improve code quality
   */
  async runFeedbackLoop(
    code: string,
    fileType: string,
    context?: string,
  ): Promise<FeedbackLoopResult> {
    const iterations: FeedbackIteration[] = [];
    let currentCode = code;
    let success = false;

    for (let i = 0; i < this.maxIterations; i++) {
      // Validate current code
      const validation = this.validateCode(currentCode, fileType);

      // Run AI code review
      const review = await aiCodeReviewer.reviewCode(currentCode, fileType, context);

      // Calculate quality score
      const qualityScore = this.calculateQualityScore(validation, review);

      const iteration: FeedbackIteration = {
        iteration: i + 1,
        validation,
        review,
        appliedCorrections: [],
        qualityScore,
      };

      // Check if quality threshold is met
      if (qualityScore >= this.qualityThreshold && validation.isValid) {
        success = true;
        iterations.push(iteration);
        break;
      }

      // Apply corrections based on feedback
      const corrections = await this.applyFeedback(currentCode, validation, review, fileType);
      currentCode = corrections.correctedCode;
      iteration.appliedCorrections = corrections.corrections;

      iterations.push(iteration);

      // Check if no improvements were made
      if (corrections.corrections.length === 0) {
        break;
      }
    }

    // Final validation
    const finalValidation = this.validateCode(currentCode, fileType);
    const finalReview = await aiCodeReviewer.reviewCode(currentCode, fileType, context);
    const finalQualityScore = this.calculateQualityScore(finalValidation, finalReview);

    return {
      finalCode: currentCode,
      iterations,
      success: success || finalQualityScore >= this.qualityThreshold,
      totalIterations: iterations.length,
      finalQualityScore,
    };
  }

  /**
   * Validate code
   */
  private validateCode(code: string, fileType: string): ValidationResult {
    // This would use the generatedOutputValidator
    // For now, return a basic validation result
    const errors: any[] = [];
    const warnings: any[] = [];

    // Basic syntax checks
    if (!code.trim()) {
      errors.push({ type: 'structure', message: 'Code is empty', severity: 'error' });
    }

    if (code.includes(';;')) {
      errors.push({ type: 'syntax', message: 'Double semicolon', severity: 'error' });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Calculate overall quality score
   */
  private calculateQualityScore(validation: ValidationResult, review: CodeReviewResult): number {
    const validationScore = validation.isValid ? 1.0 : 0.5;
    const reviewScore = review.overallScore;

    // Weighted average
    return (validationScore * 0.4) + (reviewScore * 0.6);
  }

  /**
   * Apply feedback to improve code
   */
  private async applyFeedback(
    code: string,
    validation: ValidationResult,
    review: CodeReviewResult,
    fileType: string,
  ): Promise<{ correctedCode: string; corrections: string[] }> {
    let correctedCode = code;
    const corrections: string[] = [];

    // Apply automatic error corrections
    if (!validation.isValid && validation.errors.length > 0) {
      const errorCorrection = errorCorrector.correct(code, validation.errors);
      if (errorCorrection.success) {
        correctedCode = errorCorrection.correctedCode;
        corrections.push(...errorCorrection.corrections.map(c => c.description));
      }
    }

    // Apply AI-based improvements for review suggestions
    if (review.suggestions.length > 0) {
      const aiImprovement = await this.applyAIImprovements(correctedCode, review.suggestions, fileType);
      if (aiImprovement) {
        correctedCode = aiImprovement;
        corrections.push('Applied AI improvements based on review');
      }
    }

    // Learn from error patterns
    if (validation.errors.length > 0) {
      errorPatternRecognizer.learnFromErrors(validation.errors);
    }

    return {
      correctedCode,
      corrections,
    };
  }

  /**
   * Apply AI-based improvements
   */
  private async applyAIImprovements(
    code: string,
    suggestions: string[],
    fileType: string,
  ): Promise<string | null> {
    try {
      const prompt = `Improve the following ${fileType} code based on these suggestions:\n${suggestions.join('\n')}\n\nCode:\n\`\`\`typescript\n${code}\n\`\`\`\n\nReturn ONLY the improved code, no explanations.`;

      const response = await gateway.complete({
        messages: [
          { role: 'system', content: 'You are an expert code improver. Apply the given suggestions to improve the code while maintaining its functionality.' },
          { role: 'user', content: prompt },
        ],
        tier: 'smart',
        temperature: 0.3,
        maxTokens: 3000,
      });

      // Clean up response
      const improvedCode = response.text.replace(/```typescript\n?/g, '').replace(/```\n?/g, '').trim();

      return improvedCode !== code ? improvedCode : null;
    } catch (error) {
      console.error('[FeedbackLoop] AI improvement failed:', error);
      return null;
    }
  }

  /**
   * Set maximum iterations
   */
  setMaxIterations(max: number): void {
    this.maxIterations = max;
  }

  /**
   * Set quality threshold
   */
  setQualityThreshold(threshold: number): void {
    this.qualityThreshold = Math.max(0, Math.min(1, threshold));
  }

  /**
   * Get current configuration
   */
  getConfig(): { maxIterations: number; qualityThreshold: number } {
    return {
      maxIterations: this.maxIterations,
      qualityThreshold: this.qualityThreshold,
    };
  }
}

export const validationFeedbackLoop = new ValidationFeedbackLoop();

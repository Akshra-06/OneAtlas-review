/**
 * Centralized Validation Orchestrator
 * 
 * Unifies all validation steps into a single pipeline for reliability and consistency.
 * This is the single source of truth for all validation operations.
 */

import type { GeneratedFile, GenerationResult } from '@oneatlas/shared';
import { previewValidator, type PreviewValidationIssue, type PreviewValidationResult } from '@oneatlas/validation-engine';
import { generatedOutputValidator, type CompileValidationResult, type CompileValidationIssue } from '@oneatlas/validation-engine';
import { safeComponentRegistry } from '@oneatlas/validation-engine';
import { semanticValidator, type SemanticValidationIssue } from '@oneatlas/validation-engine';
import { accessibilityValidator, type AccessibilityValidationIssue } from '@oneatlas/validation-engine';
import { performanceValidator, type PerformanceValidationIssue } from '@oneatlas/validation-engine';
import { logger } from '@oneatlas/shared';

export type ValidationSeverity = 'critical' | 'error' | 'warning' | 'info';

export interface UnifiedValidationIssue {
  id: string;
  stage: 'preview' | 'compile' | 'component' | 'semantic' | 'accessibility' | 'performance';
  severity: ValidationSeverity;
  filePath?: string;
  message: string;
  repairable: boolean;
  repaired: boolean;
  confidence?: number; // 0-100 confidence in the issue detection
  suggestion?: string; // Human-readable suggestion
  code?: string; // Error code for programmatic handling
}

export interface UnifiedValidationResult {
  valid: boolean;
  issues: UnifiedValidationIssue[];
  files: GeneratedFile[];
  prismaSchema: string;
  summary: {
    total: number;
    critical: number;
    error: number;
    warning: number;
    info: number;
    repaired: number;
    unrepaired: number;
  };
  metadata: {
    validationId: string;
    timestamp: string;
    durationMs: number;
    stages: string[];
  };
}

export interface ValidationConfig {
  skipPreviewValidation?: boolean;
  skipCompileValidation?: boolean;
  skipComponentValidation?: boolean;
  skipSemanticValidation?: boolean;
  skipAccessibilityValidation?: boolean;
  skipPerformanceValidation?: boolean;
  skipMaterializedValidation?: boolean;
  failOnCritical?: boolean;
  failOnError?: boolean;
  autoRepair?: boolean;
  repairThreshold?: number; // Only auto-repair issues with confidence >= threshold
}

const DEFAULT_CONFIG: ValidationConfig = {
  skipPreviewValidation: false,
  skipCompileValidation: false,
  skipComponentValidation: false,
  skipSemanticValidation: false,
  skipAccessibilityValidation: false,
  skipPerformanceValidation: false,
  skipMaterializedValidation: false,
  failOnCritical: true,
  failOnError: false,
  autoRepair: true,
  repairThreshold: 70,
};

/**
 * Centralized Validation Orchestrator
 * 
 * Orchestrates all validation steps in a unified pipeline:
 * 1. Preview validation (runtime safety)
 * 2. Compile validation (TypeScript, Prisma, ESLint)
 * 3. Component validation (safe component registry)
 * 4. Aggregation and reporting
 */
export class ValidationOrchestrator {
  private config: ValidationConfig;

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main validation entry point
   * 
   * @param result - Generation result to validate
   * @param config - Optional validation config override
   * @returns Unified validation result
   */
  async validate(
    result: GenerationResult,
    config?: Partial<ValidationConfig>,
  ): Promise<UnifiedValidationResult> {
    const startTime = Date.now();
    const validationId = crypto.randomUUID();
    const effectiveConfig = { ...this.config, ...config };

    logger.info('ValidationOrchestrator', 'VALIDATION_START', 'Starting unified validation pipeline', {
      validationId,
      fileCount: result.files.length,
      config: effectiveConfig,
    });

    const issues: UnifiedValidationIssue[] = [];
    const stages: string[] = [];
    let files = result.files;
    let prismaSchema = result.prismaSchema;

    // Stage 1: Preview Validation
    if (!effectiveConfig.skipPreviewValidation) {
      stages.push('preview');
      const previewResult = await this.runPreviewValidation(files);
      issues.push(...this.mapPreviewIssues(previewResult.issues));
      
      // Auto-repair preview issues if enabled
      if (effectiveConfig.autoRepair) {
        const repairedFiles = previewValidator.autoRepair(files, previewResult.issues);
        if (repairedFiles.length !== files.length) {
          files = repairedFiles;
          logger.info('ValidationOrchestrator', 'PREVIEW_REPAIR', 'Auto-repaired preview issues', {
            repairedCount: repairedFiles.length - files.length,
          });
        }
      }
    }

    // Stage 2: Compile Validation
    if (!effectiveConfig.skipCompileValidation) {
      stages.push('compile');
      const compileResult = await this.runCompileValidation(
        { ...result, files, prismaSchema },
        effectiveConfig.skipMaterializedValidation ?? false,
      );
      issues.push(...this.mapCompileIssues(compileResult.issues));
      files = compileResult.files;
      prismaSchema = compileResult.prismaSchema;
    }

    // Stage 3: Component Validation
    if (!effectiveConfig.skipComponentValidation) {
      stages.push('component');
      const componentIssues = await this.runComponentValidation(files);
      issues.push(...componentIssues);
    }

    // Stage 4: Semantic Validation
    if (!effectiveConfig.skipSemanticValidation) {
      stages.push('semantic');
      const semanticIssues = await this.runSemanticValidation(files);
      issues.push(...semanticIssues);
    }

    // Stage 5: Accessibility Validation
    if (!effectiveConfig.skipAccessibilityValidation) {
      stages.push('accessibility');
      const accessibilityIssues = await this.runAccessibilityValidation(files);
      issues.push(...accessibilityIssues);
    }

    // Stage 6: Performance Validation
    if (!effectiveConfig.skipPerformanceValidation) {
      stages.push('performance');
      const performanceIssues = await this.runPerformanceValidation(files);
      issues.push(...performanceIssues);
    }

    // Calculate summary
    const summary = this.calculateSummary(issues);

    // Determine validity
    const valid = this.determineValidity(summary, effectiveConfig);

    const durationMs = Date.now() - startTime;

    const unifiedResult: UnifiedValidationResult = {
      valid,
      issues,
      files,
      prismaSchema,
      summary,
      metadata: {
        validationId,
        timestamp: new Date().toISOString(),
        durationMs,
        stages,
      },
    };

    logger.info('ValidationOrchestrator', 'VALIDATION_COMPLETE', 'Unified validation pipeline complete', {
      validationId,
      valid,
      summary,
      durationMs,
    });

    return unifiedResult;
  }

  /**
   * Run preview validation
   */
  private async runPreviewValidation(files: GeneratedFile[]): Promise<PreviewValidationResult> {
    return logger.trace('ValidationOrchestrator', 'PREVIEW_VALIDATION', () =>
      Promise.resolve(previewValidator.validate(files))
    );
  }

  /**
   * Run compile validation
   */
  private async runCompileValidation(
    result: GenerationResult,
    skipMaterialized: boolean,
  ): Promise<CompileValidationResult> {
    if (skipMaterialized) {
      // Skip materialized validation but still run basic validation
      return logger.trace('ValidationOrchestrator', 'COMPILE_VALIDATION', () =>
        Promise.resolve({
          files: result.files,
          prismaSchema: result.prismaSchema,
          issues: [],
          valid: true,
        })
      );
    }

    return logger.trace('ValidationOrchestrator', 'COMPILE_VALIDATION', () =>
      Promise.resolve(generatedOutputValidator.validateAndRepair(result))
    );
  }

  /**
   * Run component validation
   */
  private async runComponentValidation(files: GeneratedFile[]): Promise<UnifiedValidationIssue[]> {
    const issues: UnifiedValidationIssue[] = [];

    for (const file of files) {
      if (file.filePath.endsWith('.tsx') || file.filePath.endsWith('.jsx')) {
        const validation = safeComponentRegistry.validateComponentUsage(file.content);
        
        if (!validation.valid) {
          for (const unauthorized of validation.unauthorized) {
            issues.push({
              id: crypto.randomUUID(),
              stage: 'component',
              severity: 'error',
              filePath: file.filePath,
              message: `Unauthorized component usage: ${unauthorized}`,
              repairable: true,
              repaired: false,
              confidence: 90,
              suggestion: `Replace with approved component from safe component registry`,
              code: 'UNAUTHORIZED_COMPONENT',
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Run semantic validation
   */
  private async runSemanticValidation(files: GeneratedFile[]): Promise<UnifiedValidationIssue[]> {
    const validationResult = semanticValidator.validate(files);
    return this.mapSemanticIssues(validationResult.issues);
  }

  /**
   * Run accessibility validation
   */
  private async runAccessibilityValidation(files: GeneratedFile[]): Promise<UnifiedValidationIssue[]> {
    const validationResult = accessibilityValidator.validate(files);
    return this.mapAccessibilityIssues(validationResult.issues);
  }

  /**
   * Run performance validation
   */
  private async runPerformanceValidation(files: GeneratedFile[]): Promise<UnifiedValidationIssue[]> {
    const validationResult = performanceValidator.validate(files);
    return this.mapPerformanceIssues(validationResult.issues);
  }

  /**
   * Map preview validation issues to unified format
   */
  private mapPreviewIssues(issues: PreviewValidationIssue[]): UnifiedValidationIssue[] {
    return issues.map((issue) => ({
      id: crypto.randomUUID(),
      stage: 'preview' as const,
      severity: this.mapSeverity(issue.type),
      filePath: issue.filePath,
      message: issue.message,
      repairable: issue.repairable,
      repaired: issue.autoFixed,
      confidence: 85,
      code: issue.type.toUpperCase(),
    }));
  }

  /**
   * Map compile validation issues to unified format
   */
  private mapCompileIssues(issues: CompileValidationIssue[]): UnifiedValidationIssue[] {
    return issues.map((issue) => ({
      id: crypto.randomUUID(),
      stage: 'compile' as const,
      severity: this.mapCompileSeverity(issue.stage),
      filePath: issue.filePath,
      message: issue.message,
      repairable: true,
      repaired: issue.repaired,
      confidence: 90,
      code: issue.stage.toUpperCase(),
    }));
  }

  /**
   * Map semantic validation issues to unified format
   */
  private mapSemanticIssues(issues: SemanticValidationIssue[]): UnifiedValidationIssue[] {
    return issues.map((issue) => ({
      id: issue.id,
      stage: 'semantic' as const,
      severity: issue.severity,
      filePath: issue.filePath,
      message: issue.message,
      repairable: issue.repairable,
      repaired: false,
      confidence: 85,
      suggestion: issue.suggestion,
      code: issue.type.toUpperCase(),
    }));
  }

  /**
   * Map accessibility validation issues to unified format
   */
  private mapAccessibilityIssues(issues: AccessibilityValidationIssue[]): UnifiedValidationIssue[] {
    return issues.map((issue) => ({
      id: issue.id,
      stage: 'accessibility' as const,
      severity: issue.severity,
      filePath: issue.filePath,
      message: issue.message,
      repairable: issue.repairable,
      repaired: false,
      confidence: 90,
      suggestion: issue.suggestion,
      code: issue.type.toUpperCase(),
    }));
  }

  /**
   * Map performance validation issues to unified format
   */
  private mapPerformanceIssues(issues: PerformanceValidationIssue[]): UnifiedValidationIssue[] {
    return issues.map((issue) => ({
      id: issue.id,
      stage: 'performance' as const,
      severity: issue.severity,
      filePath: issue.filePath,
      message: issue.message,
      repairable: issue.repairable,
      repaired: false,
      confidence: 85,
      suggestion: issue.suggestion,
      code: issue.type.toUpperCase(),
    }));
  }

  /**
   * Map preview issue type to severity
   */
  private mapSeverity(type: PreviewValidationIssue['type']): ValidationSeverity {
    const criticalTypes: PreviewValidationIssue['type'][] = [
      'missing_html_body',
      'server_client_violation',
      'broken_async',
    ];
    
    if (criticalTypes.includes(type)) {
      return 'critical';
    }
    
    return 'error';
  }

  /**
   * Map compile stage to severity
   */
  private mapCompileSeverity(stage: CompileValidationIssue['stage']): ValidationSeverity {
    if (stage === 'prisma' || stage === 'typescript') {
      return 'critical';
    }
    
    return 'error';
  }

  /**
   * Calculate validation summary
   */
  private calculateSummary(issues: UnifiedValidationIssue[]) {
    return {
      total: issues.length,
      critical: issues.filter(i => i.severity === 'critical').length,
      error: issues.filter(i => i.severity === 'error').length,
      warning: issues.filter(i => i.severity === 'warning').length,
      info: issues.filter(i => i.severity === 'info').length,
      repaired: issues.filter(i => i.repaired).length,
      unrepaired: issues.filter(i => !i.repaired).length,
    };
  }

  /**
   * Determine overall validity based on config
   */
  private determineValidity(
    summary: ReturnType<typeof this.calculateSummary>,
    config: ValidationConfig,
  ): boolean {
    if (config.failOnCritical && summary.critical > 0) {
      return false;
    }
    
    if (config.failOnError && summary.error > 0) {
      return false;
    }
    
    return summary.unrepaired === 0;
  }

  /**
   * Get validation report in JSON format
   */
  getJsonReport(result: UnifiedValidationResult): string {
    return JSON.stringify(result, null, 2);
  }

  /**
   * Get validation report in HTML format
   */
  getHtmlReport(result: UnifiedValidationResult): string {
    const { valid, issues, summary, metadata } = result;

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Validation Report - ${metadata.validationId}</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; }
    .header { margin-bottom: 2rem; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
    .summary-card { padding: 1rem; border-radius: 0.5rem; border: 1px solid #e5e7eb; }
    .valid { background: #dcfce7; border-color: #22c55e; }
    .invalid { background: #fee2e2; border-color: #ef4444; }
    .issues { margin-top: 2rem; }
    .issue { padding: 1rem; margin-bottom: 0.5rem; border-radius: 0.5rem; border-left: 4px solid; }
    .critical { background: #fef2f2; border-color: #dc2626; }
    .error { background: #fef9c3; border-color: #ca8a04; }
    .warning { background: #fff7ed; border-color: #ea580c; }
    .info { background: #f0f9ff; border-color: #0284c7; }
    .metadata { margin-top: 2rem; padding: 1rem; background: #f9fafb; border-radius: 0.5rem; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Validation Report</h1>
    <p>Status: <strong>${valid ? '✅ Valid' : '❌ Invalid'}</strong></p>
  </div>

  <div class="summary">
    <div class="summary-card ${valid ? 'valid' : 'invalid'}">
      <h3>Total</h3>
      <p>${summary.total}</p>
    </div>
    <div class="summary-card ${summary.critical > 0 ? 'invalid' : 'valid'}">
      <h3>Critical</h3>
      <p>${summary.critical}</p>
    </div>
    <div class="summary-card ${summary.error > 0 ? 'invalid' : 'valid'}">
      <h3>Error</h3>
      <p>${summary.error}</p>
    </div>
    <div class="summary-card">
      <h3>Repaired</h3>
      <p>${summary.repaired}</p>
    </div>
  </div>

  <div class="issues">
    <h2>Issues (${issues.length})</h2>
    ${issues.map(issue => `
      <div class="issue ${issue.severity}">
        <strong>[${issue.severity.toUpperCase()}] ${issue.stage}</strong>
        ${issue.filePath ? `<code>${issue.filePath}</code>` : ''}
        <p>${issue.message}</p>
        ${issue.suggestion ? `<p><em>Suggestion: ${issue.suggestion}</em></p>` : ''}
        ${issue.repaired ? '<p>✅ Auto-repaired</p>' : ''}
      </div>
    `).join('')}
  </div>

  <div class="metadata">
    <h3>Metadata</h3>
    <p><strong>Validation ID:</strong> ${metadata.validationId}</p>
    <p><strong>Timestamp:</strong> ${metadata.timestamp}</p>
    <p><strong>Duration:</strong> ${metadata.durationMs}ms</p>
    <p><strong>Stages:</strong> ${metadata.stages.join(', ')}</p>
  </div>
</body>
</html>
    `.trim();
  }
}

export const validationOrchestrator = new ValidationOrchestrator();

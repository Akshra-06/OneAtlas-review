/**
 * AI Output Calibration System
 * 
 * Calibrates and benchmarks AI-generated output quality across multiple dimensions:
 * - Generated output quality
 * - Domain differentiation
 * - Workflow realism
 * - Layout diversity
 * - Operational realism
 * - Anti-generic scoring
 * - Visual comparison benchmarking
 */

import type { AppUnderstanding } from '../schemas/app-understanding.schema';
import { logger } from '@oneatlas/shared';

export interface CalibrationMetrics {
  overallScore: number; // 0-100
  dimensions: {
    outputQuality: CalibrationQualityMetrics;
    domainDifferentiation: DomainMetrics;
    workflowRealism: WorkflowMetrics;
    layoutDiversity: LayoutMetrics;
    operationalRealism: OperationalMetrics;
    antiGeneric: AntiGenericMetrics;
  };
  recommendations: string[];
  benchmarkComparison?: BenchmarkComparison;
}

export interface CalibrationQualityMetrics {
  score: number; // 0-100
  completeness: number; // 0-100
  consistency: number; // 0-100
  accuracy: number; // 0-100
  issues: string[];
}

export interface DomainMetrics {
  score: number; // 0-100
  domainMatch: number; // 0-100
  domainSpecificFeatures: number; // 0-100
  terminologyAccuracy: number; // 0-100
  issues: string[];
}

export interface WorkflowMetrics {
  score: number; // 0-100
  workflowCoherence: number; // 0-100
  stepLogic: number; // 0-100
  triggerAccuracy: number; // 0-100
  issues: string[];
}

export interface LayoutMetrics {
  score: number; // 0-100
  templateVariety: number; // 0-100
  sectionDiversity: number; // 0-100
  navigationStructure: number; // 0-100
  issues: string[];
}

export interface OperationalMetrics {
  score: number; // 0-100
  kpiRealism: number; // 0-100
  businessLogic: number; // 0-100
  scaleAppropriateness: number; // 0-100
  issues: string[];
}

export interface AntiGenericMetrics {
  score: number; // 0-100
  namingOriginality: number; // 0-100
  patternVariety: number; // 0-100
  uniquenessScore: number; // 0-100
  issues: string[];
}

export interface BenchmarkComparison {
  vsPrevious: number; // Percentage change from previous
  vsBaseline: number; // Percentage change from baseline
  vsIndustry: number; // Percentage compared to industry standards
}

export interface CalibrationConfig {
  enableQualityChecks: boolean;
  enableDomainChecks: boolean;
  enableWorkflowChecks: boolean;
  enableLayoutChecks: boolean;
  enableOperationalChecks: boolean;
  enableAntiGenericChecks: boolean;
  enableBenchmarking: boolean;
  strictMode: boolean;
}

const DEFAULT_CONFIG: CalibrationConfig = {
  enableQualityChecks: true,
  enableDomainChecks: true,
  enableWorkflowChecks: true,
  enableLayoutChecks: true,
  enableOperationalChecks: true,
  enableAntiGenericChecks: true,
  enableBenchmarking: true,
  strictMode: false,
};

/**
 * AI Output Calibration System
 * 
 * Calibrates AI-generated output quality across multiple dimensions
 */
export class AIOutputCalibration {
  private config: CalibrationConfig;
  private baselineMetrics: CalibrationMetrics | null = null;
  private previousMetrics: CalibrationMetrics | null = null;

  constructor(config: Partial<CalibrationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Calibrate AI-generated understanding
   */
  calibrate(understanding: AppUnderstanding): CalibrationMetrics {
    const dimensions = {
      outputQuality: this.config.enableQualityChecks ? this.measureOutputQuality(understanding) : this.getDefaultQualityMetrics(),
      domainDifferentiation: this.config.enableDomainChecks ? this.measureDomainDifferentiation(understanding) : this.getDefaultDomainMetrics(),
      workflowRealism: this.config.enableWorkflowChecks ? this.measureWorkflowRealism(understanding) : this.getDefaultWorkflowMetrics(),
      layoutDiversity: this.config.enableLayoutChecks ? this.measureLayoutDiversity(understanding) : this.getDefaultLayoutMetrics(),
      operationalRealism: this.config.enableOperationalChecks ? this.measureOperationalRealism(understanding) : this.getDefaultOperationalMetrics(),
      antiGeneric: this.config.enableAntiGenericChecks ? this.measureAntiGeneric(understanding) : this.getDefaultAntiGenericMetrics(),
    };

    const overallScore = this.calculateOverallScore(dimensions);
    const recommendations = this.generateRecommendations(dimensions);
    const benchmarkComparison = this.config.enableBenchmarking ? this.generateBenchmarkComparison(dimensions) : undefined;

    const metrics: CalibrationMetrics = {
      overallScore,
      dimensions,
      recommendations,
      benchmarkComparison,
    };

    // Update tracking
    this.previousMetrics = this.baselineMetrics;
    if (!this.baselineMetrics) {
      this.baselineMetrics = metrics;
    }

    logger.info('AIOutputCalibration', 'CALIBRATION_COMPLETE', 'AI output calibrated', {
      overallScore,
      qualityScore: dimensions.outputQuality.score,
      domainScore: dimensions.domainDifferentiation.score,
      workflowScore: dimensions.workflowRealism.score,
      layoutScore: dimensions.layoutDiversity.score,
      operationalScore: dimensions.operationalRealism.score,
      antiGenericScore: dimensions.antiGeneric.score,
    });

    return metrics;
  }

  /**
   * Measure output quality
   */
  private measureOutputQuality(understanding: AppUnderstanding): CalibrationQualityMetrics {
    const issues: string[] = [];
    let completeness = 100;
    let consistency = 100;
    let accuracy = 100;

    // Check completeness
    if (!understanding.appName || understanding.appName.trim() === '') {
      completeness -= 20;
      issues.push('Missing app name');
    }
    if (!understanding.appType) {
      completeness -= 15;
      issues.push('Missing app type');
    }
    if (!understanding.entities || understanding.entities.length === 0) {
      completeness -= 25;
      issues.push('No entities defined');
    }
    if (!understanding.pages || understanding.pages.length === 0) {
      completeness -= 20;
      issues.push('No pages defined');
    }
    if (!understanding.workflows || understanding.workflows.length === 0) {
      completeness -= 10;
      issues.push('No workflows defined');
    }

    // Check consistency
    const entityNames = new Set(understanding.entities?.map(e => e.name) || []);
    understanding.pages?.forEach(page => {
      page.requiredEntities?.forEach(entity => {
        if (!entityNames.has(entity)) {
          consistency -= 5;
          issues.push(`Page "${page.name}" references undefined entity "${entity}"`);
        }
      });
    });

    // Check accuracy (enum values for select fields)
    understanding.entities?.forEach(entity => {
      entity.attributes?.forEach(attr => {
        if (attr.uiComponent && ['Select', 'Combobox', 'Radio', 'Multiselect'].includes(attr.uiComponent)) {
          if (!attr.enumValues || attr.enumValues.length === 0) {
            accuracy -= 10;
            issues.push(`Entity "${entity.name}" attribute "${attr.name}" has Select UI component but no enum values`);
          }
        }
      });
    });

    const score = Math.round((completeness + consistency + accuracy) / 3);

    return {
      score,
      completeness: Math.max(0, completeness),
      consistency: Math.max(0, consistency),
      accuracy: Math.max(0, accuracy),
      issues,
    };
  }

  /**
   * Measure domain differentiation
   */
  private measureDomainDifferentiation(understanding: AppUnderstanding): DomainMetrics {
    const issues: string[] = [];
    let domainMatch = 100;
    let domainSpecificFeatures = 100;
    let terminologyAccuracy = 100;

    const domain = this.inferDomain(understanding);
    const expectedTerms = this.getExpectedDomainTerms(domain);
    const actualTerms = this.extractTerms(understanding);

    // Check domain match
    if (domain === 'generic') {
      domainMatch -= 30;
      issues.push('Could not infer specific domain from entities');
    }

    // Check domain-specific features
    const featureMatches = expectedTerms.filter(term => actualTerms.includes(term)).length;
    domainSpecificFeatures = Math.round((featureMatches / Math.max(1, expectedTerms.length)) * 100);
    if (domainSpecificFeatures < 50) {
      issues.push(`Low domain-specific feature usage (${featureMatches}/${expectedTerms.length} expected terms)`);
    }

    // Check terminology accuracy
    const genericTerms = ['dashboard', 'overview', 'summary', 'list', 'detail', 'create', 'edit'];
    const genericUsage = understanding.pages?.filter(p => genericTerms.some(t => p.name.toLowerCase().includes(t))).length || 0;
    terminologyAccuracy = Math.max(0, 100 - (genericUsage * 10));
    if (genericUsage > 2) {
      issues.push(`High usage of generic terminology (${genericUsage} pages with generic names)`);
    }

    const score = Math.round((domainMatch + domainSpecificFeatures + terminologyAccuracy) / 3);

    return {
      score,
      domainMatch: Math.max(0, domainMatch),
      domainSpecificFeatures,
      terminologyAccuracy,
      issues,
    };
  }

  /**
   * Measure workflow realism
   */
  private measureWorkflowRealism(understanding: AppUnderstanding): WorkflowMetrics {
    const issues: string[] = [];
    let workflowCoherence = 100;
    let stepLogic = 100;
    let triggerAccuracy = 100;

    if (!understanding.workflows || understanding.workflows.length === 0) {
      return {
        score: 50,
        workflowCoherence: 50,
        stepLogic: 50,
        triggerAccuracy: 50,
        issues: ['No workflows defined'],
      };
    }

    understanding.workflows.forEach(workflow => {
      // Check trigger accuracy
      const validTriggers = ['user_action', 'scheduled', 'system_event'];
      if (!validTriggers.includes(workflow.trigger)) {
        triggerAccuracy -= 15;
        issues.push(`Workflow "${workflow.name}" has invalid trigger type: ${workflow.trigger}`);
      }

      // Check step logic based on description length and complexity
      const descriptionLength = workflow.description?.length || 0;
      if (descriptionLength < 20) {
        stepLogic -= 20;
        issues.push(`Workflow "${workflow.name}" has too brief description (likely lacks step logic)`);
      } else if (descriptionLength < 50) {
        stepLogic -= 10;
        issues.push(`Workflow "${workflow.name}" description could be more detailed`);
      }

      // Check workflow coherence based on description quality
      const stepKeywords = ['step', 'then', 'next', 'after', 'before', 'when', 'if', 'else'];
      const hasStepLogic = stepKeywords.some(keyword => workflow.description?.toLowerCase().includes(keyword));
      if (!hasStepLogic) {
        workflowCoherence -= 15;
        issues.push(`Workflow "${workflow.name}" description lacks clear step logic`);
      }
    });

    const score = Math.round((workflowCoherence + stepLogic + triggerAccuracy) / 3);

    return {
      score,
      workflowCoherence: Math.max(0, workflowCoherence),
      stepLogic: Math.max(0, stepLogic),
      triggerAccuracy: Math.max(0, triggerAccuracy),
      issues,
    };
  }

  /**
   * Measure layout diversity
   */
  private measureLayoutDiversity(understanding: AppUnderstanding): LayoutMetrics {
    const issues: string[] = [];
    let templateVariety = 100;
    let sectionDiversity = 100;
    let navigationStructure = 100;

    if (!understanding.pages || understanding.pages.length === 0) {
      return {
        score: 50,
        templateVariety: 50,
        sectionDiversity: 50,
        navigationStructure: 50,
        issues: ['No pages defined'],
      };
    }

    // Check template variety
    const templates = new Set(understanding.pages.map(p => p.layoutTemplate));
    templateVariety = Math.round((templates.size / Math.max(1, understanding.pages.length)) * 100);
    if (templates.size === 1 && understanding.pages.length > 3) {
      issues.push(`All pages use the same layout template: ${Array.from(templates)[0]}`);
    }

    // Check section diversity
    const sectionCounts = understanding.pages.map(p => p.requiredEntities?.length || 0);
    const avgSectionCount = sectionCounts.reduce((a, b) => a + b, 0) / Math.max(1, sectionCounts.length);
    const sectionVariance = this.calculateVariance(sectionCounts);
    sectionDiversity = Math.max(0, 100 - sectionVariance);
    if (sectionVariance < 10) {
      issues.push('Low section count diversity across pages');
    }

    // Check navigation structure
    const routes = understanding.pages.map(p => p.route);
    const routeDepths = routes.map(r => r.split('/').filter(Boolean).length);
    const uniqueDepths = new Set(routeDepths);
    navigationStructure = Math.round((uniqueDepths.size / Math.max(1, routeDepths.length)) * 100);
    if (uniqueDepths.size === 1) {
      issues.push('All pages have the same navigation depth');
    }

    const score = Math.round((templateVariety + sectionDiversity + navigationStructure) / 3);

    return {
      score,
      templateVariety,
      sectionDiversity,
      navigationStructure,
      issues,
    };
  }

  /**
   * Measure operational realism
   */
  private measureOperationalRealism(understanding: AppUnderstanding): OperationalMetrics {
    const issues: string[] = [];
    let kpiRealism = 100;
    let businessLogic = 100;
    let scaleAppropriateness = 100;

    // Check KPI realism
    if (!understanding.realisticKPIs) {
      kpiRealism -= 40;
      issues.push('No realistic KPIs defined');
    } else if (Object.keys(understanding.realisticKPIs).length === 0) {
      kpiRealism -= 30;
      issues.push('Realistic KPIs object is empty');
    }

    // Check business logic
    if (!understanding.businessPriorities) {
      businessLogic -= 30;
      issues.push('No business priorities defined');
    } else if (!Array.isArray(understanding.businessPriorities) || understanding.businessPriorities.length === 0) {
      businessLogic -= 20;
      issues.push('Business priorities array is empty');
    }

    // Check scale appropriateness
    if (!understanding.operationalContext) {
      scaleAppropriateness -= 30;
      issues.push('No operational context defined');
    }

    // Check role-based dashboards
    if (!understanding.roleBasedDashboards) {
      scaleAppropriateness -= 20;
      issues.push('No role-based dashboards defined');
    }

    const score = Math.round((kpiRealism + businessLogic + scaleAppropriateness) / 3);

    return {
      score,
      kpiRealism: Math.max(0, kpiRealism),
      businessLogic: Math.max(0, businessLogic),
      scaleAppropriateness: Math.max(0, scaleAppropriateness),
      issues,
    };
  }

  /**
   * Measure anti-generic metrics
   */
  private measureAntiGeneric(understanding: AppUnderstanding): AntiGenericMetrics {
    const issues: string[] = [];
    let namingOriginality = 100;
    let patternVariety = 100;
    let uniquenessScore = 100;

    // Check naming originality
    const genericNames = ['Dashboard', 'Overview', 'Summary', 'List', 'Detail', 'Create', 'Edit', 'Settings'];
    const genericPageCount = understanding.pages?.filter(p => genericNames.includes(p.name)).length || 0;
    namingOriginality = Math.max(0, 100 - (genericPageCount * 15));
    if (genericPageCount > 0) {
      issues.push(`${genericPageCount} pages have generic names`);
    }

    // Check pattern variety
    const layoutTemplates = new Set(understanding.pages?.map(p => p.layoutTemplate) || []);
    patternVariety = Math.round((layoutTemplates.size / Math.max(1, understanding.pages?.length || 1)) * 100);
    if (layoutTemplates.size === 1 && understanding.pages?.length > 2) {
      issues.push('All pages use the same layout template');
    }

    // Check uniqueness score
    const entityNames = new Set(understanding.entities?.map(e => e.name) || []);
    const workflowNames = new Set(understanding.workflows?.map(w => w.name) || []);
    const pageNames = new Set(understanding.pages?.map(p => p.name) || []);
    const totalNames = entityNames.size + workflowNames.size + pageNames.size;
    const uniqueNames = new Set([...entityNames, ...workflowNames, ...pageNames]).size;
    uniquenessScore = Math.round((uniqueNames / Math.max(1, totalNames)) * 100);
    if (uniqueNames < totalNames) {
      issues.push(`${totalNames - uniqueNames} duplicate names across entities, workflows, and pages`);
    }

    const score = Math.round((namingOriginality + patternVariety + uniquenessScore) / 3);

    return {
      score,
      namingOriginality,
      patternVariety,
      uniquenessScore,
      issues,
    };
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(dimensions: CalibrationMetrics['dimensions']): number {
    const weights = {
      outputQuality: 0.2,
      domainDifferentiation: 0.15,
      workflowRealism: 0.15,
      layoutDiversity: 0.15,
      operationalRealism: 0.2,
      antiGeneric: 0.15,
    };

    const weightedScore =
      dimensions.outputQuality.score * weights.outputQuality +
      dimensions.domainDifferentiation.score * weights.domainDifferentiation +
      dimensions.workflowRealism.score * weights.workflowRealism +
      dimensions.layoutDiversity.score * weights.layoutDiversity +
      dimensions.operationalRealism.score * weights.operationalRealism +
      dimensions.antiGeneric.score * weights.antiGeneric;

    return Math.round(weightedScore);
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(dimensions: CalibrationMetrics['dimensions']): string[] {
    const recommendations: string[] = [];

    // Output quality recommendations
    if (dimensions.outputQuality.score < 70) {
      if (dimensions.outputQuality.completeness < 70) {
        recommendations.push('Improve completeness by ensuring all required fields (app name, entities, pages, workflows) are defined');
      }
      if (dimensions.outputQuality.consistency < 70) {
        recommendations.push('Fix entity references in pages to ensure all referenced entities exist');
      }
      if (dimensions.outputQuality.accuracy < 70) {
        recommendations.push('Add enum values for all Select/Combobox/Radio/Multiselect UI components');
      }
    }

    // Domain differentiation recommendations
    if (dimensions.domainDifferentiation.score < 70) {
      recommendations.push('Use domain-specific terminology and features instead of generic terms');
      recommendations.push('Add domain-specific entities and workflows that reflect the actual business domain');
    }

    // Workflow realism recommendations
    if (dimensions.workflowRealism.score < 70) {
      recommendations.push('Ensure workflows have valid trigger types (user_action, scheduled, system_event)');
      recommendations.push('Add more steps to workflows to reflect realistic business processes');
    }

    // Layout diversity recommendations
    if (dimensions.layoutDiversity.score < 70) {
      recommendations.push('Use multiple layout templates across pages for visual variety');
      recommendations.push('Vary section counts and navigation depths across pages');
    }

    // Operational realism recommendations
    if (dimensions.operationalRealism.score < 70) {
      recommendations.push('Define realistic KPIs based on the business context and domain');
      recommendations.push('Add business priorities with appropriate urgency levels');
      recommendations.push('Define operational context including scale and team size');
    }

    // Anti-generic recommendations
    if (dimensions.antiGeneric.score < 70) {
      recommendations.push('Use domain-specific page names instead of generic terms like "Dashboard" or "Overview"');
      recommendations.push('Vary layout templates and patterns across pages');
      recommendations.push('Ensure unique naming across entities, workflows, and pages');
    }

    return recommendations;
  }

  /**
   * Generate benchmark comparison
   */
  private generateBenchmarkComparison(dimensions: CalibrationMetrics['dimensions']): BenchmarkComparison {
    const currentScore = this.calculateOverallScore(dimensions);
    
    let vsPrevious = 0;
    if (this.previousMetrics) {
      vsPrevious = Math.round(((currentScore - this.previousMetrics.overallScore) / Math.max(1, this.previousMetrics.overallScore)) * 100);
    }

    let vsBaseline = 0;
    if (this.baselineMetrics) {
      vsBaseline = Math.round(((currentScore - this.baselineMetrics.overallScore) / Math.max(1, this.baselineMetrics.overallScore)) * 100);
    }

    // Industry standard (assume 75 as industry baseline)
    const industryStandard = 75;
    const vsIndustry = Math.round(((currentScore - industryStandard) / industryStandard) * 100);

    return {
      vsPrevious,
      vsBaseline,
      vsIndustry,
    };
  }

  /**
   * Infer domain from understanding
   */
  private inferDomain(understanding: AppUnderstanding): string {
    const entityNames = understanding.entities?.map(e => e.name.toLowerCase()).join(' ') || '';
    const pageNames = understanding.pages?.map(p => p.name.toLowerCase()).join(' ') || '';

    const combined = `${entityNames} ${pageNames}`;

    if (combined.includes('patient') || combined.includes('medical') || combined.includes('doctor')) return 'healthcare';
    if (combined.includes('customer') || combined.includes('lead') || combined.includes('deal')) return 'crm';
    if (combined.includes('order') || combined.includes('product') || combined.includes('inventory')) return 'ecommerce';
    if (combined.includes('candidate') || combined.includes('job') || combined.includes('application')) return 'ats';
    if (combined.includes('invoice') || combined.includes('payment') || combined.includes('budget')) return 'finance';
    if (combined.includes('shipment') || combined.includes('delivery') || combined.includes('fleet')) return 'logistics';
    if (combined.includes('ticket') || combined.includes('support') || combined.includes('issue')) return 'support';
    if (combined.includes('task') || combined.includes('project') || combined.includes('milestone')) return 'project_management';
    if (combined.includes('course') || combined.includes('student') || combined.includes('enrollment')) return 'education';

    return 'generic';
  }

  /**
   * Get expected domain terms
   */
  private getExpectedDomainTerms(domain: string): string[] {
    const domainTerms: Record<string, string[]> = {
      healthcare: ['patient', 'appointment', 'medical', 'doctor', 'diagnosis', 'treatment', 'prescription'],
      crm: ['customer', 'lead', 'deal', 'pipeline', 'contact', 'opportunity', 'account'],
      ecommerce: ['product', 'order', 'inventory', 'cart', 'checkout', 'shipping', 'payment'],
      ats: ['candidate', 'job', 'application', 'interview', 'hiring', 'resume', 'offer'],
      finance: ['invoice', 'payment', 'budget', 'expense', 'revenue', 'transaction', 'account'],
      logistics: ['shipment', 'delivery', 'fleet', 'route', 'tracking', 'warehouse', 'carrier'],
      support: ['ticket', 'issue', 'resolution', 'sla', 'agent', 'queue', 'escalation'],
      project_management: ['task', 'project', 'milestone', 'sprint', 'team', 'deadline', 'workflow'],
      education: ['course', 'student', 'enrollment', 'assignment', 'grade', 'curriculum', 'instructor'],
      generic: [],
    };

    return domainTerms[domain] || [];
  }

  /**
   * Extract terms from understanding
   */
  private extractTerms(understanding: AppUnderstanding): string[] {
    const terms: string[] = [];

    understanding.entities?.forEach(e => terms.push(e.name.toLowerCase()));
    understanding.pages?.forEach(p => terms.push(p.name.toLowerCase()));
    understanding.workflows?.forEach(w => terms.push(w.name.toLowerCase()));

    return terms;
  }

  /**
   * Calculate variance
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Get default metrics
   */
  private getDefaultQualityMetrics(): CalibrationQualityMetrics {
    return {
      score: 50,
      completeness: 50,
      consistency: 50,
      accuracy: 50,
      issues: ['Quality checks disabled'],
    };
  }

  private getDefaultDomainMetrics(): DomainMetrics {
    return {
      score: 50,
      domainMatch: 50,
      domainSpecificFeatures: 50,
      terminologyAccuracy: 50,
      issues: ['Domain checks disabled'],
    };
  }

  private getDefaultWorkflowMetrics(): WorkflowMetrics {
    return {
      score: 50,
      workflowCoherence: 50,
      stepLogic: 50,
      triggerAccuracy: 50,
      issues: ['Workflow checks disabled'],
    };
  }

  private getDefaultLayoutMetrics(): LayoutMetrics {
    return {
      score: 50,
      templateVariety: 50,
      sectionDiversity: 50,
      navigationStructure: 50,
      issues: ['Layout checks disabled'],
    };
  }

  private getDefaultOperationalMetrics(): OperationalMetrics {
    return {
      score: 50,
      kpiRealism: 50,
      businessLogic: 50,
      scaleAppropriateness: 50,
      issues: ['Operational checks disabled'],
    };
  }

  private getDefaultAntiGenericMetrics(): AntiGenericMetrics {
    return {
      score: 50,
      namingOriginality: 50,
      patternVariety: 50,
      uniquenessScore: 50,
      issues: ['Anti-generic checks disabled'],
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CalibrationConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('AIOutputCalibration', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): CalibrationConfig {
    return { ...this.config };
  }

  /**
   * Reset baseline
   */
  resetBaseline(): void {
    this.baselineMetrics = null;
    this.previousMetrics = null;
    logger.info('AIOutputCalibration', 'BASELINE_RESET', 'Baseline metrics reset');
  }
}

export const aiOutputCalibration = new AIOutputCalibration();

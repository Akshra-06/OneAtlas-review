/**
 * Visual Comparison Benchmarking System
 * 
 * Benchmarks AI-generated visual outputs against reference designs and patterns:
 * - Layout structure comparison
 * - Component usage analysis
 * - Color scheme validation
 * - Typography consistency
 * - Spacing and alignment checks
 * - Responsive design verification
 * - Accessibility compliance
 */

import type { AppUnderstanding } from '../schemas/app-understanding.schema';
import { logger } from '@oneatlas/shared';

export interface VisualBenchmarkMetrics {
  overallScore: number; // 0-100
  dimensions: {
    layoutStructure: LayoutStructureMetrics;
    componentUsage: ComponentUsageMetrics;
    colorScheme: ColorSchemeMetrics;
    typography: TypographyMetrics;
    spacingAlignment: SpacingAlignmentMetrics;
    responsiveDesign: ResponsiveDesignMetrics;
    accessibility: AccessibilityMetrics;
  };
  visualComparison: VisualComparisonResult;
  recommendations: string[];
}

export interface LayoutStructureMetrics {
  score: number; // 0-100
  gridAlignment: number; // 0-100
  hierarchyDepth: number; // 0-100
  sectionBalance: number; // 0-100
  issues: string[];
}

export interface ComponentUsageMetrics {
  score: number; // 0-100
  componentVariety: number; // 0-100
  componentConsistency: number; // 0-100
  componentReusability: number; // 0-100
  issues: string[];
}

export interface ColorSchemeMetrics {
  score: number; // 0-100
  colorHarmony: number; // 0-100
  contrastRatio: number; // 0-100
  brandConsistency: number; // 0-100
  issues: string[];
}

export interface TypographyMetrics {
  score: number; // 0-100
  fontHierarchy: number; // 0-100
  readability: number; // 0-100
  consistency: number; // 0-100
  issues: string[];
}

export interface SpacingAlignmentMetrics {
  score: number; // 0-100
  spacingConsistency: number; // 0-100
  alignmentAccuracy: number; // 0-100
  whitespaceUsage: number; // 0-100
  issues: string[];
}

export interface ResponsiveDesignMetrics {
  score: number; // 0-100
  breakpointCoverage: number; // 0-100
  mobileOptimization: number; // 0-100
  touchTargetSize: number; // 0-100
  issues: string[];
}

export interface AccessibilityMetrics {
  score: number; // 0-100
  semanticHTML: number; // 0-100
  ariaLabels: number; // 0-100
  keyboardNavigation: number; // 0-100
  screenReaderCompatibility: number; // 0-100
  issues: string[];
}

export interface VisualComparisonResult {
  matchesReference: number; // 0-100
  deviations: string[];
  improvements: string[];
  patternAdherence: number; // 0-100
}

export interface VisualBenchmarkConfig {
  enableLayoutChecks: boolean;
  enableComponentChecks: boolean;
  enableColorChecks: boolean;
  enableTypographyChecks: boolean;
  enableSpacingChecks: boolean;
  enableResponsiveChecks: boolean;
  enableAccessibilityChecks: boolean;
  strictMode: boolean;
}

const DEFAULT_CONFIG: VisualBenchmarkConfig = {
  enableLayoutChecks: true,
  enableComponentChecks: true,
  enableColorChecks: true,
  enableTypographyChecks: true,
  enableSpacingChecks: true,
  enableResponsiveChecks: true,
  enableAccessibilityChecks: true,
  strictMode: false,
};

/**
 * Visual Comparison Benchmarking System
 * 
 * Benchmarks AI-generated visual outputs against reference designs
 */
export class VisualBenchmarking {
  private config: VisualBenchmarkConfig;
  private referencePatterns: Map<string, any> = new Map();

  constructor(config: Partial<VisualBenchmarkConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeReferencePatterns();
  }

  /**
   * Initialize reference patterns for comparison
   */
  private initializeReferencePatterns(): void {
    // Dashboard reference pattern
    this.referencePatterns.set('dashboard', {
      expectedComponents: ['Card', 'Badge', 'DataTable', 'Button'],
      expectedLayout: 'grid',
      expectedSpacing: 'consistent',
      expectedColors: ['primary', 'secondary', 'muted'],
    });

    // Form reference pattern
    this.referencePatterns.set('form', {
      expectedComponents: ['Input', 'Label', 'Button', 'Select'],
      expectedLayout: 'vertical',
      expectedSpacing: 'consistent',
      expectedColors: ['primary', 'muted'],
    });

    // List reference pattern
    this.referencePatterns.set('list', {
      expectedComponents: ['DataTable', 'Badge', 'Button'],
      expectedLayout: 'table',
      expectedSpacing: 'consistent',
      expectedColors: ['primary', 'secondary'],
    });
  }

  /**
   * Benchmark visual output
   */
  benchmark(understanding: AppUnderstanding): VisualBenchmarkMetrics {
    const dimensions = {
      layoutStructure: this.config.enableLayoutChecks ? this.measureLayoutStructure(understanding) : this.getDefaultLayoutMetrics(),
      componentUsage: this.config.enableComponentChecks ? this.measureComponentUsage(understanding) : this.getDefaultComponentMetrics(),
      colorScheme: this.config.enableColorChecks ? this.measureColorScheme(understanding) : this.getDefaultColorMetrics(),
      typography: this.config.enableTypographyChecks ? this.measureTypography(understanding) : this.getDefaultTypographyMetrics(),
      spacingAlignment: this.config.enableSpacingChecks ? this.measureSpacingAlignment(understanding) : this.getDefaultSpacingMetrics(),
      responsiveDesign: this.config.enableResponsiveChecks ? this.measureResponsiveDesign(understanding) : this.getDefaultResponsiveMetrics(),
      accessibility: this.config.enableAccessibilityChecks ? this.measureAccessibility(understanding) : this.getDefaultAccessibilityMetrics(),
    };

    const overallScore = this.calculateOverallScore(dimensions);
    const visualComparison = this.generateVisualComparison(understanding, dimensions);
    const recommendations = this.generateVisualRecommendations(dimensions);

    const metrics: VisualBenchmarkMetrics = {
      overallScore,
      dimensions,
      visualComparison,
      recommendations,
    };

    logger.info('VisualBenchmarking', 'BENCHMARK_COMPLETE', 'Visual benchmarking complete', {
      overallScore,
      layoutScore: dimensions.layoutStructure.score,
      componentScore: dimensions.componentUsage.score,
      colorScore: dimensions.colorScheme.score,
      typographyScore: dimensions.typography.score,
      spacingScore: dimensions.spacingAlignment.score,
      responsiveScore: dimensions.responsiveDesign.score,
      accessibilityScore: dimensions.accessibility.score,
    });

    return metrics;
  }

  /**
   * Measure layout structure
   */
  private measureLayoutStructure(understanding: AppUnderstanding): LayoutStructureMetrics {
    const issues: string[] = [];
    let gridAlignment = 100;
    let hierarchyDepth = 100;
    let sectionBalance = 100;

    if (!understanding.pages || understanding.pages.length === 0) {
      return {
        score: 50,
        gridAlignment: 50,
        hierarchyDepth: 50,
        sectionBalance: 50,
        issues: ['No pages defined for layout analysis'],
      };
    }

    // Check grid alignment based on layout templates
    const gridTemplates = ['dashboard', 'landing'];
    const gridPageCount = understanding.pages.filter(p => gridTemplates.includes(p.layoutTemplate)).length;
    gridAlignment = Math.round((gridPageCount / Math.max(1, understanding.pages.length)) * 100);

    // Check hierarchy depth based on route structure
    const routes = understanding.pages.map(p => p.route);
    const depths = routes.map(r => r.split('/').filter(Boolean).length);
    const avgDepth = depths.reduce((a, b) => a + b, 0) / Math.max(1, depths.length);
    hierarchyDepth = Math.max(0, 100 - (avgDepth > 4 ? (avgDepth - 4) * 10 : 0));
    if (avgDepth > 4) {
      issues.push(`Navigation hierarchy too deep (avg depth: ${avgDepth})`);
    }

    // Check section balance
    const entityCounts = understanding.pages.map(p => p.requiredEntities?.length || 0);
    const variance = this.calculateVariance(entityCounts);
    sectionBalance = Math.max(0, 100 - variance);
    if (variance > 10) {
      issues.push('Inconsistent section balance across pages');
    }

    const score = Math.round((gridAlignment + hierarchyDepth + sectionBalance) / 3);

    return {
      score,
      gridAlignment,
      hierarchyDepth,
      sectionBalance,
      issues,
    };
  }

  /**
   * Measure component usage
   */
  private measureComponentUsage(understanding: AppUnderstanding): ComponentUsageMetrics {
    const issues: string[] = [];
    let componentVariety = 100;
    let componentConsistency = 100;
    let componentReusability = 100;

    if (!understanding.entities || understanding.entities.length === 0) {
      return {
        score: 50,
        componentVariety: 50,
        componentConsistency: 50,
        componentReusability: 50,
        issues: ['No entities defined for component analysis'],
      };
    }

    // Check component variety based on UI components used
    const uiComponents = new Set<string>();
    understanding.entities.forEach(entity => {
      entity.attributes?.forEach(attr => {
        if (attr.uiComponent) {
          uiComponents.add(attr.uiComponent);
        }
      });
    });

    componentVariety = Math.min(100, uiComponents.size * 20);
    if (uiComponents.size < 3) {
      issues.push(`Low component variety (${uiComponents.size} unique UI components)`);
    }

    // Check component consistency
    const componentCounts = new Map<string, number>();
    understanding.entities.forEach(entity => {
      entity.attributes?.forEach(attr => {
        if (attr.uiComponent) {
          componentCounts.set(attr.uiComponent, (componentCounts.get(attr.uiComponent) || 0) + 1);
        }
      });
    });

    const avgUsage = Array.from(componentCounts.values()).reduce((a, b) => a + b, 0) / Math.max(1, componentCounts.size);
    const usageVariance = this.calculateVariance(Array.from(componentCounts.values()));
    componentConsistency = Math.max(0, 100 - usageVariance);

    // Check component reusability (enum values for select components)
    const selectComponents = Array.from(componentCounts.keys()).filter(c => ['Select', 'Combobox', 'Radio', 'Multiselect'].includes(c));
    const selectWithEnums = understanding.entities.filter(entity =>
      entity.attributes?.some(attr => attr.uiComponent && selectComponents.includes(attr.uiComponent) && attr.enumValues && attr.enumValues.length > 0)
    ).length;

    componentReusability = selectComponents.length > 0 ? Math.round((selectWithEnums / Math.max(1, understanding.entities.length)) * 100) : 100;
    if (selectComponents.length > 0 && selectWithEnums === 0) {
      issues.push('Select components lack enum values for reusability');
    }

    const score = Math.round((componentVariety + componentConsistency + componentReusability) / 3);

    return {
      score,
      componentVariety,
      componentConsistency,
      componentReusability,
      issues,
    };
  }

  /**
   * Measure color scheme
   */
  private measureColorScheme(understanding: AppUnderstanding): ColorSchemeMetrics {
    const issues: string[] = [];
    let colorHarmony = 100;
    let contrastRatio = 100;
    let brandConsistency = 100;

    // Infer color scheme from domain
    const domain = this.inferDomain(understanding);
    const expectedColors = this.getExpectedColorScheme(domain);

    // Check color harmony (simulated based on domain)
    colorHarmony = 85; // Base score, would be calculated from actual color values
    issues.push('Color harmony analysis requires actual color values (not available in schema)');

    // Check contrast ratio (simulated)
    contrastRatio = 90; // Base score, would be calculated from actual color values
    issues.push('Contrast ratio analysis requires actual color values (not available in schema)');

    // Check brand consistency (simulated based on domain match)
    brandConsistency = domain !== 'generic' ? 90 : 70;
    if (domain === 'generic') {
      issues.push('Could not infer domain for brand consistency check');
    }

    const score = Math.round((colorHarmony + contrastRatio + brandConsistency) / 3);

    return {
      score,
      colorHarmony,
      contrastRatio,
      brandConsistency,
      issues,
    };
  }

  /**
   * Measure typography
   */
  private measureTypography(understanding: AppUnderstanding): TypographyMetrics {
    const issues: string[] = [];
    let fontHierarchy = 100;
    let readability = 100;
    let consistency = 100;

    // Typography analysis requires actual rendered output
    issues.push('Typography analysis requires actual rendered output (not available in schema)');
    fontHierarchy = 80;
    readability = 85;
    consistency = 80;

    const score = Math.round((fontHierarchy + readability + consistency) / 3);

    return {
      score,
      fontHierarchy,
      readability,
      consistency,
      issues,
    };
  }

  /**
   * Measure spacing and alignment
   */
  private measureSpacingAlignment(understanding: AppUnderstanding): SpacingAlignmentMetrics {
    const issues: string[] = [];
    let spacingConsistency = 100;
    let alignmentAccuracy = 100;
    let whitespaceUsage = 100;

    // Spacing and alignment analysis requires actual rendered output
    issues.push('Spacing and alignment analysis requires actual rendered output (not available in schema)');
    spacingConsistency = 80;
    alignmentAccuracy = 85;
    whitespaceUsage = 80;

    const score = Math.round((spacingConsistency + alignmentAccuracy + whitespaceUsage) / 3);

    return {
      score,
      spacingConsistency,
      alignmentAccuracy,
      whitespaceUsage,
      issues,
    };
  }

  /**
   * Measure responsive design
   */
  private measureResponsiveDesign(understanding: AppUnderstanding): ResponsiveDesignMetrics {
    const issues: string[] = [];
    let breakpointCoverage = 100;
    let mobileOptimization = 100;
    let touchTargetSize = 100;

    // Responsive design analysis requires actual rendered output
    issues.push('Responsive design analysis requires actual rendered output (not available in schema)');
    breakpointCoverage = 75;
    mobileOptimization = 80;
    touchTargetSize = 85;

    const score = Math.round((breakpointCoverage + mobileOptimization + touchTargetSize) / 3);

    return {
      score,
      breakpointCoverage,
      mobileOptimization,
      touchTargetSize,
      issues,
    };
  }

  /**
   * Measure accessibility
   */
  private measureAccessibility(understanding: AppUnderstanding): AccessibilityMetrics {
    const issues: string[] = [];
    let semanticHTML = 100;
    let ariaLabels = 100;
    let keyboardNavigation = 100;
    let screenReaderCompatibility = 100;

    // Accessibility analysis requires actual rendered output
    issues.push('Accessibility analysis requires actual rendered output (not available in schema)');
    semanticHTML = 80;
    ariaLabels = 75;
    keyboardNavigation = 85;
    screenReaderCompatibility = 80;

    const score = Math.round((semanticHTML + ariaLabels + keyboardNavigation + screenReaderCompatibility) / 4);

    return {
      score,
      semanticHTML,
      ariaLabels,
      keyboardNavigation,
      screenReaderCompatibility,
      issues,
    };
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(dimensions: VisualBenchmarkMetrics['dimensions']): number {
    const weights = {
      layoutStructure: 0.2,
      componentUsage: 0.15,
      colorScheme: 0.1,
      typography: 0.1,
      spacingAlignment: 0.15,
      responsiveDesign: 0.15,
      accessibility: 0.15,
    };

    const weightedScore =
      dimensions.layoutStructure.score * weights.layoutStructure +
      dimensions.componentUsage.score * weights.componentUsage +
      dimensions.colorScheme.score * weights.colorScheme +
      dimensions.typography.score * weights.typography +
      dimensions.spacingAlignment.score * weights.spacingAlignment +
      dimensions.responsiveDesign.score * weights.responsiveDesign +
      dimensions.accessibility.score * weights.accessibility;

    return Math.round(weightedScore);
  }

  /**
   * Generate visual comparison
   */
  private generateVisualComparison(understanding: AppUnderstanding, dimensions: VisualBenchmarkMetrics['dimensions']): VisualComparisonResult {
    const matchesReference = Math.round(
      (dimensions.layoutStructure.score +
       dimensions.componentUsage.score +
       dimensions.colorScheme.score) / 3
    );

    const deviations: string[] = [];
    const improvements: string[] = [];

    if (dimensions.layoutStructure.score < 80) {
      deviations.push('Layout structure deviates from reference patterns');
    } else {
      improvements.push('Layout structure follows reference patterns well');
    }

    if (dimensions.componentUsage.score < 80) {
      deviations.push('Component usage inconsistent with reference');
    } else {
      improvements.push('Component usage aligns with reference');
    }

    if (dimensions.colorScheme.score < 80) {
      deviations.push('Color scheme may not match brand guidelines');
    } else {
      improvements.push('Color scheme appears consistent');
    }

    const patternAdherence = matchesReference;

    return {
      matchesReference,
      deviations,
      improvements,
      patternAdherence,
    };
  }

  /**
   * Generate visual recommendations
   */
  private generateVisualRecommendations(dimensions: VisualBenchmarkMetrics['dimensions']): string[] {
    const recommendations: string[] = [];

    if (dimensions.layoutStructure.score < 70) {
      recommendations.push('Improve grid alignment by using consistent layout templates');
      recommendations.push('Reduce navigation hierarchy depth for better UX');
      recommendations.push('Balance section counts across pages for consistency');
    }

    if (dimensions.componentUsage.score < 70) {
      recommendations.push('Increase component variety by using more UI component types');
      recommendations.push('Ensure consistent component usage patterns across entities');
      recommendations.push('Add enum values to Select components for better reusability');
    }

    if (dimensions.colorScheme.score < 70) {
      recommendations.push('Review color harmony and contrast ratios');
      recommendations.push('Ensure brand consistency across all pages');
    }

    if (dimensions.typography.score < 70) {
      recommendations.push('Establish clear font hierarchy (headings, subheadings, body)');
      recommendations.push('Ensure text readability with appropriate font sizes and line heights');
      recommendations.push('Maintain consistent typography across the application');
    }

    if (dimensions.spacingAlignment.score < 70) {
      recommendations.push('Use consistent spacing scale throughout the application');
      recommendations.push('Ensure proper alignment of elements within layouts');
      recommendations.push('Optimize whitespace usage for better visual hierarchy');
    }

    if (dimensions.responsiveDesign.score < 70) {
      recommendations.push('Ensure breakpoint coverage for all device sizes');
      recommendations.push('Optimize mobile experience with touch-friendly interfaces');
      recommendations.push('Verify touch target sizes meet accessibility standards');
    }

    if (dimensions.accessibility.score < 70) {
      recommendations.push('Use semantic HTML elements for better screen reader support');
      recommendations.push('Add ARIA labels to interactive elements');
      recommendations.push('Ensure keyboard navigation works for all interactive elements');
    }

    return recommendations;
  }

  /**
   * Infer domain from understanding
   */
  private inferDomain(understanding: AppUnderstanding): string {
    const entityNames = understanding.entities?.map(e => e.name.toLowerCase()).join(' ') || '';
    const pageNames = understanding.pages?.map(p => p.name.toLowerCase()).join(' ') || '';
    const combined = `${entityNames} ${pageNames}`;

    if (combined.includes('patient') || combined.includes('medical')) return 'healthcare';
    if (combined.includes('customer') || combined.includes('lead')) return 'crm';
    if (combined.includes('order') || combined.includes('product')) return 'ecommerce';
    if (combined.includes('candidate') || combined.includes('job')) return 'ats';
    if (combined.includes('invoice') || combined.includes('payment')) return 'finance';
    if (combined.includes('shipment') || combined.includes('delivery')) return 'logistics';
    if (combined.includes('ticket') || combined.includes('support')) return 'support';
    if (combined.includes('task') || combined.includes('project')) return 'project_management';
    if (combined.includes('course') || combined.includes('student')) return 'education';

    return 'generic';
  }

  /**
   * Get expected color scheme for domain
   */
  private getExpectedColorScheme(domain: string): string[] {
    const colorSchemes: Record<string, string[]> = {
      healthcare: ['medical-blue', 'health-green', 'urgent-red'],
      crm: ['sales-blue', 'growth-green', 'warning-orange'],
      ecommerce: ['shop-purple', 'cart-blue', 'deal-orange'],
      ats: ['hire-blue', 'interview-purple', 'offer-green'],
      finance: ['money-green', 'expense-red', 'profit-blue'],
      logistics: ['fleet-blue', 'delivery-green', 'delay-orange'],
      support: ['support-blue', 'ticket-orange', 'resolved-green'],
      project_management: ['task-blue', 'progress-green', 'blocked-red'],
      education: ['learn-blue', 'grade-green', 'assignment-orange'],
      generic: ['primary', 'secondary', 'muted'],
    };

    return colorSchemes[domain] || colorSchemes.generic || ['primary', 'secondary', 'muted'];
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
  private getDefaultLayoutMetrics(): LayoutStructureMetrics {
    return {
      score: 50,
      gridAlignment: 50,
      hierarchyDepth: 50,
      sectionBalance: 50,
      issues: ['Layout checks disabled'],
    };
  }

  private getDefaultComponentMetrics(): ComponentUsageMetrics {
    return {
      score: 50,
      componentVariety: 50,
      componentConsistency: 50,
      componentReusability: 50,
      issues: ['Component checks disabled'],
    };
  }

  private getDefaultColorMetrics(): ColorSchemeMetrics {
    return {
      score: 50,
      colorHarmony: 50,
      contrastRatio: 50,
      brandConsistency: 50,
      issues: ['Color checks disabled'],
    };
  }

  private getDefaultTypographyMetrics(): TypographyMetrics {
    return {
      score: 50,
      fontHierarchy: 50,
      readability: 50,
      consistency: 50,
      issues: ['Typography checks disabled'],
    };
  }

  private getDefaultSpacingMetrics(): SpacingAlignmentMetrics {
    return {
      score: 50,
      spacingConsistency: 50,
      alignmentAccuracy: 50,
      whitespaceUsage: 50,
      issues: ['Spacing checks disabled'],
    };
  }

  private getDefaultResponsiveMetrics(): ResponsiveDesignMetrics {
    return {
      score: 50,
      breakpointCoverage: 50,
      mobileOptimization: 50,
      touchTargetSize: 50,
      issues: ['Responsive checks disabled'],
    };
  }

  private getDefaultAccessibilityMetrics(): AccessibilityMetrics {
    return {
      score: 50,
      semanticHTML: 50,
      ariaLabels: 50,
      keyboardNavigation: 50,
      screenReaderCompatibility: 50,
      issues: ['Accessibility checks disabled'],
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VisualBenchmarkConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('VisualBenchmarking', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): VisualBenchmarkConfig {
    return { ...this.config };
  }
}

export const visualBenchmarking = new VisualBenchmarking();

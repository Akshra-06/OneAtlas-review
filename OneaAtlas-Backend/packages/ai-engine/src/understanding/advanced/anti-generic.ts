/**
 * Anti-Generic Generation System
 *
 * Detects and prevents repetitive/generic patterns:
 * - Repeated KPI layouts
 * - Generic dashboards
 * - Repetitive navigation structures
 * - Repeated section ordering
 * - Repeated card structures
 * - Repeated workflow patterns
 * - Diversity and uniqueness scoring
 * - Pattern variation suggestions
 */

import type { AppUnderstanding } from '@oneatlas/shared';

export interface GenericPatternDetection {
  isGeneric: boolean;
  confidence: number;
  detectedPatterns: PatternMatch[];
  diversityScore: number; // 0-1, higher is more diverse
  suggestions: string[];
}

export interface PatternMatch {
  patternType: 'kpi_layout' | 'dashboard' | 'navigation' | 'section_order' | 'card_structure' | 'workflow' | 'color_scheme' | 'component';
  description: string;
  frequency: number;
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
}

export class AntiGenericSystem {
  private commonPatterns = new Map<string, number>();
  private patternHistory: string[] = [];

  /**
   * Detect generic patterns in understanding
   */
  detectGenericPatterns(understanding: AppUnderstanding): GenericPatternDetection {
    const detectedPatterns: PatternMatch[] = [];

    // Check for generic dashboards
    const dashboardPattern = this.detectGenericDashboard(understanding.pages);
    if (dashboardPattern) {
      detectedPatterns.push(dashboardPattern);
    }

    // Check for repetitive KPI layouts
    const kpiPattern = this.detectRepetitiveKPIs(understanding.pages);
    if (kpiPattern) {
      detectedPatterns.push(kpiPattern);
    }

    // Check for repetitive navigation
    const navPattern = this.detectRepetitiveNavigation(understanding.pages);
    if (navPattern) {
      detectedPatterns.push(navPattern);
    }

    // Check for repetitive section ordering
    const sectionPattern = this.detectRepetitiveSections(understanding.pages);
    if (sectionPattern) {
      detectedPatterns.push(sectionPattern);
    }

    // Check for repetitive card structures
    const cardPattern = this.detectRepetitiveCards(understanding.pages);
    if (cardPattern) {
      detectedPatterns.push(cardPattern);
    }

    // Check for repetitive workflows
    const workflowPattern = this.detectRepetitiveWorkflows(understanding.workflows);
    if (workflowPattern) {
      detectedPatterns.push(workflowPattern);
    }

    // Check for generic color schemes
    const colorPattern = this.detectGenericColors(understanding);
    if (colorPattern) {
      detectedPatterns.push(colorPattern);
    }

    const isGeneric = detectedPatterns.length > 0;
    const confidence = this.calculateGenericConfidence(detectedPatterns);
    const diversityScore = this.calculateDiversityScore(understanding);
    const suggestions = this.generateSuggestions(detectedPatterns, understanding);

    return {
      isGeneric,
      confidence,
      detectedPatterns,
      diversityScore,
      suggestions,
    };
  }

  /**
   * Detect generic dashboard patterns
   */
  private detectGenericDashboard(pages: any[]): PatternMatch | null {
    const dashboardPages = pages.filter(p => p.layoutTemplate === 'dashboard');

    if (dashboardPages.length === 0) return null;

    // Check for common generic dashboard patterns
    const genericIndicators = [
      'overview',
      'dashboard',
      'summary',
      'analytics',
      'reports',
    ];

    const genericCount = dashboardPages.filter(page =>
      genericIndicators.some(indicator =>
        page.name.toLowerCase().includes(indicator)
      )
    ).length;

    if (genericCount > 0) {
      return {
        patternType: 'dashboard',
        description: `Generic dashboard naming detected (${genericCount} pages)`,
        frequency: genericCount,
        severity: genericCount > 2 ? 'high' : 'medium',
        suggestion: 'Use domain-specific page names (e.g., "Sales Overview" instead of "Dashboard")',
      };
    }

    return null;
  }

  /**
   * Detect repetitive KPI layouts
   */
  private detectRepetitiveKPIs(pages: any[]): PatternMatch | null {
    const kpiPatterns = new Map<string, number>();

    for (const page of pages) {
      // Extract KPI-related patterns from page name and layout
      const hasKPI = page.name.toLowerCase().includes('kpi') ||
                     page.name.toLowerCase().includes('metric') ||
                     page.name.toLowerCase().includes('stat') ||
                     page.layoutTemplate === 'dashboard';

      if (hasKPI) {
        const pattern = `${page.layoutTemplate}:${page.requiredEntities.length}`;
        const count = kpiPatterns.get(pattern) || 0;
        kpiPatterns.set(pattern, count + 1);
      }
    }

    for (const [pattern, count] of kpiPatterns) {
      if (count > 2) {
        return {
          patternType: 'kpi_layout',
          description: `Repetitive KPI layout pattern (${count} occurrences)`,
          frequency: count,
          severity: 'medium',
          suggestion: 'Vary KPI layouts across pages - use different chart types, arrangements, or data visualizations',
        };
      }
    }

    return null;
  }

  /**
   * Detect repetitive navigation structures
   */
  private detectRepetitiveNavigation(pages: any[]): PatternMatch | null {
    const navStructures = new Map<string, number>();

    for (const page of pages) {
      // Extract navigation structure from route pattern
      const structure = page.route.split('/').filter(Boolean).join('->');
      const count = navStructures.get(structure) || 0;
      navStructures.set(structure, count + 1);
    }

    for (const [structure, count] of navStructures) {
      if (count > 3 && structure.length > 0) {
        return {
          patternType: 'navigation',
          description: `Repetitive navigation structure (${count} occurrences)`,
          frequency: count,
          severity: 'medium',
          suggestion: 'Vary navigation structures - use different hierarchies, groupings, or navigation patterns',
        };
      }
    }

    return null;
  }

  /**
   * Detect repetitive section ordering
   */
  private detectRepetitiveSections(pages: any[]): PatternMatch | null {
    const sectionOrders = new Map<string, number>();

    for (const page of pages) {
      // Extract section order from layout template and entity count
      const order = `${page.layoutTemplate}:${page.requiredEntities.length}`;
      const count = sectionOrders.get(order) || 0;
      sectionOrders.set(order, count + 1);
    }

    for (const [order, count] of sectionOrders) {
      if (count > 2) {
        return {
          patternType: 'section_order',
          description: `Repetitive section ordering (${count} occurrences)`,
          frequency: count,
          severity: 'medium',
          suggestion: 'Vary section ordering across pages - prioritize different content based on page purpose',
        };
      }
    }

    return null;
  }

  /**
   * Detect repetitive card structures
   */
  private detectRepetitiveCards(pages: any[]): PatternMatch | null {
    const cardStructures = new Map<string, number>();

    for (const page of pages) {
      // Extract card structures from layout template
      const structure = page.layoutTemplate;
      const count = cardStructures.get(structure) || 0;
      cardStructures.set(structure, count + 1);
    }

    for (const [structure, count] of cardStructures) {
      if (count > 4) {
        return {
          patternType: 'card_structure',
          description: `Repetitive card structure (${count} occurrences)`,
          frequency: count,
          severity: 'low',
          suggestion: 'Vary card layouts - use different card styles, sizes, and arrangements',
        };
      }
    }

    return null;
  }

  /**
   * Detect repetitive workflow patterns
   */
  private detectRepetitiveWorkflows(workflows: any[]): PatternMatch | null {
    const workflowPatterns = new Map<string, number>();

    for (const workflow of workflows) {
      // Extract workflow pattern
      const pattern = `${workflow.trigger || workflow.triggerType || 'user_action'}:${workflow.executionMode || 'SYNC'}:${workflow.steps?.length || 0}`;
      const count = workflowPatterns.get(pattern) || 0;
      workflowPatterns.set(pattern, count + 1);
    }

    for (const [pattern, count] of workflowPatterns) {
      if (count > 2) {
        return {
          patternType: 'workflow',
          description: `Repetitive workflow pattern (${count} occurrences)`,
          frequency: count,
          severity: 'medium',
          suggestion: 'Vary workflow patterns - use different trigger types, execution modes, or step sequences',
        };
      }
    }

    return null;
  }

  /**
   * Detect generic color schemes
   */
  private detectGenericColors(understanding: AppUnderstanding): PatternMatch | null {
    // Check for default/generic color usage
    const genericColors = ['blue', 'gray', 'white', 'black'];
    
    // This would need to check actual color values in the understanding
    // For now, return null as color data may not be in the understanding structure
    return null;
  }

  /**
   * Calculate confidence in generic detection
   */
  private calculateGenericConfidence(patterns: PatternMatch[]): number {
    if (patterns.length === 0) return 0;

    let confidence = 0.5;
    const highSeverityCount = patterns.filter(p => p.severity === 'high').length;
    const mediumSeverityCount = patterns.filter(p => p.severity === 'medium').length;

    confidence += highSeverityCount * 0.2;
    confidence += mediumSeverityCount * 0.1;

    return Math.min(1, confidence);
  }

  /**
   * Calculate diversity score
   */
  private calculateDiversityScore(understanding: AppUnderstanding): number {
    let diversity = 0.5;

    // Page diversity
    const pageTemplates = new Set(understanding.pages.map(p => p.layoutTemplate));
    diversity += (pageTemplates.size / understanding.pages.length) * 0.2;

    // Entity diversity
    const entityTypes = new Set(understanding.entities.map(e => e.name));
    diversity += (entityTypes.size / understanding.entities.length) * 0.2;

    // Workflow diversity
    const workflowTriggers = new Set(understanding.workflows.map(w => (w as any).trigger || w.triggerType || 'user_action'));
    diversity += (workflowTriggers.size / understanding.workflows.length) * 0.1;

    return Math.min(1, diversity);
  }

  /**
   * Generate suggestions to reduce generic patterns
   */
  private generateSuggestions(patterns: PatternMatch[], understanding: AppUnderstanding): string[] {
    const suggestions: string[] = [];

    for (const pattern of patterns) {
      suggestions.push(pattern.suggestion);
    }

    // Add general diversity suggestions
    if (understanding.pages.length > 3) {
      const uniqueTemplates = new Set(understanding.pages.map(p => p.layoutTemplate)).size;
      if (uniqueTemplates === 1) {
        suggestions.push('Use multiple layout templates across pages for visual variety');
      }
    }

    if (understanding.entities.length > 2) {
      const uniqueRelations = new Set(
        understanding.entities.flatMap(e => ((e as any).relationships || e.relations)?.map((r: any) => r.type) || [])
      ).size;
      if (uniqueRelations === 1) {
        suggestions.push('Use diverse relation types between entities for richer data modeling');
      }
    }

    return suggestions;
  }

  /**
   * Generate variation suggestions for a specific pattern
   */
  generateVariations(patternType: string, currentValue: string): string[] {
    const variations: string[] = [];

    switch (patternType) {
      case 'dashboard':
        variations.push('Use domain-specific names (e.g., "Sales Command Center", "Customer 360")');
        variations.push('Add contextual prefixes (e.g., "Executive", "Team", "Personal")');
        variations.push('Use action-oriented names (e.g., "Performance Tracker", "Growth Monitor")');
        break;

      case 'kpi_layout':
        variations.push('Mix chart types (bar, line, pie, gauge, sparkline)');
        variations.push('Vary arrangement (grid, stacked, horizontal, vertical)');
        variations.push('Use different data densities (summary, detailed, trend)');
        break;

      case 'navigation':
        variations.push('Use different hierarchy depths (flat, nested, mega-menu)');
        variations.push('Vary grouping strategies (by function, by role, by entity)');
        variations.push('Mix navigation patterns (sidebar, topbar, breadcrumbs, tabs)');
        break;

      case 'section_order':
        variations.push('Prioritize based on user goals (primary actions first)');
        variations.push('Use data-driven ordering (most important metrics first)');
        variations.push('Vary by page type (list pages vs detail pages)');
        break;

      case 'card_structure':
        variations.push('Mix card sizes (small, medium, large, hero)');
        variations.push('Vary card styles (minimal, detailed, interactive)');
        variations.push('Use different layouts (grid, masonry, list, carousel)');
        break;

      case 'workflow':
        variations.push('Mix trigger types (user action, system event, scheduled)');
        variations.push('Vary execution modes (sync for critical, async for background)');
        variations.push('Use different step sequences (linear, parallel, conditional)');
        break;

      default:
        variations.push('Consider alternative approaches to add variety');
    }

    return variations;
  }

  /**
   * Track pattern usage for learning
   */
  trackPattern(pattern: string): void {
    const count = this.commonPatterns.get(pattern) || 0;
    this.commonPatterns.set(pattern, count + 1);
    this.patternHistory.push(pattern);
  }

  /**
   * Get pattern frequency
   */
  getPatternFrequency(pattern: string): number {
    return this.commonPatterns.get(pattern) || 0;
  }

  /**
   * Check if pattern is overused
   */
  isPatternOverused(pattern: string, threshold: number = 3): boolean {
    return this.getPatternFrequency(pattern) >= threshold;
  }

  /**
   * Get alternative suggestions based on pattern history
   */
  getAlternativeSuggestions(pattern: string): string[] {
    const alternatives: string[] = [];
    const frequency = this.getPatternFrequency(pattern);

    if (frequency > 2) {
      alternatives.push(`Pattern "${pattern}" has been used ${frequency} times - consider alternatives`);
      const patternType = pattern.split(':')[0] || 'general';
      alternatives.push(...this.generateVariations(patternType, pattern));
    }

    return alternatives;
  }

  /**
   * Clear pattern history
   */
  clearHistory(): void {
    this.commonPatterns.clear();
    this.patternHistory = [];
  }
}

export const antiGeneric = new AntiGenericSystem();

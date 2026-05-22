/**
 * Visual Hierarchy Engine
 * 
 * Creates adaptive visual hierarchy for generated apps.
 * Generates intentional visual design patterns.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';

export interface VisualHierarchy {
  id: string;
  levels: HierarchyLevel[];
  rhythm: VisualRhythm;
  density: 'compact' | 'comfortable' | 'spacious' | 'dense';
}

export interface HierarchyLevel {
  level: number;
  emphasis: number;
  elements: string[];
  spacing: number;
  typography: TypographyScale;
}

export interface VisualRhythm {
  pattern: 'uniform' | 'progressive' | 'focal' | 'scattered';
  cadence: number;
}

export interface TypographyScale {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
}

export interface VisualHierarchyEngineConfig {
  enableAutoScaling: boolean;
  enableAdaptiveSpacing: boolean;
  enableRhythmGeneration: boolean;
}

const DEFAULT_CONFIG: VisualHierarchyEngineConfig = {
  enableAutoScaling: true,
  enableAdaptiveSpacing: true,
  enableRhythmGeneration: true,
};

/**
 * Visual Hierarchy Engine
 * 
 * Creates visual hierarchy:
 * - Hierarchy levels
 * - Visual rhythm
 * - Typography scaling
 * - Adaptive spacing
 */
export class VisualHierarchyEngine {
  private config: VisualHierarchyEngineConfig;

  constructor(config: Partial<VisualHierarchyEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate visual hierarchy for archetype
   */
  generateHierarchy(archetype: ArchetypeDefinition, elements: string[]): VisualHierarchy {
    const levels = this.generateHierarchyLevels(archetype, elements);
    const rhythm = this.generateVisualRhythm(archetype);

    const hierarchy: VisualHierarchy = {
      id: crypto.randomUUID(),
      levels,
      rhythm,
      density: archetype.layoutDensity,
    };

    logger.info('VisualHierarchyEngine', 'HIERARCHY_GENERATED', 'Visual hierarchy generated', {
      archetype: archetype.id,
      levelCount: levels.length,
      rhythm: rhythm.pattern,
    });

    return hierarchy;
  }

  /**
   * Generate hierarchy levels
   */
  private generateHierarchyLevels(archetype: ArchetypeDefinition, elements: string[]): HierarchyLevel[] {
    const levels: HierarchyLevel[] = [];

    // Level 1: Primary emphasis
    levels.push({
      level: 1,
      emphasis: 1.0,
      elements: this.filterElementsByEmphasis(elements, archetype.visualHierarchyRules.primaryEmphasis),
      spacing: this.calculateSpacing(1, archetype),
      typography: this.calculateTypography(1, archetype),
    });

    // Level 2: Secondary emphasis
    levels.push({
      level: 2,
      emphasis: 0.7,
      elements: this.filterElementsByEmphasis(elements, archetype.visualHierarchyRules.secondaryEmphasis),
      spacing: this.calculateSpacing(2, archetype),
      typography: this.calculateTypography(2, archetype),
    });

    // Level 3: Tertiary emphasis
    levels.push({
      level: 3,
      emphasis: 0.5,
      elements: this.filterElementsByEmphasis(elements, archetype.visualHierarchyRules.tertiaryEmphasis),
      spacing: this.calculateSpacing(3, archetype),
      typography: this.calculateTypography(3, archetype),
    });

    // Level 4: Default emphasis
    const remainingElements = elements.filter(el => 
      !levels.some(l => l.elements.includes(el))
    );
    if (remainingElements.length > 0) {
      levels.push({
        level: 4,
        emphasis: 0.3,
        elements: remainingElements,
        spacing: this.calculateSpacing(4, archetype),
        typography: this.calculateTypography(4, archetype),
      });
    }

    return levels;
  }

  /**
   * Filter elements by emphasis keyword
   */
  private filterElementsByEmphasis(elements: string[], emphasis: string): string[] {
    const lowerEmphasis = emphasis.toLowerCase();
    return elements.filter(el => el.toLowerCase().includes(lowerEmphasis));
  }

  /**
   * Calculate spacing for a level
   */
  private calculateSpacing(level: number, archetype: ArchetypeDefinition): number {
    const baseSpacing = archetype.spacing.comfortable;

    if (!this.config.enableAdaptiveSpacing) {
      return baseSpacing;
    }

    // Adjust spacing based on level
    const levelMultiplier = 1 / level;
    return Math.round(baseSpacing * levelMultiplier);
  }

  /**
   * Calculate typography for a level
   */
  private calculateTypography(level: number, archetype: ArchetypeDefinition): TypographyScale {
    const baseFontSize = 16;
    const baseFontWeight = 400;
    const baseLineHeight = 1.5;

    if (!this.config.enableAutoScaling) {
      return {
        fontSize: baseFontSize,
        fontWeight: baseFontWeight,
        lineHeight: baseLineHeight,
      };
    }

    // Scale typography based on level
    const fontSize = baseFontSize * (1.5 - (level * 0.2));
    const fontWeight = baseFontWeight + (level * 100);
    const lineHeight = baseLineHeight - (level * 0.1);

    return {
      fontSize: Math.max(12, Math.round(fontSize)),
      fontWeight: Math.min(700, fontWeight),
      lineHeight: Math.max(1.2, lineHeight),
    };
  }

  /**
   * Generate visual rhythm
   */
  private generateVisualRhythm(archetype: ArchetypeDefinition): VisualRhythm {
    if (!this.config.enableRhythmGeneration) {
      return {
        pattern: 'uniform',
        cadence: 1,
      };
    }

    // Determine pattern based on archetype
    let pattern: VisualRhythm['pattern'] = 'uniform';
    let cadence = 1;

    switch (archetype.dashboardCompositionStrategy) {
      case 'data-first':
        pattern = 'progressive';
        cadence = 1.2;
        break;
      case 'task-first':
        pattern = 'focal';
        cadence = 1.5;
        break;
      case 'status-first':
        pattern = 'scattered';
        cadence = 0.8;
        break;
      case 'timeline-first':
        pattern = 'progressive';
        cadence = 1.3;
        break;
    }

    return {
      pattern,
      cadence,
    };
  }

  /**
   * Apply hierarchy to UI elements
   */
  applyToUI(hierarchy: VisualHierarchy, uiElements: Record<string, unknown>): Record<string, unknown> {
    const styledElements: Record<string, unknown> = { ...uiElements };

    for (const level of hierarchy.levels) {
      for (const element of level.elements) {
        const existingElement = styledElements[element];
        if (existingElement && typeof existingElement === 'object') {
          styledElements[element] = {
            ...existingElement,
            hierarchy: {
              level: level.level,
              emphasis: level.emphasis,
              spacing: level.spacing,
              typography: level.typography,
            },
          };
        } else {
          styledElements[element] = {
            hierarchy: {
              level: level.level,
              emphasis: level.emphasis,
              spacing: level.spacing,
              typography: level.typography,
            },
          };
        }
      }
    }

    logger.info('VisualHierarchyEngine', 'HIERARCHY_APPLIED', 'Visual hierarchy applied', {
      elementCount: Object.keys(styledElements).length,
    });

    return styledElements;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VisualHierarchyEngineConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('VisualHierarchyEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): VisualHierarchyEngineConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: VisualHierarchyEngineConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const visualHierarchyEngine = new VisualHierarchyEngine();

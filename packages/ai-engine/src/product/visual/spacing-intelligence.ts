/**
 * Spacing Intelligence
 * 
 * Manages adaptive spacing for UI elements.
 * Generates contextual spacing based on hierarchy.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';

export interface SpacingSystem {
  base: number;
  scale: number[];
  rhythm: 'uniform' | 'progressive' | 'logarithmic';
}

export interface SpacingIntelligenceConfig {
  enableAutoScaling: boolean;
  enableResponsiveSpacing: boolean;
  enableRhythmGeneration: boolean;
}

const DEFAULT_CONFIG: SpacingIntelligenceConfig = {
  enableAutoScaling: true,
  enableResponsiveSpacing: true,
  enableRhythmGeneration: true,
};

/**
 * Spacing Intelligence
 * 
 * Manages spacing:
 * - Adaptive spacing
 * - Responsive spacing
 * - Spacing rhythm
 * - Spacing scale
 */
export class SpacingIntelligence {
  private config: SpacingIntelligenceConfig;

  constructor(config: Partial<SpacingIntelligenceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate spacing system for archetype
   */
  generateSpacingSystem(archetype: ArchetypeDefinition): SpacingSystem {
    const base = archetype.spacing.comfortable;
    const scale = this.generateSpacingScale(archetype);
    const rhythm = this.determineRhythm(archetype);

    const system: SpacingSystem = {
      base,
      scale,
      rhythm,
    };

    logger.info('SpacingIntelligence', 'SPACING_SYSTEM_GENERATED', 'Spacing system generated', {
      archetype: archetype.id,
      base,
      rhythm,
    });

    return system;
  }

  /**
   * Generate spacing scale
   */
  private generateSpacingScale(archetype: ArchetypeDefinition): number[] {
    const base = archetype.spacing.comfortable;
    const scale: number[] = [];

    if (!this.config.enableAutoScaling) {
      return [base, base * 2, base * 3, base * 4, base * 5];
    }

    // Generate scale based on density
    switch (archetype.layoutDensity) {
      case 'dense':
        scale.push(base, base * 1.5, base * 2, base * 2.5, base * 3);
        break;
      case 'compact':
        scale.push(base, base * 2, base * 3, base * 4, base * 6);
        break;
      case 'comfortable':
        scale.push(base, base * 2, base * 3, base * 5, base * 8);
        break;
      case 'spacious':
        scale.push(base, base * 2, base * 4, base * 6, base * 10);
        break;
      default:
        scale.push(base, base * 2, base * 3, base * 4, base * 5);
    }

    return scale;
  }

  /**
   * Determine spacing rhythm
   */
  private determineRhythm(archetype: ArchetypeDefinition): SpacingSystem['rhythm'] {
    if (!this.config.enableRhythmGeneration) {
      return 'uniform';
    }

    switch (archetype.dashboardCompositionStrategy) {
      case 'data-first':
        return 'progressive';
      case 'task-first':
        return 'uniform';
      case 'status-first':
        return 'logarithmic';
      case 'timeline-first':
        return 'progressive';
      default:
        return 'uniform';
    }
  }

  /**
   * Get spacing for a level
   */
  getSpacingForLevel(system: SpacingSystem, level: number): number {
    const index = Math.min(level - 1, system.scale.length - 1);
    return system.scale[index] ?? system.base;
  }

  /**
   * Get responsive spacing
   */
  getResponsiveSpacing(system: SpacingSystem, viewport: { width: number; height: number }): number {
    if (!this.config.enableResponsiveSpacing) {
      return system.base;
    }

    // Adjust spacing based on viewport width
    if (viewport.width < 768) {
      return system.base * 0.75; // Mobile
    } else if (viewport.width < 1024) {
      return system.base * 0.875; // Tablet
    } else if (viewport.width < 1440) {
      return system.base; // Desktop
    } else {
      return system.base * 1.125; // Large desktop
    }
  }

  /**
   * Apply spacing to elements
   */
  applySpacing(elements: string[], system: SpacingSystem): Record<string, number> {
    const spacingMap: Record<string, number> = {};

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (!element) continue;

      const spacing = this.getSpacingForLevel(system, i + 1);
      spacingMap[element] = spacing;
    }

    logger.info('SpacingIntelligence', 'SPACING_APPLIED', 'Spacing applied', {
      elementCount: elements.length,
    });

    return spacingMap;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SpacingIntelligenceConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('SpacingIntelligence', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): SpacingIntelligenceConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: SpacingIntelligenceConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const spacingIntelligence = new SpacingIntelligence();

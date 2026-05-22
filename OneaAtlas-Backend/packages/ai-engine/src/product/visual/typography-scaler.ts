/**
 * Typography Scaler
 * 
 * Scales typography based on hierarchy and context.
 * Generates adaptive typography scales.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';

export interface TypographyScale {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface TypographySystem {
  base: TypographyScale;
  scales: TypographyScale[];
  headingScale: TypographyScale[];
  bodyScale: TypographyScale[];
}

export interface TypographyScalerConfig {
  enableAutoScaling: boolean;
  enableResponsiveScaling: boolean;
  enableAccessibility: boolean;
}

const DEFAULT_CONFIG: TypographyScalerConfig = {
  enableAutoScaling: true,
  enableResponsiveScaling: true,
  enableAccessibility: true,
};

/**
 * Typography Scaler
 * 
 * Scales typography:
 * - Adaptive scaling
 * - Responsive scaling
 * - Accessibility
 * - Typography system
 */
export class TypographyScaler {
  private config: TypographyScalerConfig;

  constructor(config: Partial<TypographyScalerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate typography system for archetype
   */
  generateTypographySystem(archetype: ArchetypeDefinition): TypographySystem {
    const base = this.generateBaseScale(archetype);
    const scales = this.generateScales(archetype);
    const headingScale = this.generateHeadingScale(archetype);
    const bodyScale = this.generateBodyScale(archetype);

    const system: TypographySystem = {
      base,
      scales,
      headingScale,
      bodyScale,
    };

    logger.info('TypographyScaler', 'TYPOGRAPHY_SYSTEM_GENERATED', 'Typography system generated', {
      archetype: archetype.id,
      scaleCount: scales.length,
    });

    return system;
  }

  /**
   * Generate base scale
   */
  private generateBaseScale(archetype: ArchetypeDefinition): TypographyScale {
    const baseSize = 16;
    const baseWeight = 400;
    const baseLineHeight = 1.5;

    return {
      fontSize: baseSize,
      fontWeight: baseWeight,
      lineHeight: baseLineHeight,
      letterSpacing: 0,
    };
  }

  /**
   * Generate scales
   */
  private generateScales(archetype: ArchetypeDefinition): TypographyScale[] {
    const scales: TypographyScale[] = [];
    const base = this.generateBaseScale(archetype);

    if (!this.config.enableAutoScaling) {
      return [base];
    }

    // Generate scale based on density
    const levels = this.config.enableAccessibility ? [0.875, 1, 1.125, 1.25, 1.5] : [1, 1.125, 1.25, 1.5, 1.75];

    for (const level of levels) {
      scales.push({
        fontSize: Math.round(base.fontSize * level),
        fontWeight: base.fontWeight,
        lineHeight: base.lineHeight,
        letterSpacing: 0,
      });
    }

    return scales;
  }

  /**
   * Generate heading scale
   */
  private generateHeadingScale(archetype: ArchetypeDefinition): TypographyScale[] {
    const scales: TypographyScale[] = [];
    const base = this.generateBaseScale(archetype);

    // H1
    scales.push({
      fontSize: Math.round(base.fontSize * 2.5),
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: -0.02,
    });

    // H2
    scales.push({
      fontSize: Math.round(base.fontSize * 2),
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: -0.01,
    });

    // H3
    scales.push({
      fontSize: Math.round(base.fontSize * 1.5),
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: 0,
    });

    // H4
    scales.push({
      fontSize: Math.round(base.fontSize * 1.25),
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 0,
    });

    // H5
    scales.push({
      fontSize: Math.round(base.fontSize * 1.125),
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 0,
    });

    // H6
    scales.push({
      fontSize: base.fontSize,
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: 0,
    });

    return scales;
  }

  /**
   * Generate body scale
   */
  private generateBodyScale(archetype: ArchetypeDefinition): TypographyScale[] {
    const scales: TypographyScale[] = [];
    const base = this.generateBaseScale(archetype);

    // Body
    scales.push({
      fontSize: base.fontSize,
      fontWeight: base.fontWeight,
      lineHeight: base.lineHeight,
      letterSpacing: 0,
    });

    // Small
    scales.push({
      fontSize: Math.round(base.fontSize * 0.875),
      fontWeight: base.fontWeight,
      lineHeight: 1.4,
      letterSpacing: 0.01,
    });

    // Large
    scales.push({
      fontSize: Math.round(base.fontSize * 1.125),
      fontWeight: base.fontWeight,
      lineHeight: 1.6,
      letterSpacing: 0,
    });

    return scales;
  }

  /**
   * Get typography for a level
   */
  getTypographyForLevel(system: TypographySystem, level: number): TypographyScale {
    const index = Math.min(level - 1, system.scales.length - 1);
    return system.scales[index] ?? system.base;
  }

  /**
   * Get heading typography
   */
  getHeadingTypography(system: TypographySystem, level: number): TypographyScale {
    const index = Math.min(level - 1, system.headingScale.length - 1);
    return system.headingScale[index] ?? system.headingScale[0] ?? system.base;
  }

  /**
   * Get responsive typography
   */
  getResponsiveTypography(system: TypographySystem, viewport: { width: number; height: number }): TypographyScale {
    if (!this.config.enableResponsiveScaling) {
      return system.base;
    }

    // Adjust typography based on viewport width
    const scaleFactor = viewport.width < 768 ? 0.875 : viewport.width < 1024 ? 0.9375 : 1;

    return {
      fontSize: Math.round(system.base.fontSize * scaleFactor),
      fontWeight: system.base.fontWeight,
      lineHeight: system.base.lineHeight,
      letterSpacing: system.base.letterSpacing,
    };
  }

  /**
   * Apply typography to elements
   */
  applyTypography(elements: string[], system: TypographySystem): Record<string, TypographyScale> {
    const typographyMap: Record<string, TypographyScale> = {};

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (!element) continue;

      const typography = this.getTypographyForLevel(system, i + 1);
      typographyMap[element] = typography;
    }

    logger.info('TypographyScaler', 'TYPOGRAPHY_APPLIED', 'Typography applied', {
      elementCount: elements.length,
    });

    return typographyMap;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TypographyScalerConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('TypographyScaler', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): TypographyScalerConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: TypographyScalerConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const typographyScaler = new TypographyScaler();

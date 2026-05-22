/**
 * Visual Hierarchy Application Engine
 * 
 * Applies visual hierarchy to generated output.
 * Integrates hierarchy, spacing, typography, and emphasis engines.
 */

import type {
  GeneratedFile,
} from '@oneatlas/shared';

import { logger } from '../../shared/utils/logger';

import {
  visualHierarchyEngine,
  spacingIntelligence,
  typographyScaler,
  emphasisEngine,
} from '../../product/visual';

import {
  ArchetypeDefinition,
} from '../../product/archetype/ui-archetype-engine';

export interface VisualHierarchyApplication {
  hierarchy: any;
  spacing: any;
  typography: any;
  emphasis: any;
}

export interface VisualHierarchyConfig {
  enableHierarchy: boolean;
  enableSpacing: boolean;
  enableTypography: boolean;
  enableEmphasis: boolean;
  enableResponsive: boolean;
}

const DEFAULT_CONFIG: VisualHierarchyConfig = {
  enableHierarchy: true,
  enableSpacing: true,
  enableTypography: true,
  enableEmphasis: true,
  enableResponsive: true,
};

/**
 * Visual Hierarchy Application Engine
 * 
 * Applies visual hierarchy to generated output:
 * - Hierarchy levels
 * - Spacing
 * - Typography
 * - Emphasis
 * - Responsive design
 */
export class VisualHierarchyApplicationEngine {
  private config: VisualHierarchyConfig;

  constructor(config: Partial<VisualHierarchyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Apply visual hierarchy to generated files
   */
  applyVisualHierarchy(files: GeneratedFile[], archetype: ArchetypeDefinition): GeneratedFile[] {
    const application: VisualHierarchyApplication = {
      hierarchy: this.config.enableHierarchy ? visualHierarchyEngine.generateHierarchy(archetype, ['default']) : null,
      spacing: this.config.enableSpacing ? spacingIntelligence.generateSpacingSystem(archetype) : null,
      typography: this.config.enableTypography ? typographyScaler.generateTypographySystem(archetype) : null,
      emphasis: this.config.enableEmphasis ? emphasisEngine.generateEmphasis(['default'], archetype as any) : null,
    };

    const enhancedFiles = files.map(file => ({
      ...file,
      content: this.enhanceContentWithVisualHierarchy(file.content, application, archetype),
    }));

    logger.info('VisualHierarchyApplicationEngine', 'HIERARCHY_APPLIED', 'Visual hierarchy applied to files', {
      fileCount: files.length,
      archetype: archetype.id,
    });

    return enhancedFiles;
  }

  /**
   * Enhance content with visual hierarchy
   */
  private enhanceContentWithVisualHierarchy(content: string, application: VisualHierarchyApplication, archetype: ArchetypeDefinition): string {
    let enhanced = content;

    // Apply hierarchy levels
    if (this.config.enableHierarchy && application.hierarchy) {
      enhanced = this.applyHierarchyLevels(enhanced, application.hierarchy, archetype);
    }

    // Apply spacing
    if (this.config.enableSpacing && application.spacing) {
      enhanced = this.applySpacing(enhanced, application.spacing, archetype);
    }

    // Apply typography
    if (this.config.enableTypography && application.typography) {
      enhanced = this.applyTypography(enhanced, application.typography, archetype);
    }

    // Apply emphasis
    if (this.config.enableEmphasis && application.emphasis) {
      enhanced = this.applyEmphasis(enhanced, application.emphasis, archetype);
    }

    // Apply responsive classes
    if (this.config.enableResponsive) {
      enhanced = this.applyResponsiveClasses(enhanced, archetype);
    }

    return enhanced;
  }

  /**
   * Apply hierarchy levels
   */
  private applyHierarchyLevels(content: string, hierarchy: any, archetype: ArchetypeDefinition): string {
    let enhanced = content;

    // Add hierarchy level classes to headings
    enhanced = enhanced.replace(/<h1([^>]*)>/gi, (match, attrs) => {
      const level1 = hierarchy.levels[0];
      if (level1) {
        return `<h1${attrs} class="hierarchy-level-1 emphasis-${level1.emphasis}" style="spacing: ${level1.spacing}px">`;
      }
      return match;
    });

    enhanced = enhanced.replace(/<h2([^>]*)>/gi, (match, attrs) => {
      const level2 = hierarchy.levels[1];
      if (level2) {
        return `<h2${attrs} class="hierarchy-level-2 emphasis-${level2.emphasis}" style="spacing: ${level2.spacing}px">`;
      }
      return match;
    });

    enhanced = enhanced.replace(/<h3([^>]*)>/gi, (match, attrs) => {
      const level3 = hierarchy.levels[2];
      if (level3) {
        return `<h3${attrs} class="hierarchy-level-3 emphasis-${level3.emphasis}" style="spacing: ${level3.spacing}px">`;
      }
      return match;
    });

    // Add hierarchy data attributes
    enhanced = enhanced.replace(/className="([^"]*)"/gi, (match, className) => {
      return `className="${className} data-hierarchy="${hierarchy.rhythm.pattern}"`;
    });

    return enhanced;
  }

  /**
   * Apply spacing
   */
  private applySpacing(content: string, spacing: any, archetype: ArchetypeDefinition): string {
    let enhanced = content;

    // Replace generic spacing classes with archetype-specific spacing
    const spacingMap: Record<string, string> = {
      'space-y-4': `space-y-${Math.round(spacing.base)}`,
      'space-y-6': `space-y-${Math.round(spacing.base * 1.5)}`,
      'space-y-8': `space-y-${Math.round(spacing.base * 2)}`,
      'gap-2': `gap-${Math.round(spacing.base * 0.5)}`,
      'gap-3': `gap-${Math.round(spacing.base * 0.75)}`,
      'gap-4': `gap-${spacing.base}`,
    };

    for (const [oldClass, newClass] of Object.entries(spacingMap)) {
      enhanced = enhanced.replace(new RegExp(oldClass, 'g'), newClass);
    }

    // Add spacing data attributes
    enhanced = enhanced.replace(/className="([^"]*)"/gi, (match, className) => {
      return `className="${className}" data-spacing-rhythm="${spacing.rhythm}"`;
    });

    return enhanced;
  }

  /**
   * Apply typography
   */
  private applyTypography(content: string, typography: any, archetype: ArchetypeDefinition): string {
    let enhanced = content;

    // Apply typography scale to text elements
    if (typography.headingScale && typography.headingScale.length > 0) {
      const h1Scale = typography.headingScale[0];
      const h2Scale = typography.headingScale[1];
      const h3Scale = typography.headingScale[2];

      enhanced = enhanced.replace(/<h1([^>]*)>/gi, (match, attrs) => {
        return `<h1${attrs} style="font-size: ${h1Scale.fontSize}px; font-weight: ${h1Scale.fontWeight}; line-height: ${h1Scale.lineHeight}; letter-spacing: ${h1Scale.letterSpacing}">`;
      });

      enhanced = enhanced.replace(/<h2([^>]*)>/gi, (match, attrs) => {
        return `<h2${attrs} style="font-size: ${h2Scale.fontSize}px; font-weight: ${h2Scale.fontWeight}; line-height: ${h2Scale.lineHeight}; letter-spacing: ${h2Scale.letterSpacing}">`;
      });

      enhanced = enhanced.replace(/<h3([^>]*)>/gi, (match, attrs) => {
        return `<h3${attrs} style="font-size: ${h3Scale.fontSize}px; font-weight: ${h3Scale.fontWeight}; line-height: ${h3Scale.lineHeight}; letter-spacing: ${h3Scale.letterSpacing}">`;
      });
    }

    // Apply body typography
    if (typography.bodyScale && typography.bodyScale.length > 0) {
      const bodyScale = typography.bodyScale[0];
      enhanced = enhanced.replace(/<p([^>]*)>/gi, (match, attrs) => {
        return `<p${attrs} style="font-size: ${bodyScale.fontSize}px; line-height: ${bodyScale.lineHeight}">`;
      });
    }

    // Add typography data attributes
    enhanced = enhanced.replace(/className="([^"]*)"/gi, (match, className) => {
      return `className="${className}" data-typography-scale="${typography.scales.length}"`;
    });

    return enhanced;
  }

  /**
   * Apply emphasis
   */
  private applyEmphasis(content: string, emphasis: any[], archetype: ArchetypeDefinition): string {
    let enhanced = content;

    // Apply emphasis to primary elements
    for (const emphasisRule of emphasis) {
      if (emphasisRule.type === 'primary') {
        enhanced = enhanced.replace(new RegExp(`class="[^"]*${emphasisRule.elementId}[^"]*"`, 'gi'), (match) => {
          return match.replace('class="', `class="emphasis-primary emphasis-${emphasisRule.technique} `);
        });
      } else if (emphasisRule.type === 'secondary') {
        enhanced = enhanced.replace(new RegExp(`class="[^"]*${emphasisRule.elementId}[^"]*"`, 'gi'), (match) => {
          return match.replace('class="', `class="emphasis-secondary emphasis-${emphasisRule.technique} `);
        });
      }
    }

    // Add emphasis feedback classes
    enhanced = enhanced.replace(/<button/gi, '<button data-emphasis="interactive"');
    enhanced = enhanced.replace(/<a/gi, '<a data-emphasis="interactive"');

    return enhanced;
  }

  /**
   * Apply responsive classes
   */
  private applyResponsiveClasses(content: string, archetype: ArchetypeDefinition): string {
    let enhanced = content;

    // Add responsive container classes based on archetype density
    const densityMap: Record<string, string> = {
      'dense': 'max-w-5xl lg:max-w-6xl',
      'compact': 'max-w-6xl lg:max-w-7xl',
      'comfortable': 'max-w-7xl lg:max-w-[1400px]',
      'spacious': 'max-w-[1400px] lg:max-w-[1600px]',
    };

    const responsiveClass = densityMap[archetype.layoutDensity] || 'max-w-7xl';
    enhanced = enhanced.replace(/className="container"/gi, `className="container ${responsiveClass}"`);

    // Add responsive spacing
    enhanced = enhanced.replace(/space-y-4/gi, 'space-y-4 md:space-y-6 lg:space-y-8');
    enhanced = enhanced.replace(/space-y-6/gi, 'space-y-6 md:space-y-8 lg:space-y-10');
    enhanced = enhanced.replace(/space-y-8/gi, 'space-y-8 md:space-y-10 lg:space-y-12');

    return enhanced;
  }

  /**
   * Generate CSS variables for visual hierarchy
   */
  generateCSSVariables(archetype: ArchetypeDefinition): string {
    const spacing = spacingIntelligence.generateSpacingSystem(archetype);
    const typography = typographyScaler.generateTypographySystem(archetype);

    return `
/* Visual Hierarchy CSS Variables */
:root {
  /* Spacing */
  --spacing-base: ${spacing.base}px;
  --spacing-scale: ${spacing.scale.join(', ')};

  /* Typography */
  --font-size-base: ${typography.base.fontSize}px;
  --font-weight-base: ${typography.base.fontWeight};
  --line-height-base: ${typography.base.lineHeight};

  /* Density */
  --layout-density: ${archetype.layoutDensity};
}
`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VisualHierarchyConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('VisualHierarchyApplicationEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): VisualHierarchyConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: VisualHierarchyConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const visualHierarchyApplicationEngine = new VisualHierarchyApplicationEngine();

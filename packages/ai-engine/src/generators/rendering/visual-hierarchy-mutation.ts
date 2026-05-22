/**
 * Visual Hierarchy Mutation Engine
 * 
 * Mutates visual hierarchy based on domain, archetype, and workflow.
 * Ensures different domains have fundamentally different visual hierarchy.
 */

import { logger } from '../../shared/utils/logger';

import {
  ArchetypeDefinition,
} from '../../product/archetype/archetype-registry';

export interface SpacingSystem {
  base: number;
  scale: number[];
  rhythm: 'tight' | 'standard' | 'relaxed';
  multiplier: number;
}

export interface TypographySystem {
  base: {
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    letterSpacing: number;
  };
  headingScale: Array<{
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    letterSpacing: number;
  }>;
  bodyScale: Array<{
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    letterSpacing: number;
  }>;
  multiplier: number;
}

export interface SectionEmphasis {
  levels: Array<{
    id: string;
    importance: number;
    size: number;
    weight: number;
    color: string;
    spacing: number;
  }>;
  contrast: 'high' | 'medium' | 'low';
  saturation: 'vibrant' | 'muted' | 'neutral';
}

export interface CardSizes {
  small: { width: string; height: string; padding: number };
  medium: { width: string; height: string; padding: number };
  large: { width: string; height: string; padding: number };
  xlarge: { width: string; height: string; padding: number };
}

export interface VisualHierarchyMutation {
  spacingSystem: SpacingSystem;
  typographySystem: TypographySystem;
  sectionEmphasis: SectionEmphasis;
  cardSizes: CardSizes;
  contentDensity: 'dense' | 'compact' | 'comfortable' | 'spacious';
}

export interface VisualHierarchyConfig {
  enableSpacingMutation: boolean;
  enableTypographyMutation: boolean;
  enableEmphasisMutation: boolean;
  enableCardSizeMutation: boolean;
  enableDensityMutation: boolean;
}

const DEFAULT_CONFIG: VisualHierarchyConfig = {
  enableSpacingMutation: true,
  enableTypographyMutation: true,
  enableEmphasisMutation: true,
  enableCardSizeMutation: true,
  enableDensityMutation: true,
};

/**
 * Visual Hierarchy Mutation Engine
 * 
 * Mutates visual hierarchy based on domain, archetype, and workflow:
 * - Different spacing
 * - Different typography scale
 * - Different section emphasis
 * - Different card sizes
 * - Different content density
 */
export class VisualHierarchyMutationEngine {
  private config: VisualHierarchyConfig;

  constructor(config: Partial<VisualHierarchyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Mutate visual hierarchy based on domain, archetype, and workflow
   */
  mutateVisualHierarchy(domain: string, archetype: ArchetypeDefinition, workflow: string): VisualHierarchyMutation {
    const spacingSystem = this.config.enableSpacingMutation
      ? this.mutateSpacingSystem(domain, archetype)
      : this.getDefaultSpacingSystem();

    const typographySystem = this.config.enableTypographyMutation
      ? this.mutateTypographySystem(domain, archetype)
      : this.getDefaultTypographySystem();

    const sectionEmphasis = this.config.enableEmphasisMutation
      ? this.mutateSectionEmphasis(domain, workflow)
      : this.getDefaultSectionEmphasis();

    const cardSizes = this.config.enableCardSizeMutation
      ? this.mutateCardSizes(domain, archetype)
      : this.getDefaultCardSizes();

    const contentDensity = this.config.enableDensityMutation
      ? this.mutateContentDensity(domain, archetype)
      : 'comfortable';

    const mutation: VisualHierarchyMutation = {
      spacingSystem,
      typographySystem,
      sectionEmphasis,
      cardSizes,
      contentDensity,
    };

    logger.info('VisualHierarchyMutationEngine', 'HIERARCHY_MUTATED', 'Visual hierarchy mutated based on domain/archetype/workflow', {
      domain,
      archetype: archetype.id,
      workflow,
      spacingBase: spacingSystem.base,
      typographyMultiplier: typographySystem.multiplier,
      density: contentDensity,
    });

    return mutation;
  }

  /**
   * Mutate spacing system based on domain and archetype
   */
  private mutateSpacingSystem(domain: string, archetype: ArchetypeDefinition): SpacingSystem {
    const spacingSystems: Record<string, SpacingSystem> = {
      healthcare: {
        base: 20,
        scale: [4, 8, 12, 20, 32, 48, 64, 96],
        rhythm: 'relaxed',
        multiplier: 1.2,
      },
      crm: {
        base: 16,
        scale: [4, 8, 12, 16, 24, 32, 48, 64],
        rhythm: 'standard',
        multiplier: 1.0,
      },
      analytics: {
        base: 12,
        scale: [2, 4, 8, 12, 16, 24, 32, 48],
        rhythm: 'tight',
        multiplier: 0.8,
      },
      ecommerce: {
        base: 16,
        scale: [4, 8, 12, 16, 24, 32, 48, 64],
        rhythm: 'standard',
        multiplier: 1.0,
      },
      ats: {
        base: 16,
        scale: [4, 8, 12, 16, 24, 32, 48, 64],
        rhythm: 'standard',
        multiplier: 1.0,
      },
      finance: {
        base: 12,
        scale: [2, 4, 8, 12, 16, 24, 32, 48],
        rhythm: 'tight',
        multiplier: 0.8,
      },
      logistics: {
        base: 16,
        scale: [4, 8, 12, 16, 24, 32, 48, 64],
        rhythm: 'standard',
        multiplier: 1.0,
      },
      support: {
        base: 20,
        scale: [4, 8, 12, 20, 32, 48, 64, 96],
        rhythm: 'relaxed',
        multiplier: 1.2,
      },
      project_management: {
        base: 16,
        scale: [4, 8, 12, 16, 24, 32, 48, 64],
        rhythm: 'standard',
        multiplier: 1.0,
      },
      education: {
        base: 20,
        scale: [4, 8, 12, 20, 32, 48, 64, 96],
        rhythm: 'relaxed',
        multiplier: 1.2,
      },
    };

    return spacingSystems[domain] || this.getDefaultSpacingSystem();
  }

  /**
   * Mutate typography system based on domain and archetype
   */
  private mutateTypographySystem(domain: string, archetype: ArchetypeDefinition): TypographySystem {
    const typographySystems: Record<string, TypographySystem> = {
      healthcare: {
        base: {
          fontSize: 16,
          fontWeight: 400,
          lineHeight: 1.6,
          letterSpacing: 0,
        },
        headingScale: [
          { fontSize: 36, fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.5 },
          { fontSize: 28, fontWeight: 600, lineHeight: 1.3, letterSpacing: -0.25 },
          { fontSize: 22, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 18, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0 },
        ],
        bodyScale: [
          { fontSize: 16, fontWeight: 400, lineHeight: 1.6, letterSpacing: 0 },
          { fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
          { fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.25 },
        ],
        multiplier: 1.1,
      },
      crm: {
        base: {
          fontSize: 14,
          fontWeight: 400,
          lineHeight: 1.5,
          letterSpacing: 0,
        },
        headingScale: [
          { fontSize: 32, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5 },
          { fontSize: 24, fontWeight: 600, lineHeight: 1.3, letterSpacing: -0.25 },
          { fontSize: 20, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 16, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0 },
        ],
        bodyScale: [
          { fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
          { fontSize: 13, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.25 },
        ],
        multiplier: 1.0,
      },
      analytics: {
        base: {
          fontSize: 13,
          fontWeight: 400,
          lineHeight: 1.4,
          letterSpacing: 0,
        },
        headingScale: [
          { fontSize: 28, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5 },
          { fontSize: 22, fontWeight: 600, lineHeight: 1.3, letterSpacing: -0.25 },
          { fontSize: 18, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 15, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0 },
        ],
        bodyScale: [
          { fontSize: 13, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 11, fontWeight: 400, lineHeight: 1.3, letterSpacing: 0.25 },
        ],
        multiplier: 0.9,
      },
      ecommerce: {
        base: {
          fontSize: 14,
          fontWeight: 400,
          lineHeight: 1.5,
          letterSpacing: 0,
        },
        headingScale: [
          { fontSize: 32, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5 },
          { fontSize: 24, fontWeight: 600, lineHeight: 1.3, letterSpacing: -0.25 },
          { fontSize: 20, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 16, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0 },
        ],
        bodyScale: [
          { fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
          { fontSize: 13, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.25 },
        ],
        multiplier: 1.0,
      },
      ats: {
        base: {
          fontSize: 14,
          fontWeight: 400,
          lineHeight: 1.5,
          letterSpacing: 0,
        },
        headingScale: [
          { fontSize: 32, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5 },
          { fontSize: 24, fontWeight: 600, lineHeight: 1.3, letterSpacing: -0.25 },
          { fontSize: 20, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 16, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0 },
        ],
        bodyScale: [
          { fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
          { fontSize: 13, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.25 },
        ],
        multiplier: 1.0,
      },
      finance: {
        base: {
          fontSize: 13,
          fontWeight: 400,
          lineHeight: 1.4,
          letterSpacing: 0,
        },
        headingScale: [
          { fontSize: 28, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5 },
          { fontSize: 22, fontWeight: 600, lineHeight: 1.3, letterSpacing: -0.25 },
          { fontSize: 18, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 15, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0 },
        ],
        bodyScale: [
          { fontSize: 13, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 11, fontWeight: 400, lineHeight: 1.3, letterSpacing: 0.25 },
        ],
        multiplier: 0.9,
      },
      logistics: {
        base: {
          fontSize: 14,
          fontWeight: 400,
          lineHeight: 1.5,
          letterSpacing: 0,
        },
        headingScale: [
          { fontSize: 32, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5 },
          { fontSize: 24, fontWeight: 600, lineHeight: 1.3, letterSpacing: -0.25 },
          { fontSize: 20, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 16, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0 },
        ],
        bodyScale: [
          { fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
          { fontSize: 13, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.25 },
        ],
        multiplier: 1.0,
      },
      support: {
        base: {
          fontSize: 16,
          fontWeight: 400,
          lineHeight: 1.6,
          letterSpacing: 0,
        },
        headingScale: [
          { fontSize: 36, fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.5 },
          { fontSize: 28, fontWeight: 600, lineHeight: 1.3, letterSpacing: -0.25 },
          { fontSize: 22, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 18, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0 },
        ],
        bodyScale: [
          { fontSize: 16, fontWeight: 400, lineHeight: 1.6, letterSpacing: 0 },
          { fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
          { fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.25 },
        ],
        multiplier: 1.1,
      },
      project_management: {
        base: {
          fontSize: 14,
          fontWeight: 400,
          lineHeight: 1.5,
          letterSpacing: 0,
        },
        headingScale: [
          { fontSize: 32, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5 },
          { fontSize: 24, fontWeight: 600, lineHeight: 1.3, letterSpacing: -0.25 },
          { fontSize: 20, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 16, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0 },
        ],
        bodyScale: [
          { fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
          { fontSize: 13, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.25 },
        ],
        multiplier: 1.0,
      },
      education: {
        base: {
          fontSize: 16,
          fontWeight: 400,
          lineHeight: 1.6,
          letterSpacing: 0,
        },
        headingScale: [
          { fontSize: 36, fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.5 },
          { fontSize: 28, fontWeight: 600, lineHeight: 1.3, letterSpacing: -0.25 },
          { fontSize: 22, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 },
          { fontSize: 18, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0 },
        ],
        bodyScale: [
          { fontSize: 16, fontWeight: 400, lineHeight: 1.6, letterSpacing: 0 },
          { fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
          { fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.25 },
        ],
        multiplier: 1.1,
      },
    };

    return typographySystems[domain] || this.getDefaultTypographySystem();
  }

  /**
   * Mutate section emphasis based on domain and workflow
   */
  private mutateSectionEmphasis(domain: string, workflow: string): SectionEmphasis {
    const sectionEmphases: Record<string, SectionEmphasis> = {
      healthcare: {
        levels: [
          { id: 'patient-status', importance: 10, size: 2.0, weight: 700, color: 'primary', spacing: 32 },
          { id: 'appointments', importance: 9, size: 1.5, weight: 600, color: 'primary', spacing: 24 },
          { id: 'medical-records', importance: 7, size: 1.25, weight: 500, color: 'secondary', spacing: 20 },
          { id: 'lab-results', importance: 7, size: 1.25, weight: 500, color: 'secondary', spacing: 20 },
          { id: 'medications', importance: 6, size: 1.0, weight: 400, color: 'tertiary', spacing: 16 },
          { id: 'settings', importance: 3, size: 0.875, weight: 300, color: 'tertiary', spacing: 12 },
        ],
        contrast: 'medium',
        saturation: 'muted',
      },
      crm: {
        levels: [
          { id: 'pipeline', importance: 10, size: 2.0, weight: 700, color: 'primary', spacing: 24 },
          { id: 'leads', importance: 9, size: 1.5, weight: 600, color: 'primary', spacing: 20 },
          { id: 'activity', importance: 8, size: 1.25, weight: 500, color: 'secondary', spacing: 16 },
          { id: 'opportunities', importance: 8, size: 1.25, weight: 500, color: 'secondary', spacing: 16 },
          { id: 'tasks', importance: 7, size: 1.0, weight: 400, color: 'tertiary', spacing: 16 },
          { id: 'settings', importance: 3, size: 0.875, weight: 300, color: 'tertiary', spacing: 12 },
        ],
        contrast: 'high',
        saturation: 'vibrant',
      },
      analytics: {
        levels: [
          { id: 'insights', importance: 10, size: 2.0, weight: 700, color: 'primary', spacing: 20 },
          { id: 'charts', importance: 9, size: 1.5, weight: 600, color: 'primary', spacing: 16 },
          { id: 'data-tables', importance: 7, size: 1.0, weight: 400, color: 'secondary', spacing: 12 },
          { id: 'filters', importance: 6, size: 1.0, weight: 400, color: 'tertiary', spacing: 12 },
          { id: 'export', importance: 5, size: 0.875, weight: 300, color: 'tertiary', spacing: 12 },
          { id: 'settings', importance: 3, size: 0.875, weight: 300, color: 'tertiary', spacing: 8 },
        ],
        contrast: 'high',
        saturation: 'neutral',
      },
      ecommerce: {
        levels: [
          { id: 'orders', importance: 10, size: 2.0, weight: 700, color: 'primary', spacing: 24 },
          { id: 'inventory', importance: 9, size: 1.5, weight: 600, color: 'primary', spacing: 20 },
          { id: 'customers', importance: 8, size: 1.25, weight: 500, color: 'secondary', spacing: 16 },
          { id: 'fulfillment', importance: 8, size: 1.25, weight: 500, color: 'secondary', spacing: 16 },
          { id: 'analytics', importance: 6, size: 1.0, weight: 400, color: 'tertiary', spacing: 16 },
          { id: 'settings', importance: 3, size: 0.875, weight: 300, color: 'tertiary', spacing: 12 },
        ],
        contrast: 'high',
        saturation: 'vibrant',
      },
      ats: {
        levels: [
          { id: 'candidates', importance: 10, size: 2.0, weight: 700, color: 'primary', spacing: 24 },
          { id: 'pipeline', importance: 9, size: 1.5, weight: 600, color: 'primary', spacing: 20 },
          { id: 'interviews', importance: 8, size: 1.25, weight: 500, color: 'secondary', spacing: 16 },
          { id: 'offers', importance: 7, size: 1.0, weight: 400, color: 'secondary', spacing: 16 },
          { id: 'analytics', importance: 5, size: 1.0, weight: 400, color: 'tertiary', spacing: 16 },
          { id: 'settings', importance: 3, size: 0.875, weight: 300, color: 'tertiary', spacing: 12 },
        ],
        contrast: 'high',
        saturation: 'vibrant',
      },
      finance: {
        levels: [
          { id: 'financial-statements', importance: 10, size: 2.0, weight: 700, color: 'primary', spacing: 20 },
          { id: 'metrics', importance: 9, size: 1.5, weight: 600, color: 'primary', spacing: 16 },
          { id: 'reports', importance: 8, size: 1.25, weight: 500, color: 'secondary', spacing: 12 },
          { id: 'budget', importance: 7, size: 1.0, weight: 400, color: 'secondary', spacing: 12 },
          { id: 'compliance', importance: 6, size: 1.0, weight: 400, color: 'tertiary', spacing: 12 },
          { id: 'settings', importance: 3, size: 0.875, weight: 300, color: 'tertiary', spacing: 8 },
        ],
        contrast: 'high',
        saturation: 'neutral',
      },
      logistics: {
        levels: [
          { id: 'shipments', importance: 10, size: 2.0, weight: 700, color: 'primary', spacing: 24 },
          { id: 'tracking', importance: 9, size: 1.5, weight: 600, color: 'primary', spacing: 20 },
          { id: 'fleet', importance: 8, size: 1.25, weight: 500, color: 'secondary', spacing: 16 },
          { id: 'warehouse', importance: 7, size: 1.0, weight: 400, color: 'secondary', spacing: 16 },
          { id: 'analytics', importance: 5, size: 1.0, weight: 400, color: 'tertiary', spacing: 16 },
          { id: 'settings', importance: 3, size: 0.875, weight: 300, color: 'tertiary', spacing: 12 },
        ],
        contrast: 'high',
        saturation: 'vibrant',
      },
      support: {
        levels: [
          { id: 'tickets', importance: 10, size: 2.0, weight: 700, color: 'primary', spacing: 24 },
          { id: 'queue', importance: 9, size: 1.5, weight: 600, color: 'primary', spacing: 20 },
          { id: 'customer-info', importance: 8, size: 1.25, weight: 500, color: 'secondary', spacing: 16 },
          { id: 'knowledge-base', importance: 7, size: 1.0, weight: 400, color: 'secondary', spacing: 16 },
          { id: 'analytics', importance: 5, size: 1.0, weight: 400, color: 'tertiary', spacing: 16 },
          { id: 'settings', importance: 3, size: 0.875, weight: 300, color: 'tertiary', spacing: 12 },
        ],
        contrast: 'medium',
        saturation: 'muted',
      },
      project_management: {
        levels: [
          { id: 'tasks', importance: 10, size: 2.0, weight: 700, color: 'primary', spacing: 24 },
          { id: 'timeline', importance: 9, size: 1.5, weight: 600, color: 'primary', spacing: 20 },
          { id: 'team', importance: 8, size: 1.25, weight: 500, color: 'secondary', spacing: 16 },
          { id: 'milestones', importance: 7, size: 1.0, weight: 400, color: 'secondary', spacing: 16 },
          { id: 'reports', importance: 5, size: 1.0, weight: 400, color: 'tertiary', spacing: 16 },
          { id: 'settings', importance: 3, size: 0.875, weight: 300, color: 'tertiary', spacing: 12 },
        ],
        contrast: 'high',
        saturation: 'vibrant',
      },
      education: {
        levels: [
          { id: 'courses', importance: 10, size: 2.0, weight: 700, color: 'primary', spacing: 24 },
          { id: 'students', importance: 9, size: 1.5, weight: 600, color: 'primary', spacing: 20 },
          { id: 'progress', importance: 8, size: 1.25, weight: 500, color: 'secondary', spacing: 16 },
          { id: 'assessments', importance: 7, size: 1.0, weight: 400, color: 'secondary', spacing: 16 },
          { id: 'analytics', importance: 5, size: 1.0, weight: 400, color: 'tertiary', spacing: 16 },
          { id: 'settings', importance: 3, size: 0.875, weight: 300, color: 'tertiary', spacing: 12 },
        ],
        contrast: 'medium',
        saturation: 'muted',
      },
    };

    // Workflow-based adjustments
    if (workflow === 'scheduling') {
      return {
        levels: [
          { id: 'calendar', importance: 10, size: 2.0, weight: 700, color: 'primary', spacing: 32 },
          { id: 'availability', importance: 9, size: 1.5, weight: 600, color: 'primary', spacing: 24 },
          { id: 'upcoming', importance: 8, size: 1.25, weight: 500, color: 'secondary', spacing: 20 },
          { id: 'status', importance: 7, size: 1.0, weight: 400, color: 'secondary', spacing: 16 },
          { id: 'settings', importance: 3, size: 0.875, weight: 300, color: 'tertiary', spacing: 12 },
        ],
        contrast: 'medium',
        saturation: 'muted',
      };
    }

    if (workflow === 'analysis') {
      return {
        levels: [
          { id: 'insights', importance: 10, size: 2.0, weight: 700, color: 'primary', spacing: 20 },
          { id: 'charts', importance: 9, size: 1.5, weight: 600, color: 'primary', spacing: 16 },
          { id: 'data', importance: 7, size: 1.0, weight: 400, color: 'secondary', spacing: 12 },
          { id: 'filters', importance: 6, size: 1.0, weight: 400, color: 'tertiary', spacing: 12 },
          { id: 'export', importance: 5, size: 0.875, weight: 300, color: 'tertiary', spacing: 12 },
          { id: 'settings', importance: 3, size: 0.875, weight: 300, color: 'tertiary', spacing: 8 },
        ],
        contrast: 'high',
        saturation: 'neutral',
      };
    }

    return sectionEmphases[domain] || this.getDefaultSectionEmphasis();
  }

  /**
   * Mutate card sizes based on domain and archetype
   */
  private mutateCardSizes(domain: string, archetype: ArchetypeDefinition): CardSizes {
    const cardSizes: Record<string, CardSizes> = {
      healthcare: {
        small: { width: '200px', height: '150px', padding: 20 },
        medium: { width: '300px', height: '200px', padding: 24 },
        large: { width: '400px', height: '300px', padding: 28 },
        xlarge: { width: '600px', height: '400px', padding: 32 },
      },
      crm: {
        small: { width: '180px', height: '120px', padding: 16 },
        medium: { width: '280px', height: '180px', padding: 20 },
        large: { width: '380px', height: '250px', padding: 24 },
        xlarge: { width: '580px', height: '350px', padding: 28 },
      },
      analytics: {
        small: { width: '150px', height: '100px', padding: 12 },
        medium: { width: '250px', height: '150px', padding: 16 },
        large: { width: '350px', height: '200px', padding: 20 },
        xlarge: { width: '550px', height: '300px', padding: 24 },
      },
      ecommerce: {
        small: { width: '180px', height: '120px', padding: 16 },
        medium: { width: '280px', height: '180px', padding: 20 },
        large: { width: '380px', height: '250px', padding: 24 },
        xlarge: { width: '580px', height: '350px', padding: 28 },
      },
      ats: {
        small: { width: '180px', height: '120px', padding: 16 },
        medium: { width: '280px', height: '180px', padding: 20 },
        large: { width: '380px', height: '250px', padding: 24 },
        xlarge: { width: '580px', height: '350px', padding: 28 },
      },
      finance: {
        small: { width: '150px', height: '100px', padding: 12 },
        medium: { width: '250px', height: '150px', padding: 16 },
        large: { width: '350px', height: '200px', padding: 20 },
        xlarge: { width: '550px', height: '300px', padding: 24 },
      },
      logistics: {
        small: { width: '180px', height: '120px', padding: 16 },
        medium: { width: '280px', height: '180px', padding: 20 },
        large: { width: '380px', height: '250px', padding: 24 },
        xlarge: { width: '580px', height: '350px', padding: 28 },
      },
      support: {
        small: { width: '200px', height: '150px', padding: 20 },
        medium: { width: '300px', height: '200px', padding: 24 },
        large: { width: '400px', height: '300px', padding: 28 },
        xlarge: { width: '600px', height: '400px', padding: 32 },
      },
      project_management: {
        small: { width: '180px', height: '120px', padding: 16 },
        medium: { width: '280px', height: '180px', padding: 20 },
        large: { width: '380px', height: '250px', padding: 24 },
        xlarge: { width: '580px', height: '350px', padding: 28 },
      },
      education: {
        small: { width: '200px', height: '150px', padding: 20 },
        medium: { width: '300px', height: '200px', padding: 24 },
        large: { width: '400px', height: '300px', padding: 28 },
        xlarge: { width: '600px', height: '400px', padding: 32 },
      },
    };

    return cardSizes[domain] || this.getDefaultCardSizes();
  }

  /**
   * Mutate content density based on domain and archetype
   */
  private mutateContentDensity(domain: string, archetype: ArchetypeDefinition): VisualHierarchyMutation['contentDensity'] {
    const densities: Record<string, VisualHierarchyMutation['contentDensity']> = {
      healthcare: 'comfortable',
      crm: 'compact',
      analytics: 'dense',
      ecommerce: 'compact',
      ats: 'compact',
      finance: 'dense',
      logistics: 'compact',
      support: 'comfortable',
      project_management: 'compact',
      education: 'comfortable',
    };

    return densities[domain] || 'comfortable';
  }

  /**
   * Get default spacing system
   */
  private getDefaultSpacingSystem(): SpacingSystem {
    return {
      base: 16,
      scale: [4, 8, 12, 16, 24, 32, 48, 64],
      rhythm: 'standard',
      multiplier: 1.0,
    };
  }

  /**
   * Get default typography system
   */
  private getDefaultTypographySystem(): TypographySystem {
    return {
      base: {
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: 0,
      },
      headingScale: [
        { fontSize: 32, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5 },
        { fontSize: 24, fontWeight: 600, lineHeight: 1.3, letterSpacing: -0.25 },
        { fontSize: 20, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0 },
        { fontSize: 16, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0 },
      ],
      bodyScale: [
        { fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 },
        { fontSize: 13, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0 },
        { fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.25 },
      ],
      multiplier: 1.0,
    };
  }

  /**
   * Get default section emphasis
   */
  private getDefaultSectionEmphasis(): SectionEmphasis {
    return {
      levels: [
        { id: 'dashboard', importance: 10, size: 2.0, weight: 700, color: 'primary', spacing: 24 },
        { id: 'data', importance: 7, size: 1.0, weight: 400, color: 'secondary', spacing: 16 },
        { id: 'reports', importance: 5, size: 1.0, weight: 400, color: 'tertiary', spacing: 16 },
        { id: 'settings', importance: 3, size: 0.875, weight: 300, color: 'tertiary', spacing: 12 },
      ],
      contrast: 'medium',
      saturation: 'neutral',
    };
  }

  /**
   * Get default card sizes
   */
  private getDefaultCardSizes(): CardSizes {
    return {
      small: { width: '180px', height: '120px', padding: 16 },
      medium: { width: '280px', height: '180px', padding: 20 },
      large: { width: '380px', height: '250px', padding: 24 },
      xlarge: { width: '580px', height: '350px', padding: 28 },
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VisualHierarchyConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('VisualHierarchyMutationEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): VisualHierarchyConfig {
    return { ...this.config };
  }
}

export const visualHierarchyMutationEngine = new VisualHierarchyMutationEngine();

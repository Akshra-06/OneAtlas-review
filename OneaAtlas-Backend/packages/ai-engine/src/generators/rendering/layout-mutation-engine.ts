/**
 * Layout Mutation Engine
 * 
 * Mutates layout structure based on domain, archetype, and workflow.
 * Ensures different domains have fundamentally different layouts.
 */

import { logger } from '../../shared/utils/logger';

import {
  ArchetypeDefinition,
} from '../../product/archetype/archetype-registry';

export interface GridSystem {
  columns: number;
  gutter: number;
  margin: number;
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export interface NavigationStructure {
  type: 'sidebar' | 'topbar' | 'sidebar-topbar' | 'minimal' | 'command-palette';
  position: 'left' | 'top' | 'right' | 'bottom';
  collapsible: boolean;
  width?: number;
  height?: number;
}

export interface ContentDensity {
  level: 'dense' | 'compact' | 'comfortable' | 'spacious';
  spacingMultiplier: number;
  fontSizeMultiplier: number;
  cardPadding: number;
}

export interface SectionOrder {
  sections: string[];
  priority: number[];
  grouping: string[][];
}

export interface LayoutMutation {
  gridSystem: GridSystem;
  navigationStructure: NavigationStructure;
  contentDensity: ContentDensity;
  sectionOrder: SectionOrder;
  sidebarBehavior: {
    alwaysVisible: boolean;
    collapsible: boolean;
    overlayOnMobile: boolean;
    iconOnlyOnCollapse: boolean;
  };
}

export interface LayoutMutationConfig {
  enableGridMutation: boolean;
  enableNavigationMutation: boolean;
  enableDensityMutation: boolean;
  enableSectionOrderMutation: boolean;
  enableSidebarMutation: boolean;
}

const DEFAULT_CONFIG: LayoutMutationConfig = {
  enableGridMutation: true,
  enableNavigationMutation: true,
  enableDensityMutation: true,
  enableSectionOrderMutation: true,
  enableSidebarMutation: true,
};

/**
 * Layout Mutation Engine
 * 
 * Mutates layout structure based on domain, archetype, and workflow:
 * - Different grid systems per domain
 * - Different navigation structures
 * - Different content density
 * - Different sidebar behavior
 * - Different section ordering
 */
export class LayoutMutationEngine {
  private config: LayoutMutationConfig;

  constructor(config: Partial<LayoutMutationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Mutate layout based on domain, archetype, and workflow
   */
  mutateLayout(domain: string, archetype: ArchetypeDefinition, workflow: string): LayoutMutation {
    const gridSystem = this.config.enableGridMutation
      ? this.mutateGridSystem(domain, archetype)
      : this.getDefaultGridSystem();

    const navigationStructure = this.config.enableNavigationMutation
      ? this.mutateNavigationStructure(domain, archetype, workflow)
      : this.getDefaultNavigationStructure();

    const contentDensity = this.config.enableDensityMutation
      ? this.mutateContentDensity(domain, archetype)
      : this.getDefaultContentDensity();

    const sectionOrder = this.config.enableSectionOrderMutation
      ? this.mutateSectionOrder(domain, workflow)
      : this.getDefaultSectionOrder();

    const sidebarBehavior = this.config.enableSidebarMutation
      ? this.mutateSidebarBehavior(domain, archetype)
      : this.getDefaultSidebarBehavior();

    const mutation: LayoutMutation = {
      gridSystem,
      navigationStructure,
      contentDensity,
      sectionOrder,
      sidebarBehavior,
    };

    logger.info('LayoutMutationEngine', 'LAYOUT_MUTATED', 'Layout mutated based on domain/archetype/workflow', {
      domain,
      archetype: archetype.id,
      workflow,
      gridColumns: gridSystem.columns,
      navigationType: navigationStructure.type,
      density: contentDensity.level,
    });

    return mutation;
  }

  /**
   * Mutate grid system based on domain and archetype
   */
  private mutateGridSystem(domain: string, archetype: ArchetypeDefinition): GridSystem {
    const gridSystems: Record<string, GridSystem> = {
      healthcare: {
        columns: 6,
        gutter: 24,
        margin: 32,
        breakpoints: {
          mobile: 1,
          tablet: 3,
          desktop: 6,
        },
      },
      crm: {
        columns: 8,
        gutter: 16,
        margin: 24,
        breakpoints: {
          mobile: 1,
          tablet: 4,
          desktop: 8,
        },
      },
      analytics: {
        columns: 12,
        gutter: 12,
        margin: 16,
        breakpoints: {
          mobile: 1,
          tablet: 6,
          desktop: 12,
        },
      },
      ecommerce: {
        columns: 8,
        gutter: 16,
        margin: 24,
        breakpoints: {
          mobile: 1,
          tablet: 4,
          desktop: 8,
        },
      },
      ats: {
        columns: 6,
        gutter: 20,
        margin: 28,
        breakpoints: {
          mobile: 1,
          tablet: 3,
          desktop: 6,
        },
      },
      finance: {
        columns: 12,
        gutter: 12,
        margin: 16,
        breakpoints: {
          mobile: 1,
          tablet: 6,
          desktop: 12,
        },
      },
      logistics: {
        columns: 8,
        gutter: 16,
        margin: 24,
        breakpoints: {
          mobile: 1,
          tablet: 4,
          desktop: 8,
        },
      },
      support: {
        columns: 6,
        gutter: 20,
        margin: 28,
        breakpoints: {
          mobile: 1,
          tablet: 3,
          desktop: 6,
        },
      },
      project_management: {
        columns: 6,
        gutter: 20,
        margin: 28,
        breakpoints: {
          mobile: 1,
          tablet: 3,
          desktop: 6,
        },
      },
      education: {
        columns: 6,
        gutter: 24,
        margin: 32,
        breakpoints: {
          mobile: 1,
          tablet: 3,
          desktop: 6,
        },
      },
    };

    return gridSystems[domain] || this.getDefaultGridSystem();
  }

  /**
   * Mutate navigation structure based on domain, archetype, and workflow
   */
  private mutateNavigationStructure(domain: string, archetype: ArchetypeDefinition, workflow: string): NavigationStructure {
    const navigationStructures: Record<string, NavigationStructure> = {
      healthcare: {
        type: 'sidebar',
        position: 'left',
        collapsible: true,
        width: 280,
      },
      crm: {
        type: 'sidebar',
        position: 'left',
        collapsible: true,
        width: 260,
      },
      analytics: {
        type: 'topbar',
        position: 'top',
        collapsible: false,
        height: 64,
      },
      ecommerce: {
        type: 'topbar',
        position: 'top',
        collapsible: false,
        height: 64,
      },
      ats: {
        type: 'sidebar',
        position: 'left',
        collapsible: true,
        width: 260,
      },
      finance: {
        type: 'topbar',
        position: 'top',
        collapsible: false,
        height: 64,
      },
      logistics: {
        type: 'topbar',
        position: 'top',
        collapsible: false,
        height: 64,
      },
      support: {
        type: 'sidebar',
        position: 'left',
        collapsible: true,
        width: 260,
      },
      project_management: {
        type: 'sidebar',
        position: 'left',
        collapsible: true,
        width: 280,
      },
      education: {
        type: 'sidebar',
        position: 'left',
        collapsible: true,
        width: 280,
      },
    };

    // Workflow-based adjustments
    if (workflow === 'scheduling') {
      return {
        type: 'sidebar',
        position: 'left',
        collapsible: true,
        width: 280,
      };
    }

    if (workflow === 'analysis') {
      return {
        type: 'topbar',
        position: 'top',
        collapsible: false,
        height: 64,
      };
    }

    return navigationStructures[domain] || this.getDefaultNavigationStructure();
  }

  /**
   * Mutate content density based on domain and archetype
   */
  private mutateContentDensity(domain: string, archetype: ArchetypeDefinition): ContentDensity {
    const contentDensities: Record<string, ContentDensity> = {
      healthcare: {
        level: 'comfortable',
        spacingMultiplier: 1.2,
        fontSizeMultiplier: 1.1,
        cardPadding: 24,
      },
      crm: {
        level: 'compact',
        spacingMultiplier: 1.0,
        fontSizeMultiplier: 1.0,
        cardPadding: 16,
      },
      analytics: {
        level: 'dense',
        spacingMultiplier: 0.8,
        fontSizeMultiplier: 0.9,
        cardPadding: 12,
      },
      ecommerce: {
        level: 'compact',
        spacingMultiplier: 1.0,
        fontSizeMultiplier: 1.0,
        cardPadding: 16,
      },
      ats: {
        level: 'compact',
        spacingMultiplier: 1.0,
        fontSizeMultiplier: 1.0,
        cardPadding: 16,
      },
      finance: {
        level: 'dense',
        spacingMultiplier: 0.8,
        fontSizeMultiplier: 0.9,
        cardPadding: 12,
      },
      logistics: {
        level: 'compact',
        spacingMultiplier: 1.0,
        fontSizeMultiplier: 1.0,
        cardPadding: 16,
      },
      support: {
        level: 'comfortable',
        spacingMultiplier: 1.2,
        fontSizeMultiplier: 1.1,
        cardPadding: 24,
      },
      project_management: {
        level: 'compact',
        spacingMultiplier: 1.0,
        fontSizeMultiplier: 1.0,
        cardPadding: 16,
      },
      education: {
        level: 'comfortable',
        spacingMultiplier: 1.2,
        fontSizeMultiplier: 1.1,
        cardPadding: 24,
      },
    };

    return contentDensities[domain] || this.getDefaultContentDensity();
  }

  /**
   * Mutate section order based on domain and workflow
   */
  private mutateSectionOrder(domain: string, workflow: string): SectionOrder {
    const sectionOrders: Record<string, SectionOrder> = {
      healthcare: {
        sections: ['patient-status', 'appointments', 'calendar', 'medical-records', 'lab-results', 'medications', 'settings'],
        priority: [10, 9, 9, 7, 7, 6, 3],
        grouping: [['patient-status', 'appointments'], ['calendar'], ['medical-records', 'lab-results', 'medications'], ['settings']],
      },
      crm: {
        sections: ['pipeline', 'leads', 'activity', 'opportunities', 'tasks', 'reports', 'settings'],
        priority: [10, 9, 8, 8, 7, 5, 3],
        grouping: [['pipeline'], ['leads', 'opportunities'], ['activity', 'tasks'], ['reports'], ['settings']],
      },
      analytics: {
        sections: ['insights', 'charts', 'data-tables', 'filters', 'export', 'settings'],
        priority: [10, 9, 7, 6, 5, 3],
        grouping: [['insights'], ['charts'], ['data-tables'], ['filters', 'export'], ['settings']],
      },
      ecommerce: {
        sections: ['orders', 'inventory', 'customers', 'fulfillment', 'analytics', 'settings'],
        priority: [10, 9, 8, 8, 6, 3],
        grouping: [['orders', 'fulfillment'], ['inventory'], ['customers'], ['analytics'], ['settings']],
      },
      ats: {
        sections: ['candidates', 'pipeline', 'interviews', 'offers', 'analytics', 'settings'],
        priority: [10, 9, 8, 7, 5, 3],
        grouping: [['candidates', 'pipeline'], ['interviews', 'offers'], ['analytics'], ['settings']],
      },
      finance: {
        sections: ['financial-statements', 'metrics', 'reports', 'budget', 'compliance', 'settings'],
        priority: [10, 9, 8, 7, 6, 3],
        grouping: [['financial-statements', 'metrics'], ['reports', 'budget'], ['compliance'], ['settings']],
      },
      logistics: {
        sections: ['shipments', 'tracking', 'fleet', 'warehouse', 'analytics', 'settings'],
        priority: [10, 9, 8, 7, 5, 3],
        grouping: [['shipments', 'tracking'], ['fleet', 'warehouse'], ['analytics'], ['settings']],
      },
      support: {
        sections: ['tickets', 'queue', 'customer-info', 'knowledge-base', 'analytics', 'settings'],
        priority: [10, 9, 8, 7, 5, 3],
        grouping: [['tickets', 'queue'], ['customer-info'], ['knowledge-base'], ['analytics'], ['settings']],
      },
      project_management: {
        sections: ['tasks', 'timeline', 'team', 'milestones', 'reports', 'settings'],
        priority: [10, 9, 8, 7, 5, 3],
        grouping: [['tasks'], ['timeline', 'milestones'], ['team'], ['reports'], ['settings']],
      },
      education: {
        sections: ['courses', 'students', 'progress', 'assessments', 'analytics', 'settings'],
        priority: [10, 9, 8, 7, 5, 3],
        grouping: [['courses', 'students'], ['progress', 'assessments'], ['analytics'], ['settings']],
      },
    };

    // Workflow-based adjustments
    if (workflow === 'scheduling') {
      return {
        sections: ['calendar', 'availability', 'appointments', 'status', 'settings'],
        priority: [10, 9, 8, 7, 3],
        grouping: [['calendar', 'availability'], ['appointments'], ['status'], ['settings']],
      };
    }

    if (workflow === 'analysis') {
      return {
        sections: ['insights', 'charts', 'data', 'filters', 'export', 'settings'],
        priority: [10, 9, 7, 6, 5, 3],
        grouping: [['insights'], ['charts'], ['data'], ['filters', 'export'], ['settings']],
      };
    }

    return sectionOrders[domain] || this.getDefaultSectionOrder();
  }

  /**
   * Mutate sidebar behavior based on domain and archetype
   */
  private mutateSidebarBehavior(domain: string, archetype: ArchetypeDefinition) {
    const sidebarBehaviors: Record<string, any> = {
      healthcare: {
        alwaysVisible: true,
        collapsible: true,
        overlayOnMobile: true,
        iconOnlyOnCollapse: false,
      },
      crm: {
        alwaysVisible: true,
        collapsible: true,
        overlayOnMobile: true,
        iconOnlyOnCollapse: true,
      },
      analytics: {
        alwaysVisible: false,
        collapsible: false,
        overlayOnMobile: false,
        iconOnlyOnCollapse: false,
      },
      ecommerce: {
        alwaysVisible: false,
        collapsible: false,
        overlayOnMobile: false,
        iconOnlyOnCollapse: false,
      },
      ats: {
        alwaysVisible: true,
        collapsible: true,
        overlayOnMobile: true,
        iconOnlyOnCollapse: true,
      },
      finance: {
        alwaysVisible: false,
        collapsible: false,
        overlayOnMobile: false,
        iconOnlyOnCollapse: false,
      },
      logistics: {
        alwaysVisible: false,
        collapsible: false,
        overlayOnMobile: false,
        iconOnlyOnCollapse: false,
      },
      support: {
        alwaysVisible: true,
        collapsible: true,
        overlayOnMobile: true,
        iconOnlyOnCollapse: true,
      },
      project_management: {
        alwaysVisible: true,
        collapsible: true,
        overlayOnMobile: true,
        iconOnlyOnCollapse: false,
      },
      education: {
        alwaysVisible: true,
        collapsible: true,
        overlayOnMobile: true,
        iconOnlyOnCollapse: false,
      },
    };

    return sidebarBehaviors[domain] || this.getDefaultSidebarBehavior();
  }

  /**
   * Get default grid system
   */
  private getDefaultGridSystem(): GridSystem {
    return {
      columns: 12,
      gutter: 16,
      margin: 24,
      breakpoints: {
        mobile: 1,
        tablet: 6,
        desktop: 12,
      },
    };
  }

  /**
   * Get default navigation structure
   */
  private getDefaultNavigationStructure(): NavigationStructure {
    return {
      type: 'sidebar',
      position: 'left',
      collapsible: true,
      width: 280,
    };
  }

  /**
   * Get default content density
   */
  private getDefaultContentDensity(): ContentDensity {
    return {
      level: 'comfortable',
      spacingMultiplier: 1.0,
      fontSizeMultiplier: 1.0,
      cardPadding: 16,
    };
  }

  /**
   * Get default section order
   */
  private getDefaultSectionOrder(): SectionOrder {
    return {
      sections: ['dashboard', 'data', 'reports', 'settings'],
      priority: [10, 7, 5, 3],
      grouping: [['dashboard'], ['data'], ['reports'], ['settings']],
    };
  }

  /**
   * Get default sidebar behavior
   */
  private getDefaultSidebarBehavior() {
    return {
      alwaysVisible: true,
      collapsible: true,
      overlayOnMobile: true,
      iconOnlyOnCollapse: false,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LayoutMutationConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('LayoutMutationEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): LayoutMutationConfig {
    return { ...this.config };
  }
}

export const layoutMutationEngine = new LayoutMutationEngine();

/**
 * Dynamic Dashboard Schema
 * 
 * Generates dashboard schemas dynamically based on domain, archetype, and workflow.
 * Replaces static dashboard schemas with dynamic schema generation.
 */

import { logger } from '../../shared/utils/logger';

import {
  ArchetypeDefinition,
} from '../../product/archetype/archetype-registry';

import type { SectionGraph } from './dynamic-section-planner';
import type { WidgetGraph } from './widget-graph-composition';
import type { LayoutGraph } from './layout-graph-generation';

export interface DashboardSchema {
  id: string;
  name: string;
  description: string;
  domain: string;
  archetype: string;
  workflow: string;
  layout: DashboardLayout;
  sections: DashboardSectionSchema[];
  widgets: DashboardWidgetSchema[];
  data: DashboardDataSchema;
  permissions: DashboardPermissionSchema;
  styling: DashboardStylingSchema;
}

export interface DashboardLayout {
  type: 'sidebar-content' | 'topbar-content' | 'sidebar-topbar' | 'minimal' | 'calendar-first' | 'pipeline-first' | 'chart-dominant';
  grid: {
    columns: number;
    rows: number;
    gap: number;
  };
  navigation: {
    type: 'sidebar' | 'topbar' | 'sidebar-topbar' | 'minimal';
    position: 'left' | 'top' | 'right' | 'bottom';
  };
}

export interface DashboardSectionSchema {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: number;
  span: number;
  height: string;
  conditions: {
    workflow?: string;
    role?: string;
    state?: string;
  };
}

export interface DashboardWidgetSchema {
  id: string;
  type: string;
  component: string;
  props: Record<string, any>;
  dataSources: string[];
  styling: {
    size: 'small' | 'medium' | 'large' | 'xlarge';
    density: 'dense' | 'compact' | 'comfortable' | 'spacious';
    emphasis: 'primary' | 'secondary' | 'tertiary';
  };
}

export interface DashboardDataSchema {
  sources: Record<string, DataSourceDefinition>;
  relationships: DataRelationship[];
}

export interface DataSourceDefinition {
  id: string;
  type: 'entity' | 'api' | 'computed' | 'static';
  endpoint?: string;
  entity?: string;
  query?: string;
  refreshInterval?: number;
}

export interface DataRelationship {
  from: string;
  to: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many' | 'computed';
}

export interface DashboardPermissionSchema {
  view: string[];
  edit: string[];
  delete: string[];
  admin: string[];
}

export interface DashboardStylingSchema {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    surfaceColor: string;
  };
  typography: {
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
  };
  spacing: {
    base: number;
    scale: number[];
  };
  borderRadius: number;
  shadow: string;
}

export interface DynamicDashboardSchemaConfig {
  enableDynamicLayout: boolean;
  enableDynamicData: boolean;
  enableDynamicStyling: boolean;
  enableDynamicPermissions: boolean;
}

const DEFAULT_CONFIG: DynamicDashboardSchemaConfig = {
  enableDynamicLayout: true,
  enableDynamicData: true,
  enableDynamicStyling: true,
  enableDynamicPermissions: true,
};

/**
 * Dynamic Dashboard Schema
 * 
 * Generates dashboard schemas dynamically based on domain, archetype, and workflow:
 * - Creates dashboard layout schema
 * - Generates section schemas
 * - Creates widget schemas
 * - Defines data schema
 * - Sets permission schema
 * - Applies styling schema
 */
export class DynamicDashboardSchema {
  private config: DynamicDashboardSchemaConfig;

  constructor(config: Partial<DynamicDashboardSchemaConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate dashboard schema based on domain, archetype, workflow, and graphs
   */
  generateDashboardSchema(
    domain: string,
    archetype: ArchetypeDefinition,
    workflow: string,
    sectionGraph: SectionGraph,
    widgetGraph: WidgetGraph,
    layoutGraph: LayoutGraph
  ): DashboardSchema {
    const layout = this.config.enableDynamicLayout
      ? this.generateDashboardLayout(domain, archetype, workflow, layoutGraph)
      : this.getDefaultDashboardLayout();

    const sections = this.generateSectionSchemas(sectionGraph);
    const widgets = this.generateWidgetSchemas(widgetGraph);
    const data = this.config.enableDynamicData
      ? this.generateDataSchema(domain, sectionGraph)
      : this.getDefaultDataSchema();

    const permissions = this.config.enableDynamicPermissions
      ? this.generatePermissionSchema(domain)
      : this.getDefaultPermissionSchema();

    const styling = this.config.enableDynamicStyling
      ? this.generateStylingSchema(domain, archetype)
      : this.getDefaultStylingSchema();

    const schema: DashboardSchema = {
      id: `${domain}-${workflow}-dashboard`,
      name: `${this.capitalize(domain)} ${this.capitalize(workflow)} Dashboard`,
      description: `Dynamic dashboard for ${domain} with ${workflow} workflow`,
      domain,
      archetype: archetype.id,
      workflow,
      layout,
      sections,
      widgets,
      data,
      permissions,
      styling,
    };

    logger.info('DynamicDashboardSchema', 'DASHBOARD_SCHEMA_GENERATED', 'Dashboard schema generated dynamically', {
      domain,
      archetype: archetype.id,
      workflow,
      sectionCount: sections.length,
      widgetCount: widgets.length,
    });

    return schema;
  }

  /**
   * Generate dashboard layout schema
   */
  private generateDashboardLayout(domain: string, archetype: ArchetypeDefinition, workflow: string, layoutGraph: LayoutGraph): DashboardLayout {
    return {
      type: layoutGraph.structure.type,
      grid: layoutGraph.grid,
      navigation: {
        type: this.determineNavigationType(domain, archetype),
        position: this.determineNavigationPosition(domain, archetype),
      },
    };
  }

  /**
   * Generate section schemas from section graph
   */
  private generateSectionSchemas(sectionGraph: SectionGraph): DashboardSectionSchema[] {
    return sectionGraph.nodes.map(section => ({
      id: section.id,
      type: section.type,
      title: section.title,
      description: section.description || '',
      priority: section.priority,
      span: section.span,
      height: section.height,
      conditions: section.conditions,
    }));
  }

  /**
   * Generate widget schemas from widget graph
   */
  private generateWidgetSchemas(widgetGraph: WidgetGraph): DashboardWidgetSchema[] {
    return widgetGraph.nodes.map(widget => ({
      id: widget.id,
      type: widget.type,
      component: widget.component,
      props: widget.props,
      dataSources: widget.dataSources,
      styling: widget.styling,
    }));
  }

  /**
   * Generate data schema based on domain and section graph
   */
  private generateDataSchema(domain: string, sectionGraph: SectionGraph): DashboardDataSchema {
    const sources: Record<string, DataSourceDefinition> = {};
    const relationships: DataRelationship[] = [];

    // Collect data sources from sections
    for (const section of sectionGraph.nodes) {
      for (const dataSource of section.dataSources) {
        sources[dataSource] = {
          id: dataSource,
          type: 'entity',
          entity: dataSource,
        };
      }
    }

    // Generate relationships based on section dependencies
    for (const section of sectionGraph.nodes) {
      for (const dependency of section.dependencies) {
        relationships.push({
          from: dependency,
          to: section.id,
          type: 'computed',
        });
      }
    }

    return {
      sources,
      relationships,
    };
  }

  /**
   * Generate permission schema based on domain
   */
  private generatePermissionSchema(domain: string): DashboardPermissionSchema {
    const permissionMap: Record<string, DashboardPermissionSchema> = {
      healthcare: {
        view: ['view:patients', 'view:appointments', 'view:records'],
        edit: ['edit:patients', 'edit:appointments'],
        delete: ['delete:patients', 'delete:appointments'],
        admin: ['admin:patients', 'admin:appointments'],
      },
      crm: {
        view: ['view:leads', 'view:deals', 'view:pipeline'],
        edit: ['edit:leads', 'edit:deals'],
        delete: ['delete:leads', 'delete:deals'],
        admin: ['admin:leads', 'admin:deals'],
      },
      analytics: {
        view: ['view:analytics', 'view:reports'],
        edit: ['edit:reports'],
        delete: ['delete:reports'],
        admin: ['admin:analytics'],
      },
      ecommerce: {
        view: ['view:orders', 'view:inventory', 'view:customers'],
        edit: ['edit:orders', 'edit:inventory'],
        delete: ['delete:orders', 'delete:inventory'],
        admin: ['admin:orders', 'admin:inventory'],
      },
      ats: {
        view: ['view:candidates', 'view:interviews', 'view:pipeline'],
        edit: ['edit:candidates', 'edit:interviews'],
        delete: ['delete:candidates', 'delete:interviews'],
        admin: ['admin:candidates', 'admin:interviews'],
      },
      finance: {
        view: ['view:financials', 'view:reports'],
        edit: ['edit:financials', 'edit:reports'],
        delete: ['delete:financials'],
        admin: ['admin:financials'],
      },
      logistics: {
        view: ['view:shipments', 'view:fleet', 'view:warehouse'],
        edit: ['edit:shipments', 'edit:fleet'],
        delete: ['delete:shipments'],
        admin: ['admin:shipments'],
      },
      support: {
        view: ['view:tickets', 'view:customers'],
        edit: ['edit:tickets'],
        delete: ['delete:tickets'],
        admin: ['admin:tickets'],
      },
      project_management: {
        view: ['view:tasks', 'view:projects', 'view:team'],
        edit: ['edit:tasks', 'edit:projects'],
        delete: ['delete:tasks', 'delete:projects'],
        admin: ['admin:tasks', 'admin:projects'],
      },
      education: {
        view: ['view:courses', 'view:students', 'view:progress'],
        edit: ['edit:courses', 'edit:students'],
        delete: ['delete:courses'],
        admin: ['admin:courses', 'admin:students'],
      },
    };

    return permissionMap[domain] || this.getDefaultPermissionSchema();
  }

  /**
   * Generate styling schema based on domain and archetype
   */
  private generateStylingSchema(domain: string, archetype: ArchetypeDefinition): DashboardStylingSchema {
    const themeMap: Record<string, DashboardStylingSchema['theme']> = {
      healthcare: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        backgroundColor: '#F9FAFB',
        surfaceColor: '#FFFFFF',
      },
      crm: {
        primaryColor: '#2563EB',
        secondaryColor: '#7C3AED',
        accentColor: '#EC4899',
        backgroundColor: '#F8FAFC',
        surfaceColor: '#FFFFFF',
      },
      analytics: {
        primaryColor: '#8B5CF6',
        secondaryColor: '#06B6D4',
        accentColor: '#F43F5E',
        backgroundColor: '#0F172A',
        surfaceColor: '#1E293B',
      },
      ecommerce: {
        primaryColor: '#F97316',
        secondaryColor: '#EF4444',
        accentColor: '#10B981',
        backgroundColor: '#F8FAFC',
        surfaceColor: '#FFFFFF',
      },
      ats: {
        primaryColor: '#0D9488',
        secondaryColor: '#6366F1',
        accentColor: '#F59E0B',
        backgroundColor: '#F8FAFC',
        surfaceColor: '#FFFFFF',
      },
      finance: {
        primaryColor: '#059669',
        secondaryColor: '#0891B2',
        accentColor: '#DC2626',
        backgroundColor: '#F8FAFC',
        surfaceColor: '#FFFFFF',
      },
      logistics: {
        primaryColor: '#0284C7',
        secondaryColor: '#4F46E5',
        accentColor: '#F59E0B',
        backgroundColor: '#F8FAFC',
        surfaceColor: '#FFFFFF',
      },
      support: {
        primaryColor: '#8B5CF6',
        secondaryColor: '#EC4899',
        accentColor: '#10B981',
        backgroundColor: '#F9FAFB',
        surfaceColor: '#FFFFFF',
      },
      project_management: {
        primaryColor: '#4F46E5',
        secondaryColor: '#7C3AED',
        accentColor: '#F59E0B',
        backgroundColor: '#F8FAFC',
        surfaceColor: '#FFFFFF',
      },
      education: {
        primaryColor: '#10B981',
        secondaryColor: '#3B82F6',
        accentColor: '#F59E0B',
        backgroundColor: '#F9FAFB',
        surfaceColor: '#FFFFFF',
      },
    };

    const typographyMap: Record<string, DashboardStylingSchema['typography']> = {
      healthcare: {
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 1.6,
      },
      crm: {
        fontFamily: 'Inter',
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 1.5,
      },
      analytics: {
        fontFamily: 'JetBrains Mono',
        fontSize: 13,
        fontWeight: 400,
        lineHeight: 1.4,
      },
      ecommerce: {
        fontFamily: 'Inter',
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 1.5,
      },
      ats: {
        fontFamily: 'Inter',
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 1.5,
      },
      finance: {
        fontFamily: 'Inter',
        fontSize: 13,
        fontWeight: 400,
        lineHeight: 1.4,
      },
      logistics: {
        fontFamily: 'Inter',
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 1.5,
      },
      support: {
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 1.6,
      },
      project_management: {
        fontFamily: 'Inter',
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 1.5,
      },
      education: {
        fontFamily: 'Inter',
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 1.6,
      },
    };

    const spacingMap: Record<string, DashboardStylingSchema['spacing']> = {
      healthcare: {
        base: 20,
        scale: [4, 8, 12, 20, 32, 48, 64, 96],
      },
      crm: {
        base: 16,
        scale: [4, 8, 12, 16, 24, 32, 48, 64],
      },
      analytics: {
        base: 12,
        scale: [2, 4, 8, 12, 16, 24, 32, 48],
      },
      ecommerce: {
        base: 16,
        scale: [4, 8, 12, 16, 24, 32, 48, 64],
      },
      ats: {
        base: 20,
        scale: [4, 8, 12, 20, 32, 48, 64, 96],
      },
      finance: {
        base: 12,
        scale: [2, 4, 8, 12, 16, 24, 32, 48],
      },
      logistics: {
        base: 16,
        scale: [4, 8, 12, 16, 24, 32, 48, 64],
      },
      support: {
        base: 20,
        scale: [4, 8, 12, 20, 32, 48, 64, 96],
      },
      project_management: {
        base: 20,
        scale: [4, 8, 12, 20, 32, 48, 64, 96],
      },
      education: {
        base: 20,
        scale: [4, 8, 12, 20, 32, 48, 64, 96],
      },
    };

    const borderRadiusMap: Record<string, number> = {
      healthcare: 12,
      crm: 8,
      analytics: 4,
      ecommerce: 8,
      ats: 8,
      finance: 4,
      logistics: 8,
      support: 12,
      project_management: 8,
      education: 12,
    };

    const shadowMap: Record<string, string> = {
      healthcare: 'subtle',
      crm: 'medium',
      analytics: 'flat',
      ecommerce: 'medium',
      ats: 'medium',
      finance: 'subtle',
      logistics: 'medium',
      support: 'subtle',
      project_management: 'medium',
      education: 'subtle',
    };

    const defaultTheme = themeMap['crm'] || {
      primaryColor: '#2563EB',
      secondaryColor: '#7C3AED',
      accentColor: '#EC4899',
      backgroundColor: '#F8FAFC',
      surfaceColor: '#FFFFFF',
    };

    const defaultTypography = typographyMap['crm'] || {
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 1.5,
    };

    const defaultSpacing = spacingMap['crm'] || {
      base: 16,
      scale: [4, 8, 12, 16, 24, 32, 48, 64],
    };

    return {
      theme: themeMap[domain] || defaultTheme,
      typography: typographyMap[domain] || defaultTypography,
      spacing: spacingMap[domain] || defaultSpacing,
      borderRadius: borderRadiusMap[domain] || 8,
      shadow: shadowMap[domain] || 'medium',
    };
  }

  /**
   * Determine navigation type based on domain and archetype
   */
  private determineNavigationType(domain: string, archetype: ArchetypeDefinition): 'sidebar' | 'topbar' | 'sidebar-topbar' | 'minimal' {
    const navTypeMap: Record<string, 'sidebar' | 'topbar' | 'sidebar-topbar' | 'minimal'> = {
      healthcare: 'sidebar',
      crm: 'sidebar',
      analytics: 'topbar',
      ecommerce: 'topbar',
      ats: 'sidebar',
      finance: 'topbar',
      logistics: 'topbar',
      support: 'sidebar',
      project_management: 'sidebar',
      education: 'sidebar',
    };

    return navTypeMap[domain] || 'sidebar';
  }

  /**
   * Determine navigation position based on domain and archetype
   */
  private determineNavigationPosition(domain: string, archetype: ArchetypeDefinition): 'left' | 'top' | 'right' | 'bottom' {
    const navPosMap: Record<string, 'left' | 'top' | 'right' | 'bottom'> = {
      healthcare: 'left',
      crm: 'left',
      analytics: 'top',
      ecommerce: 'top',
      ats: 'left',
      finance: 'top',
      logistics: 'top',
      support: 'left',
      project_management: 'left',
      education: 'left',
    };

    return navPosMap[domain] || 'left';
  }

  /**
   * Get default dashboard layout
   */
  private getDefaultDashboardLayout(): DashboardLayout {
    return {
      type: 'sidebar-content',
      grid: {
        columns: 12,
        rows: 1,
        gap: 16,
      },
      navigation: {
        type: 'sidebar',
        position: 'left',
      },
    };
  }

  /**
   * Get default data schema
   */
  private getDefaultDataSchema(): DashboardDataSchema {
    return {
      sources: {},
      relationships: [],
    };
  }

  /**
   * Get default permission schema
   */
  private getDefaultPermissionSchema(): DashboardPermissionSchema {
    return {
      view: ['view:dashboard'],
      edit: [],
      delete: [],
      admin: ['admin:dashboard'],
    };
  }

  /**
   * Get default styling schema
   */
  private getDefaultStylingSchema(): DashboardStylingSchema {
    return {
      theme: {
        primaryColor: '#3B82F6',
        secondaryColor: '#6366F1',
        accentColor: '#F59E0B',
        backgroundColor: '#F9FAFB',
        surfaceColor: '#FFFFFF',
      },
      typography: {
        fontFamily: 'Inter',
        fontSize: 14,
        fontWeight: 400,
        lineHeight: 1.5,
      },
      spacing: {
        base: 16,
        scale: [4, 8, 12, 16, 24, 32, 48, 64],
      },
      borderRadius: 8,
      shadow: 'medium',
    };
  }

  /**
   * Capitalize string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DynamicDashboardSchemaConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('DynamicDashboardSchema', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): DynamicDashboardSchemaConfig {
    return { ...this.config };
  }
}

export const dynamicDashboardSchema = new DynamicDashboardSchema();

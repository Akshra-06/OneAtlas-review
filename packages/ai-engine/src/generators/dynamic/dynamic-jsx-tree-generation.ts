/**
 * Dynamic JSX Tree Generation
 * 
 * Generates JSX trees dynamically based on section graph and page orchestration.
 * Replaces hardcoded dashboard templates with dynamic JSX generation.
 */

import { logger } from '../../shared/utils/logger';

import {
  ArchetypeDefinition,
} from '../../product/archetype/archetype-registry';

import type { SectionGraph, SectionPlan } from './dynamic-section-planner';
import type { PageOrchestration, PageDefinition } from './workflow-driven-page-orchestration';

export interface JSXNode {
  type: string;
  props: Record<string, any>;
  children: JSXNode[];
  metadata: {
    id: string;
    sectionId?: string;
    component?: string;
    dataSources: string[];
  };
}

export interface JSXTree {
  root: JSXNode;
  structure: {
    type: 'page' | 'layout' | 'component' | 'section' | 'widget';
    depth: number;
  };
  dataBindings: Record<string, string>;
  eventHandlers: Record<string, string>;
}

export interface DynamicJSXTreeGenerationConfig {
  enableDynamicGeneration: boolean;
  enableDataBinding: boolean;
  enableEventHandling: boolean;
  enableComponentResolution: boolean;
}

const DEFAULT_CONFIG: DynamicJSXTreeGenerationConfig = {
  enableDynamicGeneration: true,
  enableDataBinding: true,
  enableEventHandling: true,
  enableComponentResolution: true,
};

/**
 * Dynamic JSX Tree Generation
 * 
 * Generates JSX trees dynamically based on section graph and page orchestration:
 * - Generates JSX nodes from section plans
 * - Creates component trees
 * - Binds data sources
 * - Handles events
 * - Resolves components
 */
export class DynamicJSXTreeGeneration {
  private config: DynamicJSXTreeGenerationConfig;

  constructor(config: Partial<DynamicJSXTreeGenerationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate JSX tree based on page orchestration and section graph
   */
  generateJSXTree(page: PageDefinition, sectionGraph: SectionGraph, archetype: ArchetypeDefinition): JSXTree {
    const root = this.generatePageRoot(page, sectionGraph, archetype);
    const dataBindings = this.config.enableDataBinding
      ? this.generateDataBindings(sectionGraph)
      : {};
    const eventHandlers = this.config.enableEventHandling
      ? this.generateEventHandlers(sectionGraph)
      : {};

    const tree: JSXTree = {
      root,
      structure: {
        type: 'page',
        depth: 0,
      },
      dataBindings,
      eventHandlers,
    };

    logger.info('DynamicJSXTreeGeneration', 'JSX_TREE_GENERATED', 'JSX tree generated dynamically', {
      pageId: page.id,
      sectionCount: sectionGraph.nodes.length,
      nodeCount: this.countNodes(root),
    });

    return tree;
  }

  /**
   * Generate page root JSX node
   */
  private generatePageRoot(page: PageDefinition, sectionGraph: SectionGraph, archetype: ArchetypeDefinition): JSXNode {
    const layoutNode = this.generateLayoutNode(page, sectionGraph, archetype);
    const contentNode = this.generateContentNode(page, sectionGraph, archetype);

    return {
      type: 'Page',
      props: {
        path: page.path,
        title: page.title,
        description: page.description,
        layout: page.layout,
      },
      children: [layoutNode, contentNode],
      metadata: {
        id: page.id,
        dataSources: [],
      },
    };
  }

  /**
   * Generate layout JSX node
   */
  private generateLayoutNode(page: PageDefinition, sectionGraph: SectionGraph, archetype: ArchetypeDefinition): JSXNode {
    const layoutType = this.getLayoutComponent(page.layout);
    const navigationNode = this.generateNavigationNode(page, sectionGraph);

    return {
      type: layoutType,
      props: {
        className: page.layout,
      },
      children: [navigationNode],
      metadata: {
        id: `${page.id}-layout`,
        component: layoutType,
        dataSources: [],
      },
    };
  }

  /**
   * Generate navigation JSX node
   */
  private generateNavigationNode(page: PageDefinition, sectionGraph: SectionGraph): JSXNode {
    return {
      type: 'Navigation',
      props: {
        type: 'sidebar',
        items: [],
      },
      children: [],
      metadata: {
        id: `${page.id}-navigation`,
        component: 'Navigation',
        dataSources: [],
      },
    };
  }

  /**
   * Generate content JSX node
   */
  private generateContentNode(page: PageDefinition, sectionGraph: SectionGraph, archetype: ArchetypeDefinition): JSXNode {
    const sectionNodes = page.sections
      .map(sectionId => sectionGraph.nodes.find(n => n.id === sectionId))
      .filter((n): n is SectionPlan => n !== undefined)
      .map(section => this.generateSectionNode(section, archetype));

    return {
      type: 'div',
      props: {
        className: 'content',
      },
      children: sectionNodes,
      metadata: {
        id: `${page.id}-content`,
        dataSources: [],
      },
    };
  }

  /**
   * Generate section JSX node
   */
  private generateSectionNode(section: SectionPlan, archetype: ArchetypeDefinition): JSXNode {
    const componentType = this.getSectionComponent(section.type);
    const widgetNodes = this.generateWidgetNodes(section, archetype);

    return {
      type: componentType,
      props: {
        id: section.id,
        title: section.title,
        description: section.description,
        span: section.span,
        height: section.height,
        priority: section.priority,
        interactions: section.interactions,
      },
      children: widgetNodes,
      metadata: {
        id: section.id,
        sectionId: section.id,
        component: componentType,
        dataSources: section.dataSources,
      },
    };
  }

  /**
   * Generate widget JSX nodes
   */
  private generateWidgetNodes(section: SectionPlan, archetype: ArchetypeDefinition): JSXNode[] {
    const widgetNodes: JSXNode[] = [];

    if (section.content && section.content.type) {
      const widgetType = this.getWidgetComponent(section.content.type);
      
      widgetNodes.push({
        type: widgetType,
        props: {
          ...section.content,
        },
        children: [],
        metadata: {
          id: `${section.id}-widget`,
          sectionId: section.id,
          component: widgetType,
          dataSources: section.dataSources,
        },
      });
    }

    return widgetNodes;
  }

  /**
   * Get layout component based on layout type
   */
  private getLayoutComponent(layout: string): string {
    const layoutComponents: Record<string, string> = {
      'sidebar-content': 'SidebarLayout',
      'topbar-content': 'TopbarLayout',
      'sidebar-topbar': 'SidebarTopbarLayout',
      'minimal': 'MinimalLayout',
      'calendar-first': 'CalendarFirstLayout',
      'pipeline-first': 'PipelineFirstLayout',
      'chart-dominant': 'ChartDominantLayout',
    };

    return layoutComponents[layout] || 'DefaultLayout';
  }

  /**
   * Get section component based on section type
   */
  private getSectionComponent(sectionType: string): string {
    const sectionComponents: Record<string, string> = {
      'hero': 'HeroSection',
      'kpi': 'KPISection',
      'chart': 'ChartSection',
      'list': 'ListSection',
      'calendar': 'CalendarSection',
      'pipeline': 'PipelineSection',
      'table': 'TableSection',
      'widget': 'WidgetSection',
      'custom': 'CustomSection',
      'action': 'ActionSection',
      'workflow': 'WorkflowSection',
      'context': 'ContextSection',
    };

    return sectionComponents[sectionType] || 'DefaultSection';
  }

  /**
   * Get widget component based on widget type
   */
  private getWidgetComponent(widgetType: string): string {
    const widgetComponents: Record<string, string> = {
      'calendar-hero': 'CalendarHero',
      'patient-queue': 'PatientQueue',
      'urgency-panel': 'UrgencyPanel',
      'patient-status-hero': 'PatientStatusHero',
      'action-panel': 'ActionPanel',
      'medical-records-list': 'MedicalRecordsList',
      'pipeline-hero': 'PipelineHero',
      'leads-hero': 'LeadsHero',
      'pipeline-kpi': 'PipelineKPI',
      'activity-feed': 'ActivityFeed',
      'opportunities-list': 'OpportunitiesList',
      'insights-hero': 'InsightsHero',
      'trend-chart': 'TrendChart',
      'filter-panel': 'FilterPanel',
      'data-table': 'DataTable',
      'orders-hero': 'OrdersHero',
      'inventory-kpi': 'InventoryKPI',
      'order-list': 'OrderList',
      'candidate-pipeline': 'CandidatePipeline',
      'hiring-funnel': 'HiringFunnel',
      'interview-calendar': 'InterviewCalendar',
      'financial-summary': 'FinancialSummary',
      'revenue-chart': 'RevenueChart',
      'budget-chart': 'BudgetChart',
      'tracking-map': 'TrackingMap',
      'delivery-kpi': 'DeliveryKPI',
      'fleet-panel': 'FleetPanel',
      'tickets-hero': 'TicketsHero',
      'support-kpi': 'SupportKPI',
      'ticket-list': 'TicketList',
      'tasks-hero': 'TasksHero',
      'gantt-chart': 'GanttChart',
      'team-feed': 'TeamFeed',
      'courses-hero': 'CoursesHero',
      'student-kpi': 'StudentKPI',
      'course-list': 'CourseList',
    };

    return widgetComponents[widgetType] || 'DefaultWidget';
  }

  /**
   * Generate data bindings
   */
  private generateDataBindings(sectionGraph: SectionGraph): Record<string, string> {
    const bindings: Record<string, string> = {};

    for (const section of sectionGraph.nodes) {
      for (const dataSource of section.dataSources) {
        bindings[`${section.id}.${dataSource}`] = dataSource;
      }
    }

    return bindings;
  }

  /**
   * Generate event handlers
   */
  private generateEventHandlers(sectionGraph: SectionGraph): Record<string, string> {
    const handlers: Record<string, string> = {};

    for (const section of sectionGraph.nodes) {
      if (section.interactions.clickable) {
        handlers[`${section.id}.onClick`] = `handle${this.capitalize(section.id)}Click`;
      }
      if (section.interactions.expandable) {
        handlers[`${section.id}.onExpand`] = `handle${this.capitalize(section.id)}Expand`;
      }
      if (section.interactions.filterable) {
        handlers[`${section.id}.onFilter`] = `handle${this.capitalize(section.id)}Filter`;
      }
    }

    return handlers;
  }

  /**
   * Capitalize string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Count nodes in JSX tree
   */
  private countNodes(node: JSXNode): number {
    let count = 1;
    for (const child of node.children) {
      count += this.countNodes(child);
    }
    return count;
  }

  /**
   * Convert JSX tree to string
   */
  jsxTreeToString(tree: JSXTree): string {
    return this.nodeToString(tree.root, 0);
  }

  /**
   * Convert JSX node to string
   */
  private nodeToString(node: JSXNode, depth: number): string {
    const indent = '  '.repeat(depth);
    const propsString = this.propsToString(node.props);
    const childrenString = node.children.length > 0
      ? node.children.map(child => this.nodeToString(child, depth + 1)).join('\n')
      : '';

    if (node.children.length === 0) {
      return `${indent}<${node.type}${propsString} />`;
    }

    return `${indent}<${node.type}${propsString}>\n${childrenString}\n${indent}</${node.type}>`;
  }

  /**
   * Convert props to string
   */
  private propsToString(props: Record<string, any>): string {
    const entries = Object.entries(props);
    if (entries.length === 0) {
      return '';
    }

    const propsString = entries
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? key : '';
        } else if (typeof value === 'object') {
          return `${key}={${JSON.stringify(value)}}`;
        } else {
          return `${key}={${value}}`;
        }
      })
      .filter(Boolean)
      .join(' ');

    return propsString ? ` ${propsString}` : '';
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DynamicJSXTreeGenerationConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('DynamicJSXTreeGeneration', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): DynamicJSXTreeGenerationConfig {
    return { ...this.config };
  }
}

export const dynamicJSXTreeGeneration = new DynamicJSXTreeGeneration();

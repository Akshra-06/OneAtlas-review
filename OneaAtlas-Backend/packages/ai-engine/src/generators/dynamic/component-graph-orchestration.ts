/**
 * Component Graph Orchestration
 * 
 * Orchestrates components as graphs based on dependencies and data flow.
 * Replaces static component composition with dynamic graph-based orchestration.
 */

import { logger } from '../../shared/utils/logger';

import {
  ArchetypeDefinition,
} from '../../product/archetype/archetype-registry';

import type { SectionGraph, SectionPlan } from './dynamic-section-planner';
import type { WidgetGraph } from './widget-graph-composition';
import type { LayoutGraph } from './layout-graph-generation';

export interface ComponentNode {
  id: string;
  type: 'page' | 'layout' | 'section' | 'widget' | 'element' | 'hook' | 'utility';
  component: string;
  props: Record<string, any>;
  state: ComponentState;
  lifecycle: ComponentLifecycle;
  dependencies: string[];
  children: string[];
}

export interface ComponentState {
  data: Record<string, any>;
  loading: boolean;
  error: string | null;
}

export interface ComponentLifecycle {
  mount: string[];
  update: string[];
  unmount: string[];
}

export interface ComponentEdge {
  from: string;
  to: string;
  type: 'parent-child' | 'data-flow' | 'event' | 'state' | 'conditional';
  data?: any;
}

export interface ComponentGraph {
  nodes: ComponentNode[];
  edges: ComponentEdge[];
  entryPoints: string[];
  dataFlow: DataFlowGraph;
}

export interface DataFlowGraph {
  sources: DataSource[];
  transformations: DataTransformation[];
  destinations: DataDestination[];
}

export interface DataSource {
  id: string;
  type: 'api' | 'entity' | 'static' | 'computed';
  endpoint?: string;
  entity?: string;
  query?: string;
}

export interface DataTransformation {
  id: string;
  type: 'filter' | 'map' | 'reduce' | 'sort' | 'group' | 'custom';
  function: string;
}

export interface DataDestination {
  id: string;
  type: 'component' | 'store' | 'cache';
  target: string;
}

export interface ComponentGraphOrchestrationConfig {
  enableDataFlow: boolean;
  enableStateManagement: boolean;
  enableLifecycleHooks: boolean;
  enableConditionalRendering: boolean;
}

const DEFAULT_CONFIG: ComponentGraphOrchestrationConfig = {
  enableDataFlow: true,
  enableStateManagement: true,
  enableLifecycleHooks: true,
  enableConditionalRendering: true,
};

/**
 * Component Graph Orchestration
 * 
 * Orchestrates components as graphs based on dependencies and data flow:
 * - Creates component nodes
 * - Composes component edges
 * - Generates data flow graph
 * - Manages component state
 * - Handles lifecycle hooks
 */
export class ComponentGraphOrchestration {
  private config: ComponentGraphOrchestrationConfig;

  constructor(config: Partial<ComponentGraphOrchestrationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Orchestrate component graph based on section graph, widget graph, and layout graph
   */
  orchestrateComponentGraph(
    sectionGraph: SectionGraph,
    widgetGraph: WidgetGraph,
    layoutGraph: LayoutGraph,
    archetype: ArchetypeDefinition
  ): ComponentGraph {
    const nodes = this.generateComponentNodes(sectionGraph, widgetGraph, layoutGraph, archetype);
    const edges = this.generateComponentEdges(nodes, sectionGraph, widgetGraph);
    const entryPoints = this.determineEntryPoints(nodes);
    const dataFlow = this.config.enableDataFlow
      ? this.generateDataFlow(sectionGraph, widgetGraph)
      : this.getDefaultDataFlow();

    const graph: ComponentGraph = {
      nodes,
      edges,
      entryPoints,
      dataFlow,
    };

    logger.info('ComponentGraphOrchestration', 'COMPONENT_GRAPH_ORCHESTRATED', 'Component graph orchestrated', {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      entryPointCount: entryPoints.length,
      dataSourceCount: dataFlow.sources.length,
    });

    return graph;
  }

  /**
   * Generate component nodes from section graph, widget graph, and layout graph
   */
  private generateComponentNodes(
    sectionGraph: SectionGraph,
    widgetGraph: WidgetGraph,
    layoutGraph: LayoutGraph,
    archetype: ArchetypeDefinition
  ): ComponentNode[] {
    const nodes: ComponentNode[] = [];

    // Page component node
    const pageNode: ComponentNode = {
      id: 'page',
      type: 'page',
      component: 'Page',
      props: {},
      state: {
        data: {},
        loading: false,
        error: null,
      },
      lifecycle: {
        mount: ['fetchInitialData'],
        update: [],
        unmount: ['cleanup'],
      },
      dependencies: [],
      children: ['layout'],
    };
    nodes.push(pageNode);

    // Layout component node
    const layoutNode: ComponentNode = {
      id: 'layout',
      type: 'layout',
      component: this.getLayoutComponent(layoutGraph.structure.type),
      props: {
        type: layoutGraph.structure.type,
      },
      state: {
        data: {},
        loading: false,
        error: null,
      },
      lifecycle: {
        mount: [],
        update: [],
        unmount: [],
      },
      dependencies: [],
      children: ['content'],
    };
    nodes.push(layoutNode);

    // Content component node
    const contentNode: ComponentNode = {
      id: 'content',
      type: 'section',
      component: 'Content',
      props: {},
      state: {
        data: {},
        loading: false,
        error: null,
      },
      lifecycle: {
        mount: [],
        update: [],
        unmount: [],
      },
      dependencies: [],
      children: sectionGraph.nodes.map(s => s.id),
    };
    nodes.push(contentNode);

    // Section component nodes
    for (const section of sectionGraph.nodes) {
      const sectionNode: ComponentNode = {
        id: section.id,
        type: 'section',
        component: this.getSectionComponent(section.type),
        props: {
          title: section.title,
          description: section.description,
          span: section.span,
          height: section.height,
        },
        state: this.config.enableStateManagement
          ? this.generateSectionState(section, archetype)
          : {
              data: {},
              loading: false,
              error: null,
            },
        lifecycle: this.config.enableLifecycleHooks
          ? this.generateSectionLifecycle(section, archetype)
          : {
              mount: [],
              update: [],
              unmount: [],
            },
        dependencies: section.dependencies,
        children: [],
      };
      nodes.push(sectionNode);

      // Widget component nodes
      const widget = widgetGraph.nodes.find(w => w.id === section.id);
      if (widget) {
        const widgetNode: ComponentNode = {
          id: `${section.id}-widget`,
          type: 'widget',
          component: widget.component,
          props: widget.props,
          state: this.config.enableStateManagement
            ? this.generateWidgetState(widget, archetype)
            : {
                data: {},
                loading: false,
                error: null,
              },
          lifecycle: this.config.enableLifecycleHooks
            ? this.generateWidgetLifecycle(widget, archetype)
            : {
                mount: [],
                update: [],
                unmount: [],
              },
          dependencies: widget.dependencies,
          children: [],
        };
        nodes.push(widgetNode);
      }
    }

    return nodes;
  }

  /**
   * Generate component edges from component nodes, section graph, and widget graph
   */
  private generateComponentEdges(nodes: ComponentNode[], sectionGraph: SectionGraph, widgetGraph: WidgetGraph): ComponentEdge[] {
    const edges: ComponentEdge[] = [];

    for (const node of nodes) {
      // Parent-child edges
      for (const childId of node.children) {
        edges.push({
          from: node.id,
          to: childId,
          type: 'parent-child',
        });
      }

      // Data flow edges
      for (const dependencyId of node.dependencies) {
        edges.push({
          from: dependencyId,
          to: node.id,
          type: 'data-flow',
        });
      }
    }

    return edges;
  }

  /**
   * Determine entry points for component graph
   */
  private determineEntryPoints(nodes: ComponentNode[]): string[] {
    return nodes
      .filter(node => node.type === 'page')
      .map(node => node.id);
  }

  /**
   * Generate data flow graph from section graph and widget graph
   */
  private generateDataFlow(sectionGraph: SectionGraph, widgetGraph: WidgetGraph): DataFlowGraph {
    const sources: DataSource[] = [];
    const transformations: DataTransformation[] = [];
    const destinations: DataDestination[] = [];

    // Collect data sources from sections
    for (const section of sectionGraph.nodes) {
      for (const dataSource of section.dataSources) {
        sources.push({
          id: dataSource,
          type: 'entity',
          entity: dataSource,
        });
      }
    }

    // Collect data sources from widgets
    for (const widget of widgetGraph.nodes) {
      for (const dataSource of widget.dataSources) {
        if (!sources.find(s => s.id === dataSource)) {
          sources.push({
            id: dataSource,
            type: 'entity',
            entity: dataSource,
          });
        }
      }
    }

    // Generate transformations based on widget types
    for (const widget of widgetGraph.nodes) {
      if (widget.type === 'chart') {
        transformations.push({
          id: `${widget.id}-transform`,
          type: 'map',
          function: 'transformChartData',
        });
      }
      if (widget.type === 'table') {
        transformations.push({
          id: `${widget.id}-transform`,
          type: 'filter',
          function: 'filterTableData',
        });
      }
    }

    // Generate destinations
    for (const widget of widgetGraph.nodes) {
      destinations.push({
        id: `${widget.id}-destination`,
        type: 'component',
        target: widget.id,
      });
    }

    return {
      sources,
      transformations,
      destinations,
    };
  }

  /**
   * Get layout component based on layout type
   */
  private getLayoutComponent(layoutType: string): string {
    const componentMap: Record<string, string> = {
      'sidebar-content': 'SidebarLayout',
      'topbar-content': 'TopbarLayout',
      'sidebar-topbar': 'SidebarTopbarLayout',
      'minimal': 'MinimalLayout',
      'calendar-first': 'CalendarFirstLayout',
      'pipeline-first': 'PipelineFirstLayout',
      'chart-dominant': 'ChartDominantLayout',
    };

    return componentMap[layoutType] || 'DefaultLayout';
  }

  /**
   * Get section component based on section type
   */
  private getSectionComponent(sectionType: string): string {
    const componentMap: Record<string, string> = {
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

    return componentMap[sectionType] || 'DefaultSection';
  }

  /**
   * Generate section state based on section and archetype
   */
  private generateSectionState(section: SectionPlan, archetype: ArchetypeDefinition): ComponentState {
    return {
      data: {
        id: section.id,
        type: section.type,
      },
      loading: false,
      error: null,
    };
  }

  /**
   * Generate section lifecycle based on section and archetype
   */
  private generateSectionLifecycle(section: SectionPlan, archetype: ArchetypeDefinition): ComponentLifecycle {
    const lifecycle: ComponentLifecycle = {
      mount: [],
      update: [],
      unmount: [],
    };

    if (section.dataSources.length > 0) {
      lifecycle.mount.push(`fetch${this.capitalize(section.id)}Data`);
    }

    return lifecycle;
  }

  /**
   * Generate widget state based on widget and archetype
   */
  private generateWidgetState(widget: any, archetype: ArchetypeDefinition): ComponentState {
    return {
      data: widget.props,
      loading: false,
      error: null,
    };
  }

  /**
   * Generate widget lifecycle based on widget and archetype
   */
  private generateWidgetLifecycle(widget: any, archetype: ArchetypeDefinition): ComponentLifecycle {
    const lifecycle: ComponentLifecycle = {
      mount: [],
      update: [],
      unmount: [],
    };

    if (widget.dataSources.length > 0) {
      lifecycle.mount.push(`fetch${this.capitalize(widget.id)}Data`);
    }

    return lifecycle;
  }

  /**
   * Get default data flow
   */
  private getDefaultDataFlow(): DataFlowGraph {
    return {
      sources: [],
      transformations: [],
      destinations: [],
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
  updateConfig(config: Partial<ComponentGraphOrchestrationConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ComponentGraphOrchestration', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ComponentGraphOrchestrationConfig {
    return { ...this.config };
  }
}

export const componentGraphOrchestration = new ComponentGraphOrchestration();

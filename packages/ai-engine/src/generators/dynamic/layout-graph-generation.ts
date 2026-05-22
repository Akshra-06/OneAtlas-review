/**
 * Layout Graph Generation
 * 
 * Generates layouts as graphs based on archetype and workflow.
 * Replaces static layout templates with dynamic graph-based layout generation.
 */

import { logger } from '../../shared/utils/logger';

import {
  ArchetypeDefinition,
} from '../../product/archetype/archetype-registry';

import type { WidgetGraph } from './widget-graph-composition';

export interface LayoutNode {
  id: string;
  type: 'container' | 'section' | 'widget' | 'navigation' | 'header' | 'footer';
  component: string;
  props: Record<string, any>;
  children: string[];
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  styling: {
    display: string;
    flexDirection: string;
    gap: number;
    padding: number;
    margin: number;
  };
  responsive: LayoutNodeResponsiveBreakpoints;
}

export interface LayoutNodeResponsive {
  display: string;
  flexDirection: string;
  width: string;
  height: string;
  padding: number;
  margin: number;
}

export interface LayoutNodeResponsiveBreakpoints {
  mobile: LayoutNodeResponsive;
  tablet: LayoutNodeResponsive;
  desktop: LayoutNodeResponsive;
}

export interface LayoutEdge {
  from: string;
  to: string;
  type: 'parent-child' | 'sibling' | 'adjacent' | 'conditional';
  condition?: string;
}

export interface LayoutGraph {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  structure: {
    type: 'sidebar-content' | 'topbar-content' | 'sidebar-topbar' | 'minimal' | 'calendar-first' | 'pipeline-first' | 'chart-dominant';
    depth: number;
  };
  grid: {
    columns: number;
    rows: number;
    gap: number;
  };
}

export interface LayoutGraphGenerationConfig {
  enableResponsiveLayouts: boolean;
  enableGridGeneration: boolean;
  enableConditionalLayouts: boolean;
  enableDynamicSizing: boolean;
}

const DEFAULT_CONFIG: LayoutGraphGenerationConfig = {
  enableResponsiveLayouts: true,
  enableGridGeneration: true,
  enableConditionalLayouts: true,
  enableDynamicSizing: true,
};

/**
 * Layout Graph Generation
 * 
 * Generates layouts as graphs based on archetype and workflow:
 * - Creates layout nodes
 * - Composes layout edges
 * - Generates responsive layouts
 * - Creates grid layouts
 */
export class LayoutGraphGeneration {
  private config: LayoutGraphGenerationConfig;

  constructor(config: Partial<LayoutGraphGenerationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate layout graph based on archetype, workflow, and widget graph
   */
  generateLayoutGraph(archetype: ArchetypeDefinition, workflow: string, widgetGraph: WidgetGraph): LayoutGraph {
    const structure = this.determineLayoutStructure(archetype, workflow);
    const nodes = this.generateLayoutNodes(archetype, workflow, widgetGraph, structure);
    const edges = this.generateLayoutEdges(nodes);
    const grid = this.config.enableGridGeneration
      ? this.generateGrid(archetype, widgetGraph)
      : this.getDefaultGrid();

    const graph: LayoutGraph = {
      nodes,
      edges,
      structure: {
        type: structure,
        depth: this.calculateDepth(nodes),
      },
      grid,
    };

    logger.info('LayoutGraphGeneration', 'LAYOUT_GRAPH_GENERATED', 'Layout graph generated', {
      archetype: archetype.id,
      workflow,
      structure,
      nodeCount: nodes.length,
      edgeCount: edges.length,
    });

    return graph;
  }

  /**
   * Determine layout structure based on archetype and workflow
   */
  private determineLayoutStructure(archetype: ArchetypeDefinition, workflow: string): LayoutGraph['structure']['type'] {
    const structureMap: Record<string, LayoutGraph['structure']['type']> = {
      healthcare: 'sidebar-content',
      crm: 'sidebar-content',
      analytics: 'chart-dominant',
      ecommerce: 'topbar-content',
      ats: 'sidebar-content',
      finance: 'chart-dominant',
      logistics: 'topbar-content',
      support: 'sidebar-content',
      project_management: 'sidebar-content',
      education: 'sidebar-content',
    };

    // Workflow-based adjustments
    if (workflow === 'scheduling') {
      return 'calendar-first';
    }

    if (workflow === 'analysis') {
      return 'chart-dominant';
    }

    if (workflow === 'selling') {
      return 'pipeline-first';
    }

    return structureMap[archetype.id] || 'sidebar-content';
  }

  /**
   * Generate layout nodes based on archetype, workflow, widget graph, and structure
   */
  private generateLayoutNodes(archetype: ArchetypeDefinition, workflow: string, widgetGraph: WidgetGraph, structure: LayoutGraph['structure']['type']): LayoutNode[] {
    const nodes: LayoutNode[] = [];

    // Root container node
    const rootNode: LayoutNode = {
      id: 'root',
      type: 'container',
      component: 'div',
      props: {
        className: 'layout-root',
      },
      children: ['navigation', 'header', 'content'],
      position: {
        x: 0,
        y: 0,
        width: 12,
        height: 1,
      },
      styling: {
        display: 'flex',
        flexDirection: structure === 'topbar-content' ? 'column' : 'row',
        gap: 0,
        padding: 0,
        margin: 0,
      },
      responsive: this.generateResponsiveStyling(structure, 'root'),
    };
    nodes.push(rootNode);

    // Navigation node
    if (structure === 'sidebar-content' || structure === 'sidebar-topbar') {
      const navNode: LayoutNode = {
        id: 'navigation',
        type: 'navigation',
        component: 'Navigation',
        props: {
          type: 'sidebar',
        },
        children: [],
        position: {
          x: 0,
          y: 0,
          width: 2,
          height: 1,
        },
        styling: {
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 16,
          margin: 0,
        },
        responsive: this.generateResponsiveStyling(structure, 'navigation'),
      };
      nodes.push(navNode);
    }

    // Header node
    if (structure === 'topbar-content' || structure === 'sidebar-topbar') {
      const headerNode: LayoutNode = {
        id: 'header',
        type: 'header',
        component: 'Header',
        props: {},
        children: [],
        position: {
          x: 0,
          y: 0,
          width: 12,
          height: 1,
        },
        styling: {
          display: 'flex',
          flexDirection: 'row',
          gap: 16,
          padding: 16,
          margin: 0,
        },
        responsive: this.generateResponsiveStyling(structure, 'header'),
      };
      nodes.push(headerNode);
    }

    // Content node
    const contentNode: LayoutNode = {
      id: 'content',
      type: 'container',
      component: 'div',
      props: {
        className: 'layout-content',
      },
      children: widgetGraph.nodes.map(n => n.id),
      position: {
        x: structure === 'sidebar-content' ? 2 : 0,
        y: structure === 'topbar-content' ? 1 : 0,
        width: structure === 'sidebar-content' ? 10 : 12,
        height: 1,
      },
      styling: {
        display: 'grid',
        flexDirection: 'row',
        gap: this.determineGap(archetype),
        padding: this.determinePadding(archetype),
        margin: 0,
      },
      responsive: this.generateResponsiveStyling(structure, 'content'),
    };
    nodes.push(contentNode);

    // Widget nodes
    for (const widget of widgetGraph.nodes) {
      const widgetNode: LayoutNode = {
        id: widget.id,
        type: 'widget',
        component: widget.component,
        props: widget.props,
        children: [],
        position: widget.position,
        styling: {
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: this.determineWidgetPadding(archetype),
          margin: 0,
        },
        responsive: this.generateResponsiveStyling(structure, 'widget'),
      };
      nodes.push(widgetNode);
    }

    return nodes;
  }

  /**
   * Generate layout edges based on nodes
   */
  private generateLayoutEdges(nodes: LayoutNode[]): LayoutEdge[] {
    const edges: LayoutEdge[] = [];

    for (const node of nodes) {
      for (const childId of node.children) {
        edges.push({
          from: node.id,
          to: childId,
          type: 'parent-child',
        });
      }
    }

    return edges;
  }

  /**
   * Generate grid based on archetype and widget graph
   */
  private generateGrid(archetype: ArchetypeDefinition, widgetGraph: WidgetGraph): LayoutGraph['grid'] {
    const columns = this.determineGridColumns(archetype);
    const rows = Math.ceil(widgetGraph.nodes.length / columns);
    const gap = this.determineGap(archetype);

    return {
      columns,
      rows,
      gap,
    };
  }

  /**
   * Determine grid columns based on archetype
   */
  private determineGridColumns(archetype: ArchetypeDefinition): number {
    const columnMap: Record<string, number> = {
      healthcare: 6,
      crm: 8,
      analytics: 12,
      ecommerce: 8,
      ats: 6,
      finance: 12,
      logistics: 8,
      support: 6,
      project_management: 6,
      education: 6,
    };

    return columnMap[archetype.id] || 12;
  }

  /**
   * Determine gap based on archetype
   */
  private determineGap(archetype: ArchetypeDefinition): number {
    const gapMap: Record<string, number> = {
      healthcare: 24,
      crm: 16,
      analytics: 12,
      ecommerce: 16,
      ats: 20,
      finance: 12,
      logistics: 16,
      support: 24,
      project_management: 20,
      education: 24,
    };

    return gapMap[archetype.id] || 16;
  }

  /**
   * Determine padding based on archetype
   */
  private determinePadding(archetype: ArchetypeDefinition): number {
    const paddingMap: Record<string, number> = {
      healthcare: 32,
      crm: 24,
      analytics: 16,
      ecommerce: 24,
      ats: 28,
      finance: 16,
      logistics: 24,
      support: 32,
      project_management: 28,
      education: 32,
    };

    return paddingMap[archetype.id] || 24;
  }

  /**
   * Determine widget padding based on archetype
   */
  private determineWidgetPadding(archetype: ArchetypeDefinition): number {
    const paddingMap: Record<string, number> = {
      healthcare: 24,
      crm: 16,
      analytics: 12,
      ecommerce: 16,
      ats: 20,
      finance: 12,
      logistics: 16,
      support: 24,
      project_management: 20,
      education: 24,
    };

    return paddingMap[archetype.id] || 16;
  }

  /**
   * Generate responsive styling based on structure and node type
   */
  private generateResponsiveStyling(structure: LayoutGraph['structure']['type'], nodeType: string): LayoutNodeResponsiveBreakpoints {
    const baseResponsive: LayoutNodeResponsive = {
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
      height: 'auto',
      padding: 16,
      margin: 0,
    };

    if (nodeType === 'navigation') {
      return {
        mobile: {
          display: structure === 'sidebar-content' ? 'none' : 'flex',
          flexDirection: 'column',
          width: '100%',
          height: 'auto',
          padding: 16,
          margin: 0,
        },
        tablet: {
          display: 'flex',
          flexDirection: 'column',
          width: '200px',
          height: 'auto',
          padding: 16,
          margin: 0,
        },
        desktop: {
          display: 'flex',
          flexDirection: 'column',
          width: '280px',
          height: 'auto',
          padding: 16,
          margin: 0,
        },
      };
    }

    if (nodeType === 'header') {
      return {
        mobile: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: 'auto',
          padding: 12,
          margin: 0,
        },
        tablet: {
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: 'auto',
          padding: 16,
          margin: 0,
        },
        desktop: {
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          height: 'auto',
          padding: 16,
          margin: 0,
        },
      };
    }

    if (nodeType === 'content') {
      return {
        mobile: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: 'auto',
          padding: 12,
          margin: 0,
        },
        tablet: {
          display: 'grid',
          flexDirection: 'row',
          width: '100%',
          height: 'auto',
          padding: 16,
          margin: 0,
        },
        desktop: {
          display: 'grid',
          flexDirection: 'row',
          width: '100%',
          height: 'auto',
          padding: 24,
          margin: 0,
        },
      };
    }

    return {
      mobile: { ...baseResponsive, padding: 12 },
      tablet: { ...baseResponsive, padding: 16 },
      desktop: { ...baseResponsive, padding: 16 },
    };
  }

  /**
   * Calculate depth of layout graph
   */
  private calculateDepth(nodes: LayoutNode[]): number {
    let maxDepth = 0;
    for (const node of nodes) {
      if (node.children.length > 0) {
        maxDepth = Math.max(maxDepth, this.calculateNodeDepth(node, nodes, 1));
      }
    }
    return maxDepth;
  }

  /**
   * Calculate depth of a specific node
   */
  private calculateNodeDepth(node: LayoutNode, allNodes: LayoutNode[], currentDepth: number): number {
    let maxDepth = currentDepth;
    for (const childId of node.children) {
      const child = allNodes.find(n => n.id === childId);
      if (child) {
        maxDepth = Math.max(maxDepth, this.calculateNodeDepth(child, allNodes, currentDepth + 1));
      }
    }
    return maxDepth;
  }

  /**
   * Get default grid
   */
  private getDefaultGrid(): LayoutGraph['grid'] {
    return {
      columns: 12,
      rows: 1,
      gap: 16,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LayoutGraphGenerationConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('LayoutGraphGeneration', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): LayoutGraphGenerationConfig {
    return { ...this.config };
  }
}

export const layoutGraphGeneration = new LayoutGraphGeneration();

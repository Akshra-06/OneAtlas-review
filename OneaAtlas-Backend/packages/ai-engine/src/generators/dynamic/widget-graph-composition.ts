/**
 * Widget Graph Composition
 * 
 * Composes widgets as a graph based on data dependencies and workflow.
 * Replaces static widget composition with dynamic graph-based composition.
 */

import { logger } from '../../shared/utils/logger';

import {
  ArchetypeDefinition,
} from '../../product/archetype/archetype-registry';

import type { SectionGraph, SectionPlan } from './dynamic-section-planner';

export interface WidgetNode {
  id: string;
  type: string;
  component: string;
  props: Record<string, any>;
  dataSources: string[];
  dependencies: string[];
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  styling: {
    size: 'small' | 'medium' | 'large' | 'xlarge';
    density: 'dense' | 'compact' | 'comfortable' | 'spacious';
    emphasis: 'primary' | 'secondary' | 'tertiary';
  };
  interactions: {
    clickable: boolean;
    draggable: boolean;
    expandable: boolean;
    filterable: boolean;
  };
}

export interface WidgetEdge {
  from: string;
  to: string;
  type: 'data' | 'navigation' | 'workflow' | 'dependency' | 'conditional';
  condition?: string;
}

export interface WidgetGraph {
  nodes: WidgetNode[];
  edges: WidgetEdge[];
  layout: {
    type: 'grid' | 'masonry' | 'flex' | 'absolute';
    columns: number;
    rows: number;
  };
}

export interface WidgetGraphCompositionConfig {
  enableDataFlowComposition: boolean;
  enableWorkflowComposition: boolean;
  enableDependencyTracking: boolean;
  enableConditionalRendering: boolean;
}

const DEFAULT_CONFIG: WidgetGraphCompositionConfig = {
  enableDataFlowComposition: true,
  enableWorkflowComposition: true,
  enableDependencyTracking: true,
  enableConditionalRendering: true,
};

/**
 * Widget Graph Composition
 * 
 * Composes widgets as a graph based on data dependencies and workflow:
 * - Creates widget nodes from sections
 * - Composes widget edges based on dependencies
 * - Generates widget layout
 * - Enables conditional rendering
 */
export class WidgetGraphComposition {
  private config: WidgetGraphCompositionConfig;

  constructor(config: Partial<WidgetGraphCompositionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Compose widget graph based on section graph and archetype
   */
  composeWidgetGraph(sectionGraph: SectionGraph, archetype: ArchetypeDefinition): WidgetGraph {
    const nodes = this.generateWidgetNodes(sectionGraph, archetype);
    const edges = this.config.enableDependencyTracking
      ? this.generateWidgetEdges(sectionGraph)
      : [];
    const layout = this.generateWidgetLayout(sectionGraph, archetype);

    const graph: WidgetGraph = {
      nodes,
      edges,
      layout,
    };

    logger.info('WidgetGraphComposition', 'WIDGET_GRAPH_COMPOSED', 'Widget graph composed', {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      layoutType: layout.type,
    });

    return graph;
  }

  /**
   * Generate widget nodes from section graph
   */
  private generateWidgetNodes(sectionGraph: SectionGraph, archetype: ArchetypeDefinition): WidgetNode[] {
    const nodes: WidgetNode[] = [];
    let xOffset = 0;
    let yOffset = 0;

    for (const section of sectionGraph.nodes) {
      const widgetNode: WidgetNode = {
        id: section.id,
        type: section.type,
        component: this.getWidgetComponent(section.type, section.content?.type),
        props: section.content || {},
        dataSources: section.dataSources,
        dependencies: section.dependencies,
        position: {
          x: xOffset,
          y: yOffset,
          width: this.calculateWidth(section.span),
          height: this.calculateHeight(section.height),
        },
        styling: {
          size: this.determineSize(section.type),
          density: this.determineDensity(archetype),
          emphasis: this.determineEmphasis(section.priority),
        },
        interactions: section.interactions,
      };

      nodes.push(widgetNode);

      // Update position for next widget
      xOffset += widgetNode.position.width;
      if (xOffset >= 12) {
        xOffset = 0;
        yOffset += 1;
      }
    }

    return nodes;
  }

  /**
   * Generate widget edges from section graph
   */
  private generateWidgetEdges(sectionGraph: SectionGraph): WidgetEdge[] {
    const edges: WidgetEdge[] = [];

    for (const section of sectionGraph.nodes) {
      for (const dependency of section.dependencies) {
        edges.push({
          from: dependency,
          to: section.id,
          type: 'dependency',
        });
      }

      // Add data flow edges
      for (const dataSource of section.dataSources) {
        edges.push({
          from: dataSource,
          to: section.id,
          type: 'data',
        });
      }
    }

    return edges;
  }

  /**
   * Generate widget layout
   */
  private generateWidgetLayout(sectionGraph: SectionGraph, archetype: ArchetypeDefinition): WidgetGraph['layout'] {
    const layoutType = this.determineLayoutType(archetype);
    const columns = this.determineColumns(archetype);
    const rows = Math.ceil(sectionGraph.nodes.length / columns);

    return {
      type: layoutType,
      columns,
      rows,
    };
  }

  /**
   * Get widget component based on section type and content type
   */
  private getWidgetComponent(sectionType: string, contentType?: string): string {
    const componentMap: Record<string, string> = {
      'hero': 'HeroWidget',
      'kpi': 'KPIWidget',
      'chart': 'ChartWidget',
      'list': 'ListWidget',
      'calendar': 'CalendarWidget',
      'pipeline': 'PipelineWidget',
      'table': 'TableWidget',
      'widget': 'CustomWidget',
      'custom': 'CustomWidget',
      'action': 'ActionWidget',
      'workflow': 'WorkflowWidget',
      'context': 'ContextWidget',
    };

    return componentMap[sectionType] || 'DefaultWidget';
  }

  /**
   * Calculate width based on span
   */
  private calculateWidth(span: number): number {
    return span;
  }

  /**
   * Calculate height based on height string
   */
  private calculateHeight(height: string): number {
    const heightMap: Record<string, number> = {
      '150px': 1,
      '200px': 1,
      '250px': 2,
      '300px': 2,
      '350px': 3,
      '400px': 3,
      '500px': 4,
    };

    return heightMap[height] || 2;
  }

  /**
   * Determine size based on section type
   */
  private determineSize(sectionType: string): WidgetNode['styling']['size'] {
    const sizeMap: Record<string, WidgetNode['styling']['size']> = {
      'hero': 'large',
      'kpi': 'medium',
      'chart': 'large',
      'list': 'large',
      'calendar': 'xlarge',
      'pipeline': 'xlarge',
      'table': 'large',
      'widget': 'medium',
      'custom': 'medium',
      'action': 'small',
      'workflow': 'medium',
      'context': 'medium',
    };

    return sizeMap[sectionType] || 'medium';
  }

  /**
   * Determine density based on archetype
   */
  private determineDensity(archetype: ArchetypeDefinition): WidgetNode['styling']['density'] {
    const densityMap: Record<string, WidgetNode['styling']['density']> = {
      'healthcare': 'comfortable',
      'crm': 'compact',
      'analytics': 'dense',
      'ecommerce': 'compact',
      'ats': 'compact',
      'finance': 'dense',
      'logistics': 'compact',
      'support': 'comfortable',
      'project_management': 'compact',
      'education': 'comfortable',
    };

    return densityMap[archetype.id] || 'comfortable';
  }

  /**
   * Determine emphasis based on priority
   */
  private determineEmphasis(priority: number): WidgetNode['styling']['emphasis'] {
    if (priority >= 9) return 'primary';
    if (priority >= 7) return 'secondary';
    return 'tertiary';
  }

  /**
   * Determine layout type based on archetype
   */
  private determineLayoutType(archetype: ArchetypeDefinition): WidgetGraph['layout']['type'] {
    const layoutMap: Record<string, WidgetGraph['layout']['type']> = {
      'healthcare': 'grid',
      'crm': 'grid',
      'analytics': 'masonry',
      'ecommerce': 'grid',
      'ats': 'grid',
      'finance': 'masonry',
      'logistics': 'grid',
      'support': 'grid',
      'project_management': 'grid',
      'education': 'grid',
    };

    return layoutMap[archetype.id] || 'grid';
  }

  /**
   * Determine columns based on archetype
   */
  private determineColumns(archetype: ArchetypeDefinition): number {
    const columnMap: Record<string, number> = {
      'healthcare': 6,
      'crm': 8,
      'analytics': 12,
      'ecommerce': 8,
      'ats': 6,
      'finance': 12,
      'logistics': 8,
      'support': 6,
      'project_management': 6,
      'education': 6,
    };

    return columnMap[archetype.id] || 12;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<WidgetGraphCompositionConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('WidgetGraphComposition', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): WidgetGraphCompositionConfig {
    return { ...this.config };
  }
}

export const widgetGraphComposition = new WidgetGraphComposition();

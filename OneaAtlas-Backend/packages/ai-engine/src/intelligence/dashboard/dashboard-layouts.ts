/**
 * Dashboard Layout Selector
 * 
 * Intelligently selects dashboard layouts.
 * Optimizes component placement based on type and priority.
 */

import { logger } from '../../shared/utils/logger';
import type { DashboardComponent } from './prompt-aware-dashboard';

export interface LayoutOption {
  id: string;
  name: string;
  description: string;
  type: 'grid' | 'sidebar' | 'tabs' | 'stacked' | 'masonry';
  suitableFor: string[];
  maxComponents: number;
  responsive: boolean;
}

export interface LayoutRecommendation {
  layout: LayoutOption;
  confidence: number;
  componentPlacement: Array<{ componentId: string; position: { row: number; col: number; span: number } }>;
  reasoning: string[];
}

export interface LayoutConfig {
  enableResponsive: boolean;
  maxGridColumns: number;
  defaultLayout: LayoutOption['type'];
}

const DEFAULT_CONFIG: LayoutConfig = {
  enableResponsive: true,
  maxGridColumns: 12,
  defaultLayout: 'grid',
};

/**
 * Dashboard Layout Selector
 * 
 * Selects optimal dashboard layouts:
 * - Component analysis
 * - Layout scoring
 * - Intelligent placement
 * - Responsive optimization
 */
export class DashboardLayoutSelector {
  private config: LayoutConfig;
  private layouts: Map<string, LayoutOption> = new Map();

  constructor(config: Partial<LayoutConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeLayouts();
  }

  /**
   * Initialize layout options
   */
  private initializeLayouts(): void {
    this.layouts.set('grid', {
      id: 'grid',
      name: 'Grid Layout',
      description: 'Flexible grid layout with configurable columns',
      type: 'grid',
      suitableFor: ['dashboard', 'analytics', 'overview'],
      maxComponents: 12,
      responsive: true,
    });

    this.layouts.set('sidebar', {
      id: 'sidebar',
      name: 'Sidebar Layout',
      description: 'Main content with sidebar navigation',
      type: 'sidebar',
      suitableFor: ['data-heavy', 'table-focused', 'detail-view'],
      maxComponents: 8,
      responsive: true,
    });

    this.layouts.set('tabs', {
      id: 'tabs',
      name: 'Tabs Layout',
      description: 'Tabbed interface for organizing content',
      type: 'tabs',
      suitableFor: ['multi-category', 'organized-data', 'workflow'],
      maxComponents: 20,
      responsive: true,
    });

    this.layouts.set('stacked', {
      id: 'stacked',
      name: 'Stacked Layout',
      description: 'Vertical stack of components',
      type: 'stacked',
      suitableFor: ['sequential', 'form-focused', 'simple'],
      maxComponents: 6,
      responsive: true,
    });

    this.layouts.set('masonry', {
      id: 'masonry',
      name: 'Masonry Layout',
      description: 'Pinterest-style masonry grid',
      type: 'masonry',
      suitableFor: ['visual-heavy', 'card-focused', 'gallery'],
      maxComponents: 15,
      responsive: true,
    });

    logger.info('DashboardLayoutSelector', 'LAYOUTS_INITIALIZED', 'Layout options initialized', {
      layouts: this.layouts.size,
    });
  }

  /**
   * Select optimal layout for components
   */
  selectLayout(components: DashboardComponent[], domain?: string): LayoutRecommendation {
    const scores = new Map<string, number>();

    // Score each layout
    for (const [layoutId, layout] of this.layouts.entries()) {
      let score = 0;

      // Check component count
      if (components.length <= layout.maxComponents) {
        score += 0.3;
      } else {
        score -= 0.2;
      }

      // Check component types
      const chartCount = components.filter(c => c.type === 'chart').length;
      const tableCount = components.filter(c => c.type === 'table').length;
      const metricCount = components.filter(c => c.type === 'metric').length;

      // Grid layout is good for mixed types
      if (layout.type === 'grid' && chartCount > 0 && metricCount > 0) {
        score += 0.4;
      }

      // Sidebar layout is good for table-heavy
      if (layout.type === 'sidebar' && tableCount > 0) {
        score += 0.4;
      }

      // Tabs layout is good for many components
      if (layout.type === 'tabs' && components.length > 6) {
        score += 0.4;
      }

      // Stacked layout is good for sequential
      if (layout.type === 'stacked' && components.length <= 4) {
        score += 0.3;
      }

      // Masonry layout is good for card-heavy
      if (layout.type === 'masonry' && components.filter(c => c.type === 'card').length > 2) {
        score += 0.4;
      }

      scores.set(layoutId, score);
    }

    // Find best layout
    let bestLayoutId: LayoutOption['type'] = 'grid';
    let bestScore = -Infinity;

    for (const [layoutId, score] of scores.entries()) {
      if (score > bestScore) {
        bestScore = score;
        bestLayoutId = layoutId as LayoutOption['type'];
      }
    }

    const layout = this.layouts.get(bestLayoutId);
    if (!layout) {
      throw new Error('Layout not found');
    }

    // Calculate component placement
    const componentPlacement = this.calculatePlacement(components, layout);

    // Generate reasoning
    const reasoning = this.generateReasoning(components, layout, bestScore);

    const recommendation: LayoutRecommendation = {
      layout,
      confidence: Math.max(0, Math.min(1, bestScore)),
      componentPlacement,
      reasoning,
    };

    logger.info('DashboardLayoutSelector', 'LAYOUT_SELECTED', 'Layout selected', {
      layoutId: bestLayoutId,
      layoutName: layout.name,
      confidence: recommendation.confidence,
    });

    return recommendation;
  }

  /**
   * Calculate component placement within layout
   */
  private calculatePlacement(components: DashboardComponent[], layout: LayoutOption): Array<{
    componentId: string;
    position: { row: number; col: number; span: number };
  }> {
    const placement: Array<{ componentId: string; position: { row: number; col: number; span: number } }> = [];

    if (layout.type === 'grid') {
      return this.calculateGridPlacement(components);
    } else if (layout.type === 'sidebar') {
      return this.calculateSidebarPlacement(components);
    } else if (layout.type === 'tabs') {
      return this.calculateTabsPlacement(components);
    } else if (layout.type === 'stacked') {
      return this.calculateStackedPlacement(components);
    } else if (layout.type === 'masonry') {
      return this.calculateMasonryPlacement(components);
    }

    return placement;
  }

  /**
   * Calculate grid placement
   */
  private calculateGridPlacement(components: DashboardComponent[]): Array<{
    componentId: string;
    position: { row: number; col: number; span: number };
  }> {
    const placement: Array<{ componentId: string; position: { row: number; col: number; span: number } }> = [];
    let row = 0;
    let col = 0;

    for (const component of components) {
      let span = 4; // Default span

      // Adjust span based on component type
      if (component.type === 'chart') {
        span = 8;
      } else if (component.type === 'table') {
        span = 12;
      } else if (component.type === 'metric') {
        span = 3;
      }

      // Move to next row if needed
      if (col + span > this.config.maxGridColumns) {
        col = 0;
        row++;
      }

      placement.push({
        componentId: component.id,
        position: { row, col, span },
      });

      col += span;
    }

    return placement;
  }

  /**
   * Calculate sidebar placement
   */
  private calculateSidebarPlacement(components: DashboardComponent[]): Array<{
    componentId: string;
    position: { row: number; col: number; span: number };
  }> {
    const placement: Array<{ componentId: string; position: { row: number; col: number; span: number } }> = [];
    const mainContent = components.filter(c => c.type === 'table' || c.type === 'chart');
    const sidebarContent = components.filter(c => c.type === 'metric' || c.type === 'filter');

    // Place sidebar content
    for (let i = 0; i < sidebarContent.length; i++) {
      const component = sidebarContent[i];
      if (component) {
        placement.push({
          componentId: component.id,
          position: { row: i, col: 0, span: 3 },
        });
      }
    }

    // Place main content
    let row = 0;
    for (const component of mainContent) {
      placement.push({
        componentId: component.id,
        position: { row, col: 3, span: 9 },
      });
      row++;
    }

    return placement;
  }

  /**
   * Calculate tabs placement
   */
  private calculateTabsPlacement(components: DashboardComponent[]): Array<{
    componentId: string;
    position: { row: number; col: number; span: number };
  }> {
    const placement: Array<{ componentId: string; position: { row: number; col: number; span: number } }> = [];

    // Group components by type
    const grouped = new Map<string, DashboardComponent[]>();
    for (const component of components) {
      if (!grouped.has(component.type)) {
        grouped.set(component.type, []);
      }
      grouped.get(component.type)?.push(component);
    }

    let tab = 0;
    for (const [type, comps] of grouped.entries()) {
      for (const component of comps) {
        placement.push({
          componentId: component.id,
          position: { row: 0, col: tab, span: 1 },
        });
      }
      tab++;
    }

    return placement;
  }

  /**
   * Calculate stacked placement
   */
  private calculateStackedPlacement(components: DashboardComponent[]): Array<{
    componentId: string;
    position: { row: number; col: number; span: number };
  }> {
    const placement: Array<{ componentId: string; position: { row: number; col: number; span: number } }> = [];

    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      if (component) {
        placement.push({
          componentId: component.id,
          position: { row: i, col: 0, span: 12 },
        });
      }
    }

    return placement;
  }

  /**
   * Calculate masonry placement
   */
  private calculateMasonryPlacement(components: DashboardComponent[]): Array<{
    componentId: string;
    position: { row: number; col: number; span: number };
  }> {
    const placement: Array<{ componentId: string; position: { row: number; col: number; span: number } }> = [];
    const columns = 3;
    const columnHeights = [0, 0, 0];

    for (const component of components) {
      // Find column with minimum height
      const minColIndex = columnHeights.indexOf(Math.min(...columnHeights));
      const minCol = minColIndex !== -1 ? minColIndex : 0;
      const span = component.type === 'card' ? 4 : 6;
      const rowHeight = columnHeights[minCol] ?? 0;

      placement.push({
        componentId: component.id,
        position: { row: rowHeight, col: minCol * 4, span },
      });

      columnHeights[minCol] = (columnHeights[minCol] || 0) + 2; // Increment height
    }

    return placement;
  }

  /**
   * Generate reasoning for layout selection
   */
  private generateReasoning(
    components: DashboardComponent[],
    layout: LayoutOption,
    score: number,
  ): string[] {
    const reasoning: string[] = [];

    reasoning.push(`Selected ${layout.name} based on component analysis`);

    const chartCount = components.filter(c => c.type === 'chart').length;
    const tableCount = components.filter(c => c.type === 'table').length;
    const metricCount = components.filter(c => c.type === 'metric').length;

    if (chartCount > 0) {
      reasoning.push(`Contains ${chartCount} chart(s)`);
    }

    if (tableCount > 0) {
      reasoning.push(`Contains ${tableCount} table(s)`);
    }

    if (metricCount > 0) {
      reasoning.push(`Contains ${metricCount} metric(s)`);
    }

    reasoning.push(`Total components: ${components.length}`);
    reasoning.push(`Layout confidence: ${score.toFixed(2)}`);

    return reasoning;
  }

  /**
   * Get layout by ID
   */
  getLayout(layoutId: string): LayoutOption | undefined {
    return this.layouts.get(layoutId);
  }

  /**
   * List all layouts
   */
  listLayouts(): LayoutOption[] {
    return Array.from(this.layouts.values());
  }

  /**
   * Add custom layout
   */
  addLayout(layout: LayoutOption): void {
    this.layouts.set(layout.id, layout);

    logger.info('DashboardLayoutSelector', 'LAYOUT_ADDED', 'Custom layout added', {
      layoutId: layout.id,
      layoutName: layout.name,
    });
  }

  /**
   * Remove layout
   */
  removeLayout(layoutId: string): boolean {
    const deleted = this.layouts.delete(layoutId);

    if (deleted) {
      logger.info('DashboardLayoutSelector', 'LAYOUT_REMOVED', 'Layout removed', {
        layoutId,
      });
    }

    return deleted;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LayoutConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('DashboardLayoutSelector', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): LayoutConfig {
    return { ...this.config };
  }
}

export const dashboardLayoutSelector = new DashboardLayoutSelector();

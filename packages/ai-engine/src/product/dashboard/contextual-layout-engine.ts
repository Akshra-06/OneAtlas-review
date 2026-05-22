/**
 * Contextual Layout Engine
 * 
 * Generates contextual layouts based on content and archetype.
 * Creates adaptive grid systems and responsive layouts.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';

export interface LayoutGrid {
  columns: number;
  rows: number;
  cells: LayoutCell[];
}

export interface LayoutCell {
  id: string;
  row: number;
  column: number;
  rowSpan: number;
  columnSpan: number;
  content: string;
  priority: number;
}

export interface LayoutConfig {
  enableResponsiveGrids: boolean;
  enableContentAwareLayouts: boolean;
  enableAdaptiveSizing: boolean;
}

const DEFAULT_CONFIG: LayoutConfig = {
  enableResponsiveGrids: true,
  enableContentAwareLayouts: true,
  enableAdaptiveSizing: true,
};

/**
 * Contextual Layout Engine
 * 
 * Generates contextual layouts:
 * - Adaptive grid systems
 * - Content-aware layouts
 * - Responsive sizing
 * - Contextual arrangement
 */
export class ContextualLayoutEngine {
  private config: LayoutConfig;

  constructor(config: Partial<LayoutConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a contextual layout grid
   */
  generateLayoutGrid(
    archetype: ArchetypeDefinition,
    widgets: string[],
    viewport?: { width: number; height: number }
  ): LayoutGrid {
    const columns = this.determineColumnCount(archetype, viewport);
    const rows = this.determineRowCount(widgets, columns);
    const cells = this.generateCells(widgets, columns, rows, archetype);

    const grid: LayoutGrid = {
      columns,
      rows,
      cells,
    };

    logger.info('ContextualLayoutEngine', 'LAYOUT_GRID_GENERATED', 'Layout grid generated', {
      archetype: archetype.id,
      columns,
      rows,
      cellCount: cells.length,
    });

    return grid;
  }

  /**
   * Determine column count based on archetype and viewport
   */
  private determineColumnCount(archetype: ArchetypeDefinition, viewport?: { width: number; height: number }): number {
    if (viewport && this.config.enableResponsiveGrids) {
      // Responsive column count based on viewport width
      if (viewport.width < 768) {
        return 1; // Mobile
      } else if (viewport.width < 1024) {
        return 2; // Tablet
      } else if (viewport.width < 1440) {
        return 3; // Desktop
      } else {
        return 4; // Large desktop
      }
    }

    // Archetype-based column count
    switch (archetype.layoutDensity) {
      case 'dense':
        return 4;
      case 'compact':
        return 3;
      case 'comfortable':
        return 2;
      case 'spacious':
        return 2;
      default:
        return 3;
    }
  }

  /**
   * Determine row count based on widget count and columns
   */
  private determineRowCount(widgets: string[], columns: number): number {
    return Math.ceil(widgets.length / columns);
  }

  /**
   * Generate layout cells
   */
  private generateCells(
    widgets: string[],
    columns: number,
    rows: number,
    archetype: ArchetypeDefinition
  ): LayoutCell[] {
    const cells: LayoutCell[] = [];

    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];
      if (!widget) continue;

      const row = Math.floor(i / columns);
      const column = i % columns;

      const cell: LayoutCell = {
        id: crypto.randomUUID(),
        row,
        column,
        rowSpan: this.determineRowSpan(widget as string, archetype),
        columnSpan: this.determineColumnSpan(widget as string, archetype, column, columns),
        content: widget as string,
        priority: this.calculateCellPriority(widget as string, archetype),
      };

      cells.push(cell);
    }

    return cells;
  }

  /**
   * Determine row span for a widget
   */
  private determineRowSpan(widget: string, archetype: ArchetypeDefinition): number {
    const lowerWidget = widget.toLowerCase();

    // Large widgets span more rows
    if (lowerWidget.includes('chart') || lowerWidget.includes('graph') || lowerWidget.includes('timeline')) {
      return 2;
    }

    // Dense layouts use single row spans
    if (archetype.layoutDensity === 'dense') {
      return 1;
    }

    // Spacious layouts allow larger spans
    if (archetype.layoutDensity === 'spacious') {
      if (lowerWidget.includes('table') || lowerWidget.includes('list')) {
        return 2;
      }
    }

    return 1;
  }

  /**
   * Determine column span for a widget
   */
  private determineColumnSpan(
    widget: string,
    archetype: ArchetypeDefinition,
    currentColumn: number,
    totalColumns: number
  ): number {
    const lowerWidget = widget.toLowerCase();

    // Primary widgets span more columns
    if (lowerWidget.includes('primary') || lowerWidget.includes('main') || lowerWidget.includes('hero')) {
      return Math.min(totalColumns, 2);
    }

    // Chart widgets span more columns in spacious layouts
    if ((lowerWidget.includes('chart') || lowerWidget.includes('graph')) && archetype.layoutDensity === 'spacious') {
      return Math.min(totalColumns, 2);
    }

    return 1;
  }

  /**
   * Calculate cell priority
   */
  private calculateCellPriority(widget: string, archetype: ArchetypeDefinition): number {
    const lowerWidget = widget.toLowerCase();

    // Check if widget is in preferred widgets
    if (archetype.preferredWidgets.some(w => lowerWidget.includes(w.toLowerCase()))) {
      return 1.0;
    }

    // Check visual hierarchy rules
    const primaryEmphasis = archetype.visualHierarchyRules.primaryEmphasis.toLowerCase();
    const secondaryEmphasis = archetype.visualHierarchyRules.secondaryEmphasis.toLowerCase();
    const tertiaryEmphasis = archetype.visualHierarchyRules.tertiaryEmphasis.toLowerCase();

    if (lowerWidget.includes(primaryEmphasis)) {
      return 0.9;
    }

    if (lowerWidget.includes(secondaryEmphasis)) {
      return 0.7;
    }

    if (lowerWidget.includes(tertiaryEmphasis)) {
      return 0.5;
    }

    return 0.3;
  }

  /**
   * Generate responsive layout variants
   */
  generateResponsiveLayouts(
    archetype: ArchetypeDefinition,
    widgets: string[]
  ): Map<string, LayoutGrid> {
    const layouts = new Map<string, LayoutGrid>();

    // Mobile
    layouts.set('mobile', this.generateLayoutGrid(archetype, widgets, { width: 375, height: 667 }));

    // Tablet
    layouts.set('tablet', this.generateLayoutGrid(archetype, widgets, { width: 768, height: 1024 }));

    // Desktop
    layouts.set('desktop', this.generateLayoutGrid(archetype, widgets, { width: 1440, height: 900 }));

    // Large desktop
    layouts.set('large-desktop', this.generateLayoutGrid(archetype, widgets, { width: 1920, height: 1080 }));

    logger.info('ContextualLayoutEngine', 'RESPONSIVE_LAYOUTS_GENERATED', 'Responsive layouts generated', {
      archetype: archetype.id,
      layoutCount: layouts.size,
    });

    return layouts;
  }

  /**
   * Optimize layout for content
   */
  optimizeLayoutForContent(grid: LayoutGrid, archetype: ArchetypeDefinition): LayoutGrid {
    if (!this.config.enableContentAwareLayouts) {
      return grid;
    }

    // Sort cells by priority
    const sortedCells = [...grid.cells].sort((a, b) => b.priority - a.priority);

    // Reassign positions based on priority
    for (let i = 0; i < sortedCells.length; i++) {
      const cell = sortedCells[i];
      if (cell) {
        cell.row = Math.floor(i / grid.columns);
        cell.column = i % grid.columns;
      }
    }

    logger.info('ContextualLayoutEngine', 'LAYOUT_OPTIMIZED', 'Layout optimized for content', {
      archetype: archetype.id,
    });

    return {
      ...grid,
      cells: sortedCells,
    };
  }

  /**
   * Calculate layout metrics
   */
  calculateLayoutMetrics(grid: LayoutGrid): {
    totalCells: number;
    averagePriority: number;
    utilization: number;
  } {
    const totalCells = grid.cells.length;
    const averagePriority = grid.cells.reduce((sum, cell) => sum + cell.priority, 0) / totalCells;
    const utilization = totalCells / (grid.columns * grid.rows);

    return {
      totalCells,
      averagePriority,
      utilization,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LayoutConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ContextualLayoutEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): LayoutConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: LayoutConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const contextualLayoutEngine = new ContextualLayoutEngine();

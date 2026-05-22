/**
 * Adaptive Dashboard Engine
 * 
 * Generates adaptive dashboard layouts based on archetype.
 * Creates domain-specific dashboard compositions.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';

export interface DashboardLayout {
  id: string;
  archetype: string;
  sections: DashboardSection[];
  layout: 'grid' | 'masonry' | 'sidebar-content' | 'topbar-content' | 'custom';
  density: 'compact' | 'comfortable' | 'spacious' | 'dense';
  responsive: boolean;
}

export interface DashboardSection {
  id: string;
  type: 'primary' | 'secondary' | 'tertiary' | 'sidebar' | 'header';
  widgets: string[];
  priority: number;
  span: number;
  order: number;
}

export interface AdaptiveEngineConfig {
  enableResponsiveLayouts: boolean;
  enableWidgetPrioritization: boolean;
  enableContextualArrangement: boolean;
}

const DEFAULT_CONFIG: AdaptiveEngineConfig = {
  enableResponsiveLayouts: true,
  enableWidgetPrioritization: true,
  enableContextualArrangement: true,
};

/**
 * Adaptive Dashboard Engine
 * 
 * Generates adaptive dashboards:
 * - Archetype-based layouts
 * - Dynamic section arrangement
 * - Responsive layouts
 * - Contextual widget placement
 */
export class AdaptiveDashboardEngine {
  private config: AdaptiveEngineConfig;

  constructor(config: Partial<AdaptiveEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a dashboard layout based on archetype
   */
  generateLayout(archetype: ArchetypeDefinition, widgets: string[]): DashboardLayout {
    const layout: DashboardLayout = {
      id: crypto.randomUUID(),
      archetype: archetype.id,
      sections: this.generateSections(archetype, widgets),
      layout: this.determineLayoutType(archetype),
      density: archetype.layoutDensity,
      responsive: this.config.enableResponsiveLayouts,
    };

    logger.info('AdaptiveDashboardEngine', 'LAYOUT_GENERATED', 'Dashboard layout generated', {
      archetype: archetype.id,
      layoutType: layout.layout,
      sectionCount: layout.sections.length,
    });

    return layout;
  }

  /**
   * Determine layout type based on archetype
   */
  private determineLayoutType(archetype: ArchetypeDefinition): DashboardLayout['layout'] {
    switch (archetype.navigationStyle) {
      case 'sidebar':
        return 'sidebar-content';
      case 'topbar':
        return 'topbar-content';
      case 'sidebar-topbar':
        return 'grid';
      case 'minimal':
        return 'custom';
      case 'command-palette':
        return 'custom';
      default:
        return 'grid';
    }
  }

  /**
   * Generate dashboard sections based on archetype
   */
  private generateSections(archetype: ArchetypeDefinition, widgets: string[]): DashboardSection[] {
    const sections: DashboardSection[] = [];

    // Generate sections based on dashboard composition strategy
    switch (archetype.dashboardCompositionStrategy) {
      case 'data-first':
        sections.push(...this.generateDataFirstSections(archetype, widgets));
        break;
      case 'task-first':
        sections.push(...this.generateTaskFirstSections(archetype, widgets));
        break;
      case 'status-first':
        sections.push(...this.generateStatusFirstSections(archetype, widgets));
        break;
      case 'timeline-first':
        sections.push(...this.generateTimelineFirstSections(archetype, widgets));
        break;
    }

    // Arrange sections based on section arrangement behavior
    return this.arrangeSections(sections, archetype);
  }

  /**
   * Generate data-first sections
   */
  private generateDataFirstSections(archetype: ArchetypeDefinition, widgets: string[]): DashboardSection[] {
    const sections: DashboardSection[] = [];

    // Primary data section
    sections.push({
      id: crypto.randomUUID(),
      type: 'primary',
      widgets: widgets.slice(0, 3),
      priority: 1,
      span: 12,
      order: 1,
    });

    // Secondary data section
    if (widgets.length > 3) {
      sections.push({
        id: crypto.randomUUID(),
        type: 'secondary',
        widgets: widgets.slice(3, 6),
        priority: 2,
        span: 12,
        order: 2,
      });
    }

    // Tertiary data section
    if (widgets.length > 6) {
      sections.push({
        id: crypto.randomUUID(),
        type: 'tertiary',
        widgets: widgets.slice(6),
        priority: 3,
        span: 12,
        order: 3,
      });
    }

    return sections;
  }

  /**
   * Generate task-first sections
   */
  private generateTaskFirstSections(archetype: ArchetypeDefinition, widgets: string[]): DashboardSection[] {
    const sections: DashboardSection[] = [];

    // Primary task section
    sections.push({
      id: crypto.randomUUID(),
      type: 'primary',
      widgets: widgets.filter(w => w.includes('task') || w.includes('action')).slice(0, 4),
      priority: 1,
      span: 8,
      order: 1,
    });

    // Secondary context section
    const contextWidgets = widgets.filter(w => !w.includes('task') && !w.includes('action'));
    if (contextWidgets.length > 0) {
      sections.push({
        id: crypto.randomUUID(),
        type: 'secondary',
        widgets: contextWidgets.slice(0, 3),
        priority: 2,
        span: 4,
        order: 2,
      });
    }

    return sections;
  }

  /**
   * Generate status-first sections
   */
  private generateStatusFirstSections(archetype: ArchetypeDefinition, widgets: string[]): DashboardSection[] {
    const sections: DashboardSection[] = [];

    // Status header section
    sections.push({
      id: crypto.randomUUID(),
      type: 'header',
      widgets: widgets.filter(w => w.includes('status') || w.includes('alert')).slice(0, 2),
      priority: 1,
      span: 12,
      order: 1,
    });

    // Primary content section
    const contentWidgets = widgets.filter(w => !w.includes('status') && !w.includes('alert'));
    if (contentWidgets.length > 0) {
      sections.push({
        id: crypto.randomUUID(),
        type: 'primary',
        widgets: contentWidgets.slice(0, 4),
        priority: 2,
        span: 12,
        order: 2,
      });
    }

    return sections;
  }

  /**
   * Generate timeline-first sections
   */
  private generateTimelineFirstSections(archetype: ArchetypeDefinition, widgets: string[]): DashboardSection[] {
    const sections: DashboardSection[] = [];

    // Timeline section
    sections.push({
      id: crypto.randomUUID(),
      type: 'primary',
      widgets: widgets.filter(w => w.includes('timeline') || w.includes('calendar')).slice(0, 2),
      priority: 1,
      span: 8,
      order: 1,
    });

    // Context section
    const contextWidgets = widgets.filter(w => !w.includes('timeline') && !w.includes('calendar'));
    if (contextWidgets.length > 0) {
      sections.push({
        id: crypto.randomUUID(),
        type: 'secondary',
        widgets: contextWidgets.slice(0, 3),
        priority: 2,
        span: 4,
        order: 2,
      });
    }

    return sections;
  }

  /**
   * Arrange sections based on archetype behavior
   */
  private arrangeSections(sections: DashboardSection[], archetype: ArchetypeDefinition): DashboardSection[] {
    switch (archetype.sectionArrangementBehavior) {
      case 'grouped':
        return this.groupSections(sections);
      case 'sequential':
        return this.sequenceSections(sections);
      case 'priority':
        return this.prioritizeSections(sections);
      case 'workflow':
        return this.workflowArrangeSections(sections);
      default:
        return sections;
    }
  }

  /**
   * Group sections by type
   */
  private groupSections(sections: DashboardSection[]): DashboardSection[] {
    const grouped = sections.sort((a, b) => a.type.localeCompare(b.type));
    return grouped.map((section, index) => ({ ...section, order: index + 1 }));
  }

  /**
   * Sequence sections by priority
   */
  private sequenceSections(sections: DashboardSection[]): DashboardSection[] {
    const sequenced = sections.sort((a, b) => a.priority - b.priority);
    return sequenced.map((section, index) => ({ ...section, order: index + 1 }));
  }

  /**
   * Prioritize sections
   */
  private prioritizeSections(sections: DashboardSection[]): DashboardSection[] {
    const prioritized = sections.sort((a, b) => b.priority - a.priority);
    return prioritized.map((section, index) => ({ ...section, order: index + 1 }));
  }

  /**
   * Arrange sections by workflow
   */
  private workflowArrangeSections(sections: DashboardSection[]): DashboardSection[] {
    // Primary first, then secondary, then tertiary
    const typeOrder = { primary: 1, secondary: 2, tertiary: 3, header: 0, sidebar: 4 };
    const arranged = sections.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);
    return arranged.map((section, index) => ({ ...section, order: index + 1 }));
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AdaptiveEngineConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('AdaptiveDashboardEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): AdaptiveEngineConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: AdaptiveEngineConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const adaptiveDashboardEngine = new AdaptiveDashboardEngine();

/**
 * Dashboard Composer
 * 
 * Composes dashboard layouts from widgets and sections.
 * Orchestrates dashboard composition logic.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';
import { DashboardLayout, DashboardSection } from './adaptive-dashboard-engine';

export interface CompositionRequest {
  archetype: ArchetypeDefinition;
  widgets: string[];
  role?: string;
  workflow?: string;
}

export interface CompositionResult {
  layout: DashboardLayout;
  composition: string;
  reasoning: string;
}

export interface ComposerConfig {
  enableRoleAwareness: boolean;
  enableWorkflowAwareness: boolean;
  enableAdaptiveSizing: boolean;
}

const DEFAULT_CONFIG: ComposerConfig = {
  enableRoleAwareness: true,
  enableWorkflowAwareness: true,
  enableAdaptiveSizing: true,
};

/**
 * Dashboard Composer
 * 
 * Composes dashboard layouts:
 * - Widget composition
 * - Section composition
 * - Role-aware layouts
 * - Workflow-aware layouts
 */
export class DashboardComposer {
  private config: ComposerConfig;

  constructor(config: Partial<ComposerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Compose a dashboard layout
   */
  compose(request: CompositionRequest): CompositionResult {
    const { archetype, widgets, role, workflow } = request;

    // Generate reasoning
    const reasoning = this.generateReasoning(archetype, widgets, role, workflow);

    // Compose layout
    const layout = this.composeLayout(archetype, widgets, role, workflow);

    // Generate composition string
    const composition = this.generateCompositionString(layout);

    logger.info('DashboardComposer', 'DASHBOARD_COMPOSED', 'Dashboard composed', {
      archetype: archetype.id,
      widgetCount: widgets.length,
      role,
      workflow,
    });

    return {
      layout,
      composition,
      reasoning,
    };
  }

  /**
   * Compose a dashboard layout
   */
  private composeLayout(
    archetype: ArchetypeDefinition,
    widgets: string[],
    role?: string,
    workflow?: string
  ): DashboardLayout {
    const sections = this.composeSections(archetype, widgets, role, workflow);

    return {
      id: crypto.randomUUID(),
      archetype: archetype.id,
      sections,
      layout: this.determineLayoutType(archetype),
      density: archetype.layoutDensity,
      responsive: true,
    };
  }

  /**
   * Compose dashboard sections
   */
  private composeSections(
    archetype: ArchetypeDefinition,
    widgets: string[],
    role?: string,
    workflow?: string
  ): DashboardSection[] {
    const sections: DashboardSection[] = [];

    // Apply role-based adjustments
    const adjustedWidgets = this.applyRoleAdjustments(widgets, role);

    // Apply workflow-based adjustments
    const workflowAdjustedWidgets = this.applyWorkflowAdjustments(adjustedWidgets, workflow);

    // Generate sections based on archetype strategy
    switch (archetype.dashboardCompositionStrategy) {
      case 'data-first':
        sections.push(...this.composeDataFirstSections(archetype, workflowAdjustedWidgets));
        break;
      case 'task-first':
        sections.push(...this.composeTaskFirstSections(archetype, workflowAdjustedWidgets));
        break;
      case 'status-first':
        sections.push(...this.composeStatusFirstSections(archetype, workflowAdjustedWidgets));
        break;
      case 'timeline-first':
        sections.push(...this.composeTimelineFirstSections(archetype, workflowAdjustedWidgets));
        break;
    }

    // Arrange sections
    return this.arrangeSections(sections, archetype);
  }

  /**
   * Apply role-based adjustments to widgets
   */
  private applyRoleAdjustments(widgets: string[], role?: string): string[] {
    if (!role || !this.config.enableRoleAwareness) {
      return widgets;
    }

    const roleLower = role.toLowerCase();

    // Admin role: prioritize system widgets
    if (roleLower.includes('admin')) {
      return widgets.sort((a, b) => {
        const aPriority = a.includes('system') || a.includes('admin') ? 1 : 0;
        const bPriority = b.includes('system') || b.includes('admin') ? 1 : 0;
        return bPriority - aPriority;
      });
    }

    // Analyst role: prioritize data widgets
    if (roleLower.includes('analyst')) {
      return widgets.sort((a, b) => {
        const aPriority = a.includes('chart') || a.includes('metric') ? 1 : 0;
        const bPriority = b.includes('chart') || b.includes('metric') ? 1 : 0;
        return bPriority - aPriority;
      });
    }

    // Operator role: prioritize task widgets
    if (roleLower.includes('operator')) {
      return widgets.sort((a, b) => {
        const aPriority = a.includes('task') || a.includes('action') ? 1 : 0;
        const bPriority = b.includes('task') || b.includes('action') ? 1 : 0;
        return bPriority - aPriority;
      });
    }

    return widgets;
  }

  /**
   * Apply workflow-based adjustments to widgets
   */
  private applyWorkflowAdjustments(widgets: string[], workflow?: string): string[] {
    if (!workflow || !this.config.enableWorkflowAwareness) {
      return widgets;
    }

    const workflowLower = workflow.toLowerCase();

    // Monitoring workflow: prioritize alert widgets
    if (workflowLower.includes('monitor')) {
      return widgets.sort((a, b) => {
        const aPriority = a.includes('alert') || a.includes('status') ? 1 : 0;
        const bPriority = b.includes('alert') || b.includes('status') ? 1 : 0;
        return bPriority - aPriority;
      });
    }

    // Analysis workflow: prioritize chart widgets
    if (workflowLower.includes('analyze')) {
      return widgets.sort((a, b) => {
        const aPriority = a.includes('chart') || a.includes('graph') ? 1 : 0;
        const bPriority = b.includes('chart') || b.includes('graph') ? 1 : 0;
        return bPriority - aPriority;
      });
    }

    return widgets;
  }

  /**
   * Compose data-first sections
   */
  private composeDataFirstSections(archetype: ArchetypeDefinition, widgets: string[]): DashboardSection[] {
    const sections: DashboardSection[] = [];

    sections.push({
      id: crypto.randomUUID(),
      type: 'primary',
      widgets: widgets.slice(0, 3),
      priority: 1,
      span: 12,
      order: 1,
    });

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
   * Compose task-first sections
   */
  private composeTaskFirstSections(archetype: ArchetypeDefinition, widgets: string[]): DashboardSection[] {
    const sections: DashboardSection[] = [];

    const taskWidgets = widgets.filter(w => w.includes('task') || w.includes('action'));
    const contextWidgets = widgets.filter(w => !w.includes('task') && !w.includes('action'));

    sections.push({
      id: crypto.randomUUID(),
      type: 'primary',
      widgets: taskWidgets.slice(0, 4),
      priority: 1,
      span: 8,
      order: 1,
    });

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
   * Compose status-first sections
   */
  private composeStatusFirstSections(archetype: ArchetypeDefinition, widgets: string[]): DashboardSection[] {
    const sections: DashboardSection[] = [];

    const statusWidgets = widgets.filter(w => w.includes('status') || w.includes('alert'));
    const contentWidgets = widgets.filter(w => !w.includes('status') && !w.includes('alert'));

    if (statusWidgets.length > 0) {
      sections.push({
        id: crypto.randomUUID(),
        type: 'header',
        widgets: statusWidgets.slice(0, 2),
        priority: 1,
        span: 12,
        order: 1,
      });
    }

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
   * Compose timeline-first sections
   */
  private composeTimelineFirstSections(archetype: ArchetypeDefinition, widgets: string[]): DashboardSection[] {
    const sections: DashboardSection[] = [];

    const timelineWidgets = widgets.filter(w => w.includes('timeline') || w.includes('calendar'));
    const contextWidgets = widgets.filter(w => !w.includes('timeline') && !w.includes('calendar'));

    if (timelineWidgets.length > 0) {
      sections.push({
        id: crypto.randomUUID(),
        type: 'primary',
        widgets: timelineWidgets.slice(0, 2),
        priority: 1,
        span: 8,
        order: 1,
      });
    }

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
   * Arrange sections based on archetype
   */
  private arrangeSections(sections: DashboardSection[], archetype: ArchetypeDefinition): DashboardSection[] {
    switch (archetype.sectionArrangementBehavior) {
      case 'grouped':
        return sections.sort((a, b) => a.type.localeCompare(b.type));
      case 'sequential':
        return sections.sort((a, b) => a.priority - b.priority);
      case 'priority':
        return sections.sort((a, b) => b.priority - a.priority);
      case 'workflow':
        const typeOrder = { primary: 1, secondary: 2, tertiary: 3, header: 0, sidebar: 4 };
        return sections.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);
      default:
        return sections;
    }
  }

  /**
   * Determine layout type
   */
  private determineLayoutType(archetype: ArchetypeDefinition): DashboardLayout['layout'] {
    switch (archetype.navigationStyle) {
      case 'sidebar':
        return 'sidebar-content';
      case 'topbar':
        return 'topbar-content';
      case 'sidebar-topbar':
        return 'grid';
      default:
        return 'grid';
    }
  }

  /**
   * Generate composition string
   */
  private generateCompositionString(layout: DashboardLayout): string {
    const sectionCount = layout.sections.length;
    const widgetCount = layout.sections.reduce((sum, s) => sum + s.widgets.length, 0);

    return `${sectionCount} sections with ${widgetCount} widgets in ${layout.layout} layout`;
  }

  /**
   * Generate reasoning
   */
  private generateReasoning(
    archetype: ArchetypeDefinition,
    widgets: string[],
    role?: string,
    workflow?: string
  ): string {
    let reasoning = `Composed dashboard for ${archetype.name} archetype with ${widgets.length} widgets`;

    if (role) {
      reasoning += ` optimized for ${role} role`;
    }

    if (workflow) {
      reasoning += ` aligned with ${workflow} workflow`;
    }

    reasoning += ` using ${archetype.dashboardCompositionStrategy} composition strategy`;

    return reasoning;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ComposerConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('DashboardComposer', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ComposerConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: ComposerConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const dashboardComposer = new DashboardComposer();

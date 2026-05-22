/**
 * Widget Priority Engine
 * 
 * Prioritizes widgets based on context and archetype.
 * Determines widget placement and importance.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';

export interface WidgetPriority {
  widgetId: string;
  priority: number;
  reason: string;
}

export interface PriorityConfig {
  enableArchetypePrioritization: boolean;
  enableWorkflowPrioritization: boolean;
  enableRolePrioritization: boolean;
}

const DEFAULT_CONFIG: PriorityConfig = {
  enableArchetypePrioritization: true,
  enableWorkflowPrioritization: true,
  enableRolePrioritization: true,
};

/**
 * Widget Priority Engine
 * 
 * Prioritizes widgets:
 * - Archetype-based prioritization
 * - Workflow-based prioritization
 * - Role-based prioritization
 * - Contextual scoring
 */
export class WidgetPriorityEngine {
  private config: PriorityConfig;

  constructor(config: Partial<PriorityConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Prioritize widgets based on context
   */
  prioritizeWidgets(
    widgets: string[],
    archetype: ArchetypeDefinition,
    workflow?: string,
    role?: string
  ): WidgetPriority[] {
    const priorities: WidgetPriority[] = [];

    for (const widget of widgets) {
      const priority = this.calculateWidgetPriority(widget, archetype, workflow, role);
      priorities.push(priority);
    }

    // Sort by priority
    priorities.sort((a, b) => b.priority - a.priority);

    logger.info('WidgetPriorityEngine', 'WIDGETS_PRIORITIZED', 'Widgets prioritized', {
      widgetCount: widgets.length,
      archetype: archetype.id,
    });

    return priorities;
  }

  /**
   * Calculate priority for a single widget
   */
  private calculateWidgetPriority(
    widget: string,
    archetype: ArchetypeDefinition,
    workflow?: string,
    role?: string
  ): WidgetPriority {
    let priority = 0.5; // Base priority
    const reasons: string[] = [];

    // Archetype-based prioritization
    if (this.config.enableArchetypePrioritization) {
      const archetypeScore = this.calculateArchetypeScore(widget, archetype);
      priority += archetypeScore * 0.4;
      if (archetypeScore > 0) {
        reasons.push('matches archetype preferences');
      }
    }

    // Workflow-based prioritization
    if (this.config.enableWorkflowPrioritization && workflow) {
      const workflowScore = this.calculateWorkflowScore(widget, workflow);
      priority += workflowScore * 0.3;
      if (workflowScore > 0) {
        reasons.push('aligns with workflow');
      }
    }

    // Role-based prioritization
    if (this.config.enableRolePrioritization && role) {
      const roleScore = this.calculateRoleScore(widget, role);
      priority += roleScore * 0.3;
      if (roleScore > 0) {
        reasons.push('relevant to role');
      }
    }

    // Cap at 1.0
    priority = Math.min(priority, 1.0);

    return {
      widgetId: widget,
      priority,
      reason: reasons.join(', ') || 'default priority',
    };
  }

  /**
   * Calculate archetype score for a widget
   */
  private calculateArchetypeScore(widget: string, archetype: ArchetypeDefinition): number {
    const lowerWidget = widget.toLowerCase();

    // Check if widget is in preferred widgets
    if (archetype.preferredWidgets.some(w => lowerWidget.includes(w.toLowerCase()))) {
      return 1.0;
    }

    // Check workflow emphasis
    switch (archetype.workflowEmphasis) {
      case 'data':
        if (lowerWidget.includes('chart') || lowerWidget.includes('metric') || lowerWidget.includes('graph')) {
          return 0.8;
        }
        break;
      case 'tasks':
        if (lowerWidget.includes('task') || lowerWidget.includes('action') || lowerWidget.includes('todo')) {
          return 0.8;
        }
        break;
      case 'collaboration':
        if (lowerWidget.includes('chat') || lowerWidget.includes('message') || lowerWidget.includes('team')) {
          return 0.8;
        }
        break;
      case 'monitoring':
        if (lowerWidget.includes('alert') || lowerWidget.includes('status') || lowerWidget.includes('monitor')) {
          return 0.8;
        }
        break;
      case 'operations':
        if (lowerWidget.includes('operation') || lowerWidget.includes('process') || lowerWidget.includes('workflow')) {
          return 0.8;
        }
        break;
    }

    return 0;
  }

  /**
   * Calculate workflow score for a widget
   */
  private calculateWorkflowScore(widget: string, workflow: string): number {
    const lowerWidget = widget.toLowerCase();
    const lowerWorkflow = workflow.toLowerCase();

    // Workflow-specific keyword matching
    const workflowKeywords: Record<string, string[]> = {
      monitor: ['alert', 'status', 'monitor', 'real-time', 'live'],
      analyze: ['chart', 'graph', 'metric', 'data', 'insight'],
      collaborate: ['chat', 'message', 'team', 'share', 'comment'],
      operate: ['task', 'action', 'process', 'workflow', 'operation'],
      schedule: ['calendar', 'timeline', 'schedule', 'appointment', 'booking'],
      sell: ['pipeline', 'deal', 'lead', 'customer', 'sales'],
      support: ['ticket', 'issue', 'help', 'support', 'resolve'],
    };

    for (const [key, keywords] of Object.entries(workflowKeywords)) {
      if (lowerWorkflow.includes(key)) {
        for (const keyword of keywords) {
          if (lowerWidget.includes(keyword)) {
            return 0.8;
          }
        }
      }
    }

    return 0;
  }

  /**
   * Calculate role score for a widget
   */
  private calculateRoleScore(widget: string, role: string): number {
    const lowerWidget = widget.toLowerCase();
    const lowerRole = role.toLowerCase();

    // Role-specific keyword matching
    const roleKeywords: Record<string, string[]> = {
      admin: ['system', 'config', 'setting', 'user', 'permission', 'audit'],
      analyst: ['chart', 'graph', 'metric', 'data', 'report', 'insight'],
      operator: ['task', 'action', 'process', 'workflow', 'operation', 'monitor'],
      manager: ['summary', 'report', 'team', 'performance', 'kpi', 'dashboard'],
      executive: ['summary', 'kpi', 'performance', 'trend', 'forecast', 'strategic'],
    };

    for (const [key, keywords] of Object.entries(roleKeywords)) {
      if (lowerRole.includes(key)) {
        for (const keyword of keywords) {
          if (lowerWidget.includes(keyword)) {
            return 0.8;
          }
        }
      }
    }

    return 0;
  }

  /**
   * Get top N widgets by priority
   */
  getTopWidgets(priorities: WidgetPriority[], count: number): string[] {
    return priorities.slice(0, count).map(p => p.widgetId);
  }

  /**
   * Filter widgets by minimum priority
   */
  filterByPriority(priorities: WidgetPriority[], minPriority: number): WidgetPriority[] {
    return priorities.filter(p => p.priority >= minPriority);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PriorityConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('WidgetPriorityEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): PriorityConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: PriorityConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const widgetPriorityEngine = new WidgetPriorityEngine();

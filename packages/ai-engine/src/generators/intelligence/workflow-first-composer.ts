/**
 * Workflow-First Composition Engine
 * 
 * Composes UI around workflows instead of entities.
 * Prioritizes operational flows and user tasks.
 */

import type {
  EntitySchema,
  GeneratedFile,
} from '@oneatlas/shared';

import { logger } from '../../shared/utils/logger';

import {
  workflowUIEngine,
  operationalFlowMapper,
  userIntentComposer,
  taskPriorityEngine,
} from '../../product/workflow';

import {
  contextualCTAEngine,
} from '../../product/ux';

export interface WorkflowComposition {
  workflowType: string;
  primaryActions: string[];
  secondaryActions: string[];
  contextualAreas: string[];
  sectionOrder: string[];
  actionPriorities: Record<string, number>;
}

export interface WorkflowComposerConfig {
  enableWorkflowPrioritization: boolean;
  enableActionSurface: boolean;
  enableSectionReordering: boolean;
  enableContextualAreas: boolean;
}

const DEFAULT_CONFIG: WorkflowComposerConfig = {
  enableWorkflowPrioritization: true,
  enableActionSurface: true,
  enableSectionReordering: true,
  enableContextualAreas: true,
};

/**
 * Workflow-First Composition Engine
 * 
 * Composes UI around workflows:
 * - Workflow prioritization
 * - Action surfacing
 * - Section reordering
 * - Contextual action areas
 */
export class WorkflowFirstComposer {
  private config: WorkflowComposerConfig;

  constructor(config: Partial<WorkflowComposerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Compose workflow-centric UI
   */
  composeWorkflowUI(entities: EntitySchema[], workflowType: string): WorkflowComposition {
    const primaryActions = this.config.enableActionSurface 
      ? this.determinePrimaryActions(workflowType)
      : [];

    const secondaryActions = this.config.enableActionSurface
      ? this.determineSecondaryActions(workflowType)
      : [];

    const contextualAreas = this.config.enableContextualAreas
      ? this.generateContextualAreas(workflowType)
      : [];

    const sectionOrder = this.config.enableSectionReordering
      ? this.determineSectionOrder(workflowType, entities)
      : entities.map(e => e.name);

    const actionPriorities = this.config.enableWorkflowPrioritization
      ? this.calculateActionPriorities(workflowType)
      : {};

    const composition: WorkflowComposition = {
      workflowType,
      primaryActions,
      secondaryActions,
      contextualAreas,
      sectionOrder,
      actionPriorities,
    };

    logger.info('WorkflowFirstComposer', 'WORKFLOW_COMPOSED', 'Workflow-centric UI composed', {
      workflowType,
      primaryActionCount: primaryActions.length,
      contextualAreaCount: contextualAreas.length,
    });

    return composition;
  }

  /**
   * Determine primary actions based on workflow
   */
  private determinePrimaryActions(workflowType: string): string[] {
    const workflowActions: Record<string, string[]> = {
      monitoring: ['view_status', 'track_progress', 'check_alerts'],
      analysis: ['view_analytics', 'generate_report', 'export_data'],
      collaboration: ['share', 'comment', 'assign'],
      operation: ['create', 'edit', 'delete', 'approve'],
      scheduling: ['schedule', 'reschedule', 'cancel'],
      selling: ['move_pipeline', 'add_note', 'follow_up'],
      support: ['respond', 'escalate', 'resolve'],
      project_management: ['create_task', 'assign_task', 'update_status'],
    };

    return workflowActions[workflowType] || ['create', 'edit', 'view'];
  }

  /**
   * Determine secondary actions based on workflow
   */
  private determineSecondaryActions(workflowType: string): string[] {
    const secondaryActions: Record<string, string[]> = {
      monitoring: ['filter', 'sort', 'export'],
      analysis: ['compare', 'drill_down', 'annotate'],
      collaboration: ['mention', 'notify', 'invite'],
      operation: ['duplicate', 'archive', 'history'],
      scheduling: ['view_calendar', 'check_availability', 'send_reminder'],
      selling: ['view_activity', 'email_lead', 'schedule_call'],
      support: ['view_history', 'merge_ticket', 'link_article'],
      project_management: ['add_subtask', 'set_deadline', 'add_attachment'],
    };

    return secondaryActions[workflowType] || ['filter', 'sort', 'search'];
  }

  /**
   * Generate contextual areas based on workflow
   */
  private generateContextualAreas(workflowType: string): string[] {
    const contextualAreas: Record<string, string[]> = {
      monitoring: ['status_panel', 'alert_feed', 'activity_timeline'],
      analysis: ['chart_panel', 'data_table', 'insight_sidebar'],
      collaboration: ['team_panel', 'activity_feed', 'notification_center'],
      operation: ['action_bar', 'quick_actions', 'recent_items'],
      scheduling: ['calendar_view', 'upcoming_events', 'availability_check'],
      selling: ['pipeline_view', 'lead_activity', 'next_actions'],
      support: ['ticket_details', 'customer_info', 'knowledge_base'],
      project_management: ['task_board', 'team_assignments', 'progress_tracker'],
    };

    return contextualAreas[workflowType] || ['default_panel'];
  }

  /**
   * Determine section order based on workflow
   */
  private determineSectionOrder(workflowType: string, entities: EntitySchema[]): string[] {
    // Reorder sections based on workflow priority
    const workflowPriorities: Record<string, string[]> = {
      monitoring: ['status', 'alerts', 'activity', 'details'],
      analysis: ['charts', 'data', 'insights', 'details'],
      collaboration: ['team', 'activity', 'content', 'details'],
      operation: ['actions', 'content', 'history', 'details'],
      scheduling: ['calendar', 'upcoming', 'details'],
      selling: ['pipeline', 'activity', 'details', 'history'],
      support: ['ticket', 'customer', 'history', 'knowledge'],
      project_management: ['tasks', 'team', 'progress', 'details'],
    };

    const priorityOrder = workflowPriorities[workflowType] || [];
    
    // Map priority keywords to entity names
    const orderedEntities: string[] = [];
    const remainingEntities = [...entities];

    for (const keyword of priorityOrder) {
      const matchingEntity = remainingEntities.find(e => 
        e.name.toLowerCase().includes(keyword)
      );
      if (matchingEntity) {
        orderedEntities.push(matchingEntity.name);
        remainingEntities.splice(remainingEntities.indexOf(matchingEntity), 1);
      }
    }

    // Add remaining entities
    orderedEntities.push(...remainingEntities.map(e => e.name));

    return orderedEntities;
  }

  /**
   * Calculate action priorities
   */
  private calculateActionPriorities(workflowType: string): Record<string, number> {
    const priorities: Record<string, number> = {};

    const primaryActions = this.determinePrimaryActions(workflowType);
    const secondaryActions = this.determineSecondaryActions(workflowType);

    // Primary actions get higher priority
    primaryActions.forEach((action, index) => {
      priorities[action] = 1.0 - (index * 0.1);
    });

    // Secondary actions get medium priority
    secondaryActions.forEach((action, index) => {
      priorities[action] = 0.7 - (index * 0.05);
    });

    return priorities;
  }

  /**
   * Apply workflow composition to pages
   */
  applyToPages(files: GeneratedFile[], composition: WorkflowComposition): GeneratedFile[] {
    return files.map(file => ({
      ...file,
      content: this.enhancePageWithWorkflow(file.content, composition),
    }));
  }

  /**
   * Enhance page with workflow composition
   */
  private enhancePageWithWorkflow(content: string, composition: WorkflowComposition): string {
    let enhanced = content;

    // Add workflow-specific action bar
    if (composition.primaryActions.length > 0) {
      const actionBar = `
        <div className="workflow-action-bar" data-workflow="${composition.workflowType}">
          ${composition.primaryActions.map(action => `
            <button className="action-button priority-${composition.actionPriorities[action] || 0.5}">
              ${this.formatActionLabel(action)}
            </button>
          `).join('')}
        </div>
      `;

      enhanced = enhanced.replace(/<!-- actions -->/gi, actionBar);
    }

    // Add contextual areas
    if (composition.contextualAreas.length > 0) {
      const contextualPanels = composition.contextualAreas.map(area => `
        <div className="contextual-area" data-area="${area}">
          <h3>${this.formatAreaLabel(area)}</h3>
          <div className="area-content">
            <!-- ${area} content -->
          </div>
        </div>
      `).join('');

      enhanced = enhanced.replace(/<!-- contextual-areas -->/gi, contextualPanels);
    }

    // Reorder sections based on workflow
    if (composition.sectionOrder.length > 0) {
      enhanced = enhanced.replace(/<!-- sections -->/gi, `
        <div className="workflow-sections" data-workflow="${composition.workflowType}">
          ${composition.sectionOrder.map((section, index) => `
            <div className="section priority-${index + 1}" data-section="${section}">
              <h2>${section}</h2>
              <!-- ${section} content -->
            </div>
          `).join('')}
        </div>
      `);
    }

    return enhanced;
  }

  /**
   * Format action label
   */
  private formatActionLabel(action: string): string {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Format area label
   */
  private formatAreaLabel(area: string): string {
    return area
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<WorkflowComposerConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('WorkflowFirstComposer', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): WorkflowComposerConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: WorkflowComposerConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const workflowFirstComposer = new WorkflowFirstComposer();

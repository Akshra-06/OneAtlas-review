/**
 * Workflow UI Engine
 * 
 * Generates UI from workflows instead of entities.
 * Creates workflow-first interface generation.
 */

import { logger } from '../../shared/utils/logger';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'decision' | 'review' | 'approval' | 'notification';
  priority: number;
  frequency: number;
  uiComponent: string;
}

export interface WorkflowUI {
  id: string;
  workflowName: string;
  steps: WorkflowStep[];
  primaryActions: string[];
  contextualPanels: string[];
  navigationStructure: string;
}

export interface WorkflowUIEngineConfig {
  enableFrequencyAnalysis: boolean;
  enableActionPrioritization: boolean;
  enableContextualPanels: boolean;
}

const DEFAULT_CONFIG: WorkflowUIEngineConfig = {
  enableFrequencyAnalysis: true,
  enableActionPrioritization: true,
  enableContextualPanels: true,
};

/**
 * Workflow UI Engine
 * 
 * Generates workflow-first UI:
 * - Workflow step analysis
 * - Action prioritization
 * - Contextual panel generation
 * - Navigation structure
 */
export class WorkflowUIEngine {
  private config: WorkflowUIEngineConfig;

  constructor(config: Partial<WorkflowUIEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate UI from workflow
   */
  generateFromWorkflow(workflow: string, steps: WorkflowStep[]): WorkflowUI {
    const workflowUI: WorkflowUI = {
      id: crypto.randomUUID(),
      workflowName: workflow,
      steps: this.prioritizeSteps(steps),
      primaryActions: this.extractPrimaryActions(steps),
      contextualPanels: this.generateContextualPanels(steps),
      navigationStructure: this.generateNavigationStructure(steps),
    };

    logger.info('WorkflowUIEngine', 'WORKFLOW_UI_GENERATED', 'Workflow UI generated', {
      workflow,
      stepCount: steps.length,
      primaryActionCount: workflowUI.primaryActions.length,
    });

    return workflowUI;
  }

  /**
   * Prioritize workflow steps
   */
  private prioritizeSteps(steps: WorkflowStep[]): WorkflowStep[] {
    if (!this.config.enableActionPrioritization) {
      return steps;
    }

    const prioritized = [...steps].sort((a, b) => {
      // Sort by priority first
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }

      // Then by frequency if enabled
      if (this.config.enableFrequencyAnalysis) {
        return b.frequency - a.frequency;
      }

      return 0;
    });

    return prioritized;
  }

  /**
   * Extract primary actions from steps
   */
  private extractPrimaryActions(steps: WorkflowStep[]): string[] {
    const primaryActions: string[] = [];

    for (const step of steps) {
      // High priority actions are primary
      if (step.priority >= 0.8) {
        primaryActions.push(step.uiComponent);
      }

      // High frequency actions are primary
      if (this.config.enableFrequencyAnalysis && step.frequency >= 0.7) {
        if (!primaryActions.includes(step.uiComponent)) {
          primaryActions.push(step.uiComponent);
        }
      }
    }

    return primaryActions;
  }

  /**
   * Generate contextual panels
   */
  private generateContextualPanels(steps: WorkflowStep[]): string[] {
    if (!this.config.enableContextualPanels) {
      return [];
    }

    const panels: string[] = [];

    // Group steps by type and create panels
    const typeGroups = new Map<string, WorkflowStep[]>();
    for (const step of steps) {
      if (!typeGroups.has(step.type)) {
        typeGroups.set(step.type, []);
      }
      typeGroups.get(step.type)!.push(step);
    }

    // Create panels for each type group
    for (const [type, groupSteps] of typeGroups.entries()) {
      if (groupSteps.length >= 2) {
        panels.push(`${type}_panel`);
      }
    }

    return panels;
  }

  /**
   * Generate navigation structure
   */
  private generateNavigationStructure(steps: WorkflowStep[]): string {
    const actionSteps = steps.filter(s => s.type === 'action');
    const reviewSteps = steps.filter(s => s.type === 'review');
    const approvalSteps = steps.filter(s => s.type === 'approval');

    if (approvalSteps.length > 0) {
      return 'approval_workflow';
    }

    if (reviewSteps.length > 0) {
      return 'review_workflow';
    }

    if (actionSteps.length > 0) {
      return 'action_workflow';
    }

    return 'default_workflow';
  }

  /**
   * Analyze workflow step frequency
   */
  analyzeStepFrequency(steps: WorkflowStep[], usageData: Map<string, number>): WorkflowStep[] {
    const analyzed = steps.map(step => ({
      ...step,
      frequency: usageData.get(step.id) || 0,
    }));

    return analyzed;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<WorkflowUIEngineConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('WorkflowUIEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): WorkflowUIEngineConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: WorkflowUIEngineConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const workflowUIEngine = new WorkflowUIEngine();

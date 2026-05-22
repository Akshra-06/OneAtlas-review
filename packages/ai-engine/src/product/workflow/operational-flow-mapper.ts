/**
 * Operational Flow Mapper
 * 
 * Maps operational flows to UI components.
 * Transforms business operations into interface elements.
 */

import { logger } from '../../shared/utils/logger';

export interface OperationFlow {
  id: string;
  name: string;
  steps: string[];
  triggers: string[];
  outcomes: string[];
  frequency: number;
}

export interface FlowMapping {
  flowId: string;
  uiComponents: string[];
  navigationPath: string[];
  actionButtons: string[];
  contextMenus: string[];
}

export interface FlowMapperConfig {
  enableAutoMapping: boolean;
  enableFrequencyWeighting: boolean;
  enableContextualActions: boolean;
}

const DEFAULT_CONFIG: FlowMapperConfig = {
  enableAutoMapping: true,
  enableFrequencyWeighting: true,
  enableContextualActions: true,
};

/**
 * Operational Flow Mapper
 * 
 * Maps operational flows to UI:
 * - Flow analysis
 * - Component mapping
 * - Navigation mapping
 * - Action mapping
 */
export class OperationalFlowMapper {
  private config: FlowMapperConfig;

  constructor(config: Partial<FlowMapperConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Map operational flow to UI
   */
  mapFlow(flow: OperationFlow): FlowMapping {
    const mapping: FlowMapping = {
      flowId: flow.id,
      uiComponents: this.mapToUIComponents(flow),
      navigationPath: this.mapToNavigationPath(flow),
      actionButtons: this.mapToActionButtons(flow),
      contextMenus: this.mapToContextMenus(flow),
    };

    logger.info('OperationalFlowMapper', 'FLOW_MAPPED', 'Operational flow mapped', {
      flowId: flow.id,
      componentCount: mapping.uiComponents.length,
    });

    return mapping;
  }

  /**
   * Map flow to UI components
   */
  private mapToUIComponents(flow: OperationFlow): string[] {
    const components: string[] = [];

    for (const step of flow.steps) {
      const lowerStep = step.toLowerCase();

      // Map step to component
      if (lowerStep.includes('form') || lowerStep.includes('input')) {
        components.push('form_component');
      } else if (lowerStep.includes('review') || lowerStep.includes('approve')) {
        components.push('review_panel');
      } else if (lowerStep.includes('list') || lowerStep.includes('table')) {
        components.push('data_table');
      } else if (lowerStep.includes('chart') || lowerStep.includes('graph')) {
        components.push('chart_component');
      } else if (lowerStep.includes('detail') || lowerStep.includes('view')) {
        components.push('detail_view');
      } else {
        components.push('generic_component');
      }
    }

    return components;
  }

  /**
   * Map flow to navigation path
   */
  private mapToNavigationPath(flow: OperationFlow): string[] {
    const path: string[] = [];

    // Start with flow name
    path.push(flow.name.toLowerCase().replace(/\s+/g, '-'));

    // Add step-based navigation
    for (const step of flow.steps) {
      const lowerStep = step.toLowerCase().replace(/\s+/g, '-');
      path.push(lowerStep);
    }

    return path;
  }

  /**
   * Map flow to action buttons
   */
  private mapToActionButtons(flow: OperationFlow): string[] {
    const buttons: string[] = [];

    for (const trigger of flow.triggers) {
      const lowerTrigger = trigger.toLowerCase();

      if (lowerTrigger.includes('submit') || lowerTrigger.includes('save')) {
        buttons.push('submit_button');
      } else if (lowerTrigger.includes('approve') || lowerTrigger.includes('accept')) {
        buttons.push('approve_button');
      } else if (lowerTrigger.includes('reject') || lowerTrigger.includes('decline')) {
        buttons.push('reject_button');
      } else if (lowerTrigger.includes('cancel') || lowerTrigger.includes('close')) {
        buttons.push('cancel_button');
      } else if (lowerTrigger.includes('next') || lowerTrigger.includes('continue')) {
        buttons.push('next_button');
      } else if (lowerTrigger.includes('back') || lowerTrigger.includes('previous')) {
        buttons.push('back_button');
      } else {
        buttons.push('action_button');
      }
    }

    return buttons;
  }

  /**
   * Map flow to context menus
   */
  private mapToContextMenus(flow: OperationFlow): string[] {
    const menus: string[] = [];

    if (!this.config.enableContextualActions) {
      return menus;
    }

    // Create context menus based on outcomes
    for (const outcome of flow.outcomes) {
      const lowerOutcome = outcome.toLowerCase();

      if (lowerOutcome.includes('success') || lowerOutcome.includes('complete')) {
        menus.push('success_menu');
      } else if (lowerOutcome.includes('error') || lowerOutcome.includes('fail')) {
        menus.push('error_menu');
      } else if (lowerOutcome.includes('review') || lowerOutcome.includes('pending')) {
        menus.push('review_menu');
      }
    }

    return menus;
  }

  /**
   * Map multiple flows
   */
  mapFlows(flows: OperationFlow[]): FlowMapping[] {
    const mappings: FlowMapping[] = [];

    for (const flow of flows) {
      mappings.push(this.mapFlow(flow));
    }

    logger.info('OperationalFlowMapper', 'FLOWS_MAPPED', 'Multiple flows mapped', {
      flowCount: flows.length,
      mappingCount: mappings.length,
    });

    return mappings;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<FlowMapperConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('OperationalFlowMapper', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): FlowMapperConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: FlowMapperConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const operationalFlowMapper = new OperationalFlowMapper();

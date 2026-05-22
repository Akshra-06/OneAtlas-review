/**
 * User Intent Composer
 * 
 * Composes UI based on user intent and workflows.
 * Generates intent-driven interface components.
 */

import { logger } from '../../shared/utils/logger';

export interface UserIntent {
  id: string;
  action: string;
  entity: string;
  context: string;
  priority: number;
  frequency: number;
}

export interface IntentComposition {
  intentId: string;
  uiLayout: string;
  primaryActions: string[];
  secondaryActions: string[];
  contextualElements: string[];
  workflowIntegration: string[];
}

export interface IntentComposerConfig {
  enableIntentAnalysis: boolean;
  enableFrequencyWeighting: boolean;
  enableContextualElements: boolean;
}

const DEFAULT_CONFIG: IntentComposerConfig = {
  enableIntentAnalysis: true,
  enableFrequencyWeighting: true,
  enableContextualElements: true,
};

/**
 * User Intent Composer
 * 
 * Composes UI from user intent:
 * - Intent analysis
 * - Layout composition
 * - Action composition
 * - Contextual element generation
 */
export class UserIntentComposer {
  private config: IntentComposerConfig;

  constructor(config: Partial<IntentComposerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Compose UI from user intent
   */
  composeFromIntent(intent: UserIntent): IntentComposition {
    const composition: IntentComposition = {
      intentId: intent.id,
      uiLayout: this.determineLayout(intent),
      primaryActions: this.composePrimaryActions(intent),
      secondaryActions: this.composeSecondaryActions(intent),
      contextualElements: this.generateContextualElements(intent),
      workflowIntegration: this.generateWorkflowIntegration(intent),
    };

    logger.info('UserIntentComposer', 'INTENT_COMPOSED', 'User intent composed', {
      intentId: intent.id,
      action: intent.action,
      layout: composition.uiLayout,
    });

    return composition;
  }

  /**
   * Determine UI layout based on intent
   */
  private determineLayout(intent: UserIntent): string {
    const lowerAction = intent.action.toLowerCase();
    const lowerContext = intent.context.toLowerCase();

    // Determine layout based on action type
    if (lowerAction.includes('create') || lowerAction.includes('add') || lowerAction.includes('new')) {
      return 'form_layout';
    }

    if (lowerAction.includes('edit') || lowerAction.includes('modify') || lowerAction.includes('update')) {
      return 'edit_layout';
    }

    if (lowerAction.includes('view') || lowerAction.includes('show') || lowerAction.includes('display')) {
      return 'detail_layout';
    }

    if (lowerAction.includes('list') || lowerAction.includes('browse') || lowerAction.includes('search')) {
      return 'list_layout';
    }

    if (lowerAction.includes('approve') || lowerAction.includes('review')) {
      return 'review_layout';
    }

    if (lowerAction.includes('analyze') || lowerAction.includes('report')) {
      return 'analytics_layout';
    }

    // Default based on context
    if (lowerContext.includes('dashboard') || lowerContext.includes('overview')) {
      return 'dashboard_layout';
    }

    return 'default_layout';
  }

  /**
   * Compose primary actions
   */
  private composePrimaryActions(intent: UserIntent): string[] {
    const actions: string[] = [];
    const lowerAction = intent.action.toLowerCase();

    // Add primary action based on intent
    if (lowerAction.includes('create') || lowerAction.includes('add')) {
      actions.push('create_button');
    } else if (lowerAction.includes('edit') || lowerAction.includes('modify')) {
      actions.push('save_button');
    } else if (lowerAction.includes('delete') || lowerAction.includes('remove')) {
      actions.push('delete_button');
    } else if (lowerAction.includes('approve')) {
      actions.push('approve_button');
    } else if (lowerAction.includes('reject')) {
      actions.push('reject_button');
    } else {
      actions.push('submit_button');
    }

    // Add cancel action
    actions.push('cancel_button');

    return actions;
  }

  /**
   * Compose secondary actions
   */
  private composeSecondaryActions(intent: UserIntent): string[] {
    const actions: string[] = [];
    const lowerAction = intent.action.toLowerCase();

    // Add contextual secondary actions
    if (lowerAction.includes('edit')) {
      actions.push('reset_button');
    }

    if (lowerAction.includes('view')) {
      actions.push('edit_button');
      actions.push('delete_button');
    }

    if (lowerAction.includes('list')) {
      actions.push('filter_button');
      actions.push('sort_button');
    }

    return actions;
  }

  /**
   * Generate contextual elements
   */
  private generateContextualElements(intent: UserIntent): string[] {
    if (!this.config.enableContextualElements) {
      return [];
    }

    const elements: string[] = [];
    const lowerContext = intent.context.toLowerCase();

    // Add context-specific elements
    if (lowerContext.includes('dashboard')) {
      elements.push('summary_card');
      elements.push('quick_actions');
    }

    if (lowerContext.includes('form')) {
      elements.push('validation_messages');
      elements.push('help_text');
    }

    if (lowerContext.includes('list')) {
      elements.push('search_bar');
      elements.push('filter_panel');
    }

    if (lowerContext.includes('detail')) {
      elements.push('related_items');
      elements.push('activity_feed');
    }

    return elements;
  }

  /**
   * Generate workflow integration
   */
  private generateWorkflowIntegration(intent: UserIntent): string[] {
    const integrations: string[] = [];
    const lowerAction = intent.action.toLowerCase();

    // Add workflow-specific integrations
    if (lowerAction.includes('approve') || lowerAction.includes('review')) {
      integrations.push('approval_workflow');
      integrations.push('notification_system');
    }

    if (lowerAction.includes('create') || lowerAction.includes('edit')) {
      integrations.push('validation_workflow');
      integrations.push('autosave_system');
    }

    if (lowerAction.includes('delete')) {
      integrations.push('confirmation_dialog');
      integrations.push('backup_system');
    }

    return integrations;
  }

  /**
   * Compose from multiple intents
   */
  composeFromIntents(intents: UserIntent[]): IntentComposition[] {
    const compositions: IntentComposition[] = [];

    for (const intent of intents) {
      compositions.push(this.composeFromIntent(intent));
    }

    logger.info('UserIntentComposer', 'INTENTS_COMPOSED', 'Multiple intents composed', {
      intentCount: intents.length,
      compositionCount: compositions.length,
    });

    return compositions;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<IntentComposerConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('UserIntentComposer', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): IntentComposerConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: IntentComposerConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const userIntentComposer = new UserIntentComposer();

/**
 * Intelligent Empty States
 * 
 * Generates domain-aware empty states.
 * Creates contextual empty state experiences.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';

export interface EmptyState {
  id: string;
  title: string;
  description: string;
  icon: string;
  actions: EmptyStateAction[];
  illustration: string;
}

export interface EmptyStateAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary';
  action: string;
}

export interface EmptyStateConfig {
  enableAutoGeneration: boolean;
  enableContextAwareness: boolean;
  enableIllustrations: boolean;
}

const DEFAULT_CONFIG: EmptyStateConfig = {
  enableAutoGeneration: true,
  enableContextAwareness: true,
  enableIllustrations: true,
};

/**
 * Intelligent Empty States
 * 
 * Generates intelligent empty states:
 * - Domain-aware messages
 * - Contextual actions
 * - Illustrations
 * - Adaptive content
 */
export class IntelligentEmptyStates {
  private config: EmptyStateConfig;

  constructor(config: Partial<EmptyStateConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate empty state
   */
  generateEmptyState(context: string, archetype: ArchetypeDefinition): EmptyState {
    const emptyState: EmptyState = {
      id: crypto.randomUUID(),
      title: this.generateTitle(context, archetype),
      description: this.generateDescription(context, archetype),
      icon: this.selectIcon(context, archetype),
      actions: this.generateActions(context, archetype),
      illustration: this.config.enableIllustrations ? this.selectIllustration(context, archetype) : '',
    };

    logger.info('IntelligentEmptyStates', 'EMPTY_STATE_GENERATED', 'Empty state generated', {
      context,
      archetype: archetype.id,
    });

    return emptyState;
  }

  /**
   * Generate title
   */
  private generateTitle(context: string, archetype: ArchetypeDefinition): string {
    const lowerContext = context.toLowerCase();

    // Domain-specific titles
    if (archetype.id === 'healthcare_workspace') {
      if (lowerContext.includes('patient')) {
        return 'No Patients Found';
      } else if (lowerContext.includes('appointment')) {
        return 'No Appointments Scheduled';
      } else {
        return 'No Data Available';
      }
    }

    if (archetype.id === 'crm_pipeline') {
      if (lowerContext.includes('lead')) {
        return 'No Leads Yet';
      } else if (lowerContext.includes('deal')) {
        return 'No Deals in Pipeline';
      } else {
        return 'No Data Available';
      }
    }

    if (archetype.id === 'ecommerce_console') {
      if (lowerContext.includes('order')) {
        return 'No Orders Yet';
      } else if (lowerContext.includes('product')) {
        return 'No Products Listed';
      } else {
        return 'No Data Available';
      }
    }

    // Generic title
    return `No ${this.formatContext(context)} Found`;
  }

  /**
   * Generate description
   */
  private generateDescription(context: string, archetype: ArchetypeDefinition): string {
    const lowerContext = context.toLowerCase();

    // Domain-specific descriptions
    if (archetype.id === 'healthcare_workspace') {
      if (lowerContext.includes('patient')) {
        return 'Start by adding patients to begin tracking their care journey.';
      } else if (lowerContext.includes('appointment')) {
        return 'Schedule your first appointment to get started.';
      } else {
        return 'Add data to get started with tracking.';
      }
    }

    if (archetype.id === 'crm_pipeline') {
      if (lowerContext.includes('lead')) {
        return 'Capture your first lead to start building your pipeline.';
      } else if (lowerContext.includes('deal')) {
        return 'Create your first deal to begin tracking opportunities.';
      } else {
        return 'Add data to get started with tracking.';
      }
    }

    if (archetype.id === 'ecommerce_console') {
      if (lowerContext.includes('order')) {
        return 'Your first order will appear here once customers start purchasing.';
      } else if (lowerContext.includes('product')) {
        return 'Add products to your catalog to start selling.';
      } else {
        return 'Add data to get started with tracking.';
      }
    }

    // Generic description
    return `Add ${this.formatContext(context).toLowerCase()} to get started.`;
  }

  /**
   * Select icon
   */
  private selectIcon(context: string, archetype: ArchetypeDefinition): string {
    const lowerContext = context.toLowerCase();

    // Context-specific icons
    if (lowerContext.includes('chart') || lowerContext.includes('graph')) {
      return 'chart';
    } else if (lowerContext.includes('list') || lowerContext.includes('table')) {
      return 'list';
    } else if (lowerContext.includes('calendar') || lowerContext.includes('schedule')) {
      return 'calendar';
    } else if (lowerContext.includes('user') || lowerContext.includes('person')) {
      return 'user';
    } else if (lowerContext.includes('folder') || lowerContext.includes('file')) {
      return 'folder';
    } else {
      return 'empty';
    }
  }

  /**
   * Generate actions
   */
  private generateActions(context: string, archetype: ArchetypeDefinition): EmptyStateAction[] {
    const actions: EmptyStateAction[] = [];
    const lowerContext = context.toLowerCase();

    // Primary action
    actions.push({
      id: crypto.randomUUID(),
      label: this.generatePrimaryActionLabel(context, archetype),
      type: 'primary',
      action: 'create',
    });

    // Secondary action
    actions.push({
      id: crypto.randomUUID(),
      label: 'Learn More',
      type: 'secondary',
      action: 'learn',
    });

    return actions;
  }

  /**
   * Generate primary action label
   */
  private generatePrimaryActionLabel(context: string, archetype: ArchetypeDefinition): string {
    const lowerContext = context.toLowerCase();

    if (lowerContext.includes('patient') || lowerContext.includes('lead') || lowerContext.includes('order')) {
      return `Add ${this.formatContext(context)}`;
    } else if (lowerContext.includes('appointment') || lowerContext.includes('schedule')) {
      return 'Schedule';
    } else {
      return 'Create New';
    }
  }

  /**
   * Select illustration
   */
  private selectIllustration(context: string, archetype: ArchetypeDefinition): string {
    const lowerContext = context.toLowerCase();

    // Context-specific illustrations
    if (lowerContext.includes('chart') || lowerContext.includes('graph')) {
      return 'analytics_illustration';
    } else if (lowerContext.includes('list') || lowerContext.includes('table')) {
      return 'list_illustration';
    } else if (lowerContext.includes('calendar') || lowerContext.includes('schedule')) {
      return 'calendar_illustration';
    } else {
      return 'default_illustration';
    }
  }

  /**
   * Format context
   */
  private formatContext(context: string): string {
    return context
      .split(/[_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<EmptyStateConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('IntelligentEmptyStates', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): EmptyStateConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: EmptyStateConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const intelligentEmptyStates = new IntelligentEmptyStates();

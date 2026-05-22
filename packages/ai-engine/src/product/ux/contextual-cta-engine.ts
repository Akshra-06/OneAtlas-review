/**
 * Contextual CTA Engine
 * 
 * Generates intelligent CTAs based on context.
 * Creates contextual call-to-action elements.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';

export interface CTA {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'tertiary';
  action: string;
  priority: number;
  context: string;
}

export interface CTAEngineConfig {
  enableAutoGeneration: boolean;
  enableContextAwareness: boolean;
  enablePriorityScoring: boolean;
}

const DEFAULT_CONFIG: CTAEngineConfig = {
  enableAutoGeneration: true,
  enableContextAwareness: true,
  enablePriorityScoring: true,
};

/**
 * Contextual CTA Engine
 * 
 * Generates contextual CTAs:
 * - Context-aware CTAs
 * - Priority scoring
 * - Domain-specific CTAs
 * - Action suggestions
 */
export class ContextualCTAEngine {
  private config: CTAEngineConfig;

  constructor(config: Partial<CTAEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate CTAs for context
   */
  generateCTAs(context: string, archetype: ArchetypeDefinition): CTA[] {
    const ctas: CTA[] = [];

    if (!this.config.enableAutoGeneration) {
      return ctas;
    }

    // Generate primary CTA
    const primaryCTA = this.generatePrimaryCTA(context, archetype);
    ctas.push(primaryCTA);

    // Generate secondary CTAs
    const secondaryCTAs = this.generateSecondaryCTAs(context, archetype);
    ctas.push(...secondaryCTAs);

    // Score priorities
    if (this.config.enablePriorityScoring) {
      this.scorePriorities(ctas, archetype);
    }

    // Sort by priority
    ctas.sort((a, b) => b.priority - a.priority);

    logger.info('ContextualCTAEngine', 'CTAS_GENERATED', 'CTAs generated', {
      context,
      archetype: archetype.id,
      ctaCount: ctas.length,
    });

    return ctas;
  }

  /**
   * Generate primary CTA
   */
  private generatePrimaryCTA(context: string, archetype: ArchetypeDefinition): CTA {
    const lowerContext = context.toLowerCase();

    let label = 'Get Started';
    let action = 'start';

    // Domain-specific primary CTAs
    if (archetype.id === 'healthcare_workspace') {
      if (lowerContext.includes('patient')) {
        label = 'Add Patient';
        action = 'add_patient';
      } else if (lowerContext.includes('appointment')) {
        label = 'Schedule Appointment';
        action = 'schedule_appointment';
      } else if (lowerContext.includes('alert')) {
        label = 'View Alerts';
        action = 'view_alerts';
      }
    } else if (archetype.id === 'crm_pipeline') {
      if (lowerContext.includes('lead')) {
        label = 'Add Lead';
        action = 'add_lead';
      } else if (lowerContext.includes('deal')) {
        label = 'Create Deal';
        action = 'create_deal';
      } else if (lowerContext.includes('pipeline')) {
        label = 'View Pipeline';
        action = 'view_pipeline';
      }
    } else if (archetype.id === 'ecommerce_console') {
      if (lowerContext.includes('order')) {
        label = 'View Orders';
        action = 'view_orders';
      } else if (lowerContext.includes('product')) {
        label = 'Add Product';
        action = 'add_product';
      } else if (lowerContext.includes('inventory')) {
        label = 'Manage Inventory';
        action = 'manage_inventory';
      }
    }

    return {
      id: crypto.randomUUID(),
      label,
      type: 'primary',
      action,
      priority: 1.0,
      context,
    };
  }

  /**
   * Generate secondary CTAs
   */
  private generateSecondaryCTAs(context: string, archetype: ArchetypeDefinition): CTA[] {
    const ctas: CTA[] = [];
    const lowerContext = context.toLowerCase();

    // Common secondary CTAs
    ctas.push({
      id: crypto.randomUUID(),
      label: 'Learn More',
      type: 'secondary',
      action: 'learn_more',
      priority: 0.7,
      context,
    });

    ctas.push({
      id: crypto.randomUUID(),
      label: 'View Documentation',
      type: 'secondary',
      action: 'view_docs',
      priority: 0.5,
      context,
    });

    // Context-specific secondary CTAs
    if (lowerContext.includes('dashboard') || lowerContext.includes('overview')) {
      ctas.push({
        id: crypto.randomUUID(),
        label: 'Customize Dashboard',
        type: 'secondary',
        action: 'customize',
        priority: 0.6,
        context,
      });
    }

    if (lowerContext.includes('report') || lowerContext.includes('analytics')) {
      ctas.push({
        id: crypto.randomUUID(),
        label: 'Export Report',
        type: 'secondary',
        action: 'export',
        priority: 0.6,
        context,
      });
    }

    return ctas;
  }

  /**
   * Score priorities
   */
  private scorePriorities(ctas: CTA[], archetype: ArchetypeDefinition): void {
    for (const cta of ctas) {
      let score = cta.priority;

      // Adjust based on archetype workflow emphasis
      if (archetype.workflowEmphasis === 'tasks' && cta.action.includes('add') || cta.action.includes('create')) {
        score += 0.1;
      }

      if (archetype.workflowEmphasis === 'monitoring' && cta.action.includes('view') || cta.action.includes('monitor')) {
        score += 0.1;
      }

      cta.priority = Math.min(score, 1.0);
    }
  }

  /**
   * Get primary CTA
   */
  getPrimaryCTA(ctas: CTA[]): CTA | null {
    const primary = ctas.find(c => c.type === 'primary');
    return primary ?? null;
  }

  /**
   * Get secondary CTAs
   */
  getSecondaryCTAs(ctas: CTA[]): CTA[] {
    return ctas.filter(c => c.type === 'secondary');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CTAEngineConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ContextualCTAEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): CTAEngineConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: CTAEngineConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const contextualCTAEngine = new ContextualCTAEngine();

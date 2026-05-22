/**
 * Component Intelligence Engine
 * 
 * Manages domain-specific component intelligence.
 * Selects and generates native domain components.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';

export interface ComponentDefinition {
  id: string;
  name: string;
  domain: string;
  type: string;
  description: string;
  props: Record<string, unknown>;
  interactions: string[];
}

export interface ComponentIntelligenceConfig {
  enableAutoSelection: boolean;
  enableContextualGeneration: boolean;
  enableInteractionMapping: boolean;
}

const DEFAULT_CONFIG: ComponentIntelligenceConfig = {
  enableAutoSelection: true,
  enableContextualGeneration: true,
  enableInteractionMapping: true,
};

/**
 * Component Intelligence Engine
 * 
 * Manages component intelligence:
 * - Component selection
 * - Contextual generation
 * - Interaction mapping
 * - Domain-specific components
 */
export class ComponentIntelligenceEngine {
  private config: ComponentIntelligenceConfig;
  private componentRegistry: Map<string, ComponentDefinition[]> = new Map();

  constructor(config: Partial<ComponentIntelligenceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeComponentRegistry();
  }

  /**
   * Select components for domain and archetype
   */
  selectComponents(domain: string, archetype: ArchetypeDefinition): ComponentDefinition[] {
    const lowerDomain = domain.toLowerCase();
    let components = this.componentRegistry.get(lowerDomain) || [];

    // Filter by archetype preferences
    if (this.config.enableAutoSelection) {
      components = this.filterByArchetype(components, archetype);
    }

    logger.info('ComponentIntelligenceEngine', 'COMPONENTS_SELECTED', 'Components selected', {
      domain,
      archetype: archetype.id,
      componentCount: components.length,
    });

    return components;
  }

  /**
   * Filter components by archetype
   */
  private filterByArchetype(components: ComponentDefinition[], archetype: ArchetypeDefinition): ComponentDefinition[] {
    return components.filter(component => {
      // Check if component matches archetype preferences
      const matchesPreferred = archetype.preferredWidgets.some(pref =>
        component.name.toLowerCase().includes(pref.toLowerCase())
      );

      return matchesPreferred;
    });
  }

  /**
   * Generate contextual component
   */
  generateContextualComponent(context: string, domain: string): ComponentDefinition | null {
    if (!this.config.enableContextualGeneration) {
      return null;
    }

    const component: ComponentDefinition = {
      id: crypto.randomUUID(),
      name: `contextual_${context.toLowerCase()}`,
      domain,
      type: 'custom',
      description: `Contextual component for ${context}`,
      props: {},
      interactions: [],
    };

    logger.info('ComponentIntelligenceEngine', 'CONTEXTUAL_COMPONENT_GENERATED', 'Contextual component generated', {
      context,
      domain,
    });

    return component;
  }

  /**
   * Map interactions for component
   */
  mapInteractions(component: ComponentDefinition, archetype: ArchetypeDefinition): string[] {
    if (!this.config.enableInteractionMapping) {
      return component.interactions;
    }

    const interactions: string[] = [];

    // Add archetype-specific interactions
    for (const pattern of archetype.interactionPatterns) {
      if (!interactions.includes(pattern)) {
        interactions.push(pattern);
      }
    }

    logger.info('ComponentIntelligenceEngine', 'INTERACTIONS_MAPPED', 'Interactions mapped', {
      componentId: component.id,
      interactionCount: interactions.length,
    });

    return interactions;
  }

  /**
   * Initialize component registry
   */
  private initializeComponentRegistry(): void {
    // Healthcare components
    this.componentRegistry.set('healthcare', [
      {
        id: 'patient_timeline',
        name: 'Patient Timeline',
        domain: 'healthcare',
        type: 'timeline',
        description: 'Patient treatment timeline',
        props: {},
        interactions: ['view', 'edit', 'add'],
      },
      {
        id: 'appointment_calendar',
        name: 'Appointment Calendar',
        domain: 'healthcare',
        type: 'calendar',
        description: 'Provider appointment calendar',
        props: {},
        interactions: ['book', 'cancel', 'reschedule'],
      },
      {
        id: 'urgency_alerts',
        name: 'Urgency Alerts',
        domain: 'healthcare',
        type: 'alert',
        description: 'Critical patient alerts',
        props: {},
        interactions: ['acknowledge', 'escalate', 'dismiss'],
      },
    ]);

    // CRM components
    this.componentRegistry.set('crm', [
      {
        id: 'pipeline_stages',
        name: 'Pipeline Stages',
        domain: 'crm',
        type: 'pipeline',
        description: 'Sales pipeline visualization',
        props: {},
        interactions: ['move', 'edit', 'delete'],
      },
      {
        id: 'lead_scoring',
        name: 'Lead Scoring',
        domain: 'crm',
        type: 'score',
        description: 'Lead scoring dashboard',
        props: {},
        interactions: ['view', 'filter', 'export'],
      },
      {
        id: 'activity_feed',
        name: 'Activity Feed',
        domain: 'crm',
        type: 'feed',
        description: 'Customer activity timeline',
        props: {},
        interactions: ['view', 'filter', 'add'],
      },
    ]);

    // Ecommerce components
    this.componentRegistry.set('ecommerce', [
      {
        id: 'inventory_heatmap',
        name: 'Inventory Heatmap',
        domain: 'ecommerce',
        type: 'heatmap',
        description: 'Inventory visualization',
        props: {},
        interactions: ['view', 'filter', 'adjust'],
      },
      {
        id: 'sales_funnel',
        name: 'Sales Funnel',
        domain: 'ecommerce',
        type: 'funnel',
        description: 'Sales conversion funnel',
        props: {},
        interactions: ['view', 'analyze', 'export'],
      },
      {
        id: 'order_tracking',
        name: 'Order Tracking',
        domain: 'ecommerce',
        type: 'tracker',
        description: 'Order status tracking',
        props: {},
        interactions: ['view', 'update', 'notify'],
      },
    ]);

    // Analytics components
    this.componentRegistry.set('analytics', [
      {
        id: 'live_charts',
        name: 'Live Charts',
        domain: 'analytics',
        type: 'chart',
        description: 'Real-time data visualization',
        props: {},
        interactions: ['view', 'filter', 'export'],
      },
      {
        id: 'anomaly_alerts',
        name: 'Anomaly Alerts',
        domain: 'analytics',
        type: 'alert',
        description: 'Data anomaly detection',
        props: {},
        interactions: ['acknowledge', 'investigate', 'dismiss'],
      },
      {
        id: 'retention_graphs',
        name: 'Retention Graphs',
        domain: 'analytics',
        type: 'graph',
        description: 'User retention visualization',
        props: {},
        interactions: ['view', 'filter', 'compare'],
      },
    ]);
  }

  /**
   * Add custom component to registry
   */
  addComponent(domain: string, component: ComponentDefinition): void {
    const lowerDomain = domain.toLowerCase();
    const existing = this.componentRegistry.get(lowerDomain) || [];
    this.componentRegistry.set(lowerDomain, [...existing, component]);

    logger.info('ComponentIntelligenceEngine', 'COMPONENT_ADDED', 'Custom component added', {
      domain,
      componentId: component.id,
    });
  }

  /**
   * Get components for domain
   */
  getDomainComponents(domain: string): ComponentDefinition[] {
    return this.componentRegistry.get(domain.toLowerCase()) || [];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ComponentIntelligenceConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ComponentIntelligenceEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ComponentIntelligenceConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: ComponentIntelligenceConfig;
    domainCount: number;
    totalComponents: number;
  } {
    const domainCount = this.componentRegistry.size;
    const totalComponents = Array.from(this.componentRegistry.values()).reduce(
      (sum, components) => sum + components.length,
      0
    );

    return {
      config: this.getConfig(),
      domainCount,
      totalComponents,
    };
  }
}

export const componentIntelligenceEngine = new ComponentIntelligenceEngine();

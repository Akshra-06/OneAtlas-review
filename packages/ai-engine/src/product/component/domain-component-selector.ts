/**
 * Domain Component Selector
 * 
 * Selects domain-specific components based on context.
 * Chooses appropriate components for each domain.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';
import { ComponentDefinition, componentIntelligenceEngine } from './component-intelligence-engine';

export interface SelectionCriteria {
  domain: string;
  archetype: ArchetypeDefinition;
  context: string;
  workflow: string;
}

export interface SelectionResult {
  components: ComponentDefinition[];
  primaryComponent: ComponentDefinition | null;
  secondaryComponents: ComponentDefinition[];
  reasoning: string;
}

export interface DomainComponentSelectorConfig {
  enableAutoSelection: boolean;
  enableContextMatching: boolean;
  enableWorkflowAlignment: boolean;
}

const DEFAULT_CONFIG: DomainComponentSelectorConfig = {
  enableAutoSelection: true,
  enableContextMatching: true,
  enableWorkflowAlignment: true,
};

/**
 * Domain Component Selector
 * 
 * Selects domain-specific components:
 * - Component selection
 * - Context matching
 * - Workflow alignment
 * - Priority ranking
 */
export class DomainComponentSelector {
  private config: DomainComponentSelectorConfig;

  constructor(config: Partial<DomainComponentSelectorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Select components based on criteria
   */
  selectComponents(criteria: SelectionCriteria): SelectionResult {
    const { domain, archetype, context, workflow } = criteria;

    // Get domain components
    let components = componentIntelligenceEngine.getDomainComponents(domain);

    // Filter by archetype
    if (this.config.enableAutoSelection) {
      components = this.filterByArchetype(components, archetype);
    }

    // Filter by context
    if (this.config.enableContextMatching) {
      components = this.filterByContext(components, context);
    }

    // Filter by workflow
    if (this.config.enableWorkflowAlignment) {
      components = this.filterByWorkflow(components, workflow);
    }

    // Identify primary and secondary components
    const primaryComponent = components.length > 0 ? components[0] ?? null : null;
    const secondaryComponents = components.slice(1);

    // Generate reasoning
    const reasoning = this.generateReasoning(criteria, components);

    const result: SelectionResult = {
      components,
      primaryComponent,
      secondaryComponents,
      reasoning,
    };

    logger.info('DomainComponentSelector', 'COMPONENTS_SELECTED', 'Components selected', {
      domain,
      archetype: archetype.id,
      componentCount: components.length,
    });

    return result;
  }

  /**
   * Filter components by archetype
   */
  private filterByArchetype(components: ComponentDefinition[], archetype: ArchetypeDefinition): ComponentDefinition[] {
    return components.filter(component => {
      const lowerName = component.name.toLowerCase();
      const lowerDesc = component.description.toLowerCase();

      // Check if component matches archetype preferences
      const matchesPreferred = archetype.preferredWidgets.some(pref =>
        lowerName.includes(pref.toLowerCase()) || lowerDesc.includes(pref.toLowerCase())
      );

      return matchesPreferred;
    });
  }

  /**
   * Filter components by context
   */
  private filterByContext(components: ComponentDefinition[], context: string): ComponentDefinition[] {
    const lowerContext = context.toLowerCase();

    return components.filter(component => {
      const lowerName = component.name.toLowerCase();
      const lowerDesc = component.description.toLowerCase();

      return lowerName.includes(lowerContext) || lowerDesc.includes(lowerContext);
    });
  }

  /**
   * Filter components by workflow
   */
  private filterByWorkflow(components: ComponentDefinition[], workflow: string): ComponentDefinition[] {
    const lowerWorkflow = workflow.toLowerCase();

    return components.filter(component => {
      const lowerName = component.name.toLowerCase();
      const lowerDesc = component.description.toLowerCase();

      // Check if component aligns with workflow
      if (lowerWorkflow.includes('monitor') && (lowerName.includes('alert') || lowerName.includes('status'))) {
        return true;
      }

      if (lowerWorkflow.includes('analyze') && (lowerName.includes('chart') || lowerName.includes('graph'))) {
        return true;
      }

      if (lowerWorkflow.includes('collaborate') && (lowerName.includes('feed') || lowerName.includes('chat'))) {
        return true;
      }

      if (lowerWorkflow.includes('schedule') && (lowerName.includes('calendar') || lowerName.includes('timeline'))) {
        return true;
      }

      return false;
    });
  }

  /**
   * Generate reasoning for selection
   */
  private generateReasoning(criteria: SelectionCriteria, components: ComponentDefinition[]): string {
    const parts: string[] = [];

    parts.push(`selected ${components.length} components for ${criteria.domain}`);

    if (this.config.enableAutoSelection) {
      parts.push('filtered by archetype preferences');
    }

    if (this.config.enableContextMatching) {
      parts.push('matched to context');
    }

    if (this.config.enableWorkflowAlignment) {
      parts.push('aligned with workflow');
    }

    return parts.join(', ');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DomainComponentSelectorConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('DomainComponentSelector', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): DomainComponentSelectorConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: DomainComponentSelectorConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const domainComponentSelector = new DomainComponentSelector();

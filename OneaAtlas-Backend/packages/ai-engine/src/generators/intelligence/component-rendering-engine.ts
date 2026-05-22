/**
 * Component Rendering Engine
 * 
 * Applies component intelligence to generated output.
 * Connects component intelligence to rendering pipeline.
 */

import type {
  EntitySchema,
  GeneratedFile,
} from '@oneatlas/shared';

import { logger } from '../../shared/utils/logger';

import {
  componentIntelligenceEngine,
  domainComponentSelector,
  contextualWidgetGenerator,
  interactionPatternEngine,
} from '../../product/component';

import {
  ArchetypeDefinition,
} from '../../product/archetype/archetype-registry';

export interface ComponentRendering {
  components: any[];
  widgets: any[];
  interactions: any[];
}

export interface ComponentRenderingConfig {
  enableComponentSelection: boolean;
  enableWidgetGeneration: boolean;
  enableInteractionPatterns: boolean;
  enableContextualRendering: boolean;
}

const DEFAULT_CONFIG: ComponentRenderingConfig = {
  enableComponentSelection: true,
  enableWidgetGeneration: true,
  enableInteractionPatterns: true,
  enableContextualRendering: true,
};

/**
 * Component Rendering Engine
 * 
 * Applies component intelligence to generated output:
 * - Component selection
 * - Widget generation
 * - Interaction patterns
 * - Contextual rendering
 */
export class ComponentRenderingEngine {
  private config: ComponentRenderingConfig;

  constructor(config: Partial<ComponentRenderingConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Apply component rendering to generated files
   */
  applyComponentRendering(files: GeneratedFile[], domain: string, archetype: ArchetypeDefinition): GeneratedFile[] {
    const rendering: ComponentRendering = {
      components: this.config.enableComponentSelection ? componentIntelligenceEngine.selectComponents(domain, archetype) : [],
      widgets: this.config.enableWidgetGeneration ? this.generateContextualWidgets(domain, archetype) : [],
      interactions: this.config.enableInteractionPatterns ? interactionPatternEngine.generatePatterns(domain, archetype) : [],
    };

    const enhancedFiles = files.map(file => ({
      ...file,
      content: this.enhanceContentWithComponents(file.content, rendering, domain, archetype),
    }));

    logger.info('ComponentRenderingEngine', 'COMPONENTS_RENDERED', 'Component rendering applied to files', {
      fileCount: files.length,
      domain,
      archetype: archetype.id,
      componentCount: rendering.components.length,
      widgetCount: rendering.widgets.length,
    });

    return enhancedFiles;
  }

  /**
   * Generate contextual widgets
   */
  private generateContextualWidgets(domain: string, archetype: ArchetypeDefinition): any[] {
    const widgets: any[] = [];

    const components = componentIntelligenceEngine.selectComponents(domain, archetype);
    
    for (const component of components.slice(0, 5)) {
      const widget = contextualWidgetGenerator.generateWidget(component, archetype);
      widgets.push(widget);
    }

    return widgets;
  }

  /**
   * Enhance content with components
   */
  private enhanceContentWithComponents(content: string, rendering: ComponentRendering, domain: string, archetype: ArchetypeDefinition): string {
    let enhanced = content;

    // Replace generic component placeholders with domain-specific components
    enhanced = this.replaceComponentPlaceholders(enhanced, rendering.components, domain);

    // Add domain-specific widgets
    if (rendering.widgets.length > 0) {
      enhanced = this.addWidgetComponents(enhanced, rendering.widgets, archetype);
    }

    // Add interaction patterns
    if (rendering.interactions.length > 0) {
      enhanced = this.addInteractionPatterns(enhanced, rendering.interactions, archetype);
    }

    // Add contextual rendering attributes
    if (this.config.enableContextualRendering) {
      enhanced = this.addContextualAttributes(enhanced, domain, archetype);
    }

    return enhanced;
  }

  /**
   * Replace component placeholders
   */
  private replaceComponentPlaceholders(content: string, components: any[], domain: string): string {
    let enhanced = content;

    // Replace generic component names with domain-specific components
    const genericComponents = ['Card', 'Button', 'Input', 'Table', 'Chart'];
    
    for (const genericComponent of genericComponents) {
      const domainComponent = components.find(c => c.type.toLowerCase().includes(genericComponent.toLowerCase()));
      if (domainComponent) {
        enhanced = enhanced.replace(new RegExp(`<${genericComponent}`, 'gi'), `<${domainComponent.name}`);
        enhanced = enhanced.replace(new RegExp(`</${genericComponent}>`, 'gi'), `</${domainComponent.name}>`);
      }
    }

    return enhanced;
  }

  /**
   * Add widget components
   */
  private addWidgetComponents(content: string, widgets: any[], archetype: ArchetypeDefinition): string {
    let enhanced = content;

    // Add widget components section
    const widgetComponents = widgets.map(widget => `
      <${widget.type}
        id="${widget.id}"
        title="${widget.title}"
        description="${widget.description}"
        props={${JSON.stringify(widget.props)}}
        layout={${JSON.stringify(widget.layout)}}
      />
    `).join('');

    enhanced = enhanced.replace(/<!-- widgets -->/gi, `
      <div className="widget-grid" data-archetype="${archetype.id}">
        ${widgetComponents}
      </div>
    `);

    return enhanced;
  }

  /**
   * Add interaction patterns
   */
  private addInteractionPatterns(content: string, interactions: any[], archetype: ArchetypeDefinition): string {
    let enhanced = content;

    // Add interaction data attributes
    for (const interaction of interactions) {
      enhanced = enhanced.replace(
        new RegExp(`<${interaction.trigger}`, 'gi'),
        `<${interaction.trigger} data-interaction="${interaction.type}" data-action="${interaction.action}" data-feedback="${interaction.feedback}"`
      );
    }

    return enhanced;
  }

  /**
   * Add contextual attributes
   */
  private addContextualAttributes(content: string, domain: string, archetype: ArchetypeDefinition): string {
    let enhanced = content;

    // Add domain and archetype data attributes to main container
    enhanced = enhanced.replace(/className="([^"]*)container([^"]*)"/gi, (match, prefix, suffix) => {
      return `className="${prefix}container${suffix}" data-domain="${domain}" data-archetype="${archetype.id}" data-workflow="${archetype.workflowEmphasis}"`;
    });

    // Add density attribute
    enhanced = enhanced.replace(/className="([^"]*)"/gi, (match, className) => {
      if (!match.includes('data-density')) {
        return `${match} data-density="${archetype.layoutDensity}"`;
      }
      return match;
    });

    return enhanced;
  }

  /**
   * Generate domain-specific component library
   */
  generateComponentLibrary(domain: string, archetype: ArchetypeDefinition): string {
    const components = componentIntelligenceEngine.selectComponents(domain, archetype);
    const widgets = this.generateContextualWidgets(domain, archetype);
    const interactions = interactionPatternEngine.generatePatterns(domain, archetype);

    return `
'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Domain-specific components for ${domain}
export const ${domain.charAt(0).toUpperCase() + domain.slice(1)}Components = {
  ${components.map(component => `
  ${component.name}: ({ children, ...props }) => (
    <Card className="domain-component ${component.type}" data-component="${component.id}" {...props}>
      {children}
    </Card>
  ),
  `).join('\n  ')}

  // Widgets
  ${widgets.map(widget => `
  ${widget.title.replace(/\s+/g, '')}: (props) => (
    <div className="widget ${widget.type}" data-widget="${widget.id}" style={{ width: ${widget.layout.width}px, height: ${widget.layout.height}px }}>
      <h3>${widget.title}</h3>
      <p>${widget.description}</p>
    </div>
  ),
  `).join('\n  ')}

  // Interaction patterns
  ${interactions.map(interaction => `
  ${interaction.name}: ({ children, ...props }) => (
    <div
      data-interaction="${interaction.type}"
      data-action="${interaction.action}"
      data-feedback="${interaction.feedback}"
      {...props}
    >
      {children}
    </div>
  ),
  `).join('\n  ')}
};

export default ${domain.charAt(0).toUpperCase() + domain.slice(1)}Components;
`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ComponentRenderingConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ComponentRenderingEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ComponentRenderingConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: ComponentRenderingConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const componentRenderingEngine = new ComponentRenderingEngine();

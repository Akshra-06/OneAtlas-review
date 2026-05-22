/**
 * Contextual Widget Generator
 * 
 * Generates contextual widgets based on domain and context.
 * Creates domain-specific widget configurations.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';
import { ComponentDefinition } from './component-intelligence-engine';

export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  description: string;
  props: Record<string, unknown>;
  layout: {
    width: number;
    height: number;
    position: string;
  };
}

export interface WidgetGeneratorConfig {
  enableAutoGeneration: boolean;
  enableContextAwareness: boolean;
  enableResponsiveLayout: boolean;
}

const DEFAULT_CONFIG: WidgetGeneratorConfig = {
  enableAutoGeneration: true,
  enableContextAwareness: true,
  enableResponsiveLayout: true,
};

/**
 * Contextual Widget Generator
 * 
 * Generates contextual widgets:
 * - Widget configuration
 * - Context-aware generation
 * - Responsive layout
 * - Domain-specific widgets
 */
export class ContextualWidgetGenerator {
  private config: WidgetGeneratorConfig;

  constructor(config: Partial<WidgetGeneratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate widget from component
   */
  generateWidget(component: ComponentDefinition, archetype: ArchetypeDefinition, context?: string): WidgetConfig {
    const widget: WidgetConfig = {
      id: crypto.randomUUID(),
      type: component.type,
      title: component.name,
      description: component.description,
      props: this.generateProps(component, archetype, context),
      layout: this.generateLayout(component, archetype),
    };

    logger.info('ContextualWidgetGenerator', 'WIDGET_GENERATED', 'Widget generated', {
      componentId: component.id,
      widgetType: widget.type,
    });

    return widget;
  }

  /**
   * Generate props for widget
   */
  private generateProps(component: ComponentDefinition, archetype: ArchetypeDefinition, context?: string): Record<string, unknown> {
    const props: Record<string, unknown> = { ...component.props };

    // Add context-aware props
    if (this.config.enableContextAwareness && context) {
      props.context = context;
    }

    // Add archetype-specific props
    props.theme = archetype.colorPalette;
    props.typography = archetype.typography;
    props.spacing = archetype.spacing;

    return props;
  }

  /**
   * Generate layout for widget
   */
  private generateLayout(component: ComponentDefinition, archetype: ArchetypeDefinition): WidgetConfig['layout'] {
    const layout: WidgetConfig['layout'] = {
      width: this.calculateWidth(component, archetype),
      height: this.calculateHeight(component, archetype),
      position: 'relative',
    };

    return layout;
  }

  /**
   * Calculate widget width
   */
  private calculateWidth(component: ComponentDefinition, archetype: ArchetypeDefinition): number {
    if (!this.config.enableResponsiveLayout) {
      return 12;
    }

    // Adjust width based on archetype density
    switch (archetype.layoutDensity) {
      case 'dense':
        return 6;
      case 'compact':
        return 8;
      case 'comfortable':
        return 10;
      case 'spacious':
        return 12;
      default:
        return 12;
    }
  }

  /**
   * Calculate widget height
   */
  private calculateHeight(component: ComponentDefinition, archetype: ArchetypeDefinition): number {
    if (!this.config.enableResponsiveLayout) {
      return 400;
    }

    // Adjust height based on component type
    switch (component.type) {
      case 'chart':
      case 'graph':
        return 400;
      case 'timeline':
      case 'calendar':
        return 500;
      case 'table':
        return 600;
      case 'feed':
        return 450;
      default:
        return 350;
    }
  }

  /**
   * Generate widgets from components
   */
  generateWidgets(components: ComponentDefinition[], archetype: ArchetypeDefinition, context?: string): WidgetConfig[] {
    const widgets: WidgetConfig[] = [];

    for (const component of components) {
      const widget = this.generateWidget(component, archetype, context);
      widgets.push(widget);
    }

    logger.info('ContextualWidgetGenerator', 'WIDGETS_GENERATED', 'Widgets generated', {
      componentCount: components.length,
      widgetCount: widgets.length,
    });

    return widgets;
  }

  /**
   * Generate contextual widget
   */
  generateContextualWidget(context: string, archetype: ArchetypeDefinition): WidgetConfig {
    const widget: WidgetConfig = {
      id: crypto.randomUUID(),
      type: 'custom',
      title: this.formatTitle(context),
      description: `Contextual widget for ${context}`,
      props: {
        context,
        theme: archetype.colorPalette,
        typography: archetype.typography,
        spacing: archetype.spacing,
      },
      layout: {
        width: this.calculateWidth({ type: 'custom' } as ComponentDefinition, archetype),
        height: this.calculateHeight({ type: 'custom' } as ComponentDefinition, archetype),
        position: 'relative',
      },
    };

    logger.info('ContextualWidgetGenerator', 'CONTEXTUAL_WIDGET_GENERATED', 'Contextual widget generated', {
      context,
    });

    return widget;
  }

  /**
   * Format title from context
   */
  private formatTitle(context: string): string {
    return context
      .split(/[_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<WidgetGeneratorConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ContextualWidgetGenerator', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): WidgetGeneratorConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: WidgetGeneratorConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const contextualWidgetGenerator = new ContextualWidgetGenerator();

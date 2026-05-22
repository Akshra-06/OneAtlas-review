/**
 * Prompt-Aware Dashboard Generator
 * 
 * Generates context-aware dashboards from prompts.
 * Uses domain knowledge to create relevant UI components.
 */

import { logger } from '../../shared/utils/logger';
import { domainClassifier } from '../classification/domain-classifier';
import { domainKnowledgeBase } from '../knowledge/domain-knowledge-base';

export interface DashboardComponent {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'list' | 'card' | 'form' | 'filter';
  title: string;
  description: string;
  data: string;
  config: Record<string, unknown>;
  priority: number;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  components: DashboardComponent[];
  layout: 'grid' | 'sidebar' | 'tabs' | 'stacked';
  responsive: boolean;
}

export interface DashboardGenerationResult {
  dashboard: DashboardLayout;
  domain: string;
  confidence: number;
  components: DashboardComponent[];
  recommendations: string[];
}

export interface DashboardConfig {
  enableAutoLayout: boolean;
  maxComponents: number;
  defaultLayout: DashboardLayout['layout'];
}

const DEFAULT_CONFIG: DashboardConfig = {
  enableAutoLayout: true,
  maxComponents: 8,
  defaultLayout: 'grid',
};

/**
 * Prompt-Aware Dashboard Generator
 * 
 * Generates context-aware dashboards:
 * - Domain-specific components
 * - Contextual layout selection
 * - Relevant metrics and charts
 * - Intelligent component placement
 */
export class PromptAwareDashboardGenerator {
  private config: DashboardConfig;
  private generationHistory: Map<string, DashboardGenerationResult> = new Map();

  constructor(config: Partial<DashboardConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate dashboard from prompt
   */
  generate(prompt: string): DashboardGenerationResult {
    // Classify domain
    const classification = domainClassifier.classify(prompt);

    // Get domain knowledge
    const knowledge = domainKnowledgeBase.getKnowledge(classification.domain);

    // Generate components based on domain and prompt
    const components = this.generateComponents(prompt, classification.domain, knowledge);

    // Select layout
    const layout = this.selectLayout(components, classification.domain);

    // Generate recommendations
    const recommendations = this.generateRecommendations(classification.domain, knowledge);

    const dashboard: DashboardLayout = {
      id: crypto.randomUUID(),
      name: `${classification.domain.charAt(0).toUpperCase() + classification.domain.slice(1)} Dashboard`,
      description: `Dashboard for ${classification.domain}`,
      components,
      layout: layout,
      responsive: true,
    };

    const result: DashboardGenerationResult = {
      dashboard,
      domain: classification.domain,
      confidence: classification.confidence,
      components,
      recommendations,
    };

    // Store generation history
    this.generationHistory.set(prompt, result);

    logger.info('PromptAwareDashboardGenerator', 'DASHBOARD_GENERATED', 'Dashboard generated', {
      domain: classification.domain,
      components: components.length,
      layout,
      confidence: classification.confidence,
    });

    return result;
  }

  /**
   * Generate components based on domain and prompt
   */
  private generateComponents(
    prompt: string,
    domain: string,
    knowledge?: import('../knowledge/domain-knowledge-base').DomainKnowledge,
  ): DashboardComponent[] {
    const components: DashboardComponent[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // Generate domain-specific components
    if (knowledge) {
      // Add metric components for common metrics
      for (const metric of knowledge.commonMetrics.slice(0, 3)) {
        components.push({
          id: crypto.randomUUID(),
          type: 'metric',
          title: metric,
          description: `Display ${metric.toLowerCase()}`,
          data: metric,
          config: { showTrend: true, showComparison: true },
          priority: 1,
        });
      }

      // Add chart components
      if (lowerPrompt.includes('chart') || lowerPrompt.includes('graph') || lowerPrompt.includes('visualize')) {
        components.push({
          id: crypto.randomUUID(),
          type: 'chart',
          title: `${knowledge.domain.charAt(0).toUpperCase() + knowledge.domain.slice(1)} Trends`,
          description: 'Visualize trends over time',
          data: 'trends',
          config: { chartType: 'line', showLegend: true },
          priority: 2,
        });
      }

      // Add table components for data entities
      if (knowledge && knowledge.commonEntities.length > 0) {
        const firstEntity = knowledge.commonEntities[0];
        if (firstEntity) {
          components.push({
            id: crypto.randomUUID(),
            type: 'table',
            title: `${firstEntity} List`,
            description: `List of ${firstEntity.toLowerCase()}`,
            data: firstEntity,
            config: { sortable: true, filterable: true, paginated: true },
            priority: 3,
          });
        }
      }

      // Add filter components
      components.push({
        id: crypto.randomUUID(),
        type: 'filter',
        title: 'Filters',
        description: 'Filter dashboard data',
        data: 'filters',
        config: { collapsible: true },
        priority: 4,
      });
    }

    // Add generic components if no domain knowledge
    if (components.length === 0) {
      components.push({
        id: crypto.randomUUID(),
        type: 'metric',
        title: 'Total Items',
        description: 'Display total count',
        data: 'total',
        config: { showTrend: true },
        priority: 1,
      });

      components.push({
        id: crypto.randomUUID(),
        type: 'chart',
        title: 'Overview',
        description: 'Data overview chart',
        data: 'overview',
        config: { chartType: 'bar' },
        priority: 2,
      });
    }

    // Sort by priority and limit
    return components
      .sort((a, b) => a.priority - b.priority)
      .slice(0, this.config.maxComponents);
  }

  /**
   * Select layout based on components and domain
   */
  private selectLayout(components: DashboardComponent[], domain: string): DashboardLayout['layout'] {
    if (!this.config.enableAutoLayout) {
      return this.config.defaultLayout;
    }

    // Select layout based on component types and count
    const chartCount = components.filter(c => c.type === 'chart').length;
    const metricCount = components.filter(c => c.type === 'metric').length;
    const tableCount = components.filter(c => c.type === 'table').length;

    // Grid layout for balanced mix
    if (chartCount > 0 && metricCount > 0 && tableCount > 0) {
      return 'grid';
    }

    // Sidebar layout for table-heavy dashboards
    if (tableCount > 1) {
      return 'sidebar';
    }

    // Tabs layout for many similar components
    if (components.length > 6) {
      return 'tabs';
    }

    // Default to grid
    return 'grid';
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    domain: string,
    knowledge?: import('../knowledge/domain-knowledge-base').DomainKnowledge,
  ): string[] {
    const recommendations: string[] = [];

    if (knowledge) {
      // Add best practices as recommendations
      recommendations.push(...knowledge.bestPractices.slice(0, 3));

      // Add UI pattern recommendations
      recommendations.push(...knowledge.uiPatterns.slice(0, 2));
    }

    // Add generic recommendations
    recommendations.push('Enable real-time data updates for better user experience');
    recommendations.push('Implement responsive design for mobile compatibility');
    recommendations.push('Add data export functionality for reports');

    return recommendations;
  }

  /**
   * Customize dashboard
   */
  customizeDashboard(
    dashboardId: string,
    customizations: Partial<DashboardLayout>,
  ): DashboardLayout | undefined {
    // Find dashboard in history
    for (const result of this.generationHistory.values()) {
      if (result.dashboard.id === dashboardId) {
        const customized: DashboardLayout = {
          ...result.dashboard,
          ...customizations,
        };

        logger.info('PromptAwareDashboardGenerator', 'DASHBOARD_CUSTOMIZED', 'Dashboard customized', {
          dashboardId,
        });

        return customized;
      }
    }

    return undefined;
  }

  /**
   * Add custom component
   */
  addComponent(
    dashboardId: string,
    component: DashboardComponent,
  ): DashboardLayout | undefined {
    // Find dashboard in history
    for (const result of this.generationHistory.values()) {
      if (result.dashboard.id === dashboardId) {
        const updated: DashboardLayout = {
          ...result.dashboard,
          components: [...result.dashboard.components, component],
        };

        logger.info('PromptAwareDashboardGenerator', 'COMPONENT_ADDED', 'Component added to dashboard', {
          dashboardId,
          componentType: component.type,
        });

        return updated;
      }
    }

    return undefined;
  }

  /**
   * Remove component
   */
  removeComponent(dashboardId: string, componentId: string): DashboardLayout | undefined {
    // Find dashboard in history
    for (const result of this.generationHistory.values()) {
      if (result.dashboard.id === dashboardId) {
        const updated: DashboardLayout = {
          ...result.dashboard,
          components: result.dashboard.components.filter(c => c.id !== componentId),
        };

        logger.info('PromptAwareDashboardGenerator', 'COMPONENT_REMOVED', 'Component removed from dashboard', {
          dashboardId,
          componentId,
        });

        return updated;
      }
    }

    return undefined;
  }

  /**
   * Get generation history
   */
  getGenerationHistory(prompt?: string): DashboardGenerationResult | Map<string, DashboardGenerationResult> | undefined {
    if (prompt) {
      return this.generationHistory.get(prompt);
    }
    return this.generationHistory;
  }

  /**
   * Clear generation history
   */
  clearHistory(): void {
    this.generationHistory.clear();

    logger.info('PromptAwareDashboardGenerator', 'HISTORY_CLEARED', 'Generation history cleared');
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalGenerations: number;
    domainDistribution: Record<string, number>;
    averageComponents: number;
    layoutDistribution: Record<string, number>;
  } {
    const history = Array.from(this.generationHistory.values());
    const domainDistribution: Record<string, number> = {};
    const layoutDistribution: Record<string, number> = {};

    for (const result of history) {
      domainDistribution[result.domain] = (domainDistribution[result.domain] || 0) + 1;
      layoutDistribution[result.dashboard.layout] = (layoutDistribution[result.dashboard.layout] || 0) + 1;
    }

    const averageComponents = history.length > 0
      ? history.reduce((sum, r) => sum + r.components.length, 0) / history.length
      : 0;

    return {
      totalGenerations: history.length,
      domainDistribution,
      averageComponents,
      layoutDistribution,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DashboardConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('PromptAwareDashboardGenerator', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): DashboardConfig {
    return { ...this.config };
  }
}

export const promptAwareDashboardGenerator = new PromptAwareDashboardGenerator();

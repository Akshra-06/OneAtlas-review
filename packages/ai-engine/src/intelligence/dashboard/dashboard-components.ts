/**
 * Dashboard Components Library
 * 
 * Domain-specific widgets and components.
 * Provides reusable UI components for dashboards.
 */

import { logger } from '../../shared/utils/logger';

export interface WidgetTemplate {
  id: string;
  name: string;
  description: string;
  domain: string;
  type: 'chart' | 'metric' | 'table' | 'list' | 'card' | 'form' | 'filter' | 'calendar' | 'timeline';
  config: Record<string, unknown>;
  dataRequirements: string[];
  styling: Record<string, unknown>;
}

export interface ComponentConfig {
  enableCustomization: boolean;
  defaultTheme: 'light' | 'dark';
}

const DEFAULT_CONFIG: ComponentConfig = {
  enableCustomization: true,
  defaultTheme: 'light',
};

/**
 * Dashboard Components Library
 * 
 * Provides domain-specific widgets:
 * - E-commerce widgets
 * - Healthcare widgets
 * - Finance widgets
 * - Project management widgets
 * - CRM widgets
 * - Analytics widgets
 */
export class DashboardComponentsLibrary {
  private config: ComponentConfig;
  private widgets: Map<string, WidgetTemplate> = new Map();

  constructor(config: Partial<ComponentConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeWidgets();
  }

  /**
   * Initialize widget templates
   */
  private initializeWidgets(): void {
    // E-commerce widgets
    this.widgets.set('ecommerce_sales_chart', {
      id: 'ecommerce_sales_chart',
      name: 'Sales Chart',
      description: 'Display sales trends over time',
      domain: 'ecommerce',
      type: 'chart',
      config: { chartType: 'line', showLegend: true, showTooltip: true },
      dataRequirements: ['sales_data', 'time_period'],
      styling: { primaryColor: '#3b82f6', secondaryColor: '#10b981' },
    });

    this.widgets.set('ecommerce_product_grid', {
      id: 'ecommerce_product_grid',
      name: 'Product Grid',
      description: 'Display products in a grid layout',
      domain: 'ecommerce',
      type: 'card',
      config: { columns: 4, showImage: true, showPrice: true, showRating: true },
      dataRequirements: ['products'],
      styling: { cardStyle: 'modern', hoverEffect: true },
    });

    this.widgets.set('ecommerce_cart_summary', {
      id: 'ecommerce_cart_summary',
      name: 'Cart Summary',
      description: 'Display shopping cart summary',
      domain: 'ecommerce',
      type: 'metric',
      config: { showItems: true, showTotal: true, showCheckout: true },
      dataRequirements: ['cart'],
      styling: { compact: true },
    });

    // Healthcare widgets
    this.widgets.set('healthcare_patient_list', {
      id: 'healthcare_patient_list',
      name: 'Patient List',
      description: 'Display list of patients',
      domain: 'healthcare',
      type: 'table',
      config: { sortable: true, filterable: true, searchable: true },
      dataRequirements: ['patients'],
      styling: { rowHighlight: true },
    });

    this.widgets.set('healthcare_appointment_calendar', {
      id: 'healthcare_appointment_calendar',
      name: 'Appointment Calendar',
      description: 'Display appointment calendar',
      domain: 'healthcare',
      type: 'calendar',
      config: { showDetails: true, allowBooking: true },
      dataRequirements: ['appointments'],
      styling: { colorCode: 'status' },
    });

    this.widgets.set('healthcare_vitals_chart', {
      id: 'healthcare_vitals_chart',
      name: 'Vitals Chart',
      description: 'Display patient vital signs',
      domain: 'healthcare',
      type: 'chart',
      config: { chartType: 'line', multiAxis: true },
      dataRequirements: ['vitals'],
      styling: { alertThresholds: true },
    });

    // Finance widgets
    this.widgets.set('finance_account_balance', {
      id: 'finance_account_balance',
      name: 'Account Balance',
      description: 'Display account balance',
      domain: 'finance',
      type: 'metric',
      config: { showTrend: true, showComparison: true },
      dataRequirements: ['account_balance'],
      styling: { format: 'currency' },
    });

    this.widgets.set('finance_transaction_table', {
      id: 'finance_transaction_table',
      name: 'Transaction Table',
      description: 'Display transaction history',
      domain: 'finance',
      type: 'table',
      config: { sortable: true, filterable: true, exportable: true },
      dataRequirements: ['transactions'],
      styling: { colorCode: 'type' },
    });

    this.widgets.set('finance_budget_progress', {
      id: 'finance_budget_progress',
      name: 'Budget Progress',
      description: 'Display budget vs actual spending',
      domain: 'finance',
      type: 'chart',
      config: { chartType: 'bar', showTarget: true },
      dataRequirements: ['budget', 'spending'],
      styling: { alertThreshold: 0.9 },
    });

    // Project management widgets
    this.widgets.set('project_kanban', {
      id: 'project_kanban',
      name: 'Kanban Board',
      description: 'Display tasks in kanban columns',
      domain: 'project_management',
      type: 'list',
      config: { draggable: true, columns: ['todo', 'in_progress', 'done'] },
      dataRequirements: ['tasks'],
      styling: { cardStyle: 'minimal' },
    });

    this.widgets.set('project_gantt', {
      id: 'project_gantt',
      name: 'Gantt Chart',
      description: 'Display project timeline',
      domain: 'project_management',
      type: 'chart',
      config: { chartType: 'gantt', showDependencies: true },
      dataRequirements: ['tasks', 'milestones'],
      styling: { colorCode: 'assignee' },
    });

    this.widgets.set('project_team_workload', {
      id: 'project_team_workload',
      name: 'Team Workload',
      description: 'Display team member workload',
      domain: 'project_management',
      type: 'chart',
      config: { chartType: 'bar', horizontal: true },
      dataRequirements: ['team', 'tasks'],
      styling: { alertThreshold: 1.0 },
    });

    // CRM widgets
    this.widgets.set('crm_pipeline', {
      id: 'crm_pipeline',
      name: 'Sales Pipeline',
      description: 'Display sales pipeline stages',
      domain: 'crm',
      type: 'chart',
      config: { chartType: 'funnel', showValues: true },
      dataRequirements: ['pipeline', 'deals'],
      styling: { stageColors: true },
    });

    this.widgets.set('crm_lead_list', {
      id: 'crm_lead_list',
      name: 'Lead List',
      description: 'Display leads with scores',
      domain: 'crm',
      type: 'table',
      config: { sortable: true, filterable: true, showScore: true },
      dataRequirements: ['leads'],
      styling: { scoreHighlight: true },
    });

    this.widgets.set('crm_activity_timeline', {
      id: 'crm_activity_timeline',
      name: 'Activity Timeline',
      description: 'Display customer interactions',
      domain: 'crm',
      type: 'timeline',
      config: { showDetails: true, filterable: true },
      dataRequirements: ['activities'],
      styling: { iconPerType: true },
    });

    // Analytics widgets
    this.widgets.set('analytics_metric_card', {
      id: 'analytics_metric_card',
      name: 'Metric Card',
      description: 'Display key metric with trend',
      domain: 'analytics',
      type: 'metric',
      config: { showTrend: true, showComparison: true, showSparkline: true },
      dataRequirements: ['metric'],
      styling: { compact: false },
    });

    this.widgets.set('analytics_data_table', {
      id: 'analytics_data_table',
      name: 'Data Table',
      description: 'Display analytics data table',
      domain: 'analytics',
      type: 'table',
      config: { sortable: true, filterable: true, exportable: true },
      dataRequirements: ['data'],
      styling: { highlight: 'anomalies' },
    });

    this.widgets.set('analytics_trend_chart', {
      id: 'analytics_trend_chart',
      name: 'Trend Chart',
      description: 'Display data trends',
      domain: 'analytics',
      type: 'chart',
      config: { chartType: 'line', showAnnotations: true },
      dataRequirements: ['trends'],
      styling: { smooth: true },
    });

    logger.info('DashboardComponentsLibrary', 'WIDGETS_INITIALIZED', 'Widget templates initialized', {
      widgets: this.widgets.size,
    });
  }

  /**
   * Get widget by ID
   */
  getWidget(widgetId: string): WidgetTemplate | undefined {
    return this.widgets.get(widgetId);
  }

  /**
   * List all widgets
   */
  listWidgets(): WidgetTemplate[] {
    return Array.from(this.widgets.values());
  }

  /**
   * List widgets by domain
   */
  listWidgetsByDomain(domain: string): WidgetTemplate[] {
    return this.listWidgets().filter(w => w.domain === domain);
  }

  /**
   * List widgets by type
   */
  listWidgetsByType(type: WidgetTemplate['type']): WidgetTemplate[] {
    return this.listWidgets().filter(w => w.type === type);
  }

  /**
   * Add custom widget
   */
  addWidget(widget: WidgetTemplate): void {
    this.widgets.set(widget.id, widget);

    logger.info('DashboardComponentsLibrary', 'WIDGET_ADDED', 'Custom widget added', {
      widgetId: widget.id,
      widgetName: widget.name,
    });
  }

  /**
   * Remove widget
   */
  removeWidget(widgetId: string): boolean {
    const deleted = this.widgets.delete(widgetId);

    if (deleted) {
      logger.info('DashboardComponentsLibrary', 'WIDGET_REMOVED', 'Widget removed', {
        widgetId,
      });
    }

    return deleted;
  }

  /**
   * Customize widget
   */
  customizeWidget(widgetId: string, customizations: Partial<WidgetTemplate>): WidgetTemplate | undefined {
    const widget = this.widgets.get(widgetId);
    
    if (!widget || !this.config.enableCustomization) {
      return undefined;
    }

    const customized: WidgetTemplate = {
      ...widget,
      ...customizations,
      id: `${widgetId}_custom_${Date.now()}`,
    };

    this.widgets.set(customized.id, customized);

    logger.info('DashboardComponentsLibrary', 'WIDGET_CUSTOMIZED', 'Widget customized', {
      originalId: widgetId,
      customId: customized.id,
    });

    return customized;
  }

  /**
   * Get widget recommendations for domain
   */
  getRecommendations(domain: string): WidgetTemplate[] {
    const domainWidgets = this.listWidgetsByDomain(domain);
    const genericWidgets = this.listWidgetsByType('metric').slice(0, 2);
    
    return [...domainWidgets, ...genericWidgets];
  }

  /**
   * Validate widget data requirements
   */
  validateDataRequirements(widgetId: string, availableData: string[]): boolean {
    const widget = this.widgets.get(widgetId);
    
    if (!widget) {
      return false;
    }

    return widget.dataRequirements.every(req => availableData.includes(req));
  }

  /**
   * Get missing data requirements
   */
  getMissingDataRequirements(widgetId: string, availableData: string[]): string[] {
    const widget = this.widgets.get(widgetId);
    
    if (!widget) {
      return [];
    }

    return widget.dataRequirements.filter(req => !availableData.includes(req));
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ComponentConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('DashboardComponentsLibrary', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ComponentConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalWidgets: number;
    byDomain: Record<string, number>;
    byType: Record<string, number>;
  } {
    const widgets = this.listWidgets();
    const byDomain: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const widget of widgets) {
      byDomain[widget.domain] = (byDomain[widget.domain] || 0) + 1;
      byType[widget.type] = (byType[widget.type] || 0) + 1;
    }

    return {
      totalWidgets: widgets.length,
      byDomain,
      byType,
    };
  }
}

export const dashboardComponentsLibrary = new DashboardComponentsLibrary();

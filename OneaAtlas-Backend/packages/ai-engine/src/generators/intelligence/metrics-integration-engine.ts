/**
 * Metrics Integration Engine
 * 
 * Integrates semantic metrics into generated dashboards.
 * Replaces placeholder metrics with domain-specific metrics.
 */

import type {
  EntitySchema,
  GeneratedFile,
} from '@oneatlas/shared';

import { logger } from '../../shared/utils/logger';

import {
  semanticMetricsEngine,
  metricsInference,
  domainKPIGenerator,
  contextualStatistics,
} from '../../product/metrics';

import {
  ArchetypeDefinition,
} from '../../product/archetype/ui-archetype-engine';

export interface MetricsIntegration {
  metrics: any[];
  kpis: any[];
  statistics: any[];
  charts: any[];
}

export interface MetricsIntegrationConfig {
  enableSemanticMetrics: boolean;
  enableKPIGeneration: boolean;
  enableContextualStatistics: boolean;
  enableChartGeneration: boolean;
}

const DEFAULT_CONFIG: MetricsIntegrationConfig = {
  enableSemanticMetrics: true,
  enableKPIGeneration: true,
  enableContextualStatistics: true,
  enableChartGeneration: true,
};

/**
 * Metrics Integration Engine
 * 
 * Integrates metrics into generated output:
 * - Semantic metrics
 * - KPI generation
 * - Contextual statistics
 * - Chart generation
 */
export class MetricsIntegrationEngine {
  private config: MetricsIntegrationConfig;

  constructor(config: Partial<MetricsIntegrationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Integrate metrics into generated files
   */
  integrateMetrics(files: GeneratedFile[], domain: string, archetype: ArchetypeDefinition): GeneratedFile[] {
    const entities = Array.from(new Set(files.map(f => f.entityName).filter((name): name is string => !!name)));
    const metrics = this.config.enableSemanticMetrics ? semanticMetricsEngine.generateMetrics(domain, archetype) : [];
    const kpiResult = this.config.enableKPIGeneration ? domainKPIGenerator.generateKPIs({ domain, entities, workflows: [], archetype: archetype.id }) : null;
    const kpis = kpiResult ? kpiResult.kpis : [];
    const statistics = this.config.enableContextualStatistics ? contextualStatistics.generateStatistics(metrics) : [];
    const charts = this.config.enableChartGeneration ? this.generateDomainCharts(domain, archetype) : [];

    const integration: MetricsIntegration = {
      metrics,
      kpis,
      statistics,
      charts,
    };

    const enhancedFiles = files.map(file => ({
      ...file,
      content: this.enhanceContentWithMetrics(file.content, integration, domain, archetype),
    }));

    logger.info('MetricsIntegrationEngine', 'METRICS_INTEGRATED', 'Metrics integrated into files', {
      fileCount: files.length,
      domain,
      archetype: archetype.id,
      metricCount: integration.metrics.length,
      kpiCount: integration.kpis.length,
    });

    return enhancedFiles;
  }

  /**
   * Generate domain-specific charts
   */
  private generateDomainCharts(domain: string, archetype: ArchetypeDefinition): any[] {
    const charts: any[] = [];

    const domainCharts: Record<string, any[]> = {
      healthcare: [
        { type: 'line', metric: 'patient_admissions', title: 'Patient Admissions Over Time' },
        { type: 'bar', metric: 'appointment_status', title: 'Appointment Status Distribution' },
        { type: 'pie', metric: 'patient_demographics', title: 'Patient Demographics' },
      ],
      crm: [
        { type: 'funnel', metric: 'pipeline_conversion', title: 'Pipeline Conversion Rate' },
        { type: 'line', metric: 'deal_velocity', title: 'Deal Velocity Trend' },
        { type: 'bar', metric: 'lead_source', title: 'Lead Source Distribution' },
      ],
      ecommerce: [
        { type: 'line', metric: 'sales_revenue', title: 'Sales Revenue Trend' },
        { type: 'bar', metric: 'product_performance', title: 'Product Performance' },
        { type: 'pie', metric: 'order_status', title: 'Order Status Distribution' },
      ],
      analytics: [
        { type: 'line', metric: 'user_engagement', title: 'User Engagement Over Time' },
        { type: 'bar', metric: 'feature_usage', title: 'Feature Usage Distribution' },
        { type: 'heatmap', metric: 'activity_patterns', title: 'Activity Patterns' },
      ],
      logistics: [
        { type: 'map', metric: 'shipment_tracking', title: 'Shipment Tracking' },
        { type: 'line', metric: 'delivery_performance', title: 'Delivery Performance' },
        { type: 'bar', metric: 'carrier_performance', title: 'Carrier Performance' },
      ],
      finance: [
        { type: 'line', metric: 'cash_flow', title: 'Cash Flow Trend' },
        { type: 'pie', metric: 'expense_breakdown', title: 'Expense Breakdown' },
        { type: 'bar', metric: 'revenue_streams', title: 'Revenue Streams' },
      ],
      project_management: [
        { type: 'gantt', metric: 'project_timeline', title: 'Project Timeline' },
        { type: 'bar', metric: 'task_completion', title: 'Task Completion Rate' },
        { type: 'pie', metric: 'resource_allocation', title: 'Resource Allocation' },
      ],
      support: [
        { type: 'line', metric: 'ticket_volume', title: 'Ticket Volume Trend' },
        { type: 'bar', metric: 'resolution_time', title: 'Resolution Time Distribution' },
        { type: 'pie', metric: 'ticket_categories', title: 'Ticket Categories' },
      ],
    };

    return domainCharts[domain] || [
      { type: 'line', metric: 'activity_trend', title: 'Activity Trend' },
      { type: 'bar', metric: 'status_distribution', title: 'Status Distribution' },
    ];
  }

  /**
   * Enhance content with metrics
   */
  private enhanceContentWithMetrics(content: string, integration: MetricsIntegration, domain: string, archetype: ArchetypeDefinition): string {
    let enhanced = content;

    // Replace generic metric placeholders with domain-specific metrics
    enhanced = this.replaceMetricPlaceholders(enhanced, integration.metrics, domain);

    // Add KPI cards
    if (integration.kpis.length > 0) {
      enhanced = this.addKPICards(enhanced, integration.kpis, archetype);
    }

    // Add charts
    if (integration.charts.length > 0) {
      enhanced = this.addCharts(enhanced, integration.charts, archetype);
    }

    // Add statistics
    if (integration.statistics.length > 0) {
      enhanced = this.addStatistics(enhanced, integration.statistics, archetype);
    }

    return enhanced;
  }

  /**
   * Replace metric placeholders
   */
  private replaceMetricPlaceholders(content: string, metrics: any[], domain: string): string {
    let enhanced = content;

    // Replace generic metric names with domain-specific metrics
    const genericMetrics = ['Conversion', 'Health', 'New', 'Growth', 'Performance'];
    
    for (const genericMetric of genericMetrics) {
      const domainMetric = metrics.find(m => m.name.toLowerCase().includes(genericMetric.toLowerCase()));
      if (domainMetric) {
        enhanced = enhanced.replace(new RegExp(genericMetric, 'gi'), domainMetric.name);
      }
    }

    return enhanced;
  }

  /**
   * Add KPI cards
   */
  private addKPICards(content: string, kpis: any[], archetype: ArchetypeDefinition): string {
    let enhanced = content;

    // Add KPI cards section
    const kpiCards = kpis.slice(0, 4).map(kpi => `
      <div className="kpi-card" data-metric="${kpi.id}">
        <div className="kpi-label">${kpi.name}</div>
        <div className="kpi-value">${kpi.value}</div>
        <div className="kpi-trend ${kpi.trend >= 0 ? 'positive' : 'negative'}">
          ${kpi.trend >= 0 ? '↑' : '↓'} ${Math.abs(kpi.trend)}%
        </div>
      </div>
    `).join('');

    enhanced = enhanced.replace(/<!-- kpi-cards -->/gi, `
      <div className="kpi-grid" data-archetype="${archetype.id}">
        ${kpiCards}
      </div>
    `);

    return enhanced;
  }

  /**
   * Add charts
   */
  private addCharts(content: string, charts: any[], archetype: ArchetypeDefinition): string {
    let enhanced = content;

    // Add chart components
    const chartComponents = charts.map(chart => `
      <div className="chart-container" data-chart-type="${chart.type}" data-metric="${chart.metric}">
        <h3>${chart.title}</h3>
        <div className="chart-placeholder">
          <!-- ${chart.type} chart for ${chart.metric} -->
        </div>
      </div>
    `).join('');

    enhanced = enhanced.replace(/<!-- charts -->/gi, `
      <div className="charts-grid" data-archetype="${archetype.id}">
        ${chartComponents}
      </div>
    `);

    return enhanced;
  }

  /**
   * Add statistics
   */
  private addStatistics(content: string, statistics: any[], archetype: ArchetypeDefinition): string {
    let enhanced = content;

    // Add statistics section
    const statItems = statistics.map(stat => `
      <div className="stat-item" data-stat="${stat.id}">
        <div className="stat-label">${stat.name}</div>
        <div className="stat-value">${stat.value}</div>
        <div className="stat-context">${stat.context}</div>
      </div>
    `).join('');

    enhanced = enhanced.replace(/<!-- statistics -->/gi, `
      <div className="statistics-panel" data-archetype="${archetype.id}">
        ${statItems}
      </div>
    `);

    return enhanced;
  }

  /**
   * Generate metrics dashboard component
   */
  generateMetricsDashboard(domain: string, archetype: ArchetypeDefinition): string {
    const metrics = semanticMetricsEngine.generateMetrics(domain, archetype);
    const kpiResult = domainKPIGenerator.generateKPIs({ domain, entities: [], workflows: [], archetype: archetype.id });
    const kpis = kpiResult.kpis;
    const charts = this.generateDomainCharts(domain, archetype);

    return `
'use client';

import { Card } from '@/components/ui/card';

export default function MetricsDashboard() {
  return (
    <div className="metrics-dashboard" data-domain="${domain}" data-archetype="${archetype.id}">
      {/* KPI Cards */}
      <div className="kpi-grid">
        ${kpis.slice(0, 4).map((kpi, idx) => {
          const value = kpi.type === 'percentage' 
            ? `${85 + idx * 3}%` 
            : kpi.type === 'currency' 
            ? `$${(12500 - idx * 1500).toLocaleString()}` 
            : kpi.type === 'duration'
            ? `${15 + idx * 5}m`
            : `${1200 - idx * 150}`;
          const trend = idx % 2 === 0 ? 4.2 + idx : -1.5 - idx;
          return `
            <Card className="kpi-card">
              <div className="kpi-label">${kpi.name}</div>
              <div className="kpi-value">${value}</div>
              <div className="kpi-trend ${trend >= 0 ? 'positive' : 'negative'}">
                ${trend >= 0 ? '↑' : '↓'} ${Math.abs(trend).toFixed(1)}%
              </div>
            </Card>
          `;
        }).join('')}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        ${charts.map(chart => `
          <Card className="chart-card">
            <h3>${chart.title}</h3>
            <div className="chart-placeholder">
              {/* ${chart.type} chart for ${chart.metric} */}
            </div>
          </Card>
        `).join('')}
      </div>
    </div>
  );
}
`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MetricsIntegrationConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('MetricsIntegrationEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): MetricsIntegrationConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: MetricsIntegrationConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const metricsIntegrationEngine = new MetricsIntegrationEngine();

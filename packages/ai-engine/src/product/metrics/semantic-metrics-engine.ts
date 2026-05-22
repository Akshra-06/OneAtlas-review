/**
 * Semantic Metrics Engine
 * 
 * Generates domain-aware metrics automatically.
 * Creates semantic KPIs based on domain and archetype.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';

export interface MetricDefinition {
  id: string;
  name: string;
  description: string;
  domain: string;
  type: 'count' | 'percentage' | 'currency' | 'duration' | 'rate' | 'score';
  category: 'operational' | 'financial' | 'user' | 'performance' | 'quality';
  priority: number;
  formula?: string;
}

export interface MetricsEngineConfig {
  enableAutoGeneration: boolean;
  enableDomainInference: boolean;
  maxMetricsPerDomain: number;
}

const DEFAULT_CONFIG: MetricsEngineConfig = {
  enableAutoGeneration: true,
  enableDomainInference: true,
  maxMetricsPerDomain: 12,
};

/**
 * Semantic Metrics Engine
 * 
 * Generates domain-aware metrics:
 * - Domain-specific KPIs
 * - Semantic metric definitions
 * - Metric categorization
 * - Metric prioritization
 */
export class SemanticMetricsEngine {
  private config: MetricsEngineConfig;
  private domainMetrics: Map<string, MetricDefinition[]> = new Map();

  constructor(config: Partial<MetricsEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeDomainMetrics();
  }

  /**
   * Generate metrics for a domain
   */
  generateMetrics(domain: string, archetype?: ArchetypeDefinition): MetricDefinition[] {
    const lowerDomain = domain.toLowerCase();
    let metrics = this.domainMetrics.get(lowerDomain) || [];

    // Filter by archetype if provided
    if (archetype) {
      metrics = this.filterByArchetype(metrics, archetype);
    }

    // Limit to max metrics
    metrics = metrics.slice(0, this.config.maxMetricsPerDomain);

    logger.info('SemanticMetricsEngine', 'METRICS_GENERATED', 'Metrics generated', {
      domain,
      archetype: archetype?.id,
      metricCount: metrics.length,
    });

    return metrics;
  }

  /**
   * Filter metrics by archetype
   */
  private filterByArchetype(metrics: MetricDefinition[], archetype: ArchetypeDefinition): MetricDefinition[] {
    // Filter based on workflow emphasis
    switch (archetype.workflowEmphasis) {
      case 'data':
        return metrics.filter(m => m.category === 'performance' || m.category === 'quality');
      case 'tasks':
        return metrics.filter(m => m.category === 'operational');
      case 'monitoring':
        return metrics.filter(m => m.category === 'operational' || m.category === 'performance');
      case 'operations':
        return metrics.filter(m => m.category === 'operational' || m.category === 'financial');
      default:
        return metrics;
    }
  }

  /**
   * Initialize domain metrics
   */
  private initializeDomainMetrics(): void {
    // Healthcare metrics
    this.domainMetrics.set('healthcare', [
      {
        id: 'active_patients',
        name: 'Active Patients',
        description: 'Number of currently active patients',
        domain: 'healthcare',
        type: 'count',
        category: 'operational',
        priority: 1,
      },
      {
        id: 'appointments_today',
        name: 'Appointments Today',
        description: 'Number of scheduled appointments for today',
        domain: 'healthcare',
        type: 'count',
        category: 'operational',
        priority: 1,
      },
      {
        id: 'avg_wait_time',
        name: 'Average Wait Time',
        description: 'Average patient wait time in minutes',
        domain: 'healthcare',
        type: 'duration',
        category: 'performance',
        priority: 1,
      },
      {
        id: 'critical_alerts',
        name: 'Critical Alerts',
        description: 'Number of critical patient alerts',
        domain: 'healthcare',
        type: 'count',
        category: 'operational',
        priority: 1,
      },
      {
        id: 'treatment_completion_rate',
        name: 'Treatment Completion Rate',
        description: 'Percentage of completed treatments',
        domain: 'healthcare',
        type: 'percentage',
        category: 'quality',
        priority: 1,
      },
    ]);

    // ATS metrics
    this.domainMetrics.set('ats', [
      {
        id: 'candidates_screened',
        name: 'Candidates Screened',
        description: 'Number of candidates screened',
        domain: 'ats',
        type: 'count',
        category: 'operational',
        priority: 1,
      },
      {
        id: 'interview_conversion',
        name: 'Interview Conversion Rate',
        description: 'Percentage of candidates who convert from interview to offer',
        domain: 'ats',
        type: 'percentage',
        category: 'quality',
        priority: 1,
      },
      {
        id: 'hiring_velocity',
        name: 'Hiring Velocity',
        description: 'Average days to hire',
        domain: 'ats',
        type: 'duration',
        category: 'performance',
        priority: 1,
      },
      {
        id: 'recruiter_utilization',
        name: 'Recruiter Utilization',
        description: 'Percentage of recruiter capacity utilized',
        domain: 'ats',
        type: 'percentage',
        category: 'operational',
        priority: 1,
      },
    ]);

    // Ecommerce metrics
    this.domainMetrics.set('ecommerce', [
      {
        id: 'gmv',
        name: 'Gross Merchandise Value',
        description: 'Total value of merchandise sold',
        domain: 'ecommerce',
        type: 'currency',
        category: 'financial',
        priority: 1,
      },
      {
        id: 'conversion_rate',
        name: 'Conversion Rate',
        description: 'Percentage of visitors who make a purchase',
        domain: 'ecommerce',
        type: 'percentage',
        category: 'performance',
        priority: 1,
      },
      {
        id: 'aov',
        name: 'Average Order Value',
        description: 'Average value per order',
        domain: 'ecommerce',
        type: 'currency',
        category: 'financial',
        priority: 1,
      },
      {
        id: 'inventory_risk',
        name: 'Inventory Risk',
        description: 'Percentage of inventory at risk of stockout',
        domain: 'ecommerce',
        type: 'percentage',
        category: 'operational',
        priority: 1,
      },
    ]);

    // Analytics metrics
    this.domainMetrics.set('analytics', [
      {
        id: 'dau',
        name: 'Daily Active Users',
        description: 'Number of daily active users',
        domain: 'analytics',
        type: 'count',
        category: 'user',
        priority: 1,
      },
      {
        id: 'retention',
        name: 'Retention Rate',
        description: 'Percentage of users who return',
        domain: 'analytics',
        type: 'percentage',
        category: 'user',
        priority: 1,
      },
      {
        id: 'funnel_completion',
        name: 'Funnel Completion Rate',
        description: 'Percentage of users who complete the funnel',
        domain: 'analytics',
        type: 'percentage',
        category: 'performance',
        priority: 1,
      },
      {
        id: 'churn_risk',
        name: 'Churn Risk',
        description: 'Percentage of users at risk of churning',
        domain: 'analytics',
        type: 'percentage',
        category: 'user',
        priority: 1,
      },
    ]);

    // CRM metrics
    this.domainMetrics.set('crm', [
      {
        id: 'pipeline_value',
        name: 'Pipeline Value',
        description: 'Total value of deals in pipeline',
        domain: 'crm',
        type: 'currency',
        category: 'financial',
        priority: 1,
      },
      {
        id: 'lead_conversion',
        name: 'Lead Conversion Rate',
        description: 'Percentage of leads that convert to customers',
        domain: 'crm',
        type: 'percentage',
        category: 'quality',
        priority: 1,
      },
      {
        id: 'deal_velocity',
        name: 'Deal Velocity',
        description: 'Average days to close deals',
        domain: 'crm',
        type: 'duration',
        category: 'performance',
        priority: 1,
      },
      {
        id: 'activity_score',
        name: 'Activity Score',
        description: 'Score based on sales activities',
        domain: 'crm',
        type: 'score',
        category: 'operational',
        priority: 1,
      },
    ]);

    // Operations metrics
    this.domainMetrics.set('operations', [
      {
        id: 'incident_count',
        name: 'Incident Count',
        description: 'Number of active incidents',
        domain: 'operations',
        type: 'count',
        category: 'operational',
        priority: 1,
      },
      {
        id: 'mttr',
        name: 'Mean Time to Resolve',
        description: 'Average time to resolve incidents',
        domain: 'operations',
        type: 'duration',
        category: 'performance',
        priority: 1,
      },
      {
        id: 'uptime',
        name: 'System Uptime',
        description: 'Percentage of system uptime',
        domain: 'operations',
        type: 'percentage',
        category: 'performance',
        priority: 1,
      },
      {
        id: 'sla_compliance',
        name: 'SLA Compliance',
        description: 'Percentage of SLAs met',
        domain: 'operations',
        type: 'percentage',
        category: 'quality',
        priority: 1,
      },
    ]);

    // Finance metrics
    this.domainMetrics.set('finance', [
      {
        id: 'revenue',
        name: 'Revenue',
        description: 'Total revenue',
        domain: 'finance',
        type: 'currency',
        category: 'financial',
        priority: 1,
      },
      {
        id: 'profit_margin',
        name: 'Profit Margin',
        description: 'Percentage of profit margin',
        domain: 'finance',
        type: 'percentage',
        category: 'financial',
        priority: 1,
      },
      {
        id: 'cash_flow',
        name: 'Cash Flow',
        description: 'Net cash flow',
        domain: 'finance',
        type: 'currency',
        category: 'financial',
        priority: 1,
      },
      {
        id: 'budget_variance',
        name: 'Budget Variance',
        description: 'Percentage variance from budget',
        domain: 'finance',
        type: 'percentage',
        category: 'financial',
        priority: 1,
      },
    ]);

    // Support metrics
    this.domainMetrics.set('support', [
      {
        id: 'ticket_volume',
        name: 'Ticket Volume',
        description: 'Number of support tickets',
        domain: 'support',
        type: 'count',
        category: 'operational',
        priority: 1,
      },
      {
        id: 'response_time',
        name: 'Average Response Time',
        description: 'Average time to respond to tickets',
        domain: 'support',
        type: 'duration',
        category: 'performance',
        priority: 1,
      },
      {
        id: 'resolution_rate',
        name: 'Resolution Rate',
        description: 'Percentage of tickets resolved',
        domain: 'support',
        type: 'percentage',
        category: 'quality',
        priority: 1,
      },
      {
        id: 'csat',
        name: 'Customer Satisfaction Score',
        description: 'Average customer satisfaction score',
        domain: 'support',
        type: 'score',
        category: 'user',
        priority: 1,
      },
    ]);
  }

  /**
   * Get metrics for a domain
   */
  getDomainMetrics(domain: string): MetricDefinition[] {
    return this.domainMetrics.get(domain.toLowerCase()) || [];
  }

  /**
   * Add custom metrics for a domain
   */
  addDomainMetrics(domain: string, metrics: MetricDefinition[]): void {
    const lowerDomain = domain.toLowerCase();
    const existing = this.domainMetrics.get(lowerDomain) || [];
    this.domainMetrics.set(lowerDomain, [...existing, ...metrics]);

    logger.info('SemanticMetricsEngine', 'METRICS_ADDED', 'Custom metrics added', {
      domain,
      count: metrics.length,
    });
  }

  /**
   * Get metric by ID
   */
  getMetric(metricId: string): MetricDefinition | undefined {
    for (const metrics of this.domainMetrics.values()) {
      const metric = metrics.find(m => m.id === metricId);
      if (metric) {
        return metric;
      }
    }
    return undefined;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MetricsEngineConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('SemanticMetricsEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): MetricsEngineConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: MetricsEngineConfig;
    domainCount: number;
    totalMetrics: number;
  } {
    const domainCount = this.domainMetrics.size;
    const totalMetrics = Array.from(this.domainMetrics.values()).reduce(
      (sum, metrics) => sum + metrics.length,
      0
    );

    return {
      config: this.getConfig(),
      domainCount,
      totalMetrics,
    };
  }
}

export const semanticMetricsEngine = new SemanticMetricsEngine();

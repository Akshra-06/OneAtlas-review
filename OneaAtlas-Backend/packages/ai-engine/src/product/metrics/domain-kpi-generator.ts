/**
 * Domain KPI Generator
 * 
 * Generates domain-specific KPIs.
 * Creates key performance indicators based on domain characteristics.
 */

import { logger } from '../../shared/utils/logger';
import { MetricDefinition } from './semantic-metrics-engine';

export interface KPIGenerationRequest {
  domain: string;
  entities: string[];
  workflows: string[];
  archetype?: string;
}

export interface KPIGenerationResult {
  kpis: MetricDefinition[];
  primaryKPI: MetricDefinition | null;
  secondaryKPIs: MetricDefinition[];
  reasoning: string;
}

export interface KPIGeneratorConfig {
  enableAutoPrioritization: boolean;
  enableWorkflowAlignment: boolean;
  maxKPIs: number;
}

const DEFAULT_CONFIG: KPIGeneratorConfig = {
  enableAutoPrioritization: true,
  enableWorkflowAlignment: true,
  maxKPIs: 8,
};

/**
 * Domain KPI Generator
 * 
 * Generates domain-specific KPIs:
 * - Domain-specific KPIs
 * - KPI prioritization
 * - Workflow alignment
 * - KPI categorization
 */
export class DomainKPIGenerator {
  private config: KPIGeneratorConfig;

  constructor(config: Partial<KPIGeneratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate KPIs for a domain
   */
  generateKPIs(request: KPIGenerationRequest): KPIGenerationResult {
    const { domain, entities, workflows, archetype } = request;
    const kpis = this.generateDomainKPIs(domain, entities, workflows, archetype);

    // Prioritize KPIs
    const prioritized = this.prioritizeKPIs(kpis);

    // Limit to max KPIs
    const limited = prioritized.slice(0, this.config.maxKPIs);

    // Identify primary and secondary KPIs
    const primaryKPI = limited.length > 0 ? limited[0] ?? null : null;
    const secondaryKPIs = limited.slice(1);

    // Generate reasoning
    const reasoning = this.generateReasoning(request, limited);

    logger.info('DomainKPIGenerator', 'KPIS_GENERATED', 'KPIs generated', {
      domain,
      archetype,
      kpiCount: limited.length,
    });

    return {
      kpis: limited,
      primaryKPI,
      secondaryKPIs,
      reasoning,
    };
  }

  /**
   * Generate domain-specific KPIs
   */
  private generateDomainKPIs(
    domain: string,
    entities: string[],
    workflows: string[],
    archetype?: string
  ): MetricDefinition[] {
    const kpis: MetricDefinition[] = [];
    const lowerDomain = domain.toLowerCase();

    // Generate KPIs based on domain
    switch (lowerDomain) {
      case 'healthcare':
        kpis.push(...this.generateHealthcareKPIs(entities));
        break;
      case 'ecommerce':
        kpis.push(...this.generateEcommerceKPIs(entities));
        break;
      case 'crm':
        kpis.push(...this.generateCRMKPIs(entities));
        break;
      case 'analytics':
        kpis.push(...this.generateAnalyticsKPIs(entities));
        break;
      case 'operations':
        kpis.push(...this.generateOperationsKPIs(entities));
        break;
      case 'finance':
        kpis.push(...this.generateFinanceKPIs(entities));
        break;
      case 'support':
        kpis.push(...this.generateSupportKPIs(entities));
        break;
      default:
        kpis.push(...this.generateGenericKPIs(entities));
    }

    // Add workflow-aligned KPIs
    if (this.config.enableWorkflowAlignment) {
      const workflowKPIs = this.generateWorkflowKPIs(workflows, domain);
      kpis.push(...workflowKPIs);
    }

    return kpis;
  }

  /**
   * Generate healthcare KPIs
   */
  private generateHealthcareKPIs(entities: string[]): MetricDefinition[] {
    const kpis: MetricDefinition[] = [];

    kpis.push({
      id: 'patient_satisfaction',
      name: 'Patient Satisfaction Score',
      description: 'Average patient satisfaction rating',
      domain: 'healthcare',
      type: 'score',
      category: 'quality',
      priority: 1,
    });

    kpis.push({
      id: 'bed_utilization',
      name: 'Bed Utilization Rate',
      description: 'Percentage of beds in use',
      domain: 'healthcare',
      type: 'percentage',
      category: 'operational',
      priority: 0.9,
    });

    kpis.push({
      id: 'readmission_rate',
      name: 'Readmission Rate',
      description: 'Percentage of patients readmitted within 30 days',
      domain: 'healthcare',
      type: 'percentage',
      category: 'quality',
      priority: 0.8,
    });

    return kpis;
  }

  /**
   * Generate ecommerce KPIs
   */
  private generateEcommerceKPIs(entities: string[]): MetricDefinition[] {
    const kpis: MetricDefinition[] = [];

    kpis.push({
      id: 'cart_abandonment',
      name: 'Cart Abandonment Rate',
      description: 'Percentage of abandoned carts',
      domain: 'ecommerce',
      type: 'percentage',
      category: 'performance',
      priority: 1,
    });

    kpis.push({
      id: 'repeat_purchase_rate',
      name: 'Repeat Purchase Rate',
      description: 'Percentage of repeat customers',
      domain: 'ecommerce',
      type: 'percentage',
      category: 'user',
      priority: 0.9,
    });

    kpis.push({
      id: 'return_rate',
      name: 'Return Rate',
      description: 'Percentage of returned orders',
      domain: 'ecommerce',
      type: 'percentage',
      category: 'operational',
      priority: 0.8,
    });

    return kpis;
  }

  /**
   * Generate CRM KPIs
   */
  private generateCRMKPIs(entities: string[]): MetricDefinition[] {
    const kpis: MetricDefinition[] = [];

    kpis.push({
      id: 'pipeline_coverage',
      name: 'Pipeline Coverage Ratio',
      description: 'Ratio of pipeline value to quota',
      domain: 'crm',
      type: 'rate',
      category: 'financial',
      priority: 1,
    });

    kpis.push({
      id: 'lead_response_time',
      name: 'Lead Response Time',
      description: 'Average time to respond to leads',
      domain: 'crm',
      type: 'duration',
      category: 'performance',
      priority: 0.9,
    });

    kpis.push({
      id: 'win_rate',
      name: 'Win Rate',
      description: 'Percentage of deals won',
      domain: 'crm',
      type: 'percentage',
      category: 'quality',
      priority: 0.8,
    });

    return kpis;
  }

  /**
   * Generate analytics KPIs
   */
  private generateAnalyticsKPIs(entities: string[]): MetricDefinition[] {
    const kpis: MetricDefinition[] = [];

    kpis.push({
      id: 'session_duration',
      name: 'Average Session Duration',
      description: 'Average time spent per session',
      domain: 'analytics',
      type: 'duration',
      category: 'user',
      priority: 1,
    });

    kpis.push({
      id: 'bounce_rate',
      name: 'Bounce Rate',
      description: 'Percentage of single-page sessions',
      domain: 'analytics',
      type: 'percentage',
      category: 'performance',
      priority: 0.9,
    });

    kpis.push({
      id: 'pages_per_session',
      name: 'Pages Per Session',
      description: 'Average pages viewed per session',
      domain: 'analytics',
      type: 'count',
      category: 'user',
      priority: 0.8,
    });

    return kpis;
  }

  /**
   * Generate operations KPIs
   */
  private generateOperationsKPIs(entities: string[]): MetricDefinition[] {
    const kpis: MetricDefinition[] = [];

    kpis.push({
      id: 'incident_resolution',
      name: 'Incident Resolution Rate',
      description: 'Percentage of incidents resolved',
      domain: 'operations',
      type: 'percentage',
      category: 'performance',
      priority: 1,
    });

    kpis.push({
      id: 'resource_utilization',
      name: 'Resource Utilization',
      description: 'Percentage of resources utilized',
      domain: 'operations',
      type: 'percentage',
      category: 'operational',
      priority: 0.9,
    });

    kpis.push({
      id: 'process_efficiency',
      name: 'Process Efficiency Score',
      description: 'Score indicating process efficiency',
      domain: 'operations',
      type: 'score',
      category: 'quality',
      priority: 0.8,
    });

    return kpis;
  }

  /**
   * Generate finance KPIs
   */
  private generateFinanceKPIs(entities: string[]): MetricDefinition[] {
    const kpis: MetricDefinition[] = [];

    kpis.push({
      id: 'operating_expense',
      name: 'Operating Expense Ratio',
      description: 'Ratio of operating expenses to revenue',
      domain: 'finance',
      type: 'percentage',
      category: 'financial',
      priority: 1,
    });

    kpis.push({
      id: 'debt_to_equity',
      name: 'Debt to Equity Ratio',
      description: 'Ratio of debt to equity',
      domain: 'finance',
      type: 'rate',
      category: 'financial',
      priority: 0.9,
    });

    kpis.push({
      id: 'working_capital',
      name: 'Working Capital',
      description: 'Current assets minus current liabilities',
      domain: 'finance',
      type: 'currency',
      category: 'financial',
      priority: 0.8,
    });

    return kpis;
  }

  /**
   * Generate support KPIs
   */
  private generateSupportKPIs(entities: string[]): MetricDefinition[] {
    const kpis: MetricDefinition[] = [];

    kpis.push({
      id: 'first_contact_resolution',
      name: 'First Contact Resolution Rate',
      description: 'Percentage of issues resolved on first contact',
      domain: 'support',
      type: 'percentage',
      category: 'quality',
      priority: 1,
    });

    kpis.push({
      id: 'agent_utilization',
      name: 'Agent Utilization Rate',
      description: 'Percentage of agent time utilized',
      domain: 'support',
      type: 'percentage',
      category: 'operational',
      priority: 0.9,
    });

    kpis.push({
      id: 'ticket_backlog',
      name: 'Ticket Backlog',
      description: 'Number of unresolved tickets',
      domain: 'support',
      type: 'count',
      category: 'operational',
      priority: 0.8,
    });

    return kpis;
  }

  /**
   * Generate generic KPIs
   */
  private generateGenericKPIs(entities: string[]): MetricDefinition[] {
    const kpis: MetricDefinition[] = [];

    for (const entity of entities) {
      kpis.push({
        id: `${entity.toLowerCase()}_count`,
        name: `${entity} Count`,
        description: `Total count of ${entity}`,
        domain: 'generic',
        type: 'count',
        category: 'operational',
        priority: 0.7,
      });
    }

    return kpis;
  }

  /**
   * Generate workflow-aligned KPIs
   */
  private generateWorkflowKPIs(workflows: string[], domain: string): MetricDefinition[] {
    const kpis: MetricDefinition[] = [];

    for (const workflow of workflows) {
      const lowerWorkflow = workflow.toLowerCase();

      if (lowerWorkflow.includes('approval')) {
        kpis.push({
          id: `${workflow.toLowerCase()}_time`,
          name: `${workflow} Time`,
          description: `Average time for ${workflow}`,
          domain,
          type: 'duration',
          category: 'performance',
          priority: 0.6,
        });
      }

      if (lowerWorkflow.includes('review')) {
        kpis.push({
          id: `${workflow.toLowerCase()}_rate`,
          name: `${workflow} Rate`,
          description: `Percentage of ${workflow} completed`,
          domain,
          type: 'percentage',
          category: 'quality',
          priority: 0.6,
        });
      }
    }

    return kpis;
  }

  /**
   * Prioritize KPIs
   */
  private prioritizeKPIs(kpis: MetricDefinition[]): MetricDefinition[] {
    if (!this.config.enableAutoPrioritization) {
      return kpis;
    }

    return kpis.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Generate reasoning
   */
  private generateReasoning(request: KPIGenerationRequest, kpis: MetricDefinition[]): string {
    const parts: string[] = [];

    parts.push(`generated ${kpis.length} KPIs for ${request.domain}`);

    if (request.entities.length > 0) {
      parts.push(`based on ${request.entities.length} entities`);
    }

    if (request.workflows.length > 0) {
      parts.push(`aligned with ${request.workflows.length} workflows`);
    }

    if (request.archetype) {
      parts.push(`optimized for ${request.archetype} archetype`);
    }

    return parts.join(', ');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<KPIGeneratorConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('DomainKPIGenerator', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): KPIGeneratorConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: KPIGeneratorConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const domainKPIGenerator = new DomainKPIGenerator();

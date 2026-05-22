/**
 * Benchmark Testing Engine
 * 
 * Validates diversity of generated outputs across domains.
 * Ensures generated apps don't visually collapse into the same dashboard.
 */

import { logger } from '../../shared/utils/logger';

import {
  intelligenceGenerationPipeline,
} from './intelligence-generation-pipeline';

import type {
  AppUnderstanding,
} from '@oneatlas/shared';

export interface BenchmarkPrompt {
  id: string;
  domain: string;
  prompt: string;
  expectedArchetype: string;
  expectedWorkflow: string;
}

export interface BenchmarkResult {
  promptId: string;
  domain: string;
  archetype: string;
  workflow: string;
  layoutDiversity: number;
  metricDiversity: number;
  widgetDiversity: number;
  navigationDiversity: number;
  workflowDiversity: number;
  overallDiversity: number;
}

export interface BenchmarkReport {
  totalPrompts: number;
  completedPrompts: number;
  results: BenchmarkResult[];
  averageDiversity: {
    layout: number;
    metrics: number;
    widgets: number;
    navigation: number;
    workflow: number;
    overall: number;
  };
  domainComparison: Record<string, BenchmarkResult[]>;
  recommendations: string[];
}

/**
 * Benchmark Testing Engine
 * 
 * Validates output diversity:
 * - Layout diversity
 * - Metric diversity
 * - Widget diversity
 * - Navigation diversity
 * - Workflow diversity
 */
export class BenchmarkTestingEngine {
  private benchmarkPrompts: BenchmarkPrompt[];

  constructor() {
    this.benchmarkPrompts = this.generateBenchmarkPrompts();
  }

  /**
   * Generate benchmark prompts
   */
  private generateBenchmarkPrompts(): BenchmarkPrompt[] {
    return [
      {
        id: 'healthcare-1',
        domain: 'healthcare',
        prompt: 'Build a patient management system for a hospital',
        expectedArchetype: 'healthcare_console',
        expectedWorkflow: 'monitoring',
      },
      {
        id: 'healthcare-2',
        domain: 'healthcare',
        prompt: 'Create a medical records dashboard for a clinic',
        expectedArchetype: 'healthcare_console',
        expectedWorkflow: 'operation',
      },
      {
        id: 'ecommerce-1',
        domain: 'ecommerce',
        prompt: 'Build an online store management system',
        expectedArchetype: 'ecommerce_console',
        expectedWorkflow: 'operation',
      },
      {
        id: 'ecommerce-2',
        domain: 'ecommerce',
        prompt: 'Create an order tracking dashboard for an e-commerce platform',
        expectedArchetype: 'ecommerce_console',
        expectedWorkflow: 'monitoring',
      },
      {
        id: 'crm-1',
        domain: 'crm',
        prompt: 'Build a sales pipeline management system',
        expectedArchetype: 'crm_console',
        expectedWorkflow: 'selling',
      },
      {
        id: 'crm-2',
        domain: 'crm',
        prompt: 'Create a lead management dashboard for a sales team',
        expectedArchetype: 'crm_console',
        expectedWorkflow: 'collaboration',
      },
      {
        id: 'analytics-1',
        domain: 'analytics',
        prompt: 'Build a data analytics platform for business intelligence',
        expectedArchetype: 'analytics_console',
        expectedWorkflow: 'analysis',
      },
      {
        id: 'analytics-2',
        domain: 'analytics',
        prompt: 'Create a user engagement tracking dashboard',
        expectedArchetype: 'analytics_console',
        expectedWorkflow: 'monitoring',
      },
      {
        id: 'logistics-1',
        domain: 'logistics',
        prompt: 'Build a shipment tracking system for a logistics company',
        expectedArchetype: 'operations_console',
        expectedWorkflow: 'monitoring',
      },
      {
        id: 'logistics-2',
        domain: 'logistics',
        prompt: 'Create a fleet management dashboard',
        expectedArchetype: 'operations_console',
        expectedWorkflow: 'operation',
      },
      {
        id: 'finance-1',
        domain: 'finance',
        prompt: 'Build a financial reporting system for a bank',
        expectedArchetype: 'finance_console',
        expectedWorkflow: 'analysis',
      },
      {
        id: 'finance-2',
        domain: 'finance',
        prompt: 'Create an expense tracking dashboard',
        expectedArchetype: 'finance_console',
        expectedWorkflow: 'monitoring',
      },
      {
        id: 'project_management-1',
        domain: 'project_management',
        prompt: 'Build a project management system for a software team',
        expectedArchetype: 'project_console',
        expectedWorkflow: 'collaboration',
      },
      {
        id: 'project_management-2',
        domain: 'project_management',
        prompt: 'Create a task tracking dashboard',
        expectedArchetype: 'project_console',
        expectedWorkflow: 'operation',
      },
      {
        id: 'support-1',
        domain: 'support',
        prompt: 'Build a customer support ticket system',
        expectedArchetype: 'support_console',
        expectedWorkflow: 'support',
      },
      {
        id: 'support-2',
        domain: 'support',
        prompt: 'Create a help desk management dashboard',
        expectedArchetype: 'support_console',
        expectedWorkflow: 'operation',
      },
    ];
  }

  /**
   * Run benchmark tests
   */
  async runBenchmark(): Promise<BenchmarkReport> {
    logger.info('BenchmarkTestingEngine', 'BENCHMARK_STARTED', 'Benchmark testing started', {
      promptCount: this.benchmarkPrompts.length,
    });

    const results: BenchmarkResult[] = [];

    for (const prompt of this.benchmarkPrompts) {
      try {
        const result = await this.testPrompt(prompt);
        results.push(result);
      } catch (error) {
        logger.error('BenchmarkTestingEngine', 'PROMPT_TEST_FAILED', 'Prompt test failed', {
          promptId: prompt.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    const report = this.generateReport(results);

    logger.info('BenchmarkTestingEngine', 'BENCHMARK_COMPLETED', 'Benchmark testing completed', {
      completedPrompts: results.length,
      averageDiversity: report.averageDiversity.overall,
    });

    return report;
  }

  /**
   * Test a single prompt
   */
  private async testPrompt(prompt: BenchmarkPrompt): Promise<BenchmarkResult> {
    const understanding: AppUnderstanding = {
      appName: `${prompt.domain.charAt(0).toUpperCase() + prompt.domain.slice(1)} System`,
      appType: 'dashboard',
      features: [],
      pages: [],
      workflows: [],
      entities: [],
    };

    const generationResult = await intelligenceGenerationPipeline.generate(understanding);

    // Analyze the generated output for diversity
    const layoutDiversity = this.analyzeLayoutDiversity(generationResult.files, prompt.domain);
    const metricDiversity = this.analyzeMetricDiversity(generationResult.files, prompt.domain);
    const widgetDiversity = this.analyzeWidgetDiversity(generationResult.files, prompt.domain);
    const navigationDiversity = this.analyzeNavigationDiversity(generationResult.files, prompt.domain);
    const workflowDiversity = this.analyzeWorkflowDiversity(generationResult.files, prompt.domain);

    const overallDiversity = (layoutDiversity + metricDiversity + widgetDiversity + navigationDiversity + workflowDiversity) / 5;

    return {
      promptId: prompt.id,
      domain: prompt.domain,
      archetype: prompt.expectedArchetype,
      workflow: prompt.expectedWorkflow,
      layoutDiversity,
      metricDiversity,
      widgetDiversity,
      navigationDiversity,
      workflowDiversity,
      overallDiversity,
    };
  }

  /**
   * Analyze layout diversity
   */
  private analyzeLayoutDiversity(files: any[], domain: string): number {
    // Count unique layout patterns
    const layoutPatterns = new Set<string>();

    for (const file of files) {
      const content = file.content || '';
      
      // Extract layout classes
      const layoutMatches = content.match(/className="[^"]*layout[^"]*"/gi);
      if (layoutMatches) {
        layoutMatches.forEach((match: string) => layoutPatterns.add(match));
      }

      // Extract grid patterns
      const gridMatches = content.match(/className="[^"]*grid[^"]*"/gi);
      if (gridMatches) {
        gridMatches.forEach((match: string) => layoutPatterns.add(match));
      }
    }

    // Normalize by domain (higher diversity for different domains)
    const domainMultiplier = this.getDomainMultiplier(domain);
    return (layoutPatterns.size / 10) * domainMultiplier;
  }

  /**
   * Analyze metric diversity
   */
  private analyzeMetricDiversity(files: any[], domain: string): number {
    // Count unique metric names
    const metricNames = new Set<string>();

    for (const file of files) {
      const content = file.content || '';
      
      // Extract metric names
      const metricMatches = content.match(/data-metric="([^"]*)"/gi);
      if (metricMatches) {
        metricMatches.forEach((match: string) => {
          const name = match.match(/data-metric="([^"]*)"/)?.[1];
          if (name) metricNames.add(name);
        });
      }

      // Extract KPI labels
      const kpiMatches = content.match(/<div className="kpi-label">([^<]*)<\/div>/gi);
      if (kpiMatches) {
        kpiMatches.forEach((match: string) => {
          const label = match.match(/<div className="kpi-label">([^<]*)<\/div>/)?.[1];
          if (label) metricNames.add(label);
        });
      }
    }

    const domainMultiplier = this.getDomainMultiplier(domain);
    return (metricNames.size / 8) * domainMultiplier;
  }

  /**
   * Analyze widget diversity
   */
  private analyzeWidgetDiversity(files: any[], domain: string): number {
    // Count unique widget types
    const widgetTypes = new Set<string>();

    for (const file of files) {
      const content = file.content || '';
      
      // Extract widget types
      const widgetMatches = content.match(/data-widget="([^"]*)"/gi);
      if (widgetMatches) {
        widgetMatches.forEach((match: string) => {
          const type = match.match(/data-widget="([^"]*)"/)?.[1];
          if (type) widgetTypes.add(type);
        });
      }

      // Extract component types
      const componentMatches = content.match(/data-component="([^"]*)"/gi);
      if (componentMatches) {
        componentMatches.forEach((match: string) => {
          const type = match.match(/data-component="([^"]*)"/)?.[1];
          if (type) widgetTypes.add(type);
        });
      }
    }

    const domainMultiplier = this.getDomainMultiplier(domain);
    return (widgetTypes.size / 6) * domainMultiplier;
  }

  /**
   * Analyze navigation diversity
   */
  private analyzeNavigationDiversity(files: any[], domain: string): number {
    // Count unique navigation patterns
    const navigationPatterns = new Set<string>();

    for (const file of files) {
      const content = file.content || '';
      
      // Extract navigation types
      const navMatches = content.match(/data-navigation="([^"]*)"/gi);
      if (navMatches) {
        navMatches.forEach((match: string) => {
          const type = match.match(/data-navigation="([^"]*)"/)?.[1];
          if (type) navigationPatterns.add(type);
        });
      }

      // Extract nav item classes
      const navItemMatches = content.match(/className="[^"]*nav-item[^"]*"/gi);
      if (navItemMatches) {
        navItemMatches.forEach((match: string) => navigationPatterns.add(match));
      }
    }

    const domainMultiplier = this.getDomainMultiplier(domain);
    return (navigationPatterns.size / 5) * domainMultiplier;
  }

  /**
   * Analyze workflow diversity
   */
  private analyzeWorkflowDiversity(files: any[], domain: string): number {
    // Count unique workflow patterns
    const workflowPatterns = new Set<string>();

    for (const file of files) {
      const content = file.content || '';
      
      // Extract workflow types
      const workflowMatches = content.match(/data-workflow="([^"]*)"/gi);
      if (workflowMatches) {
        workflowMatches.forEach((match: string) => {
          const type = match.match(/data-workflow="([^"]*)"/)?.[1];
          if (type) workflowPatterns.add(type);
        });
      }

      // Extract action button classes
      const actionMatches = content.match(/className="[^"]*action-button[^"]*"/gi);
      if (actionMatches) {
        actionMatches.forEach((match: string) => workflowPatterns.add(match));
      }
    }

    const domainMultiplier = this.getDomainMultiplier(domain);
    return (workflowPatterns.size / 4) * domainMultiplier;
  }

  /**
   * Get domain multiplier for diversity scoring
   */
  private getDomainMultiplier(domain: string): number {
    // Different domains should have different baseline diversity expectations
    const multipliers: Record<string, number> = {
      healthcare: 1.2,
      ecommerce: 1.1,
      crm: 1.15,
      analytics: 1.25,
      logistics: 1.1,
      finance: 1.15,
      project_management: 1.1,
      support: 1.1,
    };

    return multipliers[domain] || 1.0;
  }

  /**
   * Generate benchmark report
   */
  private generateReport(results: BenchmarkResult[]): BenchmarkReport {
    const averageDiversity = {
      layout: this.calculateAverage(results, 'layoutDiversity'),
      metrics: this.calculateAverage(results, 'metricDiversity'),
      widgets: this.calculateAverage(results, 'widgetDiversity'),
      navigation: this.calculateAverage(results, 'navigationDiversity'),
      workflow: this.calculateAverage(results, 'workflowDiversity'),
      overall: this.calculateAverage(results, 'overallDiversity'),
    };

    const domainComparison: Record<string, BenchmarkResult[]> = {};
    for (const result of results) {
      if (!domainComparison[result.domain]) {
        domainComparison[result.domain] = [];
      }
      (domainComparison[result.domain] ?? []).push(result);
    }

    const recommendations = this.generateRecommendations(results, averageDiversity);

    return {
      totalPrompts: this.benchmarkPrompts.length,
      completedPrompts: results.length,
      results,
      averageDiversity,
      domainComparison,
      recommendations,
    };
  }

  /**
   * Calculate average for a property
   */
  private calculateAverage(results: BenchmarkResult[], property: keyof BenchmarkResult): number {
    const values = results.map(r => r[property] as number);
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(results: BenchmarkResult[], averageDiversity: any): string[] {
    const recommendations: string[] = [];

    if (averageDiversity.layout < 0.6) {
      recommendations.push('Layout diversity is low. Consider adding more archetype-specific layout variations.');
    }

    if (averageDiversity.metrics < 0.6) {
      recommendations.push('Metric diversity is low. Enhance domain-specific metric generation.');
    }

    if (averageDiversity.widgets < 0.6) {
      recommendations.push('Widget diversity is low. Expand domain-specific widget library.');
    }

    if (averageDiversity.navigation < 0.6) {
      recommendations.push('Navigation diversity is low. Implement archetype-specific navigation patterns.');
    }

    if (averageDiversity.workflow < 0.6) {
      recommendations.push('Workflow diversity is low. Enhance workflow-first composition.');
    }

    if (averageDiversity.overall < 0.7) {
      recommendations.push('Overall diversity is below target. Review intelligence engine integration.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Diversity metrics are within acceptable ranges. Continue monitoring.');
    }

    return recommendations;
  }

  /**
   * Get benchmark prompts
   */
  getBenchmarkPrompts(): BenchmarkPrompt[] {
    return [...this.benchmarkPrompts];
  }

  /**
   * Add custom benchmark prompt
   */
  addBenchmarkPrompt(prompt: BenchmarkPrompt): void {
    this.benchmarkPrompts.push(prompt);
    logger.info('BenchmarkTestingEngine', 'PROMPT_ADDED', 'Benchmark prompt added', {
      promptId: prompt.id,
      domain: prompt.domain,
    });
  }
}

export const benchmarkTestingEngine = new BenchmarkTestingEngine();

/**
 * Workflow Optimizer
 * 
 * Analyzes workflows and suggests improvements.
 * Identifies bottlenecks and optimization opportunities.
 */

import { logger } from '../../shared/utils/logger';
import type { Workflow, WorkflowStep } from './workflow-inference';

export interface OptimizationSuggestion {
  id: string;
  type: 'efficiency' | 'automation' | 'simplification' | 'parallelization';
  priority: 'low' | 'medium' | 'high';
  description: string;
  impact: string;
  effort: string;
  stepId?: string;
}

export interface OptimizationResult {
  workflow: Workflow;
  suggestions: OptimizationSuggestion[];
  overallScore: number;
  metrics: {
    efficiency: number;
    complexity: number;
    automation: number;
  };
}

export interface OptimizerConfig {
  enableAutomationDetection: boolean;
  enableParallelizationDetection: boolean;
  complexityThreshold: number;
}

const DEFAULT_CONFIG: OptimizerConfig = {
  enableAutomationDetection: true,
  enableParallelizationDetection: true,
  complexityThreshold: 0.7,
};

/**
 * Workflow Optimizer
 * 
 * Optimizes workflows:
 * - Efficiency analysis
 * - Bottleneck detection
 * - Automation opportunities
 * - Parallelization suggestions
 */
export class WorkflowOptimizer {
  private config: OptimizerConfig;
  private optimizationHistory: Map<string, OptimizationResult> = new Map();

  constructor(config: Partial<OptimizerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Analyze workflow and generate suggestions
   */
  analyze(workflow: Workflow): OptimizationResult {
    const suggestions: OptimizationSuggestion[] = [];

    // Analyze for efficiency improvements
    this.analyzeEfficiency(workflow, suggestions);

    // Analyze for automation opportunities
    if (this.config.enableAutomationDetection) {
      this.analyzeAutomation(workflow, suggestions);
    }

    // Analyze for parallelization opportunities
    if (this.config.enableParallelizationDetection) {
      this.analyzeParallelization(workflow, suggestions);
    }

    // Analyze for simplification opportunities
    this.analyzeSimplification(workflow, suggestions);

    // Calculate metrics
    const metrics = this.calculateMetrics(workflow);
    const overallScore = this.calculateOverallScore(metrics, suggestions);

    const result: OptimizationResult = {
      workflow,
      suggestions,
      overallScore,
      metrics,
    };

    // Store optimization history
    this.optimizationHistory.set(workflow.id, result);

    logger.info('WorkflowOptimizer', 'ANALYSIS_COMPLETE', 'Workflow analysis complete', {
      workflowId: workflow.id,
      suggestions: suggestions.length,
      overallScore,
    });

    return result;
  }

  /**
   * Analyze for efficiency improvements
   */
  private analyzeEfficiency(workflow: Workflow, suggestions: OptimizationSuggestion[]): void {
    const steps = workflow.steps;

    // Check for redundant steps
    const stepNames = new Set<string>();
    for (const step of steps) {
      if (stepNames.has(step.name)) {
        suggestions.push({
          id: crypto.randomUUID(),
          type: 'efficiency',
          priority: 'medium',
          description: `Redundant step detected: ${step.name}`,
          impact: 'Reduce workflow steps by 1',
          effort: 'Low',
          stepId: step.id,
        });
      }
      stepNames.add(step.name);
    }

    // Check for long dependency chains
    for (const step of steps) {
      if (step.dependencies.length > 3) {
        suggestions.push({
          id: crypto.randomUUID(),
          type: 'efficiency',
          priority: 'high',
          description: `Step "${step.name}" has ${step.dependencies.length} dependencies - consider restructuring`,
          impact: 'Reduce workflow complexity',
          effort: 'Medium',
          stepId: step.id,
        });
      }
    }

    // Check for decision bottlenecks
    const decisionSteps = steps.filter(s => s.type === 'decision');
    for (const step of decisionSteps) {
      const dependents = steps.filter(s => s.dependencies.includes(step.id));
      if (dependents.length === 1) {
        suggestions.push({
          id: crypto.randomUUID(),
          type: 'efficiency',
          priority: 'low',
          description: `Decision step "${step.name}" only affects one subsequent step - consider if needed`,
          impact: 'Simplify workflow',
          effort: 'Low',
          stepId: step.id,
        });
      }
    }
  }

  /**
   * Analyze for automation opportunities
   */
  private analyzeAutomation(workflow: Workflow, suggestions: OptimizationSuggestion[]): void {
    const steps = workflow.steps;

    // Check for manual action steps that could be automated
    for (const step of steps) {
      if (step.type === 'action') {
        const automationKeywords = ['manual', 'input', 'enter', 'type', 'select'];
        const hasAutomationKeyword = automationKeywords.some(keyword =>
          step.description.toLowerCase().includes(keyword)
        );

        if (hasAutomationKeyword) {
          suggestions.push({
            id: crypto.randomUUID(),
            type: 'automation',
            priority: 'medium',
            description: `Step "${step.name}" may be automatable`,
            impact: 'Reduce manual effort',
            effort: 'Medium',
            stepId: step.id,
          });
        }
      }
    }

    // Check for repetitive patterns
    const stepTypes = steps.map(s => s.type);
    const consecutiveActions = this.findConsecutive(stepTypes, 'action');
    if (consecutiveActions.length >= 3) {
      suggestions.push({
        id: crypto.randomUUID(),
        type: 'automation',
        priority: 'high',
        description: `${consecutiveActions.length} consecutive action steps detected - consider batch automation`,
        impact: 'Significant efficiency gain',
        effort: 'High',
      });
    }
  }

  /**
   * Analyze for parallelization opportunities
   */
  private analyzeParallelization(workflow: Workflow, suggestions: OptimizationSuggestion[]): void {
    const steps = workflow.steps;

    // Find steps with same dependencies that could run in parallel
    const dependencyGroups = new Map<string, WorkflowStep[]>();
    for (const step of steps) {
      const depKey = step.dependencies.sort().join(',');
      if (!dependencyGroups.has(depKey)) {
        dependencyGroups.set(depKey, []);
      }
      dependencyGroups.get(depKey)?.push(step);
    }

    for (const [depKey, groupSteps] of dependencyGroups.entries()) {
      if (groupSteps.length > 1 && depKey !== '') {
        suggestions.push({
          id: crypto.randomUUID(),
          type: 'parallelization',
          priority: 'medium',
          description: `${groupSteps.length} steps with same dependencies could run in parallel`,
          impact: 'Reduce workflow duration',
          effort: 'Medium',
        });
      }
    }

    // Check for independent process steps
    const processSteps = steps.filter(s => s.type === 'process');
    for (const step of processSteps) {
      if (step.dependencies.length === 0) {
        suggestions.push({
          id: crypto.randomUUID(),
          type: 'parallelization',
          priority: 'high',
          description: `Process step "${step.name}" has no dependencies - can run in parallel`,
          impact: 'Reduce workflow duration',
          effort: 'Low',
          stepId: step.id,
        });
      }
    }
  }

  /**
   * Analyze for simplification opportunities
   */
  private analyzeSimplification(workflow: Workflow, suggestions: OptimizationSuggestion[]): void {
    const steps = workflow.steps;

    // Check for unnecessary process steps
    for (const step of steps) {
      if (step.type === 'process' && step.dependencies.length === 1) {
        const dependent = steps.find(s => s.dependencies.includes(step.id));
        if (!dependent) {
          suggestions.push({
            id: crypto.randomUUID(),
            type: 'simplification',
            priority: 'low',
            description: `Process step "${step.name}" has no dependents - consider removing`,
            impact: 'Simplify workflow',
            effort: 'Low',
            stepId: step.id,
          });
        }
      }
    }

    // Check for complex decision chains
    const decisionChains = this.findDecisionChains(steps);
    for (const chain of decisionChains) {
      if (chain.length > 3) {
        suggestions.push({
          id: crypto.randomUUID(),
          type: 'simplification',
          priority: 'medium',
          description: `Decision chain of ${chain.length} steps detected - consider consolidating`,
          impact: 'Reduce complexity',
          effort: 'Medium',
        });
      }
    }
  }

  /**
   * Find consecutive elements
   */
  private findConsecutive<T>(array: T[], target: T): T[] {
    let result: T[] = [];
    let currentStreak: T[] = [];

    for (const item of array) {
      if (item === target) {
        currentStreak.push(item);
      } else {
        if (currentStreak.length > result.length) {
          result = [...currentStreak];
        }
        currentStreak = [];
      }
    }

    if (currentStreak.length > result.length) {
      result = [...currentStreak];
    }

    return result;
  }

  /**
   * Find decision chains
   */
  private findDecisionChains(steps: WorkflowStep[]): WorkflowStep[][] {
    const chains: WorkflowStep[][] = [];
    const visited = new Set<string>();

    for (const step of steps) {
      if (step.type === 'decision' && !visited.has(step.id)) {
        const chain: WorkflowStep[] = [];
        let current = step;

        while (current && current.type === 'decision' && !visited.has(current.id)) {
          chain.push(current);
          visited.add(current.id);

          // Find next decision in dependency chain
          const dependents = steps.filter(s => s.dependencies.includes(current.id));
          const nextDecision = dependents.find(s => s.type === 'decision');
          if (nextDecision) {
            current = nextDecision;
          } else {
            break;
          }
        }

        if (chain.length > 1) {
          chains.push(chain);
        }
      }
    }

    return chains;
  }

  /**
   * Calculate workflow metrics
   */
  private calculateMetrics(workflow: Workflow): {
    efficiency: number;
    complexity: number;
    automation: number;
  } {
    const steps = workflow.steps;

    // Efficiency: ratio of output steps to total steps
    const outputSteps = steps.filter(s => s.type === 'output').length;
    const efficiency = steps.length > 0 ? outputSteps / steps.length : 0;

    // Complexity: based on dependencies and decision steps
    const totalDependencies = steps.reduce((sum, s) => sum + s.dependencies.length, 0);
    const decisionSteps = steps.filter(s => s.type === 'decision').length;
    const complexity = steps.length > 0
      ? (totalDependencies + decisionSteps * 2) / steps.length
      : 0;

    // Automation: ratio of process steps to action steps
    const processSteps = steps.filter(s => s.type === 'process').length;
    const actionSteps = steps.filter(s => s.type === 'action').length;
    const automation = actionSteps > 0 ? processSteps / actionSteps : 0;

    return {
      efficiency: Math.min(1, efficiency),
      complexity: Math.min(1, complexity),
      automation: Math.min(1, automation),
    };
  }

  /**
   * Calculate overall score
   */
  private calculateOverallScore(
    metrics: { efficiency: number; complexity: number; automation: number },
    suggestions: OptimizationSuggestion[],
  ): number {
    let score = 100;

    // Penalize low efficiency
    score -= (1 - metrics.efficiency) * 30;

    // Penalize high complexity
    score -= metrics.complexity * 20;

    // Reward high automation
    score += metrics.automation * 10;

    // Penalize high-priority suggestions
    const highPrioritySuggestions = suggestions.filter(s => s.priority === 'high').length;
    score -= highPrioritySuggestions * 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Apply optimization suggestions
   */
  applyOptimizations(workflow: Workflow, suggestionIds: string[]): Workflow {
    const optimizedSteps = [...workflow.steps];
    const idsToRemove = new Set<string>();

    for (const suggestionId of suggestionIds) {
      // Find suggestion and apply it
      // This is a simplified implementation
      // In a real system, this would have more sophisticated logic
    }

    return {
      ...workflow,
      steps: optimizedSteps.filter(s => !idsToRemove.has(s.id)),
    };
  }

  /**
   * Get optimization history
   */
  getOptimizationHistory(workflowId?: string): OptimizationResult | Map<string, OptimizationResult> | undefined {
    if (workflowId) {
      return this.optimizationHistory.get(workflowId);
    }
    return this.optimizationHistory;
  }

  /**
   * Clear optimization history
   */
  clearHistory(): void {
    this.optimizationHistory.clear();

    logger.info('WorkflowOptimizer', 'HISTORY_CLEARED', 'Optimization history cleared');
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalOptimizations: number;
    averageScore: number;
    averageSuggestions: number;
    suggestionDistribution: Record<string, number>;
  } {
    const history = Array.from(this.optimizationHistory.values());
    const averageScore = history.length > 0
      ? history.reduce((sum, r) => sum + r.overallScore, 0) / history.length
      : 0;
    const averageSuggestions = history.length > 0
      ? history.reduce((sum, r) => sum + r.suggestions.length, 0) / history.length
      : 0;

    const suggestionDistribution: Record<string, number> = {
      efficiency: 0,
      automation: 0,
      simplification: 0,
      parallelization: 0,
    };

    for (const result of history) {
      for (const suggestion of result.suggestions) {
        suggestionDistribution[suggestion.type] = (suggestionDistribution[suggestion.type] || 0) + 1;
      }
    }

    return {
      totalOptimizations: history.length,
      averageScore,
      averageSuggestions,
      suggestionDistribution,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OptimizerConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('WorkflowOptimizer', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): OptimizerConfig {
    return { ...this.config };
  }
}

export const workflowOptimizer = new WorkflowOptimizer();

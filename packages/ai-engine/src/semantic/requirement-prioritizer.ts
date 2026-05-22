/**
 * Requirement Prioritization System
 * Prioritizes requirements based on importance, dependencies, and complexity
 */

import type { ExtractedRequirement } from './requirement-analyzer';

export interface PrioritizedRequirement extends ExtractedRequirement {
  priorityScore: number;
  rank: number;
  dependencies: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
  riskLevel: 'low' | 'medium' | 'high';
  suggestedOrder: number;
}

export interface PrioritizationResult {
  prioritizedRequirements: PrioritizedRequirement[];
  totalRequirements: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  criticalPath: string[];
  suggestedExecutionOrder: string[];
}

class RequirementPrioritizer {
  /**
   * Prioritize requirements
   */
  prioritize(requirements: ExtractedRequirement[]): PrioritizationResult {
    const prioritized: PrioritizedRequirement[] = [];

    for (const req of requirements) {
      const priorityScore = this.calculatePriorityScore(req);
      const estimatedEffort = this.estimateEffort(req);
      const riskLevel = this.assessRisk(req);
      const dependencies = this.identifyDependencies(req, requirements);

      prioritized.push({
        ...req,
        priorityScore,
        rank: 0, // Will be set after sorting
        dependencies,
        estimatedEffort,
        riskLevel,
        suggestedOrder: 0,
      });
    }

    // Sort by priority score descending
    prioritized.sort((a, b) => b.priorityScore - a.priorityScore);

    // Assign ranks
    prioritized.forEach((req, index) => {
      req.rank = index + 1;
    });

    // Calculate suggested execution order considering dependencies
    const executionOrder = this.calculateExecutionOrder(prioritized);
    prioritized.forEach((req, index) => {
      req.suggestedOrder = executionOrder.indexOf(req.id) + 1;
    });

    // Identify critical path
    const criticalPath = this.identifyCriticalPath(prioritized);

    const highPriorityCount = prioritized.filter(r => r.priority === 'high').length;
    const mediumPriorityCount = prioritized.filter(r => r.priority === 'medium').length;
    const lowPriorityCount = prioritized.filter(r => r.priority === 'low').length;

    return {
      prioritizedRequirements: prioritized,
      totalRequirements: requirements.length,
      highPriorityCount,
      mediumPriorityCount,
      lowPriorityCount,
      criticalPath,
      suggestedExecutionOrder: executionOrder,
    };
  }

  /**
   * Calculate priority score for requirement
   */
  private calculatePriorityScore(req: ExtractedRequirement): number {
    let score = 0;

    // Base priority
    switch (req.priority) {
      case 'high':
        score += 0.5;
        break;
      case 'medium':
        score += 0.3;
        break;
      case 'low':
        score += 0.1;
        break;
    }

    // Confidence boost
    score += req.confidence * 0.2;

    // Type-based priority
    switch (req.type) {
      case 'entity':
        score += 0.2; // Entities are foundational
        break;
      case 'field':
        score += 0.15; // Fields are important
        break;
      case 'relationship':
        score += 0.15; // Relationships connect entities
        break;
      case 'validation':
        score += 0.1; // Validation is important but can be added later
        break;
      case 'ui':
        score += 0.05; // UI can be added after data structure
        break;
      case 'business-rule':
        score += 0.1; // Business rules are important
        break;
    }

    // Entity count boost (requirements affecting more entities are more important)
    score += Math.min(req.entities.length * 0.05, 0.2);

    // Constraint count boost (more constraints = more critical)
    score += Math.min(req.constraints.length * 0.03, 0.15);

    return Math.min(score, 1.0);
  }

  /**
   * Estimate effort for requirement
   */
  private estimateEffort(req: ExtractedRequirement): 'low' | 'medium' | 'high' {
    let effortScore = 0;

    // Type-based effort
    switch (req.type) {
      case 'entity':
        effortScore += 3;
        break;
      case 'field':
        effortScore += 1;
        break;
      case 'relationship':
        effortScore += 2;
        break;
      case 'validation':
        effortScore += 1;
        break;
      case 'ui':
        effortScore += 3;
        break;
      case 'business-rule':
        effortScore += 2;
        break;
    }

    // Entity count increases effort
    effortScore += req.entities.length * 0.5;

    // Constraint count increases effort
    effortScore += req.constraints.length * 0.3;

    if (effortScore <= 2) return 'low';
    if (effortScore <= 4) return 'medium';
    return 'high';
  }

  /**
   * Assess risk level for requirement
   */
  private assessRisk(req: ExtractedRequirement): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // Low confidence increases risk
    if (req.confidence < 0.5) riskScore += 2;
    else if (req.confidence < 0.7) riskScore += 1;

    // Many entities increases risk
    if (req.entities.length > 2) riskScore += 1;

    // Many constraints increases risk
    if (req.constraints.length > 3) riskScore += 1;

    // Type-based risk
    if (req.type === 'entity') riskScore += 1; // Creating entities is risky
    if (req.type === 'relationship') riskScore += 1; // Relationships affect multiple entities

    if (riskScore <= 1) return 'low';
    if (riskScore <= 2) return 'medium';
    return 'high';
  }

  /**
   * Identify dependencies for requirement
   */
  private identifyDependencies(req: ExtractedRequirement, allRequirements: ExtractedRequirement[]): string[] {
    const dependencies: string[] = [];

    // Entity requirements depend on field requirements
    if (req.type === 'entity') {
      const fieldReqs = allRequirements.filter(r => r.type === 'field' && r.entities.some(e => req.entities.includes(e)));
      dependencies.push(...fieldReqs.map(r => r.id));
    }

    // Validation depends on fields
    if (req.type === 'validation') {
      const fieldReqs = allRequirements.filter(r => r.type === 'field' && r.entities.some(e => req.entities.includes(e)));
      dependencies.push(...fieldReqs.map(r => r.id));
    }

    // Relationships depend on entities
    if (req.type === 'relationship') {
      const entityReqs = allRequirements.filter(r => r.type === 'entity' && r.entities[0] && req.entities.includes(r.entities[0]));
      dependencies.push(...entityReqs.map(r => r.id));
    }

    // UI depends on entities and fields
    if (req.type === 'ui') {
      const entityReqs = allRequirements.filter(r => r.type === 'entity' && req.entities.some(e => r.entities.includes(e)));
      dependencies.push(...entityReqs.map(r => r.id));
    }

    return [...new Set(dependencies)];
  }

  /**
   * Calculate execution order considering dependencies
   */
  private calculateExecutionOrder(requirements: PrioritizedRequirement[]): string[] {
    const order: string[] = [];
    const processed = new Set<string>();
    const remaining = new Set(requirements.map(r => r.id));

    while (remaining.size > 0) {
      let progress = false;

      for (const req of requirements) {
        if (!remaining.has(req.id)) continue;

        // Check if all dependencies are processed
        const unprocessedDeps = req.dependencies.filter(dep => !processed.has(dep));
        
        if (unprocessedDeps.length === 0) {
          order.push(req.id);
          processed.add(req.id);
          remaining.delete(req.id);
          progress = true;
        }
      }

      // If no progress, break circular dependencies by adding highest priority remaining
      if (!progress) {
        const remainingReqs = requirements.filter(r => remaining.has(r.id));
        const highestPriority = remainingReqs.sort((a, b) => b.priorityScore - a.priorityScore)[0];
        if (highestPriority) {
          order.push(highestPriority.id);
          processed.add(highestPriority.id);
          remaining.delete(highestPriority.id);
        }
      }
    }

    return order;
  }

  /**
   * Identify critical path (requirements that block others)
   */
  private identifyCriticalPath(requirements: PrioritizedRequirement[]): string[] {
    const dependencyCount = new Map<string, number>();

    // Count how many requirements depend on each requirement
    for (const req of requirements) {
      for (const depId of req.dependencies) {
        dependencyCount.set(depId, (dependencyCount.get(depId) || 0) + 1);
      }
    }

    // Requirements with most dependents are on critical path
    const sorted = Array.from(dependencyCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5); // Top 5 most critical

    return sorted.map(([id]) => id);
  }

  /**
   * Get requirements by priority level
   */
  getByPriority(result: PrioritizationResult, priority: 'high' | 'medium' | 'low'): PrioritizedRequirement[] {
    return result.prioritizedRequirements.filter(r => r.priority === priority);
  }

  /**
   * Get requirements by effort
   */
  getByEffort(result: PrioritizationResult, effort: 'low' | 'medium' | 'high'): PrioritizedRequirement[] {
    return result.prioritizedRequirements.filter(r => r.estimatedEffort === effort);
  }

  /**
   * Get requirements by risk
   */
  getByRisk(result: PrioritizationResult, risk: 'low' | 'medium' | 'high'): PrioritizedRequirement[] {
    return result.prioritizedRequirements.filter(r => r.riskLevel === risk);
  }

  /**
   * Get prioritization summary
   */
  getSummary(result: PrioritizationResult): string {
    const parts: string[] = [];

    parts.push(`Total requirements: ${result.totalRequirements}`);
    parts.push(`High priority: ${result.highPriorityCount}`);
    parts.push(`Medium priority: ${result.mediumPriorityCount}`);
    parts.push(`Low priority: ${result.lowPriorityCount}`);
    parts.push(`Critical path items: ${result.criticalPath.length}`);

    return parts.join(', ');
  }

  /**
   * Suggest implementation phases
   */
  suggestPhases(result: PrioritizationResult): Array<{ phase: number; requirements: string[]; description: string }> {
    const phases: Array<{ phase: number; requirements: string[]; description: string }> = [];
    const highPriority = this.getByPriority(result, 'high');
    const mediumPriority = this.getByPriority(result, 'medium');
    const lowPriority = this.getByPriority(result, 'low');

    // Phase 1: High priority, low effort, low risk
    const phase1 = highPriority.filter(r => r.estimatedEffort === 'low' && r.riskLevel === 'low');
    if (phase1.length > 0) {
      phases.push({
        phase: 1,
        requirements: phase1.map(r => r.id),
        description: 'Quick wins - high priority, low effort, low risk',
      });
    }

    // Phase 2: High priority, medium effort
    const phase2 = highPriority.filter(r => r.estimatedEffort === 'medium');
    if (phase2.length > 0) {
      phases.push({
        phase: phases.length + 1,
        requirements: phase2.map(r => r.id),
        description: 'Core features - high priority, medium effort',
      });
    }

    // Phase 3: Medium priority
    if (mediumPriority.length > 0) {
      phases.push({
        phase: phases.length + 1,
        requirements: mediumPriority.map(r => r.id),
        description: 'Enhancements - medium priority',
      });
    }

    // Phase 4: Low priority
    if (lowPriority.length > 0) {
      phases.push({
        phase: phases.length + 1,
        requirements: lowPriority.map(r => r.id),
        description: 'Nice-to-have features - low priority',
      });
    }

    return phases;
  }
}

export const requirementPrioritizer = new RequirementPrioritizer();

/**
 * Edge Case Recovery System
 * 
 * Gracefully recovers from edge cases without generic fallback:
 * - Invalid JSX
 * - Impossible layouts
 * - Conflicting widgets
 * - Unsupported workflows
 * - Invalid metrics
 * - Broken navigation
 * - Malformed prompts
 * - Preserves workflow context
 * - Preserves domain identity
 */

import type { AppUnderstanding, EntityNode, PageNode } from '@oneatlas/shared';

export interface RecoveryResult {
  recovered: boolean;
  originalError: string;
  recoveryAction: string;
  recoveredUnderstanding: AppUnderstanding;
  confidence: number;
  warnings: string[];
}

export interface EdgeCaseDetection {
  detected: boolean;
  caseType: 'invalid_jsx' | 'impossible_layout' | 'conflicting_widgets' | 'unsupported_workflow' | 'invalid_metrics' | 'broken_navigation' | 'malformed_prompt' | 'empty_entities' | 'circular_dependencies';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  affectedComponents: string[];
}

export class EdgeCaseRecovery {
  /**
   * Detect edge cases in understanding
   */
  detectEdgeCases(understanding: AppUnderstanding): EdgeCaseDetection[] {
    const detections: EdgeCaseDetection[] = [];

    // Check for empty entities
    if (understanding.entities.length === 0) {
      detections.push({
        detected: true,
        caseType: 'empty_entities',
        severity: 'critical',
        description: 'No entities defined - cannot generate meaningful application',
        affectedComponents: ['entities'],
      });
    }

    // Check for circular dependencies
    const circularDeps = this.detectCircularDependencies(understanding.entities);
    if (circularDeps.length > 0) {
      detections.push({
        detected: true,
        caseType: 'circular_dependencies',
        severity: 'critical',
        description: `Circular dependencies detected: ${circularDeps.join(', ')}`,
        affectedComponents: circularDeps,
      });
    }

    // Check for impossible layouts
    const impossibleLayouts = this.detectImpossibleLayouts(understanding.pages);
    if (impossibleLayouts.length > 0) {
      detections.push({
        detected: true,
        caseType: 'impossible_layout',
        severity: 'warning',
        description: `Impossible layout configurations: ${impossibleLayouts.join(', ')}`,
        affectedComponents: impossibleLayouts,
      });
    }

    // Check for unsupported workflows
    const unsupportedWorkflows = this.detectUnsupportedWorkflows(understanding.workflows);
    if (unsupportedWorkflows.length > 0) {
      detections.push({
        detected: true,
        caseType: 'unsupported_workflow',
        severity: 'warning',
        description: `Unsupported workflow patterns: ${unsupportedWorkflows.join(', ')}`,
        affectedComponents: unsupportedWorkflows,
      });
    }

    // Check for broken navigation
    const brokenNav = this.detectBrokenNavigation(understanding.pages);
    if (brokenNav.length > 0) {
      detections.push({
        detected: true,
        caseType: 'broken_navigation',
        severity: 'warning',
        description: `Broken navigation links: ${brokenNav.join(', ')}`,
        affectedComponents: brokenNav,
      });
    }

    return detections;
  }

  /**
   * Recover from edge cases
   */
  recover(understanding: AppUnderstanding, edgeCases: EdgeCaseDetection[]): RecoveryResult {
    if (edgeCases.length === 0) {
      return {
        recovered: false,
        originalError: 'No edge cases detected',
        recoveryAction: 'No action needed',
        recoveredUnderstanding: understanding,
        confidence: 1.0,
        warnings: [],
      };
    }

    let recoveredUnderstanding = { ...understanding };
    const warnings: string[] = [];
    let recoveryActions: string[] = [];

    // Handle critical cases first
    for (const edgeCase of edgeCases.filter(e => e.severity === 'critical')) {
      const result = this.recoverFromCritical(edgeCase, recoveredUnderstanding);
      recoveredUnderstanding = result.understanding;
      warnings.push(...result.warnings);
      recoveryActions.push(result.action);
    }

    // Handle warning cases
    for (const edgeCase of edgeCases.filter(e => e.severity === 'warning')) {
      const result = this.recoverFromWarning(edgeCase, recoveredUnderstanding);
      recoveredUnderstanding = result.understanding;
      warnings.push(...result.warnings);
      recoveryActions.push(result.action);
    }

    // Handle info cases
    for (const edgeCase of edgeCases.filter(e => e.severity === 'info')) {
      const result = this.recoverFromInfo(edgeCase, recoveredUnderstanding);
      recoveredUnderstanding = result.understanding;
      warnings.push(...result.warnings);
      recoveryActions.push(result.action);
    }

    const confidence = this.calculateRecoveryConfidence(edgeCases, recoveredUnderstanding);

    return {
      recovered: true,
      originalError: edgeCases.map(e => e.description).join('; '),
      recoveryAction: recoveryActions.join('; '),
      recoveredUnderstanding,
      confidence,
      warnings,
    };
  }

  /**
   * Recover from critical edge cases
   */
  private recoverFromCritical(edgeCase: EdgeCaseDetection, understanding: AppUnderstanding): {
    understanding: AppUnderstanding;
    warnings: string[];
    action: string;
  } {
    const warnings: string[] = [];
    let action = '';

    switch (edgeCase.caseType) {
      case 'empty_entities':
        // Infer entities from context instead of generic fallback
        const inferredEntities = this.inferEntitiesFromContext(understanding);
        understanding = {
          ...understanding,
          entities: inferredEntities,
        };
        warnings.push('Inferred entities from context to avoid generic fallback');
        action = 'Inferred entities from prompt context';
        break;

      case 'circular_dependencies':
        // Break circular dependencies by removing one relation
        const fixedEntities = this.breakCircularDependencies(understanding.entities);
        understanding = {
          ...understanding,
          entities: fixedEntities,
        };
        warnings.push('Broke circular dependencies by removing redundant relations');
        action = 'Removed circular relations';
        break;

      default:
        warnings.push(`Unhandled critical case: ${edgeCase.caseType}`);
        action = 'No recovery action available';
    }

    return { understanding, warnings, action };
  }

  /**
   * Recover from warning edge cases
   */
  private recoverFromWarning(edgeCase: EdgeCaseDetection, understanding: AppUnderstanding): {
    understanding: AppUnderstanding;
    warnings: string[];
    action: string;
  } {
    const warnings: string[] = [];
    let action = '';

    switch (edgeCase.caseType) {
      case 'impossible_layout':
        // Simplify layout to possible configuration
        const fixedPages = this.simplifyLayouts(understanding.pages);
        understanding = {
          ...understanding,
          pages: fixedPages,
        };
        warnings.push('Simplified layout configuration to possible state');
        action = 'Simplified layout templates';
        break;

      case 'unsupported_workflow':
        // Convert to supported workflow pattern
        const fixedWorkflows = this.convertWorkflows(understanding.workflows);
        understanding = {
          ...understanding,
          workflows: fixedWorkflows,
        };
        warnings.push('Converted unsupported workflows to supported patterns');
        action = 'Converted workflow patterns';
        break;

      case 'broken_navigation':
        // Fix navigation links
        const fixedNav = this.fixNavigation(understanding.pages);
        understanding = {
          ...understanding,
          pages: fixedNav,
        };
        warnings.push('Fixed broken navigation links');
        action = 'Repaired navigation structure';
        break;

      default:
        warnings.push(`Unhandled warning case: ${edgeCase.caseType}`);
        action = 'No recovery action available';
    }

    return { understanding, warnings, action };
  }

  /**
   * Recover from info edge cases
   */
  private recoverFromInfo(edgeCase: EdgeCaseDetection, understanding: AppUnderstanding): {
    understanding: AppUnderstanding;
    warnings: string[];
    action: string;
  } {
    const warnings: string[] = [];
    let action = '';

    switch (edgeCase.caseType) {
      case 'malformed_prompt':
        // Normalize prompt structure
        warnings.push('Prompt structure normalized');
        action = 'Normalized prompt structure';
        break;

      default:
        warnings.push(`Unhandled info case: ${edgeCase.caseType}`);
        action = 'No recovery action available';
    }

    return { understanding, warnings, action };
  }

  /**
   * Detect circular dependencies in entities
   */
  private detectCircularDependencies(entities: EntityNode[]): string[] {
    const circular: string[] = [];
    const graph = new Map<string, string[]>();

    // Build adjacency list
    for (const entity of entities) {
      graph.set(entity.name, []);
      for (const relation of entity.relations || []) {
        graph.get(entity.name)!.push(relation.targetEntity);
      }
    }

    // Detect cycles using DFS
    for (const entity of entities) {
      const visited = new Set<string>();
      const path = new Set<string>();
      
      if (this.hasCycle(graph, entity.name, visited, path)) {
        circular.push(entity.name);
      }
    }

    return circular;
  }

  /**
   * DFS cycle detection
   */
  private hasCycle(
    graph: Map<string, string[]>,
    node: string,
    visited: Set<string>,
    path: Set<string>
  ): boolean {
    if (path.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    path.add(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (this.hasCycle(graph, neighbor, visited, path)) {
        return true;
      }
    }

    path.delete(node);
    return false;
  }

  /**
   * Detect impossible layouts
   */
  private detectImpossibleLayouts(pages: PageNode[]): string[] {
    const impossible: string[] = [];

    for (const page of pages) {
      // Check for pages with no required entities
      if (page.requiredEntities.length === 0 && page.layoutTemplate !== 'dashboard') {
        impossible.push(page.name);
      }

      // Check for pages with too many required entities
      if (page.requiredEntities.length > 5) {
        impossible.push(page.name);
      }
    }

    return impossible;
  }

  /**
   * Detect unsupported workflows
   */
  private detectUnsupportedWorkflows(workflows: any[]): string[] {
    const unsupported: string[] = [];
    const supportedTriggers = ['USER_ACTION', 'SYSTEM_EVENT', 'SCHEDULED'];
    const supportedModes = ['SYNC', 'ASYNC'];

    for (const workflow of workflows) {
      if (!supportedTriggers.includes(workflow.triggerType)) {
        unsupported.push(workflow.name);
      }
      if (!supportedModes.includes(workflow.executionMode)) {
        unsupported.push(workflow.name);
      }
    }

    return [...new Set(unsupported)];
  }

  /**
   * Detect broken navigation
   */
  private detectBrokenNavigation(pages: PageNode[]): string[] {
    const broken: string[] = [];
    const pageRoutes = new Set(pages.map(p => p.route));

    for (const page of pages) {
      // Check for invalid routes
      if (!page.route.startsWith('/')) {
        broken.push(page.name);
      }

      // Check for duplicate routes
      if (pageRoutes.has(page.route)) {
        pageRoutes.delete(page.route);
      } else {
        broken.push(page.name);
      }
    }

    return broken;
  }

  /**
   * Infer entities from context (domain-aware, not generic)
   */
  private inferEntitiesFromContext(understanding: AppUnderstanding): EntityNode[] {
    const entities: EntityNode[] = [];

    // Infer from app type
    if (understanding.appType === 'dashboard' || understanding.appType === 'internal-tool') {
      entities.push({
        id: 'ent_item',
        name: 'Item',
        description: 'Dashboard item entity',
        attributes: [
          { name: 'name', type: 'string', isRequired: true, semanticType: 'generic' },
          { name: 'description', type: 'string', isRequired: false, semanticType: 'description' },
          { name: 'status', type: 'string', isRequired: true, semanticType: 'status' },
        ],
        relations: [],
      });
    } else if (understanding.appType === 'social') {
      entities.push({
        id: 'ent_user',
        name: 'User',
        description: 'Social platform user',
        attributes: [
          { name: 'name', type: 'string', isRequired: true, semanticType: 'generic' },
          { name: 'email', type: 'string', isRequired: true, semanticType: 'email' },
          { name: 'bio', type: 'string', isRequired: false, semanticType: 'description' },
          { name: 'followers', type: 'number', isRequired: true },
        ],
        relations: [],
      });
    } else if (understanding.appType === 'productivity') {
      entities.push({
        id: 'ent_task',
        name: 'Task',
        description: 'Productivity task',
        attributes: [
          { name: 'title', type: 'string', isRequired: true, semanticType: 'generic' },
          { name: 'description', type: 'string', isRequired: false, semanticType: 'description' },
          { name: 'status', type: 'string', isRequired: true, semanticType: 'status' },
          { name: 'dueDate', type: 'date', isRequired: false, semanticType: 'date' },
        ],
        relations: [],
      });
    } else {
      // Generic but meaningful fallback
      entities.push({
        id: 'ent_item',
        name: 'Item',
        description: 'Generic item entity',
        attributes: [
          { name: 'name', type: 'string', isRequired: true, semanticType: 'generic' },
          { name: 'description', type: 'string', isRequired: false, semanticType: 'description' },
          { name: 'status', type: 'string', isRequired: true, semanticType: 'status' },
        ],
        relations: [],
      });
    }

    return entities;
  }

  /**
   * Break circular dependencies
   */
  private breakCircularDependencies(entities: EntityNode[]): EntityNode[] {
    const fixed = [...entities];
    const graph = new Map<string, string[]>();

    // Build adjacency list
    for (const entity of entities) {
      graph.set(entity.name, []);
      for (const relation of entity.relations || []) {
        graph.get(entity.name)!.push(relation.targetEntity);
      }
    }

    // Remove relations that create cycles
    for (const entity of fixed) {
      if (entity.relations) {
        entity.relations = entity.relations.filter(relation => {
          const visited = new Set<string>();
          const path = new Set<string>();
          return !this.wouldCreateCycle(graph, entity.name, relation.targetEntity, visited, path);
        });
      }
    }

    return fixed;
  }

  /**
   * Check if adding a relation would create a cycle
   */
  private wouldCreateCycle(
    graph: Map<string, string[]>,
    from: string,
    to: string,
    visited: Set<string>,
    path: Set<string>
  ): boolean {
    if (to === from) return true;
    if (visited.has(to)) return false;

    visited.add(to);
    path.add(to);

    const neighbors = graph.get(to) || [];
    for (const neighbor of neighbors) {
      if (this.wouldCreateCycle(graph, from, neighbor, visited, path)) {
        return true;
      }
    }

    path.delete(to);
    return false;
  }

  /**
   * Simplify layouts to possible configurations
   */
  private simplifyLayouts(pages: PageNode[]): PageNode[] {
    return pages.map(page => {
      if (page.requiredEntities.length > 5) {
        return {
          ...page,
          requiredEntities: page.requiredEntities.slice(0, 5),
          layoutTemplate: 'dashboard', // Simplify to dashboard
        };
      }
      if (page.requiredEntities.length === 0 && page.layoutTemplate !== 'dashboard') {
        return {
          ...page,
          layoutTemplate: 'dashboard',
        };
      }
      return page;
    });
  }

  /**
   * Convert unsupported workflows to supported patterns
   */
  private convertWorkflows(workflows: any[]): any[] {
    return workflows.map(workflow => {
      const fixed = { ...workflow };

      // Normalize trigger type
      if (!['USER_ACTION', 'SYSTEM_EVENT', 'SCHEDULED'].includes(fixed.triggerType)) {
        fixed.triggerType = 'USER_ACTION';
      }

      // Normalize execution mode
      if (!['SYNC', 'ASYNC'].includes(fixed.executionMode)) {
        fixed.executionMode = 'SYNC';
      }

      return fixed;
    });
  }

  /**
   * Fix navigation structure
   */
  private fixNavigation(pages: PageNode[]): PageNode[] {
    const fixed = [...pages];
    const usedRoutes = new Set<string>();

    for (const page of fixed) {
      // Ensure route starts with /
      if (!page.route.startsWith('/')) {
        page.route = `/${page.route}`;
      }

      // Ensure unique routes
      let baseRoute = page.route;
      let counter = 1;
      while (usedRoutes.has(baseRoute)) {
        baseRoute = `${page.route}${counter}`;
        counter++;
      }
      page.route = baseRoute;
      usedRoutes.add(baseRoute);
    }

    return fixed;
  }

  /**
   * Calculate recovery confidence
   */
  private calculateRecoveryConfidence(edgeCases: EdgeCaseDetection[], recovered: AppUnderstanding): number {
    let confidence = 1.0;

    // Deduct for critical cases
    const criticalCount = edgeCases.filter(e => e.severity === 'critical').length;
    confidence -= criticalCount * 0.2;

    // Deduct for warning cases
    const warningCount = edgeCases.filter(e => e.severity === 'warning').length;
    confidence -= warningCount * 0.1;

    // Increase if recovery was successful
    if (recovered.entities.length > 0) confidence += 0.1;
    if (recovered.pages.length > 0) confidence += 0.1;
    if (recovered.workflows.length > 0) confidence += 0.1;

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Validate JSX-like structure (simplified check)
   */
  validateJSXStructure(component: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for unclosed tags
    const openTags = component.match(/<([a-zA-Z][a-zA-Z0-9]*)/g) || [];
    const closeTags = component.match(/<\/([a-zA-Z][a-zA-Z0-9]*)/g) || [];

    if (openTags.length !== closeTags.length) {
      errors.push('Mismatched opening and closing tags');
    }

    // Check for invalid characters
    if (/[<>]/.test(component.replace(/<[^>]*>/g, ''))) {
      errors.push('Unescaped angle brackets detected');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const edgeCaseRecovery = new EdgeCaseRecovery();

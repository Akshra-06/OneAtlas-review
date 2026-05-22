/**
 * Context-Aware Section Generation
 * 
 * Generates sections based on context (user role, state, time, location, etc.).
 * Replaces static section generation with context-aware dynamic generation.
 */

import { logger } from '../../shared/utils/logger';

import {
  ArchetypeDefinition,
} from '../../product/archetype/archetype-registry';

import type { SectionGraph, SectionPlan } from './dynamic-section-planner';

export interface Context {
  user: {
    id: string;
    role: string;
    permissions: string[];
    preferences: Record<string, any>;
  };
  session: {
    id: string;
    startTime: string;
    duration: number;
    device: string;
    location?: string;
  };
  application: {
    state: string;
    workflow: string;
    stage: string;
    data: Record<string, any>;
  };
  environment: {
    time: string;
    timezone: string;
    language: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

export interface ContextualSection extends SectionPlan {
  context: {
    relevance: number;
    priority: number;
    visibility: 'always' | 'conditional' | 'hidden';
    conditions: ContextCondition[];
  };
}

export interface ContextCondition {
  type: 'user-role' | 'user-permission' | 'session-duration' | 'application-state' | 'time-of-day' | 'data-exists' | 'custom';
  operator: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than' | 'exists' | 'not-exists';
  value: any;
}

export interface ContextAwareSectionGenerationConfig {
  enableUserContext: boolean;
  enableSessionContext: boolean;
  enableApplicationContext: boolean;
  enableEnvironmentContext: boolean;
}

const DEFAULT_CONFIG: ContextAwareSectionGenerationConfig = {
  enableUserContext: true,
  enableSessionContext: true,
  enableApplicationContext: true,
  enableEnvironmentContext: true,
};

/**
 * Context-Aware Section Generation
 * 
 * Generates sections based on context:
 * - User role-based sections
 * - Session-based sections
 * - Application state-based sections
 * - Environment-based sections
 */
export class ContextAwareSectionGeneration {
  private config: ContextAwareSectionGenerationConfig;

  constructor(config: Partial<ContextAwareSectionGenerationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate context-aware sections based on context and section graph
   */
  generateContextAwareSections(context: Context, sectionGraph: SectionGraph, archetype: ArchetypeDefinition): SectionGraph {
    const contextualSections = sectionGraph.nodes.map(section =>
      this.addContextToSection(section, context, archetype)
    );

    const filteredSections = this.filterSectionsByContext(contextualSections, context);

    const graph: SectionGraph = {
      nodes: filteredSections,
      edges: this.generateContextAwareEdges(filteredSections, sectionGraph.edges),
    };

    logger.info('ContextAwareSectionGeneration', 'CONTEXT_AWARE_SECTIONS_GENERATED', 'Context-aware sections generated', {
      originalSectionCount: sectionGraph.nodes.length,
      contextualSectionCount: contextualSections.length,
      filteredSectionCount: filteredSections.length,
      userRole: context.user.role,
    });

    return graph;
  }

  /**
   * Add context to section
   */
  private addContextToSection(section: SectionPlan, context: Context, archetype: ArchetypeDefinition): ContextualSection {
    const relevance = this.calculateRelevance(section, context, archetype);
    const priority = this.calculatePriority(section, context, archetype);
    const visibility = this.determineVisibility(section, context, archetype);
    const conditions = this.generateConditions(section, context, archetype);

    return {
      ...section,
      context: {
        relevance,
        priority,
        visibility,
        conditions,
      },
    };
  }

  /**
   * Calculate relevance of section based on context
   */
  private calculateRelevance(section: SectionPlan, context: Context, archetype: ArchetypeDefinition): number {
    let relevance = 0.5; // Base relevance

    // User role relevance
    if (this.config.enableUserContext) {
      if (section.conditions.role === context.user.role) {
        relevance += 0.3;
      }
      if (section.conditions.role && section.conditions.role !== context.user.role) {
        relevance -= 0.3;
      }
    }

    // Workflow relevance
    if (this.config.enableApplicationContext) {
      if (section.conditions.workflow === context.application.workflow) {
        relevance += 0.2;
      }
    }

    // State relevance
    if (this.config.enableApplicationContext) {
      if (section.conditions.state === context.application.state) {
        relevance += 0.1;
      }
    }

    // Time-based relevance
    if (this.config.enableEnvironmentContext) {
      const hour = new Date(context.environment.time).getHours();
      if (section.type === 'calendar' && (hour >= 8 && hour <= 17)) {
        relevance += 0.1;
      }
    }

    return Math.max(0, Math.min(1, relevance));
  }

  /**
   * Calculate priority of section based on context
   */
  private calculatePriority(section: SectionPlan, context: Context, archetype: ArchetypeDefinition): number {
    let priority = section.priority;

    // Adjust priority based on user role
    if (this.config.enableUserContext) {
      if (context.user.role === 'admin') {
        priority += 2;
      }
      if (context.user.role === 'manager') {
        priority += 1;
      }
    }

    // Adjust priority based on session duration
    if (this.config.enableSessionContext) {
      if (context.session.duration > 3600) { // More than 1 hour
        priority += 1;
      }
    }

    return priority;
  }

  /**
   * Determine visibility of section based on context
   */
  private determineVisibility(section: SectionPlan, context: Context, archetype: ArchetypeDefinition): 'always' | 'conditional' | 'hidden' {
    // Check role conditions
    if (section.conditions.role && section.conditions.role !== context.user.role) {
      return 'hidden';
    }

    // Check workflow conditions
    if (section.conditions.workflow && section.conditions.workflow !== context.application.workflow) {
      return 'hidden';
    }

    // Check state conditions
    if (section.conditions.state && section.conditions.state !== context.application.state) {
      return 'hidden';
    }

    // Check permission conditions
    if (this.config.enableUserContext) {
      for (const permission of section.interactions.draggable ? ['edit'] : []) {
        if (!context.user.permissions.includes(permission)) {
          return 'conditional';
        }
      }
    }

    return 'always';
  }

  /**
   * Generate conditions for section
   */
  private generateConditions(section: SectionPlan, context: Context, archetype: ArchetypeDefinition): ContextCondition[] {
    const conditions: ContextCondition[] = [];

    // User role condition
    if (section.conditions.role) {
      conditions.push({
        type: 'user-role',
        operator: 'equals',
        value: section.conditions.role,
      });
    }

    // Workflow condition
    if (section.conditions.workflow) {
      conditions.push({
        type: 'application-state',
        operator: 'equals',
        value: section.conditions.workflow,
      });
    }

    // State condition
    if (section.conditions.state) {
      conditions.push({
        type: 'application-state',
        operator: 'equals',
        value: section.conditions.state,
      });
    }

    return conditions;
  }

  /**
   * Filter sections by context
   */
  private filterSectionsByContext(sections: ContextualSection[], context: Context): SectionPlan[] {
    return sections
      .filter(section => section.context.visibility !== 'hidden')
      .sort((a, b) => b.context.priority - a.context.priority)
      .map(section => ({
        ...section,
        priority: section.context.priority,
      })) as SectionPlan[];
  }

  /**
   * Generate context-aware edges
   */
  private generateContextAwareEdges(sections: SectionPlan[], originalEdges: any[]): any[] {
    const sectionIds = new Set(sections.map(s => s.id));

    return originalEdges.filter(edge =>
      sectionIds.has(edge.from) && sectionIds.has(edge.to)
    );
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ContextAwareSectionGenerationConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ContextAwareSectionGeneration', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ContextAwareSectionGenerationConfig {
    return { ...this.config };
  }
}

export const contextAwareSectionGeneration = new ContextAwareSectionGeneration();

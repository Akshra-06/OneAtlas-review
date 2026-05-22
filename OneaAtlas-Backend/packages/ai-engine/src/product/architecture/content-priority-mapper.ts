/**
 * Content Priority Mapper
 * 
 * Maps content priority based on context and workflow.
 * Determines content importance and placement.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';

export interface ContentPriority {
  contentId: string;
  priority: number;
  reason: string;
  placement: 'primary' | 'secondary' | 'tertiary' | 'hidden';
}

export interface PriorityMapperConfig {
  enableAutoMapping: boolean;
  enableWorkflowAlignment: boolean;
  enableContextAwareness: boolean;
}

const DEFAULT_CONFIG: PriorityMapperConfig = {
  enableAutoMapping: true,
  enableWorkflowAlignment: true,
  enableContextAwareness: true,
};

/**
 * Content Priority Mapper
 * 
 * Maps content priority:
 * - Priority calculation
 * - Workflow alignment
 * - Context awareness
 * - Placement determination
 */
export class ContentPriorityMapper {
  private config: PriorityMapperConfig;

  constructor(config: Partial<PriorityMapperConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Map content priorities
   */
  mapPriorities(content: string[], archetype: ArchetypeDefinition, workflow?: string): ContentPriority[] {
    const priorities: ContentPriority[] = [];

    for (let i = 0; i < content.length; i++) {
      const item = content[i];
      if (!item) continue;

      const priority = this.calculatePriority(item, archetype, workflow, i);
      priorities.push(priority);
    }

    // Sort by priority
    priorities.sort((a, b) => b.priority - a.priority);

    logger.info('ContentPriorityMapper', 'PRIORITIES_MAPPED', 'Content priorities mapped', {
      archetype: archetype.id,
      contentCount: content.length,
      priorityCount: priorities.length,
    });

    return priorities;
  }

  /**
   * Calculate priority for content item
   */
  private calculatePriority(item: string, archetype: ArchetypeDefinition, workflow?: string, index?: number): ContentPriority {
    let priority = 0.5; // Base priority
    const reasons: string[] = [];

    const lowerItem = item.toLowerCase();

    // Check archetype visual hierarchy
    if (lowerItem.includes(archetype.visualHierarchyRules.primaryEmphasis.toLowerCase())) {
      priority += 0.3;
      reasons.push('matches primary emphasis');
    } else if (lowerItem.includes(archetype.visualHierarchyRules.secondaryEmphasis.toLowerCase())) {
      priority += 0.2;
      reasons.push('matches secondary emphasis');
    } else if (lowerItem.includes(archetype.visualHierarchyRules.tertiaryEmphasis.toLowerCase())) {
      priority += 0.1;
      reasons.push('matches tertiary emphasis');
    }

    // Workflow alignment
    if (this.config.enableWorkflowAlignment && workflow) {
      const workflowScore = this.calculateWorkflowScore(lowerItem, workflow);
      priority += workflowScore;
      if (workflowScore > 0) {
        reasons.push('aligns with workflow');
      }
    }

    // Position-based priority (earlier items get slight boost)
    if (index !== undefined && index < 3) {
      priority += (3 - index) * 0.05;
      reasons.push('early position');
    }

    // Cap at 1.0
    priority = Math.min(priority, 1.0);

    // Determine placement
    const placement = this.determinePlacement(priority);

    return {
      contentId: item,
      priority,
      reason: reasons.join(', ') || 'default priority',
      placement,
    };
  }

  /**
   * Calculate workflow score
   */
  private calculateWorkflowScore(item: string, workflow: string): number {
    const lowerWorkflow = workflow.toLowerCase();

    // Workflow-specific keyword matching
    const workflowKeywords: Record<string, string[]> = {
      monitor: ['alert', 'status', 'monitor', 'real-time', 'live'],
      analyze: ['chart', 'graph', 'metric', 'data', 'insight'],
      collaborate: ['chat', 'message', 'team', 'share', 'comment'],
      operate: ['task', 'action', 'process', 'workflow', 'operation'],
      schedule: ['calendar', 'timeline', 'schedule', 'appointment', 'booking'],
      sell: ['pipeline', 'deal', 'lead', 'customer', 'sales'],
      support: ['ticket', 'issue', 'help', 'support', 'resolve'],
    };

    for (const [key, keywords] of Object.entries(workflowKeywords)) {
      if (lowerWorkflow.includes(key)) {
        for (const keyword of keywords) {
          if (item.includes(keyword)) {
            return 0.2;
          }
        }
      }
    }

    return 0;
  }

  /**
   * Determine placement based on priority
   */
  private determinePlacement(priority: number): ContentPriority['placement'] {
    if (priority >= 0.8) {
      return 'primary';
    } else if (priority >= 0.5) {
      return 'secondary';
    } else if (priority >= 0.3) {
      return 'tertiary';
    } else {
      return 'hidden';
    }
  }

  /**
   * Get content by placement
   */
  getContentByPlacement(priorities: ContentPriority[], placement: ContentPriority['placement']): ContentPriority[] {
    return priorities.filter(p => p.placement === placement);
  }

  /**
   * Get primary content
   */
  getPrimaryContent(priorities: ContentPriority[]): ContentPriority[] {
    return this.getContentByPlacement(priorities, 'primary');
  }

  /**
   * Get secondary content
   */
  getSecondaryContent(priorities: ContentPriority[]): ContentPriority[] {
    return this.getContentByPlacement(priorities, 'secondary');
  }

  /**
   * Get tertiary content
   */
  getTertiaryContent(priorities: ContentPriority[]): ContentPriority[] {
    return this.getContentByPlacement(priorities, 'tertiary');
  }

  /**
   * Get hidden content
   */
  getHiddenContent(priorities: ContentPriority[]): ContentPriority[] {
    return this.getContentByPlacement(priorities, 'hidden');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PriorityMapperConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ContentPriorityMapper', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): PriorityMapperConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: PriorityMapperConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const contentPriorityMapper = new ContentPriorityMapper();

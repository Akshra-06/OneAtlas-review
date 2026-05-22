/**
 * Task Priority Engine
 * 
 * Prioritizes tasks based on workflow and context.
 * Determines task importance and placement.
 */

import { logger } from '../../shared/utils/logger';

export interface Task {
  id: string;
  name: string;
  type: 'create' | 'read' | 'update' | 'delete' | 'custom';
  frequency: number;
  importance: number;
  urgency: number;
  dependencies: string[];
}

export interface TaskPriority {
  taskId: string;
  priority: number;
  reasoning: string;
  placement: 'primary' | 'secondary' | 'tertiary' | 'hidden';
}

export interface TaskPriorityEngineConfig {
  enableFrequencyWeighting: boolean;
  enableUrgencyWeighting: boolean;
  enableDependencyAnalysis: boolean;
}

const DEFAULT_CONFIG: TaskPriorityEngineConfig = {
  enableFrequencyWeighting: true,
  enableUrgencyWeighting: true,
  enableDependencyAnalysis: true,
};

/**
 * Task Priority Engine
 * 
 * Prioritizes tasks:
 * - Frequency-based prioritization
 * - Urgency-based prioritization
 * - Dependency analysis
 * - Task placement
 */
export class TaskPriorityEngine {
  private config: TaskPriorityEngineConfig;

  constructor(config: Partial<TaskPriorityEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Prioritize tasks
   */
  prioritizeTasks(tasks: Task[]): TaskPriority[] {
    const priorities: TaskPriority[] = [];

    for (const task of tasks) {
      const priority = this.calculateTaskPriority(task);
      priorities.push(priority);
    }

    // Sort by priority
    priorities.sort((a, b) => b.priority - a.priority);

    logger.info('TaskPriorityEngine', 'TASKS_PRIORITIZED', 'Tasks prioritized', {
      taskCount: tasks.length,
      priorityCount: priorities.length,
    });

    return priorities;
  }

  /**
   * Calculate priority for a task
   */
  private calculateTaskPriority(task: Task): TaskPriority {
    let priority = 0.5; // Base priority
    const reasons: string[] = [];

    // Frequency weighting
    if (this.config.enableFrequencyWeighting) {
      const frequencyWeight = task.frequency * 0.3;
      priority += frequencyWeight;
      if (task.frequency > 0.7) {
        reasons.push('high frequency');
      }
    }

    // Urgency weighting
    if (this.config.enableUrgencyWeighting) {
      const urgencyWeight = task.urgency * 0.4;
      priority += urgencyWeight;
      if (task.urgency > 0.7) {
        reasons.push('high urgency');
      }
    }

    // Importance weighting
    const importanceWeight = task.importance * 0.3;
    priority += importanceWeight;
    if (task.importance > 0.7) {
      reasons.push('high importance');
    }

    // Dependency analysis
    if (this.config.enableDependencyAnalysis) {
      const dependencyPenalty = task.dependencies.length * 0.05;
      priority -= dependencyPenalty;
      if (task.dependencies.length > 0) {
        reasons.push('has dependencies');
      }
    }

    // Cap at 1.0
    priority = Math.max(0, Math.min(priority, 1.0));

    // Determine placement
    const placement = this.determinePlacement(priority);

    return {
      taskId: task.id,
      priority,
      reasoning: reasons.join(', ') || 'default priority',
      placement,
    };
  }

  /**
   * Determine placement based on priority
   */
  private determinePlacement(priority: number): TaskPriority['placement'] {
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
   * Get tasks by placement
   */
  getTasksByPlacement(priorities: TaskPriority[], placement: TaskPriority['placement']): TaskPriority[] {
    return priorities.filter(p => p.placement === placement);
  }

  /**
   * Get primary tasks
   */
  getPrimaryTasks(priorities: TaskPriority[]): TaskPriority[] {
    return this.getTasksByPlacement(priorities, 'primary');
  }

  /**
   * Get secondary tasks
   */
  getSecondaryTasks(priorities: TaskPriority[]): TaskPriority[] {
    return this.getTasksByPlacement(priorities, 'secondary');
  }

  /**
   * Get tertiary tasks
   */
  getTertiaryTasks(priorities: TaskPriority[]): TaskPriority[] {
    return this.getTasksByPlacement(priorities, 'tertiary');
  }

  /**
   * Get hidden tasks
   */
  getHiddenTasks(priorities: TaskPriority[]): TaskPriority[] {
    return this.getTasksByPlacement(priorities, 'hidden');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TaskPriorityEngineConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('TaskPriorityEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): TaskPriorityEngineConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: TaskPriorityEngineConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const taskPriorityEngine = new TaskPriorityEngine();

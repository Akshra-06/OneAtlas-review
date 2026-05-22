/**
 * Microinteraction Engine
 * 
 * Generates intelligent microinteractions.
 * Creates subtle, contextual UI animations and feedback.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';

export interface Microinteraction {
  id: string;
  trigger: string;
  type: 'hover' | 'click' | 'focus' | 'scroll' | 'load';
  animation: string;
  duration: number;
  easing: string;
}

export interface MicrointeractionEngineConfig {
  enableAutoGeneration: boolean;
  enableContextAwareness: boolean;
  enablePerformanceOptimization: boolean;
}

const DEFAULT_CONFIG: MicrointeractionEngineConfig = {
  enableAutoGeneration: true,
  enableContextAwareness: true,
  enablePerformanceOptimization: true,
};

/**
 * Microinteraction Engine
 * 
 * Generates microinteractions:
 * - Hover effects
 * - Click feedback
 * - Focus states
 * - Scroll animations
 * - Load animations
 */
export class MicrointeractionEngine {
  private config: MicrointeractionEngineConfig;

  constructor(config: Partial<MicrointeractionEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate microinteractions for archetype
   */
  generateMicrointeractions(archetype: ArchetypeDefinition): Microinteraction[] {
    const interactions: Microinteraction[] = [];

    if (!this.config.enableAutoGeneration) {
      return interactions;
    }

    // Generate hover interactions
    interactions.push(...this.generateHoverInteractions(archetype));

    // Generate click interactions
    interactions.push(...this.generateClickInteractions(archetype));

    // Generate focus interactions
    interactions.push(...this.generateFocusInteractions(archetype));

    // Generate scroll interactions
    interactions.push(...this.generateScrollInteractions(archetype));

    // Generate load interactions
    interactions.push(...this.generateLoadInteractions(archetype));

    logger.info('MicrointeractionEngine', 'MICROINTERACTIONS_GENERATED', 'Microinteractions generated', {
      archetype: archetype.id,
      interactionCount: interactions.length,
    });

    return interactions;
  }

  /**
   * Generate hover interactions
   */
  private generateHoverInteractions(archetype: ArchetypeDefinition): Microinteraction[] {
    const interactions: Microinteraction[] = [];

    interactions.push({
      id: crypto.randomUUID(),
      trigger: 'button',
      type: 'hover',
      animation: 'scale_up',
      duration: 200,
      easing: 'ease-out',
    });

    interactions.push({
      id: crypto.randomUUID(),
      trigger: 'card',
      type: 'hover',
      animation: 'lift',
      duration: 300,
      easing: 'ease-out',
    });

    // Archetype-specific hover interactions
    if (archetype.interactionPatterns.includes('hover')) {
      interactions.push({
        id: crypto.randomUUID(),
        trigger: 'list_item',
        type: 'hover',
        animation: 'highlight',
        duration: 150,
        easing: 'ease-in-out',
      });
    }

    return interactions;
  }

  /**
   * Generate click interactions
   */
  private generateClickInteractions(archetype: ArchetypeDefinition): Microinteraction[] {
    const interactions: Microinteraction[] = [];

    interactions.push({
      id: crypto.randomUUID(),
      trigger: 'button',
      type: 'click',
      animation: 'ripple',
      duration: 400,
      easing: 'ease-out',
    });

    interactions.push({
      id: crypto.randomUUID(),
      trigger: 'link',
      type: 'click',
      animation: 'fade',
      duration: 200,
      easing: 'ease-in',
    });

    return interactions;
  }

  /**
   * Generate focus interactions
   */
  private generateFocusInteractions(archetype: ArchetypeDefinition): Microinteraction[] {
    const interactions: Microinteraction[] = [];

    interactions.push({
      id: crypto.randomUUID(),
      trigger: 'input',
      type: 'focus',
      animation: 'glow',
      duration: 200,
      easing: 'ease-out',
    });

    interactions.push({
      id: crypto.randomUUID(),
      trigger: 'select',
      type: 'focus',
      animation: 'border_highlight',
      duration: 150,
      easing: 'ease-out',
    });

    return interactions;
  }

  /**
   * Generate scroll interactions
   */
  private generateScrollInteractions(archetype: ArchetypeDefinition): Microinteraction[] {
    const interactions: Microinteraction[] = [];

    if (!this.config.enablePerformanceOptimization) {
      return interactions;
    }

    interactions.push({
      id: crypto.randomUUID(),
      trigger: 'section',
      type: 'scroll',
      animation: 'fade_in_up',
      duration: 500,
      easing: 'ease-out',
    });

    // Archetype-specific scroll interactions
    if (archetype.workflowEmphasis === 'monitoring') {
      interactions.push({
        id: crypto.randomUUID(),
        trigger: 'chart',
        type: 'scroll',
        animation: 'scale_in',
        duration: 400,
        easing: 'ease-out',
      });
    }

    return interactions;
  }

  /**
   * Generate load interactions
   */
  private generateLoadInteractions(archetype: ArchetypeDefinition): Microinteraction[] {
    const interactions: Microinteraction[] = [];

    interactions.push({
      id: crypto.randomUUID(),
      trigger: 'page',
      type: 'load',
      animation: 'fade_in',
      duration: 300,
      easing: 'ease-in',
    });

    interactions.push({
      id: crypto.randomUUID(),
      trigger: 'component',
      type: 'load',
      animation: 'slide_up',
      duration: 400,
      easing: 'ease-out',
    });

    return interactions;
  }

  /**
   * Get interactions by type
   */
  getInteractionsByType(interactions: Microinteraction[], type: Microinteraction['type']): Microinteraction[] {
    return interactions.filter(i => i.type === type);
  }

  /**
   * Get interactions by trigger
   */
  getInteractionsByTrigger(interactions: Microinteraction[], trigger: string): Microinteraction[] {
    return interactions.filter(i => i.trigger === trigger);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MicrointeractionEngineConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('MicrointeractionEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): MicrointeractionEngineConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: MicrointeractionEngineConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const microinteractionEngine = new MicrointeractionEngine();

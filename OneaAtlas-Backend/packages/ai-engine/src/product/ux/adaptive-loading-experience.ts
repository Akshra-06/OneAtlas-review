/**
 * Adaptive Loading Experience
 * 
 * Generates adaptive loading experiences.
 * Creates intelligent loading states and transitions.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';

export interface LoadingExperience {
  id: string;
  type: 'skeleton' | 'spinner' | 'progress' | 'shimmer';
  animation: string;
  duration: number;
  message: string;
  showProgress: boolean;
}

export interface LoadingExperienceConfig {
  enableAutoGeneration: boolean;
  enableContextAwareness: boolean;
  enableProgressiveLoading: boolean;
}

const DEFAULT_CONFIG: LoadingExperienceConfig = {
  enableAutoGeneration: true,
  enableContextAwareness: true,
  enableProgressiveLoading: true,
};

/**
 * Adaptive Loading Experience
 * 
 * Generates adaptive loading experiences:
 * - Skeleton screens
 * - Spinners
 * - Progress indicators
 * - Shimmer effects
 */
export class AdaptiveLoadingExperience {
  private config: LoadingExperienceConfig;

  constructor(config: Partial<LoadingExperienceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate loading experience
   */
  generateLoadingExperience(context: string, archetype: ArchetypeDefinition): LoadingExperience {
    const loadingExperience: LoadingExperience = {
      id: crypto.randomUUID(),
      type: this.selectLoadingType(context, archetype),
      animation: this.selectAnimation(context, archetype),
      duration: this.calculateDuration(archetype),
      message: this.generateMessage(context, archetype),
      showProgress: this.shouldShowProgress(archetype),
    };

    logger.info('AdaptiveLoadingExperience', 'LOADING_EXPERIENCE_GENERATED', 'Loading experience generated', {
      context,
      archetype: archetype.id,
      type: loadingExperience.type,
    });

    return loadingExperience;
  }

  /**
   * Select loading type
   */
  private selectLoadingType(context: string, archetype: ArchetypeDefinition): LoadingExperience['type'] {
    const lowerContext = context.toLowerCase();

    // Context-specific loading types
    if (lowerContext.includes('list') || lowerContext.includes('table') || lowerContext.includes('card')) {
      return 'skeleton';
    } else if (lowerContext.includes('chart') || lowerContext.includes('graph')) {
      return 'shimmer';
    } else if (lowerContext.includes('form') || lowerContext.includes('input')) {
      return 'skeleton';
    } else if (lowerContext.includes('upload') || lowerContext.includes('download')) {
      return 'progress';
    } else {
      return 'spinner';
    }
  }

  /**
   * Select animation
   */
  private selectAnimation(context: string, archetype: ArchetypeDefinition): string {
    const lowerContext = context.toLowerCase();

    // Context-specific animations
    if (lowerContext.includes('chart') || lowerContext.includes('graph')) {
      return 'fade_scale';
    } else if (lowerContext.includes('list') || lowerContext.includes('table')) {
      return 'slide_up';
    } else if (lowerContext.includes('card')) {
      return 'fade_in';
    } else {
      return 'fade';
    }
  }

  /**
   * Calculate duration
   */
  private calculateDuration(archetype: ArchetypeDefinition): number {
    // Adjust duration based on archetype density
    switch (archetype.layoutDensity) {
      case 'dense':
        return 500;
      case 'compact':
        return 700;
      case 'comfortable':
        return 1000;
      case 'spacious':
        return 1200;
      default:
        return 800;
    }
  }

  /**
   * Generate loading message
   */
  private generateMessage(context: string, archetype: ArchetypeDefinition): string {
    const lowerContext = context.toLowerCase();

    // Domain-specific messages
    if (archetype.id === 'healthcare_workspace') {
      if (lowerContext.includes('patient')) {
        return 'Loading patient data...';
      } else if (lowerContext.includes('appointment')) {
        return 'Loading appointments...';
      } else {
        return 'Loading data...';
      }
    }

    if (archetype.id === 'crm_pipeline') {
      if (lowerContext.includes('lead')) {
        return 'Loading leads...';
      } else if (lowerContext.includes('deal')) {
        return 'Loading deals...';
      } else {
        return 'Loading data...';
      }
    }

    if (archetype.id === 'ecommerce_console') {
      if (lowerContext.includes('order')) {
        return 'Loading orders...';
      } else if (lowerContext.includes('product')) {
        return 'Loading products...';
      } else {
        return 'Loading data...';
      }
    }

    // Generic message
    return `Loading ${this.formatContext(context).toLowerCase()}...`;
  }

  /**
   * Determine if progress should be shown
   */
  private shouldShowProgress(archetype: ArchetypeDefinition): boolean {
    // Show progress for data-intensive archetypes
    return archetype.workflowEmphasis === 'monitoring' || archetype.workflowEmphasis === 'data';
  }

  /**
   * Format context
   */
  private formatContext(context: string): string {
    return context
      .split(/[_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Generate progressive loading steps
   */
  generateProgressiveSteps(context: string, archetype: ArchetypeDefinition): string[] {
    const steps: string[] = [];

    if (!this.config.enableProgressiveLoading) {
      return steps;
    }

    const lowerContext = context.toLowerCase();

    // Common progressive steps
    steps.push('Initializing...');
    steps.push('Loading data...');
    steps.push('Processing...');
    steps.push('Almost done...');

    // Context-specific steps
    if (lowerContext.includes('chart') || lowerContext.includes('graph')) {
      steps.splice(2, 0, 'Rendering visualization...');
    }

    if (lowerContext.includes('list') || lowerContext.includes('table')) {
      steps.splice(2, 0, 'Populating list...');
    }

    return steps;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LoadingExperienceConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('AdaptiveLoadingExperience', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): LoadingExperienceConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: LoadingExperienceConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const adaptiveLoadingExperience = new AdaptiveLoadingExperience();

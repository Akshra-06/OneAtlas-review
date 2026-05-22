/**
 * Animation Controller
 * 
 * Controls animations for streaming UX.
 * Manages smooth transitions and animations.
 */

import { logger } from '../../shared/utils/logger';

export interface Animation {
  id: string;
  sessionId: string;
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'bounce';
  duration: number;
  delay: number;
  easing: string;
  timestamp: number;
}

export interface AnimationConfig {
  enableAnimations: boolean;
  defaultDurationMs: number;
  defaultDelayMs: number;
  defaultEasing: string;
}

const DEFAULT_CONFIG: AnimationConfig = {
  enableAnimations: true,
  defaultDurationMs: 300,
  defaultDelayMs: 0,
  defaultEasing: 'ease-in-out',
};

/**
 * Animation Controller
 * 
 * Controls animations:
 * - Animation scheduling
 * - Animation sequencing
 * - Animation cancellation
 * - Animation history
 */
export class AnimationController {
  private config: AnimationConfig;
  private animations: Map<string, Animation[]> = new Map();
  private activeAnimations: Map<string, Set<string>> = new Map();

  constructor(config: Partial<AnimationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Schedule an animation
   */
  scheduleAnimation(
    sessionId: string,
    type: Animation['type'],
    duration?: number,
    delay?: number,
    easing?: string
  ): Animation {
    const animation: Animation = {
      id: crypto.randomUUID(),
      sessionId,
      type,
      duration: duration ?? this.config.defaultDurationMs,
      delay: delay ?? this.config.defaultDelayMs,
      easing: easing ?? this.config.defaultEasing,
      timestamp: Date.now(),
    };

    if (!this.animations.has(sessionId)) {
      this.animations.set(sessionId, []);
    }

    this.animations.get(sessionId)!.push(animation);

    // Add to active animations
    if (!this.activeAnimations.has(sessionId)) {
      this.activeAnimations.set(sessionId, new Set());
    }
    this.activeAnimations.get(sessionId)!.add(animation.id);

    logger.info('AnimationController', 'ANIMATION_SCHEDULED', 'Animation scheduled', {
      sessionId,
      animationId: animation.id,
      type,
      duration: animation.duration,
    });

    return animation;
  }

  /**
   * Complete an animation
   */
  completeAnimation(sessionId: string, animationId: string): void {
    const activeAnimations = this.activeAnimations.get(sessionId);
    if (activeAnimations) {
      activeAnimations.delete(animationId);

      logger.info('AnimationController', 'ANIMATION_COMPLETED', 'Animation completed', {
        sessionId,
        animationId,
      });
    }
  }

  /**
   * Cancel an animation
   */
  cancelAnimation(sessionId: string, animationId: string): boolean {
    const activeAnimations = this.activeAnimations.get(sessionId);
    if (!activeAnimations || !activeAnimations.has(animationId)) {
      return false;
    }

    activeAnimations.delete(animationId);

    logger.info('AnimationController', 'ANIMATION_CANCELLED', 'Animation cancelled', {
      sessionId,
      animationId,
    });

    return true;
  }

  /**
   * Cancel all animations for a session
   */
  cancelAllAnimations(sessionId: string): number {
    const activeAnimations = this.activeAnimations.get(sessionId);
    if (!activeAnimations) {
      return 0;
    }

    const count = activeAnimations.size;
    activeAnimations.clear();

    logger.info('AnimationController', 'ALL_ANIMATIONS_CANCELLED', 'All animations cancelled', {
      sessionId,
      count,
    });

    return count;
  }

  /**
   * Get animations for a session
   */
  getAnimations(sessionId: string): Animation[] {
    return this.animations.get(sessionId) || [];
  }

  /**
   * Get active animations for a session
   */
  getActiveAnimations(sessionId: string): Animation[] {
    const activeAnimationIds = this.activeAnimations.get(sessionId);
    if (!activeAnimationIds) {
      return [];
    }

    const sessionAnimations = this.animations.get(sessionId);
    if (!sessionAnimations) {
      return [];
    }

    return sessionAnimations.filter(a => activeAnimationIds.has(a.id));
  }

  /**
   * Get animation by ID
   */
  getAnimation(animationId: string): Animation | undefined {
    for (const sessionAnimations of this.animations.values()) {
      const animation = sessionAnimations.find(a => a.id === animationId);
      if (animation) {
        return animation;
      }
    }
    return undefined;
  }

  /**
   * Clear animations for a session
   */
  clearAnimations(sessionId: string): void {
    this.animations.delete(sessionId);
    this.activeAnimations.delete(sessionId);

    logger.info('AnimationController', 'ANIMATIONS_CLEARED', 'Animations cleared', {
      sessionId,
    });
  }

  /**
   * Clear all animations
   */
  clearAll(): void {
    this.animations.clear();
    this.activeAnimations.clear();

    logger.info('AnimationController', 'ALL_CLEARED', 'All animations cleared');
  }

  /**
   * Schedule a fade animation
   */
  scheduleFade(sessionId: string, duration?: number, delay?: number): Animation {
    return this.scheduleAnimation(sessionId, 'fade', duration, delay);
  }

  /**
   * Schedule a slide animation
   */
  scheduleSlide(sessionId: string, duration?: number, delay?: number): Animation {
    return this.scheduleAnimation(sessionId, 'slide', duration, delay);
  }

  /**
   * Schedule a scale animation
   */
  scheduleScale(sessionId: string, duration?: number, delay?: number): Animation {
    return this.scheduleAnimation(sessionId, 'scale', duration, delay);
  }

  /**
   * Schedule a rotate animation
   */
  scheduleRotate(sessionId: string, duration?: number, delay?: number): Animation {
    return this.scheduleAnimation(sessionId, 'rotate', duration, delay);
  }

  /**
   * Schedule a bounce animation
   */
  scheduleBounce(sessionId: string, duration?: number, delay?: number): Animation {
    return this.scheduleAnimation(sessionId, 'bounce', duration, delay);
  }

  /**
   * Get active animation count for a session
   */
  getActiveAnimationCount(sessionId: string): number {
    return this.activeAnimations.get(sessionId)?.size || 0;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('AnimationController', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): AnimationConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    totalAnimations: number;
    activeAnimations: number;
    config: AnimationConfig;
  } {
    const totalSessions = this.animations.size;
    const totalAnimations = Array.from(this.animations.values()).reduce(
      (sum, animations) => sum + animations.length,
      0
    );
    const activeAnimations = Array.from(this.activeAnimations.values()).reduce(
      (sum, active) => sum + active.size,
      0
    );

    return {
      totalSessions,
      totalAnimations,
      activeAnimations,
      config: this.getConfig(),
    };
  }
}

export const animationController = new AnimationController();

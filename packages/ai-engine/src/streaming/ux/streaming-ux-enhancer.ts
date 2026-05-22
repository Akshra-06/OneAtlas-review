/**
 * Streaming UX Enhancer
 * 
 * Enhances streaming UX for perceived intelligence.
 * Provides intelligent loading states and transitions.
 */

import { logger } from '../../shared/utils/logger';

export interface UXEnhancement {
  type: 'loading' | 'progress' | 'success' | 'error' | 'info';
  message: string;
  details?: string;
  timestamp: number;
}

export interface UXConfig {
  enableSmartLoading: boolean;
  enableProgressiveReveal: boolean;
  enableIntelligentTransitions: boolean;
  transitionDurationMs: number;
}

const DEFAULT_CONFIG: UXConfig = {
  enableSmartLoading: true,
  enableProgressiveReveal: true,
  enableIntelligentTransitions: true,
  transitionDurationMs: 300,
};

/**
 * Streaming UX Enhancer
 * 
 * Enhances streaming UX:
 * - Smart loading states
 * - Progressive reveal
 * - Intelligent transitions
 * - Perceived intelligence enhancements
 */
export class StreamingUXEnhancer {
  private config: UXConfig;
  private enhancements: Map<string, UXEnhancement[]> = new Map();

  constructor(config: Partial<UXConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Add a UX enhancement
   */
  addEnhancement(sessionId: string, enhancement: Omit<UXEnhancement, 'timestamp'>): void {
    const uxEnhancement: UXEnhancement = {
      ...enhancement,
      timestamp: Date.now(),
    };

    if (!this.enhancements.has(sessionId)) {
      this.enhancements.set(sessionId, []);
    }

    this.enhancements.get(sessionId)!.push(uxEnhancement);

    logger.info('StreamingUXEnhancer', 'ENHANCEMENT_ADDED', 'UX enhancement added', {
      sessionId,
      type: enhancement.type,
      message: enhancement.message,
    });
  }

  /**
   * Get enhancements for a session
   */
  getEnhancements(sessionId: string): UXEnhancement[] {
    return this.enhancements.get(sessionId) || [];
  }

  /**
   * Get enhancements by type for a session
   */
  getEnhancementsByType(sessionId: string, type: UXEnhancement['type']): UXEnhancement[] {
    const enhancements = this.enhancements.get(sessionId);
    if (!enhancements) {
      return [];
    }

    return enhancements.filter(e => e.type === type);
  }

  /**
   * Get the latest enhancement for a session
   */
  getLatestEnhancement(sessionId: string): UXEnhancement | undefined {
    const enhancements = this.enhancements.get(sessionId);
    if (!enhancements || enhancements.length === 0) {
      return undefined;
    }

    return enhancements[enhancements.length - 1];
  }

  /**
   * Clear enhancements for a session
   */
  clearEnhancements(sessionId: string): void {
    this.enhancements.delete(sessionId);

    logger.info('StreamingUXEnhancer', 'ENHANCEMENTS_CLEARED', 'Enhancements cleared', {
      sessionId,
    });
  }

  /**
   * Clear all enhancements
   */
  clearAllEnhancements(): void {
    this.enhancements.clear();

    logger.info('StreamingUXEnhancer', 'ALL_ENHANCEMENTS_CLEARED', 'All enhancements cleared');
  }

  /**
   * Generate smart loading message based on progress
   */
  generateLoadingMessage(progress: number, step: string): string {
    if (progress < 10) {
      return 'Initializing AI generation engine...';
    } else if (progress < 30) {
      return 'Analyzing your requirements...';
    } else if (progress < 50) {
      return 'Designing application architecture...';
    } else if (progress < 70) {
      return 'Generating UI components...';
    } else if (progress < 90) {
      return 'Refining and optimizing...';
    } else {
      return 'Finalizing your application...';
    }
  }

  /**
   * Generate intelligent loading state
   */
  generateLoadingState(sessionId: string, progress: number, step: string): UXEnhancement {
    const message = this.generateLoadingMessage(progress, step);

    return {
      type: 'loading',
      message,
      details: step,
      timestamp: Date.now(),
    };
  }

  /**
   * Generate progress enhancement
   */
  generateProgressEnhancement(sessionId: string, progress: number, step: string): UXEnhancement {
    const message = `${Math.round(progress)}% complete - ${step}`;

    return {
      type: 'progress',
      message,
      details: step,
      timestamp: Date.now(),
    };
  }

  /**
   * Generate success enhancement
   */
  generateSuccessEnhancement(sessionId: string, message: string): UXEnhancement {
    return {
      type: 'success',
      message,
      timestamp: Date.now(),
    };
  }

  /**
   * Generate error enhancement
   */
  generateErrorEnhancement(sessionId: string, error: string): UXEnhancement {
    return {
      type: 'error',
      message: 'Something went wrong',
      details: error,
      timestamp: Date.now(),
    };
  }

  /**
   * Generate info enhancement
   */
  generateInfoEnhancement(sessionId: string, message: string): UXEnhancement {
    return {
      type: 'info',
      message,
      timestamp: Date.now(),
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<UXConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('StreamingUXEnhancer', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): UXConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    totalEnhancements: number;
    averageEnhancementsPerSession: number;
    config: UXConfig;
  } {
    const totalSessions = this.enhancements.size;
    const totalEnhancements = Array.from(this.enhancements.values()).reduce(
      (sum, enhancements) => sum + enhancements.length,
      0
    );
    const averageEnhancementsPerSession = totalSessions > 0 ? totalEnhancements / totalSessions : 0;

    return {
      totalSessions,
      totalEnhancements,
      averageEnhancementsPerSession,
      config: this.getConfig(),
    };
  }
}

export const streamingUXEnhancer = new StreamingUXEnhancer();

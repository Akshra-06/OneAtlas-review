/**
 * Interaction Pattern Engine
 * 
 * Defines interaction patterns for domain components.
 * Generates domain-specific interaction behaviors.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';

export interface InteractionPattern {
  id: string;
  name: string;
  type: 'click' | 'drag' | 'hover' | 'scroll' | 'swipe' | 'gesture';
  trigger: string;
  action: string;
  feedback: string;
}

export interface InteractionPatternEngineConfig {
  enableAutoGeneration: boolean;
  enableFeedback: boolean;
  enableGestures: boolean;
}

const DEFAULT_CONFIG: InteractionPatternEngineConfig = {
  enableAutoGeneration: true,
  enableFeedback: true,
  enableGestures: false,
};

/**
 * Interaction Pattern Engine
 * 
 * Generates interaction patterns:
 * - Pattern definition
 * - Domain-specific patterns
 * - Feedback generation
 * - Gesture support
 */
export class InteractionPatternEngine {
  private config: InteractionPatternEngineConfig;
  private patternRegistry: Map<string, InteractionPattern[]> = new Map();

  constructor(config: Partial<InteractionPatternEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializePatternRegistry();
  }

  /**
   * Generate patterns for domain and archetype
   */
  generatePatterns(domain: string, archetype: ArchetypeDefinition): InteractionPattern[] {
    const lowerDomain = domain.toLowerCase();
    let patterns = this.patternRegistry.get(lowerDomain) || [];

    // Filter by archetype interaction patterns
    if (this.config.enableAutoGeneration) {
      patterns = this.filterByArchetype(patterns, archetype);
    }

    logger.info('InteractionPatternEngine', 'PATTERNS_GENERATED', 'Interaction patterns generated', {
      domain,
      archetype: archetype.id,
      patternCount: patterns.length,
    });

    return patterns;
  }

  /**
   * Filter patterns by archetype
   */
  private filterByArchetype(patterns: InteractionPattern[], archetype: ArchetypeDefinition): InteractionPattern[] {
    return patterns.filter(pattern => {
      const lowerName = pattern.name.toLowerCase();
      const lowerAction = pattern.action.toLowerCase();

      // Check if pattern matches archetype interaction patterns
      const matchesPattern = archetype.interactionPatterns.some(pref =>
        lowerName.includes(pref.toLowerCase()) || lowerAction.includes(pref.toLowerCase())
      );

      return matchesPattern;
    });
  }

  /**
   * Generate pattern with feedback
   */
  generatePatternWithFeedback(pattern: InteractionPattern): InteractionPattern {
    if (!this.config.enableFeedback) {
      return pattern;
    }

    return {
      ...pattern,
      feedback: this.generateFeedback(pattern),
    };
  }

  /**
   * Generate feedback for pattern
   */
  private generateFeedback(pattern: InteractionPattern): string {
    const feedbackMap: Record<string, string> = {
      click: 'visual_feedback',
      drag: 'cursor_change',
      hover: 'highlight',
      scroll: 'scroll_indicator',
      swipe: 'animation',
      gesture: 'haptic_feedback',
    };

    return feedbackMap[pattern.type] || 'default_feedback';
  }

  /**
   * Initialize pattern registry
   */
  private initializePatternRegistry(): void {
    // Healthcare patterns
    this.patternRegistry.set('healthcare', [
      {
        id: 'patient_view',
        name: 'View Patient',
        type: 'click',
        trigger: 'click',
        action: 'navigate_to_patient_detail',
        feedback: 'visual_feedback',
      },
      {
        id: 'appointment_book',
        name: 'Book Appointment',
        type: 'click',
        trigger: 'click',
        action: 'open_booking_modal',
        feedback: 'visual_feedback',
      },
      {
        id: 'alert_acknowledge',
        name: 'Acknowledge Alert',
        type: 'click',
        trigger: 'click',
        action: 'dismiss_alert',
        feedback: 'visual_feedback',
      },
    ]);

    // CRM patterns
    this.patternRegistry.set('crm', [
      {
        id: 'lead_move',
        name: 'Move Lead',
        type: 'drag',
        trigger: 'drag_start',
        action: 'move_lead_to_stage',
        feedback: 'cursor_change',
      },
      {
        id: 'deal_view',
        name: 'View Deal',
        type: 'click',
        trigger: 'click',
        action: 'navigate_to_deal_detail',
        feedback: 'visual_feedback',
      },
      {
        id: 'activity_add',
        name: 'Add Activity',
        type: 'click',
        trigger: 'click',
        action: 'open_activity_form',
        feedback: 'visual_feedback',
      },
    ]);

    // Ecommerce patterns
    this.patternRegistry.set('ecommerce', [
      {
        id: 'product_view',
        name: 'View Product',
        type: 'click',
        trigger: 'click',
        action: 'navigate_to_product_detail',
        feedback: 'visual_feedback',
      },
      {
        id: 'inventory_adjust',
        name: 'Adjust Inventory',
        type: 'click',
        trigger: 'click',
        action: 'open_inventory_modal',
        feedback: 'visual_feedback',
      },
      {
        id: 'order_track',
        name: 'Track Order',
        type: 'click',
        trigger: 'click',
        action: 'show_order_tracking',
        feedback: 'visual_feedback',
      },
    ]);

    // Analytics patterns
    this.patternRegistry.set('analytics', [
      {
        id: 'chart_filter',
        name: 'Filter Chart',
        type: 'click',
        trigger: 'click',
        action: 'open_filter_panel',
        feedback: 'visual_feedback',
      },
      {
        id: 'data_drill',
        name: 'Drill Down',
        type: 'click',
        trigger: 'click',
        action: 'drill_into_data',
        feedback: 'visual_feedback',
      },
      {
        id: 'anomaly_investigate',
        name: 'Investigate Anomaly',
        type: 'click',
        trigger: 'click',
        action: 'open_investigation_panel',
        feedback: 'visual_feedback',
      },
    ]);
  }

  /**
   * Add custom pattern to registry
   */
  addPattern(domain: string, pattern: InteractionPattern): void {
    const lowerDomain = domain.toLowerCase();
    const existing = this.patternRegistry.get(lowerDomain) || [];
    this.patternRegistry.set(lowerDomain, [...existing, pattern]);

    logger.info('InteractionPatternEngine', 'PATTERN_ADDED', 'Custom pattern added', {
      domain,
      patternId: pattern.id,
    });
  }

  /**
   * Get patterns for domain
   */
  getDomainPatterns(domain: string): InteractionPattern[] {
    return this.patternRegistry.get(domain.toLowerCase()) || [];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<InteractionPatternEngineConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('InteractionPatternEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): InteractionPatternEngineConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: InteractionPatternEngineConfig;
    domainCount: number;
    totalPatterns: number;
  } {
    const domainCount = this.patternRegistry.size;
    const totalPatterns = Array.from(this.patternRegistry.values()).reduce(
      (sum, patterns) => sum + patterns.length,
      0
    );

    return {
      config: this.getConfig(),
      domainCount,
      totalPatterns,
    };
  }
}

export const interactionPatternEngine = new InteractionPatternEngine();

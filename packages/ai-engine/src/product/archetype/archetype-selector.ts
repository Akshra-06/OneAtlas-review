/**
 * Archetype Selector
 * 
 * Selects the appropriate archetype based on classification.
 * Provides archetype selection logic and fallback strategies.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition, archetypeRegistry } from './archetype-registry';
import { ClassificationResult, archetypeClassifier } from './archetype-classifier';

export interface SelectionResult {
  selectedArchetype: ArchetypeDefinition;
  confidence: number;
  reasoning: string;
  fallbackUsed: boolean;
  alternatives: ArchetypeDefinition[];
}

export interface SelectionConfig {
  enableFallback: boolean;
  fallbackArchetype: string;
  minConfidence: number;
  enableAlternatives: boolean;
}

const DEFAULT_CONFIG: SelectionConfig = {
  enableFallback: true,
  fallbackArchetype: 'admin_console',
  minConfidence: 0.5,
  enableAlternatives: true,
};

/**
 * Archetype Selector
 * 
 * Selects the appropriate archetype:
 * - Classification-based selection
 * - Fallback strategies
 * - Alternative suggestions
 * - Confidence validation
 */
export class ArchetypeSelector {
  private config: SelectionConfig;

  constructor(config: Partial<SelectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Select an archetype for a prompt
   */
  select(prompt: string, domain?: string): SelectionResult {
    // Classify the prompt
    const classification = archetypeClassifier.classify(prompt, domain);

    // Validate confidence
    if (!classification.archetype || classification.confidence < this.config.minConfidence) {
      return this.useFallback(classification);
    }

    // Get alternatives
    const alternatives = this.config.enableAlternatives
      ? classification.alternatives.map(a => a.archetype)
      : [];

    const result: SelectionResult = {
      selectedArchetype: classification.archetype,
      confidence: classification.confidence,
      reasoning: classification.reasoning,
      fallbackUsed: false,
      alternatives,
    };

    logger.info('ArchetypeSelector', 'ARCHETYPE_SELECTED', 'Archetype selected', {
      archetype: result.selectedArchetype.id,
      confidence: result.confidence,
      fallbackUsed: result.fallbackUsed,
    });

    return result;
  }

  /**
   * Use fallback archetype
   */
  private useFallback(classification: ClassificationResult): SelectionResult {
    if (!this.config.enableFallback) {
      throw new Error('No archetype matched and fallback is disabled');
    }

    const fallbackArchetype = archetypeRegistry.get(this.config.fallbackArchetype);
    if (!fallbackArchetype) {
      throw new Error(`Fallback archetype '${this.config.fallbackArchetype}' not found`);
    }

    const alternatives = classification.alternatives.map(a => a.archetype);

    const result: SelectionResult = {
      selectedArchetype: fallbackArchetype,
      confidence: 0,
      reasoning: `Fallback to ${fallbackArchetype.name} - no archetype matched with sufficient confidence`,
      fallbackUsed: true,
      alternatives,
    };

    logger.warn('ArchetypeSelector', 'FALLBACK_USED', 'Fallback archetype used', {
      fallbackArchetype: fallbackArchetype.id,
      originalConfidence: classification.confidence,
    });

    return result;
  }

  /**
   * Select archetype by ID
   */
  selectById(archetypeId: string): SelectionResult {
    const archetype = archetypeRegistry.get(archetypeId);
    if (!archetype) {
      throw new Error(`Archetype '${archetypeId}' not found`);
    }

    const result: SelectionResult = {
      selectedArchetype: archetype,
      confidence: 1.0,
      reasoning: `Explicitly selected by ID`,
      fallbackUsed: false,
      alternatives: [],
    };

    logger.info('ArchetypeSelector', 'ARCHETYPE_SELECTED_BY_ID', 'Archetype selected by ID', {
      archetypeId,
    });

    return result;
  }

  /**
   * Get available archetypes
   */
  getAvailableArchetypes(): ArchetypeDefinition[] {
    return archetypeRegistry.getAll();
  }

  /**
   * Get archetype by ID
   */
  getArchetype(archetypeId: string): ArchetypeDefinition | undefined {
    return archetypeRegistry.get(archetypeId);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SelectionConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ArchetypeSelector', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): SelectionConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: SelectionConfig;
    availableArchetypes: number;
  } {
    return {
      config: this.getConfig(),
      availableArchetypes: archetypeRegistry.count(),
    };
  }
}

export const archetypeSelector = new ArchetypeSelector();

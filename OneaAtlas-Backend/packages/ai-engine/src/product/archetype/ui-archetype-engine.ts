/**
 * UI Archetype Engine
 * 
 * Main orchestrator for UI archetype selection and application.
 * Determines what product type the generated app should feel like.
 */

import { logger } from '../../shared/utils/logger';
import type { ArchetypeDefinition } from './archetype-registry';
export type { ArchetypeDefinition };
import { ClassificationResult, archetypeClassifier } from './archetype-classifier';
import { SelectionResult, archetypeSelector } from './archetype-selector';

export interface ArchetypeEngineConfig {
  enableAutoSelection: boolean;
  enableClassification: boolean;
  enableAlternatives: boolean;
  defaultArchetype: string;
}

const DEFAULT_CONFIG: ArchetypeEngineConfig = {
  enableAutoSelection: true,
  enableClassification: true,
  enableAlternatives: true,
  defaultArchetype: 'admin_console',
};

/**
 * UI Archetype Engine
 * 
 * Orchestrates archetype selection:
 * - Classification
 * - Selection
 * - Application
 * - Fallback handling
 */
export class UIArchetypeEngine {
  private config: ArchetypeEngineConfig;
  private selectedArchetype: ArchetypeDefinition | null = null;
  private classificationHistory: Array<{
    prompt: string;
    result: ClassificationResult;
    selection: SelectionResult;
    timestamp: number;
  }> = [];

  constructor(config: Partial<ArchetypeEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Determine archetype for a prompt
   */
  determineArchetype(prompt: string, domain?: string): SelectionResult {
    if (!this.config.enableAutoSelection) {
      // Use default archetype
      return archetypeSelector.selectById(this.config.defaultArchetype);
    }

    if (!this.config.enableClassification) {
      // Skip classification, use selector directly
      return archetypeSelector.select(prompt, domain);
    }

    // Classify and select
    const classification = archetypeClassifier.classify(prompt, domain);
    const selection = archetypeSelector.select(prompt, domain);

    // Store in history
    this.classificationHistory.push({
      prompt,
      result: classification,
      selection,
      timestamp: Date.now(),
    });

    // Set selected archetype
    this.selectedArchetype = selection.selectedArchetype;

    logger.info('UIArchetypeEngine', 'ARCHETYPE_DETERMINED', 'Archetype determined', {
      archetype: selection.selectedArchetype.id,
      confidence: selection.confidence,
      fallbackUsed: selection.fallbackUsed,
    });

    return selection;
  }

  /**
   * Get the currently selected archetype
   */
  getSelectedArchetype(): ArchetypeDefinition | null {
    return this.selectedArchetype;
  }

  /**
   * Set archetype explicitly
   */
  setArchetype(archetypeId: string): SelectionResult {
    const selection = archetypeSelector.selectById(archetypeId);
    this.selectedArchetype = selection.selectedArchetype;

    logger.info('UIArchetypeEngine', 'ARCHETYPE_SET', 'Archetype set explicitly', {
      archetypeId,
    });

    return selection;
  }

  /**
   * Get classification history
   */
  getClassificationHistory(): Array<{
    prompt: string;
    result: ClassificationResult;
    selection: SelectionResult;
    timestamp: number;
  }> {
    return [...this.classificationHistory];
  }

  /**
   * Clear classification history
   */
  clearHistory(): void {
    this.classificationHistory = [];

    logger.info('UIArchetypeEngine', 'HISTORY_CLEARED', 'Classification history cleared');
  }

  /**
   * Get archetype recommendations for a prompt
   */
  getRecommendations(prompt: string, domain?: string): SelectionResult {
    return this.determineArchetype(prompt, domain);
  }

  /**
   * Apply archetype to UI generation parameters
   */
  applyToUIParams(params: Record<string, unknown>): Record<string, unknown> {
    if (!this.selectedArchetype) {
      return params;
    }

    const archetype = this.selectedArchetype;

    return {
      ...params,
      navigationStyle: archetype.navigationStyle,
      layoutDensity: archetype.layoutDensity,
      preferredWidgets: archetype.preferredWidgets,
      chartUsage: archetype.chartUsage,
      workflowEmphasis: archetype.workflowEmphasis,
      interactionPatterns: archetype.interactionPatterns,
      visualHierarchyRules: archetype.visualHierarchyRules,
      dashboardCompositionStrategy: archetype.dashboardCompositionStrategy,
      sectionArrangementBehavior: archetype.sectionArrangementBehavior,
      colorPalette: archetype.colorPalette,
      typography: archetype.typography,
      spacing: archetype.spacing,
    };
  }

  /**
   * Get archetype-specific widget recommendations
   */
  getWidgetRecommendations(): string[] {
    if (!this.selectedArchetype) {
      return [];
    }

    return this.selectedArchetype.preferredWidgets;
  }

  /**
   * Get archetype-specific layout recommendations
   */
  getLayoutRecommendations(): {
    navigationStyle: string;
    layoutDensity: string;
    dashboardCompositionStrategy: string;
    sectionArrangementBehavior: string;
  } | null {
    if (!this.selectedArchetype) {
      return null;
    }

    const archetype = this.selectedArchetype;

    return {
      navigationStyle: archetype.navigationStyle,
      layoutDensity: archetype.layoutDensity,
      dashboardCompositionStrategy: archetype.dashboardCompositionStrategy,
      sectionArrangementBehavior: archetype.sectionArrangementBehavior,
    };
  }

  /**
   * Get archetype-specific visual recommendations
   */
  getVisualRecommendations(): {
    colorPalette: ArchetypeDefinition['colorPalette'];
    typography: ArchetypeDefinition['typography'];
    spacing: ArchetypeDefinition['spacing'];
  } | null {
    if (!this.selectedArchetype) {
      return null;
    }

    const archetype = this.selectedArchetype;

    return {
      colorPalette: archetype.colorPalette,
      typography: archetype.typography,
      spacing: archetype.spacing,
    };
  }

  /**
   * Get archetype-specific workflow recommendations
   */
  getWorkflowRecommendations(): {
    workflowEmphasis: string;
    interactionPatterns: string[];
    visualHierarchyRules: ArchetypeDefinition['visualHierarchyRules'];
  } | null {
    if (!this.selectedArchetype) {
      return null;
    }

    const archetype = this.selectedArchetype;

    return {
      workflowEmphasis: archetype.workflowEmphasis,
      interactionPatterns: archetype.interactionPatterns,
      visualHierarchyRules: archetype.visualHierarchyRules,
    };
  }

  /**
   * Reset selected archetype
   */
  reset(): void {
    this.selectedArchetype = null;

    logger.info('UIArchetypeEngine', 'RESET', 'Archetype engine reset');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ArchetypeEngineConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('UIArchetypeEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ArchetypeEngineConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: ArchetypeEngineConfig;
    selectedArchetype: ArchetypeDefinition | null;
    classificationHistorySize: number;
  } {
    return {
      config: this.getConfig(),
      selectedArchetype: this.selectedArchetype,
      classificationHistorySize: this.classificationHistory.length,
    };
  }
}

export const uiArchetypeEngine = new UIArchetypeEngine();

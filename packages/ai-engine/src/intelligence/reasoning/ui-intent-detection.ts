/**
 * UI Intent Detection
 * 
 * Extracts detailed UI requirements from prompts.
 * Identifies components, features, and data needs.
 */

import { logger } from '../../shared/utils/logger';
import type { UIRequirement } from './prompt-to-ui-reasoning';

export interface DetectedIntent {
  action: string;
  target: string;
  context: string;
  modifiers: string[];
}

export interface ComponentSpec {
  type: string;
  name: string;
  properties: Record<string, unknown>;
  required: boolean;
}

export interface FeatureSpec {
  name: string;
  type: string;
  properties: Record<string, unknown>;
  priority: number;
}

export interface IntentDetectionResult {
  intents: DetectedIntent[];
  components: ComponentSpec[];
  features: FeatureSpec[];
  dataFields: string[];
  confidence: number;
}

export interface DetectionConfig {
  enableDeepExtraction: boolean;
  confidenceThreshold: number;
}

const DEFAULT_CONFIG: DetectionConfig = {
  enableDeepExtraction: true,
  confidenceThreshold: 0.6,
};

/**
 * UI Intent Detection Engine
 * 
 * Detects UI intents from prompts:
 * - Action extraction
 * - Component identification
 * - Feature detection
 * - Data field extraction
 */
export class UIIntentDetection {
  private config: DetectionConfig;
  private detectionHistory: Map<string, IntentDetectionResult> = new Map();

  constructor(config: Partial<DetectionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Detect UI intents from prompt
   */
  detect(prompt: string): IntentDetectionResult {
    const lowerPrompt = prompt.toLowerCase();
    const intents: DetectedIntent[] = [];
    const components: ComponentSpec[] = [];
    const features: FeatureSpec[] = [];
    const dataFields: string[] = [];

    // Detect actions
    intents.push(...this.detectActions(lowerPrompt));

    // Detect components
    components.push(...this.detectComponents(lowerPrompt));

    // Detect features
    features.push(...this.detectFeatures(lowerPrompt));

    // Detect data fields
    dataFields.push(...this.detectDataFields(lowerPrompt));

    // Calculate confidence
    const confidence = this.calculateConfidence(intents, components, features);

    const result: IntentDetectionResult = {
      intents,
      components,
      features,
      dataFields,
      confidence,
    };

    // Store detection history
    this.detectionHistory.set(prompt, result);

    logger.info('UIIntentDetection', 'DETECTION_COMPLETE', 'UI intent detection complete', {
      intents: intents.length,
      components: components.length,
      features: features.length,
      dataFields: dataFields.length,
      confidence,
    });

    return result;
  }

  /**
   * Detect actions from prompt
   */
  private detectActions(prompt: string): DetectedIntent[] {
    const intents: DetectedIntent[] = [];
    const actionPatterns = [
      { pattern: 'create', action: 'create' },
      { pattern: 'add', action: 'create' },
      { pattern: 'new', action: 'create' },
      { pattern: 'edit', action: 'edit' },
      { pattern: 'update', action: 'edit' },
      { pattern: 'modify', action: 'edit' },
      { pattern: 'delete', action: 'delete' },
      { pattern: 'remove', action: 'delete' },
      { pattern: 'view', action: 'view' },
      { pattern: 'show', action: 'view' },
      { pattern: 'display', action: 'view' },
      { pattern: 'list', action: 'list' },
      { pattern: 'search', action: 'search' },
      { pattern: 'filter', action: 'filter' },
      { pattern: 'sort', action: 'sort' },
      { pattern: 'export', action: 'export' },
      { pattern: 'download', action: 'export' },
      { pattern: 'upload', action: 'upload' },
      { pattern: 'import', action: 'import' },
    ];

    for (const { pattern, action } of actionPatterns) {
      if (prompt.includes(pattern)) {
        const intent: DetectedIntent = {
          action,
          target: this.extractTarget(prompt, pattern),
          context: this.extractContext(prompt),
          modifiers: this.extractModifiers(prompt),
        };
        intents.push(intent);
      }
    }

    return intents;
  }

  /**
   * Extract target from prompt
   */
  private extractTarget(prompt: string, action: string): string {
    const words = prompt.split(' ');
    const actionIndex = words.indexOf(action);

    if (actionIndex !== -1 && actionIndex + 1 < words.length) {
      const target = words[actionIndex + 1];
      if (target) {
        return target;
      }
    }

    return 'item';
  }

  /**
   * Extract context from prompt
   */
  private extractContext(prompt: string): string {
    const contexts = ['dashboard', 'page', 'modal', 'sidebar', 'form', 'table', 'list'];
    for (const context of contexts) {
      if (prompt.includes(context)) {
        return context;
      }
    }
    return 'page';
  }

  /**
   * Extract modifiers from prompt
   */
  private extractModifiers(prompt: string): string[] {
    const modifiers: string[] = [];
    const modifierPatterns = ['quickly', 'easily', 'simply', 'all', 'multiple', 'batch', 'real-time', 'live'];

    for (const modifier of modifierPatterns) {
      if (prompt.includes(modifier)) {
        modifiers.push(modifier);
      }
    }

    return modifiers;
  }

  /**
   * Detect components from prompt
   */
  private detectComponents(prompt: string): ComponentSpec[] {
    const components: ComponentSpec[] = [];
    const componentPatterns = [
      { pattern: 'table', type: 'table', required: false },
      { pattern: 'grid', type: 'grid', required: false },
      { pattern: 'list', type: 'list', required: false },
      { pattern: 'card', type: 'card', required: false },
      { pattern: 'form', type: 'form', required: false },
      { pattern: 'input', type: 'input', required: false },
      { pattern: 'button', type: 'button', required: false },
      { pattern: 'dropdown', type: 'select', required: false },
      { pattern: 'select', type: 'select', required: false },
      { pattern: 'checkbox', type: 'checkbox', required: false },
      { pattern: 'radio', type: 'radio', required: false },
      { pattern: 'date', type: 'date', required: false },
      { pattern: 'time', type: 'time', required: false },
      { pattern: 'chart', type: 'chart', required: false },
      { pattern: 'graph', type: 'chart', required: false },
      { pattern: 'metric', type: 'metric', required: false },
      { pattern: 'filter', type: 'filter', required: false },
      { pattern: 'search', type: 'search', required: false },
      { pattern: 'pagination', type: 'pagination', required: false },
      { pattern: 'sidebar', type: 'sidebar', required: false },
      { pattern: 'header', type: 'header', required: false },
      { pattern: 'footer', type: 'footer', required: false },
      { pattern: 'modal', type: 'modal', required: false },
      { pattern: 'dialog', type: 'modal', required: false },
      { pattern: 'tabs', type: 'tabs', required: false },
      { pattern: 'accordion', type: 'accordion', required: false },
      { pattern: 'carousel', type: 'carousel', required: false },
      { pattern: 'slider', type: 'slider', required: false },
      { pattern: 'upload', type: 'upload', required: false },
      { pattern: 'file', type: 'upload', required: false },
    ];

    for (const { pattern, type, required } of componentPatterns) {
      if (prompt.includes(pattern)) {
        components.push({
          type,
          name: pattern,
          properties: this.extractComponentProperties(prompt, type),
          required,
        });
      }
    }

    return components;
  }

  /**
   * Extract component properties from prompt
   */
  private extractComponentProperties(prompt: string, type: string): Record<string, unknown> {
    const properties: Record<string, unknown> = {};

    if (type === 'table') {
      properties.sortable = prompt.includes('sort');
      properties.filterable = prompt.includes('filter');
      properties.searchable = prompt.includes('search');
      properties.paginated = prompt.includes('pagination') || prompt.includes('page');
    }

    if (type === 'chart') {
      if (prompt.includes('line')) {
        properties.chartType = 'line';
      } else if (prompt.includes('bar')) {
        properties.chartType = 'bar';
      } else if (prompt.includes('pie')) {
        properties.chartType = 'pie';
      } else {
        properties.chartType = 'line';
      }
      properties.showLegend = prompt.includes('legend');
    }

    if (type === 'form') {
      properties.validation = prompt.includes('validate') || prompt.includes('required');
      properties.multiStep = prompt.includes('step') || prompt.includes('wizard');
    }

    if (type === 'search') {
      properties.advanced = prompt.includes('advanced');
      properties.filters = prompt.includes('filter');
    }

    return properties;
  }

  /**
   * Detect features from prompt
   */
  private detectFeatures(prompt: string): FeatureSpec[] {
    const features: FeatureSpec[] = [];
    const featurePatterns = [
      { pattern: 'search', type: 'search', priority: 2 },
      { pattern: 'filter', type: 'filter', priority: 2 },
      { pattern: 'sort', type: 'sort', priority: 2 },
      { pattern: 'export', type: 'export', priority: 3 },
      { pattern: 'import', type: 'import', priority: 3 },
      { pattern: 'upload', type: 'upload', priority: 3 },
      { pattern: 'download', type: 'download', priority: 3 },
      { pattern: 'pagination', type: 'pagination', priority: 2 },
      { pattern: 'validation', type: 'validation', priority: 1 },
      { pattern: 'notification', type: 'notification', priority: 3 },
      { pattern: 'alert', type: 'notification', priority: 3 },
      { pattern: 'real-time', type: 'realtime', priority: 2 },
      { pattern: 'live', type: 'realtime', priority: 2 },
      { pattern: 'history', type: 'history', priority: 3 },
      { pattern: 'audit', type: 'audit', priority: 3 },
      { pattern: 'backup', type: 'backup', priority: 4 },
      { pattern: 'restore', type: 'restore', priority: 4 },
      { pattern: 'share', type: 'share', priority: 3 },
      { pattern: 'collaborate', type: 'collaboration', priority: 3 },
      { pattern: 'comment', type: 'comment', priority: 3 },
      { pattern: 'rating', type: 'rating', priority: 3 },
      { pattern: 'review', type: 'review', priority: 3 },
      { pattern: 'approval', type: 'approval', priority: 2 },
      { pattern: 'workflow', type: 'workflow', priority: 2 },
    ];

    for (const { pattern, type, priority } of featurePatterns) {
      if (prompt.includes(pattern)) {
        features.push({
          name: pattern,
          type,
          properties: this.extractFeatureProperties(prompt, type),
          priority,
        });
      }
    }

    return features;
  }

  /**
   * Extract feature properties from prompt
   */
  private extractFeatureProperties(prompt: string, type: string): Record<string, unknown> {
    const properties: Record<string, unknown> = {};

    if (type === 'export') {
      properties.formats = [];
      if (prompt.includes('csv')) {
        (properties.formats as string[]).push('csv');
      }
      if (prompt.includes('excel') || prompt.includes('xlsx')) {
        (properties.formats as string[]).push('excel');
      }
      if (prompt.includes('pdf')) {
        (properties.formats as string[]).push('pdf');
      }
      if ((properties.formats as string[]).length === 0) {
        properties.formats = ['csv', 'excel'];
      }
    }

    if (type === 'search') {
      properties.advanced = prompt.includes('advanced');
      properties.filters = prompt.includes('filter');
      properties.suggestions = prompt.includes('suggest') || prompt.includes('autocomplete');
    }

    if (type === 'realtime') {
      properties.websocket = prompt.includes('websocket') || prompt.includes('socket');
      properties.polling = prompt.includes('poll');
    }

    return properties;
  }

  /**
   * Detect data fields from prompt
   */
  private detectDataFields(prompt: string): string[] {
    const fields: string[] = [];
    const fieldPatterns = [
      'name', 'title', 'description', 'email', 'phone', 'address', 'city', 'state',
      'country', 'zip', 'date', 'time', 'price', 'cost', 'amount', 'quantity',
      'status', 'type', 'category', 'tag', 'id', 'code', 'reference', 'url',
      'image', 'file', 'document', 'user', 'customer', 'product', 'order',
      'invoice', 'payment', 'transaction', 'account', 'balance', 'score', 'rating',
      'priority', 'progress', 'percentage', 'boolean', 'flag', 'active', 'enabled',
    ];

    for (const field of fieldPatterns) {
      if (prompt.includes(field)) {
        fields.push(field);
      }
    }

    return fields;
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    intents: DetectedIntent[],
    components: ComponentSpec[],
    features: FeatureSpec[],
  ): number {
    let score = 0;

    // Score based on number of detected items
    score += Math.min(intents.length * 0.2, 0.4);
    score += Math.min(components.length * 0.15, 0.3);
    score += Math.min(features.length * 0.15, 0.3);

    return Math.min(1, score);
  }

  /**
   * Convert to UI requirements
   */
  toRequirements(result: IntentDetectionResult): UIRequirement[] {
    const requirements: UIRequirement[] = [];

    // Convert components to requirements
    for (const component of result.components) {
      requirements.push({
        id: crypto.randomUUID(),
        type: 'component',
        name: component.name,
        description: `${component.type} component`,
        priority: component.required ? 1 : 2,
        properties: component.properties,
      });
    }

    // Convert features to requirements
    for (const feature of result.features) {
      requirements.push({
        id: crypto.randomUUID(),
        type: 'feature',
        name: feature.name,
        description: `${feature.type} feature`,
        priority: feature.priority,
        properties: feature.properties,
      });
    }

    // Add data field requirements
    if (result.dataFields.length > 0) {
      requirements.push({
        id: crypto.randomUUID(),
        type: 'data',
        name: 'Data Fields',
        description: 'Required data fields',
        priority: 4,
        properties: { fields: result.dataFields },
      });
    }

    return requirements.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get detection history
   */
  getDetectionHistory(prompt?: string): IntentDetectionResult | Map<string, IntentDetectionResult> | undefined {
    if (prompt) {
      return this.detectionHistory.get(prompt);
    }
    return this.detectionHistory;
  }

  /**
   * Clear detection history
   */
  clearHistory(): void {
    this.detectionHistory.clear();

    logger.info('UIIntentDetection', 'HISTORY_CLEARED', 'Detection history cleared');
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalDetections: number;
    averageConfidence: number;
    averageIntents: number;
    averageComponents: number;
    averageFeatures: number;
  } {
    const history = Array.from(this.detectionHistory.values());
    const averageConfidence = history.length > 0
      ? history.reduce((sum, r) => sum + r.confidence, 0) / history.length
      : 0;
    const averageIntents = history.length > 0
      ? history.reduce((sum, r) => sum + r.intents.length, 0) / history.length
      : 0;
    const averageComponents = history.length > 0
      ? history.reduce((sum, r) => sum + r.components.length, 0) / history.length
      : 0;
    const averageFeatures = history.length > 0
      ? history.reduce((sum, r) => sum + r.features.length, 0) / history.length
      : 0;

    return {
      totalDetections: history.length,
      averageConfidence,
      averageIntents,
      averageComponents,
      averageFeatures,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DetectionConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('UIIntentDetection', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): DetectionConfig {
    return { ...this.config };
  }
}

export const uiIntentDetection = new UIIntentDetection();

/**
 * Prompt-to-UI Reasoning
 * 
 * Converts natural language prompts to UI requirements.
 * Extracts UI intent and structure from user descriptions.
 */

import { logger } from '../../shared/utils/logger';
import { domainClassifier } from '../classification/domain-classifier';
import { domainKnowledgeBase } from '../knowledge/domain-knowledge-base';

export interface UIRequirement {
  id: string;
  type: 'page' | 'component' | 'layout' | 'feature' | 'data';
  name: string;
  description: string;
  priority: number;
  properties: Record<string, unknown>;
}

export interface UIIntent {
  primaryGoal: string;
  secondaryGoals: string[];
  uiType: string;
  complexity: 'simple' | 'moderate' | 'complex';
  pages: string[];
  components: string[];
  features: string[];
  dataRequirements: string[];
}

export interface ReasoningResult {
  intent: UIIntent;
  requirements: UIRequirement[];
  confidence: number;
  reasoning: string[];
}

export interface ReasoningConfig {
  enableDeepAnalysis: boolean;
  confidenceThreshold: number;
}

const DEFAULT_CONFIG: ReasoningConfig = {
  enableDeepAnalysis: true,
  confidenceThreshold: 0.6,
};

/**
 * Prompt-to-UI Reasoning Engine
 * 
 * Converts natural language to UI requirements:
 * - Intent extraction
 * - Component identification
 * - Feature detection
 * - Data requirements analysis
 */
export class PromptToUIReasoning {
  private config: ReasoningConfig;
  private reasoningHistory: Map<string, ReasoningResult> = new Map();

  constructor(config: Partial<ReasoningConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Reason about prompt and extract UI requirements
   */
  reason(prompt: string): ReasoningResult {
    // Classify domain
    const classification = domainClassifier.classify(prompt);

    // Get domain knowledge
    const knowledge = domainKnowledgeBase.getKnowledge(classification.domain);

    // Extract UI intent
    const intent = this.extractIntent(prompt, classification.domain, knowledge);

    // Generate requirements
    const requirements = this.generateRequirements(prompt, intent, knowledge);

    // Generate reasoning
    const reasoning = this.generateReasoning(prompt, intent, classification);

    const result: ReasoningResult = {
      intent,
      requirements,
      confidence: classification.confidence,
      reasoning,
    };

    // Store reasoning history
    this.reasoningHistory.set(prompt, result);

    logger.info('PromptToUIReasoning', 'REASONING_COMPLETE', 'Prompt-to-UI reasoning complete', {
      domain: classification.domain,
      uiType: intent.uiType,
      requirements: requirements.length,
      confidence: result.confidence,
    });

    return result;
  }

  /**
   * Extract UI intent from prompt
   */
  private extractIntent(
    prompt: string,
    domain: string,
    knowledge?: import('../knowledge/domain-knowledge-base').DomainKnowledge,
  ): UIIntent {
    const lowerPrompt = prompt.toLowerCase();
    const intent: UIIntent = {
      primaryGoal: '',
      secondaryGoals: [],
      uiType: 'dashboard',
      complexity: 'moderate',
      pages: [],
      components: [],
      features: [],
      dataRequirements: [],
    };

    // Determine primary goal
    if (lowerPrompt.includes('dashboard') || lowerPrompt.includes('overview')) {
      intent.primaryGoal = 'Provide overview and analytics';
      intent.uiType = 'dashboard';
    } else if (lowerPrompt.includes('form') || lowerPrompt.includes('input')) {
      intent.primaryGoal = 'Collect user input';
      intent.uiType = 'form';
    } else if (lowerPrompt.includes('list') || lowerPrompt.includes('table')) {
      intent.primaryGoal = 'Display data in list format';
      intent.uiType = 'list';
    } else if (lowerPrompt.includes('detail') || lowerPrompt.includes('view')) {
      intent.primaryGoal = 'Show detailed information';
      intent.uiType = 'detail';
    } else if (lowerPrompt.includes('create') || lowerPrompt.includes('add')) {
      intent.primaryGoal = 'Create new item';
      intent.uiType = 'create';
    } else if (lowerPrompt.includes('edit') || lowerPrompt.includes('update')) {
      intent.primaryGoal = 'Edit existing item';
      intent.uiType = 'edit';
    } else {
      intent.primaryGoal = 'General purpose interface';
      intent.uiType = 'generic';
    }

    // Determine complexity
    if (lowerPrompt.includes('complex') || lowerPrompt.includes('advanced')) {
      intent.complexity = 'complex';
    } else if (lowerPrompt.includes('simple') || lowerPrompt.includes('basic')) {
      intent.complexity = 'simple';
    }

    // Extract pages from domain knowledge
    if (knowledge) {
      intent.pages = knowledge.uiPatterns.slice(0, 3);
      intent.components = knowledge.commonEntities.slice(0, 5);
      intent.features = knowledge.typicalWorkflows.slice(0, 3);
      intent.dataRequirements = knowledge.dataModels.slice(0, 3);
    }

    // Extract secondary goals from prompt
    if (lowerPrompt.includes('analytics') || lowerPrompt.includes('report')) {
      intent.secondaryGoals.push('Provide analytics and reporting');
    }
    if (lowerPrompt.includes('search') || lowerPrompt.includes('filter')) {
      intent.secondaryGoals.push('Enable search and filtering');
    }
    if (lowerPrompt.includes('export') || lowerPrompt.includes('download')) {
      intent.secondaryGoals.push('Support data export');
    }
    if (lowerPrompt.includes('real-time') || lowerPrompt.includes('live')) {
      intent.secondaryGoals.push('Real-time data updates');
    }

    return intent;
  }

  /**
   * Generate UI requirements from intent
   */
  private generateRequirements(
    prompt: string,
    intent: UIIntent,
    knowledge?: import('../knowledge/domain-knowledge-base').DomainKnowledge,
  ): UIRequirement[] {
    const requirements: UIRequirement[] = [];
    const lowerPrompt = prompt.toLowerCase();

    // Page requirements
    for (const page of intent.pages) {
      requirements.push({
        id: crypto.randomUUID(),
        type: 'page',
        name: page,
        description: `Page for ${page.toLowerCase()}`,
        priority: 1,
        properties: {},
      });
    }

    // Component requirements
    for (const component of intent.components) {
      requirements.push({
        id: crypto.randomUUID(),
        type: 'component',
        name: component,
        description: `Component for ${component.toLowerCase()}`,
        priority: 2,
        properties: {},
      });
    }

    // Feature requirements
    for (const feature of intent.features) {
      requirements.push({
        id: crypto.randomUUID(),
        type: 'feature',
        name: feature,
        description: `Feature: ${feature.toLowerCase()}`,
        priority: 3,
        properties: {},
      });
    }

    // Data requirements
    for (const dataReq of intent.dataRequirements) {
      requirements.push({
        id: crypto.randomUUID(),
        type: 'data',
        name: dataReq,
        description: `Data model: ${dataReq.toLowerCase()}`,
        priority: 4,
        properties: {},
      });
    }

    // Add specific requirements based on prompt keywords
    if (lowerPrompt.includes('search')) {
      requirements.push({
        id: crypto.randomUUID(),
        type: 'feature',
        name: 'Search',
        description: 'Search functionality',
        priority: 2,
        properties: { type: 'search', filters: true },
      });
    }

    if (lowerPrompt.includes('filter')) {
      requirements.push({
        id: crypto.randomUUID(),
        type: 'feature',
        name: 'Filters',
        description: 'Filter functionality',
        priority: 2,
        properties: { type: 'filter', advanced: true },
      });
    }

    if (lowerPrompt.includes('sort')) {
      requirements.push({
        id: crypto.randomUUID(),
        type: 'feature',
        name: 'Sorting',
        description: 'Sorting functionality',
        priority: 2,
        properties: { type: 'sort', multiColumn: true },
      });
    }

    if (lowerPrompt.includes('export')) {
      requirements.push({
        id: crypto.randomUUID(),
        type: 'feature',
        name: 'Export',
        description: 'Data export functionality',
        priority: 3,
        properties: { formats: ['csv', 'excel', 'pdf'] },
      });
    }

    if (lowerPrompt.includes('chart') || lowerPrompt.includes('graph')) {
      requirements.push({
        id: crypto.randomUUID(),
        type: 'component',
        name: 'Charts',
        description: 'Data visualization charts',
        priority: 2,
        properties: { types: ['line', 'bar', 'pie'] },
      });
    }

    // Sort by priority
    return requirements.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Generate reasoning explanation
   */
  private generateReasoning(
    prompt: string,
    intent: UIIntent,
    classification: import('../classification/domain-classifier').ClassificationResult,
  ): string[] {
    const reasoning: string[] = [];

    reasoning.push(`Detected domain: ${classification.domain} (confidence: ${classification.confidence.toFixed(2)})`);
    reasoning.push(`Primary UI goal: ${intent.primaryGoal}`);
    reasoning.push(`UI type: ${intent.uiType}`);
    reasoning.push(`Complexity: ${intent.complexity}`);

    if (intent.pages.length > 0) {
      reasoning.push(`Identified pages: ${intent.pages.join(', ')}`);
    }

    if (intent.components.length > 0) {
      reasoning.push(`Identified components: ${intent.components.slice(0, 3).join(', ')}${intent.components.length > 3 ? '...' : ''}`);
    }

    if (intent.secondaryGoals.length > 0) {
      reasoning.push(`Secondary goals: ${intent.secondaryGoals.join(', ')}`);
    }

    if (classification.matchedKeywords.length > 0) {
      reasoning.push(`Matched keywords: ${classification.matchedKeywords.slice(0, 5).join(', ')}`);
    }

    return reasoning;
  }

  /**
   * Get reasoning history
   */
  getReasoningHistory(prompt?: string): ReasoningResult | Map<string, ReasoningResult> | undefined {
    if (prompt) {
      return this.reasoningHistory.get(prompt);
    }
    return this.reasoningHistory;
  }

  /**
   * Clear reasoning history
   */
  clearHistory(): void {
    this.reasoningHistory.clear();

    logger.info('PromptToUIReasoning', 'HISTORY_CLEARED', 'Reasoning history cleared');
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalReasonings: number;
    averageConfidence: number;
    uiTypeDistribution: Record<string, number>;
    complexityDistribution: Record<string, number>;
  } {
    const history = Array.from(this.reasoningHistory.values());
    const averageConfidence = history.length > 0
      ? history.reduce((sum, r) => sum + r.confidence, 0) / history.length
      : 0;

    const uiTypeDistribution: Record<string, number> = {};
    const complexityDistribution: Record<string, number> = {};

    for (const result of history) {
      uiTypeDistribution[result.intent.uiType] = (uiTypeDistribution[result.intent.uiType] || 0) + 1;
      complexityDistribution[result.intent.complexity] = (complexityDistribution[result.intent.complexity] || 0) + 1;
    }

    return {
      totalReasonings: history.length,
      averageConfidence,
      uiTypeDistribution,
      complexityDistribution,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ReasoningConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('PromptToUIReasoning', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ReasoningConfig {
    return { ...this.config };
  }
}

export const promptToUIReasoning = new PromptToUIReasoning();

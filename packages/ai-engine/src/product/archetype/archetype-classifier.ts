/**
 * Archetype Classifier
 * 
 * Classifies prompts into UI archetypes.
 * Determines what product type the generated app should feel like.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition, archetypeRegistry } from './archetype-registry';

export interface ClassificationResult {
  archetype: ArchetypeDefinition | null;
  confidence: number;
  reasoning: string;
  alternatives: Array<{
    archetype: ArchetypeDefinition;
    confidence: number;
  }>;
}

export interface ClassificationConfig {
  enableKeywordMatching: boolean;
  enableContextInference: boolean;
  confidenceThreshold: number;
}

const DEFAULT_CONFIG: ClassificationConfig = {
  enableKeywordMatching: true,
  enableContextInference: true,
  confidenceThreshold: 0.6,
};

/**
 * Archetype Classifier
 * 
 * Classifies prompts into UI archetypes:
 * - Keyword-based classification
 * - Context inference
 * - Confidence scoring
 * - Alternative suggestions
 */
export class ArchetypeClassifier {
  private config: ClassificationConfig;
  private keywordMap: Map<string, string[]> = new Map();

  constructor(config: Partial<ClassificationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeKeywordMap();
  }

  /**
   * Classify a prompt into an archetype
   */
  classify(prompt: string, domain?: string): ClassificationResult {
    const lowerPrompt = prompt.toLowerCase();
    const archetypes = archetypeRegistry.getAll();

    let bestMatch: ArchetypeDefinition | null = null;
    let bestScore = 0;
    const scores: Map<string, number> = new Map();

    // Score each archetype
    for (const archetype of archetypes) {
      const score = this.scoreArchetype(archetype, lowerPrompt, domain);
      scores.set(archetype.id, score);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = archetype;
      }
    }

    // Get alternatives
    const alternatives = this.getAlternatives(archetypes, scores, bestMatch?.id);

    // Generate reasoning
    const reasoning = this.generateReasoning(bestMatch, bestScore, lowerPrompt);

    const result: ClassificationResult = {
      archetype: bestMatch,
      confidence: bestScore,
      reasoning,
      alternatives,
    };

    logger.info('ArchetypeClassifier', 'CLASSIFICATION_COMPLETE', 'Prompt classified', {
      archetype: bestMatch?.id,
      confidence: bestScore,
      reasoning,
    });

    return result;
  }

  /**
   * Score an archetype against a prompt
   */
  private scoreArchetype(archetype: ArchetypeDefinition, prompt: string, domain?: string): number {
    let score = 0;

    // Keyword matching
    if (this.config.enableKeywordMatching) {
      const keywords = this.keywordMap.get(archetype.id) || [];
      for (const keyword of keywords) {
        if (prompt.includes(keyword)) {
          score += 0.3;
        }
      }
    }

    // Name matching
    if (prompt.includes(archetype.name.toLowerCase())) {
      score += 0.5;
    }

    // Description matching
    const descriptionWords = archetype.description.toLowerCase().split(' ');
    for (const word of descriptionWords) {
      if (prompt.includes(word) && word.length > 4) {
        score += 0.1;
      }
    }

    // Domain matching
    if (domain && this.config.enableContextInference) {
      if (this.domainMatchesArchetype(domain, archetype)) {
        score += 0.4;
      }
    }

    // Cap at 1.0
    return Math.min(score, 1.0);
  }

  /**
   * Check if a domain matches an archetype
   */
  private domainMatchesArchetype(domain: string, archetype: ArchetypeDefinition): boolean {
    const domainLower = domain.toLowerCase();
    const archetypeId = archetype.id.toLowerCase();

    // Domain-archetype mappings
    const mappings: Record<string, string[]> = {
      healthcare: ['healthcare_workspace'],
      medical: ['healthcare_workspace'],
      clinic: ['healthcare_workspace'],
      hospital: ['healthcare_workspace'],
      operations: ['operations_center', 'field_operations', 'logistics_control_center'],
      monitoring: ['operations_center'],
      analytics: ['analytics_platform'],
      data: ['analytics_platform'],
      crm: ['crm_pipeline'],
      sales: ['crm_pipeline'],
      ecommerce: ['ecommerce_console'],
      retail: ['ecommerce_console'],
      shop: ['ecommerce_console'],
      scheduling: ['scheduling_workspace'],
      calendar: ['scheduling_workspace'],
      booking: ['scheduling_workspace'],
      collaboration: ['collaboration_hub'],
      team: ['collaboration_hub'],
      communication: ['collaboration_hub'],
      finance: ['finance_terminal'],
      trading: ['finance_terminal'],
      investment: ['finance_terminal'],
      content: ['content_studio'],
      cms: ['content_studio'],
      blog: ['content_studio'],
      support: ['support_center'],
      helpdesk: ['support_center'],
      customer: ['support_center'],
      admin: ['admin_console'],
      system: ['admin_console'],
      management: ['admin_console'],
      logistics: ['logistics_control_center'],
      shipping: ['logistics_control_center'],
      delivery: ['logistics_control_center'],
    };

    for (const [key, archetypeIds] of Object.entries(mappings)) {
      if (domainLower.includes(key) && archetypeIds.includes(archetypeId)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get alternative archetypes
   */
  private getAlternatives(
    archetypes: ArchetypeDefinition[],
    scores: Map<string, number>,
    bestId?: string
  ): Array<{ archetype: ArchetypeDefinition; confidence: number }> {
    const alternatives: Array<{ archetype: ArchetypeDefinition; confidence: number }> = [];

    for (const archetype of archetypes) {
      if (archetype.id === bestId) {
        continue;
      }

      const score = scores.get(archetype.id) || 0;
      if (score >= this.config.confidenceThreshold) {
        alternatives.push({ archetype, confidence: score });
      }
    }

    // Sort by confidence and take top 3
    alternatives.sort((a, b) => b.confidence - a.confidence);
    return alternatives.slice(0, 3);
  }

  /**
   * Generate reasoning for classification
   */
  private generateReasoning(archetype: ArchetypeDefinition | null, score: number, prompt: string): string {
    if (!archetype) {
      return 'No archetype matched the prompt sufficiently';
    }

    if (score >= 0.8) {
      return `Strong match for ${archetype.name} based on prompt keywords and context`;
    } else if (score >= 0.6) {
      return `Moderate match for ${archetype.name} based on partial keyword matching`;
    } else {
      return `Weak match for ${archetype.name} - consider reviewing alternatives`;
    }
  }

  /**
   * Initialize keyword map
   */
  private initializeKeywordMap(): void {
    this.keywordMap.set('healthcare_workspace', [
      'patient', 'doctor', 'clinic', 'hospital', 'medical', 'health', 'treatment', 'appointment', 'diagnosis',
    ]);

    this.keywordMap.set('operations_center', [
      'monitor', 'alert', 'incident', 'status', 'real-time', 'operations', 'control', 'dashboard',
    ]);

    this.keywordMap.set('analytics_platform', [
      'data', 'analytics', 'chart', 'graph', 'metric', 'kpi', 'report', 'visualization', 'insight',
    ]);

    this.keywordMap.set('crm_pipeline', [
      'crm', 'customer', 'lead', 'deal', 'pipeline', 'sales', 'contact', 'relationship',
    ]);

    this.keywordMap.set('ecommerce_console', [
      'ecommerce', 'shop', 'store', 'product', 'order', 'inventory', 'shipping', 'revenue', 'sales',
    ]);

    this.keywordMap.set('scheduling_workspace', [
      'schedule', 'calendar', 'booking', 'appointment', 'resource', 'availability', 'time',
    ]);

    this.keywordMap.set('collaboration_hub', [
      'collaboration', 'team', 'chat', 'message', 'share', 'workspace', 'communication',
    ]);

    this.keywordMap.set('finance_terminal', [
      'finance', 'trading', 'stock', 'portfolio', 'investment', 'price', 'market', 'financial',
    ]);

    this.keywordMap.set('content_studio', [
      'content', 'cms', 'blog', 'article', 'media', 'publish', 'editor', 'creative',
    ]);

    this.keywordMap.set('support_center', [
      'support', 'helpdesk', 'ticket', 'customer service', 'issue', 'resolution', 'faq',
    ]);

    this.keywordMap.set('admin_console', [
      'admin', 'administration', 'system', 'configuration', 'settings', 'manage', 'control',
    ]);

    this.keywordMap.set('field_operations', [
      'field', 'mobile', 'task', 'checklist', 'location', 'on-site', 'field service',
    ]);

    this.keywordMap.set('logistics_control_center', [
      'logistics', 'shipping', 'delivery', 'fleet', 'route', 'warehouse', 'transport',
    ]);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ClassificationConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ArchetypeClassifier', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ClassificationConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: ClassificationConfig;
    archetypeCount: number;
  } {
    return {
      config: this.getConfig(),
      archetypeCount: archetypeRegistry.count(),
    };
  }
}

export const archetypeClassifier = new ArchetypeClassifier();

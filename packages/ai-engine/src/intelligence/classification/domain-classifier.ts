/**
 * Domain Classifier
 * 
 * Accurately classifies the domain of user prompts.
 * Enables domain-specific generation patterns.
 */

import { logger } from '../../shared/utils/logger';

export interface DomainPattern {
  domain: string;
  keywords: string[];
  entities: string[];
  patterns: string[];
  confidence: number;
}

export interface ClassificationResult {
  domain: string;
  confidence: number;
  alternativeDomains: Array<{ domain: string; confidence: number }>;
  matchedKeywords: string[];
  matchedEntities: string[];
}

export interface ClassifierConfig {
  enableMultiDomain: boolean;
  confidenceThreshold: number;
  maxAlternatives: number;
}

const DEFAULT_CONFIG: ClassifierConfig = {
  enableMultiDomain: true,
  confidenceThreshold: 0.6,
  maxAlternatives: 3,
};

/**
 * Domain Classifier
 * 
 * Classifies prompts into domains:
 * - Keyword-based classification
 * - Entity recognition
 * - Pattern matching
 * - Confidence scoring
 */
export class DomainClassifier {
  private config: ClassifierConfig;
  private domainPatterns: Map<string, DomainPattern> = new Map();
  private classificationHistory: Map<string, ClassificationResult> = new Map();

  constructor(config: Partial<ClassifierConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeDomainPatterns();
  }

  /**
   * Initialize domain patterns
   */
  private initializeDomainPatterns(): void {
    // E-commerce domain
    this.domainPatterns.set('ecommerce', {
      domain: 'ecommerce',
      keywords: ['shop', 'store', 'product', 'cart', 'checkout', 'order', 'inventory', 'catalog', 'price', 'discount', 'shipping', 'payment', 'customer', 'review', 'wishlist'],
      entities: ['Product', 'Order', 'Customer', 'Cart', 'Category', 'Inventory', 'Payment', 'Shipping', 'Review'],
      patterns: ['buy', 'sell', 'purchase', 'marketplace', 'online store', 'shopping'],
      confidence: 1.0,
    });

    // Healthcare domain
    this.domainPatterns.set('healthcare', {
      domain: 'healthcare',
      keywords: ['patient', 'doctor', 'medical', 'hospital', 'clinic', 'appointment', 'diagnosis', 'treatment', 'prescription', 'medication', 'symptom', 'vital', 'record', 'insurance'],
      entities: ['Patient', 'Doctor', 'Appointment', 'Diagnosis', 'Prescription', 'MedicalRecord', 'Insurance'],
      patterns: ['health', 'medical care', 'clinical', 'healthcare provider', 'patient care'],
      confidence: 1.0,
    });

    // Finance domain
    this.domainPatterns.set('finance', {
      domain: 'finance',
      keywords: ['account', 'transaction', 'bank', 'investment', 'portfolio', 'budget', 'expense', 'income', 'tax', 'loan', 'credit', 'debit', 'balance', 'audit', 'report'],
      entities: ['Account', 'Transaction', 'Investment', 'Budget', 'Expense', 'Loan', 'CreditCard', 'Bank'],
      patterns: ['financial', 'banking', 'investment', 'money management', 'accounting'],
      confidence: 1.0,
    });

    // Education domain
    this.domainPatterns.set('education', {
      domain: 'education',
      keywords: ['student', 'teacher', 'course', 'class', 'lesson', 'assignment', 'exam', 'grade', 'school', 'university', 'curriculum', 'learning', 'enrollment', 'schedule'],
      entities: ['Student', 'Teacher', 'Course', 'Assignment', 'Exam', 'Grade', 'Class', 'Curriculum'],
      patterns: ['education', 'learning', 'teaching', 'academic', 'school management'],
      confidence: 1.0,
    });

    // Project Management domain
    this.domainPatterns.set('project_management', {
      domain: 'project_management',
      keywords: ['project', 'task', 'milestone', 'deadline', 'team', 'assignee', 'status', 'priority', 'kanban', 'scrum', 'sprint', 'workflow', 'timeline', 'resource'],
      entities: ['Project', 'Task', 'Milestone', 'Team', 'Assignee', 'Sprint', 'Workflow'],
      patterns: ['project management', 'task management', 'agile', 'scrum', 'kanban'],
      confidence: 1.0,
    });

    // CRM domain
    this.domainPatterns.set('crm', {
      domain: 'crm',
      keywords: ['lead', 'contact', 'deal', 'pipeline', 'opportunity', 'customer', 'sales', 'marketing', 'campaign', 'interaction', 'relationship', 'account', 'prospect'],
      entities: ['Lead', 'Contact', 'Deal', 'Pipeline', 'Opportunity', 'Campaign', 'Customer'],
      patterns: ['customer relationship', 'sales pipeline', 'lead management', 'crm'],
      confidence: 1.0,
    });

    // Content Management domain
    this.domainPatterns.set('cms', {
      domain: 'cms',
      keywords: ['content', 'article', 'blog', 'post', 'page', 'media', 'image', 'video', 'category', 'tag', 'author', 'editor', 'publish', 'draft', 'comment'],
      entities: ['Article', 'Blog', 'Media', 'Category', 'Tag', 'Author', 'Comment'],
      patterns: ['content management', 'blog', 'publishing', 'cms'],
      confidence: 1.0,
    });

    // Analytics domain
    this.domainPatterns.set('analytics', {
      domain: 'analytics',
      keywords: ['metric', 'chart', 'graph', 'dashboard', 'report', 'analytics', 'data', 'visualization', 'insight', 'trend', 'statistics', 'kpi', 'performance', 'tracking'],
      entities: ['Metric', 'Chart', 'Dashboard', 'Report', 'Insight', 'KPI'],
      patterns: ['data analytics', 'business intelligence', 'reporting', 'visualization'],
      confidence: 1.0,
    });

    // HR domain
    this.domainPatterns.set('hr', {
      domain: 'hr',
      keywords: ['employee', 'recruitment', 'hiring', 'onboarding', 'payroll', 'benefits', 'leave', 'attendance', 'performance', 'training', 'department', 'position', 'salary'],
      entities: ['Employee', 'Recruitment', 'Payroll', 'Leave', 'Performance', 'Training'],
      patterns: ['human resources', 'hr management', 'employee management', 'recruitment'],
      confidence: 1.0,
    });

    // Inventory domain
    this.domainPatterns.set('inventory', {
      domain: 'inventory',
      keywords: ['stock', 'warehouse', 'inventory', 'item', 'sku', 'quantity', 'location', 'shipment', 'receiving', 'fulfillment', 'tracking', 'supplier', 'vendor'],
      entities: ['Stock', 'Warehouse', 'Item', 'SKU', 'Shipment', 'Supplier'],
      patterns: ['inventory management', 'warehouse', 'stock control', 'fulfillment'],
      confidence: 1.0,
    });

    logger.info('DomainClassifier', 'PATTERNS_INITIALIZED', 'Domain patterns initialized', {
      domains: this.domainPatterns.size,
    });
  }

  /**
   * Classify prompt into domain
   */
  classify(prompt: string): ClassificationResult {
    const lowerPrompt = prompt.toLowerCase();
    const scores = new Map<string, number>();
    const matchedKeywords = new Map<string, string[]>();
    const matchedEntities = new Map<string, string[]>();

    // Score each domain
    for (const [domain, pattern] of this.domainPatterns.entries()) {
      let score = 0;
      const domainKeywords: string[] = [];
      const domainEntities: string[] = [];

      // Check keywords
      for (const keyword of pattern.keywords) {
        if (lowerPrompt.includes(keyword.toLowerCase())) {
          score += 0.3;
          domainKeywords.push(keyword);
        }
      }

      // Check entities
      for (const entity of pattern.entities) {
        if (lowerPrompt.includes(entity.toLowerCase())) {
          score += 0.5;
          domainEntities.push(entity);
        }
      }

      // Check patterns
      for (const patternStr of pattern.patterns) {
        if (lowerPrompt.includes(patternStr.toLowerCase())) {
          score += 0.7;
        }
      }

      // Apply domain confidence
      score *= pattern.confidence;

      if (score > 0) {
        scores.set(domain, score);
        matchedKeywords.set(domain, domainKeywords);
        matchedEntities.set(domain, domainEntities);
      }
    }

    // Find best match
    let bestDomain = 'generic';
    let bestScore = 0;

    for (const [domain, score] of scores.entries()) {
      if (score > bestScore) {
        bestScore = score;
        bestDomain = domain;
      }
    }

    // Get alternative domains
    const alternatives: Array<{ domain: string; confidence: number }> = [];
    const sortedScores = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .filter(([domain]) => domain !== bestDomain)
      .slice(0, this.config.maxAlternatives);

    for (const [domain, score] of sortedScores) {
      alternatives.push({ domain, confidence: score });
    }

    const result: ClassificationResult = {
      domain: bestScore >= this.config.confidenceThreshold ? bestDomain : 'generic',
      confidence: bestScore,
      alternativeDomains: alternatives,
      matchedKeywords: matchedKeywords.get(bestDomain) || [],
      matchedEntities: matchedEntities.get(bestDomain) || [],
    };

    // Store classification history
    this.classificationHistory.set(prompt, result);

    logger.info('DomainClassifier', 'CLASSIFICATION_COMPLETE', 'Prompt classified', {
      domain: result.domain,
      confidence: result.confidence,
      alternatives: alternatives.length,
    });

    return result;
  }

  /**
   * Add custom domain pattern
   */
  addDomainPattern(pattern: DomainPattern): void {
    this.domainPatterns.set(pattern.domain, pattern);

    logger.info('DomainClassifier', 'PATTERN_ADDED', 'Custom domain pattern added', {
      domain: pattern.domain,
    });
  }

  /**
   * Remove domain pattern
   */
  removeDomainPattern(domain: string): boolean {
    const deleted = this.domainPatterns.delete(domain);

    if (deleted) {
      logger.info('DomainClassifier', 'PATTERN_REMOVED', 'Domain pattern removed', {
        domain,
      });
    }

    return deleted;
  }

  /**
   * Get domain pattern
   */
  getDomainPattern(domain: string): DomainPattern | undefined {
    return this.domainPatterns.get(domain);
  }

  /**
   * List all domains
   */
  listDomains(): string[] {
    return Array.from(this.domainPatterns.keys());
  }

  /**
   * Get classification history
   */
  getClassificationHistory(prompt?: string): ClassificationResult | Map<string, ClassificationResult> | undefined {
    if (prompt) {
      return this.classificationHistory.get(prompt);
    }
    return this.classificationHistory;
  }

  /**
   * Clear classification history
   */
  clearHistory(): void {
    this.classificationHistory.clear();

    logger.info('DomainClassifier', 'HISTORY_CLEARED', 'Classification history cleared');
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalDomains: number;
    totalClassifications: number;
    domainDistribution: Record<string, number>;
    averageConfidence: number;
  } {
    const history = Array.from(this.classificationHistory.values());
    const domainDistribution: Record<string, number> = {};

    for (const result of history) {
      domainDistribution[result.domain] = (domainDistribution[result.domain] || 0) + 1;
    }

    const averageConfidence = history.length > 0
      ? history.reduce((sum, r) => sum + r.confidence, 0) / history.length
      : 0;

    return {
      totalDomains: this.domainPatterns.size,
      totalClassifications: history.length,
      domainDistribution,
      averageConfidence,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ClassifierConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('DomainClassifier', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ClassifierConfig {
    return { ...this.config };
  }
}

export const domainClassifier = new DomainClassifier();

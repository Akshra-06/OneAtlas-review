/**
 * Workflow Patterns Library
 * 
 * Common workflow templates for various domains.
 * Provides reusable workflow building blocks.
 */

import { logger } from '../../shared/utils/logger';
import type { Workflow, WorkflowStep } from './workflow-inference';

export interface PatternTemplate {
  id: string;
  name: string;
  description: string;
  domain: string;
  category: 'crud' | 'process' | 'approval' | 'notification' | 'reporting';
  steps: WorkflowStep[];
  configurable: boolean;
  metadata: Record<string, unknown>;
}

export interface PatternConfig {
  enableCustomization: boolean;
  patternVersion: string;
}

const DEFAULT_CONFIG: PatternConfig = {
  enableCustomization: true,
  patternVersion: '1.0',
};

/**
 * Workflow Patterns Library
 * 
 * Provides common workflow templates:
 * - CRUD patterns
 * - Process patterns
 * - Approval patterns
 * - Notification patterns
 * - Reporting patterns
 */
export class WorkflowPatternsLibrary {
  private config: PatternConfig;
  private patterns: Map<string, PatternTemplate> = new Map();

  constructor(config: Partial<PatternConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializePatterns();
  }

  /**
   * Initialize workflow patterns
   */
  private initializePatterns(): void {
    // CRUD Pattern
    this.patterns.set('crud_standard', {
      id: 'crud_standard',
      name: 'Standard CRUD',
      description: 'Create, Read, Update, Delete operations for any entity',
      domain: 'generic',
      category: 'crud',
      steps: [
        {
          id: 'create',
          name: 'Create',
          description: 'Create new entity',
          type: 'action',
          entities: [],
          dependencies: [],
        },
        {
          id: 'read',
          name: 'Read',
          description: 'Read entity details',
          type: 'action',
          entities: [],
          dependencies: ['create'],
        },
        {
          id: 'update',
          name: 'Update',
          description: 'Update existing entity',
          type: 'action',
          entities: [],
          dependencies: ['read'],
        },
        {
          id: 'delete',
          name: 'Delete',
          description: 'Delete entity',
          type: 'action',
          entities: [],
          dependencies: ['update'],
        },
      ],
      configurable: true,
      metadata: { supportsBatch: true, supportsValidation: true },
    });

    // List/Detail Pattern
    this.patterns.set('crud_list_detail', {
      id: 'crud_list_detail',
      name: 'List and Detail',
      description: 'List view with detail page navigation',
      domain: 'generic',
      category: 'crud',
      steps: [
        {
          id: 'list',
          name: 'List',
          description: 'Display list of entities',
          type: 'action',
          entities: [],
          dependencies: [],
        },
        {
          id: 'filter',
          name: 'Filter',
          description: 'Filter list results',
          type: 'decision',
          entities: [],
          dependencies: ['list'],
        },
        {
          id: 'select',
          name: 'Select',
          description: 'Select entity from list',
          type: 'action',
          entities: [],
          dependencies: ['filter'],
        },
        {
          id: 'detail',
          name: 'Detail',
          description: 'View entity details',
          type: 'action',
          entities: [],
          dependencies: ['select'],
        },
      ],
      configurable: true,
      metadata: { supportsPagination: true, supportsSorting: true },
    });

    // Approval Pattern
    this.patterns.set('approval_standard', {
      id: 'approval_standard',
      name: 'Standard Approval',
      description: 'Multi-level approval workflow',
      domain: 'generic',
      category: 'approval',
      steps: [
        {
          id: 'submit',
          name: 'Submit',
          description: 'Submit for approval',
          type: 'action',
          entities: [],
          dependencies: [],
        },
        {
          id: 'review',
          name: 'Review',
          description: 'Reviewer reviews submission',
          type: 'decision',
          entities: [],
          dependencies: ['submit'],
        },
        {
          id: 'approve',
          name: 'Approve',
          description: 'Approve submission',
          type: 'decision',
          entities: [],
          dependencies: ['review'],
        },
        {
          id: 'reject',
          name: 'Reject',
          description: 'Reject submission',
          type: 'decision',
          entities: [],
          dependencies: ['review'],
        },
        {
          id: 'notify',
          name: 'Notify',
          description: 'Notify submitter of decision',
          type: 'output',
          entities: [],
          dependencies: ['approve', 'reject'],
        },
      ],
      configurable: true,
      metadata: { supportsEscalation: true, supportsComments: true },
    });

    // Notification Pattern
    this.patterns.set('notification_standard', {
      id: 'notification_standard',
      name: 'Standard Notification',
      description: 'Send notifications to users',
      domain: 'generic',
      category: 'notification',
      steps: [
        {
          id: 'trigger',
          name: 'Trigger',
          description: 'Trigger notification event',
          type: 'action',
          entities: [],
          dependencies: [],
        },
        {
          id: 'filter',
          name: 'Filter Recipients',
          description: 'Filter notification recipients',
          type: 'decision',
          entities: [],
          dependencies: ['trigger'],
        },
        {
          id: 'compose',
          name: 'Compose',
          description: 'Compose notification message',
          type: 'process',
          entities: [],
          dependencies: ['filter'],
        },
        {
          id: 'send',
          name: 'Send',
          description: 'Send notification',
          type: 'action',
          entities: [],
          dependencies: ['compose'],
        },
        {
          id: 'track',
          name: 'Track',
          description: 'Track delivery status',
          type: 'process',
          entities: [],
          dependencies: ['send'],
        },
      ],
      configurable: true,
      metadata: { supportsChannels: ['email', 'sms', 'push'], supportsScheduling: true },
    });

    // Reporting Pattern
    this.patterns.set('reporting_standard', {
      id: 'reporting_standard',
      name: 'Standard Report',
      description: 'Generate and display reports',
      domain: 'generic',
      category: 'reporting',
      steps: [
        {
          id: 'select',
          name: 'Select Report',
          description: 'Select report type',
          type: 'action',
          entities: [],
          dependencies: [],
        },
        {
          id: 'configure',
          name: 'Configure',
          description: 'Configure report parameters',
          type: 'decision',
          entities: [],
          dependencies: ['select'],
        },
        {
          id: 'generate',
          name: 'Generate',
          description: 'Generate report data',
          type: 'process',
          entities: [],
          dependencies: ['configure'],
        },
        {
          id: 'visualize',
          name: 'Visualize',
          description: 'Visualize report data',
          type: 'output',
          entities: [],
          dependencies: ['generate'],
        },
        {
          id: 'export',
          name: 'Export',
          description: 'Export report',
          type: 'action',
          entities: [],
          dependencies: ['visualize'],
        },
      ],
      configurable: true,
      metadata: { supportsFormats: ['pdf', 'excel', 'csv'], supportsScheduling: true },
    });

    // Search Pattern
    this.patterns.set('search_standard', {
      id: 'search_standard',
      name: 'Standard Search',
      description: 'Search and filter entities',
      domain: 'generic',
      category: 'process',
      steps: [
        {
          id: 'input',
          name: 'Input',
          description: 'User enters search query',
          type: 'action',
          entities: [],
          dependencies: [],
        },
        {
          id: 'validate',
          name: 'Validate',
          description: 'Validate search query',
          type: 'decision',
          entities: [],
          dependencies: ['input'],
        },
        {
          id: 'search',
          name: 'Search',
          description: 'Execute search',
          type: 'process',
          entities: [],
          dependencies: ['validate'],
        },
        {
          id: 'results',
          name: 'Results',
          description: 'Display search results',
          type: 'output',
          entities: [],
          dependencies: ['search'],
        },
      ],
      configurable: true,
      metadata: { supportsFilters: true, supportsSorting: true, supportsPagination: true },
    });

    // E-commerce Checkout Pattern
    this.patterns.set('ecommerce_checkout', {
      id: 'ecommerce_checkout',
      name: 'E-commerce Checkout',
      description: 'Complete checkout process for online store',
      domain: 'ecommerce',
      category: 'process',
      steps: [
        {
          id: 'cart',
          name: 'Review Cart',
          description: 'Review items in cart',
          type: 'action',
          entities: ['Cart'],
          dependencies: [],
        },
        {
          id: 'shipping',
          name: 'Shipping',
          description: 'Select shipping method',
          type: 'decision',
          entities: ['Shipping'],
          dependencies: ['cart'],
        },
        {
          id: 'payment',
          name: 'Payment',
          description: 'Process payment',
          type: 'process',
          entities: ['Payment'],
          dependencies: ['shipping'],
        },
        {
          id: 'confirm',
          name: 'Confirm',
          description: 'Confirm order',
          type: 'action',
          entities: ['Order'],
          dependencies: ['payment'],
        },
        {
          id: 'receipt',
          name: 'Receipt',
          description: 'Display order receipt',
          type: 'output',
          entities: ['Order'],
          dependencies: ['confirm'],
        },
      ],
      configurable: true,
      metadata: { supportsGuestCheckout: true, supportsCoupons: true },
    });

    // Healthcare Appointment Pattern
    this.patterns.set('healthcare_appointment', {
      id: 'healthcare_appointment',
      name: 'Healthcare Appointment',
      description: 'Schedule and manage medical appointments',
      domain: 'healthcare',
      category: 'process',
      steps: [
        {
          id: 'search',
          name: 'Search Provider',
          description: 'Search for healthcare provider',
          type: 'action',
          entities: ['Doctor'],
          dependencies: [],
        },
        {
          id: 'select',
          name: 'Select Provider',
          description: 'Select healthcare provider',
          type: 'decision',
          entities: ['Doctor'],
          dependencies: ['search'],
        },
        {
          id: 'schedule',
          name: 'Schedule',
          description: 'Schedule appointment time',
          type: 'action',
          entities: ['Appointment'],
          dependencies: ['select'],
        },
        {
          id: 'confirm',
          name: 'Confirm',
          description: 'Confirm appointment',
          type: 'action',
          entities: ['Appointment'],
          dependencies: ['schedule'],
        },
        {
          id: 'reminder',
          name: 'Reminder',
          description: 'Send appointment reminder',
          type: 'output',
          entities: ['Appointment'],
          dependencies: ['confirm'],
        },
      ],
      configurable: true,
      metadata: { supportsInsurance: true, supportsTelehealth: true },
    });

    // Project Task Pattern
    this.patterns.set('project_task', {
      id: 'project_task',
      name: 'Project Task',
      description: 'Create and manage project tasks',
      domain: 'project_management',
      category: 'crud',
      steps: [
        {
          id: 'create',
          name: 'Create Task',
          description: 'Create new task',
          type: 'action',
          entities: ['Task'],
          dependencies: [],
        },
        {
          id: 'assign',
          name: 'Assign',
          description: 'Assign task to team member',
          type: 'decision',
          entities: ['Task', 'Assignee'],
          dependencies: ['create'],
        },
        {
          id: 'track',
          name: 'Track Progress',
          description: 'Track task progress',
          type: 'process',
          entities: ['Task'],
          dependencies: ['assign'],
        },
        {
          id: 'update',
          name: 'Update Status',
          description: 'Update task status',
          type: 'action',
          entities: ['Task'],
          dependencies: ['track'],
        },
        {
          id: 'complete',
          name: 'Complete',
          description: 'Mark task as complete',
          type: 'output',
          entities: ['Task'],
          dependencies: ['update'],
        },
      ],
      configurable: true,
      metadata: { supportsDependencies: true, supportsSubtasks: true },
    });

    logger.info('WorkflowPatternsLibrary', 'PATTERNS_INITIALIZED', 'Workflow patterns initialized', {
      patterns: this.patterns.size,
    });
  }

  /**
   * Get pattern by ID
   */
  getPattern(patternId: string): PatternTemplate | undefined {
    return this.patterns.get(patternId);
  }

  /**
   * List all patterns
   */
  listPatterns(): PatternTemplate[] {
    return Array.from(this.patterns.values());
  }

  /**
   * List patterns by domain
   */
  listPatternsByDomain(domain: string): PatternTemplate[] {
    return this.listPatterns().filter(p => p.domain === domain || p.domain === 'generic');
  }

  /**
   * List patterns by category
   */
  listPatternsByCategory(category: PatternTemplate['category']): PatternTemplate[] {
    return this.listPatterns().filter(p => p.category === category);
  }

  /**
   * Add custom pattern
   */
  addPattern(pattern: PatternTemplate): void {
    this.patterns.set(pattern.id, pattern);

    logger.info('WorkflowPatternsLibrary', 'PATTERN_ADDED', 'Custom pattern added', {
      patternId: pattern.id,
      patternName: pattern.name,
    });
  }

  /**
   * Remove pattern
   */
  removePattern(patternId: string): boolean {
    const deleted = this.patterns.delete(patternId);

    if (deleted) {
      logger.info('WorkflowPatternsLibrary', 'PATTERN_REMOVED', 'Pattern removed', {
        patternId,
      });
    }

    return deleted;
  }

  /**
   * Customize pattern
   */
  customizePattern(patternId: string, customizations: Partial<PatternTemplate>): PatternTemplate | undefined {
    const pattern = this.patterns.get(patternId);
    
    if (!pattern || !this.config.enableCustomization) {
      return undefined;
    }

    const customized: PatternTemplate = {
      ...pattern,
      ...customizations,
      id: `${patternId}_custom_${Date.now()}`,
    };

    this.patterns.set(customized.id, customized);

    logger.info('WorkflowPatternsLibrary', 'PATTERN_CUSTOMIZED', 'Pattern customized', {
      originalId: patternId,
      customId: customized.id,
    });

    return customized;
  }

  /**
   * Convert pattern to workflow
   */
  patternToWorkflow(patternId: string): Workflow | undefined {
    const pattern = this.patterns.get(patternId);
    
    if (!pattern) {
      return undefined;
    }

    return {
      id: pattern.id,
      name: pattern.name,
      description: pattern.description,
      domain: pattern.domain,
      steps: pattern.steps,
      confidence: 1.0,
    };
  }

  /**
   * Get pattern recommendations for domain
   */
  getRecommendations(domain: string): PatternTemplate[] {
    const domainPatterns = this.listPatternsByDomain(domain);
    const genericPatterns = this.listPatternsByCategory('crud').slice(0, 2);
    
    return [...domainPatterns, ...genericPatterns];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PatternConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('WorkflowPatternsLibrary', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): PatternConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalPatterns: number;
    byDomain: Record<string, number>;
    byCategory: Record<string, number>;
  } {
    const patterns = this.listPatterns();
    const byDomain: Record<string, number> = {};
    const byCategory: Record<string, number> = {};

    for (const pattern of patterns) {
      byDomain[pattern.domain] = (byDomain[pattern.domain] || 0) + 1;
      byCategory[pattern.category] = (byCategory[pattern.category] || 0) + 1;
    }

    return {
      totalPatterns: patterns.length,
      byDomain,
      byCategory,
    };
  }
}

export const workflowPatternsLibrary = new WorkflowPatternsLibrary();

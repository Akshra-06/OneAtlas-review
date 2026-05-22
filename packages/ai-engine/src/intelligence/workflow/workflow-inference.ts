/**
 * Workflow Inference
 * 
 * Detects contextual workflows from user prompts.
 * Infers intended user journeys and processes.
 */

import { logger } from '../../shared/utils/logger';

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: 'action' | 'decision' | 'process' | 'output';
  entities: string[];
  dependencies: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  domain: string;
  steps: WorkflowStep[];
  confidence: number;
}

export interface InferenceResult {
  workflow: Workflow;
  confidence: number;
  alternativeWorkflows: Array<{ workflow: Workflow; confidence: number }>;
  matchedKeywords: string[];
}

export interface InferenceConfig {
  enableMultiWorkflow: boolean;
  confidenceThreshold: number;
  maxAlternatives: number;
}

const DEFAULT_CONFIG: InferenceConfig = {
  enableMultiWorkflow: true,
  confidenceThreshold: 0.6,
  maxAlternatives: 3,
};

/**
 * Workflow Inference Engine
 * 
 * Infers workflows from prompts:
 * - Workflow pattern detection
 * - Step sequence inference
 * - Entity relationship mapping
 * - Confidence scoring
 */
export class WorkflowInference {
  private config: InferenceConfig;
  private workflowPatterns: Map<string, Workflow> = new Map();
  private inferenceHistory: Map<string, InferenceResult> = new Map();

  constructor(config: Partial<InferenceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeWorkflowPatterns();
  }

  /**
   * Initialize workflow patterns
   */
  private initializeWorkflowPatterns(): void {
    // E-commerce workflows
    this.workflowPatterns.set('ecommerce_browse_to_buy', {
      id: 'ecommerce_browse_to_buy',
      name: 'Browse to Purchase',
      description: 'Customer browsing products and making a purchase',
      domain: 'ecommerce',
      steps: [
        {
          id: 'browse',
          name: 'Browse Products',
          description: 'User browses product catalog',
          type: 'action',
          entities: ['Product', 'Category'],
          dependencies: [],
        },
        {
          id: 'view',
          name: 'View Product Details',
          description: 'User views specific product details',
          type: 'action',
          entities: ['Product'],
          dependencies: ['browse'],
        },
        {
          id: 'add_to_cart',
          name: 'Add to Cart',
          description: 'User adds product to shopping cart',
          type: 'action',
          entities: ['Cart', 'Product'],
          dependencies: ['view'],
        },
        {
          id: 'checkout',
          name: 'Checkout',
          description: 'User proceeds to checkout',
          type: 'process',
          entities: ['Order', 'Payment'],
          dependencies: ['add_to_cart'],
        },
        {
          id: 'payment',
          name: 'Process Payment',
          description: 'Payment is processed',
          type: 'process',
          entities: ['Payment'],
          dependencies: ['checkout'],
        },
        {
          id: 'confirmation',
          name: 'Order Confirmation',
          description: 'User receives order confirmation',
          type: 'output',
          entities: ['Order'],
          dependencies: ['payment'],
        },
      ],
      confidence: 1.0,
    });

    // Healthcare workflows
    this.workflowPatterns.set('healthcare_appointment', {
      id: 'healthcare_appointment',
      name: 'Patient Appointment',
      description: 'Patient scheduling and attending medical appointments',
      domain: 'healthcare',
      steps: [
        {
          id: 'search',
          name: 'Search Doctor',
          description: 'Patient searches for available doctors',
          type: 'action',
          entities: ['Doctor'],
          dependencies: [],
        },
        {
          id: 'select',
          name: 'Select Doctor',
          description: 'Patient selects a doctor',
          type: 'decision',
          entities: ['Doctor', 'Patient'],
          dependencies: ['search'],
        },
        {
          id: 'schedule',
          name: 'Schedule Appointment',
          description: 'Patient schedules appointment',
          type: 'action',
          entities: ['Appointment'],
          dependencies: ['select'],
        },
        {
          id: 'confirm',
          name: 'Confirm Appointment',
          description: 'Appointment is confirmed',
          type: 'process',
          entities: ['Appointment'],
          dependencies: ['schedule'],
        },
        {
          id: 'attend',
          name: 'Attend Appointment',
          description: 'Patient attends appointment',
          type: 'action',
          entities: ['Patient', 'Doctor'],
          dependencies: ['confirm'],
        },
        {
          id: 'record',
          name: 'Record Visit',
          description: 'Visit details are recorded',
          type: 'output',
          entities: ['MedicalRecord'],
          dependencies: ['attend'],
        },
      ],
      confidence: 1.0,
    });

    // Project management workflows
    this.workflowPatterns.set('project_task_workflow', {
      id: 'project_task_workflow',
      name: 'Task Management',
      description: 'Creating and managing project tasks',
      domain: 'project_management',
      steps: [
        {
          id: 'create',
          name: 'Create Task',
          description: 'User creates a new task',
          type: 'action',
          entities: ['Task'],
          dependencies: [],
        },
        {
          id: 'assign',
          name: 'Assign Task',
          description: 'Task is assigned to team member',
          type: 'decision',
          entities: ['Task', 'Assignee'],
          dependencies: ['create'],
        },
        {
          id: 'track',
          name: 'Track Progress',
          description: 'Task progress is tracked',
          type: 'process',
          entities: ['Task'],
          dependencies: ['assign'],
        },
        {
          id: 'update',
          name: 'Update Status',
          description: 'Task status is updated',
          type: 'action',
          entities: ['Task'],
          dependencies: ['track'],
        },
        {
          id: 'complete',
          name: 'Complete Task',
          description: 'Task is marked as complete',
          type: 'output',
          entities: ['Task'],
          dependencies: ['update'],
        },
      ],
      confidence: 1.0,
    });

    // CRM workflows
    this.workflowPatterns.set('crm_lead_conversion', {
      id: 'crm_lead_conversion',
      name: 'Lead to Customer',
      description: 'Converting leads to customers',
      domain: 'crm',
      steps: [
        {
          id: 'capture',
          name: 'Capture Lead',
          description: 'Lead information is captured',
          type: 'action',
          entities: ['Lead'],
          dependencies: [],
        },
        {
          id: 'qualify',
          name: 'Qualify Lead',
          description: 'Lead is qualified',
          type: 'decision',
          entities: ['Lead'],
          dependencies: ['capture'],
        },
        {
          id: 'nurture',
          name: 'Nurture Lead',
          description: 'Lead is nurtured through communication',
          type: 'process',
          entities: ['Lead', 'Campaign'],
          dependencies: ['qualify'],
        },
        {
          id: 'convert',
          name: 'Convert to Opportunity',
          description: 'Lead is converted to opportunity',
          type: 'action',
          entities: ['Opportunity'],
          dependencies: ['nurture'],
        },
        {
          id: 'close',
          name: 'Close Deal',
          description: 'Deal is closed',
          type: 'output',
          entities: ['Deal'],
          dependencies: ['convert'],
        },
      ],
      confidence: 1.0,
    });

    logger.info('WorkflowInference', 'PATTERNS_INITIALIZED', 'Workflow patterns initialized', {
      workflows: this.workflowPatterns.size,
    });
  }

  /**
   * Infer workflow from prompt
   */
  infer(prompt: string, domain?: string): InferenceResult {
    const lowerPrompt = prompt.toLowerCase();
    const scores = new Map<string, number>();
    const matchedKeywords = new Map<string, string[]>();

    // Score each workflow pattern
    for (const [workflowId, workflow] of this.workflowPatterns.entries()) {
      let score = 0;
      const workflowKeywords: string[] = [];

      // Filter by domain if provided
      if (domain && workflow.domain !== domain) {
        continue;
      }

      // Check workflow name and description
      if (lowerPrompt.includes(workflow.name.toLowerCase())) {
        score += 0.8;
        workflowKeywords.push(workflow.name);
      }

      // Check step entities
      for (const step of workflow.steps) {
        for (const entity of step.entities) {
          if (lowerPrompt.includes(entity.toLowerCase())) {
            score += 0.4;
            workflowKeywords.push(entity);
          }
        }
      }

      // Check step names
      for (const step of workflow.steps) {
        if (lowerPrompt.includes(step.name.toLowerCase())) {
          score += 0.3;
          workflowKeywords.push(step.name);
        }
      }

      // Apply workflow confidence
      score *= workflow.confidence;

      if (score > 0) {
        scores.set(workflowId, score);
        matchedKeywords.set(workflowId, workflowKeywords);
      }
    }

    // Find best match
    let bestWorkflowId = '';
    let bestScore = 0;

    for (const [workflowId, score] of scores.entries()) {
      if (score > bestScore) {
        bestScore = score;
        bestWorkflowId = workflowId;
      }
    }

    // Get workflow
    const workflow = bestWorkflowId ? this.workflowPatterns.get(bestWorkflowId) : this.createGenericWorkflow(prompt, domain);

    if (!workflow) {
      throw new Error('Failed to create workflow');
    }

    // Get alternative workflows
    const alternatives: Array<{ workflow: Workflow; confidence: number }> = [];
    const sortedScores = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .filter(([id]) => id !== bestWorkflowId)
      .slice(0, this.config.maxAlternatives);

    for (const [workflowId, score] of sortedScores) {
      const altWorkflow = this.workflowPatterns.get(workflowId);
      if (altWorkflow) {
        alternatives.push({ workflow: altWorkflow, confidence: score });
      }
    }

    const result: InferenceResult = {
      workflow,
      confidence: bestScore,
      alternativeWorkflows: alternatives,
      matchedKeywords: matchedKeywords.get(bestWorkflowId) || [],
    };

    // Store inference history
    this.inferenceHistory.set(prompt, result);

    logger.info('WorkflowInference', 'INFERENCE_COMPLETE', 'Workflow inferred', {
      workflowId: workflow.id,
      workflowName: workflow.name,
      confidence: result.confidence,
      alternatives: alternatives.length,
    });

    return result;
  }

  /**
   * Create generic workflow
   */
  private createGenericWorkflow(prompt: string, domain?: string): Workflow {
    return {
      id: 'generic_workflow',
      name: 'Generic Workflow',
      description: 'Generic workflow based on prompt analysis',
      domain: domain || 'generic',
      steps: [
        {
          id: 'input',
          name: 'Input',
          description: 'User provides input',
          type: 'action',
          entities: [],
          dependencies: [],
        },
        {
          id: 'process',
          name: 'Process',
          description: 'System processes input',
          type: 'process',
          entities: [],
          dependencies: ['input'],
        },
        {
          id: 'output',
          name: 'Output',
          description: 'System provides output',
          type: 'output',
          entities: [],
          dependencies: ['process'],
        },
      ],
      confidence: 0.5,
    };
  }

  /**
   * Add custom workflow pattern
   */
  addWorkflowPattern(workflow: Workflow): void {
    this.workflowPatterns.set(workflow.id, workflow);

    logger.info('WorkflowInference', 'PATTERN_ADDED', 'Custom workflow pattern added', {
      workflowId: workflow.id,
      workflowName: workflow.name,
    });
  }

  /**
   * Remove workflow pattern
   */
  removeWorkflowPattern(workflowId: string): boolean {
    const deleted = this.workflowPatterns.delete(workflowId);

    if (deleted) {
      logger.info('WorkflowInference', 'PATTERN_REMOVED', 'Workflow pattern removed', {
        workflowId,
      });
    }

    return deleted;
  }

  /**
   * Get workflow pattern
   */
  getWorkflowPattern(workflowId: string): Workflow | undefined {
    return this.workflowPatterns.get(workflowId);
  }

  /**
   * List all workflows
   */
  listWorkflows(): Workflow[] {
    return Array.from(this.workflowPatterns.values());
  }

  /**
   * List workflows by domain
   */
  listWorkflowsByDomain(domain: string): Workflow[] {
    return this.listWorkflows().filter(w => w.domain === domain);
  }

  /**
   * Get inference history
   */
  getInferenceHistory(prompt?: string): InferenceResult | Map<string, InferenceResult> | undefined {
    if (prompt) {
      return this.inferenceHistory.get(prompt);
    }
    return this.inferenceHistory;
  }

  /**
   * Clear inference history
   */
  clearHistory(): void {
    this.inferenceHistory.clear();

    logger.info('WorkflowInference', 'HISTORY_CLEARED', 'Inference history cleared');
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalWorkflows: number;
    totalInferences: number;
    workflowDistribution: Record<string, number>;
    averageConfidence: number;
  } {
    const history = Array.from(this.inferenceHistory.values());
    const workflowDistribution: Record<string, number> = {};

    for (const result of history) {
      workflowDistribution[result.workflow.id] = (workflowDistribution[result.workflow.id] || 0) + 1;
    }

    const averageConfidence = history.length > 0
      ? history.reduce((sum, r) => sum + r.confidence, 0) / history.length
      : 0;

    return {
      totalWorkflows: this.workflowPatterns.size,
      totalInferences: history.length,
      workflowDistribution,
      averageConfidence,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<InferenceConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('WorkflowInference', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): InferenceConfig {
    return { ...this.config };
  }
}

export const workflowInference = new WorkflowInference();

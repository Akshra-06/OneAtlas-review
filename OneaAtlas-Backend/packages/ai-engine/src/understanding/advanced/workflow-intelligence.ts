/**
 * Workflow Intelligence System
 * 
 * Infers and enhances workflow intelligence for:
 * - Multi-step workflows
 * - Approval chains
 * - Notifications
 * - Escalations
 * - Role-based operations
 * - State transitions
 * - Operational dependencies
 * - Workflow priority and bottlenecks
 */

import type { WorkflowNode, EntityNode } from '@oneatlas/shared';

export interface WorkflowAnalysis {
  complexity: 'simple' | 'moderate' | 'complex';
  hasApprovalChain: boolean;
  hasNotifications: boolean;
  hasEscalations: boolean;
  hasStateTransitions: boolean;
  estimatedSteps: number;
  bottlenecks: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggestedWorkflows: WorkflowNode[];
  confidence: number;
}

export interface WorkflowEnhancement {
  type: 'approval' | 'notification' | 'escalation' | 'state_transition' | 'role_based' | 'dependency';
  description: string;
  suggestion: string;
  affectedWorkflow: string;
}

export class WorkflowIntelligence {
  /**
   * Analyze workflow complexity and characteristics
   */
  analyze(workflows: WorkflowNode[], entities: EntityNode[]): WorkflowAnalysis {
    const hasApprovalChain = this.detectApprovalChains(workflows);
    const hasNotifications = this.detectNotifications(workflows);
    const hasEscalations = this.detectEscalations(workflows);
    const hasStateTransitions = this.detectStateTransitions(workflows);
    const estimatedSteps = this.estimateSteps(workflows);
    const bottlenecks = this.identifyBottlenecks(workflows, entities);
    const priority = this.assessPriority(workflows, entities);
    const suggestedWorkflows = this.suggestWorkflows(workflows, entities);
    const complexity = this.assessComplexity(workflows, hasApprovalChain, hasEscalations);
    const confidence = this.calculateConfidence(workflows, entities);

    return {
      complexity,
      hasApprovalChain,
      hasNotifications,
      hasEscalations,
      hasStateTransitions,
      estimatedSteps,
      bottlenecks,
      priority,
      suggestedWorkflows,
      confidence,
    };
  }

  /**
   * Detect approval chains in workflows
   */
  private detectApprovalChains(workflows: WorkflowNode[]): boolean {
    const approvalKeywords = ['approve', 'review', 'approve', 'sign-off', 'authorization', 'validation'];
    
    return workflows.some(workflow =>
      approvalKeywords.some(keyword =>
        workflow.name.toLowerCase().includes(keyword) ||
        workflow.description.toLowerCase().includes(keyword) ||
        workflow.steps.some(step => step.toLowerCase().includes(keyword))
      )
    );
  }

  /**
   * Detect notification workflows
   */
  private detectNotifications(workflows: WorkflowNode[]): boolean {
    const notificationKeywords = ['notify', 'alert', 'email', 'notification', 'message', 'reminder'];
    
    return workflows.some(workflow =>
      notificationKeywords.some(keyword =>
        workflow.name.toLowerCase().includes(keyword) ||
        workflow.description.toLowerCase().includes(keyword) ||
        workflow.steps.some(step => step.toLowerCase().includes(keyword))
      )
    );
  }

  /**
   * Detect escalation workflows
   */
  private detectEscalations(workflows: WorkflowNode[]): boolean {
    const escalationKeywords = ['escalate', 'escalation', 'timeout', 'follow-up', 'retry', 'remediate'];
    
    return workflows.some(workflow =>
      escalationKeywords.some(keyword =>
        workflow.name.toLowerCase().includes(keyword) ||
        workflow.description.toLowerCase().includes(keyword) ||
        workflow.steps.some(step => step.toLowerCase().includes(keyword))
      )
    );
  }

  /**
   * Detect state transition workflows
   */
  private detectStateTransitions(workflows: WorkflowNode[]): boolean {
    const stateKeywords = ['status', 'state', 'transition', 'change', 'update', 'progress'];
    
    return workflows.some(workflow =>
      stateKeywords.some(keyword =>
        workflow.name.toLowerCase().includes(keyword) ||
        workflow.description.toLowerCase().includes(keyword) ||
        workflow.steps.some(step => step.toLowerCase().includes(keyword))
      )
    );
  }

  /**
   * Estimate number of workflow steps
   */
  private estimateSteps(workflows: WorkflowNode[]): number {
    return workflows.reduce((total, workflow) => total + workflow.steps.length, 0);
  }

  /**
   * Identify potential bottlenecks in workflows
   */
  private identifyBottlenecks(workflows: WorkflowNode[], entities: EntityNode[]): string[] {
    const bottlenecks: string[] = [];

    // Check for manual approval steps
    for (const workflow of workflows) {
      const manualSteps = workflow.steps.filter(step =>
        step.toLowerCase().includes('manual') ||
        step.toLowerCase().includes('review') ||
        step.toLowerCase().includes('approve')
      );
      
      if (manualSteps.length > 2) {
        bottlenecks.push(`${workflow.name}: Multiple manual approval steps may cause delays`);
      }
    }

    // Check for sequential dependencies
    const sequentialWorkflows = workflows.filter(w => w.executionMode === 'SYNC');
    if (sequentialWorkflows.length > 3) {
      bottlenecks.push('Multiple synchronous workflows may create sequential bottlenecks');
    }

    // Check for entity dependencies
    const entityNames = entities.map(e => e.name.toLowerCase());
    for (const workflow of workflows) {
      const mentionedEntities = entityNames.filter(name =>
        workflow.name.toLowerCase().includes(name) ||
        workflow.description.toLowerCase().includes(name)
      );
      
      if (mentionedEntities.length > 2) {
        bottlenecks.push(`${workflow.name}: Depends on multiple entities, may be complex`);
      }
    }

    return bottlenecks;
  }

  /**
   * Assess workflow priority based on business impact
   */
  private assessPriority(workflows: WorkflowNode[], entities: EntityNode[]): 'low' | 'medium' | 'high' | 'critical' {
    let score = 0;

    // Critical keywords
    const criticalKeywords = ['payment', 'security', 'compliance', 'legal', 'financial'];
    const highKeywords = ['approval', 'escalation', 'notification', 'customer'];
    const mediumKeywords = ['report', 'analytics', 'dashboard', 'monitor'];

    for (const workflow of workflows) {
      const text = `${workflow.name} ${workflow.description} ${workflow.steps.join(' ')}`.toLowerCase();
      
      if (criticalKeywords.some(kw => text.includes(kw))) score += 3;
      if (highKeywords.some(kw => text.includes(kw))) score += 2;
      if (mediumKeywords.some(kw => text.includes(kw))) score += 1;
    }

    // Check execution mode
    const asyncWorkflows = workflows.filter(w => w.executionMode === 'ASYNC');
    if (asyncWorkflows.length > 0) score += 1;

    // Check trigger type
    const systemEventWorkflows = workflows.filter(w => w.triggerType === 'SYSTEM_EVENT');
    if (systemEventWorkflows.length > 0) score += 1;

    if (score >= 5) return 'critical';
    if (score >= 3) return 'high';
    if (score >= 1) return 'medium';
    return 'low';
  }

  /**
   * Suggest additional workflows based on context
   */
  private suggestWorkflows(workflows: WorkflowNode[], entities: EntityNode[]): WorkflowNode[] {
    const suggested: WorkflowNode[] = [];
    const existingWorkflowNames = new Set(workflows.map(w => w.name.toLowerCase()));

    // Suggest approval workflow if entities have status fields
    const statusEntities = entities.filter(entity =>
      entity.attributes.some(attr =>
        attr.semanticType === 'status' ||
        attr.name.toLowerCase().includes('status') ||
        attr.name.toLowerCase().includes('state')
      )
    );

    for (const entity of statusEntities) {
      const workflowName = `${entity.name} Approval`;
      if (!existingWorkflowNames.has(workflowName.toLowerCase())) {
        suggested.push({
          id: `suggested_${entity.name.toLowerCase()}_approval`,
          name: workflowName,
          description: `Approval workflow for ${entity.name} status changes`,
          triggerType: 'USER_ACTION',
          executionMode: 'SYNC',
          steps: [
            `Submit ${entity.name} for review`,
            'Manager review',
            'Approve or reject',
            'Update status',
            'Notify requester',
          ],
        });
      }
    }

    // Suggest notification workflow if entities have date fields
    const dateEntities = entities.filter(entity =>
      entity.attributes.some(attr =>
        attr.semanticType === 'date' ||
        attr.semanticType === 'datetime' ||
        attr.name.toLowerCase().includes('date') ||
        attr.name.toLowerCase().includes('time')
      )
    );

    for (const entity of dateEntities) {
      const workflowName = `${entity.name} Reminder`;
      if (!existingWorkflowNames.has(workflowName.toLowerCase())) {
        suggested.push({
          id: `suggested_${entity.name.toLowerCase()}_reminder`,
          name: workflowName,
          description: `Reminder notification for ${entity.name} due dates`,
          triggerType: 'SYSTEM_EVENT',
          executionMode: 'ASYNC',
          steps: [
            'Check for upcoming due dates',
            'Send reminder notifications',
            'Log notification sent',
          ],
        });
      }
    }

    // Suggest escalation workflow if entities have priority fields
    const priorityEntities = entities.filter(entity =>
      entity.attributes.some(attr =>
        attr.semanticType === 'priority' ||
        attr.name.toLowerCase().includes('priority')
      )
    );

    for (const entity of priorityEntities) {
      const workflowName = `${entity.name} Escalation`;
      if (!existingWorkflowNames.has(workflowName.toLowerCase())) {
        suggested.push({
          id: `suggested_${entity.name.toLowerCase()}_escalation`,
          name: workflowName,
          description: `Escalation workflow for high-priority ${entity.name} items`,
          triggerType: 'SYSTEM_EVENT',
          executionMode: 'ASYNC',
          steps: [
            'Check for overdue high-priority items',
            'Escalate to manager',
            'Send escalation notification',
            'Update escalation status',
          ],
        });
      }
    }

    return suggested;
  }

  /**
   * Assess overall workflow complexity
   */
  private assessComplexity(
    workflows: WorkflowNode[],
    hasApprovalChain: boolean,
    hasEscalations: boolean
  ): 'simple' | 'moderate' | 'complex' {
    const stepCount = this.estimateSteps(workflows);
    const workflowCount = workflows.length;

    if (workflowCount === 0) return 'simple';
    if (workflowCount === 1 && stepCount <= 3 && !hasApprovalChain && !hasEscalations) {
      return 'simple';
    }
    if (workflowCount <= 3 && stepCount <= 10 && !hasEscalations) {
      return 'moderate';
    }
    return 'complex';
  }

  /**
   * Calculate confidence in workflow analysis
   */
  private calculateConfidence(workflows: WorkflowNode[], entities: EntityNode[]): number {
    let confidence = 0.5;

    // Increase confidence if workflows are well-defined
    if (workflows.length > 0) confidence += 0.2;
    if (workflows.every(w => w.steps.length > 0)) confidence += 0.1;
    if (workflows.every(w => w.description.length > 10)) confidence += 0.1;

    // Increase confidence if entities support workflows
    if (entities.length > 0) confidence += 0.1;

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Generate workflow enhancement suggestions
   */
  generateEnhancements(analysis: WorkflowAnalysis): WorkflowEnhancement[] {
    const enhancements: WorkflowEnhancement[] = [];

    if (!analysis.hasApprovalChain && analysis.complexity !== 'simple') {
      enhancements.push({
        type: 'approval',
        description: 'No approval chain detected in workflows',
        suggestion: 'Consider adding approval workflows for critical operations',
        affectedWorkflow: 'general',
      });
    }

    if (!analysis.hasNotifications && analysis.estimatedSteps > 5) {
      enhancements.push({
        type: 'notification',
        description: 'No notification workflows detected',
        suggestion: 'Add notification workflows to keep users informed of progress',
        affectedWorkflow: 'general',
      });
    }

    if (!analysis.hasEscalations && analysis.priority === 'high' || analysis.priority === 'critical') {
      enhancements.push({
        type: 'escalation',
        description: 'No escalation workflows for high-priority system',
        suggestion: 'Add escalation workflows to handle timeouts and failures',
        affectedWorkflow: 'general',
      });
    }

    if (analysis.bottlenecks.length > 0) {
      for (const bottleneck of analysis.bottlenecks) {
        enhancements.push({
          type: 'dependency',
          description: bottleneck,
          suggestion: 'Consider parallelizing or optimizing workflow steps',
          affectedWorkflow: 'general',
        });
      }
    }

    return enhancements;
  }

  /**
   * Enhance existing workflows with intelligence
   */
  enhanceWorkflows(workflows: WorkflowNode[], analysis: WorkflowAnalysis): WorkflowNode[] {
    const enhanced = [...workflows];

    // Add notification steps to approval workflows
    for (const workflow of enhanced) {
      if (workflow.name.toLowerCase().includes('approval') || 
          workflow.name.toLowerCase().includes('review')) {
        
        const hasNotification = workflow.steps.some(step =>
          step.toLowerCase().includes('notify') ||
          step.toLowerCase().includes('email')
        );

        if (!hasNotification) {
          workflow.steps.push('Notify requester of decision');
        }
      }
    }

    // Add state tracking to workflows that change entity state
    for (const workflow of enhanced) {
      const hasStateChange = workflow.steps.some(step =>
        step.toLowerCase().includes('update') ||
        step.toLowerCase().includes('change') ||
        step.toLowerCase().includes('status')
      );

      if (hasStateChange) {
        const hasLog = workflow.steps.some(step =>
          step.toLowerCase().includes('log') ||
          step.toLowerCase().includes('record')
        );

        if (!hasLog) {
          workflow.steps.push('Log state change for audit trail');
        }
      }
    }

    return enhanced;
  }
}

export const workflowIntelligence = new WorkflowIntelligence();

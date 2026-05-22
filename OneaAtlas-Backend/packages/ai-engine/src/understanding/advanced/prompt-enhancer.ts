/**
 * Prompt Enhancement System
 * 
 * Infers missing context, resolves ambiguity, and enhances vague prompts
 * to improve generation quality without losing user intent.
 */

import { promptAnalyzer, PromptAnalysis } from './prompt-analyzer';

export interface EnhancedPrompt {
  original: string;
  enhanced: string;
  inferences: string[];
  confidence: number;
}

export class PromptEnhancer {
  /**
   * Enhance a vague or incomplete prompt with inferred context
   */
  enhance(prompt: string): EnhancedPrompt {
    const analysis = promptAnalyzer.analyze(prompt);
    const inferences: string[] = [];
    let enhanced = prompt;

    // Infer missing entities
    if (analysis.clarity === 'low' || analysis.missingContext.length > 0) {
      const entityInferences = this.inferMissingEntities(prompt);
      if (entityInferences.length > 0) {
        inferences.push(...entityInferences);
        enhanced = this.appendContext(enhanced, entityInferences.join(' '));
      }
    }

    // Infer workflow triggers
    if (analysis.workflowCount > 0 && analysis.missingContext.some(c => c.includes('trigger'))) {
      const triggerInferences = this.inferWorkflowTriggers(prompt);
      if (triggerInferences.length > 0) {
        inferences.push(...triggerInferences);
        enhanced = this.appendContext(enhanced, triggerInferences.join(' '));
      }
    }

    // Infer user roles
    if (analysis.missingContext.some(c => c.includes('role'))) {
      const roleInferences = this.inferUserRoles(prompt);
      if (roleInferences.length > 0) {
        inferences.push(...roleInferences);
        enhanced = this.appendContext(enhanced, roleInferences.join(' '));
      }
    }

    // Disambiguate mixed domains
    if (analysis.domainComplexity === 'mixed' || analysis.domainComplexity === 'enterprise') {
      const domainClarifications = this.disambiguateDomains(prompt);
      if (domainClarifications.length > 0) {
        inferences.push(...domainClarifications);
        enhanced = this.appendContext(enhanced, domainClarifications.join(' '));
      }
    }

    return {
      original: prompt,
      enhanced,
      inferences,
      confidence: analysis.confidence,
    };
  }

  /**
   * Infer missing entities from context
   */
  private inferMissingEntities(prompt: string): string[] {
    const inferences: string[] = [];

    // If user mentions actions without entities, infer common ones
    if (/\b(manage|track|monitor)\b/i.test(prompt) && 
        !/\b(user|customer|patient|order|task|project)\b/i.test(prompt)) {
      inferences.push('with users and tasks');
    }

    // If mentions approval without subject
    if (/\b(approval|approve|review)\b/i.test(prompt) && 
        !/\b(request|submission|application|expense)\b/i.test(prompt)) {
      inferences.push('with approval requests');
    }

    // If mentions scheduling without items
    if (/\b(schedule|calendar|appointment)\b/i.test(prompt) && 
        !/\b(meeting|event|session|visit)\b/i.test(prompt)) {
      inferences.push('with events and meetings');
    }

    return inferences;
  }

  /**
   * Infer workflow triggers from context
   */
  private inferWorkflowTriggers(prompt: string): string[] {
    const inferences: string[] = [];

    // Approval workflows
    if (/\b(approval|approve)\b/i.test(prompt)) {
      if (/\b(submit|create|request)\b/i.test(prompt)) {
        inferences.push('triggered on submission');
      } else {
        inferences.push('triggered on user actions');
      }
    }

    // Notification workflows
    if (/\b(notification|notify|alert)\b/i.test(prompt)) {
      if (/\b(status|change|update)\b/i.test(prompt)) {
        inferences.push('triggered on status changes');
      } else {
        inferences.push('triggered on important events');
      }
    }

    // Escalation workflows
    if (/\b(escalation|escalate)\b/i.test(prompt)) {
      inferences.push('triggered on timeout or failure');
    }

    return inferences;
  }

  /**
   * Infer user roles from context
   */
  private inferUserRoles(prompt: string): string[] {
    const inferences: string[] = [];

    // Admin roles
    if (/\b(admin|manage|control|configure)\b/i.test(prompt)) {
      inferences.push('with admin users for management');
    }

    // Regular user roles
    if (/\b(user|customer|patient|employee)\b/i.test(prompt)) {
      inferences.push('with regular users for daily operations');
    }

    // Reviewer roles
    if (/\b(review|approve|audit)\b/i.test(prompt)) {
      inferences.push('with reviewers for approval processes');
    }

    return [...new Set(inferences)];
  }

  /**
   * Disambiguate mixed-domain prompts
   */
  private disambiguateDomains(prompt: string): string[] {
    const clarifications: string[] = [];

    // Healthcare + CRM
    if (/\b(patient|doctor|medical)\b/i.test(prompt) && 
        /\b(customer|lead|sales)\b/i.test(prompt)) {
      clarifications.push('with separate patient management and customer relationship modules');
    }

    // E-commerce + Inventory
    if (/\b(product|order)\b/i.test(prompt) && 
        /\b(inventory|stock|warehouse)\b/i.test(prompt)) {
      clarifications.push('with integrated product catalog and inventory tracking');
    }

    // HR + Payroll
    if (/\b(employee|hr|recruitment)\b/i.test(prompt) && 
        /\b(payroll|salary|payment)\b/i.test(prompt)) {
      clarifications.push('with employee management and payroll processing');
    }

    // Analytics + Operations
    if (/\b(analytics|dashboard|report)\b/i.test(prompt) && 
        /\b(operation|workflow|process)\b/i.test(prompt)) {
      clarifications.push('with both analytics dashboards and operational workflows');
    }

    return clarifications;
  }

  /**
   * Append context to prompt naturally
   */
  private appendContext(prompt: string, context: string): string {
    // Remove trailing punctuation
    const cleanPrompt = prompt.trim().replace(/[.,;]$/, '');
    return `${cleanPrompt}, ${context}.`;
  }

  /**
   * Generate prompt improvement suggestions
   */
  generateImprovementSuggestions(prompt: string): string[] {
    const analysis = promptAnalyzer.analyze(prompt);
    const suggestions: string[] = [];

    if (analysis.clarity === 'low') {
      suggestions.push('Add specific entity names and their relationships');
      suggestions.push('Define the main workflows and their triggers');
      suggestions.push('Specify user roles and permissions');
    }

    if (analysis.domainComplexity === 'mixed') {
      suggestions.push('Clarify how different domains interact');
      suggestions.push('Define which domain is primary');
    }

    if (analysis.missingContext.includes('Entity relationships undefined')) {
      suggestions.push('Specify how entities relate to each other');
    }

    if (analysis.missingContext.includes('Workflow triggers undefined')) {
      suggestions.push('Define when workflows should be triggered');
    }

    if (analysis.contradictions.length > 0) {
      suggestions.push('Resolve conflicting requirements');
    }

    return suggestions;
  }
}

export const promptEnhancer = new PromptEnhancer();

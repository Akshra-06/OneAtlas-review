/**
 * Advanced Prompt Analyzer
 * 
 * Handles complex, ambiguous, and mixed-domain prompts with deep semantic understanding.
 * Infers missing context, resolves ambiguity, and prioritizes operational intent.
 */

export interface PromptAnalysis {
  clarity: 'high' | 'medium' | 'low';
  domainComplexity: 'single' | 'mixed' | 'enterprise';
  workflowCount: number;
  primaryIntent: string;
  secondaryIntents: string[];
  missingContext: string[];
  contradictions: string[];
  inferredEntities: string[];
  confidence: number;
}

export class PromptAnalyzer {
  /**
   * Assess prompt clarity based on specificity and completeness
   */
  private assessClarity(prompt: string): 'high' | 'medium' | 'low' {
    const indicators = {
      specific: /\b(specific|exact|precise|detailed|particular)\b/i.test(prompt),
      vague: /\b(something|anything|stuff|things|some kind of)\b/i.test(prompt),
      incomplete: /\b(and|also|plus|with|including)\s*$/i.test(prompt),
      hasEntities: /\b(user|customer|patient|order|product|task|project|employee)\b/i.test(prompt),
      hasActions: /\b(create|manage|track|monitor|process|handle|schedule)\b/i.test(prompt),
    };

    if (indicators.vague || indicators.incomplete) return 'low';
    if (indicators.specific && indicators.hasEntities && indicators.hasActions) return 'high';
    return 'medium';
  }

  /**
   * Assess domain complexity (single vs mixed vs enterprise)
   */
  private assessDomainComplexity(prompt: string): 'single' | 'mixed' | 'enterprise' {
    const domains = [
      'healthcare', 'medical', 'hospital', 'clinic', 'patient', 'doctor',
      'ecommerce', 'shop', 'store', 'product', 'inventory', 'order',
      'crm', 'sales', 'lead', 'customer', 'deal',
      'fintech', 'finance', 'banking', 'payment', 'transaction',
      'hr', 'payroll', 'employee', 'recruitment', 'onboarding',
      'logistics', 'shipping', 'warehouse', 'supply chain',
      'education', 'school', 'student', 'course', 'learning',
      'analytics', 'dashboard', 'report', 'metrics', 'kpi',
    ];

    const foundDomains = domains.filter(domain => 
      new RegExp(`\\b${domain}\\b`, 'i').test(prompt)
    );

    if (foundDomains.length === 0) return 'single';
    if (foundDomains.length >= 3) return 'enterprise';
    if (foundDomains.length === 2) return 'mixed';
    return 'single';
  }

  /**
   * Count number of distinct workflows mentioned
   */
  private countWorkflows(prompt: string): number {
    const workflowPatterns = [
      /\b(approval|approve|review)\b/i,
      /\b(notification|notify|alert)\b/i,
      /\b(escalation|escalate)\b/i,
      /\b(scheduling|schedule|calendar)\b/i,
      /\b(onboarding|onboard)\b/i,
      /\b(reporting|report)\b/i,
      /\b(audit|logging)\b/i,
      /\b(integration|connect|sync)\b/i,
    ];

    return workflowPatterns.filter(pattern => pattern.test(prompt)).length;
  }

  /**
   * Extract primary operational intent from prompt
   */
  private extractPrimaryIntent(prompt: string): string {
    const intentPatterns = [
      { pattern: /\b(management|manage|admin|administer)\b/i, intent: 'Management System' },
      { pattern: /\b(tracking|track|monitor|dashboard)\b/i, intent: 'Tracking & Monitoring' },
      { pattern: /\b(automation|automate|workflow)\b/i, intent: 'Process Automation' },
      { pattern: /\b(analytics|analyze|reporting|insights)\b/i, intent: 'Analytics & Reporting' },
      { pattern: /\b(collaboration|collaborate|team)\b/i, intent: 'Team Collaboration' },
      { pattern: /\b(booking|reservation|scheduling)\b/i, intent: 'Booking & Scheduling' },
      { pattern: /\b(support|helpdesk|ticket)\b/i, intent: 'Support System' },
    ];

    for (const { pattern, intent } of intentPatterns) {
      if (pattern.test(prompt)) return intent;
    }

    return 'General Application';
  }

  /**
   * Extract secondary intents from prompt
   */
  private extractSecondaryIntents(prompt: string): string[] {
    const secondaryPatterns = [
      { pattern: /\b(authentication|auth|login|signup)\b/i, intent: 'Authentication' },
      { pattern: /\b(notification|notify|email|alert)\b/i, intent: 'Notifications' },
      { pattern: /\b(reporting|report|export)\b/i, intent: 'Reporting' },
      { pattern: /\b(integration|api|connect)\b/i, intent: 'Integrations' },
      { pattern: /\b(audit|logging|history)\b/i, intent: 'Audit Trail' },
      { pattern: /\b(permission|role|access)\b/i, intent: 'Access Control' },
    ];

    return secondaryPatterns
      .filter(({ pattern }) => pattern.test(prompt))
      .map(({ intent }) => intent);
  }

  /**
   * Detect missing context that needs to be inferred
   */
  private detectMissingContext(prompt: string): string[] {
    const missing: string[] = [];

    // Check for entity mentions without relationships
    if (/\b(user|customer|patient)\b/i.test(prompt) && 
        !/\b(order|appointment|task|ticket)\b/i.test(prompt)) {
      missing.push('Entity relationships undefined');
    }

    // Check for workflow mentions without triggers
    if (/\b(approval|review|escalation)\b/i.test(prompt) && 
        !/\b(when|on|trigger|after)\b/i.test(prompt)) {
      missing.push('Workflow triggers undefined');
    }

    // Check for data mentions without structure
    if (/\b(data|information|details)\b/i.test(prompt) && 
        !/\b(field|attribute|column|property)\b/i.test(prompt)) {
      missing.push('Data structure undefined');
    }

    // Check for user mentions without roles
    if (/\b(user|admin|manager)\b/i.test(prompt) && 
        !/\b(role|permission|access)\b/i.test(prompt)) {
      missing.push('User roles undefined');
    }

    return missing;
  }

  /**
   * Detect contradictory requirements
   */
  private detectContradictions(prompt: string): string[] {
    const contradictions: string[] = [];

    // Simple vs complex
    if (/\b(simple|basic|minimal)\b/i.test(prompt) && 
        /\b(complex|advanced|comprehensive|enterprise)\b/i.test(prompt)) {
      contradictions.push('Conflicting complexity requirements');
    }

    // Public vs private
    if (/\b(public|open|external)\b/i.test(prompt) && 
        /\b(private|internal|restricted)\b/i.test(prompt)) {
      contradictions.push('Conflicting access requirements');
    }

    // Real-time vs batch
    if (/\b(real-time|live|instant)\b/i.test(prompt) && 
        /\b(batch|scheduled|periodic)\b/i.test(prompt)) {
      contradictions.push('Conflicting timing requirements');
    }

    return contradictions;
  }

  /**
   * Infer entities from prompt context
   */
  private inferEntities(prompt: string): string[] {
    const inferred: string[] = [];

    const entityMappings = [
      { keywords: ['patient', 'doctor', 'appointment', 'medical'], entity: 'Healthcare Management' },
      { keywords: ['customer', 'order', 'product', 'inventory'], entity: 'E-commerce' },
      { keywords: ['employee', 'payroll', 'leave', 'attendance'], entity: 'HR Management' },
      { keywords: ['lead', 'deal', 'opportunity', 'pipeline'], entity: 'CRM' },
      { keywords: ['student', 'course', 'enrollment', 'grade'], entity: 'Education' },
      { keywords: ['ticket', 'issue', 'support', 'helpdesk'], entity: 'Support System' },
      { keywords: ['shipment', 'delivery', 'warehouse', 'logistics'], entity: 'Logistics' },
    ];

    for (const { keywords, entity } of entityMappings) {
      if (keywords.some(keyword => new RegExp(`\\b${keyword}\\b`, 'i').test(prompt))) {
        inferred.push(entity);
      }
    }

    return [...new Set(inferred)];
  }

  /**
   * Calculate overall confidence in analysis
   */
  private calculateConfidence(prompt: string): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence for specific prompts
    if (this.assessClarity(prompt) === 'high') confidence += 0.2;
    if (this.assessClarity(prompt) === 'medium') confidence += 0.1;

    // Decrease confidence for contradictions
    if (this.detectContradictions(prompt).length > 0) confidence -= 0.15;

    // Decrease confidence for missing context
    if (this.detectMissingContext(prompt).length > 0) confidence -= 0.1;

    // Increase confidence for domain-specific language
    if (this.assessDomainComplexity(prompt) !== 'single') confidence += 0.15;

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Analyze prompt complexity and characteristics
   */
  analyze(prompt: string): PromptAnalysis {
    const analysis: PromptAnalysis = {
      clarity: this.assessClarity(prompt),
      domainComplexity: this.assessDomainComplexity(prompt),
      workflowCount: this.countWorkflows(prompt),
      primaryIntent: this.extractPrimaryIntent(prompt),
      secondaryIntents: this.extractSecondaryIntents(prompt),
      missingContext: this.detectMissingContext(prompt),
      contradictions: this.detectContradictions(prompt),
      inferredEntities: this.inferEntities(prompt),
      confidence: this.calculateConfidence(prompt),
    };

    return analysis;
  }

  /**
   * Generate enhancement suggestions based on analysis
   */
  generateSuggestions(analysis: PromptAnalysis): string[] {
    const suggestions: string[] = [];

    if (analysis.clarity === 'low') {
      suggestions.push('Prompt is vague - consider specifying exact entities and workflows');
    }

    if (analysis.missingContext.length > 0) {
      suggestions.push(`Missing context: ${analysis.missingContext.join(', ')}`);
    }

    if (analysis.contradictions.length > 0) {
      suggestions.push(`Contradictions detected: ${analysis.contradictions.join(', ')}`);
    }

    if (analysis.domainComplexity === 'enterprise') {
      suggestions.push('Enterprise-scale prompt - ensure all domains are clearly defined');
    }

    if (analysis.workflowCount === 0) {
      suggestions.push('No workflows detected - consider adding operational processes');
    }

    return suggestions;
  }
}

export const promptAnalyzer = new PromptAnalyzer();

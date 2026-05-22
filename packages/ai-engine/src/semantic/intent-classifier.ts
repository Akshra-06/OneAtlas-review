/**
 * Intent Classification System
 * Classifies user intent from natural language prompts
 */

import { gateway } from '../gateway/gateway';

export type IntentType = 
  | 'create-entity'
  | 'modify-entity'
  | 'create-relationship'
  | 'add-field'
  | 'modify-field'
  | 'add-validation'
  | 'create-page'
  | 'create-api'
  | 'generate-crud'
  | 'unknown';

export interface IntentClassification {
  intent: IntentType;
  confidence: number;
  entities: string[];
  fields: string[];
  actions: string[];
  context: string;
  suggestions: string[];
}

class IntentClassifier {
  private classificationPrompt = `You are an expert intent classifier for software development tasks. Your task is to classify the user's intent from their natural language prompt.

## Intent Types:
- create-entity: User wants to create a new entity/table
- modify-entity: User wants to modify an existing entity
- create-relationship: User wants to create relationships between entities
- add-field: User wants to add fields to an entity
- modify-field: User wants to modify existing fields
- add-validation: User wants to add validation rules
- create-page: User wants to create UI pages
- create-api: User wants to create API endpoints
- generate-crud: User wants to generate CRUD operations
- unknown: Intent cannot be determined

## Output Format:
Provide your classification in the following JSON format:
{
  "intent": "intent-type",
  "confidence": 0.0-1.0,
  "entities": ["entity names mentioned"],
  "fields": ["field names mentioned"],
  "actions": ["specific actions requested"],
  "context": "brief context of the request",
  "suggestions": ["suggested next steps"]
}

Return ONLY the JSON, no additional text.`;

  /**
   * Classify intent from user prompt
   */
  async classifyIntent(prompt: string, context?: string): Promise<IntentClassification> {
    try {
      const enhancedPrompt = this.buildClassificationPrompt(prompt, context);

      const response = await gateway.complete({
        messages: [
          { role: 'system', content: this.classificationPrompt },
          { role: 'user', content: enhancedPrompt },
        ],
        tier: 'smart',
        temperature: 0.2,
        maxTokens: 1000,
        jsonMode: true,
      });

      const classification = this.parseClassificationResponse(response.text);
      return classification;
    } catch (error) {
      console.error('[IntentClassifier] Classification failed:', error);
      // Fallback to rule-based classification
      return this.ruleBasedClassification(prompt);
    }
  }

  /**
   * Build classification prompt with context
   */
  private buildClassificationPrompt(prompt: string, context?: string): string {
    let enhancedPrompt = `Classify the intent of the following prompt:\n\n"${prompt}"\n\n`;

    if (context) {
      enhancedPrompt += `Context: ${context}\n\n`;
    }

    enhancedPrompt += `Provide the classification in the specified JSON format.`;

    return enhancedPrompt;
  }

  /**
   * Parse AI classification response
   */
  private parseClassificationResponse(text: string): IntentClassification {
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned) as IntentClassification;

      // Validate and structure the response
      return {
        intent: parsed.intent || 'unknown',
        confidence: this.validateScore(parsed.confidence),
        entities: parsed.entities || [],
        fields: parsed.fields || [],
        actions: parsed.actions || [],
        context: parsed.context || '',
        suggestions: parsed.suggestions || [],
      };
    } catch (error) {
      console.error('[IntentClassifier] Failed to parse response:', error);
      return this.getDefaultClassification();
    }
  }

  /**
   * Validate score is within range
   */
  private validateScore(score: number): number {
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Rule-based classification fallback
   */
  private ruleBasedClassification(prompt: string): IntentClassification {
    const lowerPrompt = prompt.toLowerCase();
    const classification: IntentClassification = {
      intent: 'unknown',
      confidence: 0.5,
      entities: [],
      fields: [],
      actions: [],
      context: '',
      suggestions: [],
    };

    // Extract entities
    const entityMatches = prompt.match(/\b[A-Z][a-zA-Z]+\b/g);
    if (entityMatches) {
      classification.entities = [...new Set(entityMatches)];
    }

    // Classify intent based on keywords
    if (lowerPrompt.includes('create') && (lowerPrompt.includes('entity') || lowerPrompt.includes('table') || lowerPrompt.includes('model'))) {
      classification.intent = 'create-entity';
      classification.confidence = 0.7;
      classification.actions.push('create entity');
    } else if (lowerPrompt.includes('modify') || lowerPrompt.includes('update') || lowerPrompt.includes('change')) {
      classification.intent = 'modify-entity';
      classification.confidence = 0.7;
      classification.actions.push('modify entity');
    } else if (lowerPrompt.includes('relationship') || lowerPrompt.includes('relate') || lowerPrompt.includes('connect')) {
      classification.intent = 'create-relationship';
      classification.confidence = 0.7;
      classification.actions.push('create relationship');
    } else if (lowerPrompt.includes('add field') || lowerPrompt.includes('new field') || lowerPrompt.includes('column')) {
      classification.intent = 'add-field';
      classification.confidence = 0.7;
      classification.actions.push('add field');
    } else if (lowerPrompt.includes('validation') || lowerPrompt.includes('validate') || lowerPrompt.includes('check')) {
      classification.intent = 'add-validation';
      classification.confidence = 0.7;
      classification.actions.push('add validation');
    } else if (lowerPrompt.includes('page') || lowerPrompt.includes('ui') || lowerPrompt.includes('interface')) {
      classification.intent = 'create-page';
      classification.confidence = 0.7;
      classification.actions.push('create page');
    } else if (lowerPrompt.includes('api') || lowerPrompt.includes('endpoint') || lowerPrompt.includes('route')) {
      classification.intent = 'create-api';
      classification.confidence = 0.7;
      classification.actions.push('create api');
    } else if (lowerPrompt.includes('crud') || lowerPrompt.includes('create read update delete')) {
      classification.intent = 'generate-crud';
      classification.confidence = 0.7;
      classification.actions.push('generate crud');
    }

    // Extract fields
    const fieldMatches = prompt.match(/\b[a-z][a-zA-Z]+\b/g);
    if (fieldMatches) {
      classification.fields = [...new Set(fieldMatches)];
    }

    return classification;
  }

  /**
   * Get default classification
   */
  private getDefaultClassification(): IntentClassification {
    return {
      intent: 'unknown',
      confidence: 0.3,
      entities: [],
      fields: [],
      actions: [],
      context: '',
      suggestions: ['Please provide more specific requirements'],
    };
  }

  /**
   * Batch classify multiple prompts
   */
  async batchClassify(prompts: string[]): Promise<Map<string, IntentClassification>> {
    const results = new Map<string, IntentClassification>();

    for (const prompt of prompts) {
      const classification = await this.classifyIntent(prompt);
      results.set(prompt, classification);
    }

    return results;
  }

  /**
   * Get intent statistics
   */
  getIntentStatistics(classifications: IntentClassification[]): {
    totalClassifications: number;
    intentDistribution: Record<IntentType, number>;
    averageConfidence: number;
    mostCommonIntent: IntentType;
  } {
    const total = classifications.length;
    const intentDistribution: Record<IntentType, number> = {} as Record<IntentType, number>;
    let totalConfidence = 0;

    for (const classification of classifications) {
      intentDistribution[classification.intent] = (intentDistribution[classification.intent] || 0) + 1;
      totalConfidence += classification.confidence;
    }

    const mostCommonIntent = Object.entries(intentDistribution)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as IntentType || 'unknown';

    return {
      totalClassifications: total,
      intentDistribution,
      averageConfidence: total > 0 ? totalConfidence / total : 0,
      mostCommonIntent,
    };
  }

  /**
   * Suggest actions based on intent
   */
  suggestActions(classification: IntentClassification): string[] {
    const suggestions: string[] = [];

    switch (classification.intent) {
      case 'create-entity':
        suggestions.push('Generate entity schema');
        suggestions.push('Create validation rules');
        suggestions.push('Generate CRUD operations');
        break;
      case 'modify-entity':
        suggestions.push('Review current entity structure');
        suggestions.push('Apply modifications');
        suggestions.push('Update related code');
        break;
      case 'create-relationship':
        suggestions.push('Define relationship type');
        suggestions.push('Update entity schemas');
        suggestions.push('Generate foreign key constraints');
        break;
      case 'add-field':
        suggestions.push('Determine field type');
        suggestions.push('Add validation rules');
        suggestions.push('Update database schema');
        break;
      case 'add-validation':
        suggestions.push('Define validation rules');
        suggestions.push('Add to entity schema');
        suggestions.push('Generate validation code');
        break;
      case 'create-page':
        suggestions.push('Design page layout');
        suggestions.push('Generate UI components');
        suggestions.push('Add form validation');
        break;
      case 'create-api':
        suggestions.push('Define API endpoints');
        suggestions.push('Implement request handlers');
        suggestions.push('Add authentication');
        break;
      case 'generate-crud':
        suggestions.push('Generate Create operation');
        suggestions.push('Generate Read operation');
        suggestions.push('Generate Update operation');
        suggestions.push('Generate Delete operation');
        break;
      default:
        suggestions.push('Clarify requirements');
        suggestions.push('Provide more context');
    }

    return suggestions;
  }
}

export const intentClassifier = new IntentClassifier();

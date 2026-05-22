/**
 * Requirement Extraction from Natural Language
 * Extracts structured requirements from user prompts
 */

import { gateway } from '../gateway/gateway';

export interface ExtractedRequirement {
  id: string;
  type: 'entity' | 'field' | 'relationship' | 'validation' | 'ui' | 'business-rule';
  description: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  entities: string[];
  fields: string[];
  constraints: string[];
}

export interface RequirementAnalysis {
  requirements: ExtractedRequirement[];
  entities: string[];
  fields: Map<string, string[]>;
  relationships: Array<{ from: string; to: string; type: string }>;
  validationRules: string[];
  uiRequirements: string[];
  businessRules: string[];
}

class RequirementAnalyzer {
  private extractionPrompt = `You are an expert requirement analyst specializing in software development. Your task is to extract structured requirements from natural language descriptions.

## Your Task:
Analyze the user's prompt and extract structured requirements in the following JSON format:
{
  "requirements": [
    {
      "type": "entity|field|relationship|validation|ui|business-rule",
      "description": "Clear description of the requirement",
      "priority": "high|medium|low",
      "confidence": 0.0-1.0,
      "entities": ["entity names mentioned"],
      "fields": ["field names mentioned"],
      "constraints": ["specific constraints mentioned"]
    }
  ],
  "entities": ["all entity names mentioned"],
  "relationships": [{"from": "entity1", "to": "entity2", "type": "relationship type"}],
  "validationRules": ["validation requirements"],
  "uiRequirements": ["UI/UX requirements"],
  "businessRules": ["business logic requirements"]
}

## Guidelines:
- Extract all entities mentioned in the prompt
- Identify field requirements with their types and constraints
- Detect relationships between entities
- Extract validation rules and business logic
- Identify UI/UX requirements
- Assign confidence scores based on clarity
- Prioritize requirements based on importance

Return ONLY the JSON, no additional text.`;

  /**
   * Extract requirements from natural language prompt
   */
  async extractRequirements(prompt: string, context?: string): Promise<RequirementAnalysis> {
    try {
      const enhancedPrompt = this.buildExtractionPrompt(prompt, context);

      const response = await gateway.complete({
        messages: [
          { role: 'system', content: this.extractionPrompt },
          { role: 'user', content: enhancedPrompt },
        ],
        tier: 'smart',
        temperature: 0.2,
        maxTokens: 2000,
        jsonMode: true,
      });

      const analysis = this.parseAnalysisResponse(response.text);
      return analysis;
    } catch (error) {
      console.error('[RequirementAnalyzer] Extraction failed:', error);
      // Fallback to basic extraction
      return this.basicExtraction(prompt);
    }
  }

  /**
   * Build extraction prompt with context
   */
  private buildExtractionPrompt(prompt: string, context?: string): string {
    let enhancedPrompt = `Extract requirements from the following prompt:\n\n"${prompt}"\n\n`;

    if (context) {
      enhancedPrompt += `Context: ${context}\n\n`;
    }

    enhancedPrompt += `Provide structured requirements in the specified JSON format.`;

    return enhancedPrompt;
  }

  /**
   * Parse AI analysis response
   */
  private parseAnalysisResponse(text: string): RequirementAnalysis {
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned) as RequirementAnalysis;

      // Validate and structure the response
      return {
        requirements: parsed.requirements || [],
        entities: parsed.entities || [],
        fields: new Map(Object.entries(parsed.fields || {})),
        relationships: parsed.relationships || [],
        validationRules: parsed.validationRules || [],
        uiRequirements: parsed.uiRequirements || [],
        businessRules: parsed.businessRules || [],
      };
    } catch (error) {
      console.error('[RequirementAnalyzer] Failed to parse response:', error);
      return this.getEmptyAnalysis();
    }
  }

  /**
   * Basic extraction fallback
   */
  private basicExtraction(prompt: string): RequirementAnalysis {
    const analysis: RequirementAnalysis = {
      requirements: [],
      entities: [],
      fields: new Map(),
      relationships: [],
      validationRules: [],
      uiRequirements: [],
      businessRules: [],
    };

    const lowerPrompt = prompt.toLowerCase();

    // Extract entity names (capitalized words)
    const entityMatches = prompt.match(/\b[A-Z][a-zA-Z]+\b/g);
    if (entityMatches) {
      analysis.entities = [...new Set(entityMatches)];
    }

    // Extract field requirements
    if (lowerPrompt.includes('field') || lowerPrompt.includes('column')) {
      analysis.requirements.push({
        id: `req-${Date.now()}-1`,
        type: 'field',
        description: 'Field requirements detected in prompt',
        priority: 'medium',
        confidence: 0.5,
        entities: analysis.entities,
        fields: [],
        constraints: [],
      });
    }

    // Extract validation requirements
    if (lowerPrompt.includes('validate') || lowerPrompt.includes('check') || lowerPrompt.includes('ensure')) {
      analysis.validationRules.push('Validation requirements detected');
      analysis.requirements.push({
        id: `req-${Date.now()}-2`,
        type: 'validation',
        description: 'Validation requirements detected',
        priority: 'high',
        confidence: 0.6,
        entities: analysis.entities,
        fields: [],
        constraints: [],
      });
    }

    // Extract UI requirements
    if (lowerPrompt.includes('ui') || lowerPrompt.includes('interface') || lowerPrompt.includes('page')) {
      analysis.uiRequirements.push('UI requirements detected');
      analysis.requirements.push({
        id: `req-${Date.now()}-3`,
        type: 'ui',
        description: 'UI requirements detected',
        priority: 'medium',
        confidence: 0.5,
        entities: analysis.entities,
        fields: [],
        constraints: [],
      });
    }

    return analysis;
  }

  /**
   * Get empty analysis structure
   */
  private getEmptyAnalysis(): RequirementAnalysis {
    return {
      requirements: [],
      entities: [],
      fields: new Map(),
      relationships: [],
      validationRules: [],
      uiRequirements: [],
      businessRules: [],
    };
  }

  /**
   * Filter requirements by type
   */
  filterByType(analysis: RequirementAnalysis, type: ExtractedRequirement['type']): ExtractedRequirement[] {
    return analysis.requirements.filter(r => r.type === type);
  }

  /**
   * Filter requirements by priority
   */
  filterByPriority(analysis: RequirementAnalysis, priority: 'high' | 'medium' | 'low'): ExtractedRequirement[] {
    return analysis.requirements.filter(r => r.priority === priority);
  }

  /**
   * Get high-confidence requirements
   */
  getHighConfidenceRequirements(analysis: RequirementAnalysis, threshold: number = 0.7): ExtractedRequirement[] {
    return analysis.requirements.filter(r => r.confidence >= threshold);
  }

  /**
   * Merge multiple requirement analyses
   */
  mergeAnalyses(analyses: RequirementAnalysis[]): RequirementAnalysis {
    const merged: RequirementAnalysis = {
      requirements: [],
      entities: [],
      fields: new Map(),
      relationships: [],
      validationRules: [],
      uiRequirements: [],
      businessRules: [],
    };

    for (const analysis of analyses) {
      merged.requirements.push(...analysis.requirements);
      merged.entities.push(...analysis.entities);
      
      // Merge fields
      for (const [entity, fields] of analysis.fields.entries()) {
        const existing = merged.fields.get(entity) || [];
        merged.fields.set(entity, [...new Set([...existing, ...fields])]);
      }
      
      merged.relationships.push(...analysis.relationships);
      merged.validationRules.push(...analysis.validationRules);
      merged.uiRequirements.push(...analysis.uiRequirements);
      merged.businessRules.push(...analysis.businessRules);
    }

    // Remove duplicates
    merged.entities = [...new Set(merged.entities)];
    merged.validationRules = [...new Set(merged.validationRules)];
    merged.uiRequirements = [...new Set(merged.uiRequirements)];
    merged.businessRules = [...new Set(merged.businessRules)];

    return merged;
  }

  /**
   * Generate requirement summary
   */
  generateSummary(analysis: RequirementAnalysis): string {
    const parts: string[] = [];

    parts.push(`Found ${analysis.entities.length} entities`);
    parts.push(`Extracted ${analysis.requirements.length} requirements`);
    parts.push(`Identified ${analysis.relationships.length} relationships`);
    parts.push(`Found ${analysis.validationRules.length} validation rules`);
    parts.push(`Found ${analysis.uiRequirements.length} UI requirements`);
    parts.push(`Found ${analysis.businessRules.length} business rules`);

    return parts.join(', ');
  }
}

export const requirementAnalyzer = new RequirementAnalyzer();

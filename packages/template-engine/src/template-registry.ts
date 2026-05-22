/**
 * Template Registry System
 * Manages pre-built code templates that can be modified by AI
 */

import type { EntitySchema, GeneratedFile } from '@oneatlas/shared';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'entity' | 'page' | 'api' | 'validation' | 'component';
  domain?: string;
  applicableTo: (entity: EntitySchema) => boolean;
  template: string;
  placeholders: Record<string, string>;
}

export interface TemplateMatch {
  template: Template;
  confidence: number;
  modifications: Record<string, string>;
}

class TemplateRegistry {
  private templates: Map<string, Template> = new Map();

  register(template: Template): void {
    this.templates.set(template.id, template);
  }

  get(id: string): Template | undefined {
    return this.templates.get(id);
  }

  findMatchingTemplates(entity: EntitySchema, domain?: string): TemplateMatch[] {
    const matches: TemplateMatch[] = [];

    for (const template of this.templates.values()) {
      // Filter by category and domain
      if (template.domain && domain && template.domain !== domain) {
        continue;
      }

      // Check if template is applicable
      if (template.applicableTo(entity)) {
        // Calculate confidence based on entity characteristics
        const confidence = this.calculateConfidence(entity, template);
        matches.push({
          template,
          confidence,
          modifications: {},
        });
      }
    }

    // Sort by confidence descending
    return matches.sort((a, b) => b.confidence - a.confidence);
  }

  private calculateConfidence(entity: EntitySchema, template: Template): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence if entity name matches template keywords
    const entityName = entity.name.toLowerCase();
    const templateName = template.name.toLowerCase();
    
    if (entityName.includes(templateName) || templateName.includes(entityName)) {
      confidence += 0.3;
    }

    // Boost confidence if field count matches expected range
    const fieldCount = entity.fields.length;
    if (fieldCount >= 3 && fieldCount <= 10) {
      confidence += 0.1;
    }

    // Boost confidence if domain matches
    if (template.domain) {
      const inferredDomain = this.inferDomain(entity);
      if (inferredDomain === template.domain) {
        confidence += 0.2;
      }
    }

    // Boost confidence if entity has relevant fields for template category
    const relevantFields = this.countRelevantFields(entity, template);
    if (relevantFields > 0) {
      confidence += Math.min(relevantFields * 0.05, 0.15);
    }

    // Boost confidence if template category matches entity characteristics
    if (this.categoryMatchesEntity(entity, template)) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Count fields relevant to the template
   */
  private countRelevantFields(entity: EntitySchema, template: Template): number {
    const relevantKeywords: Record<string, string[]> = {
      validation: ['email', 'phone', 'url', 'password', 'status', 'type'],
      page: ['name', 'title', 'description', 'content', 'body'],
      api: ['create', 'update', 'delete', 'get', 'list'],
      component: ['render', 'display', 'show', 'view'],
    };

    const keywords = relevantKeywords[template.category] || [];
    return entity.fields.filter(field => 
      keywords.some(keyword => field.name.toLowerCase().includes(keyword))
    ).length;
  }

  /**
   * Check if template category matches entity characteristics
   */
  private categoryMatchesEntity(entity: EntitySchema, template: Template): boolean {
    // Validation templates should have fields that need validation
    if (template.category === 'validation') {
      return entity.fields.some(f => f.prismaType === 'String' || f.isRequired);
    }

    // Page templates should have displayable fields
    if (template.category === 'page') {
      return entity.fields.some(f => f.name !== 'id' && f.name !== 'createdAt');
    }

    // API templates should have CRUD-relevant fields
    if (template.category === 'api') {
      return entity.fields.length > 2;
    }

    return true;
  }

  private inferDomain(entity: EntitySchema): string {
    const entityName = entity.name.toLowerCase();
    
    if (entityName.includes('patient') || entityName.includes('doctor') || entityName.includes('medical') || entityName.includes('appointment')) return 'healthcare';
    if (entityName.includes('customer') || entityName.includes('lead') || entityName.includes('opportunity')) return 'crm';
    if (entityName.includes('order') || entityName.includes('product') || entityName.includes('cart')) return 'ecommerce';
    if (entityName.includes('candidate') || entityName.includes('job') || entityName.includes('application')) return 'ats';
    if (entityName.includes('invoice') || entityName.includes('payment') || entityName.includes('expense')) return 'finance';
    
    return 'generic';
  }

  getAll(): Template[] {
    return Array.from(this.templates.values());
  }
}

export const templateRegistry = new TemplateRegistry();

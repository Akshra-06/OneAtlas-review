/**
 * Enhanced Entity Understanding System
 * Deeper comprehension of user requirements and entity relationships
 */

import type { EntitySchema, FieldSchema } from '@oneatlas/shared';

export interface SemanticFieldInfo {
  fieldName: string;
  inferredType: string;
  confidence: number;
  semanticCategory: string;
  domainRelevance: string[];
  suggestedEnumValues?: string[];
}

export interface EntityUnderstanding {
  entityName: string;
  domain: string;
  semanticCategory: string;
  fieldSemantics: Map<string, SemanticFieldInfo>;
  relationships: string[];
  complexity: 'simple' | 'medium' | 'complex';
}

class EntityUnderstandingEngine {
  private semanticTypeMap: Record<string, SemanticFieldInfo> = {};
  private domainKnowledge: Map<string, string[]> = new Map();

  constructor() {
    this.initializeSemanticTypes();
    this.initializeDomainKnowledge();
  }

  /**
   * Initialize semantic type mappings
   */
  private initializeSemanticTypes(): void {
    // Common semantic field types
    this.semanticTypeMap = {
      // Identification fields
      'id': {
        fieldName: 'id',
        inferredType: 'String',
        confidence: 0.95,
        semanticCategory: 'identifier',
        domainRelevance: ['all'],
      },
      'uuid': {
        fieldName: 'uuid',
        inferredType: 'String',
        confidence: 0.95,
        semanticCategory: 'identifier',
        domainRelevance: ['all'],
      },

      // Personal information
      'name': {
        fieldName: 'name',
        inferredType: 'String',
        confidence: 0.9,
        semanticCategory: 'personal',
        domainRelevance: ['healthcare', 'crm', 'ecommerce'],
      },
      'firstname': {
        fieldName: 'firstName',
        inferredType: 'String',
        confidence: 0.9,
        semanticCategory: 'personal',
        domainRelevance: ['healthcare', 'crm'],
      },
      'lastname': {
        fieldName: 'lastName',
        inferredType: 'String',
        confidence: 0.9,
        semanticCategory: 'personal',
        domainRelevance: ['healthcare', 'crm'],
      },
      'fullname': {
        fieldName: 'fullName',
        inferredType: 'String',
        confidence: 0.9,
        semanticCategory: 'personal',
        domainRelevance: ['healthcare', 'crm'],
      },

      // Contact information
      'email': {
        fieldName: 'email',
        inferredType: 'String',
        confidence: 0.95,
        semanticCategory: 'contact',
        domainRelevance: ['all'],
      },
      'phone': {
        fieldName: 'phone',
        inferredType: 'String',
        confidence: 0.9,
        semanticCategory: 'contact',
        domainRelevance: ['healthcare', 'crm'],
      },
      'address': {
        fieldName: 'address',
        inferredType: 'String',
        confidence: 0.85,
        semanticCategory: 'contact',
        domainRelevance: ['healthcare', 'crm', 'ecommerce'],
      },

      // Temporal fields
      'dateofbirth': {
        fieldName: 'dateOfBirth',
        inferredType: 'DateTime',
        confidence: 0.95,
        semanticCategory: 'temporal',
        domainRelevance: ['healthcare', 'crm'],
      },
      'birthdate': {
        fieldName: 'birthDate',
        inferredType: 'DateTime',
        confidence: 0.95,
        semanticCategory: 'temporal',
        domainRelevance: ['healthcare', 'crm'],
      },
      'createdat': {
        fieldName: 'createdAt',
        inferredType: 'DateTime',
        confidence: 0.95,
        semanticCategory: 'temporal',
        domainRelevance: ['all'],
      },
      'updatedat': {
        fieldName: 'updatedAt',
        inferredType: 'DateTime',
        confidence: 0.95,
        semanticCategory: 'temporal',
        domainRelevance: ['all'],
      },

      // Status fields
      'status': {
        fieldName: 'status',
        inferredType: 'String',
        confidence: 0.8,
        semanticCategory: 'status',
        domainRelevance: ['all'],
        suggestedEnumValues: ['Active', 'Inactive', 'Pending', 'Completed'],
      },

      // Healthcare specific
      'bloodtype': {
        fieldName: 'bloodType',
        inferredType: 'String',
        confidence: 0.95,
        semanticCategory: 'medical',
        domainRelevance: ['healthcare'],
        suggestedEnumValues: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      },
      'allergies': {
        fieldName: 'allergies',
        inferredType: 'String[]',
        confidence: 0.9,
        semanticCategory: 'medical',
        domainRelevance: ['healthcare'],
      },

      // CRM specific
      'leadsource': {
        fieldName: 'leadSource',
        inferredType: 'String',
        confidence: 0.85,
        semanticCategory: 'business',
        domainRelevance: ['crm'],
        suggestedEnumValues: ['Website', 'Referral', 'Social Media', 'Email', 'Phone'],
      },
      'tier': {
        fieldName: 'tier',
        inferredType: 'String',
        confidence: 0.8,
        semanticCategory: 'business',
        domainRelevance: ['crm', 'ecommerce'],
        suggestedEnumValues: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      },

      // E-commerce specific
      'price': {
        fieldName: 'price',
        inferredType: 'Decimal',
        confidence: 0.95,
        semanticCategory: 'financial',
        domainRelevance: ['ecommerce', 'finance'],
      },
      'quantity': {
        fieldName: 'quantity',
        inferredType: 'Int',
        confidence: 0.9,
        semanticCategory: 'inventory',
        domainRelevance: ['ecommerce'],
      },
      'sku': {
        fieldName: 'sku',
        inferredType: 'String',
        confidence: 0.9,
        semanticCategory: 'inventory',
        domainRelevance: ['ecommerce'],
      },
    };
  }

  /**
   * Initialize domain knowledge
   */
  private initializeDomainKnowledge(): void {
    this.domainKnowledge.set('healthcare', [
      'patient', 'doctor', 'appointment', 'medical', 'diagnosis', 'treatment', 'prescription', 'hospital', 'clinic',
    ]);
    this.domainKnowledge.set('crm', [
      'customer', 'lead', 'opportunity', 'deal', 'contact', 'account', 'pipeline', 'conversion', 'sales',
    ]);
    this.domainKnowledge.set('ecommerce', [
      'product', 'order', 'cart', 'inventory', 'shipping', 'payment', 'invoice', 'catalog', 'storefront',
    ]);
    this.domainKnowledge.set('finance', [
      'invoice', 'payment', 'transaction', 'account', 'ledger', 'expense', 'revenue', 'budget', 'audit',
    ]);
    this.domainKnowledge.set('project_management', [
      'task', 'project', 'milestone', 'timeline', 'resource', 'workflow', 'assignee', 'deadline', 'kanban',
    ]);
  }

  /**
   * Infer semantic field type
   */
  inferSemanticType(fieldName: string, domain?: string): SemanticFieldInfo {
    const normalizedName = fieldName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Direct match
    if (this.semanticTypeMap[normalizedName]) {
      return { ...this.semanticTypeMap[normalizedName] };
    }

    // Partial match
    for (const [key, value] of Object.entries(this.semanticTypeMap)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return { ...value, confidence: value.confidence * 0.8 };
      }
    }

    // Domain-specific inference
    if (domain) {
      const domainSpecific = this.inferFromDomain(fieldName, domain);
      if (domainSpecific) {
        return domainSpecific;
      }
    }

    // Default inference based on field name patterns
    return this.inferFromPattern(fieldName);
  }

  /**
   * Infer from domain knowledge
   */
  private inferFromDomain(fieldName: string, domain: string): SemanticFieldInfo | null {
    const domainKeywords = this.domainKnowledge.get(domain) || [];
    const lowerFieldName = fieldName.toLowerCase();

    for (const keyword of domainKeywords) {
      if (lowerFieldName.includes(keyword)) {
        return {
          fieldName,
          inferredType: 'String',
          confidence: 0.7,
          semanticCategory: 'domain-specific',
          domainRelevance: [domain],
        };
      }
    }

    return null;
  }

  /**
   * Infer from field name patterns
   */
  private inferFromPattern(fieldName: string): SemanticFieldInfo {
    const lowerFieldName = fieldName.toLowerCase();

    // ID patterns
    if (lowerFieldName.endsWith('id') || lowerFieldName.endsWith('_id')) {
      return {
        fieldName,
        inferredType: 'String',
        confidence: 0.7,
        semanticCategory: 'identifier',
        domainRelevance: ['all'],
      };
    }

    // Boolean patterns
    if (lowerFieldName.startsWith('is') || lowerFieldName.startsWith('has') || lowerFieldName.startsWith('can')) {
      return {
        fieldName,
        inferredType: 'Boolean',
        confidence: 0.75,
        semanticCategory: 'boolean',
        domainRelevance: ['all'],
      };
    }

    // Date/time patterns
    if (lowerFieldName.includes('date') || lowerFieldName.includes('time') || lowerFieldName.includes('at')) {
      return {
        fieldName,
        inferredType: 'DateTime',
        confidence: 0.7,
        semanticCategory: 'temporal',
        domainRelevance: ['all'],
      };
    }

    // Number patterns
    if (lowerFieldName.includes('count') || lowerFieldName.includes('amount') || lowerFieldName.includes('quantity')) {
      return {
        fieldName,
        inferredType: 'Int',
        confidence: 0.7,
        semanticCategory: 'quantitative',
        domainRelevance: ['all'],
      };
    }

    // Default to String
    return {
      fieldName,
      inferredType: 'String',
      confidence: 0.5,
      semanticCategory: 'generic',
      domainRelevance: ['all'],
    };
  }

  /**
   * Analyze entity semantics
   */
  analyzeEntity(entity: EntitySchema): EntityUnderstanding {
    const domain = this.inferDomain(entity.name);
    const fieldSemantics = new Map<string, SemanticFieldInfo>();

    // Analyze each field
    entity.fields.forEach(field => {
      const semanticInfo = this.inferSemanticType(field.name, domain);
      fieldSemantics.set(field.name, semanticInfo);
    });

    // Determine complexity
    const complexity = this.determineComplexity(entity);

    // Extract relationships
    const relationships = entity.relations?.map(rel => rel.toEntity) || [];

    return {
      entityName: entity.name,
      domain,
      semanticCategory: this.categorizeEntity(entity.name, domain),
      fieldSemantics,
      relationships,
      complexity,
    };
  }

  /**
   * Infer domain from entity name
   */
  private inferDomain(entityName: string): string {
    const lowerName = entityName.toLowerCase();

    for (const [domain, keywords] of this.domainKnowledge.entries()) {
      for (const keyword of keywords) {
        if (lowerName.includes(keyword)) {
          return domain;
        }
      }
    }

    return 'generic';
  }

  /**
   * Categorize entity
   */
  private categorizeEntity(entityName: string, domain: string): string {
    const lowerName = entityName.toLowerCase();

    if (domain === 'healthcare') {
      if (lowerName.includes('patient')) return 'person';
      if (lowerName.includes('doctor') || lowerName.includes('nurse')) return 'personnel';
      if (lowerName.includes('appointment')) return 'event';
      if (lowerName.includes('prescription')) return 'document';
    }

    if (domain === 'crm') {
      if (lowerName.includes('customer') || lowerName.includes('client')) return 'person';
      if (lowerName.includes('lead')) return 'prospect';
      if (lowerName.includes('opportunity') || lowerName.includes('deal')) return 'transaction';
    }

    if (domain === 'ecommerce') {
      if (lowerName.includes('product')) return 'item';
      if (lowerName.includes('order')) return 'transaction';
      if (lowerName.includes('cart')) return 'collection';
    }

    return 'generic';
  }

  /**
   * Determine entity complexity
   */
  private determineComplexity(entity: EntitySchema): 'simple' | 'medium' | 'complex' {
    const fieldCount = entity.fields.length;
    const relationCount = entity.relations?.length || 0;

    if (fieldCount <= 5 && relationCount === 0) return 'simple';
    if (fieldCount <= 15 && relationCount <= 3) return 'medium';
    return 'complex';
  }

  /**
   * Get semantic suggestions for field
   */
  getSemanticSuggestions(fieldName: string, domain?: string): string[] {
    const semanticInfo = this.inferSemanticType(fieldName, domain);
    const suggestions: string[] = [];

    // Type suggestion
    suggestions.push(`Consider using type: ${semanticInfo.inferredType}`);

    // Enum suggestion
    if (semanticInfo.suggestedEnumValues && semanticInfo.suggestedEnumValues.length > 0) {
      suggestions.push(`Suggested enum values: ${semanticInfo.suggestedEnumValues.join(', ')}`);
    }

    // Validation suggestion
    if (semanticInfo.semanticCategory === 'contact') {
      suggestions.push('Add email/phone validation');
    }
    if (semanticInfo.semanticCategory === 'temporal') {
      suggestions.push('Consider adding date range validation');
    }

    return suggestions;
  }

  /**
   * Add custom semantic type
   */
  addSemanticType(fieldName: string, semanticInfo: SemanticFieldInfo): void {
    const normalizedName = fieldName.toLowerCase().replace(/[^a-z0-9]/g, '');
    this.semanticTypeMap[normalizedName] = semanticInfo;
  }

  /**
   * Add domain knowledge
   */
  addDomainKnowledge(domain: string, keywords: string[]): void {
    this.domainKnowledge.set(domain, keywords);
  }
}

export const entityUnderstandingEngine = new EntityUnderstandingEngine();

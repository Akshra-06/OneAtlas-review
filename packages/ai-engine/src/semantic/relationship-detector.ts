/**
 * Relationship Detection and Mapping System
 * Detects and maps relationships between entities
 */

import type { EntitySchema, RelationSchema } from '@oneatlas/shared';

export interface DetectedRelationship {
  fromEntity: string;
  toEntity: string;
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-many';
  confidence: number;
  field: string;
  inverseField?: string;
  semanticContext: string;
}

export interface RelationshipMapping {
  entity: string;
  relationships: DetectedRelationship[];
  relationshipGraph: Map<string, string[]>;
}

class RelationshipDetector {
  private relationshipPatterns: Map<string, string[]> = new Map();
  private semanticRelationships: Map<string, string[]> = new Map();

  constructor() {
    this.initializeRelationshipPatterns();
    this.initializeSemanticRelationships();
  }

  /**
   * Initialize common relationship patterns
   */
  private initializeRelationshipPatterns(): void {
    // Common field suffixes that indicate relationships
    this.relationshipPatterns.set('one-to-many', [
      'id', // foreign key
      'Id', // foreign key
      '_id', // foreign key
      'Id', // foreign key
    ]);

    this.relationshipPatterns.set('many-to-many', [
      'Ids', // multiple foreign keys
      '_ids', // multiple foreign keys
    ]);

    this.relationshipPatterns.set('one-to-one', [
      'profile',
      'settings',
      'config',
    ]);
  }

  /**
   * Initialize semantic relationship patterns
   */
  private initializeSemanticRelationships(): void {
    // Healthcare relationships
    this.semanticRelationships.set('patient', ['doctor', 'appointment', 'prescription', 'medicalrecord']);
    this.semanticRelationships.set('doctor', ['patient', 'appointment', 'specialty']);
    this.semanticRelationships.set('appointment', ['patient', 'doctor', 'treatment']);

    // CRM relationships
    this.semanticRelationships.set('customer', ['order', 'invoice', 'supportticket', 'interaction']);
    this.semanticRelationships.set('lead', ['opportunity', 'campaign', 'activity']);
    this.semanticRelationships.set('opportunity', ['customer', 'product', 'quote']);

    // E-commerce relationships
    this.semanticRelationships.set('product', ['category', 'order', 'review', 'inventory']);
    this.semanticRelationships.set('order', ['customer', 'product', 'payment', 'shipping']);
    this.semanticRelationships.set('category', ['product']);

    // Finance relationships
    this.semanticRelationships.set('invoice', ['customer', 'payment', 'lineitem']);
    this.semanticRelationships.set('payment', ['invoice', 'transaction', 'method']);
  }

  /**
   * Detect relationships in entity schema
   */
  detectRelationships(entity: EntitySchema, allEntities: EntitySchema[]): DetectedRelationship[] {
    const relationships: DetectedRelationship[] = [];

    // Detect from existing relations
    if (entity.relations) {
      for (const relation of entity.relations) {
        relationships.push({
          fromEntity: entity.name,
          toEntity: relation.toEntity,
          relationshipType: relation.type,
          confidence: 1.0,
          field: relation.fromEntity,
          inverseField: relation.toEntity,
          semanticContext: 'explicitly-defined',
        });
      }
    }

    // Detect from field names
    const detectedFromFields = this.detectFromFields(entity, allEntities);
    relationships.push(...detectedFromFields);

    // Detect from semantic knowledge
    const detectedFromSemantics = this.detectFromSemantics(entity, allEntities);
    relationships.push(...detectedFromSemantics);

    return relationships;
  }

  /**
   * Detect relationships from field names
   */
  private detectFromFields(entity: EntitySchema, allEntities: EntitySchema[]): DetectedRelationship[] {
    const relationships: DetectedRelationship[] = [];

    for (const field of entity.fields) {
      const fieldName = field.name.toLowerCase();

      // Check for foreign key patterns
      for (const entityName of allEntities.map(e => e.name.toLowerCase())) {
        if (entityName && fieldName.includes(entityName) && fieldName.includes('id')) {
          const targetEntity = allEntities.find(e => e.name.toLowerCase() === entityName);
          if (targetEntity) {
            relationships.push({
              fromEntity: entity.name,
              toEntity: targetEntity.name,
              relationshipType: 'one-to-many',
              confidence: 0.7,
              field: field.name,
              semanticContext: 'foreign-key-pattern',
            });
          }
        }
      }
    }

    return relationships;
  }

  /**
   * Detect relationships from semantic knowledge
   */
  private detectFromSemantics(entity: EntitySchema, allEntities: EntitySchema[]): DetectedRelationship[] {
    const relationships: DetectedRelationship[] = [];
    const entityNameLower = entity.name.toLowerCase();

    // Check if this entity has known semantic relationships
    const knownRelationships = this.semanticRelationships.get(entityNameLower);

    if (knownRelationships) {
      for (const relatedEntityName of knownRelationships) {
        const targetEntity = allEntities.find(e => e.name.toLowerCase() === relatedEntityName);
        if (targetEntity) {
          relationships.push({
            fromEntity: entity.name,
            toEntity: targetEntity.name,
            relationshipType: this.inferRelationshipType(entity, targetEntity),
            confidence: 0.6,
            field: `${targetEntity.name}Id`,
            semanticContext: 'semantic-knowledge',
          });
        }
      }
    }

    return relationships;
  }

  /**
   * Infer relationship type between entities
   */
  private inferRelationshipType(fromEntity: EntitySchema, toEntity: EntitySchema): 'one-to-one' | 'one-to-many' | 'many-to-many' {
    // Simple heuristic: if both have similar fields, likely many-to-many
    const fromFields = fromEntity.fields.map(f => f.name.toLowerCase());
    const toFields = toEntity.fields.map(f => f.name.toLowerCase());

    const commonFields = fromFields.filter(f => toFields.includes(f));
    if (commonFields.length > 2) {
      return 'many-to-many';
    }

    // Default to one-to-many
    return 'one-to-many';
  }

  /**
   * Create relationship mapping for all entities
   */
  createRelationshipMapping(entities: EntitySchema[]): Map<string, RelationshipMapping> {
    const mapping = new Map<string, RelationshipMapping>();

    for (const entity of entities) {
      const relationships = this.detectRelationships(entity, entities);
      const relationshipGraph = this.buildRelationshipGraph(entity, entities);

      mapping.set(entity.name, {
        entity: entity.name,
        relationships,
        relationshipGraph,
      });
    }

    return mapping;
  }

  /**
   * Build relationship graph
   */
  private buildRelationshipGraph(entity: EntitySchema, allEntities: EntitySchema[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    const relationships = this.detectRelationships(entity, allEntities);

    for (const rel of relationships) {
      if (!graph.has(rel.toEntity)) {
        graph.set(rel.toEntity, []);
      }
      graph.get(rel.toEntity)!.push(rel.relationshipType);
    }

    return graph;
  }

  /**
   * Suggest relationships for entity
   */
  suggestRelationships(entity: EntitySchema, allEntities: EntitySchema[]): string[] {
    const suggestions: string[] = [];
    const entityNameLower = entity.name.toLowerCase();

    // Check for missing semantic relationships
    const knownRelationships = this.semanticRelationships.get(entityNameLower);

    if (knownRelationships) {
      for (const relatedEntityName of knownRelationships) {
        const targetEntity = allEntities.find(e => e.name.toLowerCase() === relatedEntityName);
        if (targetEntity) {
          const hasRelationship = entity.relations?.some(r => r.toEntity === targetEntity.name);
          if (!hasRelationship) {
            suggestions.push(`Consider adding relationship to ${targetEntity.name}`);
          }
        }
      }
    }

    // Check for missing foreign key fields
    for (const relatedEntity of allEntities) {
      if (relatedEntity.name !== entity.name) {
        const fkFieldName = `${relatedEntity.name}Id`;
        const hasForeignKey = entity.fields.some(f => f.name.toLowerCase() === fkFieldName.toLowerCase());
        if (!hasForeignKey) {
          suggestions.push(`Consider adding ${fkFieldName} field for relationship to ${relatedEntity.name}`);
        }
      }
    }

    return suggestions;
  }

  /**
   * Validate relationship consistency
   */
  validateRelationships(entity: EntitySchema, allEntities: EntitySchema[]): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check for orphaned foreign keys
    for (const field of entity.fields) {
      if (field.name.toLowerCase().includes('id') && !field.name.toLowerCase().endsWith('id')) {
        const potentialTarget = field.name.replace(/Id$/i, '');
        const targetExists = allEntities.some(e => e.name.toLowerCase() === potentialTarget.toLowerCase());
        if (!targetExists) {
          issues.push(`Foreign key ${field.name} references non-existent entity ${potentialTarget}`);
        }
      }
    }

    // Check for missing inverse relationships
    for (const relation of entity.relations || []) {
      const targetEntity = allEntities.find(e => e.name === relation.toEntity);
      if (targetEntity) {
        const hasInverse = targetEntity.relations?.some(r => r.toEntity === entity.name);
        if (!hasInverse && relation.type === 'one-to-many') {
          issues.push(`Missing inverse relationship in ${relation.toEntity} for ${relation.type} from ${entity.name}`);
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  /**
   * Add custom relationship pattern
   */
  addRelationshipPattern(type: 'one-to-one' | 'one-to-many' | 'many-to-many', patterns: string[]): void {
    const existing = this.relationshipPatterns.get(type) || [];
    this.relationshipPatterns.set(type, [...existing, ...patterns]);
  }

  /**
   * Add semantic relationship
   */
  addSemanticRelationship(entity: string, relatedEntities: string[]): void {
    this.semanticRelationships.set(entity.toLowerCase(), relatedEntities.map(e => e.toLowerCase()));
  }
}

export const relationshipDetector = new RelationshipDetector();

/**
 * Entity Intelligence Hardening System
 * 
 * Validates, repairs, and hardens entity schemas to ensure:
 * - No duplicate entities
 * - No circular relationships
 * - Relation integrity
 * - Proper foreign keys
 * - Normalized naming
 * - Valid schema patterns
 * - Operational entity inference
 */

import type { EntityNode, EntityRelation } from '@oneatlas/shared';

export interface EntityValidationResult {
  isValid: boolean;
  duplicates: string[];
  circularRelations: string[];
  missingForeignKeys: string[];
  namingIssues: string[];
  invalidPatterns: string[];
  inferredEntities: EntityNode[];
  score: number; // 0-1, higher is better
}

export interface EntityRepairSuggestion {
  type: 'duplicate' | 'circular' | 'missing_fk' | 'naming' | 'pattern' | 'inference';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  suggestion: string;
  affectedEntities: string[];
}

export class EntityIntelligence {
  /**
   * Detect duplicate entities (similar names or purposes)
   */
  private detectDuplicates(entities: EntityNode[]): string[] {
    const duplicates: string[] = [];
    const normalizedNames = new Map<string, string[]>();

    // Normalize entity names for comparison
    for (const entity of entities) {
      const normalized = entity.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!normalizedNames.has(normalized)) {
        normalizedNames.set(normalized, []);
      }
      normalizedNames.get(normalized)!.push(entity.name);
    }

    // Find duplicates
    for (const [normalized, names] of normalizedNames) {
      if (names.length > 1) {
        duplicates.push(`Duplicate entities detected: ${names.join(', ')}`);
      }
    }

    // Check for semantically similar entities
    const semanticGroups = this.groupBySemantics(entities);
    for (const [semantic, names] of semanticGroups) {
      if (names.length > 1) {
        duplicates.push(`Semantically similar entities: ${names.join(', ')} (${semantic})`);
      }
    }

    return duplicates;
  }

  /**
   * Group entities by semantic similarity
   */
  private groupBySemantics(entities: EntityNode[]): Map<string, string[]> {
    const groups = new Map<string, string[]>();

    const semanticMappings: Record<string, string[]> = {
      'user': ['user', 'customer', 'client', 'account', 'profile'],
      'order': ['order', 'purchase', 'transaction', 'sale'],
      'product': ['product', 'item', 'good', 'inventory'],
      'employee': ['employee', 'staff', 'worker', 'personnel'],
      'patient': ['patient', 'client', 'member'],
    };

    for (const entity of entities) {
      const name = entity.name.toLowerCase();
      let matchedSemantic: string | null = null;

      for (const [semantic, keywords] of Object.entries(semanticMappings)) {
        if (keywords.some(keyword => name.includes(keyword))) {
          matchedSemantic = semantic;
          break;
        }
      }

      if (matchedSemantic) {
        if (!groups.has(matchedSemantic)) {
          groups.set(matchedSemantic, []);
        }
        groups.get(matchedSemantic)!.push(entity.name);
      }
    }

    return groups;
  }

  /**
   * Detect circular relationships in entity graph
   */
  private detectCircularRelations(entities: EntityNode[]): string[] {
    const circular: string[] = [];
    const graph = new Map<string, string[]>();

    // Build adjacency list
    for (const entity of entities) {
      graph.set(entity.name, []);
      for (const relation of entity.relations || []) {
        graph.get(entity.name)!.push(relation.targetEntity);
      }
    }

    // Detect cycles using DFS
    for (const entity of entities) {
      const visited = new Set<string>();
      const path = new Set<string>();
      
      if (this.hasCycle(graph, entity.name, visited, path)) {
        circular.push(`Circular relation detected involving: ${entity.name}`);
      }
    }

    return circular;
  }

  /**
   * DFS cycle detection
   */
  private hasCycle(
    graph: Map<string, string[]>,
    node: string,
    visited: Set<string>,
    path: Set<string>
  ): boolean {
    if (path.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    path.add(node);

    const neighbors = graph.get(node) || [];
    for (const neighbor of neighbors) {
      if (this.hasCycle(graph, neighbor, visited, path)) {
        return true;
      }
    }

    path.delete(node);
    return false;
  }

  /**
   * Detect missing foreign keys in relations
   */
  private detectMissingForeignKeys(entities: EntityNode[]): string[] {
    const missing: string[] = [];
    const entityNames = new Set(entities.map(e => e.name));

    for (const entity of entities) {
      for (const relation of entity.relations || []) {
        // Check if target entity exists
        if (!entityNames.has(relation.targetEntity)) {
          missing.push(`Missing target entity: ${relation.targetEntity} referenced by ${entity.name}`);
        }

        // Check if foreign key attribute exists
        const hasForeignKey = entity.attributes.some(attr => 
          attr.name.toLowerCase().includes(relation.targetEntity.toLowerCase()) ||
          attr.name.toLowerCase().includes('foreign') ||
          attr.semanticType === 'relation'
        );

        if (!hasForeignKey && relation.type !== 'many-to-many') {
          missing.push(`Missing foreign key for relation ${entity.name} -> ${relation.targetEntity}`);
        }
      }
    }

    return missing;
  }

  /**
   * Detect naming convention issues
   */
  private detectNamingIssues(entities: EntityNode[]): string[] {
    const issues: string[] = [];

    for (const entity of entities) {
      // Check PascalCase
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(entity.name)) {
        issues.push(`Entity name not PascalCase: ${entity.name}`);
      }

      // Check attribute naming
      for (const attr of entity.attributes) {
        if (!/^[a-z][a-zA-Z0-9]*$/.test(attr.name)) {
          issues.push(`Attribute name not camelCase: ${entity.name}.${attr.name}`);
        }
      }

      // Check for reserved words
      const reservedWords = ['user', 'order', 'group', 'table', 'index', 'key', 'value'];
      if (reservedWords.includes(entity.name.toLowerCase())) {
        issues.push(`Entity uses reserved word: ${entity.name}`);
      }
    }

    return issues;
  }

  /**
   * Detect invalid schema patterns
   */
  private detectInvalidPatterns(entities: EntityNode[]): string[] {
    const invalid: string[] = [];

    for (const entity of entities) {
      // Entity with no attributes
      if (entity.attributes.length === 0) {
        invalid.push(`Entity has no attributes: ${entity.name}`);
      }

      // Entity with only system fields
      const systemFields = ['id', 'createdAt', 'updatedAt', 'tenantId'];
      const hasOnlySystemFields = entity.attributes.every(attr => 
        systemFields.includes(attr.name)
      );
      if (hasOnlySystemFields && entity.attributes.length > 0) {
        invalid.push(`Entity has only system fields: ${entity.name}`);
      }

      // Too many attributes (possible denormalization issue)
      if (entity.attributes.length > 20) {
        invalid.push(`Entity has excessive attributes (${entity.attributes.length}): ${entity.name}`);
      }

      // Missing required fields
      const hasId = entity.attributes.some(attr => attr.name.toLowerCase() === 'id');
      if (!hasId) {
        invalid.push(`Entity missing ID field: ${entity.name}`);
      }
    }

    return invalid;
  }

  /**
   * Infer operational entities that might be missing
   */
  private inferOperationalEntities(entities: EntityNode[]): EntityNode[] {
    const inferred: EntityNode[] = [];
    const existingNames = new Set(entities.map(e => e.name.toLowerCase()));

    // Common operational entities that might be missing
    const operationalPatterns = [
      {
        keywords: ['user', 'customer', 'patient'],
        inferred: { name: 'Activity', attributes: [{ name: 'action', type: 'string', isRequired: true }] }
      },
      {
        keywords: ['order', 'purchase', 'transaction'],
        inferred: { name: 'Payment', attributes: [{ name: 'amount', type: 'number', isRequired: true }] }
      },
      {
        keywords: ['appointment', 'schedule', 'booking'],
        inferred: { name: 'Reminder', attributes: [{ name: 'time', type: 'datetime', isRequired: true }] }
      },
      {
        keywords: ['employee', 'staff', 'worker'],
        inferred: { name: 'Leave', attributes: [{ name: 'startDate', type: 'date', isRequired: true }] }
      },
    ];

    for (const pattern of operationalPatterns) {
      const hasKeyword = entities.some(entity =>
        pattern.keywords.some(keyword => entity.name.toLowerCase().includes(keyword))
      );

      if (hasKeyword && !existingNames.has(pattern.inferred.name.toLowerCase())) {
        inferred.push({
          id: `inferred_${pattern.inferred.name.toLowerCase()}`,
          name: pattern.inferred.name,
          description: `Inferred operational entity for ${pattern.keywords[0]} management`,
          attributes: pattern.inferred.attributes,
          relations: [],
        });
      }
    }

    return inferred;
  }

  /**
   * Calculate overall quality score
   */
  private calculateQualityScore(issues: {
    duplicates: string[];
    circularRelations: string[];
    missingForeignKeys: string[];
    namingIssues: string[];
    invalidPatterns: string[];
  }): number {
    let score = 1.0;

    // Deduct for each issue type
    score -= issues.duplicates.length * 0.15;
    score -= issues.circularRelations.length * 0.2;
    score -= issues.missingForeignKeys.length * 0.1;
    score -= issues.namingIssues.length * 0.05;
    score -= issues.invalidPatterns.length * 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Generate repair suggestions
   */
  generateRepairSuggestions(validation: EntityValidationResult): EntityRepairSuggestion[] {
    const suggestions: EntityRepairSuggestion[] = [];

    // Duplicate suggestions
    for (const duplicate of validation.duplicates) {
      suggestions.push({
        type: 'duplicate',
        severity: 'critical',
        description: duplicate,
        suggestion: 'Merge duplicate entities or clarify their distinct purposes',
        affectedEntities: [],
      });
    }

    // Circular relation suggestions
    for (const circular of validation.circularRelations) {
      suggestions.push({
        type: 'circular',
        severity: 'critical',
        description: circular,
        suggestion: 'Break circular relation by introducing intermediate entity or removing one relation',
        affectedEntities: [],
      });
    }

    // Missing foreign key suggestions
    for (const missingFk of validation.missingForeignKeys) {
      suggestions.push({
        type: 'missing_fk',
        severity: 'warning',
        description: missingFk,
        suggestion: 'Add foreign key attribute to maintain referential integrity',
        affectedEntities: [],
      });
    }

    // Naming issue suggestions
    for (const namingIssue of validation.namingIssues) {
      suggestions.push({
        type: 'naming',
        severity: 'info',
        description: namingIssue,
        suggestion: 'Follow naming conventions: PascalCase for entities, camelCase for attributes',
        affectedEntities: [],
      });
    }

    // Invalid pattern suggestions
    for (const invalidPattern of validation.invalidPatterns) {
      suggestions.push({
        type: 'pattern',
        severity: 'warning',
        description: invalidPattern,
        suggestion: 'Review schema design and consider normalization',
        affectedEntities: [],
      });
    }

    // Inference suggestions
    for (const inferred of validation.inferredEntities) {
      suggestions.push({
        type: 'inference',
        severity: 'info',
        description: `Consider adding operational entity: ${inferred.name}`,
        suggestion: 'Add inferred entity to support operational workflows',
        affectedEntities: [],
      });
    }

    return suggestions;
  }

  /**
   * Auto-repair common issues
   */
  autoRepair(entities: EntityNode[]): EntityNode[] {
    let repaired = [...entities];

    // Remove exact duplicates
    const seen = new Set<string>();
    repaired = repaired.filter(entity => {
      const key = entity.name.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Add ID field if missing
    repaired = repaired.map(entity => {
      const hasId = entity.attributes.some(attr => attr.name.toLowerCase() === 'id');
      if (!hasId) {
        return {
          ...entity,
          attributes: [
            { name: 'id', type: 'string', isRequired: true, semanticType: 'generic' },
            ...entity.attributes,
          ],
        };
      }
      return entity;
    });

    return repaired;
  }

  /**
   * Validate and analyze entity schema quality
   */
  validate(entities: EntityNode[]): EntityValidationResult {
    const duplicates = this.detectDuplicates(entities);
    const circularRelations = this.detectCircularRelations(entities);
    const missingForeignKeys = this.detectMissingForeignKeys(entities);
    const namingIssues = this.detectNamingIssues(entities);
    const invalidPatterns = this.detectInvalidPatterns(entities);
    const inferredEntities = this.inferOperationalEntities(entities);

    // Calculate overall quality score
    const score = this.calculateQualityScore({
      duplicates,
      circularRelations,
      missingForeignKeys,
      namingIssues,
      invalidPatterns,
    });

    return {
      isValid: score > 0.7,
      duplicates,
      circularRelations,
      missingForeignKeys,
      namingIssues,
      invalidPatterns,
      inferredEntities,
      score,
    };
  }
}

export const entityIntelligence = new EntityIntelligence();

/**
 * Entity Similarity Scoring System
 * Calculates similarity scores between entities based on various metrics
 */

import type { EntitySchema, FieldSchema } from '@oneatlas/shared';

export interface SimilarityScore {
  overall: number; // 0-1
  fieldSimilarity: number;
  relationshipSimilarity: number;
  semanticSimilarity: number;
  structureSimilarity: number;
}

export interface EntityComparison {
  entity1: string;
  entity2: string;
  similarity: SimilarityScore;
  commonFields: string[];
  uniqueFields1: string[];
  uniqueFields2: string[];
  suggestedMappings: Map<string, string>;
}

class EntitySimilarityScorer {
  /**
   * Calculate similarity between two entities
   */
  calculateSimilarity(entity1: EntitySchema, entity2: EntitySchema): SimilarityScore {
    const fieldSimilarity = this.calculateFieldSimilarity(entity1, entity2);
    const relationshipSimilarity = this.calculateRelationshipSimilarity(entity1, entity2);
    const semanticSimilarity = this.calculateSemanticSimilarity(entity1, entity2);
    const structureSimilarity = this.calculateStructureSimilarity(entity1, entity2);

    const overall = (
      fieldSimilarity * 0.3 +
      relationshipSimilarity * 0.25 +
      semanticSimilarity * 0.25 +
      structureSimilarity * 0.2
    );

    return {
      overall,
      fieldSimilarity,
      relationshipSimilarity,
      semanticSimilarity,
      structureSimilarity,
    };
  }

  /**
   * Calculate field similarity
   */
  private calculateFieldSimilarity(entity1: EntitySchema, entity2: EntitySchema): number {
    const fields1 = new Set(entity1.fields.map(f => f.name.toLowerCase()));
    const fields2 = new Set(entity2.fields.map(f => f.name.toLowerCase()));

    const intersection = new Set([...fields1].filter(f => fields2.has(f)));
    const union = new Set([...fields1, ...fields2]);

    if (union.size === 0) return 0;

    // Jaccard similarity
    const jaccard = intersection.size / union.size;

    // Weight by field type similarity
    let typeSimilarity = 0;
    let typeMatches = 0;
    let typeTotal = 0;

    for (const field1 of entity1.fields) {
      const field2 = entity2.fields.find(f => f.name.toLowerCase() === field1.name.toLowerCase());
      if (field2) {
        typeTotal++;
        if (field1.prismaType === field2.prismaType) {
          typeMatches++;
        }
      }
    }

    if (typeTotal > 0) {
      typeSimilarity = typeMatches / typeTotal;
    }

    return (jaccard * 0.7) + (typeSimilarity * 0.3);
  }

  /**
   * Calculate relationship similarity
   */
  private calculateRelationshipSimilarity(entity1: EntitySchema, entity2: EntitySchema): number {
    const relations1 = entity1.relations || [];
    const relations2 = entity2.relations || [];

    if (relations1.length === 0 && relations2.length === 0) return 1;
    if (relations1.length === 0 || relations2.length === 0) return 0;

    const relSet1 = new Set(relations1.map(r => r.toEntity.toLowerCase()));
    const relSet2 = new Set(relations2.map(r => r.toEntity.toLowerCase()));

    const intersection = new Set([...relSet1].filter(r => relSet2.has(r)));
    const union = new Set([...relSet1, ...relSet2]);

    return intersection.size / union.size;
  }

  /**
   * Calculate semantic similarity
   */
  private calculateSemanticSimilarity(entity1: EntitySchema, entity2: EntitySchema): number {
    const name1 = entity1.name.toLowerCase();
    const name2 = entity2.name.toLowerCase();

    // Name similarity
    let nameSimilarity = 0;
    if (name1 === name2) {
      nameSimilarity = 1;
    } else if (name1.includes(name2) || name2.includes(name1)) {
      nameSimilarity = 0.7;
    } else {
      // Levenshtein distance approximation
      const distance = this.levenshteinDistance(name1, name2);
      const maxLen = Math.max(name1.length, name2.length);
      nameSimilarity = 1 - (distance / maxLen);
    }

    // Domain similarity
    const domain1 = this.inferDomain(entity1);
    const domain2 = this.inferDomain(entity2);
    const domainSimilarity = domain1 === domain2 ? 1 : 0;

    // Semantic field similarity
    const semanticFieldSim = this.calculateSemanticFieldSimilarity(entity1, entity2);

    return (nameSimilarity * 0.4) + (domainSimilarity * 0.3) + (semanticFieldSim * 0.3);
  }

  /**
   * Calculate semantic field similarity
   */
  private calculateSemanticFieldSimilarity(entity1: EntitySchema, entity2: EntitySchema): number {
    const semanticFields1 = this.extractSemanticFields(entity1);
    const semanticFields2 = this.extractSemanticFields(entity2);

    const intersection = new Set([...semanticFields1].filter(f => semanticFields2.has(f)));
    const union = new Set([...semanticFields1, ...semanticFields2]);

    if (union.size === 0) return 0;

    return intersection.size / union.size;
  }

  /**
   * Extract semantic fields from entity
   */
  private extractSemanticFields(entity: EntitySchema): Set<string> {
    const semanticFields = new Set<string>();

    for (const field of entity.fields) {
      const fieldName = field.name.toLowerCase();

      // Add semantic categories
      if (fieldName.includes('name')) semanticFields.add('name');
      if (fieldName.includes('email')) semanticFields.add('email');
      if (fieldName.includes('phone')) semanticFields.add('phone');
      if (fieldName.includes('address')) semanticFields.add('address');
      if (fieldName.includes('date') || fieldName.includes('time')) semanticFields.add('temporal');
      if (fieldName.includes('id')) semanticFields.add('identifier');
      if (fieldName.includes('status')) semanticFields.add('status');
      if (fieldName.includes('type')) semanticFields.add('type');
    }

    return semanticFields;
  }

  /**
   * Calculate structure similarity
   */
  private calculateStructureSimilarity(entity1: EntitySchema, entity2: EntitySchema): number {
    const fieldCount1 = entity1.fields.length;
    const fieldCount2 = entity2.fields.length;

    // Field count similarity
    const countRatio = Math.min(fieldCount1, fieldCount2) / Math.max(fieldCount1, fieldCount2);

    // Required field ratio
    const required1 = entity1.fields.filter(f => f.isRequired).length;
    const required2 = entity2.fields.filter(f => f.isRequired).length;
    const requiredRatio = Math.min(required1, required2) / Math.max(required1, required2);

    // Relation count similarity
    const relCount1 = entity1.relations?.length || 0;
    const relCount2 = entity2.relations?.length || 0;
    const relRatio = Math.min(relCount1, relCount2) / Math.max(relCount1, relCount2);

    return (countRatio * 0.4) + (requiredRatio * 0.3) + (relRatio * 0.3);
  }

  /**
   * Compare two entities in detail
   */
  compareEntities(entity1: EntitySchema, entity2: EntitySchema): EntityComparison {
    const similarity = this.calculateSimilarity(entity1, entity2);

    const fields1 = new Set(entity1.fields.map(f => f.name.toLowerCase()));
    const fields2 = new Set(entity2.fields.map(f => f.name.toLowerCase()));

    const commonFields = [...fields1].filter(f => fields2.has(f));
    const uniqueFields1 = [...fields1].filter(f => !fields2.has(f));
    const uniqueFields2 = [...fields2].filter(f => !fields1.has(f));

    const suggestedMappings = this.suggestFieldMappings(entity1, entity2);

    return {
      entity1: entity1.name,
      entity2: entity2.name,
      similarity,
      commonFields,
      uniqueFields1,
      uniqueFields2,
      suggestedMappings,
    };
  }

  /**
   * Suggest field mappings between entities
   */
  private suggestFieldMappings(entity1: EntitySchema, entity2: EntitySchema): Map<string, string> {
    const mappings = new Map<string, string>();

    for (const field1 of entity1.fields) {
      const bestMatch = this.findBestFieldMatch(field1, entity2.fields);
      if (bestMatch && bestMatch.score > 0.7) {
        mappings.set(field1.name, bestMatch.field.name);
      }
    }

    return mappings;
  }

  /**
   * Find best matching field
   */
  private findBestFieldMatch(field: FieldSchema, targetFields: FieldSchema[]): { field: FieldSchema; score: number } | null {
    let bestMatch: { field: FieldSchema; score: number } | null = null;

    for (const targetField of targetFields) {
      const score = this.calculateFieldMatchScore(field, targetField);
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { field: targetField, score };
      }
    }

    return bestMatch;
  }

  /**
   * Calculate field match score
   */
  private calculateFieldMatchScore(field1: FieldSchema, field2: FieldSchema): number {
    let score = 0;

    // Name similarity
    const name1 = field1.name.toLowerCase();
    const name2 = field2.name.toLowerCase();
    if (name1 === name2) {
      score += 0.5;
    } else if (name1.includes(name2) || name2.includes(name1)) {
      score += 0.3;
    }

    // Type similarity
    if (field1.prismaType === field2.prismaType) {
      score += 0.3;
    }

    // Required similarity
    if (field1.isRequired === field2.isRequired) {
      score += 0.1;
    }

    // Semantic type similarity
    if (field1.semanticType === field2.semanticType) {
      score += 0.1;
    }

    return Math.min(score, 1);
  }

  /**
   * Find similar entities in a collection
   */
  findSimilarEntities(
    targetEntity: EntitySchema,
    entityCollection: EntitySchema[],
    threshold: number = 0.5,
  ): Array<{ entity: EntitySchema; similarity: SimilarityScore }> {
    const similar: Array<{ entity: EntitySchema; similarity: SimilarityScore }> = [];

    for (const entity of entityCollection) {
      if (entity.name === targetEntity.name) continue;

      const similarity = this.calculateSimilarity(targetEntity, entity);
      if (similarity.overall >= threshold) {
        similar.push({ entity, similarity });
      }
    }

    // Sort by similarity descending
    return similar.sort((a, b) => b.similarity.overall - a.similarity.overall);
  }

  /**
   * Infer domain from entity
   */
  private inferDomain(entity: EntitySchema): string {
    const name = entity.name.toLowerCase();

    if (name.includes('patient') || name.includes('doctor') || name.includes('medical')) return 'healthcare';
    if (name.includes('customer') || name.includes('lead') || name.includes('opportunity')) return 'crm';
    if (name.includes('product') || name.includes('order') || name.includes('cart')) return 'ecommerce';
    if (name.includes('invoice') || name.includes('payment') || name.includes('transaction')) return 'finance';
    if (name.includes('task') || name.includes('project') || name.includes('milestone')) return 'project_management';

    return 'generic';
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    
    // Create 2D array with proper typing
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array.from({ length: n + 1 }, () => 0));

    // Initialize first row and column
    for (let i = 0; i <= m; i++) {
      dp[i]![0] = i;
    }
    for (let j = 0; j <= n; j++) {
      dp[0]![j] = j;
    }

    // Fill the rest of the matrix
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i]![j] = dp[i - 1]![j - 1]!;
        } else {
          dp[i]![j] = 1 + Math.min(
            dp[i - 1]![j]!,
            dp[i]![j - 1]!,
            dp[i - 1]![j - 1]!
          );
        }
      }
    }

    return dp[m]![n]!;
  }
}

export const entitySimilarityScorer = new EntitySimilarityScorer();

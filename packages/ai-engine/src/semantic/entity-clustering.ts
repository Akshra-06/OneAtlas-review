/**
 * Entity Clustering System for Pattern Recognition
 * Groups similar entities together to identify patterns and improve generation
 */

import type { EntitySchema } from '@oneatlas/shared';
import { entitySimilarityScorer } from './entity-similarity';

export interface EntityCluster {
  clusterId: string;
  centroid: string; // Representative entity name
  entities: string[];
  pattern: string;
  confidence: number;
  commonFields: string[];
  suggestedTemplate: string;
}

export interface ClusteringResult {
  clusters: EntityCluster[];
  outliers: string[];
  totalEntities: number;
  clusterCount: number;
}

class EntityClustering {
  private similarityThreshold = 0.6;
  private minClusterSize = 2;

  /**
   * Cluster entities based on similarity
   */
  clusterEntities(entities: EntitySchema[]): ClusteringResult {
    if (entities.length === 0) {
      return {
        clusters: [],
        outliers: [],
        totalEntities: 0,
        clusterCount: 0,
      };
    }

    const clusters: EntityCluster[] = [];
    const clustered = new Set<string>();
    const outliers: string[] = [];

    // Sort entities by name for consistent processing
    const sortedEntities = [...entities].sort((a, b) => a.name.localeCompare(b.name));

    for (const entity of sortedEntities) {
      if (clustered.has(entity.name)) continue;

      // Find similar entities to form a cluster
      const similarEntities = this.findSimilarEntities(entity, sortedEntities, clustered);

      if (similarEntities.length >= this.minClusterSize) {
        const cluster = this.createCluster(entity, similarEntities);
        clusters.push(cluster);

        // Mark all entities in cluster as clustered
        similarEntities.forEach(e => clustered.add(e.name));
      } else {
        outliers.push(entity.name);
        clustered.add(entity.name);
      }
    }

    return {
      clusters,
      outliers,
      totalEntities: entities.length,
      clusterCount: clusters.length,
    };
  }

  /**
   * Find similar entities for clustering
   */
  private findSimilarEntities(
    target: EntitySchema,
    entities: EntitySchema[],
    alreadyClustered: Set<string>,
  ): EntitySchema[] {
    const similar: EntitySchema[] = [target];

    for (const entity of entities) {
      if (entity.name === target.name || alreadyClustered.has(entity.name)) continue;

      const similarity = entitySimilarityScorer.calculateSimilarity(target, entity);
      if (similarity.overall >= this.similarityThreshold) {
        similar.push(entity);
      }
    }

    return similar;
  }

  /**
   * Create a cluster from similar entities
   */
  private createCluster(centroid: EntitySchema, entities: EntitySchema[]): EntityCluster {
    const entityNames = entities.map(e => e.name);
    const commonFields = this.findCommonFields(entities);
    const pattern = this.identifyPattern(entities);
    const suggestedTemplate = this.suggestTemplate(pattern, centroid);

    // Calculate cluster confidence based on average similarity
    let totalSimilarity = 0;
    let similarityCount = 0;

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entity1 = entities[i];
        const entity2 = entities[j];
        if (entity1 && entity2) {
          const similarity = entitySimilarityScorer.calculateSimilarity(entity1, entity2);
          totalSimilarity += similarity.overall;
          similarityCount++;
        }
      }
    }

    const confidence = similarityCount > 0 ? totalSimilarity / similarityCount : 0;

    return {
      clusterId: `cluster-${centroid.name.toLowerCase()}-${Date.now()}`,
      centroid: centroid.name,
      entities: entityNames,
      pattern,
      confidence,
      commonFields,
      suggestedTemplate,
    };
  }

  /**
   * Find common fields across entities
   */
  private findCommonFields(entities: EntitySchema[]): string[] {
    if (entities.length === 0) return [];

    const fieldCounts = new Map<string, number>();

    for (const entity of entities) {
      for (const field of entity.fields) {
        const fieldName = field.name.toLowerCase();
        fieldCounts.set(fieldName, (fieldCounts.get(fieldName) || 0) + 1);
      }
    }

    // Return fields that appear in at least 50% of entities
    const threshold = Math.ceil(entities.length * 0.5);
    return Array.from(fieldCounts.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([name, _]) => name);
  }

  /**
   * Identify pattern from cluster
   */
  private identifyPattern(entities: EntitySchema[]): string {
    const names = entities.map(e => e.name.toLowerCase());

    // Check for common patterns
    if (names.every(n => n.includes('patient') || n.includes('doctor'))) {
      return 'healthcare-person';
    }
    if (names.every(n => n.includes('customer') || n.includes('client') || n.includes('lead'))) {
      return 'crm-contact';
    }
    if (names.every(n => n.includes('product') || n.includes('item') || n.includes('sku'))) {
      return 'ecommerce-product';
    }
    if (names.every(n => n.includes('invoice') || n.includes('payment') || n.includes('transaction'))) {
      return 'finance-transaction';
    }
    if (names.every(n => n.includes('task') || n.includes('project') || n.includes('milestone'))) {
      return 'project-management-work';
    }

    // Generic pattern based on field similarity
    const commonFields = this.findCommonFields(entities);
    if (commonFields.includes('email') && commonFields.includes('phone')) {
      return 'contact-based';
    }
    if (commonFields.includes('status') && commonFields.includes('createdat')) {
      return 'status-tracking';
    }
    if (commonFields.includes('price') || commonFields.includes('amount')) {
      return 'financial';
    }

    return 'generic';
  }

  /**
   * Suggest template for cluster
   */
  private suggestTemplate(pattern: string, centroid: EntitySchema): string {
    switch (pattern) {
      case 'healthcare-person':
        return 'healthcare-person-template';
      case 'crm-contact':
        return 'crm-contact-template';
      case 'ecommerce-product':
        return 'ecommerce-product-template';
      case 'finance-transaction':
        return 'finance-transaction-template';
      case 'project-management-work':
        return 'project-management-work-template';
      case 'contact-based':
        return 'contact-template';
      case 'status-tracking':
        return 'status-tracking-template';
      case 'financial':
        return 'financial-template';
      default:
        return 'generic-template';
    }
  }

  /**
   * Get cluster for a specific entity
   */
  getClusterForEntity(entityName: string, clusteringResult: ClusteringResult): EntityCluster | null {
    for (const cluster of clusteringResult.clusters) {
      if (cluster.entities.includes(entityName)) {
        return cluster;
      }
    }
    return null;
  }

  /**
   * Suggest similar entities based on clustering
   */
  suggestSimilarEntities(entityName: string, clusteringResult: ClusteringResult): string[] {
    const cluster = this.getClusterForEntity(entityName, clusteringResult);
    if (!cluster) return [];

    return cluster.entities.filter(e => e !== entityName);
  }

  /**
   * Get cluster statistics
   */
  getClusterStatistics(clusteringResult: ClusteringResult): {
    averageClusterSize: number;
    largestClusterSize: number;
    smallestClusterSize: number;
    averageConfidence: number;
    outlierCount: number;
  } {
    const clusterSizes = clusteringResult.clusters.map(c => c.entities.length);
    const confidences = clusteringResult.clusters.map(c => c.confidence);

    return {
      averageClusterSize: clusterSizes.length > 0 ? clusterSizes.reduce((a, b) => a + b, 0) / clusterSizes.length : 0,
      largestClusterSize: clusterSizes.length > 0 ? Math.max(...clusterSizes) : 0,
      smallestClusterSize: clusterSizes.length > 0 ? Math.min(...clusterSizes) : 0,
      averageConfidence: confidences.length > 0 ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0,
      outlierCount: clusteringResult.outliers.length,
    };
  }

  /**
   * Set similarity threshold
   */
  setSimilarityThreshold(threshold: number): void {
    this.similarityThreshold = Math.max(0, Math.min(1, threshold));
  }

  /**
   * Set minimum cluster size
   */
  setMinClusterSize(size: number): void {
    this.minClusterSize = Math.max(1, size);
  }

  /**
   * Get current configuration
   */
  getConfig(): { similarityThreshold: number; minClusterSize: number } {
    return {
      similarityThreshold: this.similarityThreshold,
      minClusterSize: this.minClusterSize,
    };
  }
}

export const entityClustering = new EntityClustering();

/**
 * Attention Mapper
 * 
 * Maps user attention to UI elements.
 * Determines where users should look first.
 */

import { logger } from '../../shared/utils/logger';

export interface AttentionPoint {
  id: string;
  elementId: string;
  priority: number;
  reason: string;
  type: 'primary' | 'secondary' | 'tertiary';
}

export interface AttentionMap {
  points: AttentionPoint[];
  scanPath: string[];
  focalPoint: string | null;
}

export interface AttentionMapperConfig {
  enableAutoMapping: boolean;
  enableScanPathGeneration: boolean;
  enableFocalPointDetection: boolean;
}

const DEFAULT_CONFIG: AttentionMapperConfig = {
  enableAutoMapping: true,
  enableScanPathGeneration: true,
  enableFocalPointDetection: true,
};

/**
 * Attention Mapper
 * 
 * Maps user attention:
 * - Attention point identification
 * - Scan path generation
 * - Focal point detection
 * - Priority mapping
 */
export class AttentionMapper {
  private config: AttentionMapperConfig;

  constructor(config: Partial<AttentionMapperConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Map attention to UI elements
   */
  mapAttention(elements: string[], priorities: Record<string, number>): AttentionMap {
    const points: AttentionPoint[] = [];

    if (this.config.enableAutoMapping) {
      for (const element of elements) {
        const priority = priorities[element] || 0.5;
        const point = this.createAttentionPoint(element, priority);
        points.push(point);
      }
    }

    const scanPath = this.config.enableScanPathGeneration ? this.generateScanPath(points) : [];
    const focalPoint = this.config.enableFocalPointDetection ? this.detectFocalPoint(points) : null;

    const map: AttentionMap = {
      points,
      scanPath,
      focalPoint,
    };

    logger.info('AttentionMapper', 'ATTENTION_MAPPED', 'Attention mapped', {
      pointCount: points.length,
      focalPoint,
    });

    return map;
  }

  /**
   * Create attention point
   */
  private createAttentionPoint(elementId: string, priority: number): AttentionPoint {
    let type: AttentionPoint['type'] = 'tertiary';
    let reason = 'default priority';

    if (priority >= 0.8) {
      type = 'primary';
      reason = 'high priority element';
    } else if (priority >= 0.5) {
      type = 'secondary';
      reason = 'medium priority element';
    }

    return {
      id: crypto.randomUUID(),
      elementId,
      priority,
      reason,
      type,
    };
  }

  /**
   * Generate scan path
   */
  private generateScanPath(points: AttentionPoint[]): string[] {
    const sorted = [...points].sort((a, b) => b.priority - a.priority);
    return sorted.map(p => p.elementId);
  }

  /**
   * Detect focal point
   */
  private detectFocalPoint(points: AttentionPoint[]): string | null {
    const primaryPoints = points.filter(p => p.type === 'primary');
    if (primaryPoints.length > 0) {
      const highestPriority = primaryPoints.sort((a, b) => b.priority - a.priority)[0];
      if (highestPriority) {
        return highestPriority.elementId;
      }
    }
    return null;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AttentionMapperConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('AttentionMapper', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): AttentionMapperConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: AttentionMapperConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const attentionMapper = new AttentionMapper();

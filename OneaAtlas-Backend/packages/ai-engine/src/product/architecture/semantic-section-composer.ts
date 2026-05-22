/**
 * Semantic Section Composer
 * 
 * Composes semantic sections from content.
 * Creates meaningful content groupings.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';

export interface SemanticSection {
  id: string;
  name: string;
  semanticType: 'overview' | 'detail' | 'action' | 'reference' | 'auxiliary';
  content: string[];
  metadata: Record<string, unknown>;
}

export interface SectionComposerConfig {
  enableSemanticAnalysis: boolean;
  enableAutoGrouping: boolean;
  enableMetadataGeneration: boolean;
}

const DEFAULT_CONFIG: SectionComposerConfig = {
  enableSemanticAnalysis: true,
  enableAutoGrouping: true,
  enableMetadataGeneration: true,
};

/**
 * Semantic Section Composer
 * 
 * Composes semantic sections:
 * - Semantic analysis
 * - Content grouping
 * - Metadata generation
 * - Section composition
 */
export class SemanticSectionComposer {
  private config: SectionComposerConfig;

  constructor(config: Partial<SectionComposerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Compose semantic sections
   */
  composeSections(content: string[], archetype: ArchetypeDefinition): SemanticSection[] {
    const sections: SemanticSection[] = [];

    if (this.config.enableAutoGrouping) {
      const grouped = this.groupContentSemantically(content, archetype);
      for (const [groupName, items] of Object.entries(grouped)) {
        const section = this.createSection(groupName, items, archetype);
        sections.push(section);
      }
    } else {
      // Single section for all content
      const section = this.createSection('default', content, archetype);
      sections.push(section);
    }

    logger.info('SemanticSectionComposer', 'SECTIONS_COMPOSED', 'Semantic sections composed', {
      archetype: archetype.id,
      sectionCount: sections.length,
    });

    return sections;
  }

  /**
   * Group content semantically
   */
  private groupContentSemantically(content: string[], archetype: ArchetypeDefinition): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};

    for (const item of content) {
      const lowerItem = item.toLowerCase();
      let groupName = 'auxiliary';

      // Semantic analysis
      if (this.config.enableSemanticAnalysis) {
        groupName = this.analyzeSemanticType(lowerItem, archetype);
      }

      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      const groupArray = grouped[groupName];
      if (groupArray) {
        groupArray.push(item);
      }
    }

    return grouped;
  }

  /**
   * Analyze semantic type
   */
  private analyzeSemanticType(item: string, archetype: ArchetypeDefinition): string {
    // Check for overview content
    if (item.includes('overview') || item.includes('summary') || item.includes('dashboard')) {
      return 'overview';
    }

    // Check for detail content
    if (item.includes('detail') || item.includes('view') || item.includes('info')) {
      return 'detail';
    }

    // Check for action content
    if (item.includes('action') || item.includes('task') || item.includes('operation')) {
      return 'action';
    }

    // Check for reference content
    if (item.includes('reference') || item.includes('help') || item.includes('docs')) {
      return 'reference';
    }

    // Check archetype-specific patterns
    if (item.includes(archetype.visualHierarchyRules.primaryEmphasis.toLowerCase())) {
      return 'overview';
    }

    return 'auxiliary';
  }

  /**
   * Create section
   */
  private createSection(name: string, content: string[], archetype: ArchetypeDefinition): SemanticSection {
    const section: SemanticSection = {
      id: crypto.randomUUID(),
      name: this.formatSectionName(name),
      semanticType: this.determineSemanticType(name),
      content,
      metadata: this.config.enableMetadataGeneration ? this.generateMetadata(name, archetype) : {},
    };

    return section;
  }

  /**
   * Format section name
   */
  private formatSectionName(name: string): string {
    return name
      .split(/[_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Determine semantic type
   */
  private determineSemanticType(name: string): SemanticSection['semanticType'] {
    const lowerName = name.toLowerCase();

    if (lowerName === 'overview' || lowerName === 'summary' || lowerName === 'dashboard') {
      return 'overview';
    } else if (lowerName === 'detail' || lowerName === 'view' || lowerName === 'info') {
      return 'detail';
    } else if (lowerName === 'action' || lowerName === 'task' || lowerName === 'operation') {
      return 'action';
    } else if (lowerName === 'reference' || lowerName === 'help' || lowerName === 'docs') {
      return 'reference';
    } else {
      return 'auxiliary';
    }
  }

  /**
   * Generate metadata
   */
  private generateMetadata(name: string, archetype: ArchetypeDefinition): Record<string, unknown> {
    return {
      archetype: archetype.id,
      createdAt: new Date().toISOString(),
      semanticType: this.determineSemanticType(name),
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SectionComposerConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('SemanticSectionComposer', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): SectionComposerConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: SectionComposerConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const semanticSectionComposer = new SemanticSectionComposer();

/**
 * Information Architecture Engine
 * 
 * Organizes content semantically.
 * Creates intelligent information architecture.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';

export interface InformationArchitecture {
  id: string;
  sections: IASection[];
  hierarchy: IAHierarchy;
  navigation: IANavigation;
}

export interface IASection {
  id: string;
  name: string;
  type: 'primary' | 'secondary' | 'tertiary' | 'auxiliary';
  priority: number;
  content: string[];
  grouping: string;
}

export interface IAHierarchy {
  levels: number;
  structure: 'nested' | 'flat' | 'hybrid';
  depth: number;
}

export interface IANavigation {
  type: 'sidebar' | 'topbar' | 'sidebar-topbar' | 'minimal' | 'command-palette';
  items: INavigationItem[];
  breadcrumbs: boolean;
}

export interface INavigationItem {
  id: string;
  label: string;
  path: string;
  level: number;
  children?: INavigationItem[];
}

export interface IAEngineConfig {
  enableAutoGrouping: boolean;
  enableSemanticOrdering: boolean;
  enableAdaptiveHierarchy: boolean;
}

const DEFAULT_CONFIG: IAEngineConfig = {
  enableAutoGrouping: true,
  enableSemanticOrdering: true,
  enableAdaptiveHierarchy: true,
};

/**
 * Information Architecture Engine
 * 
 * Organizes information architecture:
 * - Section composition
 * - Hierarchy generation
 * - Navigation structure
 * - Content grouping
 */
export class InformationArchitectureEngine {
  private config: IAEngineConfig;

  constructor(config: Partial<IAEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate information architecture
   */
  generateArchitecture(content: string[], archetype: ArchetypeDefinition): InformationArchitecture {
    const sections = this.generateSections(content, archetype);
    const hierarchy = this.generateHierarchy(archetype);
    const navigation = this.generateNavigation(sections, archetype);

    const architecture: InformationArchitecture = {
      id: crypto.randomUUID(),
      sections,
      hierarchy,
      navigation,
    };

    logger.info('InformationArchitectureEngine', 'ARCHITECTURE_GENERATED', 'Information architecture generated', {
      archetype: archetype.id,
      sectionCount: sections.length,
    });

    return architecture;
  }

  /**
   * Generate sections
   */
  private generateSections(content: string[], archetype: ArchetypeDefinition): IASection[] {
    const sections: IASection[] = [];

    // Group content based on archetype strategy
    const groupedContent = this.groupContent(content, archetype);

    for (const [group, items] of Object.entries(groupedContent)) {
      const section: IASection = {
        id: crypto.randomUUID(),
        name: this.formatSectionName(group),
        type: this.determineSectionType(group, archetype),
        priority: this.calculateSectionPriority(group, archetype),
        content: items,
        grouping: group,
      };
      sections.push(section);
    }

    // Order sections
    if (this.config.enableSemanticOrdering) {
      this.orderSections(sections, archetype);
    }

    return sections;
  }

  /**
   * Group content
   */
  private groupContent(content: string[], archetype: ArchetypeDefinition): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};

    if (!this.config.enableAutoGrouping) {
      grouped['default'] = content;
      return grouped;
    }

    // Simple grouping by keyword matching
    for (const item of content) {
      const lowerItem = item.toLowerCase();
      let group = 'default';

      // Check for primary emphasis
      if (lowerItem.includes(archetype.visualHierarchyRules.primaryEmphasis.toLowerCase())) {
        group = archetype.visualHierarchyRules.primaryEmphasis;
      }
      // Check for secondary emphasis
      else if (lowerItem.includes(archetype.visualHierarchyRules.secondaryEmphasis.toLowerCase())) {
        group = archetype.visualHierarchyRules.secondaryEmphasis;
      }
      // Check for tertiary emphasis
      else if (lowerItem.includes(archetype.visualHierarchyRules.tertiaryEmphasis.toLowerCase())) {
        group = archetype.visualHierarchyRules.tertiaryEmphasis;
      }

      if (!grouped[group]) {
        grouped[group] = [];
      }
      const groupArray = grouped[group];
      if (groupArray) {
        groupArray.push(item);
      }
    }

    return grouped;
  }

  /**
   * Format section name
   */
  private formatSectionName(group: string): string {
    return group
      .split(/[_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Determine section type
   */
  private determineSectionType(group: string, archetype: ArchetypeDefinition): IASection['type'] {
    const lowerGroup = group.toLowerCase();

    if (lowerGroup === archetype.visualHierarchyRules.primaryEmphasis.toLowerCase()) {
      return 'primary';
    } else if (lowerGroup === archetype.visualHierarchyRules.secondaryEmphasis.toLowerCase()) {
      return 'secondary';
    } else if (lowerGroup === archetype.visualHierarchyRules.tertiaryEmphasis.toLowerCase()) {
      return 'tertiary';
    } else {
      return 'auxiliary';
    }
  }

  /**
   * Calculate section priority
   */
  private calculateSectionPriority(group: string, archetype: ArchetypeDefinition): number {
    const lowerGroup = group.toLowerCase();

    if (lowerGroup === archetype.visualHierarchyRules.primaryEmphasis.toLowerCase()) {
      return 1.0;
    } else if (lowerGroup === archetype.visualHierarchyRules.secondaryEmphasis.toLowerCase()) {
      return 0.7;
    } else if (lowerGroup === archetype.visualHierarchyRules.tertiaryEmphasis.toLowerCase()) {
      return 0.5;
    } else {
      return 0.3;
    }
  }

  /**
   * Order sections
   */
  private orderSections(sections: IASection[], archetype: ArchetypeDefinition): void {
    switch (archetype.sectionArrangementBehavior) {
      case 'priority':
        sections.sort((a, b) => b.priority - a.priority);
        break;
      case 'sequential':
        sections.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'grouped':
        sections.sort((a, b) => a.grouping.localeCompare(b.grouping));
        break;
      case 'workflow':
        const typeOrder: Record<string, number> = { primary: 1, secondary: 2, tertiary: 3, auxiliary: 4 };
        sections.sort((a, b) => (typeOrder[a.type] ?? 4) - (typeOrder[b.type] ?? 4));
        break;
    }
  }

  /**
   * Generate hierarchy
   */
  private generateHierarchy(archetype: ArchetypeDefinition): IAHierarchy {
    const hierarchy: IAHierarchy = {
      levels: this.config.enableAdaptiveHierarchy ? this.calculateLevels(archetype) : 3,
      structure: this.determineStructure(archetype),
      depth: this.calculateDepth(archetype),
    };

    return hierarchy;
  }

  /**
   * Calculate hierarchy levels
   */
  private calculateLevels(archetype: ArchetypeDefinition): number {
    switch (archetype.layoutDensity) {
      case 'dense':
        return 2;
      case 'compact':
        return 3;
      case 'comfortable':
        return 4;
      case 'spacious':
        return 5;
      default:
        return 3;
    }
  }

  /**
   * Determine structure
   */
  private determineStructure(archetype: ArchetypeDefinition): IAHierarchy['structure'] {
    switch (archetype.dashboardCompositionStrategy) {
      case 'data-first':
        return 'nested';
      case 'task-first':
        return 'flat';
      case 'status-first':
        return 'hybrid';
      case 'timeline-first':
        return 'nested';
      default:
        return 'flat';
    }
  }

  /**
   * Calculate depth
   */
  private calculateDepth(archetype: ArchetypeDefinition): number {
    return this.calculateLevels(archetype);
  }

  /**
   * Generate navigation
   */
  private generateNavigation(sections: IASection[], archetype: ArchetypeDefinition): IANavigation {
    const items = this.generateNavigationItems(sections);

    const navigation: IANavigation = {
      type: archetype.navigationStyle,
      items,
      breadcrumbs: archetype.navigationStyle === 'sidebar-topbar',
    };

    return navigation;
  }

  /**
   * Generate navigation items
   */
  private generateNavigationItems(sections: IASection[]): INavigationItem[] {
    const items: INavigationItem[] = [];

    for (const section of sections) {
      const item: INavigationItem = {
        id: section.id,
        label: section.name,
        path: `/${section.grouping.toLowerCase().replace(/\s+/g, '-')}`,
        level: section.type === 'primary' ? 1 : section.type === 'secondary' ? 2 : 3,
      };
      items.push(item);
    }

    return items;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<IAEngineConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('InformationArchitectureEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): IAEngineConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: IAEngineConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const informationArchitectureEngine = new InformationArchitectureEngine();

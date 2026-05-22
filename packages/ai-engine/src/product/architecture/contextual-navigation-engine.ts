/**
 * Contextual Navigation Engine
 * 
 * Generates contextual navigation based on content.
 * Creates adaptive navigation structures.
 */

import { logger } from '../../shared/utils/logger';
import { ArchetypeDefinition } from '../archetype/archetype-registry';
import { INavigationItem } from './information-architecture-engine';

export interface NavigationStructure {
  type: 'sidebar' | 'topbar' | 'sidebar-topbar' | 'minimal' | 'command-palette';
  items: INavigationItem[];
  breadcrumbs: boolean;
  searchEnabled: boolean;
}

export interface NavigationEngineConfig {
  enableAutoGeneration: boolean;
  enableBreadcrumbs: boolean;
  enableSearch: boolean;
}

const DEFAULT_CONFIG: NavigationEngineConfig = {
  enableAutoGeneration: true,
  enableBreadcrumbs: true,
  enableSearch: true,
};

/**
 * Contextual Navigation Engine
 * 
 * Generates contextual navigation:
 * - Navigation structure
 * - Breadcrumb generation
 * - Search integration
 * - Adaptive navigation
 */
export class ContextualNavigationEngine {
  private config: NavigationEngineConfig;

  constructor(config: Partial<NavigationEngineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate navigation structure
   */
  generateNavigation(sections: string[], archetype: ArchetypeDefinition): NavigationStructure {
    const items = this.generateNavigationItems(sections, archetype);
    const breadcrumbs = this.shouldEnableBreadcrumbs(archetype);
    const searchEnabled = this.config.enableSearch;

    const structure: NavigationStructure = {
      type: archetype.navigationStyle,
      items,
      breadcrumbs,
      searchEnabled,
    };

    logger.info('ContextualNavigationEngine', 'NAVIGATION_GENERATED', 'Navigation structure generated', {
      archetype: archetype.id,
      itemCount: items.length,
    });

    return structure;
  }

  /**
   * Generate navigation items
   */
  private generateNavigationItems(sections: string[], archetype: ArchetypeDefinition): INavigationItem[] {
    const items: INavigationItem[] = [];

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!section) continue;

      const item: INavigationItem = {
        id: crypto.randomUUID(),
        label: this.formatLabel(section),
        path: this.generatePath(section),
        level: this.calculateLevel(i, archetype),
      };
      items.push(item);
    }

    return items;
  }

  /**
   * Format label
   */
  private formatLabel(section: string): string {
    return section
      .split(/[_\s]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Generate path
   */
  private generatePath(section: string): string {
    return `/${section.toLowerCase().replace(/\s+/g, '-')}`;
  }

  /**
   * Calculate navigation level
   */
  private calculateLevel(index: number, archetype: ArchetypeDefinition): number {
    // Simple level calculation based on index
    return Math.floor(index / 3) + 1;
  }

  /**
   * Determine if breadcrumbs should be enabled
   */
  private shouldEnableBreadcrumbs(archetype: ArchetypeDefinition): boolean {
    if (!this.config.enableBreadcrumbs) {
      return false;
    }

    // Enable breadcrumbs for complex navigation styles
    return archetype.navigationStyle === 'sidebar-topbar' || archetype.navigationStyle === 'sidebar';
  }

  /**
   * Generate hierarchical navigation
   */
  generateHierarchicalNavigation(sections: string[], archetype: ArchetypeDefinition): INavigationItem[] {
    const items: INavigationItem[] = [];
    const grouped = this.groupSectionsByLevel(sections, 3);

    for (const [level, sectionList] of Object.entries(grouped)) {
      const levelNum = parseInt(level, 10);
      const parentItem: INavigationItem = {
        id: crypto.randomUUID(),
        label: `Level ${levelNum}`,
        path: `/level-${levelNum}`,
        level: levelNum,
        children: [],
      };

      for (const section of sectionList) {
        if (!section) continue;

        const childItem: INavigationItem = {
          id: crypto.randomUUID(),
          label: this.formatLabel(section),
          path: this.generatePath(section),
          level: levelNum + 1,
        };

        if (parentItem.children) {
          parentItem.children.push(childItem);
        }
      }

      items.push(parentItem);
    }

    return items;
  }

  /**
   * Group sections by level
   */
  private groupSectionsByLevel(sections: string[], itemsPerLevel: number): Record<string, string[]> {
    const grouped: Record<string, string[]> = {};

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      if (!section) continue;

      const level = Math.floor(i / itemsPerLevel).toString();
      if (!grouped[level]) {
        grouped[level] = [];
      }
      grouped[level].push(section);
    }

    return grouped;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<NavigationEngineConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ContextualNavigationEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): NavigationEngineConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: NavigationEngineConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const contextualNavigationEngine = new ContextualNavigationEngine();

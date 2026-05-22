/**
 * Patch Generator
 * 
 * Generates patches for incremental regeneration.
 * Creates AST/code diffs for changed sections.
 */

import { logger } from '../../shared/utils/logger';

export interface CodeChange {
  type: 'add' | 'remove' | 'modify';
  path: string;
  oldValue?: string;
  newValue?: string;
  line?: number;
}

export interface Patch {
  id: string;
  type: 'component' | 'layout' | 'workflow' | 'schema' | 'style';
  target: string;
  changes: CodeChange[];
  metadata?: Record<string, unknown>;
}

export interface PatchGenerationConfig {
  enableASTDiffing: boolean;
  enableLineTracking: boolean;
  preserveFormatting: boolean;
}

const DEFAULT_CONFIG: PatchGenerationConfig = {
  enableASTDiffing: true,
  enableLineTracking: true,
  preserveFormatting: true,
};

/**
 * Patch Generator
 * 
 * Generates patches for incremental regeneration:
 * - Component patches
 * - Layout patches
 * - Workflow patches
 * - Schema patches
 * - Style patches
 */
export class PatchGenerator {
  private config: PatchGenerationConfig;

  constructor(config: Partial<PatchGenerationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a component patch
   */
  generateComponentPatch(
    componentId: string,
    oldCode: string,
    newCode: string
  ): Patch {
    const changes = this.generateChanges(oldCode, newCode);

    const patch: Patch = {
      id: crypto.randomUUID(),
      type: 'component',
      target: componentId,
      changes,
      metadata: {
        timestamp: Date.now(),
      },
    };

    logger.info('PatchGenerator', 'COMPONENT_PATCH_GENERATED', 'Component patch generated', {
      patchId: patch.id,
      componentId,
      changesCount: changes.length,
    });

    return patch;
  }

  /**
   * Generate a layout patch
   */
  generateLayoutPatch(
    layoutId: string,
    oldLayout: string,
    newLayout: string
  ): Patch {
    const changes = this.generateChanges(oldLayout, newLayout);

    const patch: Patch = {
      id: crypto.randomUUID(),
      type: 'layout',
      target: layoutId,
      changes,
      metadata: {
        timestamp: Date.now(),
      },
    };

    logger.info('PatchGenerator', 'LAYOUT_PATCH_GENERATED', 'Layout patch generated', {
      patchId: patch.id,
      layoutId,
      changesCount: changes.length,
    });

    return patch;
  }

  /**
   * Generate a workflow patch
   */
  generateWorkflowPatch(
    workflowId: string,
    oldWorkflow: string,
    newWorkflow: string
  ): Patch {
    const changes = this.generateChanges(oldWorkflow, newWorkflow);

    const patch: Patch = {
      id: crypto.randomUUID(),
      type: 'workflow',
      target: workflowId,
      changes,
      metadata: {
        timestamp: Date.now(),
      },
    };

    logger.info('PatchGenerator', 'WORKFLOW_PATCH_GENERATED', 'Workflow patch generated', {
      patchId: patch.id,
      workflowId,
      changesCount: changes.length,
    });

    return patch;
  }

  /**
   * Generate a schema patch
   */
  generateSchemaPatch(
    schemaId: string,
    oldSchema: string,
    newSchema: string
  ): Patch {
    const changes = this.generateChanges(oldSchema, newSchema);

    const patch: Patch = {
      id: crypto.randomUUID(),
      type: 'schema',
      target: schemaId,
      changes,
      metadata: {
        timestamp: Date.now(),
      },
    };

    logger.info('PatchGenerator', 'SCHEMA_PATCH_GENERATED', 'Schema patch generated', {
      patchId: patch.id,
      schemaId,
      changesCount: changes.length,
    });

    return patch;
  }

  /**
   * Generate a style patch
   */
  generateStylePatch(
    styleId: string,
    oldStyle: string,
    newStyle: string
  ): Patch {
    const changes = this.generateChanges(oldStyle, newStyle);

    const patch: Patch = {
      id: crypto.randomUUID(),
      type: 'style',
      target: styleId,
      changes,
      metadata: {
        timestamp: Date.now(),
      },
    };

    logger.info('PatchGenerator', 'STYLE_PATCH_GENERATED', 'Style patch generated', {
      patchId: patch.id,
      styleId,
      changesCount: changes.length,
    });

    return patch;
  }

  /**
   * Generate changes between two code strings
   */
  private generateChanges(oldCode: string, newCode: string): CodeChange[] {
    const changes: CodeChange[] = [];

    if (this.config.enableASTDiffing) {
      // Use AST diffing if enabled (simplified for now)
      const astChanges = this.generateASTChanges(oldCode, newCode);
      changes.push(...astChanges);
    } else {
      // Use simple line-by-line diff
      const lineChanges = this.generateLineChanges(oldCode, newCode);
      changes.push(...lineChanges);
    }

    return changes;
  }

  /**
   * Generate AST-based changes (simplified)
   */
  private generateASTChanges(oldCode: string, newCode: string): CodeChange[] {
    const changes: CodeChange[] = [];

    // In a real implementation, this would parse the code into AST
    // and compare the AST nodes to generate precise changes
    // For now, use a simplified approach

    if (oldCode === newCode) {
      return changes;
    }

    // Detect added content
    if (newCode.includes(oldCode)) {
      changes.push({
        type: 'add',
        path: 'root',
        newValue: newCode,
      });
    }
    // Detect removed content
    else if (oldCode.includes(newCode)) {
      changes.push({
        type: 'remove',
        path: 'root',
        oldValue: oldCode,
      });
    }
    // Detect modified content
    else {
      changes.push({
        type: 'modify',
        path: 'root',
        oldValue: oldCode,
        newValue: newCode,
      });
    }

    return changes;
  }

  /**
   * Generate line-by-line changes
   */
  private generateLineChanges(oldCode: string, newCode: string): CodeChange[] {
    const changes: CodeChange[] = [];
    const oldLines = oldCode.split('\n');
    const newLines = newCode.split('\n');

    // Simple line diffing
    for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === undefined) {
        // Line added
        changes.push({
          type: 'add',
          path: `line:${i + 1}`,
          newValue: newLine,
          line: i + 1,
        });
      } else if (newLine === undefined) {
        // Line removed
        changes.push({
          type: 'remove',
          path: `line:${i + 1}`,
          oldValue: oldLine,
          line: i + 1,
        });
      } else if (oldLine !== newLine) {
        // Line modified
        changes.push({
          type: 'modify',
          path: `line:${i + 1}`,
          oldValue: oldLine,
          newValue: newLine,
          line: i + 1,
        });
      }
    }

    return changes;
  }

  /**
   * Generate multiple patches
   */
  generatePatches(
    changes: Array<{
      type: 'component' | 'layout' | 'workflow' | 'schema' | 'style';
      target: string;
      oldCode: string;
      newCode: string;
    }>
  ): Patch[] {
    const patches: Patch[] = [];

    for (const change of changes) {
      let patch: Patch;

      switch (change.type) {
        case 'component':
          patch = this.generateComponentPatch(change.target, change.oldCode, change.newCode);
          break;
        case 'layout':
          patch = this.generateLayoutPatch(change.target, change.oldCode, change.newCode);
          break;
        case 'workflow':
          patch = this.generateWorkflowPatch(change.target, change.oldCode, change.newCode);
          break;
        case 'schema':
          patch = this.generateSchemaPatch(change.target, change.oldCode, change.newCode);
          break;
        case 'style':
          patch = this.generateStylePatch(change.target, change.oldCode, change.newCode);
          break;
      }

      patches.push(patch);
    }

    logger.info('PatchGenerator', 'MULTIPLE_PATCHES_GENERATED', 'Multiple patches generated', {
      count: patches.length,
    });

    return patches;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PatchGenerationConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('PatchGenerator', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): PatchGenerationConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalPatchesGenerated: number;
    averageChangesPerPatch: number;
    config: PatchGenerationConfig;
  } {
    // In a real implementation, this would track actual statistics
    return {
      totalPatchesGenerated: 0,
      averageChangesPerPatch: 0,
      config: this.getConfig(),
    };
  }
}

export const patchGenerator = new PatchGenerator();

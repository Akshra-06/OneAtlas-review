/**
 * Conversational Patch Engine
 * 
 * Generates patches from natural language edits.
 * Converts conversational edits to patch operations.
 */

import { logger } from '../../shared/utils/logger';
import { Patch, CodeChange } from '../patch/patch-generator';
import { promptToUIReasoning } from '../../intelligence/reasoning/prompt-to-ui-reasoning';
import { uiIntentDetection } from '../../intelligence/reasoning/ui-intent-detection';

export interface EditIntent {
  type: 'modify' | 'add' | 'remove' | 'replace';
  target: string;
  description: string;
  confidence: number;
}

export interface ConversationalPatchConfig {
  enableIntentDetection: boolean;
  enableContextAwareness: boolean;
  confidenceThreshold: number;
}

const DEFAULT_CONFIG: ConversationalPatchConfig = {
  enableIntentDetection: true,
  enableContextAwareness: true,
  confidenceThreshold: 0.7,
};

/**
 * Conversational Patch Engine
 * 
 * Generates patches from natural language edits:
 * - "make dashboard more modern"
 * - "add charts"
 * - "change CRM into healthcare CRM"
 * - "add dark mode"
 * - "make analytics page cleaner"
 */
export class ConversationalPatchEngine {
  private config: ConversationalPatchConfig;

  constructor(config: Partial<ConversationalPatchConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate patches from a conversational edit
   */
  async generatePatches(
    originalPrompt: string,
    editPrompt: string,
    currentCode: string
  ): Promise<Patch[]> {
    const patches: Patch[] = [];

    // Detect edit intent
    const intent = this.detectEditIntent(editPrompt);

    if (intent.confidence < this.config.confidenceThreshold) {
      logger.warn('ConversationalPatchEngine', 'LOW_CONFIDENCE', 'Edit intent confidence too low', {
        confidence: intent.confidence,
        threshold: this.config.confidenceThreshold,
      });
      return patches;
    }

    // Generate patches based on intent
    switch (intent.type) {
      case 'modify':
        patches.push(...await this.generateModifyPatches(intent, currentCode));
        break;
      case 'add':
        patches.push(...await this.generateAddPatches(intent, currentCode));
        break;
      case 'remove':
        patches.push(...await this.generateRemovePatches(intent, currentCode));
        break;
      case 'replace':
        patches.push(...await this.generateReplacePatches(intent, currentCode));
        break;
    }

    logger.info('ConversationalPatchEngine', 'PATCHES_GENERATED', 'Patches generated from conversational edit', {
      editPrompt,
      intentType: intent.type,
      patchesCount: patches.length,
    });

    return patches;
  }

  /**
   * Detect edit intent from natural language
   */
  private detectEditIntent(prompt: string): EditIntent {
    const lowerPrompt = prompt.toLowerCase();

    // Detect add intent
    if (lowerPrompt.includes('add') || lowerPrompt.includes('create') || lowerPrompt.includes('insert')) {
      const target = this.extractTarget(prompt);
      return {
        type: 'add',
        target: target || 'component',
        description: prompt,
        confidence: 0.85,
      };
    }

    // Detect remove intent
    if (lowerPrompt.includes('remove') || lowerPrompt.includes('delete') || lowerPrompt.includes('remove')) {
      const target = this.extractTarget(prompt);
      return {
        type: 'remove',
        target: target || 'component',
        description: prompt,
        confidence: 0.85,
      };
    }

    // Detect replace intent
    if (lowerPrompt.includes('replace') || lowerPrompt.includes('change into') || lowerPrompt.includes('convert to')) {
      const target = this.extractTarget(prompt);
      return {
        type: 'replace',
        target: target || 'component',
        description: prompt,
        confidence: 0.85,
      };
    }

    // Default to modify intent
    const target = this.extractTarget(prompt);
    return {
      type: 'modify',
      target: target || 'component',
      description: prompt,
      confidence: 0.75,
    };
  }

  /**
   * Extract target from prompt
   */
  private extractTarget(prompt: string): string | null {
    // Simple target extraction (in real implementation, use NLP)
    const keywords = ['dashboard', 'chart', 'table', 'form', 'navbar', 'sidebar', 'layout', 'theme', 'style'];
    const lowerPrompt = prompt.toLowerCase();

    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword)) {
        return keyword;
      }
    }

    return null;
  }

  /**
   * Generate modify patches
   */
  private async generateModifyPatches(intent: EditIntent, currentCode: string): Promise<Patch[]> {
    const patches: Patch[] = [];

    // Use UI reasoning to understand what to modify
    const reasoning = promptToUIReasoning.reason(intent.description);

    // Create a patch based on the reasoning
    const patch: Patch = {
      id: crypto.randomUUID(),
      type: 'component',
      target: intent.target,
      changes: [
        {
          type: 'modify',
          path: 'root',
          oldValue: currentCode,
          newValue: this.generateModifiedCode(currentCode, intent),
        },
      ],
      metadata: {
        reasoning: reasoning.reasoning,
        confidence: reasoning.confidence,
      },
    };

    patches.push(patch);

    return patches;
  }

  /**
   * Generate add patches
   */
  private async generateAddPatches(intent: EditIntent, currentCode: string): Promise<Patch[]> {
    const patches: Patch[] = [];

    // Detect what to add based on intent
    const detection = uiIntentDetection.detect(intent.description);

    // Create a patch to add the new component
    const patch: Patch = {
      id: crypto.randomUUID(),
      type: 'component',
      target: intent.target,
      changes: [
        {
          type: 'add',
          path: 'root',
          newValue: this.generateAddedCode(intent, detection),
        },
      ],
      metadata: {
        detection: detection,
        confidence: detection.confidence,
      },
    };

    patches.push(patch);

    return patches;
  }

  /**
   * Generate remove patches
   */
  private async generateRemovePatches(intent: EditIntent, currentCode: string): Promise<Patch[]> {
    const patches: Patch[] = [];

    // Create a patch to remove the component
    const patch: Patch = {
      id: crypto.randomUUID(),
      type: 'component',
      target: intent.target,
      changes: [
        {
          type: 'remove',
          path: 'root',
          oldValue: currentCode,
        },
      ],
      metadata: {
        description: intent.description,
      },
    };

    patches.push(patch);

    return patches;
  }

  /**
   * Generate replace patches
   */
  private async generateReplacePatches(intent: EditIntent, currentCode: string): Promise<Patch[]> {
    const patches: Patch[] = [];

    // Create a patch to replace the component
    const patch: Patch = {
      id: crypto.randomUUID(),
      type: 'component',
      target: intent.target,
      changes: [
        {
          type: 'modify',
          path: 'root',
          oldValue: currentCode,
          newValue: this.generateReplacedCode(currentCode, intent),
        },
      ],
      metadata: {
        description: intent.description,
      },
    };

    patches.push(patch);

    return patches;
  }

  /**
   * Generate modified code (placeholder)
   */
  private generateModifiedCode(currentCode: string, intent: EditIntent): string {
    // In a real implementation, this would use AI to generate the modified code
    // For now, return a placeholder
    return `// Modified based on: ${intent.description}\n${currentCode}`;
  }

  /**
   * Generate added code (placeholder)
   */
  private generateAddedCode(intent: EditIntent, detection: any): string {
    // In a real implementation, this would use AI to generate the new code
    // For now, return a placeholder
    return `// Added based on: ${intent.description}\n// Component: ${intent.target}`;
  }

  /**
   * Generate replaced code (placeholder)
   */
  private generateReplacedCode(currentCode: string, intent: EditIntent): string {
    // In a real implementation, this would use AI to generate the replaced code
    // For now, return a placeholder
    return `// Replaced based on: ${intent.description}\n// Target: ${intent.target}`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ConversationalPatchConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ConversationalPatchEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ConversationalPatchConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    config: ConversationalPatchConfig;
  } {
    return {
      config: this.getConfig(),
    };
  }
}

export const conversationalPatchEngine = new ConversationalPatchEngine();

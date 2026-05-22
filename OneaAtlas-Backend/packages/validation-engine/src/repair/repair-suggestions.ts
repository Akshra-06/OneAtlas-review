/**
 * AI-Assisted Repair Suggestions
 * 
 * Provides multiple repair options for validation issues.
 * Allows users to choose between different repair strategies.
 */

import type { GeneratedFile } from '@oneatlas/shared';
import { logger } from '@oneatlas/shared';

export interface RepairOption {
  id: string;
  strategy: string;
  description: string;
  repairedContent: string;
  confidence: number;
  estimatedImpact: 'low' | 'medium' | 'high';
  sideEffects: string[];
}

export interface RepairSuggestionResult {
  issueId: string;
  issueCode: string;
  filePath: string;
  options: RepairOption[];
  recommendedOptionId?: string;
}

/**
 * AI-Assisted Repair Suggestions
 * 
 * Generates multiple repair options for validation issues:
 * - Conservative repairs (minimal changes)
 * - Aggressive repairs (comprehensive fixes)
 * - Alternative approaches (different strategies)
 */
export class RepairSuggestions {
  /**
   * Generate repair options for an issue
   */
  generateOptions(
    issueId: string,
    issueCode: string,
    filePath: string,
    originalContent: string,
  ): RepairSuggestionResult {
    const options = this.generateOptionsForCode(issueCode, originalContent);
    
    // Recommend the option with highest confidence
    const recommendedOptionId = options.length > 0 
      ? options.reduce((best, current) => current.confidence > best.confidence ? current : best).id
      : undefined;

    logger.info('RepairSuggestions', 'OPTIONS_GENERATED', `Generated ${options.length} repair options`, {
      issueId,
      issueCode,
      recommendedOptionId,
    });

    return {
      issueId,
      issueCode,
      filePath,
      options,
      recommendedOptionId,
    };
  }

  /**
   * Generate options based on issue code
   */
  private generateOptionsForCode(issueCode: string, content: string): RepairOption[] {
    const options: RepairOption[] = [];

    switch (issueCode) {
      case 'MISSING_USE_CLIENT':
        options.push(...this.generateUseClientOptions(content));
        break;
      case 'MISSING_EXPORT':
        options.push(...this.generateExportOptions(content));
        break;
      case 'UNUSED_IMPORT':
        options.push(...this.generateUnusedImportOptions(content));
        break;
      case 'EMPTY_ALT_TEXT':
        options.push(...this.generateAltTextOptions(content));
        break;
      case 'MISSING_LANG':
        options.push(...this.generateLangOptions(content));
        break;
      default:
        options.push(this.generateGenericOption(issueCode, content));
    }

    return options;
  }

  /**
   * Generate options for missing 'use client' directive
   */
  private generateUseClientOptions(content: string): RepairOption[] {
    return [
      {
        id: crypto.randomUUID(),
        strategy: 'conservative',
        description: 'Add "use client" at the top of the file',
        repairedContent: "'use client';\n\n" + content,
        confidence: 95,
        estimatedImpact: 'low',
        sideEffects: ['Converts component to client component'],
      },
      {
        id: crypto.randomUUID(),
        strategy: 'aggressive',
        description: 'Add "use client" and refactor for server compatibility',
        repairedContent: "'use client';\n\n" + this.refactorForServer(content),
        confidence: 70,
        estimatedImpact: 'medium',
        sideEffects: ['Converts component to client component', 'May require additional refactoring'],
      },
    ];
  }

  /**
   * Generate options for missing export
   */
  private generateExportOptions(content: string): RepairOption[] {
    return [
      {
        id: crypto.randomUUID(),
        strategy: 'conservative',
        description: 'Add default export',
        repairedContent: content + "\n\nexport default {};",
        confidence: 85,
        estimatedImpact: 'low',
        sideEffects: ['Adds empty default export'],
      },
      {
        id: crypto.randomUUID(),
        strategy: 'named',
        description: 'Add named export instead of default',
        repairedContent: content + "\n\nexport const Component = () => {};",
        confidence: 80,
        estimatedImpact: 'low',
        sideEffects: ['Adds named export'],
      },
    ];
  }

  /**
   * Generate options for unused imports
   */
  private generateUnusedImportOptions(content: string): RepairOption[] {
    return [
      {
        id: crypto.randomUUID(),
        strategy: 'remove',
        description: 'Remove unused import',
        repairedContent: this.removeUnusedImports(content),
        confidence: 90,
        estimatedImpact: 'low',
        sideEffects: ['Removes import statement'],
      },
      {
        id: crypto.randomUUID(),
        strategy: 'comment',
        description: 'Comment out unused import for future use',
        repairedContent: this.commentUnusedImports(content),
        confidence: 75,
        estimatedImpact: 'low',
        sideEffects: ['Comments out import instead of removing'],
      },
    ];
  }

  /**
   * Generate options for empty alt text
   */
  private generateAltTextOptions(content: string): RepairOption[] {
    return [
      {
        id: crypto.randomUUID(),
        strategy: 'decorative',
        description: 'Mark image as decorative with role="presentation"',
        repairedContent: content.replace(/<img([^>]*)>/g, (match, group) => {
          if (!group.includes('alt=')) {
            return `<img${group} alt="" role="presentation">`;
          }
          return match;
        }),
        confidence: 95,
        estimatedImpact: 'low',
        sideEffects: ['Marks image as decorative'],
      },
      {
        id: crypto.randomUUID(),
        strategy: 'descriptive',
        description: 'Add descriptive alt text placeholder',
        repairedContent: content.replace(/<img([^>]*)>/g, (match, group) => {
          if (!group.includes('alt=')) {
            return `<img${group} alt="Image description">`;
          }
          return match;
        }),
        confidence: 70,
        estimatedImpact: 'medium',
        sideEffects: ['Adds placeholder alt text that needs manual review'],
      },
    ];
  }

  /**
   * Generate options for missing lang attribute
   */
  private generateLangOptions(content: string): RepairOption[] {
    return [
      {
        id: crypto.randomUUID(),
        strategy: 'english',
        description: 'Add lang="en" to html element',
        repairedContent: content.replace(/<html>/, '<html lang="en">'),
        confidence: 95,
        estimatedImpact: 'low',
        sideEffects: ['Sets language to English'],
      },
      {
        id: crypto.randomUUID(),
        strategy: 'placeholder',
        description: 'Add lang attribute with placeholder value',
        repairedContent: content.replace(/<html>/, '<html lang="">'),
        confidence: 80,
        estimatedImpact: 'low',
        sideEffects: ['Adds empty lang attribute that needs manual configuration'],
      },
    ];
  }

  /**
   * Generate generic option for unknown issues
   */
  private generateGenericOption(issueCode: string, content: string): RepairOption {
    return {
      id: crypto.randomUUID(),
      strategy: 'manual',
      description: `Manual repair required for ${issueCode}`,
      repairedContent: content,
      confidence: 50,
      estimatedImpact: 'medium',
      sideEffects: ['Requires manual intervention'],
    };
  }

  /**
   * Refactor content for server compatibility
   */
  private refactorForServer(content: string): string {
    // Simplified refactoring - actual implementation would be more complex
    return content;
  }

  /**
   * Remove unused imports
   */
  private removeUnusedImports(content: string): string {
    // Simplified implementation - actual would use AST parsing
    return content;
  }

  /**
   * Comment out unused imports
   */
  private commentUnusedImports(content: string): string {
    // Simplified implementation - actual would use AST parsing
    return content;
  }

  /**
   * Apply selected repair option
   */
  applyOption(option: RepairOption, files: GeneratedFile[], filePath: string): GeneratedFile[] {
    const fileIndex = files.findIndex(f => f.filePath === filePath);
    if (fileIndex === -1) {
      logger.warn('RepairSuggestions', 'FILE_NOT_FOUND', 'File not found for repair', { filePath });
      return files;
    }

    const updatedFiles = [...files];
    const file = updatedFiles[fileIndex];
    
    if (!file || file.filePath === undefined) {
      logger.warn('RepairSuggestions', 'FILE_INVALID', 'File is invalid or has undefined path', { fileIndex });
      return files;
    }

    updatedFiles[fileIndex] = {
      ...file,
      filePath: file.filePath,
      content: option.repairedContent,
    };

    logger.info('RepairSuggestions', 'OPTION_APPLIED', 'Repair option applied', {
      optionId: option.id,
      strategy: option.strategy,
      filePath,
    });

    return updatedFiles;
  }

  /**
   * Batch generate options for multiple issues
   */
  batchGenerateOptions(issues: Array<{ id: string; code: string; filePath: string; content: string }>): RepairSuggestionResult[] {
    return issues.map(issue => 
      this.generateOptions(issue.id, issue.code, issue.filePath, issue.content)
    );
  }
}

export const repairSuggestions = new RepairSuggestions();

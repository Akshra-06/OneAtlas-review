/**
 * Template-Based Generator
 * Uses templates instead of generating code from scratch
 */

import type { EntitySchema, GeneratedFile } from '@oneatlas/shared';
import { templateRegistry, TemplateMatch } from './template-registry';
import { templateModifier, ModificationRequest } from './template-modifier';

export class TemplateBasedGenerator {
  /**
   * Generate validation schema using templates
   */
  async generateValidation(entity: EntitySchema, domain?: string): Promise<GeneratedFile> {
    const matches = templateRegistry.findMatchingTemplates(entity, domain);
    
    if (matches.length === 0) {
      throw new Error(`No matching templates found for entity: ${entity.name}`);
    }

    // Use the highest confidence template
    const bestMatch = matches[0];
    if (!bestMatch) {
      throw new Error(`No valid template match found for entity: ${entity.name}`);
    }
    
    const modificationRequest: ModificationRequest = {
      template: bestMatch.template,
      entity,
      userPrompt: '', // Could be passed from context
      domain,
    };

    const result = await templateModifier.modifyTemplate(modificationRequest);

    return {
      filePath: `lib/validations/${entity.nameSlug}.ts`,
      fileType: 'config',
      entityName: entity.name,
      content: result.modifiedTemplate,
    };
  }

  /**
   * Generate page using templates
   */
  async generatePage(entity: EntitySchema, domain?: string): Promise<GeneratedFile> {
    const matches = templateRegistry.findMatchingTemplates(entity, domain);
    
    if (matches.length === 0) {
      throw new Error(`No matching templates found for entity: ${entity.name}`);
    }

    const bestMatch = matches[0];
    if (!bestMatch) {
      throw new Error(`No valid template match found for entity: ${entity.name}`);
    }
    
    const modificationRequest: ModificationRequest = {
      template: bestMatch.template,
      entity,
      userPrompt: '',
      domain,
    };

    const result = await templateModifier.modifyTemplate(modificationRequest);

    return {
      filePath: `app/(dashboard)/${entity.nameSlug}/page.tsx`,
      fileType: 'page',
      entityName: entity.name,
      content: result.modifiedTemplate,
    };
  }

  /**
   * Generate API route using templates
   */
  async generateAPI(entity: EntitySchema, domain?: string): Promise<GeneratedFile> {
    const matches = templateRegistry.findMatchingTemplates(entity, domain);
    
    if (matches.length === 0) {
      throw new Error(`No matching templates found for entity: ${entity.name}`);
    }

    const bestMatch = matches[0];
    if (!bestMatch) {
      throw new Error(`No valid template match found for entity: ${entity.name}`);
    }
    
    const modificationRequest: ModificationRequest = {
      template: bestMatch.template,
      entity,
      userPrompt: '',
      domain,
    };

    const result = await templateModifier.modifyTemplate(modificationRequest);

    return {
      filePath: `app/api/${entity.nameSlug}/route.ts`,
      fileType: 'api-route',
      entityName: entity.name,
      content: result.modifiedTemplate,
    };
  }

  /**
   * Check if template-based generation is available for an entity
   */
  canGenerate(entity: EntitySchema, domain?: string): boolean {
    const matches = templateRegistry.findMatchingTemplates(entity, domain);
    return matches.length > 0;
  }

  /**
   * Get available templates for an entity
   */
  getAvailableTemplates(entity: EntitySchema, domain?: string): TemplateMatch[] {
    return templateRegistry.findMatchingTemplates(entity, domain);
  }
}

export const templateBasedGenerator = new TemplateBasedGenerator();

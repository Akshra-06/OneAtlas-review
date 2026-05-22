/**
 * Template Modification Engine
 * Uses AI to modify templates based on user requirements
 */

import type { Template, TemplateMatch } from './template-registry';
import type { EntitySchema } from '@oneatlas/shared';
import { gateway, buildModificationPrompt, TEMPLATE_MODIFICATION_SYSTEM_PROMPT, contextEngine } from '@oneatlas/ai-engine';
import type { PromptContext } from '@oneatlas/ai-engine';
import { aiCache } from './ai-cache';
import { ErrorFactory, TemplateModificationError } from './errors';
import { modificationTelemetry, ModificationMetric } from './telemetry';
import { qualityScorer, QualityScore } from './quality-scorer';

export interface ModificationRequest {
  template: Template;
  entity: EntitySchema;
  userPrompt: string;
  domain?: string;
}

export interface ModificationResult {
  modifiedTemplate: string;
  modifications: Record<string, string>;
  confidence: number;
}

class TemplateModifier {
  /**
   * Modify a template based on entity schema and user prompt
   */
  async modifyTemplate(request: ModificationRequest): Promise<ModificationResult> {
    const startTime = Date.now();
    const { template, entity, userPrompt, domain } = request;

    // Extract placeholder values from entity
    const placeholderValues = this.extractPlaceholderValues(template, entity, domain);

    // Apply placeholder replacements
    let modifiedTemplate = template.template;

    for (const [placeholder, value] of Object.entries(placeholderValues)) {
      const regex = new RegExp(placeholder, 'g');
      modifiedTemplate = modifiedTemplate.replace(regex, value);
    }

    // AI-powered modifications for custom requirements
    const aiModifications = await this.applyAIModifications(
      modifiedTemplate,
      entity,
      userPrompt,
      domain,
    );

    // Record telemetry
    const duration = Date.now() - startTime;
    const metric: ModificationMetric = {
      timestamp: new Date().toISOString(),
      entityName: entity.name,
      domain: domain || 'generic',
      taskType: this.getTaskTypeFromTemplate(template.template),
      complexity: contextEngine.calculateComplexity(entity),
      cached: aiModifications.modifications.cached === 'true',
      success: aiModifications.confidence > 0.5,
      duration,
      provider: aiModifications.modifications.aiProvider as string,
      model: aiModifications.modifications.aiModel as string,
      confidence: aiModifications.confidence,
      errorCode: aiModifications.modifications.errorCode as string,
    };
    modificationTelemetry.record(metric);

    return {
      modifiedTemplate: aiModifications.modifiedTemplate,
      modifications: {
        ...placeholderValues,
        ...aiModifications.modifications,
      },
      confidence: aiModifications.confidence,
    };
  }

  /**
   * Extract placeholder values from entity schema
   */
  private extractPlaceholderValues(
    template: Template,
    entity: EntitySchema,
    domain?: string,
  ): Record<string, string> {
    const values: Record<string, string> = {
      '{{entityName}}': entity.name,
      '{{entityNameSlug}}': entity.nameSlug,
      '{{entityNamePlural}}': entity.namePlural,
    };

    // Extract field definitions based on template category
    if (template.category === 'validation') {
      values['{{fields}}'] = this.generateFieldDefinitions(entity, domain);
    }

    if (template.category === 'page') {
      values['{{formFields}}'] = this.generateFormFields(entity, domain);
    }

    if (template.category === 'api') {
      values['{{apiEndpoints}}'] = this.generateAPIEndpoints(entity);
    }

    return values;
  }

  /**
   * Generate field definitions for validation schemas
   */
  private generateFieldDefinitions(entity: EntitySchema, domain?: string): string {
    const EXCLUDED_FIELDS = ['id', 'createdAt', 'updatedAt', 'tenantId'];

    return entity.fields
      .filter((field) => !EXCLUDED_FIELDS.includes(field.name))
      .map((field) => {
        const fieldName = field.name;
        const schema = this.generateZodSchema(field, domain);
        const description = field.description
          ? ` // ${field.description}`
          : '';

        return `  ${fieldName}: ${schema},${description}`;
      })
      .join('\n');
  }

  /**
   * Generate Zod schema for a field
   */
  private generateZodSchema(field: any, domain?: string): string {
    let schema = this.getDefaultZodType(field);

    // Apply semantic validation
    if (field.prismaType === 'String') {
      if (field.semanticType === 'email') schema += '.email("Invalid email address")';
      if (field.semanticType === 'url') schema += '.url("Invalid URL")';
      if (field.semanticType === 'phone') {
        schema += '.regex(/^\\+?[1-9]\\d{1,14}$/, "Invalid phone number")';
      }
      if (field.minLength) schema += `.min(${field.minLength}, "Must be at least ${field.minLength} characters")`;
      if (field.maxLength) schema += `.max(${field.maxLength}, "Must be no more than ${field.maxLength} characters")`;
    }

    // Handle enum fields with domain-aware inference
    if (field.uiComponent && ['Select', 'Combobox', 'Radio'].includes(field.uiComponent)) {
      const enumValues = this.inferEnumValues(field, domain);
      if (enumValues && enumValues.length > 0) {
        schema = `z.enum([${enumValues.map((v) => `'${v}'`).join(', ')}])`;
      }
    }

    if (!field.isRequired || field.isNullable) schema += '.optional()';

    return schema;
  }

  /**
   * Get default Zod type for field
   */
  private getDefaultZodType(field: any): string {
    switch (field.prismaType) {
      case 'Int':
        return 'z.coerce.number().int()';
      case 'Float':
        return 'z.coerce.number()';
      case 'Boolean':
        return 'z.coerce.boolean()';
      case 'DateTime':
        return 'z.coerce.date()';
      case 'String[]':
        return 'z.array(z.string())';
      case 'Int[]':
        return 'z.array(z.coerce.number().int())';
      case 'Json':
        return 'z.unknown()';
      default:
        return 'z.string()';
    }
  }

  /**
   * Infer enum values based on field and domain
   */
  private inferEnumValues(field: any, domain?: string): string[] | undefined {
    const semanticType = field.semanticType || field.name;
    const entityName = field.entityName || '';

    if (domain === 'healthcare') {
      if (entityName.toLowerCase().includes('patient')) {
        if (semanticType === 'status') {
          return ['Active', 'Inactive', 'Deceased', 'Transferred', 'Discharged'];
        }
      }
      if (entityName.toLowerCase().includes('appointment')) {
        if (semanticType === 'status') {
          return ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show', 'Rescheduled'];
        }
        if (semanticType === 'reason') {
          return ['Consultation', 'Follow-up', 'Emergency', 'Routine Checkup', 'Surgery', 'Lab Work', 'Imaging', 'Vaccination'];
        }
      }
    }

    return undefined;
  }

  /**
   * Generate form fields for page templates
   */
  private generateFormFields(entity: EntitySchema, domain?: string): string {
    const EXCLUDED_FIELDS = ['id', 'createdAt', 'updatedAt', 'tenantId'];

    return entity.fields
      .filter((field) => !EXCLUDED_FIELDS.includes(field.name))
      .map((field) => this.generateFormField(field, domain))
      .join('\n');
  }

  /**
   * Generate a single form field
   */
  private generateFormField(field: any, domain?: string): string {
    const label = field.label || this.toTitleCase(field.name);
    const placeholder = field.placeholder || `Enter ${label.toLowerCase()}...`;

    return `
<div className="grid gap-2">
  <label className="text-sm font-medium">${label}</label>
  <Input
    type="${this.getInputType(field)}"
    {...register('${field.name}')}
    placeholder="${placeholder}"
  />
</div>`;
  }

  /**
   * Get input type for field
   */
  private getInputType(field: any): string {
    if (field.semanticType === 'email') return 'email';
    if (field.semanticType === 'password') return 'password';
    if (field.semanticType === 'url') return 'url';
    if (field.semanticType === 'phone') return 'tel';
    if (field.prismaType === 'DateTime') return 'date';
    if (field.prismaType === 'Int' || field.prismaType === 'Float') return 'number';
    return 'text';
  }

  /**
   * Generate API endpoints
   */
  private generateAPIEndpoints(entity: EntitySchema): string {
    return `
// GET /api/${entity.nameSlug}
// POST /api/${entity.nameSlug}
// GET /api/${entity.nameSlug}/[id]
// PUT /api/${entity.nameSlug}/[id]
// DELETE /api/${entity.nameSlug}/[id]`;
  }

  /**
   * Apply AI-powered modifications for custom requirements
   */
  private async applyAIModifications(
    template: string,
    entity: EntitySchema,
    userPrompt: string,
    domain?: string,
  ): Promise<{ modifiedTemplate: string; modifications: Record<string, string>; confidence: number }> {
    // If no user prompt, return template as-is
    if (!userPrompt || userPrompt.trim().length === 0) {
      return {
        modifiedTemplate: template,
        modifications: {},
        confidence: 0.8,
      };
    }

    try {
      // Build context-aware prompt
      const complexity = contextEngine.calculateComplexity(entity);
      const taskType = this.getTaskTypeFromTemplate(template);
      const context: PromptContext = {
        entity,
        domain: domain || 'generic',
        taskType,
        userPrompt,
        complexity,
      };

      // Check cache first
      const cached = aiCache.get(template, entity.name, userPrompt, domain || 'generic', taskType);
      if (cached) {
        console.log('[TemplateModifier] Using cached AI modification');
        return {
          modifiedTemplate: cached.response,
          modifications: {
            aiModified: 'true',
            cached: 'true',
            ...cached.metadata,
          },
          confidence: 0.95, // Higher confidence for cached responses
        };
      }

      // Generate context-aware prompt
      const promptTemplate = contextEngine.generatePrompt(context);
      
      // Optimize prompt for task type
      const optimizedPrompt = contextEngine.optimizePromptForTask(promptTemplate, context.taskType);
      
      // Inject entity context
      const enhancedUserPrompt = contextEngine.injectEntityContext(optimizedPrompt.user, entity);
      
      // Optimize context by field priority
      const prioritizedPrompt = contextEngine.optimizeContextByPriority(enhancedUserPrompt, entity);

      // Build the final modification prompt
      const modificationPrompt = buildModificationPrompt(template, entity, prioritizedPrompt, domain);
      
      // Call the AI gateway for modification
      const response = await gateway.complete({
        messages: [
          { role: 'system', content: optimizedPrompt.system },
          { role: 'user', content: modificationPrompt },
        ],
        tier: 'smart',
        temperature: 0.3, // Lower temperature for more deterministic modifications
        maxTokens: 4000,
      });

      // Validate the AI response
      const modifiedTemplate = this.validateModification(response.text, template);
      
      // Score the quality of the modification
      const qualityScore = qualityScorer.scoreModification(
        template,
        modifiedTemplate,
        entity.name,
        taskType,
      );
      
      // Cache the successful response
      aiCache.set(
        template,
        entity.name,
        userPrompt,
        domain || 'generic',
        taskType,
        modifiedTemplate,
        {
          provider: response.provider,
          model: response.model,
          complexity,
          taskType,
        },
      );
      
      return {
        modifiedTemplate,
        modifications: {
          aiModified: 'true',
          cached: 'false',
          aiProvider: response.provider,
          aiModel: response.model,
          complexity,
          taskType: context.taskType,
          qualityScore: qualityScore.overall.toString(),
          qualityDetails: JSON.stringify(qualityScore.details),
        },
        confidence: qualityScore.overall > 0.7 ? 0.9 : 0.8, // Adjust confidence based on quality
      };
    } catch (error) {
      console.error('[TemplateModifier] AI modification failed:', error);
      
      // Convert to specific error type
      let modificationError: TemplateModificationError;
      if (error instanceof Error) {
        modificationError = ErrorFactory.fromAIError(error, 'unknown');
      } else {
        modificationError = ErrorFactory.fromUnknownError(error);
      }
      
      // Fall back to original template if AI modification fails
      return {
        modifiedTemplate: template,
        modifications: {
          aiModified: 'false',
          errorCode: modificationError.code,
          errorMessage: modificationError.message,
          retryable: modificationError.retryable.toString(),
        },
        confidence: 0.5, // Lower confidence when AI fails
      };
    }
  }

  /**
   * Determine task type from template content
   */
  private getTaskTypeFromTemplate(template: string): 'validation' | 'page' | 'api' | 'component' | 'general' {
    if (template.includes('z.object') || template.includes('z.enum') || template.includes('validation')) {
      return 'validation';
    }
    if (template.includes('React') || template.includes('useState') || template.includes('useForm')) {
      return 'page';
    }
    if (template.includes('NextRequest') || template.includes('NextResponse') || template.includes('export async function')) {
      return 'api';
    }
    if (template.includes('export function') || template.includes('export const')) {
      return 'component';
    }
    return 'general';
  }

  /**
   * Validate AI modification to ensure it's valid code
   */
  private validateModification(modified: string, original: string): string {
    // Remove markdown code blocks if present
    let cleaned = modified.replace(/```typescript\n?/g, '').replace(/```\n?/g, '').trim();
    
    // If the response is empty or too short, return original
    if (cleaned.length < original.length * 0.5) {
      console.warn('[TemplateModifier] AI modification too short, using original');
      return original;
    }
    
    // Check if the modification contains basic structure
    if (!cleaned.includes('import') && !cleaned.includes('export')) {
      console.warn('[TemplateModifier] AI modification missing structure, using original');
      return original;
    }
    
    return cleaned;
  }

  /**
   * Convert string to title case
   */
  private toTitleCase(str: string): string {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (char) => char.toUpperCase())
      .trim();
  }
}

export const templateModifier = new TemplateModifier();

/**
 * Context-Aware Prompt Engineering System
 * Dynamic prompt generation based on context and requirements
 */

import type { EntitySchema } from '@oneatlas/shared';

export interface PromptContext {
  entity: EntitySchema;
  domain: string;
  taskType: 'validation' | 'page' | 'api' | 'component' | 'general';
  userPrompt?: string;
  complexity: 'simple' | 'medium' | 'complex';
  specialRequirements?: string[];
}

export interface PromptTemplate {
  system: string;
  user: string;
  context: string;
  examples?: string[];
}

export class ContextEngine {
  /**
   * Generate context-aware prompt based on entity and task
   */
  generatePrompt(context: PromptContext): PromptTemplate {
    const { entity, domain, taskType, userPrompt, complexity } = context;

    // Generate system prompt
    const systemPrompt = this.generateSystemPrompt(domain, taskType, complexity);

    // Generate context section
    const contextSection = this.generateContextSection(entity, domain, taskType);

    // Generate user prompt
    const userPromptSection = this.generateUserPromptSection(
      entity,
      domain,
      taskType,
      userPrompt,
      complexity,
    );

    // Get relevant examples
    const examples = this.getRelevantExamples(domain, taskType, entity.name);

    return {
      system: systemPrompt,
      user: userPromptSection,
      context: contextSection,
      examples,
    };
  }

  /**
   * Generate system prompt based on domain and task type
   */
  private generateSystemPrompt(
    domain: string,
    taskType: string,
    complexity: string,
  ): string {
    const basePrompt = `You are an expert code generation assistant specializing in ${domain} domain applications. Your task is to generate ${taskType} code that is production-ready, follows best practices, and meets the specified requirements.`;

    const complexityGuidance = this.getComplexityGuidance(complexity);
    const domainGuidance = this.getDomainGuidance(domain);
    const taskGuidance = this.getTaskGuidance(taskType);

    return `${basePrompt}\n\n${domainGuidance}\n\n${taskGuidance}\n\n${complexityGuidance}`;
  }

  /**
   * Generate context section with entity information
   */
  private generateContextSection(
    entity: EntitySchema,
    domain: string,
    taskType: string,
  ): string {
    const fieldsInfo = entity.fields
      .map((field) => {
        const type = field.prismaType;
        const required = field.isRequired ? 'required' : 'optional';
        const semantic = field.semanticType ? `(semantic: ${field.semanticType})` : '';
        return `- ${field.name}: ${type}, ${required} ${semantic}`;
      })
      .join('\n');

    return `## Entity Context
- Entity Name: ${entity.name}
- Domain: ${domain}
- Task Type: ${taskType}
- Total Fields: ${entity.fields.length}

## Field Definitions
${fieldsInfo}

## Entity Relationships
${entity.relations?.map((rel) => `- ${rel.fromEntity} ${rel.type} ${rel.toEntity}`).join('\n') || 'None'}`;
  }

  /**
   * Generate user prompt section
   */
  private generateUserPromptSection(
    entity: EntitySchema,
    domain: string,
    taskType: string,
    userPrompt?: string,
    complexity?: string,
  ): string {
    let prompt = `Generate ${taskType} code for the ${entity.name} entity in the ${domain} domain.\n\n`;

    if (userPrompt) {
      prompt += `## User Requirements\n${userPrompt}\n\n`;
    }

    prompt += `## Complexity Level\n${complexity || 'medium'}\n\n`;

    prompt += `## Instructions
1. Follow the entity schema exactly
2. Use appropriate TypeScript types
3. Include proper validation
4. Add helpful comments
5. Follow ${domain} domain best practices
6. Ensure code is production-ready`;

    return prompt;
  }

  /**
   * Get complexity-specific guidance
   */
  private getComplexityGuidance(complexity: string): string {
    switch (complexity) {
      case 'simple':
        return `## Complexity Guidelines (Simple)
- Focus on core functionality only
- Keep code minimal and straightforward
- Avoid unnecessary abstractions
- Use basic validation rules`;
      case 'medium':
        return `## Complexity Guidelines (Medium)
- Include standard features and validations
- Add appropriate error handling
- Use standard patterns and abstractions
- Include helpful documentation`;
      case 'complex':
        return `## Complexity Guidelines (Complex)
- Include advanced features and edge cases
- Add comprehensive error handling and logging
- Use sophisticated patterns and abstractions
- Include extensive documentation and examples
- Consider performance and scalability`;
      default:
        return `## Complexity Guidelines (Medium)
- Include standard features and validations
- Add appropriate error handling
- Use standard patterns and abstractions
- Include helpful documentation`;
    }
  }

  /**
   * Get domain-specific guidance
   */
  private getDomainGuidance(domain: string): string {
    const domainGuidance: Record<string, string> = {
      healthcare: `## Healthcare Domain Guidelines
- Follow HIPAA compliance where applicable
- Include proper patient data handling
- Add medical record security measures
- Use appropriate medical terminology
- Consider patient privacy in all features`,
      crm: `## CRM Domain Guidelines
- Focus on customer relationship management
- Include lead tracking and conversion
- Add sales pipeline features
- Use customer-centric terminology
- Consider data privacy regulations`,
      ecommerce: `## E-commerce Domain Guidelines
- Focus on product and order management
- Include inventory tracking
- Add payment processing considerations
- Use commerce-specific terminology
- Consider security for transactions`,
      finance: `## Finance Domain Guidelines
- Follow financial regulations and compliance
- Include proper audit trails
- Add transaction security measures
- Use financial terminology accurately
- Consider data integrity and accuracy`,
      project_management: `## Project Management Domain Guidelines
- Focus on task and workflow management
- Include timeline and resource tracking
- Add collaboration features
- Use project management terminology
- Consider team coordination needs`,
      generic: `## General Guidelines
- Follow industry best practices
- Include appropriate error handling
- Add helpful documentation
- Use clear and consistent naming
- Consider maintainability and scalability`,
    };

    const key = domain.toLowerCase();
    if (key in domainGuidance) {
      return domainGuidance[key] as string;
    }
    return domainGuidance.generic as string;
  }

  /**
   * Get task-specific guidance
   */
  private getTaskGuidance(taskType: string): string {
    const taskGuidance: Record<string, string> = {
      validation: `## Validation Schema Guidelines
- Use Zod for schema validation
- Include appropriate type constraints
- Add helpful error messages
- Consider field relationships
- Include custom validators where needed`,
      page: `## Page Component Guidelines
- Use React with TypeScript
- Include proper form validation
- Add responsive design
- Follow accessibility best practices
- Include loading and error states`,
      api: `## API Route Guidelines
- Use Next.js API routes
- Include proper error handling
- Add authentication/authorization
- Follow RESTful conventions
- Include request validation`,
      component: `## Component Guidelines
- Use React with TypeScript
- Make components reusable
- Include proper TypeScript types
- Add accessibility features
- Follow component composition patterns`,
      general: `## General Code Guidelines
- Write clean, maintainable code
- Include proper error handling
- Add helpful comments
- Follow TypeScript best practices
- Consider performance implications`,
    };

    const key = taskType.toLowerCase();
    if (key in taskGuidance) {
      return taskGuidance[key] as string;
    }
    return taskGuidance.general as string;
  }

  /**
   * Get relevant examples based on domain and task
   */
  private getRelevantExamples(domain: string, taskType: string, entityName: string): string[] {
    const examples: string[] = [];

    // Add domain-specific examples
    if (domain === 'healthcare' && taskType === 'validation') {
      examples.push(`// Example: Patient validation with healthcare-specific rules
export const PatientCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.coerce.date().max(new Date()),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  allergies: z.array(z.string()).optional(),
});`);
    }

    if (domain === 'crm' && taskType === 'validation') {
      examples.push(`// Example: Customer validation with CRM-specific rules
export const CustomerCreateSchema = z.object({
  email: z.string().email(),
  phone: z.string().regex(/^\\+?[1-9]\\d{1,14}$/),
  tier: z.enum(['Bronze', 'Silver', 'Gold', 'Platinum']).optional(),
  leadSource: z.enum(['Website', 'Referral', 'Social Media']).optional(),
});`);
    }

    return examples;
  }

  /**
   * Calculate complexity based on entity characteristics
   */
  calculateComplexity(entity: EntitySchema): 'simple' | 'medium' | 'complex' {
    const fieldCount = entity.fields.length;
    const relationCount = entity.relations?.length || 0;
    const hasComplexTypes = entity.fields.some(
      (field) => field.prismaType === 'Json' || field.prismaType === 'String[]',
    );

    if (fieldCount <= 5 && relationCount === 0 && !hasComplexTypes) {
      return 'simple';
    }

    if (fieldCount <= 15 && relationCount <= 3) {
      return 'medium';
    }

    return 'complex';
  }

  /**
   * Optimize prompt based on task type
   */
  optimizePromptForTask(prompt: PromptTemplate, taskType: string): PromptTemplate {
    const optimized = { ...prompt };

    switch (taskType) {
      case 'validation':
        optimized.system += '\n\nFocus on type safety and validation rules.';
        break;
      case 'page':
        optimized.system += '\n\nFocus on UX and accessibility.';
        break;
      case 'api':
        optimized.system += '\n\nFocus on security and error handling.';
        break;
      default:
        break;
    }

    return optimized;
  }

  /**
   * Inject context from entity schema
   */
  injectEntityContext(prompt: string, entity: EntitySchema): string {
    let enhanced = prompt;

    // Inject field-level context with descriptions
    entity.fields.forEach((field) => {
      if (field.description) {
        enhanced = enhanced.replace(
          new RegExp(`\\b${field.name}\\b`, 'g'),
          `${field.name} (${field.description})`,
        );
      }
    });

    // Inject semantic type information for better understanding
    entity.fields.forEach((field) => {
      if (field.semanticType && field.semanticType !== field.name) {
        enhanced = enhanced.replace(
          new RegExp(`\\b${field.name}\\b`, 'g'),
          `${field.name} [semantic: ${field.semanticType}]`,
        );
      }
    });

    // Inject UI component information for page generation
    entity.fields.forEach((field) => {
      if (field.uiComponent && field.uiComponent !== 'Input') {
        enhanced = enhanced.replace(
          new RegExp(`\\b${field.name}\\b`, 'g'),
          `${field.name} [UI: ${field.uiComponent}]`,
        );
      }
    });

    // Inject relationship information
    if (entity.relations && entity.relations.length > 0) {
      const relationContext = entity.relations
        .map((rel) => `${rel.fromEntity} ${rel.type} ${rel.toEntity}`)
        .join(', ');
      enhanced = enhanced.replace(
        /{{relations}}/g,
        relationContext,
      );
    }

    return enhanced;
  }

  /**
   * Extract key fields for context prioritization
   */
  private extractKeyFields(entity: EntitySchema): string[] {
    const keyFields: string[] = [];

    // Add required fields
    entity.fields
      .filter((field) => field.isRequired)
      .forEach((field) => keyFields.push(field.name));

    // Add fields with semantic types
    entity.fields
      .filter((field) => field.semanticType && field.semanticType !== field.name)
      .forEach((field) => keyFields.push(field.name));

    // Add fields with special UI components
    entity.fields
      .filter((field) => field.uiComponent && field.uiComponent !== 'Input')
      .forEach((field) => keyFields.push(field.name));

    // Add fields with descriptions
    entity.fields
      .filter((field) => field.description)
      .forEach((field) => keyFields.push(field.name));

    return [...new Set(keyFields)]; // Remove duplicates
  }

  /**
   * Generate field priority for context injection
   */
  private generateFieldPriority(entity: EntitySchema): Map<string, number> {
    const priority = new Map<string, number>();

    entity.fields.forEach((field) => {
      let score = 0;

      // Required fields get highest priority
      if (field.isRequired) score += 10;

      // Fields with semantic types get high priority
      if (field.semanticType && field.semanticType !== field.name) score += 8;

      // Fields with special UI components get medium priority
      if (field.uiComponent && field.uiComponent !== 'Input') score += 6;

      // Fields with descriptions get medium priority
      if (field.description) score += 5;

      // Fields with enum values get priority
      if (field.enumValues && field.enumValues.length > 0) score += 7;

      priority.set(field.name, score);
    });

    return priority;
  }

  /**
   * Optimize context based on field priority
   */
  optimizeContextByPriority(prompt: string, entity: EntitySchema): string {
    const priority = this.generateFieldPriority(entity);
    const keyFields = Array.from(priority.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // Top 10 priority fields
      .map(([name]) => name);

    // Add priority context section
    const priorityContext = `## Priority Fields
${keyFields.map((name) => `- ${name}`).join('\n')}`;

    return `${prompt}\n\n${priorityContext}`;
  }
}

export const contextEngine = new ContextEngine();

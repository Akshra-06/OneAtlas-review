import type {
  EntitySchema,
  FieldSchema,
  GeneratedFile,
} from '@oneatlas/shared';
import { enumRenderer } from '../shared/enum-renderer';
export interface TemplateBasedGeneratorInterface {
  canGenerate(entity: EntitySchema, domain: string): boolean;
  generateValidation(entity: EntitySchema, domain: string): Promise<GeneratedFile>;
}

let registeredTemplateGenerator: TemplateBasedGeneratorInterface | null = null;

export function registerTemplateGenerator(generator: TemplateBasedGeneratorInterface) {
  registeredTemplateGenerator = generator;
}

const EXCLUDED_FIELDS = ['id', 'createdAt', 'updatedAt', 'tenantId'];

/**
 * Infer domain from entity schema
 */
const inferDomainFromEntity = (entity: EntitySchema): string => {
  const entityName = entity.name.toLowerCase();
  
  if (entityName.includes('patient') || entityName.includes('doctor') || entityName.includes('medical') || entityName.includes('appointment')) return 'healthcare';
  if (entityName.includes('customer') || entityName.includes('lead') || entityName.includes('opportunity')) return 'crm';
  if (entityName.includes('order') || entityName.includes('product') || entityName.includes('cart')) return 'ecommerce';
  if (entityName.includes('candidate') || entityName.includes('job') || entityName.includes('application')) return 'ats';
  if (entityName.includes('invoice') || entityName.includes('payment') || entityName.includes('expense')) return 'finance';
  if (entityName.includes('shipment') || entityName.includes('delivery') || entityName.includes('logistics')) return 'logistics';
  if (entityName.includes('ticket') || entityName.includes('support') || entityName.includes('issue')) return 'support';
  if (entityName.includes('task') || entityName.includes('project') || entityName.includes('workflow')) return 'project_management';
  if (entityName.includes('course') || entityName.includes('student') || entityName.includes('enrollment')) return 'education';
  
  return 'generic';
};

/**
 * Map field to Zod validation schema with semantic intelligence
 */
const mapZodType = (field: FieldSchema, domain?: string, entityName?: string): string => {
  let schema: string;

  // Handle enum fields with semantic labels
  if (field.enumValues?.length) {
    const validation = enumRenderer.generateEnumValidation(field.enumValues);
    schema = validation;
  } else {
    // Infer enum values for select-like UI components if not provided
    if (field.uiComponent && ['Select', 'Combobox', 'Radio', 'Multiselect'].includes(field.uiComponent)) {
      const inferredValues = enumRenderer.inferEnumValuesFromSemantic(field.semanticType || field.name, domain, entityName);
      if (inferredValues && inferredValues.length > 0) {
        const validation = enumRenderer.generateEnumValidation(inferredValues);
        schema = validation;
      } else {
        schema = getDefaultZodType(field);
      }
    } else {
      schema = getDefaultZodType(field);
    }
  }

  // Apply semantic validation rules
  if (field.prismaType === 'String' && !field.enumValues?.length) {
    if (field.semanticType === 'email') schema += '.email("Invalid email address")';
    if (field.semanticType === 'url') schema += '.url("Invalid URL")';
    if (field.semanticType === 'phone') {
      schema += '.regex(/^\\+?[1-9]\\d{1,14}$/, "Invalid phone number")';
    }
    if (field.minLength) schema += `.min(${field.minLength}, "Must be at least ${field.minLength} characters")`;
    if (field.maxLength) schema += `.max(${field.maxLength}, "Must be no more than ${field.maxLength} characters")`;
  }

  if (!field.isRequired || field.isNullable) schema += '.optional()';

  return schema;
};

/**
 * Get default Zod type for field
 */
const getDefaultZodType = (field: FieldSchema): string => {
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
};

/**
 * Build Zod schema shape from fields
 */
const buildShape = (entity: EntitySchema, domain?: string): string => {
  return entity.fields
    .filter((field) => !EXCLUDED_FIELDS.includes(field.name))
    .map((field) => {
      const fieldName = field.name;
      const schema = mapZodType(field, domain, entity.name);
      const description = field.description
        ? ` // ${field.description}`
        : '';

      return `  ${fieldName}: ${schema},${description}`;
    })
    .join('\n');
};

export const generateValidationModule = async (
  entity: EntitySchema,
  domain?: string,
): Promise<GeneratedFile> => {
  const inferredDomain = domain || inferDomainFromEntity(entity);
  
  // Try to use template-based generation first
  if (registeredTemplateGenerator && registeredTemplateGenerator.canGenerate(entity, inferredDomain)) {
    try {
      return await registeredTemplateGenerator.generateValidation(entity, inferredDomain);
    } catch (error) {
      // Fall back to traditional generation if template fails
      console.warn(`Template generation failed for ${entity.name}, falling back to traditional generation`, error);
    }
  }
  
  // Traditional generation fallback
  const shape = buildShape(entity, inferredDomain);

  return {
    filePath: `lib/validations/${entity.nameSlug}.ts`,
    fileType: 'config',
    entityName: entity.name,
    content: `import { z } from 'zod';

/**
 * Validation schema for ${entity.name}
 * Auto-generated with semantic intelligence
 */

export const ${entity.name}CreateSchema = z.object({
${shape}
});

export const ${entity.name}UpdateSchema = ${entity.name}CreateSchema.partial();

export type ${entity.name}CreateInput = z.infer<typeof ${entity.name}CreateSchema>;
export type ${entity.name}UpdateInput = z.infer<typeof ${entity.name}UpdateSchema>;

/**
 * Helper to validate ${entity.name} data
 */
export async function validate${entity.name}(data: unknown) {
  try {
    return await ${entity.name}CreateSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }
    throw error;
  }
}
`,
  };
};

export const validationGenerator = {
  generate: generateValidationModule,
};

export default validationGenerator;

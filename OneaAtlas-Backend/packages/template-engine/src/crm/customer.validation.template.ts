/**
 * Customer Validation Template
 * Base template for CRM customer entity validation schemas
 */

import { templateRegistry } from '../template-registry';
import type { EntitySchema } from '@oneatlas/shared';

const customerValidationTemplate = `import { z } from 'zod';

/**
 * Validation schema for {{entityName}}
 * Auto-generated with semantic intelligence
 */

export const {{entityName}}CreateSchema = z.object({
  {{fields}}
});

export const {{entityName}}UpdateSchema = {{entityName}}CreateSchema.partial();

export type {{entityName}}CreateInput = z.infer<typeof {{entityName}}CreateSchema>;
export type {{entityName}}UpdateInput = z.infer<typeof {{entityName}}UpdateSchema>;

/**
 * Helper to validate {{entityName}} data
 */
export async function validate{{entityName}}(data: unknown) {
  try {
    return await {{entityName}}CreateSchema.parseAsync(data);
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
`;

templateRegistry.register({
  id: 'crm-customer-validation',
  name: 'Customer Validation',
  description: 'Validation schema template for CRM customer entities',
  category: 'validation',
  domain: 'crm',
  applicableTo: (entity: EntitySchema) => {
    const entityName = entity.name.toLowerCase();
    return entityName.includes('customer');
  },
  template: customerValidationTemplate,
  placeholders: {
    entityName: '{{entityName}}',
    fields: '{{fields}}',
  },
});

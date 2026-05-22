import type { Entity, EntityAttribute } from '@oneatlas/shared';

import type {
  FieldSchema,
  PrismaFieldType,
  UIComponentType,
} from '@oneatlas/shared';
import { fieldSemantics } from '../shared/field-semantics';
import { uxCopy } from '../shared/ux-copy.helper';
import { enumRenderer } from '../shared/enum-renderer';

const BASE_FIELDS: FieldSchema[] = [
  {
    name: 'id',
    prismaType: 'String',
    isRequired: true,
    isId: true,
    defaultValue: 'cuid()',
    uiComponent: 'Input',
    label: 'ID',
    placeholder: 'Auto-generated',
  },
  {
    name: 'createdAt',
    prismaType: 'DateTime',
    isRequired: true,
    defaultValue: 'now()',
    uiComponent: 'DatePicker',
    label: 'Created At',
    placeholder: 'Auto-generated',
  },
  {
    name: 'updatedAt',
    prismaType: 'DateTime',
    isRequired: true,
    uiComponent: 'DatePicker',
    label: 'Updated At',
    placeholder: 'Auto-generated',
  },
  {
    name: 'tenantId',
    prismaType: 'String',
    isRequired: true,
    uiComponent: 'Input',
    label: 'Tenant ID',
    placeholder: 'Auto-generated',
  },
];

const BUSINESS_DEFAULT_FIELDS: Record<string, string[]> = {
  product: ['sku', 'name', 'description', 'quantity', 'reorderPoint', 'price', 'status'],
  inventory: ['sku', 'name', 'quantity', 'reorderPoint', 'location', 'status'],
  warehouse: ['name', 'code', 'address', 'capacity', 'status'],
  lead: ['name', 'email', 'company', 'stage', 'value', 'status'],
  contact: ['name', 'email', 'phone', 'company', 'status'],
  task: ['title', 'description', 'priority', 'status', 'dueDate'],
  project: ['name', 'description', 'status', 'startDate', 'endDate'],
};

/**
 * Build field schema with semantic intelligence
 * Uses field name patterns and explicit semantic metadata
 */
function buildFieldSchema(
  fieldName: string,
  attribute?: EntityAttribute,
): FieldSchema {
  // Create a temporary attribute for analysis if not provided
  const attr: EntityAttribute = attribute || {
    name: fieldName,
    type: 'string',
    isRequired: true,
  };

  // Analyze semantic type and component
  const analysis = fieldSemantics.analyze(attr);

  // Generate UX copy
  const copy = uxCopy.generateCopyForField(fieldName, analysis.semanticType);

  // Handle enums intelligently
  let enumValues = attr.enumValues;
  if (!enumValues && analysis.isEnumField && analysis.semanticType) {
    enumValues = enumRenderer.inferEnumValuesFromSemantic(analysis.semanticType);
  }

  // Determine validation rules
  const validationRules = fieldSemantics.getValidationRules(attr);

  // Build the field schema with semantic metadata
  const schema: FieldSchema = {
    name: fieldName,
    prismaType: analysis.prismaType as PrismaFieldType,
    uiComponent: analysis.uiComponent,
    isRequired: attr.isRequired ?? true,
    isUnique: /email/i.test(fieldName) || attr.validation?.pattern === 'unique',
    minLength: attr.validation?.minLength ?? (analysis.prismaType === 'String' ? 1 : undefined),
    maxLength:
      attr.validation?.maxLength ??
      (/description|notes|content|body/i.test(fieldName) ? 2000 : undefined),
    enumValues,
    // NEW: Semantic metadata
    semanticType: analysis.semanticType,
    label: copy.label,
    placeholder: copy.placeholder,
    helperText: copy.helperText || uxCopy.generateHelperText(copy.label, analysis.semanticType),
    description: attr.helperText || uxCopy.generateFieldDescription(fieldName),
  };

  return schema;
}

/**
 * Generate fields for an entity using semantic analysis
 */
export function generateFields(entity: Entity): FieldSchema[] {
  const entityKey = entity.name.toLowerCase();
  const inferredDefaults = Object.entries(BUSINESS_DEFAULT_FIELDS)
    .find(([pattern]) => entityKey.includes(pattern))?.[1] ?? [];

  // Collect field definitions with semantic metadata
  const fieldDefinitions: Array<{ name: string; attribute?: EntityAttribute }> = [];

  // Add from entity.attributes (these have semantic metadata)
  if (entity.attributes) {
    for (const attr of entity.attributes) {
      fieldDefinitions.push({
        name: attr.name,
        attribute: attr,
      });
    }
  }

  // Add from entity.fields (simple names)
  if (entity.fields) {
    for (const fieldName of entity.fields) {
      if (!fieldDefinitions.some((f) => f.name === fieldName)) {
        fieldDefinitions.push({ name: fieldName });
      }
    }
  }

  // Add inferred defaults
  for (const fieldName of inferredDefaults) {
    if (!fieldDefinitions.some((f) => f.name === fieldName)) {
      fieldDefinitions.push({ name: fieldName });
    }
  }

  // Filter out system fields and convert to FieldSchema
  const generatedFields = fieldDefinitions
    .filter((f) => !BASE_FIELDS.some((bf) => bf.name === f.name))
    .map((f) => buildFieldSchema(f.name, f.attribute));

  return [...BASE_FIELDS, ...generatedFields];
}

export default generateFields;

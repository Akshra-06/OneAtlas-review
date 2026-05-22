/**
 * Field Semantics Intelligence Layer
 * Maps field characteristics to semantic types and UI components
 */

import type { EntityAttribute } from '@oneatlas/shared';
import type { UIComponentType } from '@oneatlas/shared';

interface SemanticAnalysis {
  semanticType: EntityAttribute['semanticType'];
  uiComponent: UIComponentType;
  prismaType: string;
  isEnumField: boolean;
  isRelation: boolean;
}

/**
 * Pattern-based semantic detection rules
 */
const SEMANTIC_RULES = [
  {
    patterns: [/^email/i, /@/],
    semanticType: 'email' as const,
    uiComponent: 'Input' as const,
    prismaType: 'String',
  },
  {
    patterns: [/password/i, /secret/i],
    semanticType: 'password' as const,
    uiComponent: 'Input' as const,
    prismaType: 'String',
  },
  {
    patterns: [/^url/i, /^website/i, /^link/i, /https?:/],
    semanticType: 'url' as const,
    uiComponent: 'Input' as const,
    prismaType: 'String',
  },
  {
    patterns: [/phone/i, /mobile/i, /telephone/i, /^\+?1?\d{10,}/],
    semanticType: 'phone' as const,
    uiComponent: 'Input' as const,
    prismaType: 'String',
  },
  {
    patterns: [/^date$/i, /date$/i, /^birthDate/i, /releaseDate/i],
    semanticType: 'date' as const,
    uiComponent: 'DatePicker' as const,
    prismaType: 'DateTime',
  },
  {
    patterns: [/datetime/i, /timestamp/i, /^createdAt/i, /^updatedAt/i, /At$/],
    semanticType: 'datetime' as const,
    uiComponent: 'DatePicker' as const,
    prismaType: 'DateTime',
  },
  {
    patterns: [/price/i, /amount/i, /salary/i, /cost/i, /revenue/i, /budget/i],
    semanticType: 'currency' as const,
    uiComponent: 'NumberInput' as const,
    prismaType: 'Float',
  },
  {
    patterns: [/status/i, /state/i, /stage/i],
    semanticType: 'status' as const,
    uiComponent: 'Select' as const,
    prismaType: 'String',
  },
  {
    patterns: [/priority/i, /severity/i, /level/i],
    semanticType: 'priority' as const,
    uiComponent: 'Select' as const,
    prismaType: 'String',
  },
  {
    patterns: [/description/i, /notes/i, /bio/i, /content/i, /body/i, /comment/i],
    semanticType: 'description' as const,
    uiComponent: 'Textarea' as const,
    prismaType: 'String',
  },
  {
    patterns: [/^is[A-Z]/, /^is[a-z]/, /^active$/i, /^enabled$/i, /^published$/i],
    semanticType: 'boolean' as const,
    uiComponent: 'Switch' as const,
    prismaType: 'Boolean',
  },
  {
    patterns: [/count/i, /quantity/i, /age/i, /year/i, /reorder/i, /threshold/i, /capacity/i],
    semanticType: 'generic' as const,
    uiComponent: 'NumberInput' as const,
    prismaType: 'Int',
  },
];

/**
 * Analyze a field and determine its semantic type and UI component
 */
export function analyzeFieldSemantics(attribute: EntityAttribute): SemanticAnalysis {
  // If explicit semantic type is provided, use it
  if (attribute.semanticType) {
    return {
      semanticType: attribute.semanticType,
      uiComponent: mapSemanticToComponent(attribute.semanticType),
      prismaType: mapSemanticToPrisma(attribute.semanticType),
      isEnumField: !!attribute.enumValues?.length,
      isRelation: false,
    };
  }

  // Check enum values first (indicates categorical field)
  if (attribute.enumValues?.length) {
    return {
      semanticType: detectSemanticFromName(attribute.name),
      uiComponent: 'Select',
      prismaType: 'String',
      isEnumField: true,
      isRelation: false,
    };
  }

  // Pattern-based detection
  for (const rule of SEMANTIC_RULES) {
    const matched = rule.patterns.some((pattern) =>
      pattern.test(attribute.name) || pattern.test(attribute.type),
    );

    if (matched) {
      return {
        semanticType: rule.semanticType,
        uiComponent: rule.uiComponent,
        prismaType: rule.prismaType,
        isEnumField: false,
        isRelation: false,
      };
    }
  }

  // Default fallback
  return {
    semanticType: 'generic',
    uiComponent: 'Input',
    prismaType: mapTypeToPrisma(attribute.type),
    isEnumField: false,
    isRelation: false,
  };
}

/**
 * Detect semantic type from field name alone
 */
function detectSemanticFromName(name: string): EntityAttribute['semanticType'] {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('email')) return 'email';
  if (lowerName.includes('password')) return 'password';
  if (lowerName.includes('url') || lowerName.includes('website')) return 'url';
  if (lowerName.includes('phone')) return 'phone';
  if (lowerName.includes('price') || lowerName.includes('amount')) return 'currency';
  if (lowerName.includes('date') && !lowerName.includes('datetime')) return 'date';
  if (lowerName.includes('datetime') || lowerName.includes('timestamp')) return 'datetime';
  if (lowerName.includes('status')) return 'status';
  if (lowerName.includes('priority')) return 'priority';
  if (lowerName.includes('description') || lowerName.includes('content')) return 'description';
  if (lowerName.startsWith('is')) return 'boolean';

  return 'generic';
}

/**
 * Map semantic type to UI component
 */
function mapSemanticToComponent(
  semanticType: EntityAttribute['semanticType'],
): UIComponentType {
  const mapping: Record<NonNullable<EntityAttribute['semanticType']>, UIComponentType> = {
    email: 'Input',
    password: 'Input',
    url: 'Input',
    phone: 'Input',
    date: 'DatePicker',
    datetime: 'DatePicker',
    currency: 'NumberInput',
    status: 'Select',
    priority: 'Select',
    description: 'Textarea',
    boolean: 'Switch',
    relation: 'Combobox',
    generic: 'Input',
  };

  return mapping[(semanticType ?? 'generic') as NonNullable<EntityAttribute['semanticType']>] || 'Input';
}

/**
 * Map semantic type to Prisma type
 */
function mapSemanticToPrisma(semanticType: EntityAttribute['semanticType']): string {
  const mapping: Record<NonNullable<EntityAttribute['semanticType']>, string> = {
    email: 'String',
    password: 'String',
    url: 'String',
    phone: 'String',
    date: 'DateTime',
    datetime: 'DateTime',
    currency: 'Float',
    status: 'String',
    priority: 'String',
    description: 'String',
    boolean: 'Boolean',
    relation: 'String',
    generic: 'String',
  };

  return mapping[(semanticType ?? 'generic') as NonNullable<EntityAttribute['semanticType']>] || 'String';
}

/**
 * Map raw type string to Prisma type
 */
function mapTypeToPrisma(type: string): string {
  const lowerType = type.toLowerCase();

  if (lowerType.includes('int') || lowerType.includes('integer')) return 'Int';
  if (lowerType.includes('float') || lowerType.includes('decimal')) return 'Float';
  if (lowerType.includes('bool') || lowerType.includes('checkbox')) return 'Boolean';
  if (lowerType.includes('date') || lowerType.includes('timestamp')) return 'DateTime';
  if (lowerType.includes('json')) return 'Json';
  if (lowerType.includes('string[]') || lowerType.includes('array')) return 'String[]';

  return 'String';
}

/**
 * Get HTML input type for a field
 */
export function getInputType(attribute: EntityAttribute): string {
  const analysis = analyzeFieldSemantics(attribute);

  const inputTypeMap: Record<UIComponentType, string> = {
    Input: 'text',
    Textarea: 'textarea',
    Switch: 'checkbox',
    DatePicker: 'date',
    NumberInput: 'number',
    Select: 'select',
    Combobox: 'combobox',
    Checkbox: 'checkbox',
    Radio: 'radio',
    Multiselect: 'select',
  };

  return inputTypeMap[analysis.uiComponent] || 'text';
}

/**
 * Determine if a field needs special validation
 */
export function getValidationRules(attribute: EntityAttribute): {
  type: string;
  rules: string[];
} {
  const analysis = analyzeFieldSemantics(attribute);
  const rules: string[] = [];

  if (attribute.isRequired) rules.push('required');

  if (analysis.semanticType === 'email') rules.push('email');
  if (analysis.semanticType === 'url') rules.push('url');
  if (analysis.semanticType === 'phone') rules.push('minLength:10');

  if (attribute.validation?.minLength) {
    rules.push(`minLength:${attribute.validation.minLength}`);
  }
  if (attribute.validation?.maxLength) {
    rules.push(`maxLength:${attribute.validation.maxLength}`);
  }

  if (attribute.enumValues?.length) {
    rules.push(`enum:${attribute.enumValues.join(',')}`);
  }

  return {
    type: analysis.semanticType || 'generic',
    rules,
  };
}

export const fieldSemantics = {
  analyze: analyzeFieldSemantics,
  getInputType,
  getValidationRules,
  detectSemantic: detectSemanticFromName,
};

/**
 * Enum Renderer Intelligence
 * Converts enum values into semantic UI options with proper labels
 */

interface EnumOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
}

/**
 * Semantic enum mappings for common business enums
 */
const SEMANTIC_ENUM_LABELS: Record<string, Record<string, string>> = {
  status: {
    draft: 'Draft',
    active: 'Active',
    inactive: 'Inactive',
    archived: 'Archived',
    published: 'Published',
    unpublished: 'Unpublished',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    suspended: 'Suspended',
  },
  priority: {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
    critical: 'Critical',
  },
  stage: {
    new: 'New',
    qualified: 'Qualified',
    negotiation: 'Negotiation',
    decision: 'Decision',
    closed: 'Closed',
  },
  type: {
    individual: 'Individual',
    business: 'Business',
    nonprofit: 'Non-profit',
    government: 'Government',
  },
  role: {
    admin: 'Administrator',
    user: 'User',
    guest: 'Guest',
    editor: 'Editor',
    viewer: 'Viewer',
    moderator: 'Moderator',
  },
  category: {
    product: 'Product',
    service: 'Service',
    digital: 'Digital',
    physical: 'Physical',
    bundle: 'Bundle',
  },
};

const SEMANTIC_ENUM_DESCRIPTIONS: Record<string, Record<string, string>> = {
  status: {
    draft: 'Not yet published or finalized',
    active: 'Currently in use',
    inactive: 'No longer active',
    archived: 'Stored for historical reference',
    published: 'Available to users',
    pending: 'Awaiting approval',
    approved: 'Verified and confirmed',
    rejected: 'Not approved',
    cancelled: 'Terminated',
  },
  priority: {
    low: 'Can wait',
    medium: 'Normal priority',
    high: 'Should be addressed soon',
    urgent: 'Requires immediate attention',
    critical: 'Must be addressed immediately',
  },
};

/**
 * Convert enum values to labeled options
 */
export function renderEnumOptions(
  enumValues: string[],
  fieldName: string,
): EnumOption[] {
  const lowerFieldName = fieldName.toLowerCase();

  return enumValues.map((value) => {
    const lowerValue = value.toLowerCase();

    // Check semantic mappings
    for (const [enumType, labels] of Object.entries(SEMANTIC_ENUM_LABELS)) {
      if (lowerFieldName.includes(enumType) && labels[lowerValue]) {
        return {
          value,
          label: labels[lowerValue],
          description: SEMANTIC_ENUM_DESCRIPTIONS[enumType]?.[lowerValue],
        };
      }
    }

    // Convert enum value to label (e.g., "order_pending" -> "Order Pending")
    return {
      value,
      label: convertEnumValueToLabel(value),
    };
  });
}

/**
 * Convert raw enum value to human-readable label
 */
function convertEnumValueToLabel(value: string): string {
  return value
    .replace(/[-_]/g, ' ')
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generate JSX for React Select component with semantic options
 */
export function generateSelectOptions(
  enumValues: string[],
  fieldName: string,
): string {
  const options = renderEnumOptions(enumValues, fieldName);

  return options
    .map((option) => `<SelectItem value="${option.value}">${option.label}</SelectItem>`)
    .join('\n');
}

/**
 * Generate HTML option elements
 */
export function generateHtmlOptions(
  enumValues: string[],
  fieldName: string,
): string {
  const options = renderEnumOptions(enumValues, fieldName);

  return options
    .map((option) => `<option value="${option.value}">${option.label}</option>`)
    .join('\n');
}

/**
 * Get best option variant based on count
 */
export function selectComponentType(
  enumCount: number,
): 'Select' | 'Radio' | 'Combobox' | 'Tabs' {
  if (enumCount <= 3) return 'Radio';
  if (enumCount <= 6) return 'Select';
  if (enumCount <= 12) return 'Combobox';
  return 'Combobox';
}

/**
 * Generate validation schema for enum field
 */
export function generateEnumValidation(enumValues: string[]): string {
  const escapedValues = enumValues.map((v) => `'${v.replace(/'/g, "\\'")}'`).join(', ');
  return `z.enum([${escapedValues}])`;
}

/**
 * Infer enum values from field semantics if not explicitly provided
 * Enhanced with domain-specific enum values
 */
export function inferEnumValuesFromSemantic(
  semanticType: string,
  domain?: string,
  entityName?: string,
): string[] | undefined {
  const inferred: Record<string, string[]> = {
    status: ['draft', 'active', 'archived'],
    priority: ['low', 'medium', 'high'],
    boolean: ['true', 'false'],
    role: ['admin', 'user', 'guest'],
    category: ['product', 'service'],
  };

  // Domain-specific enum values with entity context
  const domainSpecific: Record<string, Record<string, string[]>> = {
    healthcare: {
      // Patient-specific statuses
      patientStatus: ['Active', 'Inactive', 'Deceased', 'Transferred', 'Discharged'],
      // Appointment-specific statuses
      appointmentStatus: ['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show', 'Rescheduled'],
      // Doctor-specific statuses
      doctorStatus: ['Active', 'On Leave', 'Retired', 'Suspended'],
      // Generic healthcare statuses (fallback)
      status: ['Active', 'Inactive', 'Archived'],
      // Appointment reasons
      reason: ['Consultation', 'Follow-up', 'Emergency', 'Routine Checkup', 'Surgery', 'Lab Work', 'Imaging', 'Vaccination'],
      // Healthcare priority
      priority: ['Low', 'Medium', 'High', 'Urgent', 'Critical'],
    },
    crm: {
      status: ['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'],
      priority: ['Low', 'Medium', 'High', 'Critical'],
      stage: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed'],
    },
    ecommerce: {
      status: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
      priority: ['Low', 'Medium', 'High', 'Urgent'],
    },
    project_management: {
      status: ['Todo', 'In Progress', 'In Review', 'Done', 'Blocked'],
      priority: ['Low', 'Medium', 'High', 'Critical'],
    },
  };

  // Check domain-specific enums first
  if (domain && domainSpecific[domain]) {
    const domainEnums = domainSpecific[domain];
    
    // Entity-specific enum inference
    if (entityName) {
      const entityLower = entityName.toLowerCase();
      
      // Patient entity specific
      if (entityLower.includes('patient')) {
        if (semanticType === 'status' || semanticType === 'patientstatus') {
          return domainEnums.patientStatus;
        }
      }
      
      // Appointment entity specific
      if (entityLower.includes('appointment')) {
        if (semanticType === 'status' || semanticType === 'appointmentstatus') {
          return domainEnums.appointmentStatus;
        }
      }
      
      // Doctor entity specific
      if (entityLower.includes('doctor')) {
        if (semanticType === 'status' || semanticType === 'doctorstatus') {
          return domainEnums.doctorStatus;
        }
      }
    }
    
    // Check for exact semantic type match
    if (domainEnums[semanticType]) {
      return domainEnums[semanticType];
    }
    
    // Also check for partial matches (e.g., 'status' matches 'appointmentStatus')
    for (const [key, values] of Object.entries(domainEnums)) {
      if (semanticType.includes(key) || key.includes(semanticType)) {
        return values;
      }
    }
  }

  return inferred[semanticType];
}

/**
 * Create a smart enum field with context awareness
 */
export function createSmartEnum(
  enumValues: string[] | undefined,
  fieldName: string,
  semanticType?: string,
  domain?: string,
  entityName?: string,
): {
  values: string[];
  labels: Record<string, string>;
  component: 'Select' | 'Radio' | 'Combobox' | 'Tabs';
  hasDescriptions: boolean;
} {
  let finalValues = enumValues;

  if (!finalValues || finalValues.length === 0) {
    finalValues = inferEnumValuesFromSemantic(semanticType || '', domain, entityName) || [];
  }

  const options = renderEnumOptions(finalValues, fieldName);
  const labels = Object.fromEntries(
    options.map((opt) => [opt.value, opt.label]),
  );

  return {
    values: finalValues,
    labels,
    component: selectComponentType(finalValues.length),
    hasDescriptions: options.some((opt) => opt.description),
  };
}

/**
 * Generate Zod union type for enum validation
 */
export function generateZodEnumUnion(enumValues: string[]): string {
  const unionValues = enumValues
    .map((v) => `"${v}"`)
    .join(' | ');
  return unionValues;
}

export const enumRenderer = {
  renderEnumOptions,
  generateSelectOptions,
  generateHtmlOptions,
  selectComponentType,
  generateEnumValidation,
  inferEnumValuesFromSemantic,
  createSmartEnum,
  generateZodEnumUnion,
};

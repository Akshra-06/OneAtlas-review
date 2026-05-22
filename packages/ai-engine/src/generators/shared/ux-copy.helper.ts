/**
 * UX Copy Intelligence Helper
 * Generates human-friendly labels, placeholders, and helper text from field names
 */

interface CopySet {
  label: string;
  placeholder: string;
  helperText?: string;
  buttonText?: string;
  emptyState?: string;
}

/**
 * Convert camelCase/kebab-case to Title Case
 */
function toTitleCase(text: string): string {
  return text
    .replace(/([A-Z])/g, ' $1') // Add space before capitals
    .replace(/[-_]/g, ' ') // Replace dashes/underscores with spaces
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generate semantic copy for common field types
 */
const SEMANTIC_COPY: Record<string, Partial<CopySet>> = {
  email: {
    label: 'Email',
    placeholder: 'Enter your email address',
    helperText: "We'll use this to contact you",
  },
  password: {
    label: 'Password',
    placeholder: 'Create a secure password',
    helperText: 'At least 8 characters, including uppercase and numbers',
  },
  phone: {
    label: 'Phone Number',
    placeholder: '+1 (555) 000-0000',
    helperText: 'Used for account recovery',
  },
  url: {
    label: 'Website',
    placeholder: 'https://example.com',
    helperText: 'Including http:// or https://',
  },
  price: {
    label: 'Price',
    placeholder: '0.00',
    helperText: 'In USD',
  },
  quantity: {
    label: 'Quantity',
    placeholder: '1',
    helperText: 'Number of units',
  },
  date: {
    label: 'Date',
    placeholder: 'Select a date',
  },
  status: {
    label: 'Status',
    placeholder: 'Select a status',
    helperText: 'Current state of this item',
  },
  priority: {
    label: 'Priority',
    placeholder: 'Select priority level',
    helperText: 'Urgency level',
  },
  description: {
    label: 'Description',
    placeholder: 'Enter a description...',
    helperText: 'Provide details',
  },
  notes: {
    label: 'Notes',
    placeholder: 'Add any additional notes...',
  },
  name: {
    label: 'Name',
    placeholder: 'Enter name',
  },
  title: {
    label: 'Title',
    placeholder: 'Enter title',
  },
  company: {
    label: 'Company',
    placeholder: 'Enter company name',
  },
  address: {
    label: 'Address',
    placeholder: 'Street address',
  },
};

/**
 * Generate a copy set for a field name
 */
export function generateCopyForField(
  fieldName: string,
  semanticType?: string,
): CopySet {
  const lowerName = fieldName.toLowerCase();

  // Check semantic type mapping first
  if (semanticType) {
    const semanticCopy = SEMANTIC_COPY[semanticType];
    if (semanticCopy) {
      return {
        label: semanticCopy.label || toTitleCase(fieldName),
        placeholder: semanticCopy.placeholder || '',
        helperText: semanticCopy.helperText,
      };
    }
  }

  // Check field name patterns
  for (const [pattern, copy] of Object.entries(SEMANTIC_COPY)) {
    if (lowerName.includes(pattern)) {
      return {
        label: copy.label || toTitleCase(fieldName),
        placeholder: copy.placeholder || '',
        helperText: copy.helperText,
      };
    }
  }

  // Fallback to title case
  return {
    label: toTitleCase(fieldName),
    placeholder: `Enter ${toTitleCase(fieldName).toLowerCase()}...`,
  };
}

/**
 * Generate button text based on action and entity
 */
export function generateButtonText(
  action: 'create' | 'update' | 'delete' | 'save' | 'cancel' | 'submit',
  entityName?: string,
): string {
  const entity = entityName ? ` ${entityName}` : '';

  const texts: Record<string, string> = {
    create: `Create${entity}`,
    update: `Update${entity}`,
    delete: `Delete${entity}`,
    save: `Save${entity}`,
    cancel: 'Cancel',
    submit: `Submit${entity}`,
  };

  return texts[action] || 'Submit';
}

/**
 * Generate empty state message
 */
export function generateEmptyStateMessage(
  entityName: string,
  action: 'no-data' | 'no-results' | 'no-access',
): string {
  const messages: Record<string, string> = {
    'no-data': `No ${entityName.toLowerCase()} yet. Create your first one to get started.`,
    'no-results': `No matching ${entityName.toLowerCase()} found. Try adjusting your filters.`,
    'no-access': `You don't have access to any ${entityName.toLowerCase()}.`,
  };

  return messages[action] || `No ${entityName.toLowerCase()} available.`;
}

/**
 * Generate validation error messages
 */
export function generateValidationError(
  fieldLabel: string,
  errorType: 'required' | 'invalid' | 'minLength' | 'maxLength' | 'pattern',
  details?: string,
): string {
  const messages: Record<string, string> = {
    required: `${fieldLabel} is required`,
    invalid: `${fieldLabel} is not valid`,
    minLength: `${fieldLabel} must be at least ${details || '3'} characters`,
    maxLength: `${fieldLabel} must be no more than ${details || '100'} characters`,
    pattern: `${fieldLabel} does not match the required format`,
  };

  return messages[errorType] || `Invalid ${fieldLabel}`;
}

/**
 * Generate contextual help text
 */
export function generateHelperText(
  fieldLabel: string,
  semanticType?: string,
): string | undefined {
  const helpers: Record<string, string> = {
    email: 'We use this to send you updates and recover your account',
    password: 'Keep it secure and unique',
    phone: 'Used for account recovery and notifications',
    status: 'Controls visibility and workflow state',
    priority: 'Determines urgency in task lists',
    date: 'Use YYYY-MM-DD format',
    currency: 'Amount in USD',
  };

  if (semanticType && helpers[semanticType]) {
    return helpers[semanticType];
  }

  return undefined;
}

/**
 * Generate onboarding/setup copy
 */
export function generateOnboardingCopy(step: number, totalSteps: number): {
  title: string;
  subtitle: string;
} {
  const copies = [
    {
      title: 'Welcome',
      subtitle: 'Let\'s set up your application',
    },
    {
      title: 'Basic Information',
      subtitle: 'Tell us about your app',
    },
    {
      title: 'Configuration',
      subtitle: 'Customize your settings',
    },
    {
      title: 'Review',
      subtitle: 'Confirm your setup',
    },
  ];

  const copy =
    copies[Math.min(step - 1, copies.length - 1)] ??
    copies[0] ??
    { title: 'Step', subtitle: 'Continue' };
  return {
    title: copy.title,
    subtitle: `${copy.subtitle} (Step ${step} of ${totalSteps})`,
  };
}

/**
 * Generate field description for forms
 */
export function generateFieldDescription(fieldName: string): string | undefined {
  const descriptions: Record<string, string> = {
    reorderThreshold: 'Minimum quantity before triggering a reorder',
    status: 'Current state of this record',
    priority: 'Relative importance or urgency',
    category: 'Classification for this item',
    tags: 'Custom labels for organization',
    archived: 'Soft delete - hidden from normal views',
    verified: 'Confirmation status for this record',
  };

  const normalized = fieldName.toLowerCase();
  for (const [key, desc] of Object.entries(descriptions)) {
    if (normalized.includes(key.toLowerCase())) {
      return desc;
    }
  }

  return undefined;
}

/**
 * Generate placeholder text with intelligent suggestions
 */
export function generatePlaceholder(
  fieldName: string,
  semanticType?: string,
  enumValues?: string[],
): string {
  if (enumValues?.length) {
    return `Select ${toTitleCase(fieldName).toLowerCase()}...`;
  }

  const copy = generateCopyForField(fieldName, semanticType);
  return copy.placeholder;
}

export const uxCopy = {
  generateCopyForField,
  generateButtonText,
  generateEmptyStateMessage,
  generateValidationError,
  generateHelperText,
  generateOnboardingCopy,
  generateFieldDescription,
  generatePlaceholder,
  toTitleCase,
};

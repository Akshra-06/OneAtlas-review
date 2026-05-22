/**
 * Safe Component Registry
 * 
 * Enforces that only approved components can be used in generated apps.
 * This prevents crashes from AI-inventing non-existent or unsafe components.
 */

export interface ComponentRegistryItem {
  name: string;
  path: string;
  type: 'ui' | 'layout' | 'form' | 'data' | 'safe' | 'provider';
  clientOnly: boolean;
  serverOnly: boolean;
  props: string[];
  deprecated: boolean;
  alternatives?: string[];
}

/**
 * Approved UI components from golden template
 */
const APPROVED_UI_COMPONENTS: ComponentRegistryItem[] = [
  {
    name: 'Card',
    path: '@/components/ui/card',
    type: 'ui',
    clientOnly: false,
    serverOnly: false,
    props: ['className'],
    deprecated: false,
  },
  {
    name: 'CardHeader',
    path: '@/components/ui/card',
    type: 'ui',
    clientOnly: false,
    serverOnly: false,
    props: ['className'],
    deprecated: false,
  },
  {
    name: 'CardTitle',
    path: '@/components/ui/card',
    type: 'ui',
    clientOnly: false,
    serverOnly: false,
    props: ['className'],
    deprecated: false,
  },
  {
    name: 'CardDescription',
    path: '@/components/ui/card',
    type: 'ui',
    clientOnly: false,
    serverOnly: false,
    props: ['className'],
    deprecated: false,
  },
  {
    name: 'CardContent',
    path: '@/components/ui/card',
    type: 'ui',
    clientOnly: false,
    serverOnly: false,
    props: ['className'],
    deprecated: false,
  },
  {
    name: 'CardFooter',
    path: '@/components/ui/card',
    type: 'ui',
    clientOnly: false,
    serverOnly: false,
    props: ['className'],
    deprecated: false,
  },
  {
    name: 'Button',
    path: '@/components/ui/button',
    type: 'ui',
    clientOnly: false,
    serverOnly: false,
    props: ['variant', 'size', 'className'],
    deprecated: false,
  },
  {
    name: 'Input',
    path: '@/components/ui/input',
    type: 'ui',
    clientOnly: false,
    serverOnly: false,
    props: ['type', 'placeholder', 'className'],
    deprecated: false,
  },
  {
    name: 'Textarea',
    path: '@/components/ui/textarea',
    type: 'ui',
    clientOnly: false,
    serverOnly: false,
    props: ['placeholder', 'className'],
    deprecated: false,
  },
  {
    name: 'Select',
    path: '@/components/ui/select',
    type: 'ui',
    clientOnly: true,
    serverOnly: false,
    props: ['value', 'onValueChange', 'children'],
    deprecated: false,
  },
  {
    name: 'Switch',
    path: '@/components/ui/switch',
    type: 'ui',
    clientOnly: true,
    serverOnly: false,
    props: ['checked', 'onCheckedChange'],
    deprecated: false,
  },
  {
    name: 'Badge',
    path: '@/components/ui/badge',
    type: 'ui',
    clientOnly: false,
    serverOnly: false,
    props: ['variant', 'className'],
    deprecated: false,
  },
  {
    name: 'Avatar',
    path: '@/components/ui/avatar',
    type: 'ui',
    clientOnly: false,
    serverOnly: false,
    props: ['className'],
    deprecated: false,
  },
  {
    name: 'AvatarFallback',
    path: '@/components/ui/avatar',
    type: 'ui',
    clientOnly: false,
    serverOnly: false,
    props: ['className'],
    deprecated: false,
  },
  {
    name: 'Separator',
    path: '@/components/ui/separator',
    type: 'ui',
    clientOnly: false,
    serverOnly: false,
    props: ['className'],
    deprecated: false,
  },
  {
    name: 'Skeleton',
    path: '@/components/ui/skeleton',
    type: 'ui',
    clientOnly: false,
    serverOnly: false,
    props: ['className'],
    deprecated: false,
  },
  {
    name: 'Popover',
    path: '@/components/ui/popover',
    type: 'ui',
    clientOnly: true,
    serverOnly: false,
    props: ['children', 'defaultOpen'],
    deprecated: false,
  },
  {
    name: 'PopoverTrigger',
    path: '@/components/ui/popover',
    type: 'ui',
    clientOnly: true,
    serverOnly: false,
    props: ['children', 'asChild'],
    deprecated: false,
  },
  {
    name: 'PopoverContent',
    path: '@/components/ui/popover',
    type: 'ui',
    clientOnly: true,
    serverOnly: false,
    props: ['children', 'className'],
    deprecated: false,
  },
  {
    name: 'Command',
    path: '@/components/ui/command',
    type: 'ui',
    clientOnly: true,
    serverOnly: false,
    props: ['children', 'className'],
    deprecated: false,
  },
  {
    name: 'CommandInput',
    path: '@/components/ui/command',
    type: 'ui',
    clientOnly: true,
    serverOnly: false,
    props: ['placeholder', 'className'],
    deprecated: false,
  },
  {
    name: 'CommandList',
    path: '@/components/ui/command',
    type: 'ui',
    clientOnly: true,
    serverOnly: false,
    props: ['children', 'className'],
    deprecated: false,
  },
  {
    name: 'CommandEmpty',
    path: '@/components/ui/command',
    type: 'ui',
    clientOnly: true,
    serverOnly: false,
    props: ['children'],
    deprecated: false,
  },
  {
    name: 'CommandGroup',
    path: '@/components/ui/command',
    type: 'ui',
    clientOnly: true,
    serverOnly: false,
    props: ['children', 'heading', 'className'],
    deprecated: false,
  },
  {
    name: 'CommandItem',
    path: '@/components/ui/command',
    type: 'ui',
    clientOnly: true,
    serverOnly: false,
    props: ['children', 'className'],
    deprecated: false,
  },
  {
    name: 'DataTable',
    path: '@/components/ui/data-table',
    type: 'data',
    clientOnly: true,
    serverOnly: false,
    props: ['columns', 'data'],
    deprecated: false,
  },
];

/**
 * Approved layout components
 */
const APPROVED_LAYOUT_COMPONENTS: ComponentRegistryItem[] = [
  {
    name: 'Sidebar',
    path: '@/components/sidebar',
    type: 'layout',
    clientOnly: true,
    serverOnly: false,
    props: ['appName', 'items', 'open', 'onOpenChange'],
    deprecated: false,
  },
];

/**
 * Approved safe components
 */
const APPROVED_SAFE_COMPONENTS: ComponentRegistryItem[] = [
  {
    name: 'ErrorBoundary',
    path: '@/components/safe/error-boundary',
    type: 'safe',
    clientOnly: true,
    serverOnly: false,
    props: ['fallback', 'children'],
    deprecated: false,
  },
  {
    name: 'Safe',
    path: '@/components/safe/safe',
    type: 'safe',
    clientOnly: true,
    serverOnly: false,
    props: ['children', 'fallback'],
    deprecated: false,
  },
];

/**
 * Approved provider components
 */
const APPROVED_PROVIDER_COMPONENTS: ComponentRegistryItem[] = [
  {
    name: 'Providers',
    path: '@/components/providers',
    type: 'provider',
    clientOnly: true,
    serverOnly: false,
    props: ['children'],
    deprecated: false,
  },
];

/**
 * All approved components
 */
const ALL_APPROVED_COMPONENTS: ComponentRegistryItem[] = [
  ...APPROVED_UI_COMPONENTS,
  ...APPROVED_LAYOUT_COMPONENTS,
  ...APPROVED_SAFE_COMPONENTS,
  ...APPROVED_PROVIDER_COMPONENTS,
];

/**
 * Component name to registry item mapping
 */
const COMPONENT_NAME_MAP = new Map<string, ComponentRegistryItem>(
  ALL_APPROVED_COMPONENTS.map(comp => [comp.name, comp])
);

/**
 * Component path to registry item mapping
 */
const COMPONENT_PATH_MAP = new Map<string, ComponentRegistryItem>(
  ALL_APPROVED_COMPONENTS.map(comp => [comp.path, comp])
);

export class SafeComponentRegistry {
  /**
   * Check if a component is approved
   */
  public isComponentApproved(componentName: string): boolean {
    return COMPONENT_NAME_MAP.has(componentName);
  }

  /**
   * Check if a component path is approved
   */
  public isPathApproved(componentPath: string): boolean {
    // Normalize path
    const normalized = componentPath.replace(/^@\//, '').replace(/\/[^/]+$/, '');
    return COMPONENT_PATH_MAP.has(`@/${normalized}`) || 
           COMPONENT_PATH_MAP.has(componentPath);
  }

  /**
   * Get component registry item
   */
  public getComponent(componentName: string): ComponentRegistryItem | undefined {
    return COMPONENT_NAME_MAP.get(componentName);
  }

  /**
   * Get all approved components by type
   */
  public getComponentsByType(type: ComponentRegistryItem['type']): ComponentRegistryItem[] {
    return ALL_APPROVED_COMPONENTS.filter(comp => comp.type === type);
  }

  /**
   * Validate component usage in code
   */
  public validateComponentUsage(code: string): {
    valid: boolean;
    unauthorized: string[];
    suggestions: Map<string, string[]>;
  } {
    const unauthorized: string[] = [];
    const suggestions = new Map<string, string[]>();

    // Find all potential component usages
    // Pattern: <ComponentName or import ComponentName
    const componentPatterns = [
      /<([A-Z][a-zA-Z0-9]*)/g,
      /import\s+([A-Z][a-zA-Z0-9]*)\s+from/g,
    ];

    for (const pattern of componentPatterns) {
      let match;
      while ((match = pattern.exec(code)) !== null) {
        const componentName = match[1];
        if (!componentName) continue;
        
        // Skip if it's a standard HTML element or React
        if (['HTML', 'SVG', 'Fragment', 'Suspense', 'StrictMode'].includes(componentName)) {
          continue;
        }

        // Check if it's an approved component
        if (!this.isComponentApproved(componentName)) {
          unauthorized.push(componentName);
          
          // Suggest alternatives based on name similarity
          const alternatives = this.suggestAlternatives(componentName);
          if (alternatives.length > 0) {
            suggestions.set(componentName, alternatives);
          }
        }
      }
      pattern.lastIndex = 0;
    }

    return {
      valid: unauthorized.length === 0,
      unauthorized,
      suggestions,
    };
  }

  /**
   * Suggest alternative components for unauthorized usage
   */
  private suggestAlternatives(componentName: string): string[] {
    const alternatives: string[] = [];
    const lowerName = componentName.toLowerCase();

    // Simple suggestion logic based on keywords
    if (lowerName.includes('card')) {
      alternatives.push('Card', 'CardContent');
    }
    if (lowerName.includes('button') || lowerName.includes('btn')) {
      alternatives.push('Button');
    }
    if (lowerName.includes('input') || lowerName.includes('text')) {
      alternatives.push('Input', 'Textarea');
    }
    if (lowerName.includes('select') || lowerName.includes('dropdown')) {
      alternatives.push('Select');
    }
    if (lowerName.includes('table') || lowerName.includes('grid')) {
      alternatives.push('DataTable');
    }
    if (lowerName.includes('badge') || lowerName.includes('tag')) {
      alternatives.push('Badge');
    }
    if (lowerName.includes('dialog') || lowerName.includes('modal')) {
      alternatives.push('Popover');
    }

    return alternatives;
  }

  /**
   * Sanitize code to replace unauthorized components with safe alternatives
   */
  public sanitizeComponentUsage(code: string): string {
    let sanitized = code;
    const validation = this.validateComponentUsage(code);

    for (const unauthorized of validation.unauthorized) {
      const alternatives = validation.suggestions.get(unauthorized) || [];
      const safeAlternative = alternatives[0] || 'div';

      // Replace component usage with safe alternative
      const componentPattern = new RegExp(`<${unauthorized}`, 'g');
      sanitized = sanitized.replace(componentPattern, `<${safeAlternative}`);

      // Replace import statements
      const importPattern = new RegExp(`import\\s+${unauthorized}\\s+from\\s+['"][^'"]+['"]`, 'g');
      sanitized = sanitized.replace(importPattern, `// ${unauthorized} replaced with ${safeAlternative}`);
    }

    return sanitized;
  }

  /**
   * Get approved component names for generator
   */
  public getApprovedComponentNames(): string[] {
    return ALL_APPROVED_COMPONENTS.map(comp => comp.name);
  }

  /**
   * Get approved component paths for generator
   */
  public getApprovedComponentPaths(): string[] {
    return ALL_APPROVED_COMPONENTS.map(comp => comp.path);
  }

  /**
   * Check if component requires 'use client' directive
   */
  public requiresClientDirective(componentName: string): boolean {
    const comp = COMPONENT_NAME_MAP.get(componentName);
    return comp?.clientOnly ?? false;
  }

  /**
   * Get component props schema
   */
  public getComponentProps(componentName: string): string[] {
    const comp = COMPONENT_NAME_MAP.get(componentName);
    return comp?.props ?? [];
  }
}

export const safeComponentRegistry = new SafeComponentRegistry();
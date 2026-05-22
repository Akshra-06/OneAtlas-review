/**
 * Product Archetype Rendering Engine
 * 
 * Ensures every domain feels like a different product category entirely.
 * Healthcare should NOT visually resemble CRM.
 * CRM should NOT resemble Analytics.
 * Analytics should NOT resemble ATS.
 */

import { logger } from '../../shared/utils/logger';

import {
  ArchetypeDefinition,
} from '../../product/archetype/archetype-registry';

export interface ProductFeel {
  category: 'clinical' | 'sales' | 'data' | 'operational' | 'recruiting' | 'financial' | 'logistics' | 'service' | 'collaborative' | 'educational';
  personality: 'professional' | 'friendly' | 'analytical' | 'efficient' | 'human-centric' | 'compliance-focused' | 'action-oriented' | 'helpful' | 'team-focused' | 'learning-focused';
  aesthetic: {
    colorPalette: string;
    cornerRadius: number;
    shadowDepth: 'flat' | 'subtle' | 'medium' | 'deep';
    iconStyle: 'outline' | 'filled' | 'duotone' | 'rounded';
  };
  interaction: {
    animationSpeed: 'instant' | 'fast' | 'medium' | 'slow';
    feedbackStyle: 'subtle' | 'clear' | 'prominent';
    gestureSupport: boolean;
    keyboardFocus: boolean;
  };
  branding: {
    logoPlacement: 'sidebar' | 'topbar' | 'minimal';
    headerStyle: 'prominent' | 'subtle' | 'minimal';
    footerStyle: 'standard' | 'minimal' | 'none';
  };
}

export interface ProductArchetypeRendering {
  domain: string;
  archetype: ArchetypeDefinition;
  productFeel: ProductFeel;
  visualIdentity: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    neutralColor: string;
    backgroundColor: string;
    surfaceColor: string;
  };
  componentLibrary: string[];
  iconSet: string;
  fontFamily: string;
  borderRadius: number;
  shadowStyle: string;
}

export interface ProductArchetypeConfig {
  enableFeelMutation: boolean;
  enableVisualIdentityMutation: boolean;
  enableComponentLibraryMutation: boolean;
  enableIconSetMutation: boolean;
  enableFontMutation: boolean;
}

const DEFAULT_CONFIG: ProductArchetypeConfig = {
  enableFeelMutation: true,
  enableVisualIdentityMutation: true,
  enableComponentLibraryMutation: true,
  enableIconSetMutation: true,
  enableFontMutation: true,
};

/**
 * Product Archetype Rendering Engine
 * 
 * Ensures every domain feels like a different product category:
 * - Healthcare: Clinical, professional, calming
 * - CRM: Sales, action-oriented, efficient
 * - Analytics: Data, analytical, visual
 * - Ecommerce: Operational, efficient, action-oriented
 * - ATS: Recruiting, human-centric, professional
 * - Finance: Financial, compliance-focused, professional
 * - Logistics: Logistics, action-oriented, efficient
 * - Support: Service, helpful, friendly
 * - Project Management: Collaborative, team-focused, efficient
 * - Education: Educational, learning-focused, friendly
 */
export class ProductArchetypeRenderingEngine {
  private config: ProductArchetypeConfig;

  constructor(config: Partial<ProductArchetypeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Render product archetype based on domain and archetype
   */
  renderProductArchetype(domain: string, archetype: ArchetypeDefinition): ProductArchetypeRendering {
    const productFeel = this.config.enableFeelMutation
      ? this.generateProductFeel(domain, archetype)
      : this.getDefaultProductFeel();

    const visualIdentity = this.config.enableVisualIdentityMutation
      ? this.generateVisualIdentity(domain, archetype)
      : this.getDefaultVisualIdentity();

    const componentLibrary = this.config.enableComponentLibraryMutation
      ? this.selectComponentLibrary(domain, archetype)
      : this.getDefaultComponentLibrary();

    const iconSet = this.config.enableIconSetMutation
      ? this.selectIconSet(domain, archetype)
      : this.getDefaultIconSet();

    const fontFamily = this.config.enableFontMutation
      ? this.selectFontFamily(domain, archetype)
      : this.getDefaultFontFamily();

    const borderRadius = this.config.enableFeelMutation
      ? this.determineBorderRadius(domain, archetype)
      : 8;

    const shadowStyle = this.config.enableFeelMutation
      ? this.determineShadowStyle(domain, archetype)
      : 'medium';

    const rendering: ProductArchetypeRendering = {
      domain,
      archetype,
      productFeel,
      visualIdentity,
      componentLibrary,
      iconSet,
      fontFamily,
      borderRadius,
      shadowStyle,
    };

    logger.info('ProductArchetypeRenderingEngine', 'PRODUCT_ARCHETYPE_RENDERED', 'Product archetype rendered', {
      domain,
      archetype: archetype.id,
      category: productFeel.category,
      personality: productFeel.personality,
      primaryColor: visualIdentity.primaryColor,
    });

    return rendering;
  }

  /**
   * Generate product feel based on domain and archetype
   */
  private generateProductFeel(domain: string, archetype: ArchetypeDefinition): ProductFeel {
    const productFeels: Record<string, ProductFeel> = {
      healthcare: {
        category: 'clinical',
        personality: 'professional',
        aesthetic: {
          colorPalette: 'calming-blues',
          cornerRadius: 12,
          shadowDepth: 'subtle',
          iconStyle: 'rounded',
        },
        interaction: {
          animationSpeed: 'medium',
          feedbackStyle: 'subtle',
          gestureSupport: true,
          keyboardFocus: true,
        },
        branding: {
          logoPlacement: 'sidebar',
          headerStyle: 'subtle',
          footerStyle: 'standard',
        },
      },
      crm: {
        category: 'sales',
        personality: 'action-oriented',
        aesthetic: {
          colorPalette: 'vibrant-blues',
          cornerRadius: 8,
          shadowDepth: 'medium',
          iconStyle: 'filled',
        },
        interaction: {
          animationSpeed: 'fast',
          feedbackStyle: 'clear',
          gestureSupport: true,
          keyboardFocus: true,
        },
        branding: {
          logoPlacement: 'sidebar',
          headerStyle: 'prominent',
          footerStyle: 'standard',
        },
      },
      analytics: {
        category: 'data',
        personality: 'analytical',
        aesthetic: {
          colorPalette: 'data-purple',
          cornerRadius: 4,
          shadowDepth: 'flat',
          iconStyle: 'outline',
        },
        interaction: {
          animationSpeed: 'instant',
          feedbackStyle: 'subtle',
          gestureSupport: false,
          keyboardFocus: true,
        },
        branding: {
          logoPlacement: 'topbar',
          headerStyle: 'minimal',
          footerStyle: 'minimal',
        },
      },
      ecommerce: {
        category: 'operational',
        personality: 'efficient',
        aesthetic: {
          colorPalette: 'action-orange',
          cornerRadius: 8,
          shadowDepth: 'medium',
          iconStyle: 'filled',
        },
        interaction: {
          animationSpeed: 'fast',
          feedbackStyle: 'clear',
          gestureSupport: true,
          keyboardFocus: true,
        },
        branding: {
          logoPlacement: 'topbar',
          headerStyle: 'prominent',
          footerStyle: 'standard',
        },
      },
      ats: {
        category: 'recruiting',
        personality: 'human-centric',
        aesthetic: {
          colorPalette: 'professional-teal',
          cornerRadius: 8,
          shadowDepth: 'medium',
          iconStyle: 'rounded',
        },
        interaction: {
          animationSpeed: 'fast',
          feedbackStyle: 'clear',
          gestureSupport: true,
          keyboardFocus: true,
        },
        branding: {
          logoPlacement: 'sidebar',
          headerStyle: 'subtle',
          footerStyle: 'standard',
        },
      },
      finance: {
        category: 'financial',
        personality: 'compliance-focused',
        aesthetic: {
          colorPalette: 'trust-green',
          cornerRadius: 4,
          shadowDepth: 'subtle',
          iconStyle: 'outline',
        },
        interaction: {
          animationSpeed: 'medium',
          feedbackStyle: 'subtle',
          gestureSupport: false,
          keyboardFocus: true,
        },
        branding: {
          logoPlacement: 'topbar',
          headerStyle: 'minimal',
          footerStyle: 'standard',
        },
      },
      logistics: {
        category: 'logistics',
        personality: 'action-oriented',
        aesthetic: {
          colorPalette: 'movement-blue',
          cornerRadius: 8,
          shadowDepth: 'medium',
          iconStyle: 'filled',
        },
        interaction: {
          animationSpeed: 'fast',
          feedbackStyle: 'clear',
          gestureSupport: true,
          keyboardFocus: true,
        },
        branding: {
          logoPlacement: 'topbar',
          headerStyle: 'prominent',
          footerStyle: 'standard',
        },
      },
      support: {
        category: 'service',
        personality: 'helpful',
        aesthetic: {
          colorPalette: 'friendly-purple',
          cornerRadius: 12,
          shadowDepth: 'subtle',
          iconStyle: 'rounded',
        },
        interaction: {
          animationSpeed: 'medium',
          feedbackStyle: 'subtle',
          gestureSupport: true,
          keyboardFocus: true,
        },
        branding: {
          logoPlacement: 'sidebar',
          headerStyle: 'subtle',
          footerStyle: 'standard',
        },
      },
      project_management: {
        category: 'collaborative',
        personality: 'team-focused',
        aesthetic: {
          colorPalette: 'collaborative-indigo',
          cornerRadius: 8,
          shadowDepth: 'medium',
          iconStyle: 'duotone',
        },
        interaction: {
          animationSpeed: 'fast',
          feedbackStyle: 'clear',
          gestureSupport: true,
          keyboardFocus: true,
        },
        branding: {
          logoPlacement: 'sidebar',
          headerStyle: 'subtle',
          footerStyle: 'standard',
        },
      },
      education: {
        category: 'educational',
        personality: 'learning-focused',
        aesthetic: {
          colorPalette: 'learning-green',
          cornerRadius: 12,
          shadowDepth: 'subtle',
          iconStyle: 'rounded',
        },
        interaction: {
          animationSpeed: 'medium',
          feedbackStyle: 'subtle',
          gestureSupport: true,
          keyboardFocus: true,
        },
        branding: {
          logoPlacement: 'sidebar',
          headerStyle: 'subtle',
          footerStyle: 'standard',
        },
      },
    };

    return productFeels[domain] || this.getDefaultProductFeel();
  }

  /**
   * Generate visual identity based on domain and archetype
   */
  private generateVisualIdentity(domain: string, archetype: ArchetypeDefinition) {
    const visualIdentities: Record<string, any> = {
      healthcare: {
        primaryColor: '#3B82F6', // Blue
        secondaryColor: '#10B981', // Green
        accentColor: '#F59E0B', // Amber
        neutralColor: '#6B7280', // Gray
        backgroundColor: '#F9FAFB', // Light gray
        surfaceColor: '#FFFFFF', // White
      },
      crm: {
        primaryColor: '#2563EB', // Blue
        secondaryColor: '#7C3AED', // Purple
        accentColor: '#EC4899', // Pink
        neutralColor: '#64748B', // Slate
        backgroundColor: '#F8FAFC', // Light slate
        surfaceColor: '#FFFFFF', // White
      },
      analytics: {
        primaryColor: '#8B5CF6', // Purple
        secondaryColor: '#06B6D4', // Cyan
        accentColor: '#F43F5E', // Rose
        neutralColor: '#475569', // Slate
        backgroundColor: '#0F172A', // Dark slate
        surfaceColor: '#1E293B', // Darker slate
      },
      ecommerce: {
        primaryColor: '#F97316', // Orange
        secondaryColor: '#EF4444', // Red
        accentColor: '#10B981', // Green
        neutralColor: '#64748B', // Slate
        backgroundColor: '#F8FAFC', // Light slate
        surfaceColor: '#FFFFFF', // White
      },
      ats: {
        primaryColor: '#0D9488', // Teal
        secondaryColor: '#6366F1', // Indigo
        accentColor: '#F59E0B', // Amber
        neutralColor: '#64748B', // Slate
        backgroundColor: '#F8FAFC', // Light slate
        surfaceColor: '#FFFFFF', // White
      },
      finance: {
        primaryColor: '#059669', // Green
        secondaryColor: '#0891B2', // Cyan
        accentColor: '#DC2626', // Red
        neutralColor: '#475569', // Slate
        backgroundColor: '#F8FAFC', // Light slate
        surfaceColor: '#FFFFFF', // White
      },
      logistics: {
        primaryColor: '#0284C7', // Sky blue
        secondaryColor: '#4F46E5', // Indigo
        accentColor: '#F59E0B', // Amber
        neutralColor: '#64748B', // Slate
        backgroundColor: '#F8FAFC', // Light slate
        surfaceColor: '#FFFFFF', // White
      },
      support: {
        primaryColor: '#8B5CF6', // Purple
        secondaryColor: '#EC4899', // Pink
        accentColor: '#10B981', // Green
        neutralColor: '#6B7280', // Gray
        backgroundColor: '#F9FAFB', // Light gray
        surfaceColor: '#FFFFFF', // White
      },
      project_management: {
        primaryColor: '#4F46E5', // Indigo
        secondaryColor: '#7C3AED', // Purple
        accentColor: '#F59E0B', // Amber
        neutralColor: '#64748B', // Slate
        backgroundColor: '#F8FAFC', // Light slate
        surfaceColor: '#FFFFFF', // White
      },
      education: {
        primaryColor: '#10B981', // Green
        secondaryColor: '#3B82F6', // Blue
        accentColor: '#F59E0B', // Amber
        neutralColor: '#6B7280', // Gray
        backgroundColor: '#F9FAFB', // Light gray
        surfaceColor: '#FFFFFF', // White
      },
    };

    return visualIdentities[domain] || this.getDefaultVisualIdentity();
  }

  /**
   * Select component library based on domain and archetype
   */
  private selectComponentLibrary(domain: string, archetype: ArchetypeDefinition): string[] {
    const componentLibraries: Record<string, string[]> = {
      healthcare: ['shadcn/ui', 'healthcare-components', 'calendar-components'],
      crm: ['shadcn/ui', 'sales-components', 'pipeline-components'],
      analytics: ['shadcn/ui', 'chart-components', 'data-components'],
      ecommerce: ['shadcn/ui', 'ecommerce-components', 'inventory-components'],
      ats: ['shadcn/ui', 'recruiting-components', 'candidate-components'],
      finance: ['shadcn/ui', 'finance-components', 'reporting-components'],
      logistics: ['shadcn/ui', 'logistics-components', 'tracking-components'],
      support: ['shadcn/ui', 'support-components', 'ticket-components'],
      project_management: ['shadcn/ui', 'project-components', 'task-components'],
      education: ['shadcn/ui', 'education-components', 'course-components'],
    };

    return componentLibraries[domain] || this.getDefaultComponentLibrary();
  }

  /**
   * Select icon set based on domain and archetype
   */
  private selectIconSet(domain: string, archetype: ArchetypeDefinition): string {
    const iconSets: Record<string, string> = {
      healthcare: 'lucide-rounded',
      crm: 'lucide-filled',
      analytics: 'lucide-outline',
      ecommerce: 'lucide-filled',
      ats: 'lucide-rounded',
      finance: 'lucide-outline',
      logistics: 'lucide-filled',
      support: 'lucide-rounded',
      project_management: 'lucide-duotone',
      education: 'lucide-rounded',
    };

    return iconSets[domain] || this.getDefaultIconSet();
  }

  /**
   * Select font family based on domain and archetype
   */
  private selectFontFamily(domain: string, archetype: ArchetypeDefinition): string {
    const fontFamilies: Record<string, string> = {
      healthcare: 'Inter',
      crm: 'Inter',
      analytics: 'JetBrains Mono',
      ecommerce: 'Inter',
      ats: 'Inter',
      finance: 'Inter',
      logistics: 'Inter',
      support: 'Inter',
      project_management: 'Inter',
      education: 'Inter',
    };

    return fontFamilies[domain] || this.getDefaultFontFamily();
  }

  /**
   * Determine border radius based on domain and archetype
   */
  private determineBorderRadius(domain: string, archetype: ArchetypeDefinition): number {
    const borderRadii: Record<string, number> = {
      healthcare: 12,
      crm: 8,
      analytics: 4,
      ecommerce: 8,
      ats: 8,
      finance: 4,
      logistics: 8,
      support: 12,
      project_management: 8,
      education: 12,
    };

    return borderRadii[domain] || 8;
  }

  /**
   * Determine shadow style based on domain and archetype
   */
  private determineShadowStyle(domain: string, archetype: ArchetypeDefinition): string {
    const shadowStyles: Record<string, string> = {
      healthcare: 'subtle',
      crm: 'medium',
      analytics: 'flat',
      ecommerce: 'medium',
      ats: 'medium',
      finance: 'subtle',
      logistics: 'medium',
      support: 'subtle',
      project_management: 'medium',
      education: 'subtle',
    };

    return shadowStyles[domain] || 'medium';
  }

  /**
   * Get default product feel
   */
  private getDefaultProductFeel(): ProductFeel {
    return {
      category: 'operational',
      personality: 'professional',
      aesthetic: {
        colorPalette: 'default',
        cornerRadius: 8,
        shadowDepth: 'medium',
        iconStyle: 'outline',
      },
      interaction: {
        animationSpeed: 'medium',
        feedbackStyle: 'clear',
        gestureSupport: true,
        keyboardFocus: true,
      },
      branding: {
        logoPlacement: 'sidebar',
        headerStyle: 'subtle',
        footerStyle: 'standard',
      },
    };
  }

  /**
   * Get default visual identity
   */
  private getDefaultVisualIdentity() {
    return {
      primaryColor: '#3B82F6',
      secondaryColor: '#6366F1',
      accentColor: '#F59E0B',
      neutralColor: '#6B7280',
      backgroundColor: '#F9FAFB',
      surfaceColor: '#FFFFFF',
    };
  }

  /**
   * Get default component library
   */
  private getDefaultComponentLibrary(): string[] {
    return ['shadcn/ui'];
  }

  /**
   * Get default icon set
   */
  private getDefaultIconSet(): string {
    return 'lucide';
  }

  /**
   * Get default font family
   */
  private getDefaultFontFamily(): string {
    return 'Inter';
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ProductArchetypeConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ProductArchetypeRenderingEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ProductArchetypeConfig {
    return { ...this.config };
  }
}

export const productArchetypeRenderingEngine = new ProductArchetypeRenderingEngine();

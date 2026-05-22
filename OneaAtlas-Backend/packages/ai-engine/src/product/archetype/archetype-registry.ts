/**
 * Archetype Registry
 * 
 * Registry of UI archetypes for different product types.
 * Defines semantic UI patterns for each archetype.
 */

import { logger } from '../../shared/utils/logger';

export interface ArchetypeDefinition {
  id: string;
  name: string;
  description: string;
  navigationStyle: 'sidebar' | 'topbar' | 'sidebar-topbar' | 'minimal' | 'command-palette';
  layoutDensity: 'compact' | 'comfortable' | 'spacious' | 'dense';
  preferredWidgets: string[];
  chartUsage: 'minimal' | 'moderate' | 'heavy' | 'realtime';
  workflowEmphasis: 'data' | 'tasks' | 'collaboration' | 'monitoring' | 'operations';
  interactionPatterns: string[];
  visualHierarchyRules: {
    primaryEmphasis: string;
    secondaryEmphasis: string;
    tertiaryEmphasis: string;
  };
  dashboardCompositionStrategy: 'data-first' | 'task-first' | 'status-first' | 'timeline-first';
  sectionArrangementBehavior: 'grouped' | 'sequential' | 'priority' | 'workflow';
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  typography: {
    heading: string;
    body: string;
    mono: string;
  };
  spacing: {
    compact: number;
    comfortable: number;
    spacious: number;
  };
}

/**
 * Archetype Registry
 * 
 * Manages UI archetype definitions:
 * - Archetype registration
 * - Archetype lookup
 * - Archetype validation
 * - Archetype metadata
 */
export class ArchetypeRegistry {
  private archetypes: Map<string, ArchetypeDefinition> = new Map();

  constructor() {
    this.registerDefaultArchetypes();
  }

  /**
   * Register an archetype
   */
  register(archetype: ArchetypeDefinition): void {
    this.archetypes.set(archetype.id, archetype);

    logger.info('ArchetypeRegistry', 'ARCHETYPE_REGISTERED', 'Archetype registered', {
      archetypeId: archetype.id,
      name: archetype.name,
    });
  }

  /**
   * Get an archetype by ID
   */
  get(id: string): ArchetypeDefinition | undefined {
    return this.archetypes.get(id);
  }

  /**
   * Get all archetypes
   */
  getAll(): ArchetypeDefinition[] {
    return Array.from(this.archetypes.values());
  }

  /**
   * Find archetypes by keyword
   */
  findByKeyword(keyword: string): ArchetypeDefinition[] {
    const lowerKeyword = keyword.toLowerCase();
    return this.getAll().filter(archetype =>
      archetype.name.toLowerCase().includes(lowerKeyword) ||
      archetype.description.toLowerCase().includes(lowerKeyword) ||
      archetype.id.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * Register default archetypes
   */
  private registerDefaultArchetypes(): void {
    // Healthcare Workspace
    this.register({
      id: 'healthcare_workspace',
      name: 'Healthcare Workspace',
      description: 'Patient management and clinical workflow interface',
      navigationStyle: 'sidebar',
      layoutDensity: 'comfortable',
      preferredWidgets: ['patient-timeline', 'appointment-calendar', 'urgency-alerts', 'treatment-cards', 'provider-schedule'],
      chartUsage: 'moderate',
      workflowEmphasis: 'tasks',
      interactionPatterns: ['quick-actions', 'patient-search', 'clinical-notes', 'order-entry'],
      visualHierarchyRules: {
        primaryEmphasis: 'patient-status',
        secondaryEmphasis: 'appointments',
        tertiaryEmphasis: 'alerts',
      },
      dashboardCompositionStrategy: 'status-first',
      sectionArrangementBehavior: 'priority',
      colorPalette: {
        primary: '#2563eb',
        secondary: '#10b981',
        accent: '#ef4444',
        background: '#f8fafc',
      },
      typography: {
        heading: 'Inter',
        body: 'Inter',
        mono: 'JetBrains Mono',
      },
      spacing: {
        compact: 8,
        comfortable: 16,
        spacious: 24,
      },
    });

    // Operations Center
    this.register({
      id: 'operations_center',
      name: 'Operations Center',
      description: 'Real-time operational monitoring and control',
      navigationStyle: 'sidebar-topbar',
      layoutDensity: 'dense',
      preferredWidgets: ['live-metrics', 'status-boards', 'alert-streams', 'resource-monitors', 'incident-tracker'],
      chartUsage: 'realtime',
      workflowEmphasis: 'monitoring',
      interactionPatterns: ['quick-respond', 'escalate', 'acknowledge', 'assign'],
      visualHierarchyRules: {
        primaryEmphasis: 'alerts',
        secondaryEmphasis: 'metrics',
        tertiaryEmphasis: 'resources',
      },
      dashboardCompositionStrategy: 'status-first',
      sectionArrangementBehavior: 'priority',
      colorPalette: {
        primary: '#dc2626',
        secondary: '#f59e0b',
        accent: '#10b981',
        background: '#0f172a',
      },
      typography: {
        heading: 'Roboto',
        body: 'Roboto',
        mono: 'Fira Code',
      },
      spacing: {
        compact: 4,
        comfortable: 8,
        spacious: 16,
      },
    });

    // Analytics Platform
    this.register({
      id: 'analytics_platform',
      name: 'Analytics Platform',
      description: 'Data exploration and visualization platform',
      navigationStyle: 'sidebar',
      layoutDensity: 'spacious',
      preferredWidgets: ['data-charts', 'funnel-visualizations', 'retention-graphs', 'cohort-tables', 'anomaly-alerts'],
      chartUsage: 'heavy',
      workflowEmphasis: 'data',
      interactionPatterns: ['filter', 'drill-down', 'export', 'compare'],
      visualHierarchyRules: {
        primaryEmphasis: 'key-metrics',
        secondaryEmphasis: 'trends',
        tertiaryEmphasis: 'details',
      },
      dashboardCompositionStrategy: 'data-first',
      sectionArrangementBehavior: 'grouped',
      colorPalette: {
        primary: '#8b5cf6',
        secondary: '#3b82f6',
        accent: '#ec4899',
        background: '#ffffff',
      },
      typography: {
        heading: 'Inter',
        body: 'Inter',
        mono: 'SF Mono',
      },
      spacing: {
        compact: 12,
        comfortable: 20,
        spacious: 32,
      },
    });

    // CRM Pipeline
    this.register({
      id: 'crm_pipeline',
      name: 'CRM Pipeline',
      description: 'Customer relationship management pipeline',
      navigationStyle: 'sidebar-topbar',
      layoutDensity: 'comfortable',
      preferredWidgets: ['pipeline-stages', 'lead-scoring', 'activity-feeds', 'deal-progression', 'contact-cards'],
      chartUsage: 'moderate',
      workflowEmphasis: 'tasks',
      interactionPatterns: ['drag-drop', 'quick-add', 'bulk-actions', 'email-integration'],
      visualHierarchyRules: {
        primaryEmphasis: 'pipeline',
        secondaryEmphasis: 'activities',
        tertiaryEmphasis: 'metrics',
      },
      dashboardCompositionStrategy: 'task-first',
      sectionArrangementBehavior: 'workflow',
      colorPalette: {
        primary: '#059669',
        secondary: '#0d9488',
        accent: '#f59e0b',
        background: '#f0fdf4',
      },
      typography: {
        heading: 'Segoe UI',
        body: 'Segoe UI',
        mono: 'Consolas',
      },
      spacing: {
        compact: 8,
        comfortable: 16,
        spacious: 24,
      },
    });

    // Ecommerce Console
    this.register({
      id: 'ecommerce_console',
      name: 'Ecommerce Console',
      description: 'E-commerce operations and inventory management',
      navigationStyle: 'sidebar',
      layoutDensity: 'comfortable',
      preferredWidgets: ['sales-funnels', 'inventory-heatmaps', 'order-tracking', 'fulfillment-boards', 'revenue-charts'],
      chartUsage: 'heavy',
      workflowEmphasis: 'operations',
      interactionPatterns: ['quick-order', 'inventory-adjust', 'shipping-label', 'refund-process'],
      visualHierarchyRules: {
        primaryEmphasis: 'revenue',
        secondaryEmphasis: 'orders',
        tertiaryEmphasis: 'inventory',
      },
      dashboardCompositionStrategy: 'data-first',
      sectionArrangementBehavior: 'priority',
      colorPalette: {
        primary: '#7c3aed',
        secondary: '#db2777',
        accent: '#f97316',
        background: '#faf5ff',
      },
      typography: {
        heading: 'Poppins',
        body: 'Poppins',
        mono: 'IBM Plex Mono',
      },
      spacing: {
        compact: 8,
        comfortable: 16,
        spacious: 24,
      },
    });

    // Scheduling Workspace
    this.register({
      id: 'scheduling_workspace',
      name: 'Scheduling Workspace',
      description: 'Resource scheduling and calendar management',
      navigationStyle: 'sidebar',
      layoutDensity: 'comfortable',
      preferredWidgets: ['calendar-views', 'resource-timeline', 'availability-indicators', 'conflict-detector', 'booking-form'],
      chartUsage: 'minimal',
      workflowEmphasis: 'tasks',
      interactionPatterns: ['drag-schedule', 'quick-book', 'conflict-resolve', 'notify'],
      visualHierarchyRules: {
        primaryEmphasis: 'calendar',
        secondaryEmphasis: 'availability',
        tertiaryEmphasis: 'conflicts',
      },
      dashboardCompositionStrategy: 'timeline-first',
      sectionArrangementBehavior: 'sequential',
      colorPalette: {
        primary: '#0891b2',
        secondary: '#0ea5e9',
        accent: '#f43f5e',
        background: '#ecfeff',
      },
      typography: {
        heading: 'Open Sans',
        body: 'Open Sans',
        mono: 'Ubuntu Mono',
      },
      spacing: {
        compact: 8,
        comfortable: 16,
        spacious: 24,
      },
    });

    // Collaboration Hub
    this.register({
      id: 'collaboration_hub',
      name: 'Collaboration Hub',
      description: 'Team collaboration and communication workspace',
      navigationStyle: 'sidebar-topbar',
      layoutDensity: 'comfortable',
      preferredWidgets: ['activity-stream', 'message-threads', 'shared-docs', 'task-boards', 'presence-indicators'],
      chartUsage: 'minimal',
      workflowEmphasis: 'collaboration',
      interactionPatterns: ['quick-message', 'mention', 'share', 'assign'],
      visualHierarchyRules: {
        primaryEmphasis: 'activity',
        secondaryEmphasis: 'messages',
        tertiaryEmphasis: 'tasks',
      },
      dashboardCompositionStrategy: 'task-first',
      sectionArrangementBehavior: 'grouped',
      colorPalette: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#ec4899',
        background: '#eef2ff',
      },
      typography: {
        heading: 'Nunito',
        body: 'Nunito',
        mono: 'Space Mono',
      },
      spacing: {
        compact: 8,
        comfortable: 16,
        spacious: 24,
      },
    });

    // Finance Terminal
    this.register({
      id: 'finance_terminal',
      name: 'Finance Terminal',
      description: 'Financial data and trading interface',
      navigationStyle: 'topbar',
      layoutDensity: 'dense',
      preferredWidgets: ['price-tickers', 'portfolio-charts', 'transaction-tables', 'risk-meters', 'order-book'],
      chartUsage: 'realtime',
      workflowEmphasis: 'data',
      interactionPatterns: ['quick-trade', 'set-alert', 'analyze', 'report'],
      visualHierarchyRules: {
        primaryEmphasis: 'prices',
        secondaryEmphasis: 'portfolio',
        tertiaryEmphasis: 'risk',
      },
      dashboardCompositionStrategy: 'data-first',
      sectionArrangementBehavior: 'priority',
      colorPalette: {
        primary: '#1e40af',
        secondary: '#059669',
        accent: '#dc2626',
        background: '#1e293b',
      },
      typography: {
        heading: 'Source Code Pro',
        body: 'Source Code Pro',
        mono: 'Source Code Pro',
      },
      spacing: {
        compact: 4,
        comfortable: 8,
        spacious: 12,
      },
    });

    // Content Studio
    this.register({
      id: 'content_studio',
      name: 'Content Studio',
      description: 'Content creation and management workspace',
      navigationStyle: 'sidebar',
      layoutDensity: 'spacious',
      preferredWidgets: ['content-editor', 'media-library', 'preview-pane', 'version-history', 'publish-status'],
      chartUsage: 'minimal',
      workflowEmphasis: 'tasks',
      interactionPatterns: ['rich-edit', 'media-upload', 'preview', 'publish'],
      visualHierarchyRules: {
        primaryEmphasis: 'content',
        secondaryEmphasis: 'media',
        tertiaryEmphasis: 'status',
      },
      dashboardCompositionStrategy: 'task-first',
      sectionArrangementBehavior: 'sequential',
      colorPalette: {
        primary: '#be185d',
        secondary: '#db2777',
        accent: '#7c3aed',
        background: '#fdf2f8',
      },
      typography: {
        heading: 'Merriweather',
        body: 'Merriweather',
        mono: 'Fira Code',
      },
      spacing: {
        compact: 12,
        comfortable: 24,
        spacious: 36,
      },
    });

    // Support Center
    this.register({
      id: 'support_center',
      name: 'Support Center',
      description: 'Customer support and ticket management',
      navigationStyle: 'sidebar',
      layoutDensity: 'comfortable',
      preferredWidgets: ['ticket-queue', 'customer-context', 'knowledge-base', 'response-templates', 'sla-tracker'],
      chartUsage: 'moderate',
      workflowEmphasis: 'tasks',
      interactionPatterns: ['quick-respond', 'escalate', 'merge', 'resolve'],
      visualHierarchyRules: {
        primaryEmphasis: 'tickets',
        secondaryEmphasis: 'sla',
        tertiaryEmphasis: 'knowledge',
      },
      dashboardCompositionStrategy: 'task-first',
      sectionArrangementBehavior: 'priority',
      colorPalette: {
        primary: '#2563eb',
        secondary: '#3b82f6',
        accent: '#f59e0b',
        background: '#eff6ff',
      },
      typography: {
        heading: 'Inter',
        body: 'Inter',
        mono: 'JetBrains Mono',
      },
      spacing: {
        compact: 8,
        comfortable: 16,
        spacious: 24,
      },
    });

    // Admin Console
    this.register({
      id: 'admin_console',
      name: 'Admin Console',
      description: 'System administration and configuration',
      navigationStyle: 'sidebar',
      layoutDensity: 'comfortable',
      preferredWidgets: ['system-status', 'user-management', 'config-panels', 'audit-logs', 'permission-matrix'],
      chartUsage: 'moderate',
      workflowEmphasis: 'tasks',
      interactionPatterns: ['configure', 'approve', 'audit', 'notify'],
      visualHierarchyRules: {
        primaryEmphasis: 'status',
        secondaryEmphasis: 'users',
        tertiaryEmphasis: 'logs',
      },
      dashboardCompositionStrategy: 'status-first',
      sectionArrangementBehavior: 'grouped',
      colorPalette: {
        primary: '#475569',
        secondary: '#64748b',
        accent: '#dc2626',
        background: '#f8fafc',
      },
      typography: {
        heading: 'Inter',
        body: 'Inter',
        mono: 'JetBrains Mono',
      },
      spacing: {
        compact: 8,
        comfortable: 16,
        spacious: 24,
      },
    });

    // Field Operations
    this.register({
      id: 'field_operations',
      name: 'Field Operations',
      description: 'Mobile field operations and task management',
      navigationStyle: 'minimal',
      layoutDensity: 'compact',
      preferredWidgets: ['task-list', 'location-map', 'checklists', 'photo-capture', 'signature-pad'],
      chartUsage: 'minimal',
      workflowEmphasis: 'tasks',
      interactionPatterns: ['tap-complete', 'quick-note', 'photo', 'signature'],
      visualHierarchyRules: {
        primaryEmphasis: 'tasks',
        secondaryEmphasis: 'location',
        tertiaryEmphasis: 'status',
      },
      dashboardCompositionStrategy: 'task-first',
      sectionArrangementBehavior: 'priority',
      colorPalette: {
        primary: '#ea580c',
        secondary: '#f97316',
        accent: '#22c55e',
        background: '#fff7ed',
      },
      typography: {
        heading: 'Roboto',
        body: 'Roboto',
        mono: 'Roboto Mono',
      },
      spacing: {
        compact: 4,
        comfortable: 8,
        spacious: 12,
      },
    });

    // Logistics Control Center
    this.register({
      id: 'logistics_control_center',
      name: 'Logistics Control Center',
      description: 'Logistics tracking and fleet management',
      navigationStyle: 'sidebar-topbar',
      layoutDensity: 'dense',
      preferredWidgets: ['fleet-map', 'route-optimization', 'delivery-tracker', 'warehouse-status', 'driver-schedules'],
      chartUsage: 'realtime',
      workflowEmphasis: 'operations',
      interactionPatterns: ['dispatch', 'reroute', 'track', 'communicate'],
      visualHierarchyRules: {
        primaryEmphasis: 'fleet',
        secondaryEmphasis: 'routes',
        tertiaryEmphasis: 'deliveries',
      },
      dashboardCompositionStrategy: 'status-first',
      sectionArrangementBehavior: 'priority',
      colorPalette: {
        primary: '#1d4ed8',
        secondary: '#3b82f6',
        accent: '#f59e0b',
        background: '#eff6ff',
      },
      typography: {
        heading: 'Roboto',
        body: 'Roboto',
        mono: 'Fira Code',
      },
      spacing: {
        compact: 4,
        comfortable: 8,
        spacious: 16,
      },
    });
  }

  /**
   * Get archetype count
   */
  count(): number {
    return this.archetypes.size;
  }

  /**
   * Clear all archetypes
   */
  clear(): void {
    this.archetypes.clear();

    logger.info('ArchetypeRegistry', 'ALL_CLEARED', 'All archetypes cleared');
  }
}

export const archetypeRegistry = new ArchetypeRegistry();

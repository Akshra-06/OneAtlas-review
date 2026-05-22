/**
 * Dashboard Composition Engine
 * 
 * Composes domain-specific dashboard layouts.
 * Ensures different domains have fundamentally different dashboard structures.
 */

import { logger } from '../../shared/utils/logger';

import {
  ArchetypeDefinition,
} from '../../product/archetype/archetype-registry';

export interface DashboardSection {
  id: string;
  type: 'kpi' | 'chart' | 'list' | 'calendar' | 'pipeline' | 'table' | 'widget' | 'custom';
  title: string;
  priority: number;
  span: number;
  height: string;
  content: any;
}

export interface DashboardComposition {
  layout: 'grid' | 'masonry' | 'sidebar-content' | 'topbar-content' | 'calendar-first' | 'pipeline-first' | 'chart-dominant';
  sections: DashboardSection[];
  primaryFocus: string;
  secondaryFocus: string;
  density: 'dense' | 'compact' | 'comfortable' | 'spacious';
}

export interface DashboardCompositionConfig {
  enableLayoutMutation: boolean;
  enableSectionMutation: boolean;
  enableDensityMutation: boolean;
  enableFocusMutation: boolean;
}

const DEFAULT_CONFIG: DashboardCompositionConfig = {
  enableLayoutMutation: true,
  enableSectionMutation: true,
  enableDensityMutation: true,
  enableFocusMutation: true,
};

/**
 * Dashboard Composition Engine
 * 
 * Composes domain-specific dashboard layouts:
 * - Healthcare: scheduling-first, patient queues, urgency widgets, calendar-heavy
 * - CRM: pipeline-focused, compact action-heavy cards, activity stream priority
 * - Analytics: chart-dominant layouts, insight panels, high-density dashboards
 * - ATS: candidate pipelines, hiring stages, recruiter workflows
 */
export class DashboardCompositionEngine {
  private config: DashboardCompositionConfig;

  constructor(config: Partial<DashboardCompositionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Compose dashboard based on domain, archetype, and workflow
   */
  composeDashboard(domain: string, archetype: ArchetypeDefinition, workflow: string): DashboardComposition {
    const layout = this.config.enableLayoutMutation
      ? this.composeLayout(domain, workflow)
      : 'grid';

    const sections = this.config.enableSectionMutation
      ? this.composeSections(domain, workflow)
      : this.getDefaultSections();

    const density = this.config.enableDensityMutation
      ? this.composeDensity(domain, archetype)
      : 'comfortable';

    const primaryFocus = this.config.enableFocusMutation
      ? this.composePrimaryFocus(domain, workflow)
      : 'dashboard';

    const secondaryFocus = this.config.enableFocusMutation
      ? this.composeSecondaryFocus(domain, workflow)
      : 'data';

    const composition: DashboardComposition = {
      layout,
      sections,
      primaryFocus,
      secondaryFocus,
      density,
    };

    logger.info('DashboardCompositionEngine', 'DASHBOARD_COMPOSED', 'Dashboard composed based on domain/archetype/workflow', {
      domain,
      archetype: archetype.id,
      workflow,
      layout,
      sectionCount: sections.length,
      density,
    });

    return composition;
  }

  /**
   * Compose layout based on domain and workflow
   */
  private composeLayout(domain: string, workflow: string): DashboardComposition['layout'] {
    const layouts: Record<string, DashboardComposition['layout']> = {
      healthcare: 'calendar-first',
      crm: 'pipeline-first',
      analytics: 'chart-dominant',
      ecommerce: 'topbar-content',
      ats: 'pipeline-first',
      finance: 'chart-dominant',
      logistics: 'topbar-content',
      support: 'sidebar-content',
      project_management: 'masonry',
      education: 'sidebar-content',
    };

    // Workflow-based adjustments
    if (workflow === 'scheduling') {
      return 'calendar-first';
    }

    if (workflow === 'analysis') {
      return 'chart-dominant';
    }

    if (workflow === 'selling') {
      return 'pipeline-first';
    }

    return layouts[domain] || 'grid';
  }

  /**
   * Compose sections based on domain and workflow
   */
  private composeSections(domain: string, workflow: string): DashboardSection[] {
    const sectionCompositions: Record<string, DashboardSection[]> = {
      healthcare: this.composeHealthcareSections(),
      crm: this.composeCRMSections(),
      analytics: this.composeAnalyticsSections(),
      ecommerce: this.composeEcommerceSections(),
      ats: this.composeATSSections(),
      finance: this.composeFinanceSections(),
      logistics: this.composeLogisticsSections(),
      support: this.composeSupportSections(),
      project_management: this.composeProjectManagementSections(),
      education: this.composeEducationSections(),
    };

    // Workflow-based adjustments
    if (workflow === 'scheduling') {
      return this.composeSchedulingSections();
    }

    if (workflow === 'analysis') {
      return this.composeAnalysisSections();
    }

    if (workflow === 'selling') {
      return this.composeSellingSections();
    }

    return sectionCompositions[domain] || this.getDefaultSections();
  }

  /**
   * Compose healthcare sections
   */
  private composeHealthcareSections(): DashboardSection[] {
    return [
      {
        id: 'patient-queue',
        type: 'list',
        title: 'Patient Queue',
        priority: 10,
        span: 4,
        height: '400px',
        content: { type: 'patient-list', showStatus: true, showUrgency: true },
      },
      {
        id: 'appointments-calendar',
        type: 'calendar',
        title: 'Appointments',
        priority: 10,
        span: 8,
        height: '400px',
        content: { type: 'appointment-calendar', showAvailability: true },
      },
      {
        id: 'urgency-widgets',
        type: 'widget',
        title: 'Urgency Indicators',
        priority: 9,
        span: 6,
        height: '200px',
        content: { type: 'urgency-panel', showCritical: true, showHigh: true },
      },
      {
        id: 'patient-status',
        type: 'kpi',
        title: 'Patient Status',
        priority: 9,
        span: 6,
        height: '200px',
        content: { type: 'patient-status-kpi', showWaitTime: true, showUtilization: true },
      },
      {
        id: 'medical-records',
        type: 'list',
        title: 'Recent Records',
        priority: 7,
        span: 12,
        height: '300px',
        content: { type: 'medical-records-list', showRecent: true },
      },
    ];
  }

  /**
   * Compose CRM sections
   */
  private composeCRMSections(): DashboardSection[] {
    return [
      {
        id: 'sales-pipeline',
        type: 'pipeline',
        title: 'Sales Pipeline',
        priority: 10,
        span: 12,
        height: '500px',
        content: { type: 'pipeline-kanban', showStages: true, showValue: true },
      },
      {
        id: 'activity-stream',
        type: 'list',
        title: 'Activity Stream',
        priority: 8,
        span: 6,
        height: '400px',
        content: { type: 'activity-feed', showRecent: true, showAll: false },
      },
      {
        id: 'lead-actions',
        type: 'widget',
        title: 'Quick Actions',
        priority: 9,
        span: 6,
        height: '200px',
        content: { type: 'action-panel', actions: ['call', 'email', 'schedule', 'note'] },
      },
      {
        id: 'pipeline-metrics',
        type: 'kpi',
        title: 'Pipeline Metrics',
        priority: 8,
        span: 6,
        height: '200px',
        content: { type: 'pipeline-kpi', showValue: true, showVelocity: true },
      },
    ];
  }

  /**
   * Compose analytics sections
   */
  private composeAnalyticsSections(): DashboardSection[] {
    return [
      {
        id: 'key-insights',
        type: 'widget',
        title: 'Key Insights',
        priority: 10,
        span: 12,
        height: '150px',
        content: { type: 'insight-panel', showAI: true, showTrends: true },
      },
      {
        id: 'trend-charts',
        type: 'chart',
        title: 'Trends',
        priority: 9,
        span: 8,
        height: '350px',
        content: { type: 'trend-chart', showComparison: true, showForecast: true },
      },
      {
        id: 'funnel-chart',
        type: 'chart',
        title: 'Conversion Funnel',
        priority: 8,
        span: 4,
        height: '350px',
        content: { type: 'funnel-chart', showStages: true, showDropoff: true },
      },
      {
        id: 'data-table',
        type: 'table',
        title: 'Detailed Data',
        priority: 7,
        span: 12,
        height: '400px',
        content: { type: 'data-table', showFilters: true, showExport: true },
      },
    ];
  }

  /**
   * Compose ecommerce sections
   */
  private composeEcommerceSections(): DashboardSection[] {
    return [
      {
        id: 'order-status',
        type: 'kpi',
        title: 'Order Status',
        priority: 10,
        span: 6,
        height: '200px',
        content: { type: 'order-status-kpi', showPending: true, showShipped: true },
      },
      {
        id: 'inventory-status',
        type: 'kpi',
        title: 'Inventory',
        priority: 9,
        span: 6,
        height: '200px',
        content: { type: 'inventory-kpi', showLowStock: true, showOutOfStock: true },
      },
      {
        id: 'recent-orders',
        type: 'list',
        title: 'Recent Orders',
        priority: 10,
        span: 8,
        height: '400px',
        content: { type: 'order-list', showStatus: true, showCustomer: true },
      },
      {
        id: 'fulfillment-status',
        type: 'widget',
        title: 'Fulfillment',
        priority: 8,
        span: 4,
        height: '400px',
        content: { type: 'fulfillment-panel', showShipping: true, showReturns: true },
      },
    ];
  }

  /**
   * Compose ATS sections
   */
  private composeATSSections(): DashboardSection[] {
    return [
      {
        id: 'candidate-pipeline',
        type: 'pipeline',
        title: 'Candidate Pipeline',
        priority: 10,
        span: 12,
        height: '500px',
        content: { type: 'candidate-pipeline', showStages: true, showScore: true },
      },
      {
        id: 'hiring-funnel',
        type: 'chart',
        title: 'Hiring Funnel',
        priority: 9,
        span: 6,
        height: '300px',
        content: { type: 'hiring-funnel', showConversion: true, showTimeToHire: true },
      },
      {
        id: 'recruiter-tasks',
        type: 'list',
        title: 'Recruiter Tasks',
        priority: 8,
        span: 6,
        height: '300px',
        content: { type: 'task-list', showPriority: true, showDueDate: true },
      },
      {
        id: 'upcoming-interviews',
        type: 'calendar',
        title: 'Upcoming Interviews',
        priority: 8,
        span: 12,
        height: '250px',
        content: { type: 'interview-calendar', showCandidate: true, showTime: true },
      },
    ];
  }

  /**
   * Compose finance sections
   */
  private composeFinanceSections(): DashboardSection[] {
    return [
      {
        id: 'financial-statements',
        type: 'kpi',
        title: 'Financial Statements',
        priority: 10,
        span: 12,
        height: '200px',
        content: { type: 'financial-kpi', showRevenue: true, showProfit: true, showCashFlow: true },
      },
      {
        id: 'revenue-chart',
        type: 'chart',
        title: 'Revenue Trends',
        priority: 9,
        span: 8,
        height: '350px',
        content: { type: 'revenue-chart', showComparison: true, showForecast: true },
      },
      {
        id: 'expense-breakdown',
        type: 'chart',
        title: 'Expense Breakdown',
        priority: 8,
        span: 4,
        height: '350px',
        content: { type: 'expense-chart', showByCategory: true, showTrend: true },
      },
      {
        id: 'budget-vs-actual',
        type: 'chart',
        title: 'Budget vs Actual',
        priority: 8,
        span: 12,
        height: '300px',
        content: { type: 'budget-chart', showVariance: true, showForecast: true },
      },
    ];
  }

  /**
   * Compose logistics sections
   */
  private composeLogisticsSections(): DashboardSection[] {
    return [
      {
        id: 'shipment-tracking',
        type: 'widget',
        title: 'Shipment Tracking',
        priority: 10,
        span: 12,
        height: '300px',
        content: { type: 'tracking-map', showRealTime: true, showRoutes: true },
      },
      {
        id: 'delivery-metrics',
        type: 'kpi',
        title: 'Delivery Metrics',
        priority: 9,
        span: 6,
        height: '200px',
        content: { type: 'delivery-kpi', showOnTime: true, showCost: true },
      },
      {
        id: 'fleet-status',
        type: 'widget',
        title: 'Fleet Status',
        priority: 8,
        span: 6,
        height: '200px',
        content: { type: 'fleet-panel', showUtilization: true, showMaintenance: true },
      },
      {
        id: 'warehouse-operations',
        type: 'list',
        title: 'Warehouse Operations',
        priority: 8,
        span: 12,
        height: '350px',
        content: { type: 'warehouse-list', showPicking: true, showPacking: true },
      },
    ];
  }

  /**
   * Compose support sections
   */
  private composeSupportSections(): DashboardSection[] {
    return [
      {
        id: 'ticket-queue',
        type: 'list',
        title: 'Ticket Queue',
        priority: 10,
        span: 8,
        height: '400px',
        content: { type: 'ticket-list', showPriority: true, showSLA: true },
      },
      {
        id: 'customer-info',
        type: 'widget',
        title: 'Customer Info',
        priority: 9,
        span: 4,
        height: '400px',
        content: { type: 'customer-panel', showHistory: true, showProfile: true },
      },
      {
        id: 'support-metrics',
        type: 'kpi',
        title: 'Support Metrics',
        priority: 8,
        span: 6,
        height: '200px',
        content: { type: 'support-kpi', showResponseTime: true, showSatisfaction: true },
      },
      {
        id: 'knowledge-base',
        type: 'widget',
        title: 'Knowledge Base',
        priority: 7,
        span: 6,
        height: '200px',
        content: { type: 'kb-panel', showPopular: true, showRecent: true },
      },
    ];
  }

  /**
   * Compose project management sections
   */
  private composeProjectManagementSections(): DashboardSection[] {
    return [
      {
        id: 'task-board',
        type: 'pipeline',
        title: 'Task Board',
        priority: 10,
        span: 12,
        height: '500px',
        content: { type: 'task-kanban', showStatus: true, showAssignee: true },
      },
      {
        id: 'project-timeline',
        type: 'chart',
        title: 'Project Timeline',
        priority: 9,
        span: 8,
        height: '350px',
        content: { type: 'gantt-chart', showMilestones: true, showDependencies: true },
      },
      {
        id: 'team-activity',
        type: 'list',
        title: 'Team Activity',
        priority: 8,
        span: 4,
        height: '350px',
        content: { type: 'team-feed', showAvatars: true, showUpdates: true },
      },
      {
        id: 'sprint-progress',
        type: 'kpi',
        title: 'Sprint Progress',
        priority: 8,
        span: 12,
        height: '200px',
        content: { type: 'sprint-kpi', showVelocity: true, showCompletion: true },
      },
    ];
  }

  /**
   * Compose education sections
   */
  private composeEducationSections(): DashboardSection[] {
    return [
      {
        id: 'course-catalog',
        type: 'list',
        title: 'Course Catalog',
        priority: 10,
        span: 8,
        height: '400px',
        content: { type: 'course-list', showProgress: true, showEnrollment: true },
      },
      {
        id: 'student-progress',
        type: 'kpi',
        title: 'Student Progress',
        priority: 9,
        span: 4,
        height: '400px',
        content: { type: 'student-kpi', showCompletion: true, showEngagement: true },
      },
      {
        id: 'assessment-results',
        type: 'chart',
        title: 'Assessment Results',
        priority: 8,
        span: 6,
        height: '300px',
        content: { type: 'assessment-chart', showScores: true, showTrends: true },
      },
      {
        id: 'learning-analytics',
        type: 'chart',
        title: 'Learning Analytics',
        priority: 8,
        span: 6,
        height: '300px',
        content: { type: 'learning-chart', showEngagement: true, showRetention: true },
      },
    ];
  }

  /**
   * Compose scheduling sections
   */
  private composeSchedulingSections(): DashboardSection[] {
    return [
      {
        id: 'calendar-view',
        type: 'calendar',
        title: 'Calendar',
        priority: 10,
        span: 12,
        height: '500px',
        content: { type: 'calendar', showAvailability: true, showBookings: true },
      },
      {
        id: 'availability',
        type: 'widget',
        title: 'Availability',
        priority: 9,
        span: 6,
        height: '250px',
        content: { type: 'availability-panel', showSlots: true, showConflicts: true },
      },
      {
        id: 'upcoming',
        type: 'list',
        title: 'Upcoming',
        priority: 8,
        span: 6,
        height: '250px',
        content: { type: 'upcoming-list', showTime: true, showDetails: true },
      },
    ];
  }

  /**
   * Compose analysis sections
   */
  private composeAnalysisSections(): DashboardSection[] {
    return [
      {
        id: 'insights-panel',
        type: 'widget',
        title: 'Insights',
        priority: 10,
        span: 12,
        height: '150px',
        content: { type: 'insights', showAI: true, showRecommendations: true },
      },
      {
        id: 'data-visualization',
        type: 'chart',
        title: 'Data Visualization',
        priority: 9,
        span: 12,
        height: '400px',
        content: { type: 'data-viz', showMultiple: true, showComparison: true },
      },
      {
        id: 'data-exploration',
        type: 'table',
        title: 'Data Exploration',
        priority: 8,
        span: 12,
        height: '350px',
        content: { type: 'data-table', showFilters: true, showDrillDown: true },
      },
    ];
  }

  /**
   * Compose selling sections
   */
  private composeSellingSections(): DashboardSection[] {
    return [
      {
        id: 'sales-pipeline',
        type: 'pipeline',
        title: 'Sales Pipeline',
        priority: 10,
        span: 12,
        height: '500px',
        content: { type: 'pipeline', showStages: true, showValue: true },
      },
      {
        id: 'lead-actions',
        type: 'widget',
        title: 'Lead Actions',
        priority: 9,
        span: 6,
        height: '250px',
        content: { type: 'actions', showQuick: true, showBulk: true },
      },
      {
        id: 'activity-feed',
        type: 'list',
        title: 'Activity Feed',
        priority: 8,
        span: 6,
        height: '250px',
        content: { type: 'activity', showRecent: true, showAll: false },
      },
    ];
  }

  /**
   * Compose density based on domain and archetype
   */
  private composeDensity(domain: string, archetype: ArchetypeDefinition): DashboardComposition['density'] {
    const densities: Record<string, DashboardComposition['density']> = {
      healthcare: 'comfortable',
      crm: 'compact',
      analytics: 'dense',
      ecommerce: 'compact',
      ats: 'compact',
      finance: 'dense',
      logistics: 'compact',
      support: 'comfortable',
      project_management: 'compact',
      education: 'comfortable',
    };

    return densities[domain] || 'comfortable';
  }

  /**
   * Compose primary focus based on domain and workflow
   */
  private composePrimaryFocus(domain: string, workflow: string): string {
    const focuses: Record<string, string> = {
      healthcare: 'scheduling',
      crm: 'pipeline',
      analytics: 'insights',
      ecommerce: 'orders',
      ats: 'candidates',
      finance: 'financials',
      logistics: 'shipments',
      support: 'tickets',
      project_management: 'tasks',
      education: 'courses',
    };

    if (workflow === 'scheduling') return 'scheduling';
    if (workflow === 'analysis') return 'insights';
    if (workflow === 'selling') return 'pipeline';

    return focuses[domain] || 'dashboard';
  }

  /**
   * Compose secondary focus based on domain and workflow
   */
  private composeSecondaryFocus(domain: string, workflow: string): string {
    const focuses: Record<string, string> = {
      healthcare: 'patients',
      crm: 'activity',
      analytics: 'data',
      ecommerce: 'inventory',
      ats: 'interviews',
      finance: 'reports',
      logistics: 'fleet',
      support: 'customers',
      project_management: 'team',
      education: 'students',
    };

    if (workflow === 'scheduling') return 'availability';
    if (workflow === 'analysis') return 'charts';
    if (workflow === 'selling') return 'leads';

    return focuses[domain] || 'data';
  }

  /**
   * Get default sections
   */
  private getDefaultSections(): DashboardSection[] {
    return [
      {
        id: 'dashboard-kpi',
        type: 'kpi',
        title: 'Dashboard',
        priority: 10,
        span: 12,
        height: '200px',
        content: {},
      },
      {
        id: 'data-section',
        type: 'table',
        title: 'Data',
        priority: 7,
        span: 12,
        height: '400px',
        content: {},
      },
    ];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DashboardCompositionConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('DashboardCompositionEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): DashboardCompositionConfig {
    return { ...this.config };
  }
}

export const dashboardCompositionEngine = new DashboardCompositionEngine();

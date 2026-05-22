/**
 * Widget Diversity Engine
 * 
 * Generates contextual widgets based on workflows.
 * Stops reusing the same KPI cards, activity sections, tables, charts.
 */

import { logger } from '../../shared/utils/logger';

import {
  ArchetypeDefinition,
} from '../../product/archetype/archetype-registry';

export interface WidgetDefinition {
  id: string;
  type: 'kpi' | 'card' | 'chart' | 'list' | 'table' | 'widget' | 'panel' | 'custom';
  title: string;
  content: any;
  styling: {
    size: 'small' | 'medium' | 'large' | 'xlarge';
    density: 'dense' | 'compact' | 'comfortable' | 'spacious';
    emphasis: 'primary' | 'secondary' | 'tertiary';
  };
  interactions: {
    clickable: boolean;
    draggable: boolean;
    expandable: boolean;
    filterable: boolean;
  };
}

export interface WidgetDiversityConfig {
  enableWidgetMutation: boolean;
  enableStylingMutation: boolean;
  enableInteractionMutation: boolean;
  enableContentMutation: boolean;
}

const DEFAULT_CONFIG: WidgetDiversityConfig = {
  enableWidgetMutation: true,
  enableStylingMutation: true,
  enableInteractionMutation: true,
  enableContentMutation: true,
};

/**
 * Widget Diversity Engine
 * 
 * Generates contextual widgets based on workflows:
 * - Stop reusing same KPI cards
 * - Stop reusing same activity sections
 * - Stop reusing same tables
 * - Stop reusing same charts
 * - Generate contextual widgets based on workflows
 */
export class WidgetDiversityEngine {
  private config: WidgetDiversityConfig;

  constructor(config: Partial<WidgetDiversityConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate widgets based on domain, archetype, and workflow
   */
  generateWidgets(domain: string, archetype: ArchetypeDefinition, workflow: string): WidgetDefinition[] {
    const widgets = this.config.enableWidgetMutation
      ? this.generateDomainWidgets(domain, workflow)
      : this.getDefaultWidgets();

    logger.info('WidgetDiversityEngine', 'WIDGETS_GENERATED', 'Widgets generated based on domain/archetype/workflow', {
      domain,
      archetype: archetype.id,
      workflow,
      widgetCount: widgets.length,
    });

    return widgets;
  }

  /**
   * Generate domain-specific widgets
   */
  private generateDomainWidgets(domain: string, workflow: string): WidgetDefinition[] {
    const widgetGenerators: Record<string, () => WidgetDefinition[]> = {
      healthcare: () => this.generateHealthcareWidgets(),
      crm: () => this.generateCRMWidgets(),
      analytics: () => this.generateAnalyticsWidgets(),
      ecommerce: () => this.generateEcommerceWidgets(),
      ats: () => this.generateATSWidgets(),
      finance: () => this.generateFinanceWidgets(),
      logistics: () => this.generateLogisticsWidgets(),
      support: () => this.generateSupportWidgets(),
      project_management: () => this.generateProjectManagementWidgets(),
      education: () => this.generateEducationWidgets(),
    };

    // Workflow-based adjustments
    if (workflow === 'scheduling') {
      return this.generateSchedulingWidgets();
    }

    if (workflow === 'analysis') {
      return this.generateAnalysisWidgets();
    }

    if (workflow === 'selling') {
      return this.generateSellingWidgets();
    }

    const generator = widgetGenerators[domain];
    return generator ? generator() : this.getDefaultWidgets();
  }

  /**
   * Generate healthcare widgets
   */
  private generateHealthcareWidgets(): WidgetDefinition[] {
    return [
      {
        id: 'patient-status-card',
        type: 'card',
        title: 'Patient Status',
        content: {
          type: 'patient-status',
          showUrgency: true,
          showWaitTime: true,
          showLastVisit: true,
        },
        styling: {
          size: 'medium',
          density: 'comfortable',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'appointment-calendar-widget',
        type: 'widget',
        title: 'Appointments',
        content: {
          type: 'appointment-calendar',
          showAvailability: true,
          showConflicts: true,
          showQuickBook: true,
        },
        styling: {
          size: 'large',
          density: 'comfortable',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'urgency-indicator-panel',
        type: 'panel',
        title: 'Urgency Indicators',
        content: {
          type: 'urgency-panel',
          showCritical: true,
          showHigh: true,
          showMedium: true,
          colorCode: true,
        },
        styling: {
          size: 'small',
          density: 'comfortable',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: false,
          filterable: false,
        },
      },
      {
        id: 'medication-tracker',
        type: 'list',
        title: 'Medication Tracker',
        content: {
          type: 'medication-list',
          showDosage: true,
          showTiming: true,
          showRefills: true,
        },
        styling: {
          size: 'medium',
          density: 'comfortable',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'lab-results-display',
        type: 'card',
        title: 'Lab Results',
        content: {
          type: 'lab-results',
          showTrends: true,
          showAbnormal: true,
          showHistory: true,
        },
        styling: {
          size: 'medium',
          density: 'comfortable',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
    ];
  }

  /**
   * Generate CRM widgets
   */
  private generateCRMWidgets(): WidgetDefinition[] {
    return [
      {
        id: 'pipeline-kanban-widget',
        type: 'widget',
        title: 'Sales Pipeline',
        content: {
          type: 'pipeline-kanban',
          showStages: true,
          showValue: true,
          showProbability: true,
          dragDrop: true,
        },
        styling: {
          size: 'large',
          density: 'compact',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: true,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'lead-action-card',
        type: 'card',
        title: 'Lead Actions',
        content: {
          type: 'action-card',
          actions: ['call', 'email', 'schedule', 'note', 'task'],
          showQuickActions: true,
          showBulkActions: true,
        },
        styling: {
          size: 'small',
          density: 'compact',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: false,
          filterable: false,
        },
      },
      {
        id: 'activity-stream-widget',
        type: 'list',
        title: 'Activity Stream',
        content: {
          type: 'activity-feed',
          showRecent: true,
          showAll: false,
          showFilter: true,
          showMentions: true,
        },
        styling: {
          size: 'medium',
          density: 'compact',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'deal-value-tracker',
        type: 'kpi',
        title: 'Pipeline Value',
        content: {
          type: 'pipeline-kpi',
          showTotalValue: true,
          showWeightedValue: true,
          showVelocity: true,
          showConversion: true,
        },
        styling: {
          size: 'medium',
          density: 'compact',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: false,
        },
      },
    ];
  }

  /**
   * Generate analytics widgets
   */
  private generateAnalyticsWidgets(): WidgetDefinition[] {
    return [
      {
        id: 'insight-panel-widget',
        type: 'panel',
        title: 'Key Insights',
        content: {
          type: 'insight-panel',
          showAI: true,
          showTrends: true,
          showRecommendations: true,
          showAnomalies: true,
        },
        styling: {
          size: 'medium',
          density: 'dense',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: false,
        },
      },
      {
        id: 'trend-comparison-chart',
        type: 'chart',
        title: 'Trend Comparison',
        content: {
          type: 'trend-chart',
          showComparison: true,
          showForecast: true,
          showConfidence: true,
          showAnnotations: true,
        },
        styling: {
          size: 'large',
          density: 'dense',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'conversion-funnel-chart',
        type: 'chart',
        title: 'Conversion Funnel',
        content: {
          type: 'funnel-chart',
          showStages: true,
          showDropoff: true,
          showTimeInStage: true,
          showComparison: true,
        },
        styling: {
          size: 'medium',
          density: 'dense',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'data-exploration-table',
        type: 'table',
        title: 'Data Exploration',
        content: {
          type: 'data-table',
          showFilters: true,
          showSort: true,
          showExport: true,
          showDrillDown: true,
        },
        styling: {
          size: 'large',
          density: 'dense',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
    ];
  }

  /**
   * Generate ecommerce widgets
   */
  private generateEcommerceWidgets(): WidgetDefinition[] {
    return [
      {
        id: 'order-status-widget',
        type: 'kpi',
        title: 'Order Status',
        content: {
          type: 'order-status-kpi',
          showPending: true,
          showProcessing: true,
          showShipped: true,
          showDelivered: true,
        },
        styling: {
          size: 'medium',
          density: 'compact',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'inventory-alert-widget',
        type: 'panel',
        title: 'Inventory Alerts',
        content: {
          type: 'inventory-alert',
          showLowStock: true,
          showOutOfStock: true,
          showReorderNeeded: true,
          showSupplier: true,
        },
        styling: {
          size: 'small',
          density: 'compact',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: false,
          filterable: true,
        },
      },
      {
        id: 'fulfillment-tracker',
        type: 'list',
        title: 'Fulfillment Tracker',
        content: {
          type: 'fulfillment-list',
          showShipping: true,
          showReturns: true,
          showDelays: true,
          showCarrier: true,
        },
        styling: {
          size: 'medium',
          density: 'compact',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'customer-segment-widget',
        type: 'card',
        title: 'Customer Segments',
        content: {
          type: 'customer-segment',
          showSegments: true,
          showValue: true,
          showGrowth: true,
        },
        styling: {
          size: 'medium',
          density: 'compact',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
    ];
  }

  /**
   * Generate ATS widgets
   */
  private generateATSWidgets(): WidgetDefinition[] {
    return [
      {
        id: 'candidate-pipeline-widget',
        type: 'widget',
        title: 'Candidate Pipeline',
        content: {
          type: 'candidate-pipeline',
          showStages: true,
          showScore: true,
          showSource: true,
          dragDrop: true,
        },
        styling: {
          size: 'large',
          density: 'compact',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: true,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'hiring-funnel-chart',
        type: 'chart',
        title: 'Hiring Funnel',
        content: {
          type: 'hiring-funnel',
          showConversion: true,
          showTimeToHire: true,
          showCostPerHire: true,
          showSourceAttribution: true,
        },
        styling: {
          size: 'medium',
          density: 'compact',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'interview-scheduler',
        type: 'widget',
        title: 'Interview Scheduler',
        content: {
          type: 'interview-scheduler',
          showCalendar: true,
          showAvailability: true,
          showCandidate: true,
          showPanel: true,
        },
        styling: {
          size: 'medium',
          density: 'compact',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'recruiter-task-list',
        type: 'list',
        title: 'Recruiter Tasks',
        content: {
          type: 'task-list',
          showPriority: true,
          showDueDate: true,
          showCandidate: true,
          showQuickComplete: true,
        },
        styling: {
          size: 'medium',
          density: 'compact',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
    ];
  }

  /**
   * Generate finance widgets
   */
  private generateFinanceWidgets(): WidgetDefinition[] {
    return [
      {
        id: 'financial-summary-widget',
        type: 'kpi',
        title: 'Financial Summary',
        content: {
          type: 'financial-kpi',
          showRevenue: true,
          showProfit: true,
          showCashFlow: true,
          showExpenses: true,
        },
        styling: {
          size: 'medium',
          density: 'dense',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: false,
        },
      },
      {
        id: 'revenue-trend-chart',
        type: 'chart',
        title: 'Revenue Trends',
        content: {
          type: 'revenue-chart',
          showComparison: true,
          showForecast: true,
          showVariance: true,
          showSegmentation: true,
        },
        styling: {
          size: 'large',
          density: 'dense',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'budget-variance-widget',
        type: 'chart',
        title: 'Budget vs Actual',
        content: {
          type: 'budget-chart',
          showVariance: true,
          showForecast: true,
          showCategoryBreakdown: true,
          showTrend: true,
        },
        styling: {
          size: 'medium',
          density: 'dense',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'compliance-indicator',
        type: 'panel',
        title: 'Compliance Status',
        content: {
          type: 'compliance-panel',
          showAuditStatus: true,
          showRegulatory: true,
          showRisk: true,
          showActions: true,
        },
        styling: {
          size: 'small',
          density: 'dense',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: false,
          filterable: false,
        },
      },
    ];
  }

  /**
   * Generate logistics widgets
   */
  private generateLogisticsWidgets(): WidgetDefinition[] {
    return [
      {
        id: 'tracking-map-widget',
        type: 'widget',
        title: 'Shipment Tracking',
        content: {
          type: 'tracking-map',
          showRealTime: true,
          showRoutes: true,
          showETA: true,
          showDelays: true,
        },
        styling: {
          size: 'large',
          density: 'compact',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'delivery-metrics-widget',
        type: 'kpi',
        title: 'Delivery Metrics',
        content: {
          type: 'delivery-kpi',
          showOnTime: true,
          showCost: true,
          showCustomerSatisfaction: true,
          showRouteEfficiency: true,
        },
        styling: {
          size: 'medium',
          density: 'compact',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: false,
        },
      },
      {
        id: 'fleet-status-widget',
        type: 'panel',
        title: 'Fleet Status',
        content: {
          type: 'fleet-panel',
          showUtilization: true,
          showMaintenance: true,
          showFuel: true,
          showDriver: true,
        },
        styling: {
          size: 'medium',
          density: 'compact',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'warehouse-operations-widget',
        type: 'list',
        title: 'Warehouse Operations',
        content: {
          type: 'warehouse-list',
          showPicking: true,
          showPacking: true,
          showShipping: true,
          showReturns: true,
        },
        styling: {
          size: 'medium',
          density: 'compact',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
    ];
  }

  /**
   * Generate support widgets
   */
  private generateSupportWidgets(): WidgetDefinition[] {
    return [
      {
        id: 'ticket-queue-widget',
        type: 'list',
        title: 'Ticket Queue',
        content: {
          type: 'ticket-list',
          showPriority: true,
          showSLA: true,
          showAssignee: true,
          showStatus: true,
        },
        styling: {
          size: 'large',
          density: 'comfortable',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'customer-info-widget',
        type: 'panel',
        title: 'Customer Info',
        content: {
          type: 'customer-panel',
          showHistory: true,
          showProfile: true,
          showContact: true,
          showPreferences: true,
        },
        styling: {
          size: 'medium',
          density: 'comfortable',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: false,
        },
      },
      {
        id: 'support-metrics-widget',
        type: 'kpi',
        title: 'Support Metrics',
        content: {
          type: 'support-kpi',
          showResponseTime: true,
          showSatisfaction: true,
          showResolutionTime: true,
          showTicketVolume: true,
        },
        styling: {
          size: 'medium',
          density: 'comfortable',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: false,
        },
      },
      {
        id: 'knowledge-base-widget',
        type: 'panel',
        title: 'Knowledge Base',
        content: {
          type: 'kb-panel',
          showPopular: true,
          showRecent: true,
          showSearch: true,
          showCategories: true,
        },
        styling: {
          size: 'small',
          density: 'comfortable',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: false,
          filterable: true,
        },
      },
    ];
  }

  /**
   * Generate project management widgets
   */
  private generateProjectManagementWidgets(): WidgetDefinition[] {
    return [
      {
        id: 'task-board-widget',
        type: 'widget',
        title: 'Task Board',
        content: {
          type: 'task-kanban',
          showStatus: true,
          showAssignee: true,
          showPriority: true,
          dragDrop: true,
        },
        styling: {
          size: 'large',
          density: 'compact',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: true,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'project-timeline-widget',
        type: 'chart',
        title: 'Project Timeline',
        content: {
          type: 'gantt-chart',
          showMilestones: true,
          showDependencies: true,
          showProgress: true,
          showCriticalPath: true,
        },
        styling: {
          size: 'large',
          density: 'compact',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'team-activity-widget',
        type: 'list',
        title: 'Team Activity',
        content: {
          type: 'team-feed',
          showAvatars: true,
          showUpdates: true,
          showComments: true,
          showMentions: true,
        },
        styling: {
          size: 'medium',
          density: 'compact',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'sprint-progress-widget',
        type: 'kpi',
        title: 'Sprint Progress',
        content: {
          type: 'sprint-kpi',
          showVelocity: true,
          showCompletion: true,
          showBurndown: true,
          showBlockers: true,
        },
        styling: {
          size: 'medium',
          density: 'compact',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: false,
        },
      },
    ];
  }

  /**
   * Generate education widgets
   */
  private generateEducationWidgets(): WidgetDefinition[] {
    return [
      {
        id: 'course-catalog-widget',
        type: 'list',
        title: 'Course Catalog',
        content: {
          type: 'course-list',
          showProgress: true,
          showEnrollment: true,
          showRating: true,
          showInstructor: true,
        },
        styling: {
          size: 'large',
          density: 'comfortable',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'student-progress-widget',
        type: 'kpi',
        title: 'Student Progress',
        content: {
          type: 'student-kpi',
          showCompletion: true,
          showEngagement: true,
          showPerformance: true,
          showAttendance: true,
        },
        styling: {
          size: 'medium',
          density: 'comfortable',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: false,
        },
      },
      {
        id: 'assessment-results-widget',
        type: 'chart',
        title: 'Assessment Results',
        content: {
          type: 'assessment-chart',
          showScores: true,
          showTrends: true,
          showComparison: true,
          showDistribution: true,
        },
        styling: {
          size: 'medium',
          density: 'comfortable',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'learning-analytics-widget',
        type: 'chart',
        title: 'Learning Analytics',
        content: {
          type: 'learning-chart',
          showEngagement: true,
          showRetention: true,
          showCompletion: true,
          showTimeSpent: true,
        },
        styling: {
          size: 'medium',
          density: 'comfortable',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
    ];
  }

  /**
   * Generate scheduling widgets
   */
  private generateSchedulingWidgets(): WidgetDefinition[] {
    return [
      {
        id: 'calendar-view-widget',
        type: 'widget',
        title: 'Calendar',
        content: {
          type: 'calendar',
          showAvailability: true,
          showBookings: true,
          showConflicts: true,
          showQuickBook: true,
        },
        styling: {
          size: 'large',
          density: 'comfortable',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'availability-widget',
        type: 'panel',
        title: 'Availability',
        content: {
          type: 'availability-panel',
          showSlots: true,
          showConflicts: true,
          showBuffer: true,
          showRecurring: true,
        },
        styling: {
          size: 'medium',
          density: 'comfortable',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'upcoming-widget',
        type: 'list',
        title: 'Upcoming',
        content: {
          type: 'upcoming-list',
          showTime: true,
          showDetails: true,
          showLocation: true,
          showAttendees: true,
        },
        styling: {
          size: 'medium',
          density: 'comfortable',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
    ];
  }

  /**
   * Generate analysis widgets
   */
  private generateAnalysisWidgets(): WidgetDefinition[] {
    return [
      {
        id: 'insights-widget',
        type: 'panel',
        title: 'Insights',
        content: {
          type: 'insights',
          showAI: true,
          showRecommendations: true,
          showTrends: true,
          showAnomalies: true,
        },
        styling: {
          size: 'medium',
          density: 'dense',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: false,
        },
      },
      {
        id: 'data-viz-widget',
        type: 'chart',
        title: 'Data Visualization',
        content: {
          type: 'data-viz',
          showMultiple: true,
          showComparison: true,
          showDrillDown: true,
          showExport: true,
        },
        styling: {
          size: 'large',
          density: 'dense',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'data-table-widget',
        type: 'table',
        title: 'Data Table',
        content: {
          type: 'data-table',
          showFilters: true,
          showSort: true,
          showExport: true,
          showDrillDown: true,
        },
        styling: {
          size: 'large',
          density: 'dense',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
    ];
  }

  /**
   * Generate selling widgets
   */
  private generateSellingWidgets(): WidgetDefinition[] {
    return [
      {
        id: 'pipeline-widget',
        type: 'widget',
        title: 'Sales Pipeline',
        content: {
          type: 'pipeline',
          showStages: true,
          showValue: true,
          showProbability: true,
          dragDrop: true,
        },
        styling: {
          size: 'large',
          density: 'compact',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: true,
          expandable: true,
          filterable: true,
        },
      },
      {
        id: 'actions-widget',
        type: 'panel',
        title: 'Lead Actions',
        content: {
          type: 'actions',
          showQuick: true,
          showBulk: true,
          showTemplates: true,
          showAutomation: true,
        },
        styling: {
          size: 'small',
          density: 'compact',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: false,
          filterable: false,
        },
      },
      {
        id: 'activity-widget',
        type: 'list',
        title: 'Activity Feed',
        content: {
          type: 'activity',
          showRecent: true,
          showAll: false,
          showFilter: true,
          showMentions: true,
        },
        styling: {
          size: 'medium',
          density: 'compact',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
    ];
  }

  /**
   * Get default widgets
   */
  private getDefaultWidgets(): WidgetDefinition[] {
    return [
      {
        id: 'default-kpi',
        type: 'kpi',
        title: 'Dashboard',
        content: {},
        styling: {
          size: 'medium',
          density: 'comfortable',
          emphasis: 'primary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: false,
          filterable: false,
        },
      },
      {
        id: 'default-data',
        type: 'table',
        title: 'Data',
        content: {},
        styling: {
          size: 'large',
          density: 'comfortable',
          emphasis: 'secondary',
        },
        interactions: {
          clickable: true,
          draggable: false,
          expandable: true,
          filterable: true,
        },
      },
    ];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<WidgetDiversityConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('WidgetDiversityEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): WidgetDiversityConfig {
    return { ...this.config };
  }
}

export const widgetDiversityEngine = new WidgetDiversityEngine();

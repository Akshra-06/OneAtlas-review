/**
 * Workflow-Centric Rendering Engine
 * 
 * Organizes UI around operational workflows, NOT generic dashboard templates.
 * Ensures UI flows around user tasks, not data structures.
 */

import { logger } from '../../shared/utils/logger';

import {
  ArchetypeDefinition,
} from '../../product/archetype/archetype-registry';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'action' | 'decision' | 'review' | 'approval' | 'notification' | 'completion';
  priority: number;
  frequency: number;
  uiComponent: string;
  actions: string[];
}

export interface WorkflowCentricLayout {
  workflowType: string;
  steps: WorkflowStep[];
  primaryActions: string[];
  secondaryActions: string[];
  contextualAreas: string[];
  sectionOrder: string[];
  actionPriorities: Record<string, number>;
  workflowFlow: 'linear' | 'parallel' | 'branched' | 'cyclic';
}

export interface WorkflowCentricConfig {
  enableWorkflowPrioritization: boolean;
  enableActionSurface: boolean;
  enableSectionReordering: boolean;
  enableContextualAreas: boolean;
  enableWorkflowFlow: boolean;
}

const DEFAULT_CONFIG: WorkflowCentricConfig = {
  enableWorkflowPrioritization: true,
  enableActionSurface: true,
  enableSectionReordering: true,
  enableContextualAreas: true,
  enableWorkflowFlow: true,
};

/**
 * Workflow-Centric Rendering Engine
 * 
 * Organizes UI around operational workflows:
 * - Workflow prioritization
 * - Action surfacing
 * - Section reordering
 * - Contextual action areas
 * - Workflow flow visualization
 */
export class WorkflowCentricRenderingEngine {
  private config: WorkflowCentricConfig;

  constructor(config: Partial<WorkflowCentricConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Render workflow-centric layout based on domain, archetype, and workflow
   */
  renderWorkflowCentricLayout(domain: string, archetype: ArchetypeDefinition, workflow: string): WorkflowCentricLayout {
    const steps = this.config.enableWorkflowPrioritization
      ? this.generateWorkflowSteps(domain, workflow)
      : this.getDefaultWorkflowSteps();

    const primaryActions = this.config.enableActionSurface
      ? this.determinePrimaryActions(domain, workflow)
      : [];

    const secondaryActions = this.config.enableActionSurface
      ? this.determineSecondaryActions(domain, workflow)
      : [];

    const contextualAreas = this.config.enableContextualAreas
      ? this.generateContextualAreas(domain, workflow)
      : [];

    const sectionOrder = this.config.enableSectionReordering
      ? this.determineSectionOrder(domain, workflow)
      : this.getDefaultSectionOrder();

    const actionPriorities = this.config.enableWorkflowPrioritization
      ? this.calculateActionPriorities(domain, workflow)
      : {};

    const workflowFlow = this.config.enableWorkflowFlow
      ? this.determineWorkflowFlow(domain, workflow)
      : 'linear';

    const layout: WorkflowCentricLayout = {
      workflowType: workflow,
      steps,
      primaryActions,
      secondaryActions,
      contextualAreas,
      sectionOrder,
      actionPriorities,
      workflowFlow,
    };

    logger.info('WorkflowCentricRenderingEngine', 'WORKFLOW_RENDERED', 'Workflow-centric layout rendered', {
      domain,
      archetype: archetype.id,
      workflow,
      stepCount: steps.length,
      primaryActionCount: primaryActions.length,
      workflowFlow,
    });

    return layout;
  }

  /**
   * Generate workflow steps based on domain and workflow
   */
  private generateWorkflowSteps(domain: string, workflow: string): WorkflowStep[] {
    const workflowSteps: Record<string, WorkflowStep[]> = {
      healthcare: this.generateHealthcareWorkflowSteps(),
      crm: this.generateCRMWorkflowSteps(),
      analytics: this.generateAnalyticsWorkflowSteps(),
      ecommerce: this.generateEcommerceWorkflowSteps(),
      ats: this.generateATSWorkflowSteps(),
      finance: this.generateFinanceWorkflowSteps(),
      logistics: this.generateLogisticsWorkflowSteps(),
      support: this.generateSupportWorkflowSteps(),
      project_management: this.generateProjectManagementWorkflowSteps(),
      education: this.generateEducationWorkflowSteps(),
    };

    // Workflow-based adjustments
    if (workflow === 'scheduling') {
      return this.generateSchedulingWorkflowSteps();
    }

    if (workflow === 'analysis') {
      return this.generateAnalysisWorkflowSteps();
    }

    if (workflow === 'selling') {
      return this.generateSellingWorkflowSteps();
    }

    return workflowSteps[domain] || this.getDefaultWorkflowSteps();
  }

  /**
   * Generate healthcare workflow steps
   */
  private generateHealthcareWorkflowSteps(): WorkflowStep[] {
    return [
      {
        id: 'patient-intake',
        name: 'Patient Intake',
        type: 'action',
        priority: 10,
        frequency: 0.8,
        uiComponent: 'patient-intake-form',
        actions: ['collect-info', 'verify-insurance', 'assign-provider'],
      },
      {
        id: 'appointment-scheduling',
        name: 'Schedule Appointment',
        type: 'action',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'appointment-scheduler',
        actions: ['check-availability', 'book-slot', 'send-confirmation'],
      },
      {
        id: 'treatment-planning',
        name: 'Treatment Planning',
        type: 'decision',
        priority: 9,
        frequency: 0.7,
        uiComponent: 'treatment-planner',
        actions: ['review-history', 'create-plan', 'assign-tasks'],
      },
      {
        id: 'medication-management',
        name: 'Medication Management',
        type: 'action',
        priority: 8,
        frequency: 0.6,
        uiComponent: 'medication-manager',
        actions: ['prescribe', 'track-dosage', 'manage-refills'],
      },
      {
        id: 'lab-review',
        name: 'Lab Results Review',
        type: 'review',
        priority: 8,
        frequency: 0.5,
        uiComponent: 'lab-reviewer',
        actions: ['view-results', 'compare-trends', 'flag-abnormal'],
      },
      {
        id: 'discharge-planning',
        name: 'Discharge Planning',
        type: 'completion',
        priority: 7,
        frequency: 0.4,
        uiComponent: 'discharge-planner',
        actions: ['plan-discharge', 'schedule-followup', 'provide-instructions'],
      },
    ];
  }

  /**
   * Generate CRM workflow steps
   */
  private generateCRMWorkflowSteps(): WorkflowStep[] {
    return [
      {
        id: 'lead-capture',
        name: 'Lead Capture',
        type: 'action',
        priority: 10,
        frequency: 0.8,
        uiComponent: 'lead-capture-form',
        actions: ['collect-info', 'score-lead', 'assign-owner'],
      },
      {
        id: 'lead-qualification',
        name: 'Lead Qualification',
        type: 'decision',
        priority: 10,
        frequency: 0.7,
        uiComponent: 'lead-qualifier',
        actions: ['evaluate-fit', 'assess-budget', 'determine-timeline'],
      },
      {
        id: 'pipeline-movement',
        name: 'Move Through Pipeline',
        type: 'action',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'pipeline-mover',
        actions: ['advance-stage', 'update-probability', 'log-activity'],
      },
      {
        id: 'customer-engagement',
        name: 'Customer Engagement',
        type: 'action',
        priority: 9,
        frequency: 0.8,
        uiComponent: 'engagement-manager',
        actions: ['call', 'email', 'schedule-meeting', 'send-proposal'],
      },
      {
        id: 'opportunity-closing',
        name: 'Close Opportunity',
        type: 'completion',
        priority: 9,
        frequency: 0.6,
        uiComponent: 'opportunity-closer',
        actions: ['negotiate', 'send-contract', 'finalize-deal'],
      },
    ];
  }

  /**
   * Generate analytics workflow steps
   */
  private generateAnalyticsWorkflowSteps(): WorkflowStep[] {
    return [
      {
        id: 'data-exploration',
        name: 'Explore Data',
        type: 'action',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'data-explorer',
        actions: ['filter-data', 'sort-data', 'drill-down'],
      },
      {
        id: 'insight-discovery',
        name: 'Discover Insights',
        type: 'decision',
        priority: 10,
        frequency: 0.8,
        uiComponent: 'insight-discoverer',
        actions: ['analyze-trends', 'identify-patterns', 'detect-anomalies'],
      },
      {
        id: 'visualization-creation',
        name: 'Create Visualizations',
        type: 'action',
        priority: 9,
        frequency: 0.7,
        uiComponent: 'visualization-creator',
        actions: ['select-chart-type', 'configure-axes', 'apply-filters'],
      },
      {
        id: 'report-generation',
        name: 'Generate Reports',
        type: 'action',
        priority: 8,
        frequency: 0.6,
        uiComponent: 'report-generator',
        actions: ['select-metrics', 'choose-format', 'schedule-delivery'],
      },
      {
        id: 'sharing-collaboration',
        name: 'Share & Collaborate',
        type: 'action',
        priority: 7,
        frequency: 0.5,
        uiComponent: 'sharing-manager',
        actions: ['share-dashboard', 'add-collaborators', 'set-permissions'],
      },
    ];
  }

  /**
   * Generate ecommerce workflow steps
   */
  private generateEcommerceWorkflowSteps(): WorkflowStep[] {
    return [
      {
        id: 'order-processing',
        name: 'Process Order',
        type: 'action',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'order-processor',
        actions: ['verify-payment', 'confirm-inventory', 'generate-invoice'],
      },
      {
        id: 'inventory-management',
        name: 'Manage Inventory',
        type: 'action',
        priority: 10,
        frequency: 0.8,
        uiComponent: 'inventory-manager',
        actions: ['check-stock', 'reorder-items', 'update-quantity'],
      },
      {
        id: 'fulfillment-orchestration',
        name: 'Orchestrate Fulfillment',
        type: 'action',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'fulfillment-orchestrator',
        actions: ['pick-items', 'pack-order', 'generate-shipping-label'],
      },
      {
        id: 'shipping-tracking',
        name: 'Track Shipments',
        type: 'review',
        priority: 9,
        frequency: 0.7,
        uiComponent: 'shipment-tracker',
        actions: ['view-status', 'estimate-delivery', 'handle-exceptions'],
      },
      {
        id: 'returns-processing',
        name: 'Process Returns',
        type: 'action',
        priority: 8,
        frequency: 0.4,
        uiComponent: 'returns-processor',
        actions: ['authorize-return', 'issue-refund', 'restock-item'],
      },
    ];
  }

  /**
   * Generate ATS workflow steps
   */
  private generateATSWorkflowSteps(): WorkflowStep[] {
    return [
      {
        id: 'candidate-sourcing',
        name: 'Source Candidates',
        type: 'action',
        priority: 10,
        frequency: 0.7,
        uiComponent: 'candidate-sourcer',
        actions: ['search-resumes', 'post-jobs', 'import-candidates'],
      },
      {
        id: 'candidate-screening',
        name: 'Screen Candidates',
        type: 'decision',
        priority: 10,
        frequency: 0.8,
        uiComponent: 'candidate-screener',
        actions: ['review-resume', 'assess-skills', 'score-candidate'],
      },
      {
        id: 'interview-scheduling',
        name: 'Schedule Interviews',
        type: 'action',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'interview-scheduler',
        actions: ['check-availability', 'book-slot', 'send-invite'],
      },
      {
        id: 'interview-conducting',
        name: 'Conduct Interviews',
        type: 'review',
        priority: 9,
        frequency: 0.8,
        uiComponent: 'interview-conductor',
        actions: ['review-notes', 'rate-candidate', 'provide-feedback'],
      },
      {
        id: 'offer-management',
        name: 'Manage Offers',
        type: 'action',
        priority: 9,
        frequency: 0.6,
        uiComponent: 'offer-manager',
        actions: ['create-offer', 'negotiate-terms', 'track-acceptance'],
      },
      {
        id: 'onboarding-coordination',
        name: 'Coordinate Onboarding',
        type: 'completion',
        priority: 8,
        frequency: 0.5,
        uiComponent: 'onboarding-coordinator',
        actions: ['schedule-start', 'assign-mentor', 'setup-access'],
      },
    ];
  }

  /**
   * Generate finance workflow steps
   */
  private generateFinanceWorkflowSteps(): WorkflowStep[] {
    return [
      {
        id: 'financial-reporting',
        name: 'Generate Financial Reports',
        type: 'action',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'financial-reporter',
        actions: ['select-period', 'choose-statements', 'generate-report'],
      },
      {
        id: 'budget-management',
        name: 'Manage Budgets',
        type: 'action',
        priority: 10,
        frequency: 0.8,
        uiComponent: 'budget-manager',
        actions: ['create-budget', 'allocate-funds', 'track-variance'],
      },
      {
        id: 'expense-tracking',
        name: 'Track Expenses',
        type: 'action',
        priority: 9,
        frequency: 0.9,
        uiComponent: 'expense-tracker',
        actions: ['log-expense', 'categorize-cost', 'approve-payment'],
      },
      {
        id: 'compliance-monitoring',
        name: 'Monitor Compliance',
        type: 'review',
        priority: 9,
        frequency: 0.7,
        uiComponent: 'compliance-monitor',
        actions: ['review-audit-trail', 'check-regulations', 'flag-issues'],
      },
      {
        id: 'financial-forecasting',
        name: 'Financial Forecasting',
        type: 'decision',
        priority: 8,
        frequency: 0.5,
        uiComponent: 'financial-forecaster',
        actions: ['analyze-trends', 'project-revenue', 'estimate-costs'],
      },
    ];
  }

  /**
   * Generate logistics workflow steps
   */
  private generateLogisticsWorkflowSteps(): WorkflowStep[] {
    return [
      {
        id: 'shipment-creation',
        name: 'Create Shipment',
        type: 'action',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'shipment-creator',
        actions: ['enter-details', 'select-carrier', 'generate-label'],
      },
      {
        id: 'route-optimization',
        name: 'Optimize Routes',
        type: 'decision',
        priority: 10,
        frequency: 0.8,
        uiComponent: 'route-optimizer',
        actions: ['analyze-destinations', 'calculate-optimal-route', 'assign-drivers'],
      },
      {
        id: 'fleet-management',
        name: 'Manage Fleet',
        type: 'action',
        priority: 9,
        frequency: 0.7,
        uiComponent: 'fleet-manager',
        actions: ['track-vehicles', 'schedule-maintenance', 'monitor-fuel'],
      },
      {
        id: 'warehouse-operations',
        name: 'Warehouse Operations',
        type: 'action',
        priority: 9,
        frequency: 0.9,
        uiComponent: 'warehouse-operator',
        actions: ['pick-items', 'pack-orders', 'manage-inventory'],
      },
      {
        id: 'delivery-tracking',
        name: 'Track Deliveries',
        type: 'review',
        priority: 8,
        frequency: 0.8,
        uiComponent: 'delivery-tracker',
        actions: ['view-status', 'monitor-delays', 'handle-exceptions'],
      },
    ];
  }

  /**
   * Generate support workflow steps
   */
  private generateSupportWorkflowSteps(): WorkflowStep[] {
    return [
      {
        id: 'ticket-intake',
        name: 'Ticket Intake',
        type: 'action',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'ticket-intaker',
        actions: ['collect-info', 'categorize-issue', 'assign-priority'],
      },
      {
        id: 'ticket-triage',
        name: 'Triage Tickets',
        type: 'decision',
        priority: 10,
        frequency: 0.8,
        uiComponent: 'ticket-triager',
        actions: ['assess-severity', 'determine-escalation', 'assign-agent'],
      },
      {
        id: 'issue-resolution',
        name: 'Resolve Issues',
        type: 'action',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'issue-resolver',
        actions: ['investigate', 'apply-solution', 'verify-fix'],
      },
      {
        id: 'customer-communication',
        name: 'Communicate with Customer',
        type: 'action',
        priority: 9,
        frequency: 0.8,
        uiComponent: 'customer-communicator',
        actions: ['send-update', 'request-info', 'provide-solution'],
      },
      {
        id: 'ticket-closure',
        name: 'Close Tickets',
        type: 'completion',
        priority: 8,
        frequency: 0.7,
        uiComponent: 'ticket-closer',
        actions: ['confirm-resolution', 'collect-feedback', 'archive-ticket'],
      },
    ];
  }

  /**
   * Generate project management workflow steps
   */
  private generateProjectManagementWorkflowSteps(): WorkflowStep[] {
    return [
      {
        id: 'task-creation',
        name: 'Create Tasks',
        type: 'action',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'task-creator',
        actions: ['define-task', 'assign-owner', 'set-deadline'],
      },
      {
        id: 'task-assignment',
        name: 'Assign Tasks',
        type: 'action',
        priority: 10,
        frequency: 0.8,
        uiComponent: 'task-assigner',
        actions: ['select-team-member', 'estimate-effort', 'set-priority'],
      },
      {
        id: 'progress-tracking',
        name: 'Track Progress',
        type: 'review',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'progress-tracker',
        actions: ['update-status', 'log-hours', 'blockers'],
      },
      {
        id: 'milestone-management',
        name: 'Manage Milestones',
        type: 'decision',
        priority: 9,
        frequency: 0.7,
        uiComponent: 'milestone-manager',
        actions: ['define-milestone', 'set-dates', 'track-completion'],
      },
      {
        id: 'team-coordination',
        name: 'Coordinate Team',
        type: 'action',
        priority: 9,
        frequency: 0.8,
        uiComponent: 'team-coordinator',
        actions: ['schedule-meetings', 'share-updates', 'collaborate'],
      },
    ];
  }

  /**
   * Generate education workflow steps
   */
  private generateEducationWorkflowSteps(): WorkflowStep[] {
    return [
      {
        id: 'course-creation',
        name: 'Create Courses',
        type: 'action',
        priority: 10,
        frequency: 0.6,
        uiComponent: 'course-creator',
        actions: ['define-curriculum', 'add-content', 'set-pricing'],
      },
      {
        id: 'student-enrollment',
        name: 'Enroll Students',
        type: 'action',
        priority: 10,
        frequency: 0.8,
        uiComponent: 'student-enroller',
        actions: ['register-student', 'assign-courses', 'process-payment'],
      },
      {
        id: 'progress-tracking',
        name: 'Track Progress',
        type: 'review',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'progress-tracker',
        actions: ['monitor-completion', 'track-engagement', 'assess-performance'],
      },
      {
        id: 'assessment-administration',
        name: 'Administer Assessments',
        type: 'action',
        priority: 9,
        frequency: 0.7,
        uiComponent: 'assessment-administrator',
        actions: ['create-quiz', 'schedule-exam', 'grade-submissions'],
      },
      {
        id: 'certification-management',
        name: 'Manage Certifications',
        type: 'completion',
        priority: 8,
        frequency: 0.5,
        uiComponent: 'certification-manager',
        actions: ['issue-certificate', 'track-credentials', 'manage-renewals'],
      },
    ];
  }

  /**
   * Generate scheduling workflow steps
   */
  private generateSchedulingWorkflowSteps(): WorkflowStep[] {
    return [
      {
        id: 'availability-check',
        name: 'Check Availability',
        type: 'action',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'availability-checker',
        actions: ['view-calendar', 'check-slots', 'identify-conflicts'],
      },
      {
        id: 'slot-selection',
        name: 'Select Time Slot',
        type: 'action',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'slot-selector',
        actions: ['choose-date', 'select-time', 'confirm-availability'],
      },
      {
        id: 'booking-confirmation',
        name: 'Confirm Booking',
        type: 'completion',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'booking-confirmer',
        actions: ['review-details', 'send-confirmation', 'add-calendar'],
      },
      {
        id: 'conflict-resolution',
        name: 'Resolve Conflicts',
        type: 'decision',
        priority: 8,
        frequency: 0.4,
        uiComponent: 'conflict-resolver',
        actions: ['identify-conflict', 'propose-alternatives', 'reschedule'],
      },
    ];
  }

  /**
   * Generate analysis workflow steps
   */
  private generateAnalysisWorkflowSteps(): WorkflowStep[] {
    return [
      {
        id: 'data-selection',
        name: 'Select Data',
        type: 'action',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'data-selector',
        actions: ['choose-dataset', 'select-timeframe', 'apply-filters'],
      },
      {
        id: 'pattern-detection',
        name: 'Detect Patterns',
        type: 'decision',
        priority: 10,
        frequency: 0.8,
        uiComponent: 'pattern-detector',
        actions: ['analyze-trends', 'identify-anomalies', 'correlate-variables'],
      },
      {
        id: 'insight-generation',
        name: 'Generate Insights',
        type: 'decision',
        priority: 10,
        frequency: 0.8,
        uiComponent: 'insight-generator',
        actions: ['summarize-findings', 'recommend-actions', 'predict-outcomes'],
      },
      {
        id: 'visualization-creation',
        name: 'Create Visualizations',
        type: 'action',
        priority: 9,
        frequency: 0.7,
        uiComponent: 'visualization-creator',
        actions: ['select-chart', 'configure-display', 'add-annotations'],
      },
    ];
  }

  /**
   * Generate selling workflow steps
   */
  private generateSellingWorkflowSteps(): WorkflowStep[] {
    return [
      {
        id: 'lead-engagement',
        name: 'Engage Lead',
        type: 'action',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'lead-engager',
        actions: ['call', 'email', 'schedule-meeting'],
      },
      {
        id: 'needs-assessment',
        name: 'Assess Needs',
        type: 'decision',
        priority: 10,
        frequency: 0.7,
        uiComponent: 'needs-assessor',
        actions: ['ask-questions', 'identify-pain-points', 'qualify-fit'],
      },
      {
        id: 'solution-presentation',
        name: 'Present Solution',
        type: 'action',
        priority: 10,
        frequency: 0.8,
        uiComponent: 'solution-presenter',
        actions: ['demo-product', 'show-value', 'address-objections'],
      },
      {
        id: 'negotiation',
        name: 'Negotiate Terms',
        type: 'decision',
        priority: 9,
        frequency: 0.6,
        uiComponent: 'negotiator',
        actions: ['discuss-pricing', 'negotiate-terms', 'close-deal'],
      },
      {
        id: 'deal-closing',
        name: 'Close Deal',
        type: 'completion',
        priority: 9,
        frequency: 0.5,
        uiComponent: 'deal-closer',
        actions: ['send-contract', 'finalize-agreement', 'process-payment'],
      },
    ];
  }

  /**
   * Determine primary actions based on domain and workflow
   */
  private determinePrimaryActions(domain: string, workflow: string): string[] {
    const primaryActions: Record<string, string[]> = {
      healthcare: ['schedule-appointment', 'view-patient-status', 'update-treatment'],
      crm: ['move-pipeline', 'call-lead', 'email-lead'],
      analytics: ['explore-data', 'generate-insights', 'create-chart'],
      ecommerce: ['process-order', 'check-inventory', 'track-shipment'],
      ats: ['schedule-interview', 'move-candidate', 'send-offer'],
      finance: ['generate-report', 'approve-expense', 'monitor-budget'],
      logistics: ['create-shipment', 'optimize-route', 'track-delivery'],
      support: ['respond-ticket', 'escalate-issue', 'resolve-ticket'],
      project_management: ['create-task', 'assign-task', 'update-status'],
      education: ['enroll-student', 'track-progress', 'administer-assessment'],
    };

    // Workflow-based adjustments
    if (workflow === 'scheduling') {
      return ['check-availability', 'book-slot', 'confirm-booking'];
    }

    if (workflow === 'analysis') {
      return ['select-data', 'analyze-trends', 'generate-insights'];
    }

    if (workflow === 'selling') {
      return ['engage-lead', 'assess-needs', 'present-solution'];
    }

    return primaryActions[domain] || ['view', 'edit', 'create'];
  }

  /**
   * Determine secondary actions based on domain and workflow
   */
  private determineSecondaryActions(domain: string, workflow: string): string[] {
    const secondaryActions: Record<string, string[]> = {
      healthcare: ['view-history', 'order-lab', 'prescribe-medication'],
      crm: ['log-activity', 'add-note', 'schedule-followup'],
      analytics: ['filter-data', 'export-report', 'share-dashboard'],
      ecommerce: ['view-customer', 'check-inventory', 'process-return'],
      ats: ['view-resume', 'schedule-interview', 'send-feedback'],
      finance: ['view-details', 'drill-down', 'export-data'],
      logistics: ['view-details', 'reassign-driver', 'handle-exception'],
      support: ['view-history', 'merge-ticket', 'link-article'],
      project_management: ['add-comment', 'attach-file', 'set-deadline'],
      education: ['view-profile', 'send-message', 'grade-submission'],
    };

    return secondaryActions[domain] || ['filter', 'sort', 'search'];
  }

  /**
   * Generate contextual areas based on domain and workflow
   */
  private generateContextualAreas(domain: string, workflow: string): string[] {
    const contextualAreas: Record<string, string[]> = {
      healthcare: ['patient-panel', 'appointment-calendar', 'urgency-indicators', 'medication-tracker'],
      crm: ['pipeline-view', 'activity-feed', 'lead-details', 'quick-actions'],
      analytics: ['insights-panel', 'data-filters', 'chart-controls', 'export-options'],
      ecommerce: ['order-details', 'inventory-status', 'customer-info', 'fulfillment-tracker'],
      ats: ['candidate-profile', 'pipeline-view', 'interview-scheduler', 'recruiter-tasks'],
      finance: ['financial-summary', 'budget-tracker', 'compliance-indicator', 'audit-trail'],
      logistics: ['shipment-map', 'fleet-status', 'warehouse-operations', 'route-optimizer'],
      support: ['ticket-details', 'customer-info', 'knowledge-base', 'agent-tools'],
      project_management: ['task-board', 'team-activity', 'milestone-tracker', 'project-timeline'],
      education: ['course-progress', 'student-profile', 'assessment-results', 'learning-analytics'],
    };

    return contextualAreas[domain] || ['default-panel'];
  }

  /**
   * Determine section order based on domain and workflow
   */
  private determineSectionOrder(domain: string, workflow: string): string[] {
    const sectionOrders: Record<string, string[]> = {
      healthcare: ['patient-status', 'appointments', 'calendar', 'medical-records', 'lab-results', 'medications', 'settings'],
      crm: ['pipeline', 'leads', 'activity', 'opportunities', 'tasks', 'reports', 'settings'],
      analytics: ['insights', 'charts', 'data-tables', 'filters', 'export', 'settings'],
      ecommerce: ['orders', 'inventory', 'customers', 'fulfillment', 'analytics', 'settings'],
      ats: ['candidates', 'pipeline', 'interviews', 'offers', 'analytics', 'settings'],
      finance: ['financial-statements', 'metrics', 'reports', 'budget', 'compliance', 'settings'],
      logistics: ['shipments', 'tracking', 'fleet', 'warehouse', 'analytics', 'settings'],
      support: ['tickets', 'queue', 'customer-info', 'knowledge-base', 'analytics', 'settings'],
      project_management: ['tasks', 'timeline', 'team', 'milestones', 'reports', 'settings'],
      education: ['courses', 'students', 'progress', 'assessments', 'analytics', 'settings'],
    };

    // Workflow-based adjustments
    if (workflow === 'scheduling') {
      return ['calendar', 'availability', 'appointments', 'status', 'settings'];
    }

    if (workflow === 'analysis') {
      return ['insights', 'charts', 'data', 'filters', 'export', 'settings'];
    }

    if (workflow === 'selling') {
      return ['pipeline', 'leads', 'activity', 'opportunities', 'tasks', 'settings'];
    }

    return sectionOrders[domain] || this.getDefaultSectionOrder();
  }

  /**
   * Calculate action priorities based on domain and workflow
   */
  private calculateActionPriorities(domain: string, workflow: string): Record<string, number> {
    const priorities: Record<string, number> = {};

    const primaryActions = this.determinePrimaryActions(domain, workflow);
    const secondaryActions = this.determineSecondaryActions(domain, workflow);

    // Primary actions get higher priority
    primaryActions.forEach((action, index) => {
      priorities[action] = 1.0 - (index * 0.1);
    });

    // Secondary actions get medium priority
    secondaryActions.forEach((action, index) => {
      priorities[action] = 0.7 - (index * 0.05);
    });

    return priorities;
  }

  /**
   * Determine workflow flow based on domain and workflow
   */
  private determineWorkflowFlow(domain: string, workflow: string): WorkflowCentricLayout['workflowFlow'] {
    const workflowFlows: Record<string, WorkflowCentricLayout['workflowFlow']> = {
      healthcare: 'linear',
      crm: 'branched',
      analytics: 'parallel',
      ecommerce: 'linear',
      ats: 'branched',
      finance: 'linear',
      logistics: 'parallel',
      support: 'linear',
      project_management: 'branched',
      education: 'linear',
    };

    // Workflow-based adjustments
    if (workflow === 'scheduling') {
      return 'linear';
    }

    if (workflow === 'analysis') {
      return 'parallel';
    }

    if (workflow === 'selling') {
      return 'branched';
    }

    return workflowFlows[domain] || 'linear';
  }

  /**
   * Get default workflow steps
   */
  private getDefaultWorkflowSteps(): WorkflowStep[] {
    return [
      {
        id: 'view',
        name: 'View',
        type: 'action',
        priority: 10,
        frequency: 0.9,
        uiComponent: 'viewer',
        actions: ['view'],
      },
      {
        id: 'edit',
        name: 'Edit',
        type: 'action',
        priority: 8,
        frequency: 0.7,
        uiComponent: 'editor',
        actions: ['edit'],
      },
      {
        id: 'create',
        name: 'Create',
        type: 'action',
        priority: 9,
        frequency: 0.6,
        uiComponent: 'creator',
        actions: ['create'],
      },
    ];
  }

  /**
   * Get default section order
   */
  private getDefaultSectionOrder(): string[] {
    return ['dashboard', 'data', 'reports', 'settings'];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<WorkflowCentricConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('WorkflowCentricRenderingEngine', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): WorkflowCentricConfig {
    return { ...this.config };
  }
}

export const workflowCentricRenderingEngine = new WorkflowCentricRenderingEngine();

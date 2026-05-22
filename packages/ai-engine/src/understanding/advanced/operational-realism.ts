/**
 * Operational Realism Engine
 *
 * Generates realistic, business-native applications:
 * - Realistic KPIs with business context
 * - Role-based dashboards
 * - Business priorities inference
 * - Workflow-heavy context
 * - Realistic operational data patterns
 * - Context-aware generation
 */

import type { AppUnderstanding } from '@oneatlas/shared';

export interface RealismEnhancement {
  realisticKPIs: KPIDefinition[];
  roleBasedDashboards: RoleDashboard[];
  businessPriorities: BusinessPriority[];
  operationalContext: OperationalContext;
  realisticDataPatterns: DataPattern[];
}

export interface KPIDefinition {
  name: string;
  description: string;
  metricType: 'count' | 'percentage' | 'currency' | 'time' | 'rating';
  targetValue?: number;
  trendDirection: 'up' | 'down' | 'neutral';
  businessImpact: 'critical' | 'high' | 'medium' | 'low';
  calculation: string;
}

export interface RoleDashboard {
  role: string;
  dashboardName: string;
  focusAreas: string[];
  kpis: string[];
  permissions: string[];
  workflowAccess: string[];
}

export interface BusinessPriority {
  priority: string;
  description: string;
  kpis: string[];
  workflows: string[];
  urgency: 'immediate' | 'short_term' | 'long_term';
}

export interface OperationalContext {
  businessType: string;
  operationalScale: 'small' | 'medium' | 'large' | 'enterprise';
  teamSize: number;
  dataVolume: 'low' | 'medium' | 'high' | 'massive';
  complianceRequirements: string[];
  integrationPoints: string[];
}

export interface DataPattern {
  entity: string;
  pattern: string;
  description: string;
  realisticRange: { min: number; max: number };
  distribution: 'normal' | 'skewed' | 'uniform' | 'exponential';
}

export class OperationalRealismEngine {
  /**
   * Enhance understanding with operational realism
   */
  enhance(understanding: AppUnderstanding): RealismEnhancement {
    const realisticKPIs = this.generateRealisticKPIs(understanding);
    const roleBasedDashboards = this.generateRoleBasedDashboards(understanding);
    const businessPriorities = this.inferBusinessPriorities(understanding);
    const operationalContext = this.inferOperationalContext(understanding);
    const realisticDataPatterns = this.generateRealisticDataPatterns(understanding);

    return {
      realisticKPIs,
      roleBasedDashboards,
      businessPriorities,
      operationalContext,
      realisticDataPatterns,
    };
  }

  /**
   * Generate realistic KPIs based on business context
   */
  private generateRealisticKPIs(understanding: AppUnderstanding): KPIDefinition[] {
    const kpis: KPIDefinition[] = [];

    // Generate KPIs based on app type
    switch (understanding.appType) {
      case 'dashboard':
        kpis.push(
          {
            name: 'Active Users',
            description: 'Number of users actively using the platform',
            metricType: 'count',
            targetValue: 1000,
            trendDirection: 'up',
            businessImpact: 'high',
            calculation: 'COUNT(DISTINCT user_id) WHERE last_active > NOW() - 7 days',
          },
          {
            name: 'Task Completion Rate',
            description: 'Percentage of tasks completed on time',
            metricType: 'percentage',
            targetValue: 85,
            trendDirection: 'up',
            businessImpact: 'high',
            calculation: '(completed_tasks / total_tasks) * 100',
          },
          {
            name: 'Response Time',
            description: 'Average time to respond to user actions',
            metricType: 'time',
            targetValue: 200,
            trendDirection: 'down',
            businessImpact: 'medium',
            calculation: 'AVG(response_time_ms)',
          }
        );
        break;

      case 'social':
        kpis.push(
          {
            name: 'Daily Active Users',
            description: 'Number of unique users per day',
            metricType: 'count',
            targetValue: 5000,
            trendDirection: 'up',
            businessImpact: 'critical',
            calculation: 'COUNT(DISTINCT user_id) WHERE DATE(created_at) = CURRENT_DATE',
          },
          {
            name: 'Engagement Rate',
            description: 'Percentage of users engaging with content',
            metricType: 'percentage',
            targetValue: 15,
            trendDirection: 'up',
            businessImpact: 'critical',
            calculation: '(engaged_users / total_users) * 100',
          },
          {
            name: 'Content Virality Score',
            description: 'Average shares per post',
            metricType: 'count',
            targetValue: 10,
            trendDirection: 'up',
            businessImpact: 'high',
            calculation: 'AVG(share_count)',
          }
        );
        break;

      case 'productivity':
        kpis.push(
          {
            name: 'Tasks Completed',
            description: 'Number of tasks completed this week',
            metricType: 'count',
            targetValue: 100,
            trendDirection: 'up',
            businessImpact: 'high',
            calculation: 'COUNT(*) WHERE status = "completed" AND completed_at >= NOW() - 7 days',
          },
          {
            name: 'On-Time Delivery Rate',
            description: 'Percentage of tasks completed by deadline',
            metricType: 'percentage',
            targetValue: 90,
            trendDirection: 'up',
            businessImpact: 'critical',
            calculation: '(on_time_tasks / total_tasks) * 100',
          },
          {
            name: 'Team Velocity',
            description: 'Story points completed per sprint',
            metricType: 'count',
            targetValue: 50,
            trendDirection: 'up',
            businessImpact: 'high',
            calculation: 'SUM(story_points) WHERE sprint = current_sprint',
          }
        );
        break;

      case 'internal-tool':
        kpis.push(
          {
            name: 'Process Efficiency',
            description: 'Time saved per process execution',
            metricType: 'time',
            targetValue: 30,
            trendDirection: 'up',
            businessImpact: 'high',
            calculation: 'AVG(time_saved_minutes)',
          },
          {
            name: 'Error Rate',
            description: 'Percentage of processes with errors',
            metricType: 'percentage',
            targetValue: 2,
            trendDirection: 'down',
            businessImpact: 'critical',
            calculation: '(error_count / total_count) * 100',
          },
          {
            name: 'User Adoption',
            description: 'Percentage of team using the tool',
            metricType: 'percentage',
            targetValue: 80,
            trendDirection: 'up',
            businessImpact: 'medium',
            calculation: '(active_users / total_team) * 100',
          }
        );
        break;
    }

    // Add entity-specific KPIs
    for (const entity of understanding.entities) {
      const entityKPI = this.generateEntityKPI(entity);
      if (entityKPI) {
        kpis.push(entityKPI);
      }
    }

    return kpis;
  }

  /**
   * Generate KPI for a specific entity
   */
  private generateEntityKPI(entity: any): KPIDefinition | null {
    const name = entity.name.toLowerCase();

    if (name.includes('order') || name.includes('purchase')) {
      return {
        name: `${entity.name} Value`,
        description: `Total value of ${entity.name.toLowerCase()}`,
        metricType: 'currency',
        trendDirection: 'up',
        businessImpact: 'critical',
        calculation: `SUM(amount) WHERE entity = "${entity.name}"`,
      };
    }

    if (name.includes('user') || name.includes('customer')) {
      return {
        name: `${entity.name} Growth`,
        description: `New ${entity.name.toLowerCase()} added this month`,
        metricType: 'count',
        trendDirection: 'up',
        businessImpact: 'high',
        calculation: `COUNT(*) WHERE created_at >= DATE_TRUNC('month', NOW()) AND entity = "${entity.name}"`,
      };
    }

    if (name.includes('task') || name.includes('project')) {
      return {
        name: `${entity.name} Completion`,
        description: `Percentage of ${entity.name.toLowerCase()} completed`,
        metricType: 'percentage',
        targetValue: 80,
        trendDirection: 'up',
        businessImpact: 'high',
        calculation: `(completed_count / total_count) * 100 WHERE entity = "${entity.name}"`,
      };
    }

    return null;
  }

  /**
   * Generate role-based dashboards
   */
  private generateRoleBasedDashboards(understanding: AppUnderstanding): RoleDashboard[] {
    const dashboards: RoleDashboard[] = [];

    // Define common roles based on app type
    const roles = this.inferRoles(understanding);

    for (const role of roles) {
      const dashboard = this.generateDashboardForRole(role, understanding);
      dashboards.push(dashboard);
    }

    return dashboards;
  }

  /**
   * Infer roles based on app type and entities
   */
  private inferRoles(understanding: AppUnderstanding): string[] {
    const roles: string[] = [];

    switch (understanding.appType) {
      case 'dashboard':
        roles.push('Executive', 'Manager', 'Analyst', 'Viewer');
        break;
      case 'social':
        roles.push('Admin', 'Moderator', 'Content Creator', 'User');
        break;
      case 'productivity':
        roles.push('Project Manager', 'Team Lead', 'Developer', 'Stakeholder');
        break;
      case 'internal-tool':
        roles.push('Administrator', 'Operator', 'Manager', 'Auditor');
        break;
    }

    // Add role-specific entities
    for (const entity of understanding.entities) {
      const name = entity.name.toLowerCase();
      if (name.includes('employee') || name.includes('staff')) {
        roles.push('HR Manager', 'Employee');
      }
      if (name.includes('customer') || name.includes('client')) {
        roles.push('Sales Manager', 'Support Agent', 'Customer');
      }
      if (name.includes('patient')) {
        roles.push('Doctor', 'Nurse', 'Administrator', 'Patient');
      }
    }

    return [...new Set(roles)];
  }

  /**
   * Generate dashboard for a specific role
   */
  private generateDashboardForRole(role: string, understanding: AppUnderstanding): RoleDashboard {
    const dashboardName = `${role} Dashboard`;
    const focusAreas = this.inferFocusAreas(role, understanding);
    const kpis = this.inferRoleKPIs(role, understanding);
    const permissions = this.inferRolePermissions(role);
    const workflowAccess = this.inferWorkflowAccess(role, understanding);

    return {
      role,
      dashboardName,
      focusAreas,
      kpis,
      permissions,
      workflowAccess,
    };
  }

  /**
   * Infer focus areas for a role
   */
  private inferFocusAreas(role: string, understanding: AppUnderstanding): string[] {
    const areas: string[] = [];

    if (role.includes('Executive') || role.includes('Manager')) {
      areas.push('Overview', 'Performance Metrics', 'Team Status', 'Budget');
    }

    if (role.includes('Analyst') || role.includes('Developer')) {
      areas.push('Detailed Metrics', 'Trends', 'Data Quality', 'Performance');
    }

    if (role.includes('Admin') || role.includes('Administrator')) {
      areas.push('System Health', 'User Management', 'Configuration', 'Audit Logs');
    }

    if (role.includes('Viewer') || role.includes('User')) {
      areas.push('Personal Tasks', 'Notifications', 'My Items', 'Reports');
    }

    return areas;
  }

  /**
   * Infer KPIs for a role
   */
  private inferRoleKPIs(role: string, understanding: AppUnderstanding): string[] {
    const kpis: string[] = [];

    if (role.includes('Executive')) {
      kpis.push('Revenue', 'Growth Rate', 'Team Productivity', 'Customer Satisfaction');
    }

    if (role.includes('Manager')) {
      kpis.push('Team Velocity', 'Task Completion', 'Quality Metrics', 'Resource Utilization');
    }

    if (role.includes('Analyst')) {
      kpis.push('Data Accuracy', 'Query Performance', 'Report Generation', 'Anomaly Detection');
    }

    if (role.includes('Admin')) {
      kpis.push('System Uptime', 'Error Rate', 'User Activity', 'Security Incidents');
    }

    return kpis;
  }

  /**
   * Infer permissions for a role
   */
  private inferRolePermissions(role: string): string[] {
    const permissions: string[] = ['read'];

    if (role.includes('Admin') || role.includes('Executive') || role.includes('Manager')) {
      permissions.push('write', 'delete', 'approve', 'configure');
    }

    if (role.includes('Analyst') || role.includes('Developer')) {
      permissions.push('write', 'export', 'analyze');
    }

    return permissions;
  }

  /**
   * Infer workflow access for a role
   */
  private inferWorkflowAccess(role: string, understanding: AppUnderstanding): string[] {
    const workflows: string[] = [];

    for (const workflow of understanding.workflows) {
      if (this.canRoleAccessWorkflow(role, workflow)) {
        workflows.push(workflow.name);
      }
    }

    return workflows;
  }

  /**
   * Check if role can access workflow
   */
  private canRoleAccessWorkflow(role: string, workflow: any): boolean {
    const workflowName = workflow.name.toLowerCase();

    if (role.includes('Admin') || role.includes('Executive')) {
      return true; // Access to all workflows
    }

    if (role.includes('Manager') && (workflowName.includes('approval') || workflowName.includes('review'))) {
      return true;
    }

    if (role.includes('Analyst') && workflowName.includes('report')) {
      return true;
    }

    return false;
  }

  /**
   * Infer business priorities
   */
  private inferBusinessPriorities(understanding: AppUnderstanding): BusinessPriority[] {
    const priorities: BusinessPriority[] = [];

    // High priority based on app type
    switch (understanding.appType) {
      case 'dashboard':
        priorities.push({
          priority: 'Data Accuracy',
          description: 'Ensure dashboard data is accurate and up-to-date',
          kpis: ['Data Quality Score', 'Refresh Rate'],
          workflows: ['Data Validation', 'Refresh Scheduling'],
          urgency: 'immediate',
        });
        break;

      case 'social':
        priorities.push({
          priority: 'User Engagement',
          description: 'Maximize user engagement and retention',
          kpis: ['Daily Active Users', 'Engagement Rate'],
          workflows: ['Content Recommendation', 'Notification System'],
          urgency: 'immediate',
        });
        break;

      case 'productivity':
        priorities.push({
          priority: 'Task Efficiency',
          description: 'Optimize task completion and workflow efficiency',
          kpis: ['Tasks Completed', 'On-Time Delivery'],
          workflows: ['Task Assignment', 'Progress Tracking'],
          urgency: 'short_term',
        });
        break;

      case 'internal-tool':
        priorities.push({
          priority: 'Process Reliability',
          description: 'Ensure internal processes run reliably',
          kpis: ['Process Efficiency', 'Error Rate'],
          workflows: ['Process Monitoring', 'Error Handling'],
          urgency: 'immediate',
        });
        break;
    }

    // Add entity-specific priorities
    for (const entity of understanding.entities) {
      const entityPriority = this.inferEntityPriority(entity);
      if (entityPriority) {
        priorities.push(entityPriority);
      }
    }

    return priorities;
  }

  /**
   * Infer priority for an entity
   */
  private inferEntityPriority(entity: any): BusinessPriority | null {
    const name = entity.name.toLowerCase();

    if (name.includes('order') || name.includes('payment')) {
      return {
        priority: `${entity.name} Processing`,
        description: `Ensure ${entity.name.toLowerCase()} are processed efficiently`,
        kpis: [`${entity.name} Volume`, `${entity.name} Time`],
        workflows: [`${entity.name} Validation`, `${entity.name} Processing`],
        urgency: 'immediate',
      };
    }

    if (name.includes('user') || name.includes('customer')) {
      return {
        priority: `${entity.name} Experience`,
        description: `Optimize ${entity.name.toLowerCase()} experience and satisfaction`,
        kpis: [`${entity.name} Satisfaction`, `${entity.name} Retention`],
        workflows: [`${entity.name} Onboarding`, `${entity.name} Support`],
        urgency: 'short_term',
      };
    }

    return null;
  }

  /**
   * Infer operational context
   */
  private inferOperationalContext(understanding: AppUnderstanding): OperationalContext {
    const businessType = understanding.appType;
    const operationalScale = this.inferOperationalScale(understanding);
    const teamSize = this.inferTeamSize(understanding);
    const dataVolume = this.inferDataVolume(understanding);
    const complianceRequirements = this.inferComplianceRequirements(understanding);
    const integrationPoints = this.inferIntegrationPoints(understanding);

    return {
      businessType,
      operationalScale,
      teamSize,
      dataVolume,
      complianceRequirements,
      integrationPoints,
    };
  }

  /**
   * Infer operational scale
   */
  private inferOperationalScale(understanding: AppUnderstanding): 'small' | 'medium' | 'large' | 'enterprise' {
    const entityCount = understanding.entities.length;
    const workflowCount = understanding.workflows.length;

    if (entityCount <= 3 && workflowCount <= 2) return 'small';
    if (entityCount <= 6 && workflowCount <= 5) return 'medium';
    if (entityCount <= 10 && workflowCount <= 10) return 'large';
    return 'enterprise';
  }

  /**
   * Infer team size
   */
  private inferTeamSize(understanding: AppUnderstanding): number {
    const scale = this.inferOperationalScale(understanding);
    
    switch (scale) {
      case 'small': return 5;
      case 'medium': return 25;
      case 'large': return 100;
      case 'enterprise': return 500;
    }
  }

  /**
   * Infer data volume
   */
  private inferDataVolume(understanding: AppUnderstanding): 'low' | 'medium' | 'high' | 'massive' {
    const scale = this.inferOperationalScale(understanding);
    
    switch (scale) {
      case 'small': return 'low';
      case 'medium': return 'medium';
      case 'large': return 'high';
      case 'enterprise': return 'massive';
    }
  }

  /**
   * Infer compliance requirements
   */
  private inferComplianceRequirements(understanding: AppUnderstanding): string[] {
    const requirements: string[] = [];

    // Basic requirements for all
    requirements.push('Data Privacy');

    // App-specific requirements
    if (understanding.appType === 'social') {
      requirements.push('GDPR', 'Content Moderation');
    }

    if (understanding.appType === 'internal-tool') {
      requirements.push('Audit Logging', 'Access Control');
    }

    // Entity-specific requirements
    for (const entity of understanding.entities) {
      const name = entity.name.toLowerCase();
      if (name.includes('payment') || name.includes('financial')) {
        requirements.push('PCI DSS', 'Financial Audit');
      }
      if (name.includes('patient') || name.includes('medical')) {
        requirements.push('HIPAA', 'Medical Records Privacy');
      }
    }

    return [...new Set(requirements)];
  }

  /**
   * Infer integration points
   */
  private inferIntegrationPoints(understanding: AppUnderstanding): string[] {
    const integrations: string[] = [];

    // Common integrations
    integrations.push('Email Notifications');
    integrations.push('Authentication System');

    // App-specific integrations
    if (understanding.appType === 'social') {
      integrations.push('Social Media APIs', 'Content Delivery Network');
    }

    if (understanding.appType === 'productivity') {
      integrations.push('Calendar Integration', 'File Storage');
    }

    if (understanding.appType === 'internal-tool') {
      integrations.push('LDAP/Active Directory', 'ERP System');
    }

    // Entity-specific integrations
    for (const entity of understanding.entities) {
      const name = entity.name.toLowerCase();
      if (name.includes('payment')) {
        integrations.push('Payment Gateway');
      }
      if (name.includes('shipping') || name.includes('logistics')) {
        integrations.push('Shipping Provider');
      }
    }

    return [...new Set(integrations)];
  }

  /**
   * Generate realistic data patterns
   */
  private generateRealisticDataPatterns(understanding: AppUnderstanding): DataPattern[] {
    const patterns: DataPattern[] = [];

    for (const entity of understanding.entities) {
      const entityPatterns = this.generateEntityDataPatterns(entity);
      patterns.push(...entityPatterns);
    }

    return patterns;
  }

  /**
   * Generate data patterns for an entity
   */
  private generateEntityDataPatterns(entity: any): DataPattern[] {
    const patterns: DataPattern[] = [];
    const name = entity.name.toLowerCase();

    // Numeric patterns
    for (const attr of entity.attributes || []) {
      if (attr.type === 'number' || attr.semanticType === 'currency') {
        patterns.push({
          entity: entity.name,
          pattern: attr.name,
          description: `Realistic range for ${attr.name}`,
          realisticRange: this.inferRealisticRange(attr),
          distribution: 'normal',
        });
      }
    }

    // Date patterns
    for (const attr of entity.attributes || []) {
      if (attr.type === 'date' || attr.type === 'datetime' || attr.semanticType === 'date') {
        patterns.push({
          entity: entity.name,
          pattern: attr.name,
          description: `Realistic date distribution for ${attr.name}`,
          realisticRange: { min: 0, max: 365 },
          distribution: 'skewed',
        });
      }
    }

    return patterns;
  }

  /**
   * Infer realistic range for an attribute
   */
  private inferRealisticRange(attr: any): { min: number; max: number } {
    if (attr.semanticType === 'currency') {
      return { min: 0, max: 10000 };
    }

    if (attr.semanticType === 'percentage') {
      return { min: 0, max: 100 };
    }

    if (attr.name.toLowerCase().includes('count') || attr.name.toLowerCase().includes('quantity')) {
      return { min: 0, max: 1000 };
    }

    return { min: 0, max: 100 };
  }
}

export const operationalRealism = new OperationalRealismEngine();

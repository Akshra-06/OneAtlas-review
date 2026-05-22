/**
 * Archetype-Native Page Builders
 * 
 * Domain-specific page builders that generate pages native to each domain's archetype.
 * Each domain has its own page builder that understands the domain's unique requirements.
 */

import { logger } from '../../shared/utils/logger';

import {
  ArchetypeDefinition,
} from '../../product/archetype/archetype-registry';

import type { PageOrchestration, PageDefinition } from './workflow-driven-page-orchestration';
import type { JSXTree } from './dynamic-jsx-tree-generation';

export interface PageBuilder {
  domain: string;
  buildPage(page: PageDefinition, archetype: ArchetypeDefinition): string;
  buildLayout(layout: string, archetype: ArchetypeDefinition): string;
  buildComponent(component: string, archetype: ArchetypeDefinition): string;
}

export interface ArchetypeNativePageBuildersConfig {
  enableDomainSpecificBuilders: boolean;
  enableCustomLayouts: boolean;
  enableCustomComponents: boolean;
}

const DEFAULT_CONFIG: ArchetypeNativePageBuildersConfig = {
  enableDomainSpecificBuilders: true,
  enableCustomLayouts: true,
  enableCustomComponents: true,
};

/**
 * Archetype-Native Page Builders
 * 
 * Domain-specific page builders that generate pages native to each domain's archetype:
 * - Healthcare page builder
 * - CRM page builder
 * - Analytics page builder
 * - Ecommerce page builder
 * - ATS page builder
 * - Finance page builder
 * - Logistics page builder
 * - Support page builder
 * - Project Management page builder
 * - Education page builder
 */
export class ArchetypeNativePageBuilders {
  private config: ArchetypeNativePageBuildersConfig;
  private builders: Map<string, PageBuilder>;

  constructor(config: Partial<ArchetypeNativePageBuildersConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.builders = new Map();
    this.initializeBuilders();
  }

  /**
   * Initialize domain-specific page builders
   */
  private initializeBuilders(): void {
    this.builders.set('healthcare', new HealthcarePageBuilder());
    this.builders.set('crm', new CRMPageBuilder());
    this.builders.set('analytics', new AnalyticsPageBuilder());
    this.builders.set('ecommerce', new EcommercePageBuilder());
    this.builders.set('ats', new ATSPageBuilder());
    this.builders.set('finance', new FinancePageBuilder());
    this.builders.set('logistics', new LogisticsPageBuilder());
    this.builders.set('support', new SupportPageBuilder());
    this.builders.set('project_management', new ProjectManagementPageBuilder());
    this.builders.set('education', new EducationPageBuilder());
  }

  /**
   * Build page using domain-specific builder
   */
  buildPage(domain: string, page: PageDefinition, archetype: ArchetypeDefinition): string {
    if (!this.config.enableDomainSpecificBuilders) {
      return this.buildDefaultPage(page, archetype);
    }

    const builder = this.builders.get(domain);
    if (!builder) {
      return this.buildDefaultPage(page, archetype);
    }

    const pageContent = builder.buildPage(page, archetype);

    logger.info('ArchetypeNativePageBuilders', 'PAGE_BUILT', 'Page built using domain-specific builder', {
      domain,
      pageId: page.id,
      builder: builder.domain,
    });

    return pageContent;
  }

  /**
   * Build layout using domain-specific builder
   */
  buildLayout(domain: string, layout: string, archetype: ArchetypeDefinition): string {
    if (!this.config.enableCustomLayouts) {
      return this.buildDefaultLayout(layout, archetype);
    }

    const builder = this.builders.get(domain);
    if (!builder) {
      return this.buildDefaultLayout(layout, archetype);
    }

    const layoutContent = builder.buildLayout(layout, archetype);

    logger.info('ArchetypeNativePageBuilders', 'LAYOUT_BUILT', 'Layout built using domain-specific builder', {
      domain,
      layout,
      builder: builder.domain,
    });

    return layoutContent;
  }

  /**
   * Build component using domain-specific builder
   */
  buildComponent(domain: string, component: string, archetype: ArchetypeDefinition): string {
    if (!this.config.enableCustomComponents) {
      return this.buildDefaultComponent(component, archetype);
    }

    const builder = this.builders.get(domain);
    if (!builder) {
      return this.buildDefaultComponent(component, archetype);
    }

    const componentContent = builder.buildComponent(component, archetype);

    logger.info('ArchetypeNativePageBuilders', 'COMPONENT_BUILT', 'Component built using domain-specific builder', {
      domain,
      component,
      builder: builder.domain,
    });

    return componentContent;
  }

  /**
   * Build default page
   */
  private buildDefaultPage(page: PageDefinition, archetype: ArchetypeDefinition): string {
    return `
import { PageHeader } from '@/components/page-header';
import { PageContent } from '@/components/page-content';

export default function ${this.capitalize(page.id)}Page() {
  return (
    <div className="page">
      <PageHeader title="${page.title}" description="${page.description}" />
      <PageContent>
        {/* Page content */}
      </PageContent>
    </div>
  );
}
    `.trim();
  }

  /**
   * Build default layout
   */
  private buildDefaultLayout(layout: string, archetype: ArchetypeDefinition): string {
    return `
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

export default function ${this.capitalize(layout)}Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <Header />
        {children}
      </div>
    </div>
  );
}
    `.trim();
  }

  /**
   * Build default component
   */
  private buildDefaultComponent(component: string, archetype: ArchetypeDefinition): string {
    return `
export default function ${this.capitalize(component)}() {
  return (
    <div className="${component}">
      {/* Component content */}
    </div>
  );
}
    `.trim();
  }

  /**
   * Capitalize string
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ArchetypeNativePageBuildersConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('ArchetypeNativePageBuilders', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): ArchetypeNativePageBuildersConfig {
    return { ...this.config };
  }
}

/**
 * Healthcare Page Builder
 */
class HealthcarePageBuilder implements PageBuilder {
  domain = 'healthcare';

  buildPage(page: PageDefinition, archetype: ArchetypeDefinition): string {
    if (page.workflow === 'scheduling') {
      return this.buildSchedulingPage(page, archetype);
    }

    return this.buildClinicalPage(page, archetype);
  }

  buildLayout(layout: string, archetype: ArchetypeDefinition): string {
    return `
import { ClinicalSidebar } from '@/components/healthcare/clinical-sidebar';
import { ClinicalHeader } from '@/components/healthcare/clinical-header';

export default function ${this.capitalize(layout)}Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="clinical-layout">
      <ClinicalSidebar />
      <div className="main">
        <ClinicalHeader />
        {children}
      </div>
    </div>
  );
}
    `.trim();
  }

  buildComponent(component: string, archetype: ArchetypeDefinition): string {
    return `
import { usePatientData } from '@/hooks/healthcare/use-patient-data';

export default function ${this.capitalize(component)}() {
  const { patients, loading } = usePatientData();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="${component}">
      {/* Healthcare-specific component */}
    </div>
  );
}
    `.trim();
  }

  private buildSchedulingPage(page: PageDefinition, archetype: ArchetypeDefinition): string {
    return `
import { CalendarView } from '@/components/healthcare/calendar-view';
import { PatientQueue } from '@/components/healthcare/patient-queue';
import { UrgencyPanel } from '@/components/healthcare/urgency-panel';

export default function ${this.capitalize(page.id)}Page() {
  return (
    <div className="scheduling-page">
      <CalendarView />
      <PatientQueue />
      <UrgencyPanel />
    </div>
  );
}
    `.trim();
  }

  private buildClinicalPage(page: PageDefinition, archetype: ArchetypeDefinition): string {
    return `
import { PatientStatusHero } from '@/components/healthcare/patient-status-hero';
import { QuickActions } from '@/components/healthcare/quick-actions';
import { MedicalRecordsList } from '@/components/healthcare/medical-records-list';

export default function ${this.capitalize(page.id)}Page() {
  return (
    <div className="clinical-page">
      <PatientStatusHero />
      <QuickActions />
      <MedicalRecordsList />
    </div>
  );
}
    `.trim();
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * CRM Page Builder
 */
class CRMPageBuilder implements PageBuilder {
  domain = 'crm';

  buildPage(page: PageDefinition, archetype: ArchetypeDefinition): string {
    if (page.workflow === 'selling') {
      return this.buildSellingPage(page, archetype);
    }

    return this.buildLeadsPage(page, archetype);
  }

  buildLayout(layout: string, archetype: ArchetypeDefinition): string {
    return `
import { SalesSidebar } from '@/components/crm/sales-sidebar';
import { SalesHeader } from '@/components/crm/sales-header';

export default function ${this.capitalize(layout)}Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="sales-layout">
      <SalesSidebar />
      <div className="main">
        <SalesHeader />
        {children}
      </div>
    </div>
  );
}
    `.trim();
  }

  buildComponent(component: string, archetype: ArchetypeDefinition): string {
    return `
import { useLeadData } from '@/hooks/crm/use-lead-data';

export default function ${this.capitalize(component)}() {
  const { leads, loading } = useLeadData();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="${component}">
      {/* CRM-specific component */}
    </div>
  );
}
    `.trim();
  }

  private buildSellingPage(page: PageDefinition, archetype: ArchetypeDefinition): string {
    return `
import { PipelineHero } from '@/components/crm/pipeline-hero';
import { LeadActions } from '@/components/crm/lead-actions';
import { ActivityFeed } from '@/components/crm/activity-feed';

export default function ${this.capitalize(page.id)}Page() {
  return (
    <div className="selling-page">
      <PipelineHero />
      <LeadActions />
      <ActivityFeed />
    </div>
  );
}
    `.trim();
  }

  private buildLeadsPage(page: PageDefinition, archetype: ArchetypeDefinition): string {
    return `
import { LeadsHero } from '@/components/crm/leads-hero';
import { PipelineMetrics } from '@/components/crm/pipeline-metrics';
import { OpportunitiesList } from '@/components/crm/opportunities-list';

export default function ${this.capitalize(page.id)}Page() {
  return (
    <div className="leads-page">
      <LeadsHero />
      <PipelineMetrics />
      <OpportunitiesList />
    </div>
  );
}
    `.trim();
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Analytics Page Builder
 */
class AnalyticsPageBuilder implements PageBuilder {
  domain = 'analytics';

  buildPage(page: PageDefinition, archetype: ArchetypeDefinition): string {
    return `
import { InsightsHero } from '@/components/analytics/insights-hero';
import { TrendCharts } from '@/components/analytics/trend-charts';
import { FilterPanel } from '@/components/analytics/filter-panel';
import { DataTable } from '@/components/analytics/data-table';

export default function ${this.capitalize(page.id)}Page() {
  return (
    <div className="analytics-page">
      <InsightsHero />
      <div className="analytics-content">
        <TrendCharts />
        <FilterPanel />
        <DataTable />
      </div>
    </div>
  );
}
    `.trim();
  }

  buildLayout(layout: string, archetype: ArchetypeDefinition): string {
    return `
import { AnalyticsHeader } from '@/components/analytics/analytics-header';

export default function ${this.capitalize(layout)}Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="analytics-layout">
      <AnalyticsHeader />
      {children}
    </div>
  );
}
    `.trim();
  }

  buildComponent(component: string, archetype: ArchetypeDefinition): string {
    return `
import { useAnalyticsData } from '@/hooks/analytics/use-analytics-data';

export default function ${this.capitalize(component)}() {
  const { data, loading } = useAnalyticsData();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="${component}">
      {/* Analytics-specific component */}
    </div>
  );
}
    `.trim();
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Ecommerce Page Builder
 */
class EcommercePageBuilder implements PageBuilder {
  domain = 'ecommerce';

  buildPage(page: PageDefinition, archetype: ArchetypeDefinition): string {
    return `
import { OrdersHero } from '@/components/ecommerce/orders-hero';
import { InventoryStatus } from '@/components/ecommerce/inventory-status';
import { RecentOrders } from '@/components/ecommerce/recent-orders';

export default function ${this.capitalize(page.id)}Page() {
  return (
    <div className="ecommerce-page">
      <OrdersHero />
      <InventoryStatus />
      <RecentOrders />
    </div>
  );
}
    `.trim();
  }

  buildLayout(layout: string, archetype: ArchetypeDefinition): string {
    return `
import { EcommerceHeader } from '@/components/ecommerce/ecommerce-header';

export default function ${this.capitalize(layout)}Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ecommerce-layout">
      <EcommerceHeader />
      {children}
    </div>
  );
}
    `.trim();
  }

  buildComponent(component: string, archetype: ArchetypeDefinition): string {
    return `
import { useOrderData } from '@/hooks/ecommerce/use-order-data';

export default function ${this.capitalize(component)}() {
  const { orders, loading } = useOrderData();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="${component}">
      {/* Ecommerce-specific component */}
    </div>
  );
}
    `.trim();
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * ATS Page Builder
 */
class ATSPageBuilder implements PageBuilder {
  domain = 'ats';

  buildPage(page: PageDefinition, archetype: ArchetypeDefinition): string {
    return `
import { CandidatePipeline } from '@/components/ats/candidate-pipeline';
import { HiringFunnel } from '@/components/ats/hiring-funnel';
import { UpcomingInterviews } from '@/components/ats/upcoming-interviews';

export default function ${this.capitalize(page.id)}Page() {
  return (
    <div className="ats-page">
      <CandidatePipeline />
      <HiringFunnel />
      <UpcomingInterviews />
    </div>
  );
}
    `.trim();
  }

  buildLayout(layout: string, archetype: ArchetypeDefinition): string {
    return `
import { ATSSidebar } from '@/components/ats/ats-sidebar';
import { ATSHeader } from '@/components/ats/ats-header';

export default function ${this.capitalize(layout)}Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="ats-layout">
      <ATSSidebar />
      <div className="main">
        <ATSHeader />
        {children}
      </div>
    </div>
  );
}
    `.trim();
  }

  buildComponent(component: string, archetype: ArchetypeDefinition): string {
    return `
import { useCandidateData } from '@/hooks/ats/use-candidate-data';

export default function ${this.capitalize(component)}() {
  const { candidates, loading } = useCandidateData();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="${component}">
      {/* ATS-specific component */}
    </div>
  );
}
    `.trim();
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Finance Page Builder
 */
class FinancePageBuilder implements PageBuilder {
  domain = 'finance';

  buildPage(page: PageDefinition, archetype: ArchetypeDefinition): string {
    return `
import { FinancialSummary } from '@/components/finance/financial-summary';
import { RevenueChart } from '@/components/finance/revenue-chart';
import { BudgetChart } from '@/components/finance/budget-chart';

export default function ${this.capitalize(page.id)}Page() {
  return (
    <div className="finance-page">
      <FinancialSummary />
      <div className="finance-content">
        <RevenueChart />
        <BudgetChart />
      </div>
    </div>
  );
}
    `.trim();
  }

  buildLayout(layout: string, archetype: ArchetypeDefinition): string {
    return `
import { FinanceHeader } from '@/components/finance/finance-header';

export default function ${this.capitalize(layout)}Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="finance-layout">
      <FinanceHeader />
      {children}
    </div>
  );
}
    `.trim();
  }

  buildComponent(component: string, archetype: ArchetypeDefinition): string {
    return `
import { useFinancialData } from '@/hooks/finance/use-financial-data';

export default function ${this.capitalize(component)}() {
  const { financials, loading } = useFinancialData();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="${component}">
      {/* Finance-specific component */}
    </div>
  );
}
    `.trim();
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Logistics Page Builder
 */
class LogisticsPageBuilder implements PageBuilder {
  domain = 'logistics';

  buildPage(page: PageDefinition, archetype: ArchetypeDefinition): string {
    return `
import { ShipmentTracking } from '@/components/logistics/shipment-tracking';
import { DeliveryMetrics } from '@/components/logistics/delivery-metrics';
import { FleetStatus } from '@/components/logistics/fleet-status';

export default function ${this.capitalize(page.id)}Page() {
  return (
    <div className="logistics-page">
      <ShipmentTracking />
      <DeliveryMetrics />
      <FleetStatus />
    </div>
  );
}
    `.trim();
  }

  buildLayout(layout: string, archetype: ArchetypeDefinition): string {
    return `
import { LogisticsHeader } from '@/components/logistics/logistics-header';

export default function ${this.capitalize(layout)}Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="logistics-layout">
      <LogisticsHeader />
      {children}
    </div>
  );
}
    `.trim();
  }

  buildComponent(component: string, archetype: ArchetypeDefinition): string {
    return `
import { useShipmentData } from '@/hooks/logistics/use-shipment-data';

export default function ${this.capitalize(component)}() {
  const { shipments, loading } = useShipmentData();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="${component}">
      {/* Logistics-specific component */}
    </div>
  );
}
    `.trim();
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Support Page Builder
 */
class SupportPageBuilder implements PageBuilder {
  domain = 'support';

  buildPage(page: PageDefinition, archetype: ArchetypeDefinition): string {
    return `
import { TicketsHero } from '@/components/support/tickets-hero';
import { SupportMetrics } from '@/components/support/support-metrics';
import { TicketQueue } from '@/components/support/ticket-queue';

export default function ${this.capitalize(page.id)}Page() {
  return (
    <div className="support-page">
      <TicketsHero />
      <SupportMetrics />
      <TicketQueue />
    </div>
  );
}
    `.trim();
  }

  buildLayout(layout: string, archetype: ArchetypeDefinition): string {
    return `
import { SupportSidebar } from '@/components/support/support-sidebar';
import { SupportHeader } from '@/components/support/support-header';

export default function ${this.capitalize(layout)}Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="support-layout">
      <SupportSidebar />
      <div className="main">
        <SupportHeader />
        {children}
      </div>
    </div>
  );
}
    `.trim();
  }

  buildComponent(component: string, archetype: ArchetypeDefinition): string {
    return `
import { useTicketData } from '@/hooks/support/use-ticket-data';

export default function ${this.capitalize(component)}() {
  const { tickets, loading } = useTicketData();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="${component}">
      {/* Support-specific component */}
    </div>
  );
}
    `.trim();
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Project Management Page Builder
 */
class ProjectManagementPageBuilder implements PageBuilder {
  domain = 'project_management';

  buildPage(page: PageDefinition, archetype: ArchetypeDefinition): string {
    return `
import { TasksHero } from '@/components/project-management/tasks-hero';
import { ProjectTimeline } from '@/components/project-management/project-timeline';
import { TeamActivity } from '@/components/project-management/team-activity';

export default function ${this.capitalize(page.id)}Page() {
  return (
    <div className="project-management-page">
      <TasksHero />
      <ProjectTimeline />
      <TeamActivity />
    </div>
  );
}
    `.trim();
  }

  buildLayout(layout: string, archetype: ArchetypeDefinition): string {
    return `
import { ProjectSidebar } from '@/components/project-management/project-sidebar';
import { ProjectHeader } from '@/components/project-management/project-header';

export default function ${this.capitalize(layout)}Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="project-layout">
      <ProjectSidebar />
      <div className="main">
        <ProjectHeader />
        {children}
      </div>
    </div>
  );
}
    `.trim();
  }

  buildComponent(component: string, archetype: ArchetypeDefinition): string {
    return `
import { useTaskData } from '@/hooks/project-management/use-task-data';

export default function ${this.capitalize(component)}() {
  const { tasks, loading } = useTaskData();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="${component}">
      {/* Project Management-specific component */}
    </div>
  );
}
    `.trim();
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

/**
 * Education Page Builder
 */
class EducationPageBuilder implements PageBuilder {
  domain = 'education';

  buildPage(page: PageDefinition, archetype: ArchetypeDefinition): string {
    return `
import { CoursesHero } from '@/components/education/courses-hero';
import { StudentProgress } from '@/components/education/student-progress';
import { CourseList } from '@/components/education/course-list';

export default function ${this.capitalize(page.id)}Page() {
  return (
    <div className="education-page">
      <CoursesHero />
      <StudentProgress />
      <CourseList />
    </div>
  );
}
    `.trim();
  }

  buildLayout(layout: string, archetype: ArchetypeDefinition): string {
    return `
import { EducationSidebar } from '@/components/education/education-sidebar';
import { EducationHeader } from '@/components/education/education-header';

export default function ${this.capitalize(layout)}Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="education-layout">
      <EducationSidebar />
      <div className="main">
        <EducationHeader />
        {children}
      </div>
    </div>
  );
}
    `.trim();
  }

  buildComponent(component: string, archetype: ArchetypeDefinition): string {
    return `
import { useCourseData } from '@/hooks/education/use-course-data';

export default function ${this.capitalize(component)}() {
  const { courses, loading } = useCourseData();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="${component}">
      {/* Education-specific component */}
    </div>
  );
}
    `.trim();
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export const archetypeNativePageBuilders = new ArchetypeNativePageBuilders();

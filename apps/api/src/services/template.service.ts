// =============================================================================
// apps/api/src/services/template.service.ts
// Template orchestration service.
// =============================================================================

import type { EntitySchema, GeneratedFile } from "@oneatlas/shared";
import { prisma } from "@oneatlas/db";
import { logger } from "../lib/logger";

class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

export interface Template {
  id: string;
  name: string;
  description: string;
}

export interface DashboardTemplate extends Template {
  domain: string;
  icon: string;
}

export interface DashboardConfigInput {
  templateId?: string;
  layout?: JsonInputValue;
  theme?: JsonInputValue;
  widgets?: JsonInputValue;
}

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonInputValue = Exclude<JsonValue, null>;
type JsonObject = { [key: string]: JsonValue };
type DayCount = { day: string; count: number };
type DateCount = { date: string; count: number };
type SupportTicket = Awaited<ReturnType<typeof prisma.supportTicket.findMany>>[number];
type CrmDeal = Awaited<ReturnType<typeof prisma.crmDeal.findMany>>[number];
type EcomOrder = Awaited<ReturnType<typeof prisma.ecomOrder.findMany>>[number];
type EcomProduct = Awaited<ReturnType<typeof prisma.ecomProduct.findMany>>[number];
type AtsCandidate = Awaited<ReturnType<typeof prisma.atsCandidate.findMany>>[number];
type FinanceTransaction = Awaited<
  ReturnType<typeof prisma.financeTransaction.findMany>
>[number];
type LogisticsShipment = Awaited<
  ReturnType<typeof prisma.logisticsShipment.findMany>
>[number];
type PmTask = Awaited<ReturnType<typeof prisma.pmTask.findMany>>[number];
type EduCourse = Awaited<ReturnType<typeof prisma.eduCourse.findMany>>[number];
type HealthcarePatient = Awaited<
  ReturnType<typeof prisma.healthcarePatient.findMany>
>[number];
type ProjectDashboardConfig = NonNullable<
  Awaited<ReturnType<typeof prisma.projectDashboardConfig.findFirst>>
>;

type DashboardData =
  | {
      openTickets: number;
      liveChats: number;
      csatScore: number;
      avgResponseTime: string;
      ticketVolume: DayCount[];
      recentTickets: SupportTicket[];
      activeAgents: number;
    }
  | {
      totalDeals: number;
      totalValue: number;
      pipeline: Array<{ stage: string; count: number; value: number }>;
      recentDeals: CrmDeal[];
      totalContacts: number;
    }
  | {
      totalOrders: number;
      pendingOrders: number;
      totalRevenue: number;
      lowStockProducts: EcomProduct[];
      recentOrders: EcomOrder[];
    }
  | {
      totalCandidates: number;
      pipeline: Array<{ stage: string; count: number }>;
      upcomingInterviews: AtsCandidate[];
      recentCandidates: AtsCandidate[];
    }
  | {
      totalRevenue: number;
      totalExpenses: number;
      netProfit: number;
      recentTransactions: FinanceTransaction[];
      expenseByCategory: Array<{ category: string; amount: number }>;
    }
  | {
      totalShipments: number;
      inTransit: number;
      delivered: number;
      delayed: number;
      recentShipments: LogisticsShipment[];
    }
  | {
      totalTasks: number;
      todo: number;
      inProgress: number;
      done: number;
      recentTasks: PmTask[];
      completionRate: number;
    }
  | {
      totalCourses: number;
      totalEnrolled: number;
      avgCompletion: number;
      courses: EduCourse[];
    }
  | {
      waitingPatients: number;
      urgentCases: number;
      todayAppointments: number;
      recentPatients: HealthcarePatient[];
    }
  | {
      totalEvents: number;
      topEvents: Array<{ event: string; count: number; value: number }>;
      trend: DateCount[];
    };

const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: "support",
    name: "Support",
    description: "Customer support tickets, live chats, and agent activity.",
    domain: "Customer Support",
    icon: "headphones",
  },
  {
    id: "crm",
    name: "CRM",
    description: "Sales pipeline, deal value, and customer contacts.",
    domain: "Sales",
    icon: "briefcase-business",
  },
  {
    id: "ecommerce",
    name: "Ecommerce",
    description: "Orders, revenue, fulfillment, and inventory health.",
    domain: "Commerce",
    icon: "shopping-cart",
  },
  {
    id: "ats",
    name: "ATS",
    description: "Candidate pipeline, interviews, and recruiting activity.",
    domain: "Recruiting",
    icon: "users",
  },
  {
    id: "finance",
    name: "Finance",
    description: "Revenue, expenses, profit, and recent transactions.",
    domain: "Finance",
    icon: "wallet-cards",
  },
  {
    id: "logistics",
    name: "Logistics",
    description: "Shipment status, delivery progress, and delays.",
    domain: "Operations",
    icon: "truck",
  },
  {
    id: "pm",
    name: "Project Management",
    description: "Task progress, status counts, and completion rate.",
    domain: "Productivity",
    icon: "list-checks",
  },
  {
    id: "education",
    name: "Education",
    description: "Courses, enrollment, and completion progress.",
    domain: "Learning",
    icon: "graduation-cap",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    description: "Patient queues, urgent cases, and appointments.",
    domain: "Healthcare",
    icon: "heart-pulse",
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "Event volume, top events, and seven-day trend.",
    domain: "Analytics",
    icon: "chart-no-axes-combined",
  },
];

function lastSevenDayRange(): { start: Date; keys: string[] } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(today.getDate() - 6);

  const keys = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return formatDay(day);
  });

  return { start, keys };
}

function formatDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function countByDay<T>(
  records: T[],
  keys: string[],
  getDate: (record: T) => Date
): DayCount[] {
  const counts = new Map<string, number>(keys.map((key) => [key, 0]));

  for (const record of records) {
    const key = formatDay(getDate(record));
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return keys.map((day) => ({ day, count: counts.get(day) ?? 0 }));
}

function countByDate<T>(
  records: T[],
  keys: string[],
  getDate: (record: T) => Date
): DateCount[] {
  return countByDay(records, keys, getDate).map(({ day, count }) => ({
    date: day,
    count,
  }));
}

function completionPercent(completed: number, enrolled: number): number {
  if (enrolled === 0) return 0;
  return Math.round((completed / enrolled) * 100);
}

export interface TemplateMatch {
  template: Template;
  confidence: number;
  modifications: Record<string, string>;
}

export interface ModificationRequest {
  template: Template;
  entity: EntitySchema;
  userPrompt: string;
  domain?: string;
}

export interface ModificationResult {
  modifiedTemplate: string;
  modifications: Record<string, string>;
  confidence: number;
}

export class TemplateService {
  private fail(method: string): never {
    throw new NotImplementedError(
      `Template service method ${method} is not implemented yet. The template-engine package is not wired into the API package.`
    );
  }

  async getTemplate(templateId: string): Promise<Template | undefined> {
    return DASHBOARD_TEMPLATES.find((template) => template.id === templateId);
  }

  async getAllTemplates(): Promise<Template[]> {
    return this.listTemplates();
  }

  async getDashboardData(
    projectId: string,
    orgId: string,
    templateId: string
  ): Promise<DashboardData> {
    try {
      const where = { orgId, projectId };
      const { start, keys } = lastSevenDayRange();

      switch (templateId) {
        case "support": {
          const [
            openTickets,
            liveChats,
            ticketVolumeRecords,
            recentTickets,
            activeChats,
          ] = await Promise.all([
            prisma.supportTicket.count({ where: { ...where, status: "open" } }),
            prisma.supportChat.count({ where: { ...where, status: "active" } }),
            prisma.supportTicket.findMany({
              where: { ...where, createdAt: { gte: start } },
              select: { createdAt: true },
            }),
            prisma.supportTicket.findMany({
              where,
              orderBy: { createdAt: "desc" },
              take: 10,
            }),
            prisma.supportChat.findMany({
              where: { ...where, status: "active", agentId: { not: null } },
              select: { agentId: true },
            }),
          ]);

          return {
            openTickets,
            liveChats,
            csatScore: 0,
            avgResponseTime: "0m",
            ticketVolume: countByDay(
              ticketVolumeRecords,
              keys,
              (record) => record.createdAt
            ),
            recentTickets,
            activeAgents: new Set(activeChats.map((chat) => chat.agentId)).size,
          };
        }

        case "crm": {
          const [totalDeals, valueAggregate, pipeline, recentDeals, totalContacts] =
            await Promise.all([
              prisma.crmDeal.count({ where }),
              prisma.crmDeal.aggregate({
                where,
                _sum: { value: true },
              }),
              prisma.crmDeal.groupBy({
                by: ["stage"],
                where,
                _count: { _all: true },
                _sum: { value: true },
              }),
              prisma.crmDeal.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: 10,
              }),
              prisma.crmContact.count({ where }),
            ]);

          return {
            totalDeals,
            totalValue: valueAggregate._sum.value ?? 0,
            pipeline: pipeline.map((stage) => ({
              stage: stage.stage,
              count: stage._count._all,
              value: stage._sum.value ?? 0,
            })),
            recentDeals,
            totalContacts,
          };
        }

        case "ecommerce": {
          const [
            totalOrders,
            pendingOrders,
            revenueAggregate,
            lowStockProducts,
            recentOrders,
          ] = await Promise.all([
            prisma.ecomOrder.count({ where }),
            prisma.ecomOrder.count({ where: { ...where, status: "pending" } }),
            prisma.ecomOrder.aggregate({ where, _sum: { total: true } }),
            prisma.ecomProduct.findMany({
              where: { ...where, stock: { lte: 10 } },
              orderBy: { stock: "asc" },
              take: 10,
            }),
            prisma.ecomOrder.findMany({
              where,
              orderBy: { createdAt: "desc" },
              take: 10,
            }),
          ]);

          return {
            totalOrders,
            pendingOrders,
            totalRevenue: revenueAggregate._sum.total ?? 0,
            lowStockProducts,
            recentOrders,
          };
        }

        case "ats": {
          const [totalCandidates, pipeline, upcomingInterviews, recentCandidates] =
            await Promise.all([
              prisma.atsCandidate.count({ where }),
              prisma.atsCandidate.groupBy({
                by: ["stage"],
                where,
                _count: { _all: true },
              }),
              prisma.atsCandidate.findMany({
                where: { ...where, interviewAt: { gte: new Date() } },
                orderBy: { interviewAt: "asc" },
                take: 10,
              }),
              prisma.atsCandidate.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: 10,
              }),
            ]);

          return {
            totalCandidates,
            pipeline: pipeline.map((stage) => ({
              stage: stage.stage,
              count: stage._count._all,
            })),
            upcomingInterviews,
            recentCandidates,
          };
        }

        case "finance": {
          const [
            revenueAggregate,
            expenseAggregate,
            recentTransactions,
            expenseByCategory,
          ] = await Promise.all([
            prisma.financeTransaction.aggregate({
              where: { ...where, type: "revenue" },
              _sum: { amount: true },
            }),
            prisma.financeTransaction.aggregate({
              where: { ...where, type: "expense" },
              _sum: { amount: true },
            }),
            prisma.financeTransaction.findMany({
              where,
              orderBy: { date: "desc" },
              take: 10,
            }),
            prisma.financeTransaction.groupBy({
              by: ["category"],
              where: { ...where, type: "expense" },
              _sum: { amount: true },
            }),
          ]);
          const totalRevenue = revenueAggregate._sum.amount ?? 0;
          const totalExpenses = expenseAggregate._sum.amount ?? 0;

          return {
            totalRevenue,
            totalExpenses,
            netProfit: totalRevenue - totalExpenses,
            recentTransactions,
            expenseByCategory: expenseByCategory.map((category) => ({
              category: category.category ?? "Uncategorized",
              amount: category._sum.amount ?? 0,
            })),
          };
        }

        case "logistics": {
          const [totalShipments, inTransit, delivered, delayed, recentShipments] =
            await Promise.all([
              prisma.logisticsShipment.count({ where }),
              prisma.logisticsShipment.count({
                where: { ...where, status: "in_transit" },
              }),
              prisma.logisticsShipment.count({
                where: { ...where, status: "delivered" },
              }),
              prisma.logisticsShipment.count({
                where: { ...where, status: "delayed" },
              }),
              prisma.logisticsShipment.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: 10,
              }),
            ]);

          return {
            totalShipments,
            inTransit,
            delivered,
            delayed,
            recentShipments,
          };
        }

        case "pm": {
          const [totalTasks, todo, inProgress, done, recentTasks] =
            await Promise.all([
              prisma.pmTask.count({ where }),
              prisma.pmTask.count({
                where: { ...where, status: { in: ["todo", "to_do"] } },
              }),
              prisma.pmTask.count({
                where: {
                  ...where,
                  status: { in: ["in_progress", "in-progress", "in progress"] },
                },
              }),
              prisma.pmTask.count({
                where: { ...where, status: { in: ["done", "completed"] } },
              }),
              prisma.pmTask.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: 10,
              }),
            ]);

          return {
            totalTasks,
            todo,
            inProgress,
            done,
            recentTasks,
            completionRate:
              totalTasks === 0 ? 0 : Math.round((done / totalTasks) * 100),
          };
        }

        case "education": {
          const [totalCourses, enrollmentAggregate, courses] = await Promise.all([
            prisma.eduCourse.count({ where }),
            prisma.eduCourse.aggregate({
              where,
              _sum: { enrolled: true, completed: true },
            }),
            prisma.eduCourse.findMany({
              where,
              orderBy: { createdAt: "desc" },
              take: 10,
            }),
          ]);
          const enrolled = enrollmentAggregate._sum.enrolled ?? 0;
          const completed = enrollmentAggregate._sum.completed ?? 0;

          return {
            totalCourses,
            totalEnrolled: enrolled,
            avgCompletion: completionPercent(completed, enrolled),
            courses,
          };
        }

        case "healthcare": {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);

          const [waitingPatients, urgentCases, todayAppointments, recentPatients] =
            await Promise.all([
              prisma.healthcarePatient.count({
                where: { ...where, status: "waiting" },
              }),
              prisma.healthcarePatient.count({
                where: { ...where, urgency: "urgent" },
              }),
              prisma.healthcarePatient.count({
                where: {
                  ...where,
                  appointedAt: { gte: today, lt: tomorrow },
                },
              }),
              prisma.healthcarePatient.findMany({
                where,
                orderBy: { createdAt: "desc" },
                take: 10,
              }),
            ]);

          return {
            waitingPatients,
            urgentCases,
            todayAppointments,
            recentPatients,
          };
        }

        case "analytics": {
          const [totalEvents, topEvents, trendRecords] = await Promise.all([
            prisma.analyticsEvent.count({ where }),
            prisma.analyticsEvent.groupBy({
              by: ["event"],
              where,
              _count: { _all: true },
              _sum: { value: true },
              orderBy: { _count: { event: "desc" } },
              take: 10,
            }),
            prisma.analyticsEvent.findMany({
              where: { ...where, createdAt: { gte: start } },
              select: { createdAt: true },
            }),
          ]);

          return {
            totalEvents,
            topEvents: topEvents.map((event) => ({
              event: event.event,
              count: event._count._all,
              value: event._sum.value ?? 0,
            })),
            trend: countByDate(
              trendRecords,
              keys,
              (record) => record.createdAt
            ),
          };
        }

        default:
          throw new NotImplementedError(`Unknown dashboard template ${templateId}`);
      }
    } catch (error) {
      logger.error("template.dashboard_data.failed", {
        projectId,
        orgId,
        templateId,
        error,
      });
      throw error;
    }
  }

  async getDashboardConfig(
    projectId: string,
    orgId: string
  ): Promise<ProjectDashboardConfig | { layout: {}; theme: {}; widgets: [] }> {
    try {
      const config = await prisma.projectDashboardConfig.findFirst({
        where: { projectId, orgId },
      });

      return config ?? { layout: {}, theme: {}, widgets: [] };
    } catch (error) {
      logger.error("template.dashboard_config.get_failed", {
        projectId,
        orgId,
        error,
      });
      throw error;
    }
  }

  async saveDashboardConfig(
    projectId: string,
    orgId: string,
    config: DashboardConfigInput,
    userId: string
  ): Promise<ProjectDashboardConfig> {
    try {
      const existing = await prisma.projectDashboardConfig.findFirst({
        where: { projectId, orgId },
      });

      if (existing) {
        await prisma.projectDashboardConfig.updateMany({
          where: { projectId, orgId },
          data: {
            templateId: config.templateId ?? existing.templateId,
            layout: config.layout ?? existing.layout ?? {},
            theme: config.theme ?? existing.theme ?? {},
            widgets: config.widgets ?? existing.widgets ?? [],
            updatedBy: userId,
          },
        });
      } else {
        await prisma.projectDashboardConfig.create({
          data: {
            orgId,
            projectId,
            templateId: config.templateId ?? "custom",
            layout: config.layout ?? {},
            theme: config.theme ?? {},
            widgets: config.widgets ?? [],
            createdBy: userId,
            updatedBy: userId,
          },
        });
      }

      const saved = await prisma.projectDashboardConfig.findFirst({
        where: { projectId, orgId },
      });

      if (!saved) {
        throw new Error("Dashboard config was not saved");
      }

      return saved;
    } catch (error) {
      logger.error("template.dashboard_config.save_failed", {
        projectId,
        orgId,
        userId,
        error,
      });
      throw error;
    }
  }

  async listTemplates(_orgId?: string): Promise<DashboardTemplate[]> {
    try {
      return DASHBOARD_TEMPLATES;
    } catch (error) {
      logger.error("template.list.failed", { error });
      throw error;
    }
  }

  async findMatchingTemplates(
    entity: EntitySchema,
    domain?: string
  ): Promise<TemplateMatch[]> {
    const normalizedDomain = domain?.toLowerCase();
    const matches = DASHBOARD_TEMPLATES.filter((template) => {
      if (!normalizedDomain) return true;
      return (
        template.id === normalizedDomain ||
        template.domain.toLowerCase() === normalizedDomain
      );
    });

    return matches.map((template) => ({
      template,
      confidence:
        template.id === normalizedDomain ||
        template.name.toLowerCase() === entity.name.toLowerCase()
          ? 0.9
          : 0.65,
      modifications: {},
    }));
  }

  async modifyTemplate(
    request: ModificationRequest
  ): Promise<ModificationResult> {
    const template = await this.getTemplate(request.template.id);

    return {
      modifiedTemplate: JSON.stringify(
        {
          ...(template ?? request.template),
          entity: request.entity.name,
          prompt: request.userPrompt,
          domain: request.domain,
        },
        null,
        2
      ),
      modifications: {
        entity: request.entity.name,
        domain: request.domain ?? "generic",
      },
      confidence: template ? 0.75 : 0.5,
    };
  }

  async generateValidation(
    entity: EntitySchema,
    domain?: string
  ): Promise<GeneratedFile> {
    const fields = entity.fields
      .filter((field) => !["id", "createdAt", "updatedAt"].includes(field.name))
      .map((field) => `  ${field.name}: z.unknown(),`)
      .join("\n");

    return {
      filePath: `lib/validations/${entity.nameSlug}.ts`,
      fileType: "config",
      entityName: entity.name,
      content: [
        `import { z } from "zod";`,
        "",
        `export const ${entity.nameSlug}Schema = z.object({`,
        fields,
        `});`,
      ].join("\n"),
    };
  }

  async generatePage(
    entity: EntitySchema,
    domain?: string
  ): Promise<GeneratedFile> {
    return {
      filePath: `app/${entity.nameSlug}/page.tsx`,
      fileType: "page",
      entityName: entity.name,
      content: [
        `export default function ${entity.name}Page() {`,
        `  return <main>${entity.namePlural}</main>;`,
        `}`,
      ].join("\n"),
    };
  }

  async generateApi(
    entity: EntitySchema,
    domain?: string
  ): Promise<GeneratedFile> {
    return {
      filePath: `app/api/${entity.nameSlug}/route.ts`,
      fileType: "api-route",
      entityName: entity.name,
      content: [
        `import { NextResponse } from "next/server";`,
        "",
        `export async function GET() {`,
        `  return NextResponse.json({ items: [] });`,
        `}`,
      ].join("\n"),
    };
  }

  async canGenerate(entity: EntitySchema, domain?: string): Promise<boolean> {
    const matches = await this.findMatchingTemplates(entity, domain);
    return matches.length > 0;
  }
}

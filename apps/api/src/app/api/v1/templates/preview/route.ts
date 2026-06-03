// =============================================================================
// apps/api/src/app/api/v1/templates/preview/route.ts
// GET /api/v1/templates/preview
// Public endpoint for marketing template previews. Exposes strict demo data
// transformed to the exact minimal shape required by the UI to prevent over-fetching.
// =============================================================================

import { NextRequest } from "next/server";
import { prisma } from "@oneatlas/db";
import { ok, errorResponse } from "../../../../../lib/response";
import { TemplateService } from "../../../../../services/template.service";

const templateService = new TemplateService();

function formatCurrency(num: number): string {
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}k`;
  return `$${num}`;
}

export async function GET(req: NextRequest) {
  try {
    // Look up the demo organization using the stable slug established in seed.ts
    const demoOrg = await prisma.organization.findUnique({
      where: { slug: "demo-templates" },
      select: { id: true },
    });

    if (!demoOrg) {
      return ok({}); // If seed hasn't run, return empty object safely
    }

    const orgId = demoOrg.id;

    const safeFetch = async <T>(promise: Promise<T>, name: string): Promise<T | null> => {
      try {
        return await promise;
      } catch (err) {
        console.error(`[TemplatePreview] Failed to fetch data for ${name}:`, err);
        return null;
      }
    };

    const [
      crmRaw,
      financeRaw,
      analyticsRaw,
      ecommerceRaw,
      atsRaw,
      supportRaw,
    ] = await Promise.all([
      safeFetch(templateService.getDashboardData("demo-project-crm", orgId, "crm"), "crm"),
      safeFetch(templateService.getDashboardData("demo-project-finance", orgId, "finance"), "finance"),
      safeFetch(templateService.getDashboardData("demo-project-analytics", orgId, "analytics"), "analytics"),
      safeFetch(templateService.getDashboardData("demo-project-ecom", orgId, "ecommerce"), "ecommerce"),
      safeFetch(templateService.getDashboardData("demo-project-ats", orgId, "ats"), "ats"),
      safeFetch(templateService.getDashboardData("demo-project-support", orgId, "support"), "support"),
    ]);

    // Transform raw outputs into the minimal data contracts required by the UI components
    interface TemplatePreviews {
      kanban?: {
        pipelineValue: string;
        closing: number;
        winRate: number;
        cols: { label: string; cards: { who: string; amt: string; cls: string; stage: string }[] }[];
      };
      flow?: {
        queue: number;
        pending: number;
        autoApproved: number;
        avgHours: number;
        activeTx: { who: string; desc: string; amt: string } | null;
      };
      bars?: {
        mau: number;
        trend: number[];
      };
      inventory?: {
        totalSkus: number;
        stockLevels: string;
        items: { sku: string; name: string; target: number; count: string }[];
      };
      checklist?: {
        done: number;
        total: number;
        tasks: { title: string; day: string }[];
        candidate: string;
        role: string;
      };
      support?: {
        openTickets: number;
        avgWait: string;
        tickets: { id: string; title: string; pri: string; status: string; key: string }[];
      };
    }

    const mappedPreviews: TemplatePreviews = {};

    // KanbanPreview (CRM)
    if (crmRaw && "recentDeals" in crmRaw) {
      const deals = crmRaw.recentDeals.map((d) => ({
        who: d.title.split(" ")[0] || "Acme", // simplify title to company name
        amt: formatCurrency(d.value),
        cls: d.stage === "won" ? "mint" : d.stage === "lead" ? "indigo" : "sky",
        stage: d.stage
      }));
      
      mappedPreviews.kanban = {
        pipelineValue: formatCurrency(crmRaw.totalValue),
        closing: crmRaw.pipeline.find((p) => p.stage === "proposal")?.count || 0,
        winRate: crmRaw.totalDeals > 0 ? Math.round(((crmRaw.pipeline.find((p) => p.stage === "won")?.count || 0) / crmRaw.totalDeals) * 100) : 0,
        cols: [
          { label: "Lead", cards: deals.filter((d) => d.stage === "lead").slice(0, 2) },
          { label: "Active", cards: deals.filter((d) => ["qualified", "proposal"].includes(d.stage)).slice(0, 2) },
          { label: "Won", cards: deals.filter((d) => d.stage === "won").slice(0, 1) },
        ]
      };
    }

    // FlowPreview (Finance / Expense)
    if (financeRaw && "recentTransactions" in financeRaw) {
      const recent = financeRaw.recentTransactions[0];
      mappedPreviews.flow = {
        queue: financeRaw.recentTransactions.filter(t => t.type === "expense").length, // Derived from expense txs
        pending: financeRaw.recentTransactions.filter(t => t.type === "expense").length,
        autoApproved: financeRaw.recentTransactions.filter(t => t.type === "income").length, // Derived from income txs
        avgHours: 4,
        activeTx: recent ? {
          who: "System",
          desc: recent.category || "Software",
          amt: formatCurrency(recent.amount)
        } : null
      };
    }

    // BarsPreview (Analytics)
    if (analyticsRaw && "trend" in analyticsRaw) {
      mappedPreviews.bars = {
        mau: analyticsRaw.totalEvents * 12, // scaled for marketing effect
        trend: analyticsRaw.trend.map((t) => Math.max(10, Math.min(100, t.count * 5))) // normalize to 10-100% for bar heights
      };
    }

    // InventoryPreview (Ecommerce)
    if (ecommerceRaw && "lowStockProducts" in ecommerceRaw) {
      mappedPreviews.inventory = {
        totalSkus: 3420, // Synthetic static because total catalog size isn't exposed by service
        stockLevels: "1,240", // Synthetic snapshot string
        items: ecommerceRaw.lowStockProducts.slice(0, 3).map((p) => ({
          sku: p.sku ? (p.sku.split("-")[1] || "A-000") : "A-000",
          name: p.name,
          target: Math.min(95, p.stock), // width %
          count: p.stock.toString()
        }))
      };
    }

    // ChecklistPreview (ATS / HR)
    if (atsRaw && "recentCandidates" in atsRaw) {
      mappedPreviews.checklist = {
        done: 1,
        total: 4,
        tasks: [
          { title: "Sign offer letter", day: "Day 1" },
          { title: "Set up workstation", day: "Day 1" },
          { title: "Meet your buddy", day: "Day 2" },
          { title: "Complete IT training", day: "Day 3" },
        ],
        candidate: atsRaw.recentCandidates[0]?.name || "Jordan Diaz",
        role: atsRaw.recentCandidates[0]?.role || "Product Designer"
      };
    }

    // SupportPreview (Support)
    if (supportRaw && "recentTickets" in supportRaw) {
      mappedPreviews.support = {
        openTickets: supportRaw.openTickets,
        avgWait: supportRaw.avgResponseTime || "4m 12s",
        tickets: supportRaw.recentTickets.slice(0, 4).map((t) => ({
          id: t.ticketNumber.replace("SUP-", ""),
          title: t.subject,
          pri: t.priority === "high" || t.priority === "urgent" ? "high" : t.priority === "normal" ? "med" : "low",
          status: t.status === "open" ? "open" : t.status === "in_progress" ? "prog" : "done",
          key: t.id
        }))
      };
    }

    const response = ok(mappedPreviews);
    // Vercel Edge Cache: serve stale up to 30s while revalidating in background. Hit DB at most every 5s.
    response.headers.set("Cache-Control", "public, s-maxage=5, stale-while-revalidate=30");
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}

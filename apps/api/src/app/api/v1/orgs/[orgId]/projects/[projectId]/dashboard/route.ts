// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/dashboard/route.ts
// GET /dashboard - fetch template dashboard data
// =============================================================================

export const runtime = "edge";

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireOrgMember } from "../../../../../../../../lib/auth";
import { ok, errorResponse } from "../../../../../../../../lib/response";
import { TemplateService } from "../../../../../../../../services/template.service";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string }>;
}

const templateService = new TemplateService();

const dashboardQuerySchema = z.object({
  templateId: z.string().min(1),
});

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    await requireOrgMember(orgId);

    const { templateId } = dashboardQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams)
    );
    const dashboardData = await templateService.getDashboardData(
      projectId,
      orgId,
      templateId
    );

    const response = ok(dashboardData);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}

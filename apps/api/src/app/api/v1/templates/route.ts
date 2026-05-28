// =============================================================================
// apps/api/src/app/api/v1/templates/route.ts
// GET /templates - list public dashboard templates
// =============================================================================

export const runtime = "edge";

import { NextRequest } from "next/server";
import { ok, errorResponse } from "../../../../lib/response";
import { TemplateService } from "../../../../services/template.service";

const templateService = new TemplateService();

export async function GET(req: NextRequest) {
  try {
    const orgId = req.nextUrl.searchParams.get("orgId") ?? undefined;
    const templates = await templateService.listTemplates(orgId);

    return ok(templates);
  } catch (error) {
    return errorResponse(error);
  }
}

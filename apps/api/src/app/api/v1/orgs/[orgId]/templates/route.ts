// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/templates/route.ts
// GET  /templates — list templates
// POST /templates — modify a template using a request payload
// =============================================================================

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireOrgMember } from "../../../../../../lib/auth";
import { ok, created, errorResponse } from "../../../../../../lib/response";
import { TemplateService } from "../../../../../../services/template.service";
import { paginationSchema, buildOffsetArgs, paginateResult } from "@oneatlas/shared";

interface RouteContext {
  params: Promise<{ orgId: string }>;
}

const templateService = new TemplateService();

const modifyTemplateSchema = z.object({
  template: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
  }),
  entity: z.object({
    name: z.string(),
    namePlural: z.string(),
    nameSlug: z.string(),
    tableName: z.string(),
    fields: z.array(z.unknown()),
    relations: z.array(z.unknown()),
    apiPath: z.string(),
    pagePath: z.string(),
  }),
  userPrompt: z.string(),
  domain: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId } = await params;
    await requireOrgMember(orgId);

    const templates = await templateService.getAllTemplates();
    const { page, limit } = paginationSchema.parse(
      Object.fromEntries(req.nextUrl.searchParams)
    );
    buildOffsetArgs({ page, limit });

    return ok(paginateResult(templates, templates.length, page, limit));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId } = await params;
    await requireOrgMember(orgId, "MEMBER");

    const body = modifyTemplateSchema.parse(await req.json());
    const result = await templateService.modifyTemplate(body as never);
    return created(result);
  } catch (error) {
    return errorResponse(error);
  }
}

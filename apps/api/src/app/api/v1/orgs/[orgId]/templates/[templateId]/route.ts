// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/templates/[templateId]/route.ts
// GET    /templates/:id
// PATCH  /templates/:id
// DELETE /templates/:id
// =============================================================================

export const runtime = "edge";

import { NextRequest } from "next/server";
import { z } from "zod";
import { NotFoundError } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../../lib/auth";
import { ok, noContent, errorResponse } from "../../../../../../../lib/response";
import { TemplateService } from "../../../../../../../services/template.service";

interface RouteContext {
  params: Promise<{ orgId: string; templateId: string }>;
}

const templateService = new TemplateService();

const modifyTemplateSchema = z.object({
  template: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: z.string().min(1),
  }).optional(),
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

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, templateId } = await params;
    await requireOrgMember(orgId);

    const template = await templateService.getTemplate(templateId);
    if (!template) {
      throw new NotFoundError("Template");
    }

    return ok(template);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, templateId } = await params;
    await requireOrgMember(orgId, "MEMBER");

    const body = modifyTemplateSchema.parse(await req.json());
    const result = await templateService.modifyTemplate({
      template: {
        id: templateId,
        name: body.template?.name ?? templateId,
        description: body.template?.description ?? "",
      },
      entity: body.entity as never,
      userPrompt: body.userPrompt,
      domain: body.domain,
    } as never);

    return ok(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, templateId } = await params;
    await requireOrgMember(orgId, "ADMIN");

    const template = await templateService.getTemplate(templateId);
    if (!template) {
      throw new NotFoundError("Template");
    }

    return noContent();
  } catch (error) {
    return errorResponse(error);
  }
}

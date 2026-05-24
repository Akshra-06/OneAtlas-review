// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/integrations/[integrationId]/route.ts
// GET    /integrations/:id
// PATCH  /integrations/:id
// DELETE /integrations/:id
// =============================================================================

export const runtime = "edge";

import { NextRequest } from "next/server";
import { z } from "zod";
import { NotFoundError } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../../../../lib/auth";
import { ok, noContent, errorResponse } from "../../../../../../../../../lib/response";
import { IntegrationService } from "../../../../../../../../../services/integration.service";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string; integrationId: string }>;
}

const updateIntegrationSchema = z.object({
  provider: z.enum([
    "SLACK",
    "GMAIL",
    "GOOGLE_SHEETS",
    "GOOGLE_DRIVE",
    "NOTION",
    "GITHUB",
    "JIRA",
    "STRIPE",
    "ZAPIER",
    "WEBHOOK",
    "CUSTOM",
  ]).optional(),
  name: z.string().min(1).max(100).optional(),
  accessToken: z.string().optional().nullable(),
  refreshToken: z.string().optional().nullable(),
  tokenExpiry: z.coerce.date().optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

const integrationService = new IntegrationService();

async function getIntegrationOrThrow(orgId: string, integrationId: string) {
  const integration = await integrationService.getById(orgId, integrationId);
  if (!integration) {
    throw new NotFoundError("Integration");
  }

  return integration;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, integrationId } = await params;
    await requireOrgMember(orgId);

    const integration = await getIntegrationOrThrow(orgId, integrationId);
    return ok(integration);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, integrationId } = await params;
    await requireOrgMember(orgId, "MEMBER");

    const body = updateIntegrationSchema.parse(await req.json());
    const updated = await integrationService.update(orgId, integrationId, {
      ...body,
      metadata: body.metadata as never,
    });
    return ok(updated);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, integrationId } = await params;
    await requireOrgMember(orgId, "ADMIN");

    await getIntegrationOrThrow(orgId, integrationId);
    await integrationService.delete(orgId, integrationId);
    return noContent();
  } catch (error) {
    return errorResponse(error);
  }
}

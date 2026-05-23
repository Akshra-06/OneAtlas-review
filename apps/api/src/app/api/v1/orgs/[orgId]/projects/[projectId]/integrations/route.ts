// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/integrations/route.ts
// GET  /integrations — list integrations for the org
// POST /integrations — create an integration
// =============================================================================

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { z } from "zod";
import { NotFoundError } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../../../lib/auth";
import { ok, created, errorResponse } from "../../../../../../../../lib/response";
import { IntegrationService } from "../../../../../../../../services/integration.service";
import { ProjectService } from "../../../../../../../../services/project.service";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string }>;
}

const createIntegrationSchema = z.object({
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
  ]),
  name: z.string().min(1).max(100),
  accessToken: z.string().optional().nullable(),
  refreshToken: z.string().optional().nullable(),
  tokenExpiry: z.coerce.date().optional().nullable(),
  metadata: z.record(z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

const integrationService = new IntegrationService();
const projectService = new ProjectService();

async function getProjectOrThrow(orgId: string, projectId: string) {
  const project = await projectService.getById(orgId, projectId);
  if (project && project.orgId === orgId) {
    return project;
  }

  throw new NotFoundError("Project");
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    await requireOrgMember(orgId);
    await getProjectOrThrow(orgId, projectId);

    const integrations = await integrationService.listByOrg(orgId);
    return ok(integrations);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    await requireOrgMember(orgId, "MEMBER");
    await getProjectOrThrow(orgId, projectId);

    const body = createIntegrationSchema.parse(await req.json());
    const integration = await integrationService.create(orgId, {
      ...body,
      metadata: body.metadata as never,
    });
    return created(integration);
  } catch (error) {
    return errorResponse(error);
  }
}

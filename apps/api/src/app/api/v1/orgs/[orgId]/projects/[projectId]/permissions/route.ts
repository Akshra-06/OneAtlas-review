// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/permissions/route.ts
// GET  /permissions — project permission snapshot
// POST /permissions — evaluate a permission action
// =============================================================================

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { z } from "zod";
import { NotFoundError } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../../../lib/auth";
import { ok, created, errorResponse } from "../../../../../../../../lib/response";
import { ProjectService } from "../../../../../../../../services/project.service";
import { BillingService } from "../../../../../../../../services/billing.service";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string }>;
}

const permissionActionSchema = z.object({
  action: z.enum([
    "read",
    "edit",
    "delete",
    "deploy",
    "manage-members",
    "manage-billing",
    "create-workflow",
  ]),
});

const projectService = new ProjectService();
const billingService = new BillingService();

async function getProjectOrThrow(orgId: string, projectId: string) {
  const project = await projectService.getById(orgId, projectId);
  if (!project) {
    throw new NotFoundError("Project");
  }

  return project;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    const auth = await requireOrgMember(orgId);
    await getProjectOrThrow(orgId, projectId);

    const billing = await billingService.getByOrgId(auth.orgId);
    const canCreateWorkflow = await billingService.canCreateWorkflow(auth.orgId);
    const canAddMember = await billingService.canAddMember(auth.orgId);

    return ok({
      role: auth.role,
      permissions: {
        read: true,
        edit: auth.role === "OWNER" || auth.role === "ADMIN" || auth.role === "MEMBER",
        delete: auth.role === "OWNER" || auth.role === "ADMIN",
        deploy: auth.role === "OWNER" || auth.role === "ADMIN" || auth.role === "MEMBER",
        manageMembers: canAddMember && (auth.role === "OWNER" || auth.role === "ADMIN"),
        manageBilling: auth.role === "OWNER",
        createWorkflow: canCreateWorkflow && (auth.role === "OWNER" || auth.role === "ADMIN" || auth.role === "MEMBER"),
      },
      billing: billing?.plan ?? null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    const auth = await requireOrgMember(orgId, "MEMBER");
    await getProjectOrThrow(orgId, projectId);

    const body = permissionActionSchema.parse(await req.json());
    const billing = await billingService.getByOrgId(auth.orgId);

    const allowed =
      body.action === "read"
        ? true
        : body.action === "manage-billing"
          ? auth.role === "OWNER"
          : body.action === "manage-members"
            ? auth.role === "OWNER" || auth.role === "ADMIN"
            : body.action === "create-workflow"
              ? (await billingService.canCreateWorkflow(auth.orgId)) && (auth.role === "OWNER" || auth.role === "ADMIN" || auth.role === "MEMBER")
              : auth.role === "OWNER" || auth.role === "ADMIN" || auth.role === "MEMBER";

    return created({
      action: body.action,
      allowed,
      role: auth.role,
      plan: billing?.plan ?? null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

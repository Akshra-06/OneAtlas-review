// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/deployments/[deploymentId]/route.ts
//
// GET    /deployments/:id          — fetch single deployment + build log
// POST   /deployments/:id/rollback — roll back to this version (body: empty)
// DELETE /deployments/:id          — undeploy (take offline)
// =============================================================================

export const runtime = "edge";

import { NextRequest } from "next/server";
import { prisma } from "@oneatlas/db";
import { NotFoundError, DeploymentError } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../../../../lib/auth";
import { ok, noContent, errorResponse } from "../../../../../../../../../lib/response";
import { createAuditLog } from "@oneatlas/db";
import { enqueue, getRedis } from "../../../../../../../../../lib/queue/client";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string; deploymentId: string }>;
}

// ── GET — single deployment ───────────────────────────────────────────────────
export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId, deploymentId } = await params;
    await requireOrgMember(orgId);

    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: {
        project: { select: { orgId: true } },
      },
    });

    if (!deployment || deployment.project.orgId !== orgId) {
      throw new NotFoundError("Deployment");
    }

    // Strip the joined project field from the response
    const { project: _p, ...rest } = deployment;
    return ok(rest);
  } catch (error) {
    return errorResponse(error);
  }
}

// ── POST — rollback to this deployment ───────────────────────────────────────
export async function POST(req: NextRequest, { params }: RouteContext) {
  // We check the path segment to decide action
  const url = new URL(req.url);
  const isRollback = url.pathname.endsWith("/rollback");
  if (!isRollback) {
    return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
  }

  try {
    const { orgId, projectId, deploymentId } = await params;
    const auth = await requireOrgMember(orgId, "MEMBER");

    const target = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { project: { select: { orgId: true } } },
    });

    if (!target || target.project.orgId !== orgId) {
      throw new NotFoundError("Deployment");
    }

    if (target.status !== "LIVE" && target.status !== "FAILED") {
      throw new DeploymentError(
        "Can only roll back to a LIVE or FAILED deployment version."
      );
    }

    // Block if another deploy is already in progress
    const inProgress = await prisma.deployment.findFirst({
      where: {
        projectId,
        status: { in: ["QUEUED", "BUILDING", "DEPLOYING"] },
      },
    });
    if (inProgress) {
      throw new DeploymentError(
        "A deployment is already in progress. Wait for it to complete before rolling back."
      );
    }

    const lastDeployment = await prisma.deployment.findFirst({
      where: { projectId },
      orderBy: { version: "desc" },
      select: { version: true },
    });

    const rollback = await prisma.deployment.create({
      data: {
        projectId,
        version: (lastDeployment?.version ?? 0) + 1,
        status: "QUEUED",
        env: target.env,
        triggeredBy: auth.userId,
        codeSnapshot: target.codeSnapshot as any,
      },
    });

    // Enqueue job for background processing by @oneatlas/executor
    await enqueue({
      type: "deploy",
      maxRetries: 3,
      payload: {
        deploymentId: rollback.id,
        triggeredByUserId: auth.userId,
      },
    });

    // Mark the original as ROLLED_BACK
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: "ROLLED_BACK" },
    });

    await createAuditLog({
      orgId,
      userId: auth.userId,
      projectId,
      action: "deployment.rolled_back",
      metadata: {
        fromDeploymentId: deploymentId,
        newDeploymentId: rollback.id,
        toVersion: target.version,
      },
    });

    return ok(rollback);
  } catch (error) {
    return errorResponse(error);
  }
}

// ── DELETE — undeploy ─────────────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId, deploymentId } = await params;
    const auth = await requireOrgMember(orgId, "ADMIN");

    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { project: { select: { orgId: true } } },
    });

    if (!deployment || deployment.project.orgId !== orgId) {
      throw new NotFoundError("Deployment");
    }

    if (deployment.status !== "LIVE") {
      throw new DeploymentError("Only LIVE deployments can be undeployed.");
    }

    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: "ROLLED_BACK", deployedAt: null, deployedUrl: null },
    });

    // Send command to @oneatlas/executor to stop the process immediately
    try {
      const redis = getRedis();
      await redis.publish("executor:commands", JSON.stringify({ action: "stop", appId: projectId }));
    } catch (e) {
      console.warn("Failed to publish stop command to executor:", e);
    }

    await createAuditLog({
      orgId,
      userId: auth.userId,
      projectId,
      action: "deployment.undeployed",
      metadata: { deploymentId },
    });

    return noContent();
  } catch (error) {
    return errorResponse(error);
  }
}



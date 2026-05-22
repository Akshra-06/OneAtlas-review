// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/route.ts
// GET  /api/v1/orgs/:orgId/projects  — list projects
// POST /api/v1/orgs/:orgId/projects  — create project (triggers AI generation)
// =============================================================================

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { prisma } from "@oneatlas/db";
import {
  createProjectSchema,
  paginationSchema,
  toSlug,
  buildAppUrl,
  buildOffsetArgs,
  paginateResult,
  ConflictError,
  PlanLimitError,
  PLAN_LIMITS,
} from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../lib/auth";
import { ok, created, errorResponse } from "../../../../../../lib/response";
import { createAuditLog } from "@oneatlas/db";
import { captureProjectCreated } from "../../../../../../lib/analytics";

interface RouteContext {
  params: Promise<{ orgId: string }>;
}

// ── GET /api/v1/orgs/:orgId/projects ─────────────────────────────────────────
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId } = await params;
    const auth = await requireOrgMember(orgId);

    const { page, limit } = paginationSchema.parse(
      Object.fromEntries(req.nextUrl.searchParams)
    );
    const { skip, take } = buildOffsetArgs({ page, limit });

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where: {
          orgId: auth.orgId,
          status: { not: "DELETED" },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take,
        include: {
          _count: { select: { deployments: true, workflows: true } },
          deployments: {
            where: { status: "LIVE", env: "PRODUCTION" },
            orderBy: { version: "desc" },
            take: 1,
            select: { deployedUrl: true, deployedAt: true, version: true },
          },
        },
      }),
      prisma.project.count({
        where: { orgId: auth.orgId, status: { not: "DELETED" } },
      }),
    ]);

    return ok(paginateResult(projects, total, page, limit));
  } catch (error) {
    return errorResponse(error);
  }
}

// ── POST /api/v1/orgs/:orgId/projects ────────────────────────────────────────
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId } = await params;
    const auth = await requireOrgMember(orgId, "MEMBER");
    const body = createProjectSchema.parse(await req.json());

    // Check plan limits
    const [org, projectCount] = await Promise.all([
      prisma.organization.findUniqueOrThrow({
        where: { id: auth.orgId },
        select: { plan: true, maxApps: true, slug: true },
      }),
      prisma.project.count({
        where: { orgId: auth.orgId, status: { not: "DELETED" } },
      }),
    ]);

    if (org.maxApps !== -1 && projectCount >= org.maxApps) {
      throw new PlanLimitError(
        `Your plan allows a maximum of ${org.maxApps} apps. Upgrade to Pro for unlimited apps.`
      );
    }

    // Generate slug + subdomain
    const slug = toSlug(body.name);
    const subdomain = `${slug}-${org.slug}`;

    // Check slug uniqueness within org
    const existing = await prisma.project.findUnique({
      where: { orgId_slug: { orgId: auth.orgId, slug } },
    });
    if (existing) {
      throw new ConflictError(
        `A project with slug "${slug}" already exists in this organization.`
      );
    }

    const project = await prisma.project.create({
      data: {
        orgId: auth.orgId,
        name: body.name,
        slug,
        description: body.description,
        type: body.type,
        prompt: body.prompt,
        subdomain,
        status: "DRAFT",
        metadata: {
          aiModel: "gpt-4o-mini",
          createdBy: auth.userId,
        },
      },
    });

    await createAuditLog({
      orgId: auth.orgId,
      userId: auth.userId,
      projectId: project.id,
      action: "project.created",
      metadata: { name: project.name, slug: project.slug, type: project.type },
    });

    captureProjectCreated({
      distinctId: auth.userId,
      orgId,
      projectId: project.id,
      projectName: project.name,
      projectType: project.type,
      plan: org.plan,
    });

    return created({
      ...project,
      appUrl: buildAppUrl(subdomain),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// NOTE: This route uses PostHog analytics which requires Node.js crypto (not Edge-compatible)
// Deploy this on Serverless Runtime, not Edge Runtime


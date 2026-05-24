// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/analytics/route.ts
// GET  /analytics — snapshot current telemetry metrics
// POST /analytics — record a product analytics event
// =============================================================================

export const runtime = "edge";

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireOrgMember } from "../../../../../../../../lib/auth";
import { ok, created, errorResponse } from "../../../../../../../../lib/response";
import { AnalyticsService } from "../../../../../../../../services/analytics.service";
import { getMetrics, recordRequest, recordError, recordLatency } from "../../../../../../../../telemetry/metrics";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string }>;
}

const analyticsService = new AnalyticsService();

const projectCreatedSchema = z.object({
  type: z.literal("project.created"),
  payload: z.object({
    distinctId: z.string(),
    orgId: z.string().optional(),
    projectId: z.string().optional(),
    projectName: z.string(),
    projectType: z.string(),
    plan: z.string(),
  }),
});

const generationCompletedSchema = z.object({
  type: z.literal("generation.completed"),
  payload: z.object({
    distinctId: z.string(),
    orgId: z.string().optional(),
    projectId: z.string().optional(),
    model: z.string(),
    provider: z.string(),
    cached: z.boolean(),
    latencyMs: z.number().int().nonnegative(),
    pageCount: z.number().int().nonnegative(),
    apiRouteCount: z.number().int().nonnegative(),
    tier: z.enum(["fast", "smart"]),
  }),
});

const deploymentLiveSchema = z.object({
  type: z.literal("deployment.live"),
  payload: z.object({
    distinctId: z.string(),
    orgId: z.string().optional(),
    projectId: z.string().optional(),
    deploymentId: z.string(),
    deployedUrl: z.string(),
    version: z.number().int().nonnegative(),
    env: z.string(),
  }),
});

const analyticsEventSchema = z.union([
  projectCreatedSchema,
  generationCompletedSchema,
  deploymentLiveSchema,
]);

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId } = await params;
    await requireOrgMember(orgId);

    const metrics = await getMetrics();
    return ok(metrics);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    const auth = await requireOrgMember(orgId, "MEMBER");
    await recordRequest();

    const body = analyticsEventSchema.parse(await req.json());

    if (body.type === "project.created") {
      await analyticsService.trackProjectCreated(body.payload);
    } else if (body.type === "generation.completed") {
      await analyticsService.trackGenerationCompleted(body.payload);
    } else {
      await analyticsService.trackDeploymentLive(body.payload);
    }

    await recordLatency(1);

    return created({
      accepted: true,
      orgId,
      projectId,
      userId: auth.userId,
      event: body.type,
    });
  } catch (error) {
    await recordError();
    return errorResponse(error);
  }
}

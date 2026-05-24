// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/observability/route.ts
// GET  /observability — return trace/metric snapshot
// POST /observability — log an event through the observability service
// =============================================================================

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireOrgMember } from "../../../../../../../../lib/auth";
import { ok, created, errorResponse } from "../../../../../../../../lib/response";
import { ObservabilityService } from "../../../../../../../../services/observability.service";
import { createTraceId } from "../../../../../../../../telemetry/tracer";
import { getMetrics, recordRequest, recordError } from "../../../../../../../../telemetry/metrics";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string }>;
}

const observabilityService = new ObservabilityService();

const logEventSchema = z.object({
  level: z.enum(["debug", "info", "warn", "error"]),
  event: z.string().min(1),
  context: z.record(z.unknown()).optional(),
});

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId } = await params;
    await requireOrgMember(orgId);

    const metrics = await getMetrics();
    return ok({
      traceId: createTraceId(),
      metrics,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    const auth = await requireOrgMember(orgId, "MEMBER");
    await recordRequest();

    const body = logEventSchema.parse(await req.json());
    await observabilityService.log(body.level, body.event, {
      ...(body.context ?? {}),
      orgId,
      projectId,
      userId: auth.userId,
    });

    return created({
      logged: true,
      level: body.level,
      event: body.event,
    });
  } catch (error) {
    await recordError();
    return errorResponse(error);
  }
}

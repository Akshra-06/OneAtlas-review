// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/dashboard/config/route.ts
// GET  /dashboard/config - fetch dashboard config
// POST /dashboard/config - save dashboard config
// =============================================================================

export const runtime = "edge";

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireOrgMember } from "../../../../../../../../../lib/auth";
import { ok, created, errorResponse } from "../../../../../../../../../lib/response";
import { TemplateService } from "../../../../../../../../../services/template.service";
import type { DashboardConfigInput } from "../../../../../../../../../services/template.service";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string }>;
}

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
type JsonInputValue = Exclude<JsonValue, null>;
type JsonObject = { [key: string]: JsonValue };

const templateService = new TemplateService();

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema),
  ])
);

const jsonInputValueSchema: z.ZodType<JsonInputValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(jsonValueSchema),
    z.record(jsonValueSchema),
  ])
);

const dashboardConfigSchema = z.object({
  layout: jsonInputValueSchema.optional(),
  theme: jsonInputValueSchema.optional(),
  widgets: jsonInputValueSchema.optional(),
});

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    await requireOrgMember(orgId);

    const config = await templateService.getDashboardConfig(projectId, orgId);
    return ok(config);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    const auth = await requireOrgMember(orgId, "MEMBER");

    const body: DashboardConfigInput = dashboardConfigSchema.parse(
      await req.json()
    );
    const config = await templateService.saveDashboardConfig(
      projectId,
      orgId,
      body,
      auth.userId
    );

    return created(config);
  } catch (error) {
    return errorResponse(error);
  }
}

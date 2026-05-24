// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/entities/route.ts
// GET  /entities — list project entities
// POST /entities — upsert an entity definition
// =============================================================================

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { NotFoundError } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../../../lib/auth";
import { ok, created, errorResponse } from "../../../../../../../../lib/response";
import { EntityService } from "../../../../../../../../services/entity.service";
import {
  createEntitySchema,
  type CreateEntityInput,
} from "../../../../../../../../validators/entity.validator";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string }>;
}

const entityService = new EntityService();

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    await requireOrgMember(orgId);

    const entities = await entityService.listByProject(orgId, projectId);
    return ok(entities);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    await requireOrgMember(orgId, "MEMBER");

    const body: CreateEntityInput = createEntitySchema.parse(await req.json());
    const entity = await entityService.upsert(orgId, projectId, body);

    return created(entity);
  } catch (error) {
    return errorResponse(error);
  }
}

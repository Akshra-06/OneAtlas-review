// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/entities/[entityId]/route.ts
// GET    /entities/:id
// PATCH  /entities/:id
// DELETE /entities/:id
// =============================================================================

export const runtime = "edge";

import { NextRequest } from "next/server";
import { NotFoundError } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../../../../lib/auth";
import { ok, noContent, errorResponse } from "../../../../../../../../../lib/response";
import { EntityService } from "../../../../../../../../../services/entity.service";
import {
  createEntitySchema,
  updateEntitySchema,
  type CreateEntityInput,
  type UpdateEntityInput,
} from "../../../../../../../../../validators/entity.validator";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string; entityId: string }>;
}

const entityService = new EntityService();

async function getEntityOrThrow(orgId: string, projectId: string, entityId: string) {
  const entity = await entityService.getByName(orgId, projectId, entityId);
  if (!entity) {
    throw new NotFoundError("Entity");
  }

  return entity;
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId, entityId } = await params;
    await requireOrgMember(orgId);

    const entity = await getEntityOrThrow(orgId, projectId, entityId);
    return ok(entity);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId, entityId } = await params;
    await requireOrgMember(orgId, "MEMBER");

    const body: UpdateEntityInput = updateEntitySchema.parse(await req.json());
    const existing = await getEntityOrThrow(orgId, projectId, entityId);
    const updated = await entityService.upsert(orgId, projectId, {
      ...existing,
      ...body,
      name: body.name ?? existing.name,
      fields: body.fields ?? existing.fields,
    } as CreateEntityInput);

    return ok(updated);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId, entityId } = await params;
    await requireOrgMember(orgId, "ADMIN");

    await getEntityOrThrow(orgId, projectId, entityId);
    await entityService.deleteByName(orgId, projectId, entityId);

    return noContent();
  } catch (error) {
    return errorResponse(error);
  }
}

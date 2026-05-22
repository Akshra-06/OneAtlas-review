// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/api-keys/[keyId]/route.ts
//
// DELETE /api/v1/orgs/:orgId/api-keys/:keyId  — revoke (delete) an API key
// =============================================================================

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { prisma } from "@oneatlas/db";
import { createAuditLog } from "@oneatlas/db";
import { NotFoundError } from "@oneatlas/shared";
import { requireOrgAdmin } from "../../../../../../../lib/auth";
import { noContent, errorResponse } from "../../../../../../../lib/response";

interface RouteContext {
  params: Promise<{ orgId: string; keyId: string }>;
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, keyId } = await params;
    const auth = await requireOrgAdmin(orgId);

    const key = await prisma.apiKey.findUnique({
      where: { id: keyId },
      select: { id: true, orgId: true, name: true },
    });

    if (!key || key.orgId !== orgId) {
      throw new NotFoundError("API key");
    }

    await prisma.apiKey.delete({ where: { id: keyId } });

    await createAuditLog({
      orgId,
      userId: auth.userId,
      action: "api_key.revoked",
      metadata: { keyId, name: key.name },
    });

    return noContent();
  } catch (error) {
    return errorResponse(error);
  }
}



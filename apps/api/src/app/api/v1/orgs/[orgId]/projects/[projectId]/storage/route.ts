// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/storage/route.ts
// GET  /storage — list stored objects
// POST /storage — write an object
// =============================================================================

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { z } from "zod";
import { requireOrgMember } from "../../../../../../../../lib/auth";
import { ok, created, errorResponse } from "../../../../../../../../lib/response";
import { StorageService } from "../../../../../../../../services/storage.service";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string }>;
}

const storageService = new StorageService();

const putObjectSchema = z.object({
  bucket: z.string().min(1),
  key: z.string().min(1),
  value: z.string().or(z.instanceof(Uint8Array)),
  contentType: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId } = await params;
    await requireOrgMember(orgId);

    const bucket = req.nextUrl.searchParams.get("bucket");
    if (!bucket) {
      return ok({ items: [] });
    }

    await storageService.listObjects(orgId, bucket);
    return ok({ items: [] });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId } = await params;
    await requireOrgMember(orgId, "MEMBER");

    const body = putObjectSchema.parse(await req.json());
    await storageService.putObject({
      orgId,
      bucket: body.bucket,
      key: body.key,
      value: body.value,
      contentType: body.contentType,
    });

    return created({
      bucket: body.bucket,
      key: body.key,
      stored: true,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

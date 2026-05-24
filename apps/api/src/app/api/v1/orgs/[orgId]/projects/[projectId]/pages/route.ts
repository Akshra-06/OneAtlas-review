// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/pages/route.ts
// GET  /pages — list generated pages
// POST /pages — add a generated page entry
// =============================================================================

export const runtime = "edge";

import { NextRequest } from "next/server";
import { z } from "zod";
import { NotFoundError } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../../../lib/auth";
import { ok, created, errorResponse } from "../../../../../../../../lib/response";
import { ProjectService } from "../../../../../../../../services/project.service";
import { paginationSchema } from "@oneatlas/shared";
import { buildOffsetArgs, paginateResult } from "@oneatlas/shared";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string }>;
}

interface PageRecord {
  id: string;
  path: string;
  component: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

function createId(): string {
  return globalThis.crypto.randomUUID();
}

const createPageSchema = z.object({
  path: z.string().min(1).max(200),
  component: z.string().min(1).max(500),
  description: z.string().max(500).default(""),
});

const projectService = new ProjectService();

async function getProjectOrThrow(orgId: string, projectId: string) {
  const project = await projectService.getById(orgId, projectId);
  if (!project) {
    throw new NotFoundError("Project");
  }

  return project;
}

function readPages(project: Awaited<ReturnType<ProjectService["getById"]>>): PageRecord[] {
  const generated = (project?.generatedCode ?? {}) as Record<string, unknown>;
  const pages = generated.pages;

  if (!Array.isArray(pages)) {
    return [];
  }

  return pages.map((page) => {
    const record = page as Partial<PageRecord> & { path?: string; component?: string; description?: string };
    return {
      id: record.id ?? record.path ?? createId(),
      path: record.path ?? "/",
      component: record.component ?? "",
      description: record.description ?? "",
      createdAt: record.createdAt ?? new Date().toISOString(),
      updatedAt: record.updatedAt ?? new Date().toISOString(),
    };
  });
}

async function writePages(orgId: string, projectId: string, pages: PageRecord[]): Promise<void> {
  await projectService.update(orgId, projectId, {
    generatedCode: { pages } as never,
  });
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    await requireOrgMember(orgId);

    const project = await getProjectOrThrow(orgId, projectId);
    const pages = readPages(project);

    const { page, limit } = paginationSchema.parse(
      Object.fromEntries(req.nextUrl.searchParams)
    );
    const { skip, take } = buildOffsetArgs({ page, limit });

    return ok(paginateResult(pages, pages.length, page, limit));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    await requireOrgMember(orgId, "MEMBER");

    const body = createPageSchema.parse(await req.json());
    const project = await getProjectOrThrow(orgId, projectId);
    const pages = readPages(project);
    const now = new Date().toISOString();
    const pageRecord: PageRecord = {
      id: createId(),
      path: body.path,
      component: body.component,
      description: body.description,
      createdAt: now,
      updatedAt: now,
    };

    await writePages(orgId, projectId, [...pages, pageRecord]);
    return created(pageRecord);
  } catch (error) {
    return errorResponse(error);
  }
}

// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/pages/[pageId]/route.ts
// GET    /pages/:id
// PATCH  /pages/:id
// DELETE /pages/:id
// =============================================================================

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { z } from "zod";
import { NotFoundError } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../../../../lib/auth";
import { ok, noContent, errorResponse } from "../../../../../../../../../lib/response";
import { ProjectService } from "../../../../../../../../../services/project.service";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string; pageId: string }>;
}

interface PageRecord {
  id: string;
  path: string;
  component: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const updatePageSchema = z.object({
  path: z.string().min(1).max(200).optional(),
  component: z.string().min(1).max(500).optional(),
  description: z.string().max(500).optional(),
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

  return pages.map((page) => page as PageRecord);
}

async function writePages(orgId: string, projectId: string, pages: PageRecord[]): Promise<void> {
  await projectService.update(orgId, projectId, { generatedCode: { pages } as never });
}

function findPage(pages: PageRecord[], pageId: string): PageRecord | undefined {
  return pages.find((page) => page.id === pageId || page.path === pageId);
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId, pageId } = await params;
    await requireOrgMember(orgId);

    const project = await getProjectOrThrow(orgId, projectId);
    const page = findPage(readPages(project), pageId);

    if (!page) {
      throw new NotFoundError("Page");
    }

    return ok(page);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId, pageId } = await params;
    await requireOrgMember(orgId, "MEMBER");

    const body = updatePageSchema.parse(await req.json());
    const project = await getProjectOrThrow(orgId, projectId);
    const pages = readPages(project);
    const page = findPage(pages, pageId);

    if (!page) {
      throw new NotFoundError("Page");
    }

    const updatedPages = pages.map((item) =>
      item.id === page.id
        ? { ...item, ...body, updatedAt: new Date().toISOString() }
        : item
    );

    await writePages(orgId, projectId, updatedPages);
    return ok({ ...page, ...body, updatedAt: new Date().toISOString() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId, pageId } = await params;
    await requireOrgMember(orgId, "ADMIN");

    const project = await getProjectOrThrow(orgId, projectId);
    const pages = readPages(project);
    const page = findPage(pages, pageId);

    if (!page) {
      throw new NotFoundError("Page");
    }

    await writePages(
      orgId,
      projectId,
      pages.filter((item) => item.id !== page.id)
    );

    return noContent();
  } catch (error) {
    return errorResponse(error);
  }
}

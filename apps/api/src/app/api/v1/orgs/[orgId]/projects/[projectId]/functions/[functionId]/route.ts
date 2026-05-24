// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/functions/[functionId]/route.ts
// GET    /functions/:id
// PATCH  /functions/:id
// DELETE /functions/:id
// =============================================================================

export const runtime = "edge";

import { NextRequest } from "next/server";
import { z } from "zod";
import { NotFoundError } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../../../../lib/auth";
import { ok, noContent, errorResponse } from "../../../../../../../../../lib/response";
import { ProjectService } from "../../../../../../../../../services/project.service";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string; functionId: string }>;
}

interface FunctionRecord {
  id: string;
  name: string;
  description?: string;
  language: "typescript" | "javascript";
  code: string;
  createdAt: string;
  updatedAt: string;
}

const updateFunctionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  language: z.enum(["typescript", "javascript"]).optional(),
  code: z.string().min(1).max(50_000).optional(),
});

const projectService = new ProjectService();

async function getProjectOrThrow(orgId: string, projectId: string) {
  const project = await projectService.getById(orgId, projectId);
  if (!project) {
    throw new NotFoundError("Project");
  }

  return project;
}

function readFunctions(project: Awaited<ReturnType<ProjectService["getById"]>>): FunctionRecord[] {
  const generated = (project?.generatedCode ?? {}) as Record<string, unknown>;
  const functionsValue = generated.functions;

  if (!Array.isArray(functionsValue)) {
    return [];
  }

  return functionsValue.map((item) => item as FunctionRecord);
}

async function writeFunctions(orgId: string, projectId: string, functionsList: FunctionRecord[]): Promise<void> {
  await projectService.update(orgId, projectId, {
    generatedCode: { functions: functionsList } as never,
  });
}

function findFunction(functionsList: FunctionRecord[], functionId: string): FunctionRecord | undefined {
  return functionsList.find((item) => item.id === functionId || item.name === functionId);
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId, functionId } = await params;
    await requireOrgMember(orgId);

    const project = await getProjectOrThrow(orgId, projectId);
    const functionRecord = findFunction(readFunctions(project), functionId);

    if (!functionRecord) {
      throw new NotFoundError("Function");
    }

    return ok(functionRecord);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId, functionId } = await params;
    await requireOrgMember(orgId, "MEMBER");

    const body = updateFunctionSchema.parse(await req.json());
    const project = await getProjectOrThrow(orgId, projectId);
    const functionsList = readFunctions(project);
    const functionRecord = findFunction(functionsList, functionId);

    if (!functionRecord) {
      throw new NotFoundError("Function");
    }

    const updatedFunctions = functionsList.map((item) =>
      item.id === functionRecord.id
        ? { ...item, ...body, updatedAt: new Date().toISOString() }
        : item
    );

    await writeFunctions(orgId, projectId, updatedFunctions);
    return ok({ ...functionRecord, ...body, updatedAt: new Date().toISOString() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId, functionId } = await params;
    await requireOrgMember(orgId, "ADMIN");

    const project = await getProjectOrThrow(orgId, projectId);
    const functionsList = readFunctions(project);
    const functionRecord = findFunction(functionsList, functionId);

    if (!functionRecord) {
      throw new NotFoundError("Function");
    }

    await writeFunctions(
      orgId,
      projectId,
      functionsList.filter((item) => item.id !== functionRecord.id)
    );

    return noContent();
  } catch (error) {
    return errorResponse(error);
  }
}

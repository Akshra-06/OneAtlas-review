// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/functions/route.ts
// GET  /functions — list generated functions
// POST /functions — add a generated function entry
// =============================================================================

export const runtime = "edge";

import { NextRequest } from "next/server";
import { z } from "zod";
import { NotFoundError } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../../../lib/auth";
import { ok, created, errorResponse } from "../../../../../../../../lib/response";
import { ProjectService } from "../../../../../../../../services/project.service";
import { paginationSchema, buildOffsetArgs, paginateResult } from "@oneatlas/shared";
import { createFunctionSchema } from "../../../../../../../../validators/function.validator";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string }>;
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

function createId(): string {
  return globalThis.crypto.randomUUID();
}

const projectService = new ProjectService();

const createFunctionRecordSchema = createFunctionSchema;

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

  return functionsValue.map((item) => {
    const fn = item as Partial<FunctionRecord>;
    return {
      id: fn.id ?? fn.name ?? createId(),
      name: fn.name ?? "",
      description: fn.description,
      language: fn.language ?? "typescript",
      code: fn.code ?? "",
      createdAt: fn.createdAt ?? new Date().toISOString(),
      updatedAt: fn.updatedAt ?? new Date().toISOString(),
    };
  });
}

async function writeFunctions(orgId: string, projectId: string, functionsList: FunctionRecord[]): Promise<void> {
  await projectService.update(orgId, projectId, {
    generatedCode: { functions: functionsList } as never,
  });
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    await requireOrgMember(orgId);

    const project = await getProjectOrThrow(orgId, projectId);
    const functionsList = readFunctions(project);
    const { page, limit } = paginationSchema.parse(
      Object.fromEntries(req.nextUrl.searchParams)
    );
    buildOffsetArgs({ page, limit });

    return ok(paginateResult(functionsList, functionsList.length, page, limit));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    await requireOrgMember(orgId, "MEMBER");

    const body = createFunctionRecordSchema.parse(await req.json());
    const project = await getProjectOrThrow(orgId, projectId);
    const functionsList = readFunctions(project);
    const now = new Date().toISOString();
    const functionRecord: FunctionRecord = {
      id: createId(),
      name: body.name,
      description: body.description,
      language: body.language,
      code: body.code,
      createdAt: now,
      updatedAt: now,
    };

    await writeFunctions(orgId, projectId, [...functionsList, functionRecord]);
    return created(functionRecord);
  } catch (error) {
    return errorResponse(error);
  }
}

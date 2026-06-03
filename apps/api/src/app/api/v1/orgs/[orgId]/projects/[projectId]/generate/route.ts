// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/generate/route.ts
//
// POST /api/v1/orgs/:orgId/projects/:projectId/generate
//   Triggers AI code generation for a project.
//   Streams progress back to the client via Server-Sent Events (SSE).
//
// GET  /api/v1/orgs/:orgId/projects/:projectId/generate
//   Returns the current generation status (for polling fallback).
// =============================================================================

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { prisma, createAuditLog } from "@oneatlas/db";
import { z } from "zod";
import {
  ConflictError,
  NotFoundError,
  type GenerationResult,
} from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../../../lib/auth";
import { errorResponse, ok } from "../../../../../../../../lib/response";
import { captureGenerationCompleted } from "../../../../../../../../lib/analytics";
import {
  AIService,
  type CompletionTier,
} from "../../../../../../../../services/ai.service";
import type { AIProvider } from "@oneatlas/ai";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string }>;
}

function createId(): string {
  return globalThis.crypto.randomUUID();
}
const modifySchema = z.object({
  prompt: z.string().min(3).max(4000),

  model: z
    .enum(["FAST", "SMART"])
    .default("SMART"),
});
const generateSchema = z.object({
  prompt: z.string().min(10).max(8000),

  model: z.enum(["FAST", "SMART"]).default("SMART"),

  mode: z.enum(["generate", "modify"]).default("generate"),

  regenerateParts: z
    .array(z.enum(["schema", "pages", "api", "workflows", "all"]))
    .default(["all"]),
});

const GENERATION_SYSTEM_PROMPT = `You are OneAtlas, an expert full-stack code generator.
Generate a complete, production-ready web application based on the user's prompt.

Respond ONLY with a JSON object matching this schema — no markdown, no explanation:
{
  "appId": string,
  "appName": string,
  "prismaSchema": string,
  "files": [{ "filePath": string, "content": string, "fileType": string, "entityName"?: string }],
  "routeConfig": { "appId": string, "appName": string, "defaultRoute": string, "routes": [], "sidebarNav": [] },
  "entitySchemas": [],
  "generatedAt": string,
  "validation": { "valid": true, "issues": [] }
}`;

function providerFromEnv(): AIProvider {
  const value = (
    process.env.AI_DEFAULT_PROVIDER ||
    process.env.AI_FALLBACK_PROVIDER ||
    "google"
  ).toLowerCase();
  if (
    value === "anthropic" ||
    value === "openai" ||
    value === "google" ||
    value === "deepseek" ||
    value === "groq" ||
    value === "openrouter" ||
    value === "mistral"
  ) {
    return value;
  }
  return "google";
}

const aiService = new AIService();

function buildPrompt(
  prompt: string,
  regenerateParts: string[],
  appName: string,
): string {
  return [
    `App name: ${appName}`,
    `Regenerate parts: ${regenerateParts.join(", ")}`,
    "",
    prompt,
  ].join("\n");
}
function normalizeGeneratedResult(
  result: Partial<GenerationResult>,
  projectId: string,
  prompt: string,
): GenerationResult {
  const appId =
    typeof result.appId === "string" && result.appId.trim()
      ? result.appId.trim()
      : projectId;
  const appName =
    typeof result.appName === "string" && result.appName.trim()
      ? result.appName.trim()
      : prompt.slice(0, 60) || "OneAtlas App";
  const files = Array.isArray(result.files) ? result.files : [];
  const entitySchemas = Array.isArray(result.entitySchemas)
    ? result.entitySchemas
    : [];
  const routeConfig =
    result.routeConfig && typeof result.routeConfig === "object"
      ? result.routeConfig
      : { appId, appName, defaultRoute: "/", routes: [], sidebarNav: [] };

  return {
    appId,
    appName,
    prismaSchema:
      typeof result.prismaSchema === "string" ? result.prismaSchema : "",
    files,
    routeConfig,
    entitySchemas,
    generatedAt:
      typeof result.generatedAt === "string"
        ? result.generatedAt
        : new Date().toISOString(),
    validation:
      result.validation && typeof result.validation === "object"
        ? result.validation
        : { valid: true, issues: [] },
  };
}

function countFiles(
  files: Array<{ fileType?: string }>,
  fileType: string,
): number {
  return files.filter((file) => file.fileType === fileType).length;
}

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}

// ── GET — fetch current status/metadata ───────────────────────────────────────
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    const auth = await requireOrgMember(orgId, "MEMBER");

    // Verify project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        orgId: true,
        status: true,
        metadata: true,
        generatedCode: true,
        updatedAt: true,
      },
    });

    if (!project || project.orgId !== auth.orgId) {
      throw new NotFoundError("Project");
    }

    const meta = (project.metadata as Record<string, unknown>) ?? {};

    return ok({
      projectId: project.id,
      status: project.status,
      generationStatus: meta.generationStatus ?? "idle",
      generatedAt: meta.generatedAt ?? null,
      hasCode: !!project.generatedCode,
      lastUpdated: project.updatedAt,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

function buildModifyPrompt(
  currentApp: unknown,
  prompt: string
): string {
  return `
You are modifying an existing application.

CURRENT APPLICATION:

${JSON.stringify(currentApp, null, 2)}

MODIFICATION REQUEST:

${prompt}

Rules:

- This application already exists.
- Do NOT redesign it.
- Do NOT remove features.
- Do NOT rename routes.
- Do NOT regenerate unrelated files.
- Only modify files required for the request.
- Preserve all existing functionality.
- Return a complete GenerationResult JSON.
`;
}

// ── POST — trigger AI generation (SSE stream) ─────────────────────────────────
export async function POST(req: NextRequest, { params }: RouteContext) {
  console.log("CHAT ROUTE HIT");
  try {
    const { orgId, projectId } = await params;
    const auth = await requireOrgMember(orgId, "MEMBER");
    const body = generateSchema.parse(await req.json());

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, orgId: true, status: true, metadata: true },
    });

    if (!project || project.orgId !== auth.orgId) {
      throw new NotFoundError("Project");
    }

    if (project.status === "DELETED") {
      throw new NotFoundError("Project");
    }

    const meta = (project.metadata as Record<string, unknown>) ?? {};
    const generationStartedAt = meta.generationStartedAt
      ? new Date(String(meta.generationStartedAt))
      : null;

    const isStale =
      generationStartedAt &&
      Date.now() - generationStartedAt.getTime() > 60 * 1000;

    const generationStatus = String(meta.generationStatus ?? "idle");

    if (generationStatus === "running" && !isStale) {
      throw new ConflictError(
        "Generation is already in progress for this project.",
      );
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        metadata: {
          ...(meta as object),
          generationStatus: "running",
          generationStartedAt: new Date().toISOString(),
          generationPrompt: body.prompt,
        } as any,
        status: "ACTIVE",
      },
    });

    await createAuditLog({
      orgId: auth.orgId,
      userId: auth.userId,
      projectId,
      action: "project.generation.started",
      metadata: { model: body.model, parts: body.regenerateParts },
    });

    const encoder = new TextEncoder();
    const provider = providerFromEnv();
    const tier: CompletionTier = body.model === "FAST" ? "fast" : "smart";
    const appId = projectId;

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let controllerClosed = false;
        const send = (event: string, data: unknown) => {
          if (controllerClosed) return;
          try {
            controller.enqueue(
              encoder.encode(
                `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
              ),
            );
          } catch {
            controllerClosed = true;
          }
        };

        const startTime = Date.now();

        try {
          send("status", { step: "init", message: "Starting AI generation…" });
          send("progress", { phase: "init", completed: 0, total: 3 });
          send("status", {
            step: "generation",
            message: `Generating application blueprint with ${provider}…`,
          });
          send("progress", { phase: "generation", completed: 1, total: 3 });

          const generated = await aiService.completeJson<
            Partial<GenerationResult>
          >({
            prompt: buildPrompt(body.prompt, body.regenerateParts, appId),
            provider,
            tier,
            systemPrompt: GENERATION_SYSTEM_PROMPT,
            maxTokens: 12_000,
            temperature: 0.2,
          });

          const generatedCode = normalizeGeneratedResult(
            generated,
            projectId,
            body.prompt,
          );

          send("status", {
            step: "saving",
            message: "Saving files to project…",
          });
          send("progress", { phase: "saving", completed: 2, total: 3 });

          await prisma.project.update({
            where: { id: projectId },
            data: {
              generatedCode: generatedCode as any,
              prompt: body.prompt,
              metadata: {
                ...(meta as object),
                generationStatus: "done",
                generatedAt: generatedCode.generatedAt,
                generationPrompt: body.prompt,
                generationProvider: provider,
                generationModel: tier,
              } as any,
            },
          });

          await createAuditLog({
            orgId: auth.orgId,
            userId: auth.userId,
            projectId,
            action: "project.generation.completed",
            metadata: {
              provider,
              model: tier,
              pageCount: countFiles(
                generatedCode.files as Array<{ fileType?: string }>,
                "page",
              ),
            },
          });

          captureGenerationCompleted({
            distinctId: auth.userId,
            orgId: auth.orgId,
            projectId,
            model: tier,
            provider,
            cached: false,
            latencyMs: Date.now() - startTime,
            pageCount: countFiles(
              generatedCode.files as Array<{ fileType?: string }>,
              "page",
            ),
            apiRouteCount: countFiles(
              generatedCode.files as Array<{ fileType?: string }>,
              "api-route",
            ),
            tier,
          });

          send("done", {
            projectId,
            generatedAt: generatedCode.generatedAt,
            provider,
            model: tier,
            generationStatus: "done",
            summary: {
              pages: countFiles(
                generatedCode.files as Array<{ fileType?: string }>,
                "page",
              ),
              apiRoutes: countFiles(
                generatedCode.files as Array<{ fileType?: string }>,
                "api-route",
              ),
            },
            workspacePath: undefined,
            buildStatus: "skipped",
            previewStartupStatus: "skipped",
            previewUrl: undefined,
          });
          send("progress", { phase: "complete", completed: 3, total: 3 });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          await prisma.project.update({
            where: { id: projectId },
            data: {
              metadata: {
                ...(meta as object),
                generationStatus: "failed",
                generationError: message,
                generationEndedAt: new Date().toISOString(),
              } as any,
            },
          });

          send("error", { message });
        } finally {
          controllerClosed = true;
          try {
            controller.close();
          } catch {
            // Ignore double-close.
          }
        }
      },
    });

    return new Response(stream, { headers: sseHeaders() });
  } catch (error) {
    return errorResponse(error);
  }
}


  export async function PATCH(
  req: NextRequest,
  { params }: RouteContext
) {
   try {
    const { orgId, projectId } = await params;
    const auth = await requireOrgMember(orgId, "MEMBER");
    const body = modifySchema.parse(
  await req.json()
);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
  id: true,
  orgId: true,
  status: true,
  metadata: true,
  generatedCode: true,
},
    });

    if (!project || project.orgId !== auth.orgId) {
      throw new NotFoundError("Project");
    }

    if (project.status === "DELETED") {
      throw new NotFoundError("Project");
    }

    const meta = (project.metadata as Record<string, unknown>) ?? {};
    const generationStartedAt = meta.generationStartedAt
      ? new Date(String(meta.generationStartedAt))
      : null;

    const isStale =
      generationStartedAt &&
      Date.now() - generationStartedAt.getTime() > 60 * 1000;

    const generationStatus = String(meta.generationStatus ?? "idle");

    if (generationStatus === "running" && !isStale) {
      throw new ConflictError(
        "Generation is already in progress for this project.",
      );
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        metadata: {
          ...(meta as object),
          generationStatus: "running",
          generationStartedAt: new Date().toISOString(),
          generationPrompt: body.prompt,
        } as any,
        status: "ACTIVE",
      },
    });

    await createAuditLog({
  orgId: auth.orgId,
  userId: auth.userId,
  projectId,
  action: "project.modification.started",
  metadata: {
    prompt: body.prompt,
  },
});

    const encoder = new TextEncoder();
    const provider = providerFromEnv();
    const tier: CompletionTier = body.model === "FAST" ? "fast" : "smart";
    const MODIFY_SYSTEM_PROMPT = `
You are modifying an existing OneAtlas application.

Preserve all existing functionality.

Only apply the requested change.

Do not redesign or rebuild the application.

Return a complete updated GenerationResult JSON.
`;

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let controllerClosed = false;
        const send = (event: string, data: unknown) => {
          if (controllerClosed) return;
          try {
            controller.enqueue(
              encoder.encode(
                `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
              ),
            );
          } catch {
            controllerClosed = true;
          }
        };

        const startTime = Date.now();

        try {
          send("status", { step: "init", message: "Starting AI generation…" });
          send("progress", { phase: "init", completed: 0, total: 3 });
          send("status", {
            step: "generation",
            message: `Generating application blueprint with ${provider}…`,
          });
          send("progress", { phase: "generation", completed: 1, total: 3 });

          const generated = await aiService.completeJson<
            Partial<GenerationResult>
          >({
            prompt: buildModifyPrompt(
  project.generatedCode,
  body.prompt
),
            provider,
            tier,
            systemPrompt: MODIFY_SYSTEM_PROMPT,
            maxTokens: 12_000,
            temperature: 0.2,
          });

          const generatedCode = normalizeGeneratedResult(
            generated,
            projectId,
            body.prompt,
          );

          send("status", {
            step: "saving",
            message: "Saving files to project…",
          });
          send("progress", { phase: "saving", completed: 2, total: 3 });

          await prisma.project.update({
            where: { id: projectId },
            data: {
              generatedCode: generatedCode as any,
              prompt: body.prompt,
              metadata: {
                ...(meta as object),
                generationStatus: "done",
                generatedAt: generatedCode.generatedAt,
                generationPrompt: body.prompt,
                generationProvider: provider,
                generationModel: tier,
              } as any,
            },
          });

          await createAuditLog({
  orgId: auth.orgId,
  userId: auth.userId,
  projectId,
  action: "project.modification.completed",
});

          captureGenerationCompleted({
            distinctId: auth.userId,
            orgId: auth.orgId,
            projectId,
            model: tier,
            provider,
            cached: false,
            latencyMs: Date.now() - startTime,
            pageCount: countFiles(
              generatedCode.files as Array<{ fileType?: string }>,
              "page",
            ),
            apiRouteCount: countFiles(
              generatedCode.files as Array<{ fileType?: string }>,
              "api-route",
            ),
            tier,
          });

          send("done", {
            projectId,
            generatedAt: generatedCode.generatedAt,
            provider,
            model: tier,
            generationStatus: "done",
            summary: {
              pages: countFiles(
                generatedCode.files as Array<{ fileType?: string }>,
                "page",
              ),
              apiRoutes: countFiles(
                generatedCode.files as Array<{ fileType?: string }>,
                "api-route",
              ),
            },
            workspacePath: undefined,
            buildStatus: "skipped",
            previewStartupStatus: "skipped",
            previewUrl: undefined,
          });
          send("progress", { phase: "complete", completed: 3, total: 3 });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          await prisma.project.update({
            where: { id: projectId },
            data: {
              metadata: {
                ...(meta as object),
                generationStatus: "failed",
                generationError: message,
                generationEndedAt: new Date().toISOString(),
              } as any,
            },
          });

          send("error", { message });
        } finally {
          controllerClosed = true;
          try {
            controller.close();
          } catch {
            // Ignore double-close.
          }
        }
      },
    });

    return new Response(stream, { headers: sseHeaders() });
  } catch (error) {
    return errorResponse(error);
  }



}
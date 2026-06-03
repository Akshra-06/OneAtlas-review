// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/generate/route.ts
//
// GET    — returns current generation status
// POST   — full generation (runGenerationPipeline, SSE progress)
// PATCH  — incremental regeneration triggered by Atlas AI (SSE progress)
// =============================================================================

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { prisma, createAuditLog } from "@oneatlas/db";
import { z } from "zod";
import { ConflictError, NotFoundError } from "@oneatlas/shared";
import type { GenerationResult, GeneratedFile } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../../../lib/auth";
import { errorResponse, ok } from "../../../../../../../../lib/response";
import { captureGenerationCompleted } from "../../../../../../../../lib/analytics";
import { runGenerationPipeline } from "@oneatlas/ai";
import type { PipelineContext } from "@oneatlas/ai";

// onStageComplete callback type — mirrors RunPipelineOptions from workflow-engine
type PipelineProgressCallback = (stage: string, ctx: PipelineContext) => void;

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string }>;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}

function countFiles(files: Array<{ fileType?: string }>, fileType: string): number {
  return files.filter((f) => f.fileType === fileType).length;
}

const STAGE_PROGRESS: Record<string, { label: string; pct: number }> = {
  entity_schema_gen:    { label: "Extracting entities…",          pct: 10 },
  prisma_schema_gen:    { label: "Building database schema…",     pct: 20 },
  page_generation:      { label: "Generating pages…",             pct: 35 },
  api_generation:       { label: "Generating API routes…",        pct: 50 },
  support_generation:   { label: "Generating support files…",     pct: 60 },
  workflow_generation:  { label: "Generating workflows…",         pct: 70 },
  component_generation: { label: "Generating components…",        pct: 80 },
  layout_generation:    { label: "Building layout & navigation…", pct: 88 },
  packaging:            { label: "Packaging result…",             pct: 93 },
  compile_validation:   { label: "Validating & repairing…",       pct: 97 },
  deployment_handoff:   { label: "Queuing for deployment…",       pct: 99 },
};

// ── Schemas ───────────────────────────────────────────────────────────────────

const generateSchema = z.object({
  prompt: z.string().min(10).max(8000),
  model: z.enum(["FAST", "SMART"]).default("SMART"),
  regenerateParts: z
    .array(z.enum(["schema", "pages", "api", "workflows", "all"]))
    .default(["all"]),
});

const patchSchema = z.object({
  parts: z
    .array(z.enum(["schema", "pages", "api", "workflows", "all"]))
    .min(1)
    .default(["all"]),
  atlasMessage: z.string().min(1).max(4000).optional(),
});

// ── GET — fetch current status ────────────────────────────────────────────────

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    const auth = await requireOrgMember(orgId, "MEMBER");

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, orgId: true, status: true, metadata: true, generatedCode: true, updatedAt: true },
    });

    if (!project || project.orgId !== auth.orgId) throw new NotFoundError("Project");

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

// ── POST — full generation ────────────────────────────────────────────────────

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    const auth = await requireOrgMember(orgId, "MEMBER");
    const body = generateSchema.parse(await req.json());

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, orgId: true, status: true, metadata: true },
    });

    if (!project || project.orgId !== auth.orgId) throw new NotFoundError("Project");
    if (project.status === "DELETED") throw new NotFoundError("Project");

    const meta = (project.metadata as Record<string, unknown>) ?? {};
    if (meta.generationStatus === "running") {
      throw new ConflictError("Generation is already in progress for this project.");
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
    const startTime = Date.now();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let closed = false;

        const send = (event: string, data: unknown) => {
          if (closed) return;
          try { controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)); }
          catch { closed = true; }
        };

        try {
          send("status",   { step: "init", message: "Starting AI generation pipeline…" });
          send("progress", { pct: 0, phase: "understanding", label: "Understanding your prompt…" });

          const result = await (runGenerationPipeline as any)(
            body.prompt,
            projectId,
            auth.orgId,
            {
              onStageComplete: (stage: string, _ctx: PipelineContext) => {
                const p = STAGE_PROGRESS[stage];
                if (p) {
                  send("status",   { step: stage, message: p.label });
                  send("progress", { pct: p.pct, phase: stage, label: p.label });
                }
              },
            } satisfies { onStageComplete: PipelineProgressCallback }
          ) as GenerationResult;

          send("status",   { step: "saving", message: "Saving generated files…" });
          send("progress", { pct: 98, phase: "saving", label: "Saving files to project…" });

          await prisma.project.update({
            where: { id: projectId },
            data: {
              generatedCode: result as any,
              prompt: body.prompt,
              metadata: {
                ...(meta as object),
                generationStatus: "done",
                generatedAt: result.generatedAt,
                generationPrompt: body.prompt,
                generationModel: body.model,
              } as any,
            },
          });
          console.log(
            "[GEN RESULT]",
            JSON.stringify(result, null, 2)
          );

          const pageCount     = countFiles(result.files as Array<{ fileType?: string }>, "page");
          const apiRouteCount = countFiles(result.files as Array<{ fileType?: string }>, "api-route");

          await createAuditLog({
            orgId: auth.orgId,
            userId: auth.userId,
            projectId,
            action: "project.generation.completed",
            metadata: { model: body.model, pageCount },
          });

          captureGenerationCompleted({
            distinctId: auth.userId,
            orgId: auth.orgId,
            projectId,
            model: body.model.toLowerCase() as any,
            provider: "pipeline",
            cached: false,
            latencyMs: Date.now() - startTime,
            pageCount,
            apiRouteCount,
            tier: body.model === "FAST" ? "fast" : "smart",
          });

          send("done", {
            projectId,
            generatedAt: result.generatedAt,
            model: body.model,
            generationStatus: "done",
            summary: { pages: pageCount, apiRoutes: apiRouteCount },
            buildStatus: "skipped",
            previewStartupStatus: "skipped",
            previewUrl: undefined,
          });
          send("progress", { pct: 100, phase: "complete", label: "Done!" });

        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          await prisma.project.update({
            where: { id: projectId },
            data: {
              metadata: {
                ...(meta as object),
                generationStatus: "failed",
                generationError: message,
              } as any,
            },
          });
          send("error", { message });
        } finally {
          closed = true;
          try { controller.close(); } catch { /* ignore */ }
        }
      },
    });

    return new Response(stream, { headers: sseHeaders() });
  } catch (error) {
    return errorResponse(error);
  }
}

// ── PATCH — incremental regeneration (Atlas AI Apply) ────────────────────────

function mergeGeneratedFiles(
  existing: GeneratedFile[],
  incoming: GeneratedFile[],
): GeneratedFile[] {
  const incomingPaths = new Set(incoming.map((f) => f.filePath));
  return [
    ...existing.filter((f) => !incomingPaths.has(f.filePath)),
    ...incoming,
  ];
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    const auth = await requireOrgMember(orgId, "MEMBER");
    const body = patchSchema.parse(await req.json());

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, orgId: true, status: true, prompt: true, generatedCode: true, metadata: true },
    });

    if (!project || project.orgId !== auth.orgId) throw new NotFoundError("Project");
    if (!project.generatedCode) {
      throw new ConflictError("No generated code yet. Run full generation first.");
    }

    const meta = (project.metadata as Record<string, unknown>) ?? {};
    if (meta.generationStatus === "running") {
      throw new ConflictError("Generation already in progress.");
    }

    const existingResult = project.generatedCode as GenerationResult;

    // Enrich the original prompt with the Atlas AI change request
    const enrichedPrompt = body.atlasMessage
      ? `${project.prompt ?? ""}\n\nApply this change: ${body.atlasMessage}`
      : project.prompt ?? "";

    await prisma.project.update({
      where: { id: projectId },
      data: {
        metadata: {
          ...(meta as object),
          generationStatus: "running",
          incrementalStartedAt: new Date().toISOString(),
          incrementalParts: body.parts,
        } as any,
      },
    });

    const encoder = new TextEncoder();
    const startTime = Date.now();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let closed = false;

        const send = (event: string, data: unknown) => {
          if (closed) return;
          try { controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)); }
          catch { closed = true; }
        };

        try {
          send("status",   { step: "init", message: "Starting incremental regeneration…" });
          send("progress", { pct: 0, phase: "init", label: "Preparing…" });

          const result = await (runGenerationPipeline as any)(
            enrichedPrompt,
            projectId,
            auth.orgId,
            {
              onStageComplete: (stage: string, _ctx: PipelineContext) => {
                const p = STAGE_PROGRESS[stage];
                if (p) {
                  send("status",   { step: stage, message: p.label });
                  send("progress", { pct: Math.round(p.pct * 0.9), phase: stage, label: p.label });
                }
              },
            } satisfies { onStageComplete: PipelineProgressCallback }
          ) as GenerationResult;

          send("status",   { step: "merging", message: "Merging changes into project…" });
          send("progress", { pct: 96, phase: "merging", label: "Merging changes…" });

          const mergedFiles = mergeGeneratedFiles(
            existingResult.files as GeneratedFile[],
            result.files as GeneratedFile[]
          );

          const updatedResult: GenerationResult = {
            ...result,
            files: mergedFiles,
            generatedAt: new Date().toISOString(),
          };

          await prisma.project.update({
            where: { id: projectId },
            data: {
              generatedCode: updatedResult as any,
              metadata: {
                ...(meta as object),
                generationStatus: "done",
                generatedAt: updatedResult.generatedAt,
                lastIncrementalParts: body.parts,
                lastAtlasMessage: body.atlasMessage,
              } as any,
            },
          });

          await createAuditLog({
            orgId: auth.orgId,
            userId: auth.userId,
            projectId,
            action: "project.generation.completed",
            metadata: {
              type: "incremental",
              parts: body.parts,
              atlasMessage: body.atlasMessage,
              latencyMs: Date.now() - startTime,
            },
          });

          const pageCount    = countFiles(mergedFiles as Array<{ fileType?: string }>, "page");
          const apiCount     = countFiles(mergedFiles as Array<{ fileType?: string }>, "api-route");

          send("done", {
            projectId,
            generatedAt: updatedResult.generatedAt,
            partsRegenerated: body.parts,
            generationStatus: "done",
            summary: {
              pages: pageCount,
              apiRoutes: apiCount,
              filesUpdated: result.files.length,
              totalFiles: mergedFiles.length,
            },
          });
          send("progress", { pct: 100, phase: "complete", label: "Done!" });

        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          await prisma.project.update({
            where: { id: projectId },
            data: {
              metadata: {
                ...(meta as object),
                generationStatus: "failed",
                generationError: message,
              } as any,
            },
          });
          send("error", { message });
        } finally {
          closed = true;
          try { controller.close(); } catch { /* ignore */ }
        }
      },
    });

    return new Response(stream, { headers: sseHeaders() });
  } catch (error) {
    return errorResponse(error);
  }
} 
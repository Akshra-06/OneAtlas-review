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

export const runtime = "edge";

import { NextRequest } from "next/server";
import { prisma } from "@oneatlas/db";
import { z } from "zod";
import {
  NotFoundError,
  ConflictError,
} from "@oneatlas/shared";
import { diagnoseError, ModelRouter, UnderstandingOrchestrator, PIPELINE_STEPS, type PipelineContext, retryService } from "@oneatlas/ai";
import { requireOrgMember } from "../../../../../../../../lib/auth";
import { errorResponse, ok } from "../../../../../../../../lib/response";
import { createAuditLog } from "@oneatlas/db";
import { captureGenerationCompleted } from "../../../../../../../../lib/analytics";
import * as crypto from "node:crypto";
import { materializeWorkspace } from "../../../../../../../../lib/materializer";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string }>;
}

const generateSchema = z.object({
  prompt: z.string().min(10).max(8000),
  model: z.enum(["FAST", "SMART"]).default("SMART"),
  // Optionally regenerate only specific parts
  regenerateParts: z
    .array(z.enum(["schema", "pages", "api", "workflows", "all"]))
    .default(["all"]),
});

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

// ── POST — trigger AI generation (SSE stream) ─────────────────────────────────
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    const auth = await requireOrgMember(orgId, "MEMBER");
    const body = generateSchema.parse(await req.json());

    // Verify project
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

    // Guard: only one generation at a time
    const meta = (project.metadata as Record<string, unknown>) ?? {};
    if (meta.generationStatus === "running") {
      throw new ConflictError(
        "Generation is already in progress for this project."
      );
    }

    // Mark as running before streaming starts
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

    // ── Build the SSE stream ─────────────────────────────────────────────────
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const startTime = Date.now();
        let controllerClosed = false;
        
        const send = (event: string, data: unknown) => {
          if (controllerClosed) {
            return;
          }
          try {
            controller.enqueue(
              encoder.encode(
                `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
              )
            );
          } catch (error) {
            // Controller is already closed, ignore the error
            controllerClosed = true;
          }
        };

        try {
          send("status", { step: "init", message: "Starting AI generation…" });
          send("progress", { phase: "init", completed: 0, total: 10 });

          // 1. Analyze prompt & security rules using the new Team 3 Orchestrator
          send("status", { step: "understanding", message: "Analyzing application scope and specifications..." });
          send("progress", { phase: "understanding", completed: 1, total: 10 });

          // Create the model router & orchestrator
          const router = new ModelRouter();
          
          // Wire up the callback to stream provider selection back to the client
          router.onProviderSelected = (providerName, attempt, modelName) => {
            const friendlyModel = modelName ? modelName.split("/").pop() : "";
            const modelSuffix = friendlyModel ? ` (${friendlyModel})` : "";
            send("provider", {
              provider: providerName,
              attempt,
              message: `Using ${providerName}${modelSuffix} (Attempt ${attempt})`,
            });
          };

          const orchestrator = new UnderstandingOrchestrator(router);
          
          // Run the modular app understanding process
          const understandingResult = await orchestrator.process(body.prompt);
          const understanding = understandingResult.data;

          send("status", { step: "understanding_done", message: `Identified archetype: ${understanding.appType.toUpperCase()} (${understanding.appName})` });
          send("progress", { phase: "understanding_done", completed: 2, total: 10 });

          // 2. Initialize the pipeline context
          let context: PipelineContext = {
            runId: crypto.randomUUID(),
            projectId,
            orgId,
            rawPrompt: body.prompt,
            understanding,
            generatedFiles: [],
          };

          // Step count mapping for progress UI
          const stageStepMapping: Record<string, { completed: number, label: string }> = {
            'entity_schema_gen': { completed: 3, label: 'Entity Schemas' },
            'prisma_schema_gen': { completed: 4, label: 'Database Schema' },
            'page_generation': { completed: 5, label: 'Next.js Pages' },
            'api_generation': { completed: 6, label: 'API Routes' },
            'support_generation': { completed: 7, label: 'Runtime Support' },
            'workflow_generation': { completed: 8, label: 'Business Workflows' },
            'component_generation': { completed: 8, label: 'UI Components' },
            'layout_generation': { completed: 9, label: 'Routing & Layout' },
            'packaging': { completed: 9, label: 'Final Packaging' },
            'compile_validation': { completed: 9, label: 'Compile Validation' },
          };

          // 3. Execute each pipeline step sequentially and stream progress to the frontend
          for (const step of PIPELINE_STEPS) {
            // Skip deployment handoff if not needed
            if (step.stage === 'deployment_handoff') {
              continue;
            }

            const stepInfo = stageStepMapping[step.stage];
            if (stepInfo) {
              send("status", { 
                step: step.stage, 
                message: `Synthesizing ${stepInfo.label}...` 
              });
              send("progress", { 
                phase: step.stage, 
                completed: stepInfo.completed, 
                total: 10 
              });
            }

            if (step.shouldSkip?.(context)) {
              continue;
            }

            context = await retryService.withRetry(async () => {
              return step.run(context);
            });
          }

          const generatedCode = context.result;
          if (!generatedCode) {
            throw new Error("Pipeline completed but failed to package the final code generation result.");
          }

          send("status", { step: "saving", message: "Saving files to project..." });
          send("progress", { phase: "saving", completed: 10, total: 10 });

          // Persist generated code
          await prisma.project.update({
            where: { id: projectId },
            data: {
              generatedCode: generatedCode as any,
              prompt: body.prompt,
              metadata: {
                ...(meta as object),
                generationStatus: "done",
                generatedAt: new Date().toISOString(),
                generationPrompt: body.prompt,
                generationProvider: "GROQ",
                generationModel: "llama3", 
                title: generatedCode.appName,
                description: `A full-stack ${understanding.appType} application featuring ${understanding.features.map(f => f.name).join(', ')}.`,
              } as any,
            },
          });

          await createAuditLog({
            orgId: auth.orgId,
            userId: auth.userId,
            projectId,
            action: "project.generation.completed",
            metadata: {
              model: "llama3",
              provider: "GROQ",
              pageCount: (generatedCode.files as any[]).filter(f => f.fileType === 'page').length ?? 0,
            },
          });

          captureGenerationCompleted({
            distinctId: auth.userId,
            orgId: auth.orgId,
            projectId,
            model: "llama3",
            provider: "GROQ",
            cached: false,
            latencyMs: Date.now() - startTime,
            pageCount: (generatedCode.files as any[]).filter(f => f.fileType === 'page').length ?? 0,
            apiRouteCount: (generatedCode.files as any[]).filter(f => f.fileType === 'api-route').length ?? 0,
            tier: body.model === "FAST" ? "fast" : "smart",
          });

          send("status", { step: "materialize", message: "Starting workspace materialization..." });

          const appId = generatedCode.appId || projectId;
          const { workspacePath, buildStatus, previewStartupStatus, previewUrl } = await materializeWorkspace(
            appId,
            generatedCode.files as any[],
            (message: string) => {
              send("status", { step: "materialize", message });
            }
          );

          send("done", {
            projectId,
            generatedAt: new Date().toISOString(),
            provider: "GROQ",
            model: "llama3",
            generationStatus: "done",
            summary: {
              pages: (generatedCode.files as any[]).filter(f => f.fileType === 'page').length ?? 0,
              apiRoutes: (generatedCode.files as any[]).filter(f => f.fileType === 'api-route').length ?? 0,
            },
            workspacePath,
            buildStatus,
            previewStartupStatus,
            previewUrl,
          });
          send("progress", { phase: "complete", completed: 10, total: 10 });
        } catch (err) {
          const diagnosis = diagnoseError(err);
          // Mark generation as failed
          await prisma.project.update({
            where: { id: projectId },
            data: {
              metadata: {
                ...(meta as object),
                generationStatus: "failed",
                generationError: diagnosis.message,
                generationErrorCode: diagnosis.code,
              } as any,
            },
          });

          send("error", {
            message: diagnosis.message,
            diagnostic: diagnosis,
          });
        } finally {
          controllerClosed = true;
          try {
            controller.close();
          } catch (error) {
            // Controller already closed, ignore
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // disable Nginx buffering
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

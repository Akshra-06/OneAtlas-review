// =============================================================================
// apps/api/src/app/api/v1/orgs/[orgId]/projects/[projectId]/chat/route.ts
//
// POST /api/v1/orgs/:orgId/projects/:projectId/chat
//   Atlas AI chat endpoint — powers the right sidebar chatbot in the builder.
//   Accepts a user message + full conversation history, responds via SSE.
//   Stores conversation history in Redis keyed by projectId.
//
// DELETE /api/v1/orgs/:orgId/projects/:projectId/chat
//   Clears the conversation history for this project.
//
// GET /api/v1/orgs/:orgId/projects/:projectId/chat
//   Returns the current conversation history.
// =============================================================================

export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@oneatlas/db";
import { NotFoundError } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../../../lib/auth";
import { errorResponse, ok } from "../../../../../../../../lib/response";
import {
  atlasConversationStore,
  type ChatMessage,
} from "../../../../../../../../services/atlas-conversation.service";
import { AtlasAIService } from "../../../../../../../../services/atlas-ai.service";
import type { GenerationResult } from "@oneatlas/shared";

interface RouteContext {
  params: Promise<{ orgId: string; projectId: string }>;
}

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(4000),
  // Optional: client can pass conversation history to ensure consistency.
  // If omitted, server uses stored history from Redis.
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
        timestamp: z.string(),
      }),
    )
    .optional(),
});

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}

const atlasAI = new AtlasAIService();

// ── GET — return conversation history ────────────────────────────────────────
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    await requireOrgMember(orgId, "MEMBER");

    const history = await atlasConversationStore.get(projectId);
    return ok({ projectId, history, messageCount: history.length });
  } catch (error) {
    return errorResponse(error);
  }
}

// ── DELETE — clear conversation history ──────────────────────────────────────
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    await requireOrgMember(orgId, "MEMBER");

    await atlasConversationStore.clear(projectId);
    return ok({ projectId, cleared: true });
  } catch (error) {
    return errorResponse(error);
  }
}

// ── POST — send a message, stream Atlas AI response ──────────────────────────
export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const { orgId, projectId } = await params;
    await requireOrgMember(orgId, "MEMBER");

    const body = ChatRequestSchema.parse(await req.json());

    // Load the project to get its generated code as app context
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        orgId: true,
        generatedCode: true,
      },
    });

    if (!project || project.orgId !== orgId) {
      throw new NotFoundError("Project");
    }

    const appContext = project.generatedCode as GenerationResult | null;

    // Use client-provided history if given, otherwise load from Redis
    let history: ChatMessage[] = body.history
      ? body.history.map(
          (m: {
            role: "user" | "assistant";
            content: string;
            timestamp: string;
          }) => ({ ...m }),
        )
      : await atlasConversationStore.get(projectId);

    // Append the new user message
    const userMessage: ChatMessage = {
      role: "user",
      content: body.message,
      timestamp: new Date().toISOString(),
    };

    history = await atlasConversationStore.append(projectId, userMessage);

    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let closed = false;

        const send = (event: string, data: unknown) => {
          if (closed) return;
          try {
            controller.enqueue(
              encoder.encode(
                `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`,
              ),
            );
          } catch {
            closed = true;
          }
        };

        try {
          send("status", {
            step: "thinking",
            message: "Atlas AI is thinking…",
          });

          // Call Atlas AI with full conversation history + app context
          const response = await atlasAI.chat(history, appContext, projectId);

          // Store assistant reply in conversation history
          const assistantMessage: ChatMessage = {
            role: "assistant",
            content: response.text,
            timestamp: new Date().toISOString(),
          };
          await atlasConversationStore.append(projectId, assistantMessage);

          // Stream the response text word by word for a natural feel
          const words = response.text.split(" ");
          for (const word of words) {
            send("delta", { text: word + " " });
            // Small delay between words for streaming effect
            await new Promise((r) => setTimeout(r, 15));
          }

          send("done", {
            intent: response.intent,
            requiresRegeneration: response.requiresRegeneration,
            affectedFiles: response.affectedFiles ?? [],
            fullText: response.text,
            messageCount: history.length + 1,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          send("error", { message });
        } finally {
          closed = true;
          try {
            controller.close();
          } catch {
            /* ignore */
          }
        }
      },
    });

    return new Response(stream, { headers: sseHeaders() });
  } catch (error) {
    return errorResponse(error);
  }
}

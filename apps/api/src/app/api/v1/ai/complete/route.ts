/**
 * AI Complete/Generate
 * POST /api/v1/ai/complete
 *
 * Request body:
 * {
 *   "prompt": "string",
 *   "model": "gemini-1.5-flash" | "gemini-1.5-pro" | ...,
 *   "provider": "google" | "openai" | "anthropic" | "deepseek",
 *   "tier": "fast" | "smart",
 *   "temperature": 0.7,
 *   "maxTokens": 2048,
 *   "jsonMode": true
 * }
 */

export const runtime = "edge";

import { NextRequest } from "next/server";
import { gateway, type AIProvider, type ModelTier } from "@oneatlas/ai";
import { z } from "zod";

const providerSchema = z.enum(["anthropic", "openai", "google", "deepseek"]);
const tierSchema = z.enum(["fast", "smart"]);

const CompletionRequestSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt is required").max(20_000),
  model: z.string().trim().min(1).optional(),
  provider: providerSchema.optional(),
  tier: tierSchema.default("fast"),
  temperature: z.number().min(0).max(1).optional().default(0.7),
  maxTokens: z.number().int().min(1).max(32_768).optional().default(2048),
  jsonMode: z.boolean().optional().default(false),
});

function inferProviderFromModel(model?: string): AIProvider {
  const value = model?.toLowerCase() ?? "";
  if (value.includes("gemini") || value.includes("google")) return "google";
  if (value.includes("deepseek")) return "deepseek";
  if (value.includes("claude") || value.includes("anthropic")) return "anthropic";
  if (value.includes("gpt") || value.includes("o1") || value.includes("openai")) return "openai";
  return "google";
}

function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
    "Access-Control-Allow-Origin": "https://oneatlas.dev",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

function jsonCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "https://oneatlas.dev",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    Vary: "Origin",
  };
}

function encodeEvent(encoder: TextEncoder, event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: jsonCorsHeaders(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = CompletionRequestSchema.parse(await request.json());
    const provider = body.provider ?? inferProviderFromModel(body.model);

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (event: string, data: unknown) => {
          controller.enqueue(encodeEvent(encoder, event, data));
        };

        try {
          send("status", {
            step: "queued",
            provider,
            model: body.model ?? `${provider}:${body.tier}`,
          });

          const result = await gateway.complete({
            messages: [{ role: "user", content: body.prompt }],
            provider,
            model: body.model,
            tier: body.tier as ModelTier,
            temperature: body.temperature,
            maxTokens: body.maxTokens,
            jsonMode: body.jsonMode,
          });

          send("delta", {
            text: result.text,
            provider: result.provider,
            model: result.model,
            cached: result.cached,
          });

          send("done", {
            success: true,
            data: {
              text: result.text,
              provider: result.provider,
              model: result.model,
              usage: result.usage,
              cached: result.cached,
              latencyMs: result.latencyMs,
            },
          });
        } catch (error) {
          send("error", {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, { headers: sseHeaders() });
  } catch (error) {
    console.error("AI completion error:", error);

    if (error instanceof z.ZodError) {
      return Response.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        {
          status: 400,
          headers: jsonCorsHeaders(),
        }
      );
    }

    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
        headers: jsonCorsHeaders(),
      }
    );
  }
}



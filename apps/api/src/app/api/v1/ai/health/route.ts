/**
 * AI Gateway Health Check
 * GET /api/v1/ai/health
 */

export const runtime = "edge";

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      service: "ai-gateway",
      timestamp: new Date().toISOString(),
      providers: {
        openai: !!process.env.OPENAI_API_KEY,
        google: !!process.env.GOOGLE_AI_API_KEY,
        deepseek: !!process.env.DEEPSEEK_API_KEY,
        openrouter: !!process.env.OPENROUTER_API_KEY,
      },
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "https://oneatlas.dev",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        Vary: "Origin",
      },
    }
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "https://oneatlas.dev",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      Vary: "Origin",
    },
  });
}



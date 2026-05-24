// =============================================================================
// apps/api/src/app/api/v1/admin/queue/process/route.ts
//
// POST /api/v1/admin/queue/process
//
// Called by Vercel Cron (every minute) to drain the job queues.
// Also callable manually by admins for debugging.
//
// Security: protected by CRON_SECRET header (set in vercel.json).
// =============================================================================

export const runtime = "edge";

import { NextRequest } from "next/server";

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Allow in dev without secret
    return process.env.NODE_ENV === "development";
  }
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      message: "Queue processing is disabled on Cloudflare Pages edge runtime.",
      processedAt: new Date().toISOString(),
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

// Also support GET for Vercel Cron (which sends GET by default)
export async function GET(req: NextRequest) {
  return POST(req);
}



// =============================================================================
// apps/api/src/app/api/health/route.ts
// Simple health check — used by uptime monitors and load balancers.
// Returns DB connectivity status without exposing sensitive info.
// =============================================================================

export const runtime = "edge";

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Avoid importing `prisma` here — Prisma is Node-only and will break Edge
// bundles. Instead we report database availability from env vars and avoid
// making a direct DB connection in the Edge runtime.
export async function GET() {
  const start = Date.now();

  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  const dbStatus = hasDatabaseUrl ? "unknown" : "disabled";
  const dbLatencyMs: number | null = null;

  // Health endpoint itself is healthy (server running). Database status is
  // reported as `unknown` when a DATABASE_URL exists because Prisma cannot
  // be used from the Edge runtime — check DB connectivity from a Node job.
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "0.0.1",
      services: {
        database: { status: dbStatus, latencyMs: dbLatencyMs },
      },
      startupMs: Date.now() - start,
    },
    { status: 200 }
  );
}

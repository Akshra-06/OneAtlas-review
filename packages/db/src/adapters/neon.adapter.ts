// =============================================================================
// packages/db/src/adapters/neon.adapter.ts
// Neon serverless PostgreSQL adapter for the shared Prisma client.
// =============================================================================

import type { PrismaClient } from "@prisma/client";
import prisma from "../client";

export interface NeonPoolConfig {
  connectionUrl: string | null;
  pooled: boolean;
  connectionLimit: number;
  poolTimeoutMs: number;
}

function readNumericEnv(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getNeonPoolConfig(): NeonPoolConfig {
  const connectionUrl = process.env.DATABASE_URL ?? null;

  return {
    connectionUrl,
    pooled: Boolean(connectionUrl),
    connectionLimit: readNumericEnv("NEON_CONNECTION_LIMIT", 10),
    poolTimeoutMs: readNumericEnv("NEON_POOL_TIMEOUT_MS", 10_000),
  };
}

export function getNeonClient(): PrismaClient {
  return prisma;
}

export async function checkNeonConnectionHealth(
  client: PrismaClient = getNeonClient()
): Promise<boolean> {
  try {
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

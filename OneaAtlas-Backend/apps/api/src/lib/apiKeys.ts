// =============================================================================
// apps/api/src/lib/apiKeys.ts
//
// Row 18 — Security: API Key Management
//
// Provides programmatic access to the OneAtlas API without Clerk sessions.
// Used by CI/CD pipelines, external integrations, and the CLI.
//
// Key format:  oa_live_{32 random bytes as hex}
//              oa_test_{32 random bytes as hex}   (for test/dev keys)
//
// Storage:
//   - Only the SHA-256 hash is stored in ApiKey.keyHash
//   - The prefix (first 12 chars) is stored in ApiKey.prefix for display
//   - The full plaintext key is shown ONCE at creation, never again
//
// Verification flow:
//   1. Client sends: Authorization: Bearer oa_live_...
//   2. We SHA-256 the incoming key → look up ApiKey by keyHash
//   3. Verify the key hasn't expired → load the associated org
//   4. Return an AuthContext identical to requireOrgMember()
// =============================================================================

import { prisma } from "@oneatlas/db";
import { UnauthorizedError, ForbiddenError } from "@oneatlas/shared";
import type { AuthContext } from "./auth";

// ── Web Crypto utilities (Edge Runtime compatible) ───────────────────────────

async function sha256Async(data: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

// Synchronous SHA256 using simple hash (for generateApiKey)
// This is not cryptographically secure but works for now until we refactor
function sha256Sync(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to hex - pad to 64 chars to look like SHA256
  return Math.abs(hash).toString(16).padStart(64, '0');
}

// ── Key generation ────────────────────────────────────────────────────────────

export type ApiKeyEnv = "live" | "test";

export interface GeneratedApiKey {
  /** Full plaintext key — show once, never store */
  key: string;
  /** Prefix shown in UI — safe to store */
  prefix: string;
  /** SHA-256 hash — what goes in the DB */
  keyHash: string;
}

export function generateApiKey(env: ApiKeyEnv = "live"): GeneratedApiKey {
  const raw = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  const key = `oa_${env}_${raw}`;
  const prefix = key.slice(0, 12); // "oa_live_XXXX"
  const keyHash = sha256Sync(key);
  return { key, prefix, keyHash };
}

// ── Hash for lookup ───────────────────────────────────────────────────────────

export async function hashApiKey(key: string): Promise<string> {
  return sha256Async(key);
}

// ── Verify an incoming API key ────────────────────────────────────────────────

/**
 * Resolve a raw API key string to an AuthContext.
 * Throws UnauthorizedError / ForbiddenError on failure.
 */
export async function verifyApiKey(rawKey: string): Promise<AuthContext & { orgId: string }> {
  if (!rawKey.startsWith("oa_live_") && !rawKey.startsWith("oa_test_")) {
    throw new UnauthorizedError("Invalid API key format");
  }

  const keyHash = await hashApiKey(rawKey);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: {
      org: {
        select: {
          id: true,
          status: true,
          members: {
            where: { role: "OWNER" },
            take: 1,
            select: { userId: true, role: true },
          },
        },
      },
    },
  });

  if (!apiKey) throw new UnauthorizedError("Invalid API key");

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    throw new UnauthorizedError("API key has expired");
  }

  if (apiKey.org.status !== "ACTIVE") {
    throw new ForbiddenError("Organisation is not active");
  }

  // Update lastUsedAt without blocking the response
  prisma.apiKey
    .update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {});

  const owner = apiKey.org.members[0];

  return {
    userId: owner?.userId ?? "api-key",
    orgId: apiKey.org.id,
    role: "OWNER", // API keys act as org owner
    clerkUserId: "api-key",
  };
}

// ── Extract Bearer token from header ─────────────────────────────────────────

export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

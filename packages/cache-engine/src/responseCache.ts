// =============================================================================
// packages/cache-engine/src/responseCache.ts
//
// AI Gateway: Response Cache
//
// Caches AI completion responses in Upstash Redis.
// Uses the caller-supplied cacheKey (typically a hash of the prompt + model).
// Saves on token cost for identical repeated prompts (e.g. template generation).
//
// Key format: ai:cache:<cacheKey>
// =============================================================================

import { Redis } from "@upstash/redis";

/**
 * Opaque cached value type. The cache stores and retrieves raw JSON blobs.
 * Callers cast to their own concrete type (e.g. CompletionResponse) after retrieval.
 */
export type CachedValue = Record<string, unknown>;

const PREFIX = "ai:cache:";

let _redis: Redis | null = null;

function getRedis(): Redis {
  if (_redis) return _redis;
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Upstash Redis env vars not configured (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)");
  }
  _redis = new Redis({ url, token });
  return _redis;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Attempt to read a cached response.
 * Returns null on cache miss or Redis failure (fail-open).
 */
export async function getCachedResponse(
  cacheKey: string,
): Promise<CachedValue | null> {
  try {
    const redis = getRedis();
    const raw = await redis.get<CachedValue>(`${PREFIX}${cacheKey}`);
    return raw ?? null;
  } catch {
    // Cache read failure → treat as miss, never crash the request
    return null;
  }
}

/**
 * Store a completion response in cache.
 * Silently swallows Redis errors (fail-open).
 */
export async function setCachedResponse(
  cacheKey: string,
  response: CachedValue,
  ttlSeconds = 3600,
): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(`${PREFIX}${cacheKey}`, response, { ex: ttlSeconds });
  } catch {
    // Cache write failure → non-fatal
  }
}

/**
 * Invalidate a specific cache entry (call when prompt changes).
 */
export async function invalidateCachedResponse(cacheKey: string): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(`${PREFIX}${cacheKey}`);
  } catch {
    // Swallow
  }
}

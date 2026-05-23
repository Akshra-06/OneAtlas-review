// =============================================================================
// apps/api/src/middleware/rate-limit.middleware.ts
// Route-handler friendly Upstash rate limiting helper.
// =============================================================================

import { Ratelimit } from "@upstash/ratelimit";
import { RATE_LIMITS } from "@oneatlas/shared";
import { getRedis } from "../lib/queue";

export interface RateLimitOptions {
  limit?: number;
  windowMs?: number;
  prefix?: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const limiterCache = new Map<string, Ratelimit>();

function getLimiter(limit: number, windowMs: number, prefix: string): Ratelimit {
  const cacheKey = `${prefix}:${limit}:${windowMs}`;
  const existing = limiterCache.get(cacheKey);
  if (existing) {
    return existing;
  }

  const limiter = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(limit, `${windowMs}ms`),
    prefix,
  });

  limiterCache.set(cacheKey, limiter);
  return limiter;
}

export async function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): Promise<RateLimitResult | null> {
  let limiter: Ratelimit;

  try {
    const limit = options.limit ?? RATE_LIMITS.DEFAULT.requests;
    const windowMs = options.windowMs ?? RATE_LIMITS.DEFAULT.windowMs;
    const prefix = options.prefix ?? "rl:default";
    limiter = getLimiter(limit, windowMs, prefix);
  } catch {
    return null;
  }

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

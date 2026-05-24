// =============================================================================
// apps/api/src/realtime/adapters/redis.adapter.ts
// Optional Redis pub/sub bridge for realtime events.
// This activates when UPSTASH_REDIS_REST_URL is present; otherwise the
// realtime system falls back to in-memory delivery only.
// =============================================================================

import { Redis } from "@upstash/redis";
import { getRedis } from "../../lib/queue/bullmq";
import type { RealtimeChannelName, RealtimeEnvelope } from "../server";

type RedisLike = Redis & {
  publish(channel: string, message: string): Promise<number>;
};

let cachedRedis: RedisLike | null = null;

function resolveRedis(): RedisLike | null {
  if (cachedRedis) {
    return cachedRedis;
  }

  if (!process.env.UPSTASH_REDIS_REST_URL) {
    return null;
  }

  try {
    cachedRedis = getRedis() as RedisLike;
    return cachedRedis;
  } catch {
    return null;
  }
}

export function isRedisRealtimeEnabled(): boolean {
  return resolveRedis() !== null;
}

export async function publishRealtimeEnvelope<TData>(
  channel: RealtimeChannelName,
  envelope: RealtimeEnvelope<TData extends string | number | boolean | null ? TData : never> | RealtimeEnvelope
): Promise<boolean> {
  const redis = resolveRedis();
  if (!redis) {
    return false;
  }

  await redis.publish(`realtime:${channel}`, JSON.stringify(envelope));
  return true;
}

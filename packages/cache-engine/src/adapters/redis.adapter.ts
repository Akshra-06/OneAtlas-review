import { Redis } from "@upstash/redis";
import type { CacheAdapter } from "./index";
import { createMemoryAdapter } from "./memory.adapter";

const REDIS_SCAN_BATCH_SIZE = 100;

function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  try {
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

async function deleteByPrefix(redis: Redis, prefix: string): Promise<void> {
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(cursor, {
      match: `${prefix}*`,
      count: REDIS_SCAN_BATCH_SIZE,
    });

    cursor = String(nextCursor);

    if (keys.length > 0) {
      await Promise.all(keys.map(async (key) => {
        await redis.del(key);
      }));
    }
  } while (cursor !== "0");
}

export function createRedisAdapter(): CacheAdapter {
  const fallback = createMemoryAdapter();
  const redis = createRedisClient();

  if (!redis) {
    return fallback;
  }

  return {
    async get<T>(key: string): Promise<T | null> {
      try {
        const value = await redis.get<T>(key);
        if (value === null || value === undefined) {
          console.log(`[cache:redis] miss ${key}`);
          return null;
        }

        console.log(`[cache:redis] hit ${key}`);
        return value;
      } catch {
        return fallback.get<T>(key);
      }
    },

    async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
      try {
        if (ttlMs === undefined) {
          await redis.set(key, value);
          return;
        }

        if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
          await redis.del(key);
          return;
        }

        await redis.set(key, value, { px: Math.floor(ttlMs) });
      } catch {
        await fallback.set(key, value, ttlMs);
      }
    },

    async delete(key: string): Promise<void> {
      try {
        await redis.del(key);
      } catch {
        await fallback.delete(key);
      }
    },

    async clear(prefix?: string): Promise<void> {
      try {
        if (!prefix) {
          await fallback.clear();
          return;
        }

        await deleteByPrefix(redis, prefix);
      } catch {
        await fallback.clear(prefix);
      }
    },

    async has(key: string): Promise<boolean> {
      const value = await this.get<unknown>(key);
      return value !== null;
    },
  };
}

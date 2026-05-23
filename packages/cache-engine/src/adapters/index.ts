export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(prefix?: string): Promise<void>;
  has(key: string): Promise<boolean>;
}

export { createMemoryAdapter } from "./memory.adapter";
export { createRedisAdapter } from "./redis.adapter";

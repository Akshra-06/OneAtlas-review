// =============================================================================
// packages/cache-engine/src/index.ts
//
// Barrel export for @oneatlas/cache-engine
// =============================================================================

import { createMemoryAdapter } from "./adapters/memory.adapter";
import { createRedisAdapter } from "./adapters/redis.adapter";
import { createGenerationCache } from "./generation-cache/generation-cache";
import { InvalidationStrategy } from "./generation-cache/invalidation-strategy";
import { createTemplateCache } from "./template-cache/template-cache";
import { warmUpTemplateCache } from "./template-cache/warm-up";

export * from "./responseCache";
export * from "./generation";
export * from "./adapters";
export * from "./adapters/memory.adapter";
export * from "./adapters/redis.adapter";
export { createGenerationCache, buildGenerationCacheSnapshot } from "./generation-cache/generation-cache";
export type { GenerationCacheApi, GenerationCacheEntry, GenerationCacheKeyInput } from "./generation-cache/generation-cache";
export * from "./generation-cache/invalidation-strategy";
export * from "./template-cache/template-cache";
export * from "./template-cache/warm-up";

export interface CacheEngine {
	memory: ReturnType<typeof createMemoryAdapter>;
	redis: ReturnType<typeof createRedisAdapter>;
	generationCache: ReturnType<typeof createGenerationCache>;
	templateCache: ReturnType<typeof createTemplateCache>;
	invalidationStrategy: InvalidationStrategy;
}

function createLayeredAdapter() {
	const memory = createMemoryAdapter();
	const redis = createRedisAdapter();

	return {
		async get<T>(key: string): Promise<T | null> {
			const memoryValue = await memory.get<T>(key);
			if (memoryValue !== null) {
				return memoryValue;
			}

			const redisValue = await redis.get<T>(key);
			if (redisValue !== null) {
				await memory.set(key, redisValue, 60_000);
			}

			return redisValue;
		},

		async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
			await Promise.all([
				memory.set(key, value, Math.min(ttlMs ?? 60_000, 60_000)),
				redis.set(key, value, ttlMs),
			]);
		},

		async delete(key: string): Promise<void> {
			await Promise.all([
				memory.delete(key),
				redis.delete(key),
			]);
		},

		async clear(prefix?: string): Promise<void> {
			await Promise.all([
				memory.clear(prefix),
				redis.clear(prefix),
			]);
		},

		async has(key: string): Promise<boolean> {
			return (await this.get<unknown>(key)) !== null;
		},
	};
}

export function createCacheEngine(): CacheEngine {
	const layeredAdapter = createLayeredAdapter();
	const memory = createMemoryAdapter();
	const redis = createRedisAdapter();

	const generationCache = createGenerationCache(layeredAdapter);
	const templateCache = createTemplateCache(layeredAdapter);
	const invalidationStrategy = new InvalidationStrategy(layeredAdapter);

	void warmUpTemplateCache(templateCache);

	return {
		memory,
		redis,
		generationCache,
		templateCache,
		invalidationStrategy,
	};
}

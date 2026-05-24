import { createHash } from "crypto";
import type { CacheAdapter } from "../adapters";

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

export interface GenerationCacheKeyInput {
  orgId: string;
  appType: string;
  prompt: string;
  projectId?: string;
}

export interface GenerationCacheEntry<T = unknown> extends GenerationCacheKeyInput {
  output: T;
  createdAt: string;
  updatedAt: string;
  ttlMs: number;
  key: string;
  metadata?: Record<string, unknown>;
}

export interface GenerationCacheApi {
  get<T = unknown>(input: GenerationCacheKeyInput): Promise<GenerationCacheEntry<T> | null>;
  set<T = unknown>(entry: GenerationCacheEntry<T>): Promise<void>;
  delete(input: GenerationCacheKeyInput): Promise<void>;
  clear(orgId?: string): Promise<void>;
  has(input: GenerationCacheKeyInput): Promise<boolean>;
  buildKey(input: GenerationCacheKeyInput): string;
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();
  const entries = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`);
  return `{${entries.join(",")}}`;
}

function hashGenerationKey(input: GenerationCacheKeyInput): string {
  return createHash("sha256")
    .update(`${input.prompt}:${input.orgId}:${input.appType}`)
    .digest("hex");
}

function buildPrefix(input: GenerationCacheKeyInput): string {
  if (input.projectId) {
    return `org:${input.orgId}:project:${input.projectId}:generation:`;
  }

  return `org:${input.orgId}:generation:`;
}

export function createGenerationCache(adapter: CacheAdapter): GenerationCacheApi {
  return {
    buildKey(input: GenerationCacheKeyInput): string {
      return `${buildPrefix(input)}${hashGenerationKey(input)}`;
    },

    async get<T = unknown>(input: GenerationCacheKeyInput): Promise<GenerationCacheEntry<T> | null> {
      try {
        const key = this.buildKey(input);
        const entry = await adapter.get<GenerationCacheEntry<T>>(key);
        if (entry === null) {
          console.log(`[cache:generation] miss ${key}`);
          return null;
        }

        console.log(`[cache:generation] hit ${key}`);
        return entry;
      } catch {
        console.log(`[cache:generation] miss ${this.buildKey(input)}`);
        return null;
      }
    },

    async set<T = unknown>(entry: GenerationCacheEntry<T>): Promise<void> {
      try {
        const key = this.buildKey(entry);
        const storedEntry: GenerationCacheEntry<T> = {
          ...entry,
          key,
          createdAt: entry.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ttlMs: entry.ttlMs ?? DEFAULT_TTL_MS,
        };

        await adapter.set(key, storedEntry, storedEntry.ttlMs);
      } catch {
        // Fail open.
      }
    },

    async delete(input: GenerationCacheKeyInput): Promise<void> {
      try {
        await adapter.delete(this.buildKey(input));
      } catch {
        // Fail open.
      }
    },

    async clear(orgId?: string): Promise<void> {
      try {
        if (!orgId) {
          await adapter.clear("org:");
          return;
        }

        await adapter.clear(`org:${orgId}:`);
      } catch {
        // Fail open.
      }
    },

    async has(input: GenerationCacheKeyInput): Promise<boolean> {
      const key = this.buildKey(input);
      return adapter.has(key);
    },
  };
}

export function buildGenerationCacheSnapshot<T>(entry: GenerationCacheEntry<T>): string {
  return stableStringify(entry);
}

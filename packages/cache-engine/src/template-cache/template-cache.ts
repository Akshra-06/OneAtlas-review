import { createHash } from "crypto";
import type { CacheAdapter } from "../adapters";

const DEFAULT_TEMPLATE_TTL_MS = 60 * 60 * 1000;

export interface TemplateCacheKeyInput {
  orgId: string;
  templateId: string;
  entitySchema: Record<string, unknown>;
  projectId?: string;
}

export interface TemplateCacheEntry<T = unknown> extends TemplateCacheKeyInput {
  rendered: T;
  createdAt: string;
  updatedAt: string;
  ttlMs: number;
  key: string;
  entitySchemaHash: string;
}

export interface TemplateCache {
  get<T = unknown>(input: TemplateCacheKeyInput): Promise<TemplateCacheEntry<T> | null>;
  set<T = unknown>(entry: TemplateCacheEntry<T>): Promise<void>;
  delete(input: TemplateCacheKeyInput): Promise<void>;
  clear(orgId?: string): Promise<void>;
  has(input: TemplateCacheKeyInput): Promise<boolean>;
  buildKey(input: TemplateCacheKeyInput): string;
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

function hashSchema(entitySchema: Record<string, unknown>): string {
  return createHash("sha256").update(stableStringify(entitySchema)).digest("hex");
}

function buildPrefix(input: TemplateCacheKeyInput): string {
  if (input.projectId) {
    return `org:${input.orgId}:project:${input.projectId}:template:`;
  }

  return `org:${input.orgId}:template:`;
}

export function createTemplateCache(adapter: CacheAdapter): TemplateCache {
  return {
    buildKey(input: TemplateCacheKeyInput): string {
      return `${buildPrefix(input)}${input.templateId}:${hashSchema(input.entitySchema)}`;
    },

    async get<T = unknown>(input: TemplateCacheKeyInput): Promise<TemplateCacheEntry<T> | null> {
      try {
        const key = this.buildKey(input);
        const entry = await adapter.get<TemplateCacheEntry<T>>(key);
        if (entry === null) {
          console.log(`[cache:template] miss ${key}`);
          return null;
        }

        console.log(`[cache:template] hit ${key}`);
        return entry;
      } catch {
        console.log(`[cache:template] miss ${this.buildKey(input)}`);
        return null;
      }
    },

    async set<T = unknown>(entry: TemplateCacheEntry<T>): Promise<void> {
      try {
        const key = this.buildKey(entry);
        const entitySchemaHash = hashSchema(entry.entitySchema);
        const storedEntry: TemplateCacheEntry<T> = {
          ...entry,
          key,
          entitySchemaHash,
          createdAt: entry.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ttlMs: entry.ttlMs ?? DEFAULT_TEMPLATE_TTL_MS,
        };

        await adapter.set(key, storedEntry, storedEntry.ttlMs);
      } catch {
        // Fail open.
      }
    },

    async delete(input: TemplateCacheKeyInput): Promise<void> {
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

    async has(input: TemplateCacheKeyInput): Promise<boolean> {
      const key = this.buildKey(input);
      return adapter.has(key);
    },
  };
}

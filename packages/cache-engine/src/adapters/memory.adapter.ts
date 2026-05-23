import type { CacheAdapter } from "./index";

interface MemoryEntry<T> {
  value: T;
  expiresAt: number | null;
}

const CLEANUP_INTERVAL_MS = 60_000;

function normalizeTtl(ttlMs?: number): number | null {
  if (ttlMs === undefined) {
    return null;
  }

  if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
    return 0;
  }

  return Math.floor(ttlMs);
}

export function createMemoryAdapter(): CacheAdapter {
  const store = new Map<string, MemoryEntry<unknown>>();

  const cleanupExpiredEntries = (): void => {
    const now = Date.now();

    for (const [key, entry] of store.entries()) {
      if (entry.expiresAt !== null && entry.expiresAt <= now) {
        store.delete(key);
      }
    }
  };

  const cleanupTimer = setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL_MS);
  if (typeof cleanupTimer.unref === "function") {
    cleanupTimer.unref();
  }

  return {
    async get<T>(key: string): Promise<T | null> {
      try {
        const entry = store.get(key);
        if (!entry) {
          console.log(`[cache:memory] miss ${key}`);
          return null;
        }

        if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
          store.delete(key);
          console.log(`[cache:memory] miss ${key}`);
          return null;
        }

        console.log(`[cache:memory] hit ${key}`);
        return entry.value as T;
      } catch {
        console.log(`[cache:memory] miss ${key}`);
        return null;
      }
    },

    async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
      try {
        const normalizedTtl = normalizeTtl(ttlMs);
        if (normalizedTtl === 0) {
          store.delete(key);
          return;
        }

        store.set(key, {
          value,
          expiresAt: normalizedTtl === null ? null : Date.now() + normalizedTtl,
        });
      } catch {
        // Fail open.
      }
    },

    async delete(key: string): Promise<void> {
      try {
        store.delete(key);
      } catch {
        // Fail open.
      }
    },

    async clear(prefix?: string): Promise<void> {
      try {
        if (!prefix) {
          store.clear();
          return;
        }

        for (const key of Array.from(store.keys())) {
          if (key.startsWith(prefix)) {
            store.delete(key);
          }
        }
      } catch {
        // Fail open.
      }
    },

    async has(key: string): Promise<boolean> {
      const entry = await this.get<unknown>(key);
      return entry !== null;
    },
  };
}

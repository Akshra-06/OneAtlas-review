import type { CacheAdapter } from "../adapters";

export class InvalidationStrategy {
  private readonly pendingInvalidations = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private readonly adapter: CacheAdapter) {}

  async invalidateByProject(projectId: string): Promise<void> {
    try {
      await this.adapter.clear(`project:${projectId}:`);
    } catch {
      // Fail open.
    }
  }

  async invalidateByOrg(orgId: string): Promise<void> {
    try {
      await this.adapter.clear(`org:${orgId}:`);
    } catch {
      // Fail open.
    }
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      await this.adapter.clear(pattern);
    } catch {
      // Fail open.
    }
  }

  scheduleInvalidation(key: string, delayMs: number): void {
    const previous = this.pendingInvalidations.get(key);
    if (previous) {
      clearTimeout(previous);
    }

    const timer = setTimeout(() => {
      this.pendingInvalidations.delete(key);
      void this.adapter.delete(key);
    }, Math.max(0, delayMs));

    if (typeof timer.unref === "function") {
      timer.unref();
    }

    this.pendingInvalidations.set(key, timer);
  }
}

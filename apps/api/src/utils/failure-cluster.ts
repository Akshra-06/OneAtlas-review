export type FailureContext = {
  service: string;
  operation: string;
  orgId?: string;
  projectId?: string;
  timestamp: number;
};

export type FailureClusterGroup = {
  pattern: string;
  count: number;
  firstSeen: number;
  lastSeen: number;
  contexts: FailureContext[];
};

type FailureClusterRecord = FailureClusterGroup & {
  errors: Error[];
};

const SYSTEMIC_WINDOW_MS = 5 * 60 * 1000;

function normalizePattern(message: string): string {
  return message.replace(/\s+/g, " ").trim().slice(0, 50);
}

function cloneGroup(group: FailureClusterRecord): FailureClusterGroup {
  return {
    pattern: group.pattern,
    count: group.count,
    firstSeen: group.firstSeen,
    lastSeen: group.lastSeen,
    contexts: [...group.contexts],
  };
}

/**
 * Groups similar failures by a message prefix and tracks recent frequency.
 */
export class FailureCluster {
  private readonly clusters = new Map<string, FailureClusterRecord>();

  recordFailure(error: Error, context: FailureContext): void {
    const pattern = normalizePattern(error.message || error.name || "Unknown error");
    const now = context.timestamp;
    const existing = this.clusters.get(pattern);
    const contextCopy = { ...context };
    const errorCopy = new Error(error.message);
    errorCopy.name = error.name;
    errorCopy.stack = error.stack;

    if (!existing) {
      this.clusters.set(pattern, {
        pattern,
        count: 1,
        firstSeen: now,
        lastSeen: now,
        contexts: [contextCopy],
        errors: [errorCopy],
      });
      return;
    }

    existing.contexts.push(contextCopy);
    existing.errors.push(errorCopy);
    existing.count += 1;
    existing.lastSeen = Math.max(existing.lastSeen, now);
    existing.firstSeen = Math.min(existing.firstSeen, now);
  }

  getClusters(): FailureClusterGroup[] {
    return Array.from(this.clusters.values()).map((group) => cloneGroup(group));
  }

  getTopFailures(limit: number): FailureClusterGroup[] {
    return Array.from(this.clusters.values())
      .map((group) => cloneGroup(group))
      .sort((left, right) => {
        if (right.count !== left.count) {
          return right.count - left.count;
        }

        return right.lastSeen - left.lastSeen;
      })
      .slice(0, Math.max(0, Math.floor(limit)));
  }

  isSystemicFailure(error: Error): boolean {
    const pattern = normalizePattern(error.message || error.name || "Unknown error");
    const cluster = this.clusters.get(pattern);

    if (!cluster) {
      return false;
    }

    const cutoff = Date.now() - SYSTEMIC_WINDOW_MS;
    const recentCount = cluster.contexts.filter((entry) => entry.timestamp >= cutoff).length;
    return recentCount >= 5;
  }

  clearOldClusters(maxAgeMs: number): void {
    const cutoff = Date.now() - Math.max(0, maxAgeMs);

    for (const [pattern, cluster] of this.clusters.entries()) {
      if (cluster.lastSeen < cutoff) {
        this.clusters.delete(pattern);
      }
    }
  }
}

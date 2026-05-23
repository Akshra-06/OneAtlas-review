import type { RuntimeManifest } from "./runtime-manifest";

interface GraphNodeInfo {
  chunkId: string;
  dependencies: string[];
  depth: number;
  critical: boolean;
  loadGroup: number;
  estimatedLoadTimeMs: number;
  size: number;
}

/**
 * Execution graph derived from a runtime manifest.
 */
export class ExecutionGraph {
  private manifest: RuntimeManifest | null = null;

  private readonly nodes = new Map<string, GraphNodeInfo>();

  private readonly dependents = new Map<string, Set<string>>();

  buildFromManifest(manifest: RuntimeManifest): void {
    this.manifest = manifest;
    this.nodes.clear();
    this.dependents.clear();

    const chunkMap = new Map(manifest.chunks.map((chunk) => [chunk.id, chunk] as const));

    for (const node of manifest.executionGraph) {
      const chunk = chunkMap.get(node.chunkId);
      if (!chunk) {
        continue;
      }

      this.nodes.set(node.chunkId, {
        chunkId: node.chunkId,
        dependencies: [...node.dependencies],
        depth: node.depth,
        critical: node.critical,
        loadGroup: node.loadGroup,
        estimatedLoadTimeMs: node.estimatedLoadTimeMs,
        size: chunk.size,
      });
    }

    if (this.nodes.size === 0) {
      for (const chunk of manifest.chunks) {
        this.nodes.set(chunk.id, {
          chunkId: chunk.id,
          dependencies: [...chunk.dependencies],
          depth: 0,
          critical: !chunk.lazy,
          loadGroup: chunk.lazy ? 2 : 0,
          estimatedLoadTimeMs: Math.max(1, Math.ceil(chunk.size / 160)),
          size: chunk.size,
        });
      }
    }

    for (const node of this.nodes.values()) {
      for (const dependency of node.dependencies) {
        const set = this.dependents.get(dependency) ?? new Set<string>();
        set.add(node.chunkId);
        this.dependents.set(dependency, set);
      }
    }
  }

  getCriticalPath(): string[] {
    const chunkMap = this.requireChunkMap();
    const memo = new Map<string, { weight: number; path: string[] }>();
    let bestPath: string[] = [];
    let bestWeight = -1;

    const visit = (chunkId: string, stack = new Set<string>()): { weight: number; path: string[] } => {
      const cached = memo.get(chunkId);
      if (cached) {
        return cached;
      }

      const chunk = chunkMap.get(chunkId);
      if (!chunk) {
        return { weight: 0, path: [] };
      }

      if (stack.has(chunkId)) {
        return { weight: chunk.size, path: [chunkId] };
      }

      stack.add(chunkId);

      if (chunk.dependencies.length === 0) {
        const base = { weight: chunk.size, path: [chunkId] };
        memo.set(chunkId, base);
        stack.delete(chunkId);
        return base;
      }

      let candidate: { weight: number; path: string[] } | null = null;

      for (const dependency of chunk.dependencies) {
        const result = visit(dependency, stack);
        if (!candidate || result.weight > candidate.weight) {
          candidate = result;
        }
      }

      const resolved = {
        weight: chunk.size + (candidate?.weight ?? 0),
        path: [...(candidate?.path ?? []), chunkId],
      };

      memo.set(chunkId, resolved);
      stack.delete(chunkId);
      return resolved;
    };

    for (const chunkId of chunkMap.keys()) {
      const result = visit(chunkId);
      if (result.weight > bestWeight) {
        bestWeight = result.weight;
        bestPath = result.path;
      }
    }

    return bestPath;
  }

  getLoadOrder(): string[][] {
    const groups = new Map<number, Set<string>>();
    const nodes = this.nodes.values();

    for (const node of nodes) {
      const loadGroup = node.loadGroup;
      const group = groups.get(loadGroup) ?? new Set<string>();
      group.add(node.chunkId);
      groups.set(loadGroup, group);
    }

    if (groups.size === 0 && this.manifest) {
      for (const entryPoint of this.manifest.entryPoints) {
        const group = groups.get(0) ?? new Set<string>();
        group.add(entryPoint.chunkId);
        groups.set(0, group);
      }
    }

    return Array.from(groups.entries())
      .sort(([left], [right]) => left - right)
      .map(([, chunkIds]) => Array.from(chunkIds));
  }

  estimateLoadTime(chunkIds: string[]): number {
    let total = 0;
    const seen = new Set<string>();

    for (const chunkId of chunkIds) {
      if (seen.has(chunkId)) {
        continue;
      }

      seen.add(chunkId);
      const node = this.nodes.get(chunkId);
      if (!node) {
        continue;
      }

      total += Math.max(1, Math.ceil(node.size / 160)) + (node.depth * 12);
    }

    return total;
  }

  private requireChunkMap(): Map<string, { id: string; size: number; dependencies: string[] }> {
    if (!this.manifest) {
      return new Map<string, { id: string; size: number; dependencies: string[] }>();
    }

    return new Map(this.manifest.chunks.map((chunk) => [chunk.id, chunk] as const));
  }
}

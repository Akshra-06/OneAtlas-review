// =============================================================================
// apps/api/src/utils/dependency-graph.ts
// Mutable dependency graph for build-order and impact analysis.
// =============================================================================

/** Node stored in the dependency graph. */
export interface GraphNode {
  id: string;
  metadata: Record<string, unknown>;
}

/** Directed edge where `fromId` depends on `toId`. */
export interface GraphEdge {
  fromId: string;
  toId: string;
}

class GraphCycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GraphCycleError";
  }
}

/**
 * Dependency graph with mutation helpers and graph traversals.
 */
export class DependencyGraph {
  private readonly nodes = new Map<string, GraphNode>();

  private readonly dependencies = new Map<string, Set<string>>();

  private readonly dependents = new Map<string, Set<string>>();

  /**
   * Add or replace a node in the graph.
   * @param id - Node identifier.
   * @param metadata - Arbitrary node metadata.
   */
  addNode(id: string, metadata: Record<string, unknown>): void {
    this.nodes.set(id, { id, metadata: { ...metadata } });
    this.ensureNodeSets(id);
  }

  /**
   * Add a dependency edge where `fromId` depends on `toId`.
   * @param fromId - Dependent node.
   * @param toId - Dependency node.
   */
  addEdge(fromId: string, toId: string): void {
    this.ensureNodeExists(fromId);
    this.ensureNodeExists(toId);

    this.dependencies.get(fromId)?.add(toId);
    this.dependents.get(toId)?.add(fromId);
  }

  /**
   * Remove a node and all edges connected to it.
   * @param id - Node identifier.
   */
  removeNode(id: string): void {
    this.nodes.delete(id);

    const deps = this.dependencies.get(id);
    if (deps) {
      for (const dependency of deps) {
        this.dependents.get(dependency)?.delete(id);
      }
    }

    const parents = this.dependents.get(id);
    if (parents) {
      for (const parent of parents) {
        this.dependencies.get(parent)?.delete(id);
      }
    }

    this.dependencies.delete(id);
    this.dependents.delete(id);
  }

  /**
   * Remove a dependency edge.
   * @param fromId - Dependent node.
   * @param toId - Dependency node.
   */
  removeEdge(fromId: string, toId: string): void {
    this.dependencies.get(fromId)?.delete(toId);
    this.dependents.get(toId)?.delete(fromId);
  }

  /**
   * Return nodes in build order with dependencies first.
   */
  getTopologicalOrder(): string[] {
    const inDegree = new Map<string, number>();

    for (const nodeId of this.nodes.keys()) {
      inDegree.set(nodeId, this.dependencies.get(nodeId)?.size ?? 0);
    }

    const queue: string[] = [];
    for (const [nodeId, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(nodeId);
      }
    }

    const ordered: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        continue;
      }

      ordered.push(current);

      for (const dependent of this.dependents.get(current) ?? []) {
        const nextDegree = (inDegree.get(dependent) ?? 0) - 1;
        inDegree.set(dependent, nextDegree);
        if (nextDegree === 0) {
          queue.push(dependent);
        }
      }
    }

    if (ordered.length !== this.nodes.size) {
      throw new GraphCycleError("Dependency graph contains a circular dependency");
    }

    return ordered;
  }

  /**
   * Detect circular dependency cycles using DFS.
   */
  detectCircularDependencies(): string[][] {
    const visited = new Set<string>();
    const stack = new Set<string>();
    const path: string[] = [];
    const cycles: string[][] = [];

    const visit = (nodeId: string): void => {
      if (stack.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        if (cycleStart >= 0) {
          cycles.push([...path.slice(cycleStart), nodeId]);
        }
        return;
      }

      if (visited.has(nodeId)) {
        return;
      }

      visited.add(nodeId);
      stack.add(nodeId);
      path.push(nodeId);

      for (const dependency of this.dependencies.get(nodeId) ?? []) {
        visit(dependency);
      }

      stack.delete(nodeId);
      path.pop();
    };

    for (const nodeId of this.nodes.keys()) {
      visit(nodeId);
    }

    return cycles;
  }

  /**
   * Return all direct dependencies of a node.
   * @param nodeId - Node identifier.
   */
  getDependencies(nodeId: string): string[] {
    return Array.from(this.dependencies.get(nodeId) ?? []);
  }

  /**
   * Return all nodes that directly depend on a node.
   * @param nodeId - Node identifier.
   */
  getDependents(nodeId: string): string[] {
    return Array.from(this.dependents.get(nodeId) ?? []);
  }

  /**
   * Return all nodes affected by a change to the given node.
   * @param changedNodeId - Node that changed.
   */
  getAffectedNodes(changedNodeId: string): string[] {
    const affected = new Set<string>();
    const queue = [...(this.dependents.get(changedNodeId) ?? [])];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || affected.has(current)) {
        continue;
      }

      affected.add(current);
      for (const dependent of this.dependents.get(current) ?? []) {
        if (!affected.has(dependent)) {
          queue.push(dependent);
        }
      }
    }

    return Array.from(affected);
  }

  /**
   * Check whether the graph contains any circular dependency.
   */
  hasCircularDependency(): boolean {
    return this.detectCircularDependencies().length > 0;
  }

  /** Clear the graph. */
  clear(): void {
    this.nodes.clear();
    this.dependencies.clear();
    this.dependents.clear();
  }

  private ensureNodeExists(id: string): void {
    if (!this.nodes.has(id)) {
      this.addNode(id, {});
    } else {
      this.ensureNodeSets(id);
    }
  }

  private ensureNodeSets(id: string): void {
    if (!this.dependencies.has(id)) {
      this.dependencies.set(id, new Set<string>());
    }

    if (!this.dependents.has(id)) {
      this.dependents.set(id, new Set<string>());
    }
  }
}

/**
 * Create a new dependency graph.
 */
export function createDependencyGraph(): DependencyGraph {
  return new DependencyGraph();
}

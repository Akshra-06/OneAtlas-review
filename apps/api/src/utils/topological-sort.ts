// =============================================================================
// apps/api/src/utils/topological-sort.ts
// Pure helpers for topological sorting and cycle detection.
// =============================================================================

/** Error thrown when topological sort encounters a cycle. */
export class CircularDependencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CircularDependencyError";
  }
}

function buildGraph(
  nodes: string[],
  edges: [string, string][]
): {
  dependencies: Map<string, Set<string>>;
  dependents: Map<string, Set<string>>;
} {
  const dependencies = new Map<string, Set<string>>();
  const dependents = new Map<string, Set<string>>();

  for (const node of nodes) {
    dependencies.set(node, new Set<string>());
    dependents.set(node, new Set<string>());
  }

  for (const [from, to] of edges) {
    if (!dependencies.has(from)) {
      dependencies.set(from, new Set<string>());
      dependents.set(from, new Set<string>());
      nodes.push(from);
    }

    if (!dependencies.has(to)) {
      dependencies.set(to, new Set<string>());
      dependents.set(to, new Set<string>());
      nodes.push(to);
    }

    dependencies.get(from)?.add(to);
    dependents.get(to)?.add(from);
  }

  return { dependencies, dependents };
}

/**
 * Topologically sort nodes so dependencies appear before dependents.
 * @param nodes - Node identifiers.
 * @param edges - Directed edges where the first item depends on the second.
 */
export function topologicalSort(
  nodes: string[],
  edges: [string, string][]
): string[] {
  const uniqueNodes = Array.from(new Set(nodes));
  const { dependencies, dependents } = buildGraph(uniqueNodes, edges);
  const inDegree = new Map<string, number>();

  for (const node of dependencies.keys()) {
    inDegree.set(node, dependencies.get(node)?.size ?? 0);
  }

  const queue: string[] = [];
  for (const [node, degree] of inDegree.entries()) {
    if (degree === 0) {
      queue.push(node);
    }
  }

  const ordered: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    ordered.push(current);

    for (const dependent of dependents.get(current) ?? []) {
      const nextDegree = (inDegree.get(dependent) ?? 0) - 1;
      inDegree.set(dependent, nextDegree);
      if (nextDegree === 0) {
        queue.push(dependent);
      }
    }
  }

  if (ordered.length !== dependencies.size) {
    const cycles = detectCycles(nodes, edges);
    throw new CircularDependencyError(
      `Circular dependency detected: ${cycles.map((cycle) => cycle.join(" -> ")).join("; ")}`
    );
  }

  return ordered;
}

/**
 * Detect circular dependency cycles using DFS.
 * @param nodes - Node identifiers.
 * @param edges - Directed edges where the first item depends on the second.
 */
export function detectCycles(
  nodes: string[],
  edges: [string, string][]
): string[][] {
  const uniqueNodes = Array.from(new Set(nodes));
  const { dependencies } = buildGraph(uniqueNodes, edges);
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

    for (const dependency of dependencies.get(nodeId) ?? []) {
      visit(dependency);
    }

    stack.delete(nodeId);
    path.pop();
  };

  for (const node of uniqueNodes) {
    visit(node);
  }

  return cycles;
}

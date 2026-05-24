import { createHash } from "node:crypto";
import type { GeneratedFile } from "@oneatlas/shared";
import { topologicalSort } from "./topological-sort";

export interface ManifestChunk {
  id: string;
  type: "page" | "component" | "api" | "shared";
  path: string;
  dependencies: string[];
  size: number;
  hash: string;
  lazy: boolean;
}

export interface EntryPoint {
  id: string;
  chunkId: string;
  path: string;
  type: ManifestChunk["type"];
  critical: boolean;
  loadPriority: number;
}

export interface LazyRoute {
  id: string;
  chunkId: string;
  path: string;
  reason: string;
  preload: boolean;
  depth: number;
}

export interface ExecutionNode {
  id: string;
  chunkId: string;
  dependencies: string[];
  depth: number;
  loadGroup: number;
  critical: boolean;
  estimatedLoadTimeMs: number;
}

export interface RuntimeManifest {
  version: string;
  projectId: string;
  orgId: string;
  generatedAt: string;
  chunks: ManifestChunk[];
  entryPoints: EntryPoint[];
  lazyRoutes: LazyRoute[];
  executionGraph: ExecutionNode[];
}

const MANIFEST_VERSION = "1.0.0";
const SMALL_CHUNK_SIZE_BYTES = 1024;

function toPosixPath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

function normalizeComparablePath(filePath: string): string {
  return toPosixPath(filePath).replace(/\.[^./\\]+$/, "");
}

function shortHash(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

function fullHash(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function byteSize(content: string): number {
  return Buffer.byteLength(content, "utf8");
}

function classifyChunkType(file: GeneratedFile): ManifestChunk["type"] {
  switch (file.fileType) {
    case "page":
      return "page";
    case "api-route":
      return "api";
    case "component":
      return "component";
    default:
      return "shared";
  }
}

function deriveRoutePath(filePath: string): string {
  const normalized = toPosixPath(filePath);
  const appIndex = normalized.lastIndexOf("/app/");
  const pagesIndex = normalized.lastIndexOf("/pages/");
  const baseIndex = appIndex >= 0 ? appIndex + 5 : pagesIndex >= 0 ? pagesIndex + 7 : 0;
  const relative = normalized.slice(baseIndex).replace(/\.[^./\\]+$/, "");

  if (relative.endsWith("/page")) {
    const route = relative.replace(/\/page$/, "");
    return route === "" ? "/" : `/${route.replace(/^\//, "")}`;
  }

  if (relative.endsWith("/route")) {
    return `/${relative.replace(/\/route$/, "").replace(/^\//, "")}`;
  }

  return `/${relative.replace(/^\//, "")}`;
}

function createChunkId(filePath: string, fileType: string): string {
  return `chunk-${shortHash(`${fileType}:${toPosixPath(filePath)}`)}`;
}

function buildChunkHash(file: GeneratedFile): string {
  return fullHash(`${file.filePath}\0${file.fileType}\0${file.entityName ?? ""}\0${file.content}`);
}

function parseImportSpecifiers(content: string): string[] {
  const specifiers = new Set<string>();
  const importRegex = /(?:import|export)\s+(?:[^'"`]+\s+from\s+)?['"`]([^'"`]+)['"`]/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(content)) !== null) {
    const specifier = match[1];
    if (specifier) {
      specifiers.add(specifier);
    }
  }

  return Array.from(specifiers);
}

function stripExtension(filePath: string): string {
  return filePath.replace(/\.[^./\\]+$/, "");
}

function samePathFamily(candidate: string, target: string): boolean {
  const normalizedCandidate = stripExtension(toPosixPath(candidate));
  const normalizedTarget = stripExtension(toPosixPath(target));
  return normalizedCandidate === normalizedTarget || normalizedCandidate.endsWith(`/${normalizedTarget.split("/").pop() ?? ""}`);
}

function isDependencyAllowed(sourceType: ManifestChunk["type"], targetType: ManifestChunk["type"]): boolean {
  const allowedDependencies: Record<ManifestChunk["type"], ManifestChunk["type"][]> = {
    page: ["component", "shared", "api"],
    component: ["component", "shared"],
    api: ["component", "shared"],
    shared: [],
  };

  return allowedDependencies[sourceType].includes(targetType);
}

function buildDependencyEdges(chunks: ManifestChunk[], generatedFiles: GeneratedFile[]): Map<string, Set<string>> {
  const edges = new Map<string, Set<string>>();

  for (const chunk of chunks) {
    edges.set(chunk.id, new Set<string>());
  }

  for (const sourceChunk of chunks) {
    const sourceFile = generatedFiles.find((file) => createChunkId(file.filePath, file.fileType) === sourceChunk.id);
    if (!sourceFile) {
      continue;
    }

    const importSpecifiers = parseImportSpecifiers(sourceFile.content);
    const sourceComparablePath = normalizeComparablePath(sourceFile.filePath);
    const sourceDir = sourceComparablePath.slice(0, sourceComparablePath.lastIndexOf("/") + 1);

    for (const targetChunk of chunks) {
      if (targetChunk.id === sourceChunk.id) {
        continue;
      }

      if (!isDependencyAllowed(sourceChunk.type, targetChunk.type)) {
        continue;
      }

      const targetFile = generatedFiles.find((file) => createChunkId(file.filePath, file.fileType) === targetChunk.id);
      if (!targetFile) {
        continue;
      }

      const targetComparablePath = normalizeComparablePath(targetFile.filePath);
      const targetBaseName = targetComparablePath.split("/").pop() ?? "";

      const explicitPathMatch = sourceFile.content.includes(toPosixPath(targetFile.filePath))
        || sourceFile.content.includes(targetComparablePath)
        || sourceFile.content.includes(targetBaseName)
        || importSpecifiers.some((specifier) => {
          if (specifier.startsWith(".")) {
            const resolved = normalizeComparablePath(`${sourceDir}${specifier}`);
            return samePathFamily(resolved, targetComparablePath);
          }

          if (specifier.startsWith("@/")) {
            return targetComparablePath.includes(specifier.slice(2));
          }

          return specifier === targetBaseName;
        });

      if (explicitPathMatch) {
        edges.get(sourceChunk.id)?.add(targetChunk.id);
      }
    }
  }

  return edges;
}

function buildFallbackDependencies(chunks: ManifestChunk[], sourceChunk: ManifestChunk): string[] {
  const dependencies = new Set<string>();

  for (const targetChunk of chunks) {
    if (targetChunk.id === sourceChunk.id) {
      continue;
    }

    if (sourceChunk.type === "page" && (targetChunk.type === "component" || targetChunk.type === "shared" || targetChunk.type === "api")) {
      dependencies.add(targetChunk.id);
    } else if (sourceChunk.type === "component" && (targetChunk.type === "component" || targetChunk.type === "shared")) {
      dependencies.add(targetChunk.id);
    } else if (sourceChunk.type === "api" && (targetChunk.type === "component" || targetChunk.type === "shared")) {
      dependencies.add(targetChunk.id);
    }
  }

  return Array.from(dependencies);
}

function createManifestChunks(generatedFiles: GeneratedFile[]): ManifestChunk[] {
  return generatedFiles.map((file) => ({
    id: createChunkId(file.filePath, file.fileType),
    type: classifyChunkType(file),
    path: toPosixPath(file.filePath),
    dependencies: [],
    size: byteSize(file.content),
    hash: buildChunkHash(file),
    lazy: false,
  }));
}

function buildExecutionGraphChunks(chunks: ManifestChunk[]): ExecutionNode[] {
  const chunkMap = new Map(chunks.map((chunk) => [chunk.id, chunk] as const));
  const reverseDependencies = new Map<string, string[]>();

  for (const chunk of chunks) {
    for (const dependency of chunk.dependencies) {
      const dependents = reverseDependencies.get(dependency) ?? [];
      dependents.push(chunk.id);
      reverseDependencies.set(dependency, dependents);
    }
  }

  const order = chunks.length > 0
    ? topologicalSort(chunks.map((chunk) => chunk.id), chunks.flatMap((chunk) => chunk.dependencies.map((dependency) => [chunk.id, dependency] as [string, string])))
    : [];

  const depthCache = new Map<string, number>();

  const depthFor = (chunkId: string, stack = new Set<string>()): number => {
    const cached = depthCache.get(chunkId);
    if (cached !== undefined) {
      return cached;
    }

    if (stack.has(chunkId)) {
      return 0;
    }

    stack.add(chunkId);
    const chunk = chunkMap.get(chunkId);
    if (!chunk) {
      depthCache.set(chunkId, 0);
      stack.delete(chunkId);
      return 0;
    }

    const depth = chunk.dependencies.length === 0
      ? 0
      : 1 + Math.max(...chunk.dependencies.map((dependency) => depthFor(dependency, stack)));

    depthCache.set(chunkId, depth);
    stack.delete(chunkId);
    return depth;
  };

  const entryPointIds = new Set(chunks.filter((chunk) => chunk.dependencies.length === 0).map((chunk) => chunk.id));
  const criticalIds = new Set<string>();

  let criticalPath: string[] = [];
  let criticalWeight = -1;

  const chainWeight = (chunkId: string, stack = new Set<string>()): { weight: number; path: string[] } => {
    if (stack.has(chunkId)) {
      return { weight: 0, path: [chunkId] };
    }

    const chunk = chunkMap.get(chunkId);
    if (!chunk) {
      return { weight: 0, path: [chunkId] };
    }

    stack.add(chunkId);

    if (chunk.dependencies.length === 0) {
      stack.delete(chunkId);
      return { weight: chunk.size, path: [chunkId] };
    }

    let bestWeight = -1;
    let bestPath: string[] = [];

    for (const dependency of chunk.dependencies) {
      const result = chainWeight(dependency, stack);
      if (result.weight > bestWeight) {
        bestWeight = result.weight;
        bestPath = result.path;
      }
    }

    stack.delete(chunkId);

    return {
      weight: chunk.size + Math.max(bestWeight, 0),
      path: [...bestPath, chunkId],
    };
  };

  for (const chunkId of order) {
    const result = chainWeight(chunkId);
    if (result.weight > criticalWeight) {
      criticalWeight = result.weight;
      criticalPath = result.path;
    }
  }

  for (const chunkId of criticalPath) {
    criticalIds.add(chunkId);
  }

  return chunks.map((chunk) => {
    const depth = depthFor(chunk.id);
    const loadGroup = entryPointIds.has(chunk.id)
      ? 0
      : depth <= 1 || criticalIds.has(chunk.id)
        ? 1
        : 2 + Math.max(0, depth - 2);

    return {
      id: chunk.id,
      chunkId: chunk.id,
      dependencies: [...chunk.dependencies],
      depth,
      loadGroup,
      critical: criticalIds.has(chunk.id),
      estimatedLoadTimeMs: Math.max(1, Math.ceil(chunk.size / 160) + depth * 12),
    };
  });
}

function buildEntryPoints(chunks: ManifestChunk[], executionGraph: ExecutionNode[]): EntryPoint[] {
  const nodeById = new Map(executionGraph.map((node) => [node.chunkId, node] as const));

  return chunks
    .filter((chunk) => chunk.type === "page" || chunk.type === "api")
    .map((chunk) => {
      const routePath = deriveRoutePath(chunk.path);
      const node = nodeById.get(chunk.id);

      return {
        id: `entry-${chunk.id}`,
        chunkId: chunk.id,
        path: routePath,
        type: chunk.type,
        critical: node?.critical ?? false,
        loadPriority: node?.depth ?? 0,
      };
    });
}

function buildLazyRoutes(chunks: ManifestChunk[], executionGraph: ExecutionNode[]): LazyRoute[] {
  const nodeById = new Map(executionGraph.map((node) => [node.chunkId, node] as const));

  return chunks
    .filter((chunk) => chunk.type === "page")
    .map((chunk) => {
      const routePath = deriveRoutePath(chunk.path);
      const node = nodeById.get(chunk.id);
      const depth = node?.depth ?? 0;
      const isDynamic = routePath.includes("[");
      const isNested = routePath !== "/" && routePath.split("/").filter(Boolean).length > 1;

      return {
        id: `lazy-${chunk.id}`,
        chunkId: chunk.id,
        path: routePath,
        reason: isDynamic ? "dynamic-route" : isNested ? "nested-route" : "route-split",
        preload: depth <= 1,
        depth,
      };
    })
    .filter((route) => route.path !== "/" || route.depth > 0);
}

function rebuildManifestStructures(manifest: RuntimeManifest): RuntimeManifest {
  const executionGraph = buildExecutionGraphChunks(manifest.chunks);
  return {
    ...manifest,
    executionGraph,
    entryPoints: buildEntryPoints(manifest.chunks, executionGraph),
    lazyRoutes: buildLazyRoutes(manifest.chunks, executionGraph),
  };
}

export function buildRuntimeManifest(
  projectId: string,
  orgId: string,
  generatedFiles: GeneratedFile[]
): RuntimeManifest {
  if (generatedFiles.length === 0) {
    return {
      version: MANIFEST_VERSION,
      projectId,
      orgId,
      generatedAt: new Date().toISOString(),
      chunks: [],
      entryPoints: [],
      lazyRoutes: [],
      executionGraph: [],
    };
  }

  const chunks = createManifestChunks(generatedFiles);
  const dependencyEdges = buildDependencyEdges(chunks, generatedFiles);

  for (const chunk of chunks) {
    const explicitDependencies = Array.from(dependencyEdges.get(chunk.id) ?? []);
    chunk.dependencies = explicitDependencies.length > 0 ? explicitDependencies : buildFallbackDependencies(chunks, chunk);
  }

  const manifest: RuntimeManifest = {
    version: MANIFEST_VERSION,
    projectId,
    orgId,
    generatedAt: new Date().toISOString(),
    chunks,
    entryPoints: [],
    lazyRoutes: [],
    executionGraph: [],
  };

  return optimizeManifest(manifest);
}

export function optimizeManifest(manifest: RuntimeManifest): RuntimeManifest {
  if (manifest.chunks.length === 0) {
    return rebuildManifestStructures({ ...manifest, chunks: [] });
  }

  const smallChunks = manifest.chunks.filter((chunk) => chunk.size < SMALL_CHUNK_SIZE_BYTES);
  const retainedChunks = manifest.chunks.filter((chunk) => chunk.size >= SMALL_CHUNK_SIZE_BYTES);

  const idRemap = new Map<string, string>();
  for (const chunk of smallChunks) {
    idRemap.set(chunk.id, "shared:merged");
  }

  const mergedDependencies = new Set<string>();
  let mergedSize = 0;
  const mergedHashes: string[] = [];

  for (const chunk of smallChunks) {
    mergedSize += chunk.size;
    mergedHashes.push(chunk.hash);

    for (const dependency of chunk.dependencies) {
      if (!idRemap.has(dependency)) {
        mergedDependencies.add(dependency);
      }
    }
  }

  const mergedChunk: ManifestChunk | null = smallChunks.length > 0
    ? {
        id: "shared:merged",
        type: "shared",
        path: "shared://merged",
        dependencies: Array.from(mergedDependencies),
        size: mergedSize,
        hash: fullHash(mergedHashes.join("|")),
        lazy: false,
      }
    : null;

  const chunks = [...retainedChunks.map((chunk) => ({
    ...chunk,
    dependencies: chunk.dependencies.map((dependency) => idRemap.get(dependency) ?? dependency).filter((dependency, index, list) => list.indexOf(dependency) === index),
  }))];

  if (mergedChunk) {
    chunks.push(mergedChunk);
  }

  const rebuilt = rebuildManifestStructures({
    ...manifest,
    chunks,
  });

  const criticalIds = new Set(rebuilt.executionGraph.filter((node) => node.critical).map((node) => node.chunkId));

  return {
    ...rebuilt,
    chunks: rebuilt.chunks.map((chunk) => ({
      ...chunk,
      lazy: !criticalIds.has(chunk.id),
    })),
    executionGraph: rebuilt.executionGraph.map((node) => ({
      ...node,
      critical: criticalIds.has(node.chunkId),
    })),
    entryPoints: rebuilt.entryPoints.map((entryPoint) => ({
      ...entryPoint,
      critical: criticalIds.has(entryPoint.chunkId),
    })),
    lazyRoutes: rebuilt.lazyRoutes.map((lazyRoute) => ({
      ...lazyRoute,
      preload: criticalIds.has(lazyRoute.chunkId) || lazyRoute.preload,
    })),
  };
}

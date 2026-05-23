// =============================================================================
// apps/api/src/utils/change-detector.ts
// Pure change detection helpers for incremental regeneration.
// =============================================================================

/** Component categories used by the regeneration pipeline. */
export enum ComponentType {
  ENTITY = "ENTITY",
  PAGE = "PAGE",
  API_ROUTE = "API_ROUTE",
  WORKFLOW = "WORKFLOW",
  COMPONENT = "COMPONENT",
  LAYOUT = "LAYOUT",
}

/** A component that changed between two specs. */
export interface ChangedComponent {
  id: string;
  type: ComponentType;
  changeType: "added" | "modified" | "removed";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isIndex(value: string): boolean {
  return /^[0-9]+$/.test(value);
}

function getValueByPath(value: unknown, path: string[]): unknown {
  let current: unknown = value;

  for (const segment of path) {
    if (Array.isArray(current) && isIndex(segment)) {
      current = current[Number(segment)];
      continue;
    }

    if (isRecord(current)) {
      current = current[segment];
      continue;
    }

    return undefined;
  }

  return current;
}

function compareValues(
  left: unknown,
  right: unknown,
  path: string[],
  changedPaths: Set<string>
): void {
  if (deepCompare(left, right)) {
    return;
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    const leftArray = Array.isArray(left) ? left : [];
    const rightArray = Array.isArray(right) ? right : [];
    const maxLength = Math.max(leftArray.length, rightArray.length);

    for (let index = 0; index < maxLength; index += 1) {
      const nextPath = [...path, String(index)];
      if (index >= leftArray.length || index >= rightArray.length) {
        changedPaths.add(nextPath.join("."));
        continue;
      }

      compareValues(leftArray[index], rightArray[index], nextPath, changedPaths);
    }

    return;
  }

  if (isRecord(left) || isRecord(right)) {
    const leftObject = isRecord(left) ? left : {};
    const rightObject = isRecord(right) ? right : {};
    const keys = new Set([...Object.keys(leftObject), ...Object.keys(rightObject)]);

    for (const key of keys) {
      const hasLeft = Object.prototype.hasOwnProperty.call(leftObject, key);
      const hasRight = Object.prototype.hasOwnProperty.call(rightObject, key);
      const nextPath = [...path, key];

      if (!hasLeft || !hasRight) {
        changedPaths.add(nextPath.join("."));
        continue;
      }

      compareValues(leftObject[key], rightObject[key], nextPath, changedPaths);
    }

    return;
  }

  changedPaths.add(path.join("."));
}

/**
 * Deeply compare two values using structural equality.
 * @param a - Left-hand value.
 * @param b - Right-hand value.
 */
export function deepCompare(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }

    for (let index = 0; index < a.length; index += 1) {
      if (!deepCompare(a[index], b[index])) {
        return false;
      }
    }

    return true;
  }

  if (isRecord(a) && isRecord(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) {
      return false;
    }

    for (const key of keysA) {
      if (!Object.prototype.hasOwnProperty.call(b, key)) {
        return false;
      }

      if (!deepCompare(a[key], b[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
}

/**
 * Return dot-notation paths for changed fields between two values.
 * @param obj1 - Previous value.
 * @param obj2 - New value.
 */
export function getChangedPaths(obj1: unknown, obj2: unknown): string[] {
  if (deepCompare(obj1, obj2)) {
    return [];
  }

  const changedPaths = new Set<string>();
  compareValues(obj1, obj2, [], changedPaths);

  return Array.from(changedPaths).filter((path) => path.length > 0);
}

function inferTypeFromPathAndValue(
  path: string,
  oldSpec: unknown,
  newSpec: unknown
): ComponentType {
  const segments = path.split(".").filter(Boolean);
  const root = segments[0] ?? "";
  const item = getComponentCandidate(root, segments, oldSpec, newSpec);

  if (root === "entities" || root === "entitySchemas") {
    return ComponentType.ENTITY;
  }

  if (root === "pages") {
    return ComponentType.PAGE;
  }

  if (root === "workflows") {
    return ComponentType.WORKFLOW;
  }

  if (root === "apiRoutes" || root === "routes") {
    return ComponentType.API_ROUTE;
  }

  if (root === "layouts") {
    return ComponentType.LAYOUT;
  }

  if (root === "components") {
    return ComponentType.COMPONENT;
  }

  if (root === "files") {
    const fileType = isRecord(item) ? String(item.fileType ?? "") : "";
    if (fileType === "page") {
      return ComponentType.PAGE;
    }
    if (fileType === "api-route") {
      return ComponentType.API_ROUTE;
    }
    if (fileType === "workflow") {
      return ComponentType.WORKFLOW;
    }
    if (fileType === "component") {
      return ComponentType.COMPONENT;
    }
    if (fileType === "layout") {
      return ComponentType.LAYOUT;
    }
  }

  if (path.toLowerCase().includes("layout")) {
    return ComponentType.LAYOUT;
  }

  if (path.toLowerCase().includes("page")) {
    return ComponentType.PAGE;
  }

  if (path.toLowerCase().includes("route")) {
    return ComponentType.API_ROUTE;
  }

  return ComponentType.COMPONENT;
}

function getComponentCandidate(
  root: string,
  segments: string[],
  oldSpec: unknown,
  newSpec: unknown
): unknown {
  const candidatePath = segments.slice(0, root === "files" || root === "entities" || root === "pages" || root === "workflows" || root === "components" || root === "layouts" || root === "apiRoutes" || root === "entitySchemas" ? 2 : 1);
  return getValueByPath(newSpec, candidatePath) ?? getValueByPath(oldSpec, candidatePath);
}

function getComponentId(
  path: string,
  oldSpec: unknown,
  newSpec: unknown
): string {
  const segments = path.split(".").filter(Boolean);
  const root = segments[0] ?? "";
  const rootItemPath = segments.slice(0, root === "files" || root === "entities" || root === "pages" || root === "workflows" || root === "components" || root === "layouts" || root === "apiRoutes" || root === "entitySchemas" ? 2 : 1);
  const candidate = getValueByPath(newSpec, rootItemPath) ?? getValueByPath(oldSpec, rootItemPath);

  if (isRecord(candidate)) {
    if (typeof candidate.id === "string" && candidate.id.length > 0) {
      return candidate.id;
    }
    if (typeof candidate.name === "string" && candidate.name.length > 0) {
      return candidate.name;
    }
    if (typeof candidate.route === "string" && candidate.route.length > 0) {
      return candidate.route;
    }
    if (typeof candidate.filePath === "string" && candidate.filePath.length > 0) {
      return candidate.filePath;
    }
    if (typeof candidate.nameSlug === "string" && candidate.nameSlug.length > 0) {
      return candidate.nameSlug;
    }
  }

  if (segments.length > 1) {
    return `${root}.${segments[1]}`;
  }

  return root || path;
}

/**
 * Detect changed application components between two specs.
 * @param oldSpec - Previous application spec.
 * @param newSpec - Updated application spec.
 */
export function detectSpecChanges(
  oldSpec: unknown,
  newSpec: unknown
): ChangedComponent[] {
  if (deepCompare(oldSpec, newSpec)) {
    return [];
  }

  const changedPaths = getChangedPaths(oldSpec, newSpec);
  const changes = new Map<string, ChangedComponent>();

  for (const path of changedPaths) {
    const id = getComponentId(path, oldSpec, newSpec);
    const type = inferTypeFromPathAndValue(path, oldSpec, newSpec);
    const oldValue = getValueByPath(oldSpec, path.split("."));
    const newValue = getValueByPath(newSpec, path.split("."));

    const changeType: ChangedComponent["changeType"] =
      oldValue === undefined && newValue !== undefined
        ? "added"
        : newValue === undefined && oldValue !== undefined
          ? "removed"
          : "modified";

    const existing = changes.get(id);
    if (!existing) {
      changes.set(id, { id, type, changeType });
      continue;
    }

    if (existing.changeType === "modified") {
      continue;
    }

    if (changeType === "modified") {
      changes.set(id, { id, type, changeType });
    }
  }

  return Array.from(changes.values());
}

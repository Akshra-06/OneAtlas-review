import type { GeneratedFile } from "../renderer/page-renderer";

/** Captured preview snapshot. */
export interface PreviewSnapshot {
  files: GeneratedFile[];
  createdAt: string;
}

class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

/**
 * Create a preview snapshot from generated files.
 * @param files - Files to snapshot.
 */
export async function createSnapshot(
  files: GeneratedFile[]
): Promise<PreviewSnapshot> {
  // TODO: Implement in Phase 2
  throw new NotImplementedError(
    `createSnapshot is not implemented yet for ${files.length} file(s).`
  );
}

/**
 * Restore a preview snapshot.
 * @param snapshot - Snapshot to restore.
 */
export async function restoreSnapshot(snapshot: PreviewSnapshot): Promise<void> {
  void snapshot;
  // TODO: Implement in Phase 2
  throw new NotImplementedError("restoreSnapshot is not implemented yet.");
}

// =============================================================================
// apps/api/src/services/storage.service.ts
// Local sandbox-backed storage service.
// =============================================================================

import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export interface StorageObjectInput {
  orgId: string;
  bucket: string;
  key: string;
  value: string | Uint8Array;
  contentType?: string;
}

export interface StorageLookupInput {
  orgId: string;
  bucket: string;
  key: string;
}

export interface StoredObject {
  orgId: string;
  bucket: string;
  key: string;
  value: string;
  contentType?: string;
  size: number;
  updatedAt: string;
}

export interface StorageObjectSummary {
  bucket: string;
  key: string;
  size: number;
  updatedAt: string;
}

const STORAGE_ROOT = path.resolve(process.cwd(), "../../sandbox/storage");

function safeSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function objectPath(input: StorageLookupInput): string {
  const root = path.join(
    STORAGE_ROOT,
    safeSegment(input.orgId),
    safeSegment(input.bucket)
  );
  const resolved = path.resolve(root, input.key);

  if (!resolved.startsWith(path.resolve(root) + path.sep)) {
    throw new Error("Invalid storage key");
  }

  return resolved;
}

export class StorageService {
  async putObject(input: StorageObjectInput): Promise<StorageObjectSummary> {
    const target = objectPath(input);
    await mkdir(path.dirname(target), { recursive: true });

    const value =
      typeof input.value === "string"
        ? input.value
        : Buffer.from(input.value).toString("base64");

    await writeFile(
      target,
      JSON.stringify(
        {
          value,
          contentType: input.contentType,
          encoded: typeof input.value === "string" ? "utf8" : "base64",
        },
        null,
        2
      ),
      "utf8"
    );

    const fileStat = await stat(target);
    return {
      bucket: input.bucket,
      key: input.key,
      size: fileStat.size,
      updatedAt: fileStat.mtime.toISOString(),
    };
  }

  async getObject(input: StorageLookupInput): Promise<StoredObject> {
    const target = objectPath(input);
    const [raw, fileStat] = await Promise.all([readFile(target, "utf8"), stat(target)]);
    const parsed = JSON.parse(raw) as {
      value?: unknown;
      contentType?: unknown;
    };

    return {
      orgId: input.orgId,
      bucket: input.bucket,
      key: input.key,
      value: typeof parsed.value === "string" ? parsed.value : "",
      contentType:
        typeof parsed.contentType === "string" ? parsed.contentType : undefined,
      size: fileStat.size,
      updatedAt: fileStat.mtime.toISOString(),
    };
  }

  async deleteObject(input: StorageLookupInput): Promise<void> {
    await rm(objectPath(input), { force: true });
  }

  async listObjects(
    orgId: string,
    bucket: string
  ): Promise<StorageObjectSummary[]> {
    const root = path.join(STORAGE_ROOT, safeSegment(orgId), safeSegment(bucket));

    try {
      const entries = await readdir(root, {
        recursive: true,
        withFileTypes: true,
      });
      const files = entries.filter((entry) => entry.isFile());

      return Promise.all(
        files.map(async (entry) => {
          const parentPath = entry.parentPath ?? root;
          const fullPath = path.join(parentPath, entry.name);
          const fileStat = await stat(fullPath);
          const key = path.relative(root, fullPath).replace(/\\/g, "/");

          return {
            bucket,
            key,
            size: fileStat.size,
            updatedAt: fileStat.mtime.toISOString(),
          };
        })
      );
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        return [];
      }

      throw error;
    }
  }
}

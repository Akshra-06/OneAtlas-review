// =============================================================================
// apps/api/src/services/storage.service.ts
// Placeholder storage service for the empty storage-engine package.
// =============================================================================

class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

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

export class StorageService {
  private fail(method: string): never {
    throw new NotImplementedError(
      `Storage service method ${method} is not implemented yet. The storage-engine package is a placeholder.`
    );
  }

  async putObject(_input: StorageObjectInput): Promise<never> {
    return this.fail("putObject");
  }

  async getObject(_input: StorageLookupInput): Promise<never> {
    return this.fail("getObject");
  }

  async deleteObject(_input: StorageLookupInput): Promise<never> {
    return this.fail("deleteObject");
  }

  async listObjects(
    _orgId: string,
    _bucket: string
  ): Promise<never> {
    return this.fail("listObjects");
  }
}

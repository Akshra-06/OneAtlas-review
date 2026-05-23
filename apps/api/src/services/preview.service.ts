// =============================================================================
// apps/api/src/services/preview.service.ts
// Placeholder preview service for the empty preview-engine package.
// =============================================================================

class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

export interface PreviewRequest {
  orgId: string;
  projectId: string;
}

export class PreviewService {
  private fail(method: string): never {
    throw new NotImplementedError(
      `Preview service method ${method} is not implemented yet. The preview-engine package is a placeholder.`
    );
  }

  async startPreview(_request: PreviewRequest): Promise<never> {
    return this.fail("startPreview");
  }

  async stopPreview(_request: PreviewRequest): Promise<never> {
    return this.fail("stopPreview");
  }

  async getPreviewStatus(_request: PreviewRequest): Promise<never> {
    return this.fail("getPreviewStatus");
  }

  async validatePreview(_request: PreviewRequest): Promise<never> {
    return this.fail("validatePreview");
  }
}

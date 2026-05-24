/** Minimal generated file shape used by the preview stubs. */
export interface GeneratedFile {
  filePath: string;
  content: string;
  fileType: string;
  entityName?: string;
}

/** Result returned by the preview page renderer. */
export interface PreviewRenderResult {
  renderedFiles: GeneratedFile[];
  entryPoint: string;
  success: boolean;
}

class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

/**
 * Render generated files into a previewable page snapshot.
 * @param files - Generated application files.
 */
export async function renderPage(
  files: GeneratedFile[]
): Promise<PreviewRenderResult> {
  // TODO: Implement in Phase 2
  throw new NotImplementedError(
    `renderPage is not implemented yet. Received ${files.length} generated file(s).`
  );
}

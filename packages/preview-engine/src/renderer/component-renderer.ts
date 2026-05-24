import type { GeneratedFile } from "./page-renderer";

class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

/**
 * Render a generated component for preview.
 * @param file - Generated component file.
 */
export async function renderComponent(file: GeneratedFile): Promise<string> {
  // TODO: Implement in Phase 2
  throw new NotImplementedError(
    `renderComponent is not implemented yet for ${file.filePath}.`
  );
}

/** In-memory sandbox descriptor for future iframe preview isolation. */
export interface IframeSandbox {
  id: string;
}

class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

/**
 * Create a preview iframe sandbox.
 */
export async function createSandbox(): Promise<IframeSandbox> {
  // TODO: Implement in Phase 2
  throw new NotImplementedError("createSandbox is not implemented yet.");
}

/**
 * Destroy a preview iframe sandbox.
 * @param sandbox - Sandbox instance to destroy.
 */
export async function destroySandbox(sandbox: IframeSandbox): Promise<void> {
  void sandbox;
  // TODO: Implement in Phase 2
  throw new NotImplementedError("destroySandbox is not implemented yet.");
}

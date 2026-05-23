/** Runtime sandbox descriptor for future execution isolation. */
export interface RuntimeSandbox {
  id: string;
}

class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

/**
 * Create a runtime sandbox.
 */
export async function createRuntimeSandbox(): Promise<RuntimeSandbox> {
  // TODO: Implement in Phase 2
  throw new NotImplementedError(
    "createRuntimeSandbox is not implemented yet."
  );
}

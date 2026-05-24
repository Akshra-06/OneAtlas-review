class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

/**
 * Enable hot reload for the preview sandbox.
 */
export async function enableHotReload(): Promise<void> {
  // TODO: Implement in Phase 2
  throw new NotImplementedError("enableHotReload is not implemented yet.");
}

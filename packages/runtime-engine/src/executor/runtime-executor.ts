/** Runtime execution request for future runtime engine implementation. */
export interface RuntimeExecutionRequest {
  route: string;
  method: string;
  body?: string;
}

/** Runtime execution response placeholder. */
export interface RuntimeExecutionResult {
  status: number;
  body: string;
}

class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

/**
 * Execute a runtime request.
 * @param request - Runtime execution request.
 */
export async function executeRuntime(
  request: RuntimeExecutionRequest
): Promise<RuntimeExecutionResult> {
  void request;
  // TODO: Implement in Phase 2
  throw new NotImplementedError("executeRuntime is not implemented yet.");
}

import type { RuntimeExecutionRequest, RuntimeExecutionResult } from "../executor/runtime-executor";

class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

/**
 * Route a runtime request to the appropriate execution path.
 * @param request - Runtime execution request.
 */
export async function routeRequest(
  request: RuntimeExecutionRequest
): Promise<RuntimeExecutionResult> {
  void request;
  // TODO: Implement in Phase 2
  throw new NotImplementedError("routeRequest is not implemented yet.");
}

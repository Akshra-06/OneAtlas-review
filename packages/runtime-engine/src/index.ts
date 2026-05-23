export { executeRuntime, type RuntimeExecutionRequest, type RuntimeExecutionResult } from "./executor/runtime-executor";
export { createRuntimeSandbox, type RuntimeSandbox } from "./sandbox/runtime-sandbox";
export { routeRequest } from "./router/runtime-router";

/** Runtime engine lifecycle status. */
export enum RuntimeEngineStatus {
	NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
	READY = "READY",
	ERROR = "ERROR",
}

/** Runtime engine package version. */
export const VERSION = "0.1.0-stub";


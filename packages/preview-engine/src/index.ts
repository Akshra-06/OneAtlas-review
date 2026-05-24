export { renderPage, type PreviewRenderResult } from "./renderer/page-renderer";
export { renderComponent } from "./renderer/component-renderer";
export { createSandbox, destroySandbox, type IframeSandbox } from "./sandbox/iframe-sandbox";
export { enableHotReload } from "./sandbox/hot-reload";
export { createSnapshot, restoreSnapshot, type PreviewSnapshot } from "./snapshot/snapshot-manager";

/** Preview engine lifecycle status. */
export enum PreviewEngineStatus {
	NOT_IMPLEMENTED = "NOT_IMPLEMENTED",
	READY = "READY",
	ERROR = "ERROR",
}

/** Preview engine package version. */
export const VERSION = "0.1.0-stub";



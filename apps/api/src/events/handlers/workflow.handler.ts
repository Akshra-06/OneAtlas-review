// =============================================================================
// apps/api/src/events/handlers/workflow.handler.ts
// Side effects for workflow events only.
// =============================================================================

import { logger } from "../../lib/logger";
import { appEvents, type WorkflowEventPayload } from "../emitter";
import { sendWorkflowEvent } from "../../realtime/channels/workflow.channel";

let registered = false;

function handleWorkflowEvent(
  eventName: "workflow.started" | "workflow.completed" | "workflow.failed",
  payload: WorkflowEventPayload
): void {
  logger.info(`event.${eventName}`, payload);
  void sendWorkflowEvent(eventName, payload);
}

export function registerWorkflowHandlers(): void {
  if (registered) return;
  registered = true;

  appEvents.on("workflow.started", (payload) => handleWorkflowEvent("workflow.started", payload));
  appEvents.on("workflow.completed", (payload) => handleWorkflowEvent("workflow.completed", payload));
  appEvents.on("workflow.failed", (payload) => handleWorkflowEvent("workflow.failed", payload));
}

registerWorkflowHandlers();

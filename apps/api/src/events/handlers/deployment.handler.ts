// =============================================================================
// apps/api/src/events/handlers/deployment.handler.ts
// Side effects for deployment events only.
// =============================================================================

import { logger } from "../../lib/logger";
import { appEvents, type DeploymentEventPayload } from "../emitter";
import { sendBuilderEvent } from "../../realtime/channels/builder.channel";

let registered = false;

function handleDeploymentEvent(
  eventName: "deployment.started" | "deployment.completed" | "deployment.failed",
  payload: DeploymentEventPayload
): void {
  logger.info(`event.${eventName}`, payload);
  void sendBuilderEvent(eventName, payload);
}

export function registerDeploymentHandlers(): void {
  if (registered) return;
  registered = true;

  appEvents.on("deployment.started", (payload) => handleDeploymentEvent("deployment.started", payload));
  appEvents.on("deployment.completed", (payload) => handleDeploymentEvent("deployment.completed", payload));
  appEvents.on("deployment.failed", (payload) => handleDeploymentEvent("deployment.failed", payload));
}

registerDeploymentHandlers();

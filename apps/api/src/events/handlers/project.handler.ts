// =============================================================================
// apps/api/src/events/handlers/project.handler.ts
// Side effects for project events only.
// =============================================================================

import { logger } from "../../lib/logger";
import { appEvents, type ProjectEventPayload } from "../emitter";
import { sendProjectEvent } from "../../realtime/channels/project.channel";

let registered = false;

function handleProjectEvent(eventName: "project.created" | "project.updated" | "project.deleted", payload: ProjectEventPayload): void {
  logger.info(`event.${eventName}`, payload);
  void sendProjectEvent(eventName, payload);
}

export function registerProjectHandlers(): void {
  if (registered) return;
  registered = true;

  appEvents.on("project.created", (payload) => handleProjectEvent("project.created", payload));
  appEvents.on("project.updated", (payload) => handleProjectEvent("project.updated", payload));
  appEvents.on("project.deleted", (payload) => handleProjectEvent("project.deleted", payload));
}

registerProjectHandlers();

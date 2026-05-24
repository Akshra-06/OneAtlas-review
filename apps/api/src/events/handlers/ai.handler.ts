// =============================================================================
// apps/api/src/events/handlers/ai.handler.ts
// Side effects for AI events only.
// =============================================================================

import { logger } from "../../lib/logger";
import { appEvents, type AiEventPayload } from "../emitter";
import { sendBuilderEvent } from "../../realtime/channels/builder.channel";

let registered = false;

function handleAiEvent(
  eventName: "ai.started" | "ai.completed" | "ai.failed",
  payload: AiEventPayload
): void {
  logger.info(`event.${eventName}`, payload);
  void sendBuilderEvent(eventName, payload);
}

export function registerAiHandlers(): void {
  if (registered) return;
  registered = true;

  appEvents.on("ai.started", (payload) => handleAiEvent("ai.started", payload));
  appEvents.on("ai.completed", (payload) => handleAiEvent("ai.completed", payload));
  appEvents.on("ai.failed", (payload) => handleAiEvent("ai.failed", payload));
}

registerAiHandlers();

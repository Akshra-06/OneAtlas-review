// =============================================================================
// apps/api/src/realtime/channels/builder.channel.ts
// SSE helper functions for build/deployment/AI events.
// =============================================================================

import type { AiEventPayload, DeploymentEventPayload } from "../../events/emitter";
import { createSseResponse, publishRealtimeEvent } from "../server";

export type BuilderChannelEvent =
  | "deployment.started"
  | "deployment.completed"
  | "deployment.failed"
  | "ai.started"
  | "ai.completed"
  | "ai.failed";

export function openBuilderStream(signal?: AbortSignal): Response {
  return createSseResponse("builder", { signal });
}

export async function sendBuilderEvent(
  event: BuilderChannelEvent,
  data: DeploymentEventPayload | AiEventPayload
): Promise<void> {
  await publishRealtimeEvent("builder", event, data);
}

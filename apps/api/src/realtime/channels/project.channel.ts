// =============================================================================
// apps/api/src/realtime/channels/project.channel.ts
// SSE helper functions for project events.
// =============================================================================

import type { ProjectEventPayload } from "../../events/emitter";
import { createSseResponse, publishRealtimeEvent } from "../server";

export type ProjectChannelEvent =
  | "project.created"
  | "project.updated"
  | "project.deleted";

export function openProjectStream(signal?: AbortSignal): Response {
  return createSseResponse("project", { signal });
}

export async function sendProjectEvent(
  event: ProjectChannelEvent,
  data: ProjectEventPayload
): Promise<void> {
  await publishRealtimeEvent("project", event, data);
}

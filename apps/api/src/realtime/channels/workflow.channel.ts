// =============================================================================
// apps/api/src/realtime/channels/workflow.channel.ts
// SSE helper functions for workflow events.
// =============================================================================

import type { WorkflowEventPayload } from "../../events/emitter";
import { createSseResponse, publishRealtimeEvent } from "../server";

export type WorkflowChannelEvent =
  | "workflow.started"
  | "workflow.completed"
  | "workflow.failed";

export function openWorkflowStream(signal?: AbortSignal): Response {
  return createSseResponse("workflow", { signal });
}

export async function sendWorkflowEvent(
  event: WorkflowChannelEvent,
  data: WorkflowEventPayload
): Promise<void> {
  await publishRealtimeEvent("workflow", event, data);
}

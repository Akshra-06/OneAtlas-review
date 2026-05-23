// =============================================================================
// apps/api/src/events/emitter.ts
// Typed EventEmitter wrapper for application events.
// =============================================================================

import { EventEmitter } from "node:events";
import type { JsonObject } from "../realtime/server";

export interface ProjectEventPayload extends JsonObject {
  orgId: string;
  projectId: string;
  userId: string;
  name?: string;
  metadata?: JsonObject;
}

export interface DeploymentEventPayload extends JsonObject {
  orgId: string;
  projectId: string;
  deploymentId: string;
  userId: string;
  status?: string;
  metadata?: JsonObject;
}

export interface WorkflowEventPayload extends JsonObject {
  orgId: string;
  projectId: string;
  workflowId: string;
  userId: string;
  status?: string;
  metadata?: JsonObject;
}

export interface AiEventPayload extends JsonObject {
  orgId: string;
  projectId: string;
  userId: string;
  provider?: string;
  model?: string;
  metadata?: JsonObject;
}

export interface AppEventMap {
  "project.created": ProjectEventPayload;
  "project.updated": ProjectEventPayload;
  "project.deleted": ProjectEventPayload;
  "deployment.started": DeploymentEventPayload;
  "deployment.completed": DeploymentEventPayload;
  "deployment.failed": DeploymentEventPayload;
  "workflow.started": WorkflowEventPayload;
  "workflow.completed": WorkflowEventPayload;
  "workflow.failed": WorkflowEventPayload;
  "ai.started": AiEventPayload;
  "ai.completed": AiEventPayload;
  "ai.failed": AiEventPayload;
}

export type AppEventName = keyof AppEventMap;
export type AppEventPayload<K extends AppEventName> = AppEventMap[K];
export type AppEventListener<K extends AppEventName> = (
  payload: AppEventMap[K]
) => void | Promise<void>;

class TypedEventEmitter extends EventEmitter {
  override on<K extends AppEventName>(
    eventName: K,
    listener: AppEventListener<K>
  ): this {
    return super.on(eventName, listener);
  }

  override once<K extends AppEventName>(
    eventName: K,
    listener: AppEventListener<K>
  ): this {
    return super.once(eventName, listener);
  }

  override off<K extends AppEventName>(
    eventName: K,
    listener: AppEventListener<K>
  ): this {
    return super.off(eventName, listener);
  }

  override emit<K extends AppEventName>(
    eventName: K,
    payload: AppEventMap[K]
  ): boolean {
    return super.emit(eventName, payload);
  }
}

export const appEvents = new TypedEventEmitter();

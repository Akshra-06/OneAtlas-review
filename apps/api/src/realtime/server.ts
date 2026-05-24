// =============================================================================
// apps/api/src/realtime/server.ts
// SSE realtime hub for App Router route handlers.
// =============================================================================

import { randomUUID } from "node:crypto";
import { publishRealtimeEnvelope } from "./adapters/redis.adapter";

export type RealtimeChannelName = "builder" | "workflow" | "project";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export interface JsonObject {
  [key: string]: JsonValue | undefined;
}

export interface RealtimeEnvelope<TData extends JsonValue = JsonValue> {
  id: string;
  channel: RealtimeChannelName;
  event: string;
  data: TData;
  createdAt: string;
}

interface Subscriber {
  id: string;
  controller: ReadableStreamDefaultController<Uint8Array>;
  heartbeat: ReturnType<typeof setInterval> | null;
}

const encoder = new TextEncoder();
const subscribers = new Map<RealtimeChannelName, Set<Subscriber>>();

function getSubscribers(channel: RealtimeChannelName): Set<Subscriber> {
  const existing = subscribers.get(channel);
  if (existing) {
    return existing;
  }

  const created = new Set<Subscriber>();
  subscribers.set(channel, created);
  return created;
}

function encodeEnvelope(envelope: RealtimeEnvelope): Uint8Array {
  return encoder.encode(
    `id: ${envelope.id}\nevent: ${envelope.event}\ndata: ${JSON.stringify(envelope)}\n\n`
  );
}

function encodeComment(comment: string): Uint8Array {
  return encoder.encode(`: ${comment}\n\n`);
}

function registerSubscriber(
  channel: RealtimeChannelName,
  controller: ReadableStreamDefaultController<Uint8Array>,
  heartbeatMs: number
): Subscriber {
  const subscriber: Subscriber = {
    id: randomUUID(),
    controller,
    heartbeat: null,
  };

  getSubscribers(channel).add(subscriber);

  if (heartbeatMs > 0) {
    subscriber.heartbeat = setInterval(() => {
      try {
        controller.enqueue(encodeComment("heartbeat"));
      } catch {
        closeSubscriber(channel, subscriber);
      }
    }, heartbeatMs);
  }

  return subscriber;
}

function closeSubscriber(channel: RealtimeChannelName, subscriber: Subscriber): void {
  const channelSubscribers = subscribers.get(channel);
  if (channelSubscribers) {
    channelSubscribers.delete(subscriber);
    if (channelSubscribers.size === 0) {
      subscribers.delete(channel);
    }
  }

  if (subscriber.heartbeat) {
    clearInterval(subscriber.heartbeat);
    subscriber.heartbeat = null;
  }
}

export interface CreateSseResponseOptions {
  signal?: AbortSignal;
  heartbeatMs?: number;
  headers?: HeadersInit;
}

export function createSseResponse(
  channel: RealtimeChannelName,
  options: CreateSseResponseOptions = {}
): Response {
  const heartbeatMs = options.heartbeatMs ?? 25_000;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const subscriber = registerSubscriber(channel, controller, heartbeatMs);

      controller.enqueue(
        encodeEnvelope({
          id: subscriber.id,
          channel,
          event: "connected",
          data: { channel },
          createdAt: new Date().toISOString(),
        })
      );

      const abort = (): void => {
        closeSubscriber(channel, subscriber);
        try {
          controller.close();
        } catch {
          // Ignore double-close on already finished streams.
        }
      };

      if (options.signal) {
        if (options.signal.aborted) {
          abort();
          return;
        }

        options.signal.addEventListener("abort", abort, { once: true });
      }
    },
    cancel() {
      // The subscriber is already cleaned up via abort or connection close.
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      ...options.headers,
    },
  });
}

export async function publishRealtimeEvent<TData extends JsonValue>(
  channel: RealtimeChannelName,
  event: string,
  data: TData
): Promise<void> {
  const envelope: RealtimeEnvelope<TData> = {
    id: randomUUID(),
    channel,
    event,
    data,
    createdAt: new Date().toISOString(),
  };

  const channelSubscribers = subscribers.get(channel);
  if (channelSubscribers) {
    for (const subscriber of channelSubscribers) {
      try {
        subscriber.controller.enqueue(encodeEnvelope(envelope));
      } catch {
        closeSubscriber(channel, subscriber);
      }
    }
  }

  await publishRealtimeEnvelope(channel, envelope);
}

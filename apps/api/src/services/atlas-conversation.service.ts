// =============================================================================
// apps/api/src/services/atlas-conversation.store.ts
//
// Stores and retrieves Atlas AI conversation history per project.
// Uses Redis (Upstash) with an in-memory fallback.
// TTL: 24 hours — conversations expire after a day of inactivity.
// =============================================================================

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_HISTORY = 20;              // keep last 20 messages to stay within context limits

// In-memory fallback in case Redis is unavailable
const memoryStore = new Map<string, ChatMessage[]>();

function conversationKey(projectId: string): string {
  return `atlas:chat:${projectId}`;
}

export const atlasConversationStore = {
  async get(projectId: string): Promise<ChatMessage[]> {
    try {
      const result = await redis.get<ChatMessage[]>(conversationKey(projectId));
      return result ?? [];
    } catch {
      return memoryStore.get(projectId) ?? [];
    }
  },

  async append(projectId: string, message: ChatMessage): Promise<ChatMessage[]> {
    const history = await this.get(projectId);
    const updated = [...history, message].slice(-MAX_HISTORY);

    try {
      await redis.set(conversationKey(projectId), updated, { px: TTL_MS });
    } catch {
      memoryStore.set(projectId, updated);
    }

    return updated;
  },

  async clear(projectId: string): Promise<void> {
    try {
      await redis.del(conversationKey(projectId));
    } catch {
      memoryStore.delete(projectId);
    }
  },
};
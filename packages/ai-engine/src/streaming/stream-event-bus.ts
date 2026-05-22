/**
 * Stream Event Bus
 * 
 * Central event bus for streaming generation events.
 * Handles event subscription, emission, and broadcasting.
 */

import { EventEmitter } from 'events';
import { logger } from '../shared/utils/logger';

export type StreamEventType =
  | 'generation_started'
  | 'understanding_complete'
  | 'entities_generated'
  | 'workflows_generated'
  | 'components_generated'
  | 'validation_started'
  | 'repair_applied'
  | 'preview_ready'
  | 'generation_completed'
  | 'generation_failed'
  | 'generation_cancelled'
  | 'generation_progress';

export interface StreamEvent {
  type: StreamEventType;
  sessionId: string;
  timestamp: number;
  data: unknown;
  metadata?: Record<string, unknown>;
}

export interface EventSubscription {
  sessionId: string;
  eventType: StreamEventType;
  callback: (event: StreamEvent) => void;
}

/**
 * Stream Event Bus
 * 
 * Manages event subscription and emission for streaming generation.
 * Extends EventEmitter for efficient event handling.
 */
export class StreamEventBus extends EventEmitter {
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private eventHistory: Map<string, StreamEvent[]> = new Map();
  private maxHistorySize = 100;

  constructor() {
    super();
    this.setMaxListeners(1000); // Support many concurrent sessions
  }

  /**
   * Subscribe to events for a session
   */
  subscribe(sessionId: string, eventType: StreamEventType, callback: (event: StreamEvent) => void): () => void {
    const subscription: EventSubscription = {
      sessionId,
      eventType,
      callback,
    };

    if (!this.subscriptions.has(sessionId)) {
      this.subscriptions.set(sessionId, []);
    }

    this.subscriptions.get(sessionId)!.push(subscription);

    // Add event listener
    this.on(eventType, callback);

    logger.info('StreamEventBus', 'SUBSCRIPTION_ADDED', 'Event subscription added', {
      sessionId,
      eventType,
    });

    // Return unsubscribe function
    return () => {
      this.unsubscribe(sessionId, eventType, callback);
    };
  }

  /**
   * Unsubscribe from events
   */
  unsubscribe(sessionId: string, eventType: StreamEventType, callback: (event: StreamEvent) => void): void {
    const sessionSubs = this.subscriptions.get(sessionId);
    if (!sessionSubs) return;

    const index = sessionSubs.findIndex(
      sub => sub.eventType === eventType && sub.callback === callback
    );

    if (index !== -1) {
      sessionSubs.splice(index, 1);
      this.off(eventType, callback);

      logger.info('StreamEventBus', 'SUBSCRIPTION_REMOVED', 'Event subscription removed', {
        sessionId,
        eventType,
      });
    }

    // Clean up empty session subscriptions
    if (sessionSubs.length === 0) {
      this.subscriptions.delete(sessionId);
    }
  }

  /**
   * Unsubscribe all events for a session
   */
  unsubscribeAll(sessionId: string): void {
    const sessionSubs = this.subscriptions.get(sessionId);
    if (!sessionSubs) return;

    for (const sub of sessionSubs) {
      this.off(sub.eventType, sub.callback);
    }

    this.subscriptions.delete(sessionId);

    logger.info('StreamEventBus', 'ALL_SUBSCRIPTIONS_REMOVED', 'All subscriptions removed for session', {
      sessionId,
    });
  }

  /**
   * Emit an event
   */
  emitEvent(event: StreamEvent): void {
    // Add to history
    this.addToHistory(event);

    // Emit to all listeners
    super.emit(event.type, event);

    logger.info('StreamEventBus', 'EVENT_EMITTED', 'Event emitted', {
      type: event.type,
      sessionId: event.sessionId,
    });
  }

  /**
   * Emit a typed event
   */
  emitTyped<T = unknown>(
    eventType: StreamEventType,
    sessionId: string,
    data: T,
    metadata?: Record<string, unknown>
  ): void {
    const event: StreamEvent = {
      type: eventType,
      sessionId,
      timestamp: Date.now(),
      data,
      metadata,
    };

    this.emitEvent(event);
  }

  /**
   * Add event to history
   */
  private addToHistory(event: StreamEvent): void {
    if (!this.eventHistory.has(event.sessionId)) {
      this.eventHistory.set(event.sessionId, []);
    }

    const history = this.eventHistory.get(event.sessionId)!;
    history.push(event);

    // Limit history size
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
  }

  /**
   * Get event history for a session
   */
  getHistory(sessionId: string): StreamEvent[] {
    return this.eventHistory.get(sessionId) || [];
  }

  /**
   * Clear event history for a session
   */
  clearHistory(sessionId: string): void {
    this.eventHistory.delete(sessionId);

    logger.info('StreamEventBus', 'HISTORY_CLEARED', 'Event history cleared', {
      sessionId,
    });
  }

  /**
   * Get active subscription count
   */
  getSubscriptionCount(): number {
    let count = 0;
    for (const subs of this.subscriptions.values()) {
      count += subs.length;
    }
    return count;
  }

  /**
   * Get subscription count for a session
   */
  getSessionSubscriptionCount(sessionId: string): number {
    return this.subscriptions.get(sessionId)?.length || 0;
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSubscriptions: number;
    activeSessions: number;
    totalEventsEmitted: number;
    eventHistorySize: number;
  } {
    const totalSubscriptions = this.getSubscriptionCount();
    const activeSessions = this.subscriptions.size;
    const totalEventsEmitted = Array.from(this.eventHistory.values()).reduce(
      (sum, history) => sum + history.length,
      0
    );
    const eventHistorySize = this.eventHistory.size;

    return {
      totalSubscriptions,
      activeSessions,
      totalEventsEmitted,
      eventHistorySize,
    };
  }

  /**
   * Clear all data (for testing)
   */
  clearAll(): void {
    this.subscriptions.clear();
    this.eventHistory.clear();
    this.removeAllListeners();

    logger.info('StreamEventBus', 'ALL_CLEARED', 'All data cleared');
  }
}

export const streamEventBus = new StreamEventBus();

/**
 * Diagnostics Stream
 * 
 * Streams live diagnostics and error reports.
 * Provides real-time error tracking and reporting.
 */

import { logger } from '../../shared/utils/logger';

export interface DiagnosticEvent {
  id: string;
  sessionId: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: number;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface DiagnosticsConfig {
  enableAutoStream: boolean;
  maxEvents: number;
  enableAggregation: boolean;
  aggregationWindowMs: number;
}

const DEFAULT_CONFIG: DiagnosticsConfig = {
  enableAutoStream: true,
  maxEvents: 100,
  enableAggregation: false,
  aggregationWindowMs: 1000,
};

/**
 * Diagnostics Stream
 * 
 * Streams live diagnostics:
 * - Real-time error tracking
 * - Error aggregation
 * - Diagnostic reporting
 * - Error severity tracking
 */
export class DiagnosticsStream {
  private config: DiagnosticsConfig;
  private events: Map<string, DiagnosticEvent[]> = new Map();
  private subscribers: Map<string, Set<(event: DiagnosticEvent) => void>> = new Map();
  private aggregationBuffer: Map<string, DiagnosticEvent[]> = new Map();

  constructor(config: Partial<DiagnosticsConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Log a diagnostic event
   */
  log(event: Omit<DiagnosticEvent, 'id' | 'timestamp'>): DiagnosticEvent {
    const diagnosticEvent: DiagnosticEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...event,
    };

    this.addEvent(event.sessionId, diagnosticEvent);

    return diagnosticEvent;
  }

  /**
   * Add an event to the stream
   */
  private addEvent(sessionId: string, event: DiagnosticEvent): void {
    if (!this.events.has(sessionId)) {
      this.events.set(sessionId, []);
    }

    const sessionEvents = this.events.get(sessionId)!;
    sessionEvents.push(event);

    // Enforce max events
    if (sessionEvents.length > this.config.maxEvents) {
      sessionEvents.shift();
    }

    // Aggregate if enabled
    if (this.config.enableAggregation) {
      this.aggregateEvent(sessionId, event);
    }

    // Notify subscribers
    this.notifySubscribers(sessionId, event);

    logger.info('DiagnosticsStream', 'EVENT_LOGGED', 'Diagnostic event logged', {
      sessionId,
      eventId: event.id,
      level: event.level,
      message: event.message,
    });
  }

  /**
   * Aggregate events
   */
  private aggregateEvent(sessionId: string, event: DiagnosticEvent): void {
    if (!this.aggregationBuffer.has(sessionId)) {
      this.aggregationBuffer.set(sessionId, []);
    }

    const buffer = this.aggregationBuffer.get(sessionId)!;
    buffer.push(event);

    // Check if aggregation window has passed
    const now = Date.now();
    const windowStart = now - this.config.aggregationWindowMs;

    // Remove events outside the window
    const filtered = buffer.filter(e => e.timestamp >= windowStart);
    this.aggregationBuffer.set(sessionId, filtered);

    // If we have multiple similar events, aggregate them
    if (filtered.length > 5) {
      this.createAggregatedEvent(sessionId, filtered);
      this.aggregationBuffer.set(sessionId, []);
    }
  }

  /**
   * Create an aggregated event
   */
  private createAggregatedEvent(sessionId: string, events: DiagnosticEvent[]): void {
    const level = this.getHighestLevel(events);
    const aggregatedEvent: DiagnosticEvent = {
      id: crypto.randomUUID(),
      sessionId,
      level,
      message: `Aggregated ${events.length} events`,
      timestamp: Date.now(),
      source: 'aggregator',
      metadata: {
        eventCount: events.length,
        originalEvents: events.map(e => e.id),
      },
    };

    this.addEvent(sessionId, aggregatedEvent);
  }

  /**
   * Get the highest severity level from events
   */
  private getHighestLevel(events: DiagnosticEvent[]): 'info' | 'warning' | 'error' | 'critical' {
    const levelOrder = ['critical', 'error', 'warning', 'info'];

    for (const level of levelOrder) {
      if (events.some(e => e.level === level)) {
        return level as 'info' | 'warning' | 'error' | 'critical';
      }
    }

    return 'info';
  }

  /**
   * Subscribe to diagnostic events
   */
  subscribe(sessionId: string, callback: (event: DiagnosticEvent) => void): () => void {
    if (!this.subscribers.has(sessionId)) {
      this.subscribers.set(sessionId, new Set());
    }

    this.subscribers.get(sessionId)!.add(callback);

    logger.info('DiagnosticsStream', 'SUBSCRIBER_ADDED', 'Subscriber added', {
      sessionId,
    });

    // Return unsubscribe function
    return () => {
      this.unsubscribe(sessionId, callback);
    };
  }

  /**
   * Unsubscribe from diagnostic events
   */
  unsubscribe(sessionId: string, callback: (event: DiagnosticEvent) => void): void {
    const subscribers = this.subscribers.get(sessionId);
    if (subscribers) {
      subscribers.delete(callback);

      logger.info('DiagnosticsStream', 'SUBSCRIBER_REMOVED', 'Subscriber removed', {
        sessionId,
      });
    }
  }

  /**
   * Notify all subscribers for a session
   */
  private notifySubscribers(sessionId: string, event: DiagnosticEvent): void {
    const subscribers = this.subscribers.get(sessionId);
    if (subscribers) {
      for (const callback of subscribers) {
        try {
          callback(event);
        } catch (error) {
          logger.error('DiagnosticsStream', 'SUBSCRIBER_ERROR', 'Subscriber callback error', {
            sessionId,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
  }

  /**
   * Get diagnostic events for a session
   */
  getEvents(sessionId: string): DiagnosticEvent[] {
    return this.events.get(sessionId) || [];
  }

  /**
   * Get events by level for a session
   */
  getEventsByLevel(sessionId: string, level: 'info' | 'warning' | 'error' | 'critical'): DiagnosticEvent[] {
    const events = this.events.get(sessionId);
    if (!events) {
      return [];
    }

    return events.filter(e => e.level === level);
  }

  /**
   * Get all events
   */
  getAllEvents(): DiagnosticEvent[] {
    const allEvents: DiagnosticEvent[] = [];
    for (const events of this.events.values()) {
      allEvents.push(...events);
    }
    return allEvents;
  }

  /**
   * Clear events for a session
   */
  clearEvents(sessionId: string): void {
    this.events.delete(sessionId);
    this.aggregationBuffer.delete(sessionId);

    logger.info('DiagnosticsStream', 'EVENTS_CLEARED', 'Events cleared', {
      sessionId,
    });
  }

  /**
   * Clear all events
   */
  clearAllEvents(): void {
    this.events.clear();
    this.aggregationBuffer.clear();

    logger.info('DiagnosticsStream', 'ALL_EVENTS_CLEARED', 'All events cleared');
  }

  /**
   * Get event count for a session
   */
  getEventCount(sessionId: string): number {
    return this.events.get(sessionId)?.length || 0;
  }

  /**
   * Get error count for a session
   */
  getErrorCount(sessionId: string): number {
    const events = this.events.get(sessionId);
    if (!events) {
      return 0;
    }

    return events.filter(e => e.level === 'error' || e.level === 'critical').length;
  }

  /**
   * Get statistics for a session
   */
  getSessionStatistics(sessionId: string): {
    totalEvents: number;
    infoCount: number;
    warningCount: number;
    errorCount: number;
    criticalCount: number;
  } {
    const events = this.events.get(sessionId);
    if (!events) {
      return {
        totalEvents: 0,
        infoCount: 0,
        warningCount: 0,
        errorCount: 0,
        criticalCount: 0,
      };
    }

    return {
      totalEvents: events.length,
      infoCount: events.filter(e => e.level === 'info').length,
      warningCount: events.filter(e => e.level === 'warning').length,
      errorCount: events.filter(e => e.level === 'error').length,
      criticalCount: events.filter(e => e.level === 'critical').length,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<DiagnosticsConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('DiagnosticsStream', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): DiagnosticsConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    totalEvents: number;
    averageEventsPerSession: number;
    config: DiagnosticsConfig;
  } {
    const totalSessions = this.events.size;
    const totalEvents = Array.from(this.events.values()).reduce(
      (sum, events) => sum + events.length,
      0
    );
    const averageEventsPerSession = totalSessions > 0 ? totalEvents / totalSessions : 0;

    return {
      totalSessions,
      totalEvents,
      averageEventsPerSession,
      config: this.getConfig(),
    };
  }
}

export const diagnosticsStream = new DiagnosticsStream();

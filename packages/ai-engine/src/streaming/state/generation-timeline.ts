/**
 * Generation Timeline
 * 
 * Tracks generation progress over time.
 * Provides timeline visualization for generation steps.
 */

import { logger } from '../../shared/utils/logger';

export interface TimelineEvent {
  id: string;
  sessionId: string;
  step: string;
  timestamp: number;
  duration?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  metadata?: Record<string, unknown>;
}

export interface TimelineConfig {
  enableAutoTracking: boolean;
  maxEvents: number;
  enableDurationTracking: boolean;
}

const DEFAULT_CONFIG: TimelineConfig = {
  enableAutoTracking: true,
  maxEvents: 100,
  enableDurationTracking: true,
};

/**
 * Generation Timeline
 * 
 * Tracks generation progress:
 * - Timeline event tracking
 * - Step duration tracking
 * - Timeline visualization
 * - Progress calculation
 */
export class GenerationTimeline {
  private config: TimelineConfig;
  private timelines: Map<string, TimelineEvent[]> = new Map();
  private currentSteps: Map<string, string> = new Map();
  private stepStartTimes: Map<string, number> = new Map();

  constructor(config: Partial<TimelineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start a step in the timeline
   */
  startStep(sessionId: string, step: string): TimelineEvent {
    const event: TimelineEvent = {
      id: crypto.randomUUID(),
      sessionId,
      step,
      timestamp: Date.now(),
      status: 'in_progress',
    };

    this.addEvent(sessionId, event);
    this.currentSteps.set(sessionId, step);

    if (this.config.enableDurationTracking) {
      this.stepStartTimes.set(`${sessionId}:${step}`, Date.now());
    }

    logger.info('GenerationTimeline', 'STEP_STARTED', 'Step started', {
      sessionId,
      step,
    });

    return event;
  }

  /**
   * Complete a step in the timeline
   */
  completeStep(sessionId: string, step: string, metadata?: Record<string, unknown>): TimelineEvent | null {
    const timeline = this.timelines.get(sessionId);
    if (!timeline) {
      return null;
    }

    const event = timeline.find(e => e.step === step && e.status === 'in_progress');
    if (!event) {
      return null;
    }

    event.status = 'completed';
    event.metadata = metadata;

    if (this.config.enableDurationTracking) {
      const startTime = this.stepStartTimes.get(`${sessionId}:${step}`);
      if (startTime) {
        event.duration = Date.now() - startTime;
        this.stepStartTimes.delete(`${sessionId}:${step}`);
      }
    }

    logger.info('GenerationTimeline', 'STEP_COMPLETED', 'Step completed', {
      sessionId,
      step,
      duration: event.duration,
    });

    return event;
  }

  /**
   * Fail a step in the timeline
   */
  failStep(sessionId: string, step: string, error?: string): TimelineEvent | null {
    const timeline = this.timelines.get(sessionId);
    if (!timeline) {
      return null;
    }

    const event = timeline.find(e => e.step === step && e.status === 'in_progress');
    if (!event) {
      return null;
    }

    event.status = 'failed';
    event.metadata = { error };

    if (this.config.enableDurationTracking) {
      const startTime = this.stepStartTimes.get(`${sessionId}:${step}`);
      if (startTime) {
        event.duration = Date.now() - startTime;
        this.stepStartTimes.delete(`${sessionId}:${step}`);
      }
    }

    logger.error('GenerationTimeline', 'STEP_FAILED', 'Step failed', {
      sessionId,
      step,
      error,
    });

    return event;
  }

  /**
   * Add a custom event to the timeline
   */
  addEvent(sessionId: string, event: TimelineEvent): void {
    if (!this.timelines.has(sessionId)) {
      this.timelines.set(sessionId, []);
    }

    const timeline = this.timelines.get(sessionId)!;
    timeline.push(event);

    // Enforce max events
    if (timeline.length > this.config.maxEvents) {
      timeline.shift();
    }

    logger.info('GenerationTimeline', 'EVENT_ADDED', 'Event added to timeline', {
      sessionId,
      eventId: event.id,
      step: event.step,
    });
  }

  /**
   * Get timeline for a session
   */
  getTimeline(sessionId: string): TimelineEvent[] {
    return this.timelines.get(sessionId) || [];
  }

  /**
   * Get all timelines
   */
  getAllTimelines(): Map<string, TimelineEvent[]> {
    return new Map(this.timelines);
  }

  /**
   * Get current step for a session
   */
  getCurrentStep(sessionId: string): string | undefined {
    return this.currentSteps.get(sessionId);
  }

  /**
   * Get progress percentage for a session
   */
  getProgress(sessionId: string): number {
    const timeline = this.timelines.get(sessionId);
    if (!timeline || timeline.length === 0) {
      return 0;
    }

    const completed = timeline.filter(e => e.status === 'completed').length;
    const total = timeline.length;

    return Math.round((completed / total) * 100);
  }

  /**
   * Get total duration for a session
   */
  getTotalDuration(sessionId: string): number {
    const timeline = this.timelines.get(sessionId);
    if (!timeline) {
      return 0;
    }

    return timeline.reduce((sum, event) => sum + (event.duration || 0), 0);
  }

  /**
   * Get duration for a specific step
   */
  getStepDuration(sessionId: string, step: string): number | undefined {
    const timeline = this.timelines.get(sessionId);
    if (!timeline) {
      return undefined;
    }

    const event = timeline.find(e => e.step === step);
    return event?.duration;
  }

  /**
   * Clear timeline for a session
   */
  clearTimeline(sessionId: string): void {
    this.timelines.delete(sessionId);
    this.currentSteps.delete(sessionId);

    // Clean up step start times for this session
    for (const key of this.stepStartTimes.keys()) {
      if (key.startsWith(`${sessionId}:`)) {
        this.stepStartTimes.delete(key);
      }
    }

    logger.info('GenerationTimeline', 'TIMELINE_CLEARED', 'Timeline cleared', {
      sessionId,
    });
  }

  /**
   * Clear all timelines
   */
  clearAllTimelines(): void {
    this.timelines.clear();
    this.currentSteps.clear();
    this.stepStartTimes.clear();

    logger.info('GenerationTimeline', 'ALL_TIMELINES_CLEARED', 'All timelines cleared');
  }

  /**
   * Get timeline statistics for a session
   */
  getSessionStatistics(sessionId: string): {
    totalSteps: number;
    completedSteps: number;
    failedSteps: number;
    inProgressSteps: number;
    totalDuration: number;
    averageStepDuration: number;
  } {
    const timeline = this.timelines.get(sessionId);
    if (!timeline) {
      return {
        totalSteps: 0,
        completedSteps: 0,
        failedSteps: 0,
        inProgressSteps: 0,
        totalDuration: 0,
        averageStepDuration: 0,
      };
    }

    const completedSteps = timeline.filter(e => e.status === 'completed').length;
    const failedSteps = timeline.filter(e => e.status === 'failed').length;
    const inProgressSteps = timeline.filter(e => e.status === 'in_progress').length;
    const totalDuration = this.getTotalDuration(sessionId);
    const averageStepDuration = completedSteps > 0 ? totalDuration / completedSteps : 0;

    return {
      totalSteps: timeline.length,
      completedSteps,
      failedSteps,
      inProgressSteps,
      totalDuration,
      averageStepDuration,
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<TimelineConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('GenerationTimeline', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): TimelineConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    totalEvents: number;
    averageEventsPerSession: number;
    config: TimelineConfig;
  } {
    const totalSessions = this.timelines.size;
    const totalEvents = Array.from(this.timelines.values()).reduce(
      (sum, timeline) => sum + timeline.length,
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

export const generationTimeline = new GenerationTimeline();

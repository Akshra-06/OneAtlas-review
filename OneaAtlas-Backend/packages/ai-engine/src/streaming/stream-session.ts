/**
 * Stream Session
 * 
 * Manages a single streaming generation session.
 * Tracks session state, progress, and metadata.
 */

import { streamEventBus, StreamEvent, StreamEventType } from './stream-event-bus';
import { logger } from '../shared/utils/logger';

export interface SessionConfig {
  userId?: string;
  prompt: string;
  metadata?: Record<string, unknown>;
}

export interface SessionState {
  id: string;
  status: 'idle' | 'generating' | 'validating' | 'repairing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep: string;
  startTime: number;
  endTime?: number;
  error?: string;
  generatedComponents: string[];
  validationErrors: number;
  repairsApplied: number;
}

export interface SessionProgress {
  step: string;
  percentage: number;
  message?: string;
}

/**
 * Stream Session
 * 
 * Manages the lifecycle and state of a streaming generation session.
 */
export class StreamSession {
  private state: SessionState;
  private config: SessionConfig;
  private unsubscribeFunctions: Array<() => void> = [];

  constructor(config: SessionConfig) {
    this.config = config;
    this.state = {
      id: crypto.randomUUID(),
      status: 'idle',
      progress: 0,
      currentStep: 'initialized',
      startTime: Date.now(),
      generatedComponents: [],
      validationErrors: 0,
      repairsApplied: 0,
    };

    this.setupEventListeners();
  }

  /**
   * Setup event listeners for this session
   */
  private setupEventListeners(): void {
    const unsubscribe = streamEventBus.subscribe(
      this.state.id,
      'generation_started',
      (event) => this.handleGenerationStarted(event)
    );
    this.unsubscribeFunctions.push(unsubscribe);

    const unsubscribe2 = streamEventBus.subscribe(
      this.state.id,
      'generation_progress',
      (event) => this.handleProgress(event)
    );
    this.unsubscribeFunctions.push(unsubscribe2);

    const unsubscribe3 = streamEventBus.subscribe(
      this.state.id,
      'generation_completed',
      (event) => this.handleCompleted(event)
    );
    this.unsubscribeFunctions.push(unsubscribe3);

    const unsubscribe4 = streamEventBus.subscribe(
      this.state.id,
      'generation_failed',
      (event) => this.handleFailed(event)
    );
    this.unsubscribeFunctions.push(unsubscribe4);

    const unsubscribe5 = streamEventBus.subscribe(
      this.state.id,
      'generation_cancelled',
      (event) => this.handleCancelled(event)
    );
    this.unsubscribeFunctions.push(unsubscribe5);
  }

  /**
   * Handle generation started event
   */
  private handleGenerationStarted(event: StreamEvent): void {
    this.state.status = 'generating';
    this.state.currentStep = 'generation_started';
    this.state.progress = 0;

    logger.info('StreamSession', 'GENERATION_STARTED', 'Generation started', {
      sessionId: this.state.id,
    });
  }

  /**
   * Handle progress event
   */
  private handleProgress(event: StreamEvent): void {
    const progress = event.data as SessionProgress;
    this.state.progress = progress.percentage;
    this.state.currentStep = progress.step;

    logger.info('StreamSession', 'PROGRESS_UPDATE', 'Progress updated', {
      sessionId: this.state.id,
      progress: this.state.progress,
      step: this.state.currentStep,
    });
  }

  /**
   * Handle completion event
   */
  private handleCompleted(event: StreamEvent): void {
    this.state.status = 'completed';
    this.state.endTime = Date.now();
    this.state.progress = 100;

    logger.info('StreamSession', 'GENERATION_COMPLETED', 'Generation completed', {
      sessionId: this.state.id,
      duration: this.getDuration(),
    });
  }

  /**
   * Handle failure event
   */
  private handleFailed(event: StreamEvent): void {
    this.state.status = 'failed';
    this.state.endTime = Date.now();
    this.state.error = (event.data as { error: string }).error;

    logger.error('StreamSession', 'GENERATION_FAILED', 'Generation failed', {
      sessionId: this.state.id,
      error: this.state.error,
    });
  }

  /**
   * Handle cancellation event
   */
  private handleCancelled(event: StreamEvent): void {
    this.state.status = 'cancelled';
    this.state.endTime = Date.now();

    logger.info('StreamSession', 'GENERATION_CANCELLED', 'Generation cancelled', {
      sessionId: this.state.id,
    });
  }

  /**
   * Start the session
   */
  start(): void {
    this.state.status = 'generating';
    this.state.startTime = Date.now();

    streamEventBus.emitTyped('generation_started', this.state.id, {
      prompt: this.config.prompt,
      userId: this.config.userId,
    });

    logger.info('StreamSession', 'SESSION_STARTED', 'Session started', {
      sessionId: this.state.id,
    });
  }

  /**
   * Update progress
   */
  updateProgress(progress: SessionProgress): void {
    this.state.progress = progress.percentage;
    this.state.currentStep = progress.step;

    streamEventBus.emitTyped('generation_progress', this.state.id, progress);
  }

  /**
   * Add generated component
   */
  addGeneratedComponent(componentId: string): void {
    this.state.generatedComponents.push(componentId);

    streamEventBus.emitTyped('components_generated', this.state.id, {
      componentId,
      totalComponents: this.state.generatedComponents.length,
    });
  }

  /**
   * Set validation status
   */
  setValidationStatus(status: 'validating' | 'completed', errorCount?: number): void {
    this.state.status = status;
    if (errorCount !== undefined) {
      this.state.validationErrors = errorCount;
    }

    streamEventBus.emitTyped('validation_started', this.state.id, {
      status,
      errorCount: this.state.validationErrors,
    });
  }

  /**
   * Set repair status
   */
  setRepairStatus(status: 'repairing' | 'completed', repairsApplied?: number): void {
    this.state.status = status;
    if (repairsApplied !== undefined) {
      this.state.repairsApplied = repairsApplied;
    }

    streamEventBus.emitTyped('repair_applied', this.state.id, {
      status,
      repairsApplied: this.state.repairsApplied,
    });
  }

  /**
   * Mark preview as ready
   */
  markPreviewReady(): void {
    streamEventBus.emitTyped('preview_ready', this.state.id, {
      components: this.state.generatedComponents,
    });
  }

  /**
   * Complete the session
   */
  complete(): void {
    this.state.status = 'completed';
    this.state.endTime = Date.now();
    this.state.progress = 100;

    streamEventBus.emitTyped('generation_completed', this.state.id, {
      duration: this.getDuration(),
      components: this.state.generatedComponents,
      validationErrors: this.state.validationErrors,
      repairsApplied: this.state.repairsApplied,
    });

    logger.info('StreamSession', 'SESSION_COMPLETED', 'Session completed', {
      sessionId: this.state.id,
      duration: this.getDuration(),
    });
  }

  /**
   * Fail the session
   */
  fail(error: string): void {
    this.state.status = 'failed';
    this.state.endTime = Date.now();
    this.state.error = error;

    streamEventBus.emitTyped('generation_failed', this.state.id, {
      error,
      duration: this.getDuration(),
    });

    logger.error('StreamSession', 'SESSION_FAILED', 'Session failed', {
      sessionId: this.state.id,
      error,
    });
  }

  /**
   * Cancel the session
   */
  cancel(): void {
    this.state.status = 'cancelled';
    this.state.endTime = Date.now();

    streamEventBus.emitTyped('generation_cancelled', this.state.id, {
      duration: this.getDuration(),
    });

    logger.info('StreamSession', 'SESSION_CANCELLED', 'Session cancelled', {
      sessionId: this.state.id,
    });
  }

  /**
   * Get session state
   */
  getState(): SessionState {
    return { ...this.state };
  }

  /**
   * Get session ID
   */
  getId(): string {
    return this.state.id;
  }

  /**
   * Get session duration
   */
  getDuration(): number {
    const endTime = this.state.endTime || Date.now();
    return endTime - this.state.startTime;
  }

  /**
   * Get session config
   */
  getConfig(): SessionConfig {
    return { ...this.config };
  }

  /**
   * Cleanup session resources
   */
  cleanup(): void {
    // Unsubscribe from all events
    for (const unsubscribe of this.unsubscribeFunctions) {
      unsubscribe();
    }
    this.unsubscribeFunctions = [];

    // Clear event history
    streamEventBus.clearHistory(this.state.id);

    logger.info('StreamSession', 'SESSION_CLEANUP', 'Session cleaned up', {
      sessionId: this.state.id,
    });
  }

  /**
   * Check if session is active
   */
  isActive(): boolean {
    return ['generating', 'validating', 'repairing'].includes(this.state.status);
  }

  /**
   * Check if session is complete
   */
  isComplete(): boolean {
    return this.state.status === 'completed';
  }

  /**
   * Check if session failed
   */
  isFailed(): boolean {
    return this.state.status === 'failed';
  }

  /**
   * Check if session is cancelled
   */
  isCancelled(): boolean {
    return this.state.status === 'cancelled';
  }
}

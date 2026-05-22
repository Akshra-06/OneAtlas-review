/**
 * Generation Stream Manager
 * 
 * Main entry point for streaming generation.
 * Manages SSE/WebSocket connections and coordinates streaming.
 */

import { Server } from 'http';
import { StreamOrchestrator } from './stream-orchestrator';
import { StreamSession, SessionConfig } from './stream-session';
import { streamEventBus, StreamEvent, StreamEventType } from './stream-event-bus';
import { logger } from '../shared/utils/logger';

export interface StreamManagerConfig {
  enableSSE: boolean;
  enableWebSocket: boolean;
  port?: number;
  path?: string;
}

const DEFAULT_CONFIG: StreamManagerConfig = {
  enableSSE: true,
  enableWebSocket: false,
  path: '/stream',
};

/**
 * Generation Stream Manager
 * 
 * Manages streaming generation via SSE/WebSockets:
 * - SSE connection management
 * - WebSocket connection management
 * - Session coordination
 * - Event broadcasting
 */
export class GenerationStreamManager {
  private config: StreamManagerConfig;
  private orchestrator: StreamOrchestrator;
  private sseClients: Map<string, Response> = new Map();
  private wsClients: Map<string, WebSocket> = new Map();

  constructor(config: Partial<StreamManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.orchestrator = new StreamOrchestrator();
  }

  /**
   * Start a streaming generation session
   */
  async startGeneration(config: SessionConfig): Promise<StreamSession> {
    const session = await this.orchestrator.startGeneration(config);

    logger.info('GenerationStreamManager', 'GENERATION_STARTED', 'Streaming generation started', {
      sessionId: session.getId(),
    });

    return session;
  }

  /**
   * Create SSE response for a session
   */
  createSSEStream(sessionId: string, response: Response): void {
    if (!this.config.enableSSE) {
      throw new Error('SSE is not enabled');
    }

    // Set SSE headers
    response.headers.set('Content-Type', 'text/event-stream');
    response.headers.set('Cache-Control', 'no-cache');
    response.headers.set('Connection', 'keep-alive');

    this.sseClients.set(sessionId, response);

    // Subscribe to events for this session
    const unsubscribe = streamEventBus.subscribe(
      sessionId,
      'generation_progress' as StreamEventType,
      (event: StreamEvent) => this.sendSSEEvent(sessionId, event)
    );

    // Also subscribe to all event types
    const eventTypes: StreamEventType[] = [
      'generation_started',
      'understanding_complete',
      'entities_generated',
      'workflows_generated',
      'components_generated',
      'validation_started',
      'repair_applied',
      'preview_ready',
      'generation_completed',
      'generation_failed',
      'generation_cancelled',
    ];

    for (const eventType of eventTypes) {
      const unsub = streamEventBus.subscribe(
        sessionId,
        eventType,
        (event: StreamEvent) => this.sendSSEEvent(sessionId, event)
      );
      // Store unsubscribe function for cleanup
      (unsubscribe as any).additionalUnsubs = (unsubscribe as any).additionalUnsubs || [];
      (unsubscribe as any).additionalUnsubs.push(unsub);
    }

    logger.info('GenerationStreamManager', 'SSE_STREAM_CREATED', 'SSE stream created', {
      sessionId,
    });
  }

  /**
   * Send SSE event to client
   */
  private sendSSEEvent(sessionId: string, event: StreamEvent): void {
    const response = this.sseClients.get(sessionId);
    if (!response) {
      return;
    }

    const data = JSON.stringify(event);
    const sseEvent = `event: ${event.type}\ndata: ${data}\n\n`;

    // In a real implementation, this would write to the response stream
    // For now, log the event
    logger.info('GenerationStreamManager', 'SSE_EVENT_SENT', 'SSE event sent', {
      sessionId,
      eventType: event.type,
    });
  }

  /**
   * Close SSE stream for a session
   */
  closeSSEStream(sessionId: string): void {
    const response = this.sseClients.get(sessionId);
    if (response) {
      this.sseClients.delete(sessionId);

      // Send SSE close event
      const closeEvent = `event: close\ndata: {"sessionId":"${sessionId}"}\n\n`;
      logger.info('GenerationStreamManager', 'SSE_STREAM_CLOSED', 'SSE stream closed', {
        sessionId,
      });
    }
  }

  /**
   * Add WebSocket client
   */
  addWebSocketClient(sessionId: string, ws: WebSocket): void {
    if (!this.config.enableWebSocket) {
      throw new Error('WebSocket is not enabled');
    }

    this.wsClients.set(sessionId, ws);

    // Subscribe to events for this session
    const eventTypes: StreamEventType[] = [
      'generation_started',
      'understanding_complete',
      'entities_generated',
      'workflows_generated',
      'components_generated',
      'validation_started',
      'repair_applied',
      'preview_ready',
      'generation_completed',
      'generation_failed',
      'generation_cancelled',
      'generation_progress',
    ];

    for (const eventType of eventTypes) {
      streamEventBus.subscribe(
        sessionId,
        eventType,
        (event: StreamEvent) => this.sendWebSocketEvent(sessionId, event)
      );
    }

    ws.addEventListener('close', () => {
      this.removeWebSocketClient(sessionId);
    });

    logger.info('GenerationStreamManager', 'WS_CLIENT_ADDED', 'WebSocket client added', {
      sessionId,
    });
  }

  /**
   * Send WebSocket event to client
   */
  private sendWebSocketEvent(sessionId: string, event: StreamEvent): void {
    const ws = this.wsClients.get(sessionId);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const data = JSON.stringify(event);
    ws.send(data);

    logger.info('GenerationStreamManager', 'WS_EVENT_SENT', 'WebSocket event sent', {
      sessionId,
      eventType: event.type,
    });
  }

  /**
   * Remove WebSocket client
   */
  removeWebSocketClient(sessionId: string): void {
    const ws = this.wsClients.get(sessionId);
    if (ws) {
      this.wsClients.delete(sessionId);
      streamEventBus.unsubscribeAll(sessionId);

      logger.info('GenerationStreamManager', 'WS_CLIENT_REMOVED', 'WebSocket client removed', {
        sessionId,
      });
    }
  }

  /**
   * Cancel a generation session
   */
  cancelGeneration(sessionId: string): boolean {
    const success = this.orchestrator.cancelGeneration(sessionId);

    if (success) {
      this.closeSSEStream(sessionId);
      this.removeWebSocketClient(sessionId);
    }

    return success;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): StreamSession | undefined {
    return this.orchestrator.getSession(sessionId);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): StreamSession[] {
    return this.orchestrator.getActiveSessions();
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.orchestrator.getSessionCount();
  }

  /**
   * Get SSE client count
   */
  getSSEClientCount(): number {
    return this.sseClients.size;
  }

  /**
   * Get WebSocket client count
   */
  getWebSocketClientCount(): number {
    return this.wsClients.size;
  }

  /**
   * Cleanup completed sessions
   */
  cleanupCompletedSessions(): void {
    this.orchestrator.cleanupCompletedSessions();

    // Also cleanup SSE and WebSocket clients for completed sessions
    const activeSessionIds = new Set(
      this.orchestrator.getActiveSessions().map(s => s.getId())
    );

    for (const sessionId of this.sseClients.keys()) {
      if (!activeSessionIds.has(sessionId)) {
        this.closeSSEStream(sessionId);
      }
    }

    for (const sessionId of this.wsClients.keys()) {
      if (!activeSessionIds.has(sessionId)) {
        this.removeWebSocketClient(sessionId);
      }
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<StreamManagerConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('GenerationStreamManager', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): StreamManagerConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    activeSessions: number;
    sseClients: number;
    wsClients: number;
    orchestratorStats: ReturnType<StreamOrchestrator['getStatistics']>;
  } {
    return {
      totalSessions: this.getSessionCount(),
      activeSessions: this.getActiveSessions().length,
      sseClients: this.getSSEClientCount(),
      wsClients: this.getWebSocketClientCount(),
      orchestratorStats: this.orchestrator.getStatistics(),
    };
  }

  /**
   * Shutdown all streams
   */
  shutdown(): void {
    // Close all SSE streams
    for (const sessionId of this.sseClients.keys()) {
      this.closeSSEStream(sessionId);
    }

    // Close all WebSocket connections
    for (const sessionId of this.wsClients.keys()) {
      this.removeWebSocketClient(sessionId);
    }

    // Cleanup sessions
    this.orchestrator.cleanupCompletedSessions();

    logger.info('GenerationStreamManager', 'SHUTDOWN_COMPLETE', 'Stream manager shutdown complete');
  }
}

export const generationStreamManager = new GenerationStreamManager();

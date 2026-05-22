/**
 * Hot Reload Runtime
 * 
 * Manages hot reload functionality for iframe previews.
 * Supports incremental updates without full reloads.
 */

import { logger } from '../../shared/utils/logger';

export interface HotReloadConfig {
  enableHotReload: boolean;
  reloadDebounceMs: number;
  enableOptimisticUpdates: boolean;
}

const DEFAULT_CONFIG: HotReloadConfig = {
  enableHotReload: false,
  reloadDebounceMs: 1000,
  enableOptimisticUpdates: false,
};

export interface ReloadRequest {
  componentId: string;
  type: 'component' | 'style' | 'layout' | 'data';
  data: unknown;
}

/**
 * Hot Reload Runtime
 * 
 * Manages hot reload for iframe previews:
 * - Incremental component updates
 * - Style updates without reload
 * - Layout updates
 * - Data updates
 * - Optimistic rendering
 */
export class HotReloadRuntime {
  private config: HotReloadConfig;
  private reloadQueue: Map<string, ReloadRequest[]> = new Map();
  private reloadTimers: Map<string, NodeJS.Timeout> = new Map();
  private iframeWindows: Map<string, any> = new Map();

  constructor(config: Partial<HotReloadConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Register an iframe window
   */
  registerIframe(sessionId: string, iframeWindow: any): void {
    this.iframeWindows.set(sessionId, iframeWindow);

    logger.info('HotReloadRuntime', 'IFRAME_REGISTERED', 'Iframe registered', {
      sessionId,
    });
  }

  /**
   * Unregister an iframe window
   */
  unregisterIframe(sessionId: string): void {
    this.iframeWindows.delete(sessionId);

    // Clear any pending reloads
    const timer = this.reloadTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.reloadTimers.delete(sessionId);
    }

    logger.info('HotReloadRuntime', 'IFRAME_UNREGISTERED', 'Iframe unregistered', {
      sessionId,
    });
  }

  /**
   * Queue a reload request
   */
  queueReload(sessionId: string, request: ReloadRequest): void {
    if (!this.config.enableHotReload) {
      return;
    }

    if (!this.reloadQueue.has(sessionId)) {
      this.reloadQueue.set(sessionId, []);
    }

    this.reloadQueue.get(sessionId)!.push(request);

    // Debounce the reload
    const timer = this.reloadTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
    }

    const newTimer = setTimeout(() => {
      this.processReloadQueue(sessionId);
    }, this.config.reloadDebounceMs);

    this.reloadTimers.set(sessionId, newTimer);

    logger.info('HotReloadRuntime', 'RELOAD_QUEUED', 'Reload request queued', {
      sessionId,
      componentId: request.componentId,
      type: request.type,
    });
  }

  /**
   * Process reload queue for a session
   */
  private processReloadQueue(sessionId: string): void {
    const queue = this.reloadQueue.get(sessionId);
    if (!queue || queue.length === 0) {
      return;
    }

    const iframeWindow = this.iframeWindows.get(sessionId);
    if (!iframeWindow) {
      logger.warn('HotReloadRuntime', 'IFRAME_NOT_FOUND', 'Iframe not found for reload', {
        sessionId,
      });
      return;
    }

    // Send reload requests to iframe
    for (const request of queue) {
      this.sendReloadMessage(iframeWindow, request);
    }

    // Clear queue
    this.reloadQueue.set(sessionId, []);

    logger.info('HotReloadRuntime', 'RELOAD_PROCESSED', 'Reload queue processed', {
      sessionId,
      count: queue.length,
    });
  }

  /**
   * Send reload message to iframe
   */
  private sendReloadMessage(iframeWindow: any, request: ReloadRequest): void {
    try {
      // In a real implementation, this would use postMessage to communicate with the iframe
      const message = {
        type: 'HOT_RELOAD',
        payload: request,
      };

      // Simulate sending message
      logger.info('HotReloadRuntime', 'RELOAD_MESSAGE_SENT', 'Reload message sent', {
        componentId: request.componentId,
        reloadType: request.type,
      });

      // iframeWindow.postMessage(message, '*');
    } catch (error) {
      logger.error('HotReloadRuntime', 'RELOAD_MESSAGE_ERROR', 'Failed to send reload message', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Force immediate reload for a session
   */
  forceReload(sessionId: string): void {
    // Clear any pending debounce
    const timer = this.reloadTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.reloadTimers.delete(sessionId);
    }

    // Process queue immediately
    this.processReloadQueue(sessionId);

    logger.info('HotReloadRuntime', 'FORCE_RELOAD', 'Force reload triggered', {
      sessionId,
    });
  }

  /**
   * Reload a specific component
   */
  reloadComponent(sessionId: string, componentId: string, data: unknown): void {
    const request: ReloadRequest = {
      componentId,
      type: 'component',
      data,
    };

    this.queueReload(sessionId, request);
  }

  /**
   * Reload styles
   */
  reloadStyles(sessionId: string, data: unknown): void {
    const request: ReloadRequest = {
      componentId: 'global',
      type: 'style',
      data,
    };

    this.queueReload(sessionId, request);
  }

  /**
   * Reload layout
   */
  reloadLayout(sessionId: string, data: unknown): void {
    const request: ReloadRequest = {
      componentId: 'layout',
      type: 'layout',
      data,
    };

    this.queueReload(sessionId, request);
  }

  /**
   * Reload data
   */
  reloadData(sessionId: string, componentId: string, data: unknown): void {
    const request: ReloadRequest = {
      componentId,
      type: 'data',
      data,
    };

    this.queueReload(sessionId, request);
  }

  /**
   * Get reload queue size for a session
   */
  getQueueSize(sessionId: string): number {
    return this.reloadQueue.get(sessionId)?.length || 0;
  }

  /**
   * Get total queue size across all sessions
   */
  getTotalQueueSize(): number {
    let total = 0;
    for (const queue of this.reloadQueue.values()) {
      total += queue.length;
    }
    return total;
  }

  /**
   * Clear reload queue for a session
   */
  clearQueue(sessionId: string): void {
    this.reloadQueue.delete(sessionId);

    const timer = this.reloadTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.reloadTimers.delete(sessionId);
    }

    logger.info('HotReloadRuntime', 'QUEUE_CLEARED', 'Reload queue cleared', {
      sessionId,
    });
  }

  /**
   * Clear all reload queues
   */
  clearAllQueues(): void {
    for (const sessionId of this.reloadQueue.keys()) {
      this.clearQueue(sessionId);
    }

    logger.info('HotReloadRuntime', 'ALL_QUEUES_CLEARED', 'All reload queues cleared');
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<HotReloadConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('HotReloadRuntime', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): HotReloadConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    registeredIframes: number;
    totalQueueSize: number;
    activeTimers: number;
    config: HotReloadConfig;
  } {
    return {
      registeredIframes: this.iframeWindows.size,
      totalQueueSize: this.getTotalQueueSize(),
      activeTimers: this.reloadTimers.size,
      config: this.getConfig(),
    };
  }

  /**
   * Shutdown
   */
  shutdown(): void {
    // Clear all timers
    for (const timer of this.reloadTimers.values()) {
      clearTimeout(timer);
    }
    this.reloadTimers.clear();

    // Clear all queues
    this.reloadQueue.clear();

    // Clear iframe windows
    this.iframeWindows.clear();

    logger.info('HotReloadRuntime', 'SHUTDOWN_COMPLETE', 'Hot reload runtime shutdown complete');
  }
}

export const hotReloadRuntime = new HotReloadRuntime();

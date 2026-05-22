/**
 * Safe Mode Manager
 * 
 * Multi-level degradation system for preview stability.
 * Provides progressive fallback based on error severity and recovery attempts.
 */

import type { GeneratedFile } from '@oneatlas/shared';
import { logger } from '../../shared/utils/logger';

export type SafeModeLevel = 'full' | 'degraded' | 'minimal' | 'failed';
export type SafeModeTrigger = 'validation_error' | 'build_error' | 'runtime_error' | 'timeout' | 'manual';

export interface SafeModeConfig {
  enableDegradedMode: boolean;
  enableMinimalMode: boolean;
  degradedModeThreshold: number; // Number of errors before degraded mode
  minimalModeThreshold: number; // Number of errors before minimal mode
  autoRecovery: boolean;
  autoRecoveryDelayMs: number;
}

const DEFAULT_CONFIG: SafeModeConfig = {
  enableDegradedMode: true,
  enableMinimalMode: true,
  degradedModeThreshold: 3,
  minimalModeThreshold: 5,
  autoRecovery: true,
  autoRecoveryDelayMs: 30000, // 30 seconds
};

export interface SafeModeState {
  level: SafeModeLevel;
  trigger?: SafeModeTrigger;
  timestamp: string;
  errorCount: number;
  lastError?: string;
  recoveryAttempts: number;
}

export interface SafeModeResult {
  level: SafeModeLevel;
  files: GeneratedFile[];
  state: SafeModeState;
  message: string;
  shouldShowBanner: boolean;
  bannerMessage?: string;
}

/**
 * Safe Mode Manager
 * 
 * Manages multi-level degradation for preview stability:
 * - Full mode: Normal operation with all generated files
 * - Degraded mode: Partial functionality with critical files only
 * - Minimal mode: Golden template only (safe shell)
 * - Failed mode: Complete failure (no preview)
 */
export class SafeModeManager {
  private config: SafeModeConfig;
  private state: SafeModeState;
  private errorHistory: Array<{ timestamp: string; error: string; level: SafeModeLevel }> = [];

  constructor(config: Partial<SafeModeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      level: 'full',
      timestamp: new Date().toISOString(),
      errorCount: 0,
      recoveryAttempts: 0,
    };
  }

  /**
   * Determine safe mode level based on error context
   */
  determineSafeModeLevel(
    trigger: SafeModeTrigger,
    errorCount: number,
    hasCriticalErrors: boolean,
  ): SafeModeLevel {
    // If critical errors detected, go to minimal mode immediately
    if (hasCriticalErrors && this.config.enableMinimalMode) {
      return 'minimal';
    }

    // If error count exceeds minimal threshold, go to minimal mode
    if (errorCount >= this.config.minimalModeThreshold && this.config.enableMinimalMode) {
      return 'minimal';
    }

    // If error count exceeds degraded threshold, go to degraded mode
    if (errorCount >= this.config.degradedModeThreshold && this.config.enableDegradedMode) {
      return 'degraded';
    }

    // Trigger-based escalation
    if (trigger === 'build_error' || trigger === 'runtime_error') {
      if (errorCount > 0 && this.config.enableDegradedMode) {
        return 'degraded';
      }
    }

    // Default to full mode
    return 'full';
  }

  /**
   * Activate safe mode with specified level
   */
  activateSafeMode(
    level: SafeModeLevel,
    trigger: SafeModeTrigger,
    error?: string,
  ): SafeModeState {
    logger.info('SafeModeManager', 'SAFE_MODE_ACTIVATED', `Activating safe mode: ${level}`, {
      trigger,
      error,
      previousLevel: this.state.level,
    });

    this.state = {
      level,
      trigger,
      timestamp: new Date().toISOString(),
      errorCount: this.state.errorCount + 1,
      lastError: error,
      recoveryAttempts: 0,
    };

    this.errorHistory.push({
      timestamp: this.state.timestamp,
      error: error || 'Unknown error',
      level,
    });

    return this.state;
  }

  /**
   * Apply safe mode to files based on level
   */
  applySafeMode(
    files: GeneratedFile[],
    level: SafeModeLevel,
  ): SafeModeResult {
    logger.info('SafeModeManager', 'APPLYING_SAFE_MODE', `Applying safe mode level: ${level}`, {
      fileCount: files.length,
    });

    switch (level) {
      case 'full':
        return this.createFullModeResult(files);
      
      case 'degraded':
        return this.createDegradedModeResult(files);
      
      case 'minimal':
        return this.createMinimalModeResult();
      
      case 'failed':
        return this.createFailedModeResult();
      
      default:
        return this.createFullModeResult(files);
    }
  }

  /**
   * Create full mode result (no changes)
   */
  private createFullModeResult(files: GeneratedFile[]): SafeModeResult {
    return {
      level: 'full',
      files,
      state: this.state,
      message: 'Full mode - normal operation',
      shouldShowBanner: false,
    };
  }

  /**
   * Create degraded mode result (critical files only)
   */
  private createDegradedModeResult(files: GeneratedFile[]): SafeModeResult {
    // Keep only critical files (layout, pages, basic components)
    const criticalFiles = files.filter(file => {
      const filePath = file.filePath.toLowerCase();
      return (
        filePath.includes('layout') ||
        filePath.includes('page') ||
        filePath.includes('components/ui') ||
        filePath.includes('lib/utils') ||
        filePath.includes('middleware')
      );
    });

    logger.info('SafeModeManager', 'DEGRADED_MODE', 'Filtered to critical files only', {
      originalCount: files.length,
      filteredCount: criticalFiles.length,
    });

    return {
      level: 'degraded',
      files: criticalFiles,
      state: this.state,
      message: 'Degraded mode - limited functionality',
      shouldShowBanner: true,
      bannerMessage: 'Preview running in degraded mode. Some features may be unavailable.',
    };
  }

  /**
   * Create minimal mode result (golden template only)
   */
  private createMinimalModeResult(): SafeModeResult {
    // Return empty files array - caller will use golden template
    logger.info('SafeModeManager', 'MINIMAL_MODE', 'Using golden template only');

    return {
      level: 'minimal',
      files: [],
      state: this.state,
      message: 'Minimal mode - golden template only',
      shouldShowBanner: true,
      bannerMessage: 'Preview running in safe mode. Generated code could not be loaded.',
    };
  }

  /**
   * Create failed mode result (complete failure)
   */
  private createFailedModeResult(): SafeModeResult {
    logger.error('SafeModeManager', 'FAILED_MODE', 'Complete preview failure');

    return {
      level: 'failed',
      files: [],
      state: this.state,
      message: 'Failed mode - preview unavailable',
      shouldShowBanner: true,
      bannerMessage: 'Preview failed to start. Please check the logs for details.',
    };
  }

  /**
   * Attempt to recover from safe mode
   */
  async attemptRecovery(): Promise<boolean> {
    if (!this.config.autoRecovery) {
      logger.info('SafeModeManager', 'AUTO_RECOVERY_DISABLED', 'Auto-recovery is disabled');
      return false;
    }

    logger.info('SafeModeManager', 'RECOVERY_ATTEMPT', 'Attempting auto-recovery', {
      currentLevel: this.state.level,
      recoveryAttempts: this.state.recoveryAttempts,
    });

    this.state.recoveryAttempts++;

    // Wait for recovery delay
    await this.delay(this.config.autoRecoveryDelayMs);

    // Reset to full mode
    this.state = {
      level: 'full',
      timestamp: new Date().toISOString(),
      errorCount: 0,
      recoveryAttempts: 0,
    };

    logger.info('SafeModeManager', 'RECOVERY_SUCCESS', 'Recovered to full mode');
    return true;
  }

  /**
   * Get current safe mode state
   */
  getState(): SafeModeState {
    return { ...this.state };
  }

  /**
   * Get error history
   */
  getErrorHistory(): Array<{ timestamp: string; error: string; level: SafeModeLevel }> {
    return [...this.errorHistory];
  }

  /**
   * Get safe mode analytics
   */
  getAnalytics(): {
    totalActivations: number;
    levelDistribution: Record<SafeModeLevel, number>;
    triggerDistribution: Record<SafeModeTrigger, number>;
    averageRecoveryTime: number;
  } {
    const levelDistribution: Record<SafeModeLevel, number> = {
      full: 0,
      degraded: 0,
      minimal: 0,
      failed: 0,
    };

    const triggerDistribution: Record<SafeModeTrigger, number> = {
      validation_error: 0,
      build_error: 0,
      runtime_error: 0,
      timeout: 0,
      manual: 0,
    };

    for (const entry of this.errorHistory) {
      levelDistribution[entry.level]++;
    }

    for (const entry of this.errorHistory) {
      if (entry.level !== 'full') {
        // Count triggers (simplified - would need to track triggers separately)
        triggerDistribution.build_error++;
      }
    }

    return {
      totalActivations: this.errorHistory.filter(e => e.level !== 'full').length,
      levelDistribution,
      triggerDistribution,
      averageRecoveryTime: this.config.autoRecoveryDelayMs,
    };
  }

  /**
   * Reset safe mode state
   */
  reset(): void {
    logger.info('SafeModeManager', 'SAFE_MODE_RESET', 'Resetting safe mode state');
    
    this.state = {
      level: 'full',
      timestamp: new Date().toISOString(),
      errorCount: 0,
      recoveryAttempts: 0,
    };
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const safeModeManager = new SafeModeManager();

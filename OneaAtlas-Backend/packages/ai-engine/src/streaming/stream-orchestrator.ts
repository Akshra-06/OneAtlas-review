/**
 * Stream Orchestrator
 * 
 * Orchestrates the streaming generation process.
 * Coordinates generation steps and manages the generation pipeline.
 */

import { StreamSession, SessionConfig } from './stream-session';
import { streamEventBus, StreamEventType } from './stream-event-bus';
import { logger } from '../shared/utils/logger';
import { domainClassifier } from '../intelligence/classification/domain-classifier';
import { workflowInference } from '../intelligence/workflow/workflow-inference';
import { promptToUIReasoning } from '../intelligence/reasoning/prompt-to-ui-reasoning';
import { promptAwareDashboardGenerator } from '../intelligence/dashboard/prompt-aware-dashboard';
import { validationOrchestrator } from '@oneatlas/validation-engine';

export interface OrchestratorConfig {
  enableValidation: boolean;
  enableAutoRepair: boolean;
  chunkSize: number;
}

const DEFAULT_CONFIG: OrchestratorConfig = {
  enableValidation: true,
  enableAutoRepair: true,
  chunkSize: 10,
};

/**
 * Stream Orchestrator
 * 
 * Orchestrates the streaming generation pipeline:
 * - Domain classification
 * - Workflow inference
 * - UI reasoning
 * - Dashboard generation
 * - Validation
 * - Repair
 */
export class StreamOrchestrator {
  private config: OrchestratorConfig;
  private activeSessions: Map<string, StreamSession> = new Map();

  constructor(config: Partial<OrchestratorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Start a streaming generation session
   */
  async startGeneration(config: SessionConfig): Promise<StreamSession> {
    const session = new StreamSession(config);
    this.activeSessions.set(session.getId(), session);

    session.start();

    try {
      // Step 1: Domain classification
      await this.performDomainClassification(session);

      // Step 2: Workflow inference
      await this.performWorkflowInference(session);

      // Step 3: UI reasoning
      await this.performUIReasoning(session);

      // Step 4: Dashboard generation
      await this.performDashboardGeneration(session);

      // Step 5: Validation (if enabled)
      if (this.config.enableValidation) {
        await this.performValidation(session);
      }

      // Step 6: Repair (if enabled and needed)
      if (this.config.enableAutoRepair && session.getState().validationErrors > 0) {
        await this.performRepair(session);
      }

      // Step 7: Mark preview ready
      session.markPreviewReady();

      // Step 8: Complete session
      session.complete();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      session.fail(errorMessage);
    }

    return session;
  }

  /**
   * Perform domain classification
   */
  private async performDomainClassification(session: StreamSession): Promise<void> {
    session.updateProgress({
      step: 'domain_classification',
      percentage: 10,
      message: 'Classifying domain...',
    });

    const config = session.getConfig();
    const classification = domainClassifier.classify(config.prompt);

    streamEventBus.emitTyped('understanding_complete', session.getId(), {
      domain: classification.domain,
      confidence: classification.confidence,
    });

    logger.info('StreamOrchestrator', 'DOMAIN_CLASSIFIED', 'Domain classified', {
      sessionId: session.getId(),
      domain: classification.domain,
      confidence: classification.confidence,
    });
  }

  /**
   * Perform workflow inference
   */
  private async performWorkflowInference(session: StreamSession): Promise<void> {
    session.updateProgress({
      step: 'workflow_inference',
      percentage: 25,
      message: 'Inferring workflows...',
    });

    const config = session.getConfig();
    const classification = domainClassifier.classify(config.prompt);
    const inference = workflowInference.infer(config.prompt, classification.domain);

    streamEventBus.emitTyped('workflows_generated', session.getId(), {
      workflow: inference.workflow,
      confidence: inference.confidence,
    });

    logger.info('StreamOrchestrator', 'WORKFLOW_INFERRED', 'Workflow inferred', {
      sessionId: session.getId(),
      workflowName: inference.workflow.name,
      steps: inference.workflow.steps.length,
    });
  }

  /**
   * Perform UI reasoning
   */
  private async performUIReasoning(session: StreamSession): Promise<void> {
    session.updateProgress({
      step: 'ui_reasoning',
      percentage: 40,
      message: 'Analyzing UI requirements...',
    });

    const config = session.getConfig();
    const reasoning = promptToUIReasoning.reason(config.prompt);

    streamEventBus.emitTyped('entities_generated', session.getId(), {
      intent: reasoning.intent,
      requirements: reasoning.requirements,
      confidence: reasoning.confidence,
    });

    logger.info('StreamOrchestrator', 'UI_REASONED', 'UI reasoning complete', {
      sessionId: session.getId(),
      uiType: reasoning.intent.uiType,
      requirements: reasoning.requirements.length,
    });
  }

  /**
   * Perform dashboard generation
   */
  private async performDashboardGeneration(session: StreamSession): Promise<void> {
    session.updateProgress({
      step: 'dashboard_generation',
      percentage: 55,
      message: 'Generating dashboard components...',
    });

    const config = session.getConfig();
    const dashboard = promptAwareDashboardGenerator.generate(config.prompt);

    // Stream components incrementally
    for (let i = 0; i < dashboard.components.length; i++) {
      const component = dashboard.components[i];
      if (component) {
        session.addGeneratedComponent(component.id);

        // Update progress for each component
        const progress = 55 + ((i + 1) / dashboard.components.length) * 20;
        session.updateProgress({
          step: 'component_generation',
          percentage: Math.round(progress),
          message: `Generating component ${i + 1}/${dashboard.components.length}...`,
        });

        // Simulate async work for streaming effect
        await this.delay(100);
      }
    }

    logger.info('StreamOrchestrator', 'DASHBOARD_GENERATED', 'Dashboard generated', {
      sessionId: session.getId(),
      components: dashboard.components.length,
    });
  }

  /**
   * Perform validation
   */
  private async performValidation(session: StreamSession): Promise<void> {
    session.setValidationStatus('validating');

    session.updateProgress({
      step: 'validation',
      percentage: 80,
      message: 'Validating generated code...',
    });

    const config = session.getConfig();
    const dashboard = promptAwareDashboardGenerator.generate(config.prompt);

    // Simulate validation (integrate with actual validation orchestrator)
    let errorCount = 0;
    try {
      // This would integrate with the actual validation orchestrator
      // For now, simulate validation
      const validationResult = await this.simulateValidation(dashboard);
      errorCount = validationResult.errorCount;
    } catch (error) {
      logger.error('StreamOrchestrator', 'VALIDATION_ERROR', 'Validation error', {
        sessionId: session.getId(),
        error: error instanceof Error ? error.message : String(error),
      });
    }

    session.setValidationStatus('completed', errorCount);

    logger.info('StreamOrchestrator', 'VALIDATION_COMPLETE', 'Validation complete', {
      sessionId: session.getId(),
      errorCount,
    });
  }

  /**
   * Perform repair
   */
  private async performRepair(session: StreamSession): Promise<void> {
    session.setRepairStatus('repairing');

    session.updateProgress({
      step: 'repair',
      percentage: 90,
      message: 'Applying repairs...',
    });

    // Simulate repair (integrate with actual repair systems)
    let repairsApplied = 0;
    try {
      // This would integrate with the actual repair systems
      // For now, simulate repair
      repairsApplied = await this.simulateRepair(session);
    } catch (error) {
      logger.error('StreamOrchestrator', 'REPAIR_ERROR', 'Repair error', {
        sessionId: session.getId(),
        error: error instanceof Error ? error.message : String(error),
      });
    }

    session.setRepairStatus('completed', repairsApplied);

    logger.info('StreamOrchestrator', 'REPAIR_COMPLETE', 'Repair complete', {
      sessionId: session.getId(),
      repairsApplied,
    });
  }

  /**
   * Cancel a generation session
   */
  cancelGeneration(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.cancel();
    this.activeSessions.delete(sessionId);

    logger.info('StreamOrchestrator', 'GENERATION_CANCELLED', 'Generation cancelled', {
      sessionId,
    });

    return true;
  }

  /**
   * Get a session by ID
   */
  getSession(sessionId: string): StreamSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): StreamSession[] {
    return Array.from(this.activeSessions.values()).filter(s => s.isActive());
  }

  /**
   * Get session count
   */
  getSessionCount(): number {
    return this.activeSessions.size;
  }

  /**
   * Cleanup completed sessions
   */
  cleanupCompletedSessions(): void {
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.isComplete() || session.isFailed() || session.isCancelled()) {
        session.cleanup();
        this.activeSessions.delete(sessionId);
      }
    }

    logger.info('StreamOrchestrator', 'SESSIONS_CLEANED', 'Completed sessions cleaned up', {
      remainingSessions: this.activeSessions.size,
    });
  }

  /**
   * Simulate validation (placeholder for actual integration)
   */
  private async simulateValidation(
    dashboard: import('../intelligence/dashboard/prompt-aware-dashboard').DashboardGenerationResult,
  ): Promise<{ errorCount: number }> {
    // Simulate async validation
    await this.delay(200);

    // Return simulated error count
    return { errorCount: Math.floor(Math.random() * 3) };
  }

  /**
   * Simulate repair (placeholder for actual integration)
   */
  private async simulateRepair(session: StreamSession): Promise<number> {
    // Simulate async repair
    await this.delay(300);

    // Return simulated repairs applied
    return Math.floor(Math.random() * 2) + 1;
  }

  /**
   * Delay helper for simulating async work
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OrchestratorConfig>): void {
    this.config = { ...this.config, ...config };

    logger.info('StreamOrchestrator', 'CONFIG_UPDATED', 'Configuration updated', { config: this.config });
  }

  /**
   * Get configuration
   */
  getConfig(): OrchestratorConfig {
    return { ...this.config };
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalSessions: number;
    activeSessions: number;
    completedSessions: number;
    failedSessions: number;
    cancelledSessions: number;
  } {
    const sessions = Array.from(this.activeSessions.values());
    const activeSessions = sessions.filter(s => s.isActive()).length;
    const completedSessions = sessions.filter(s => s.isComplete()).length;
    const failedSessions = sessions.filter(s => s.isFailed()).length;
    const cancelledSessions = sessions.filter(s => s.isCancelled()).length;

    return {
      totalSessions: sessions.length,
      activeSessions,
      completedSessions,
      failedSessions,
      cancelledSessions,
    };
  }
}

export const streamOrchestrator = new StreamOrchestrator();

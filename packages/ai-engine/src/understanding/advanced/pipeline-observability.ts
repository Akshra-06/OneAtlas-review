/**
 * Pipeline Observability System
 * 
 * Tracks and explains AI generation process:
 * - Reasoning traces
 * - Workflow logs
 * - Layout decision logs
 * - Component selection traces
 * - Generation explanation system
 */

import type { AppUnderstanding, EntityNode, PageNode, WorkflowNode } from '@oneatlas/shared';

export interface PipelineTrace {
  traceId: string;
  timestamp: number;
  prompt: string;
  stages: PipelineStage[];
  decisions: DecisionLog[];
  explanations: Explanation[];
  metrics: PipelineMetrics;
}

export interface PipelineStage {
  stageName: string;
  startTime: number;
  endTime: number;
  duration: number;
  input: any;
  output: any;
  confidence: number;
  notes: string[];
}

export interface DecisionLog {
  decisionId: string;
  timestamp: number;
  category: 'entity' | 'workflow' | 'page' | 'layout' | 'component' | 'style' | 'recovery';
  decision: string;
  alternatives: string[];
  rationale: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
}

export interface Explanation {
  explanationId: string;
  timestamp: number;
  target: string;
  explanation: string;
  evidence: string[];
  confidence: number;
}

export interface PipelineMetrics {
  totalDuration: number;
  stageDurations: Map<string, number>;
  decisionCount: number;
  confidenceScore: number;
  recoveryCount: number;
  warningCount: number;
}

export class PipelineObservability {
  private traces: Map<string, PipelineTrace> = new Map();
  private currentTraceId: string | null = null;

  /**
   * Start a new pipeline trace
   */
  startTrace(prompt: string): string {
    const traceId = this.generateTraceId();
    this.currentTraceId = traceId;

    const trace: PipelineTrace = {
      traceId,
      timestamp: Date.now(),
      prompt,
      stages: [],
      decisions: [],
      explanations: [],
      metrics: {
        totalDuration: 0,
        stageDurations: new Map(),
        decisionCount: 0,
        confidenceScore: 0,
        recoveryCount: 0,
        warningCount: 0,
      },
    };

    this.traces.set(traceId, trace);
    return traceId;
  }

  /**
   * Log a pipeline stage
   */
  logStage(stageName: string, input: any, output: any, confidence: number, notes: string[] = []): void {
    if (!this.currentTraceId) return;

    const trace = this.traces.get(this.currentTraceId);
    if (!trace) return;

    const startTime = Date.now();
    const endTime = Date.now();
    const duration = endTime - startTime;

    const stage: PipelineStage = {
      stageName,
      startTime,
      endTime,
      duration,
      input,
      output,
      confidence,
      notes,
    };

    trace.stages.push(stage);
    trace.metrics.stageDurations.set(stageName, duration);
  }

  /**
   * Log a decision
   */
  logDecision(
    category: 'entity' | 'workflow' | 'page' | 'layout' | 'component' | 'style' | 'recovery',
    decision: string,
    alternatives: string[],
    rationale: string,
    confidence: number,
    impact: 'high' | 'medium' | 'low'
  ): void {
    if (!this.currentTraceId) return;

    const trace = this.traces.get(this.currentTraceId);
    if (!trace) return;

    const decisionLog: DecisionLog = {
      decisionId: this.generateDecisionId(),
      timestamp: Date.now(),
      category,
      decision,
      alternatives,
      rationale,
      confidence,
      impact,
    };

    trace.decisions.push(decisionLog);
    trace.metrics.decisionCount++;
  }

  /**
   * Log an explanation
   */
  logExplanation(target: string, explanation: string, evidence: string[], confidence: number): void {
    if (!this.currentTraceId) return;

    const trace = this.traces.get(this.currentTraceId);
    if (!trace) return;

    const explanationLog: Explanation = {
      explanationId: this.generateExplanationId(),
      timestamp: Date.now(),
      target,
      explanation,
      evidence,
      confidence,
    };

    trace.explanations.push(explanationLog);
  }

  /**
   * End the current trace
   */
  endTrace(): PipelineTrace | null {
    if (!this.currentTraceId) return null;

    const trace = this.traces.get(this.currentTraceId);
    if (!trace) return null;

    // Calculate metrics
    trace.metrics.totalDuration = Date.now() - trace.timestamp;
    trace.metrics.confidenceScore = this.calculateOverallConfidence(trace);
    trace.metrics.recoveryCount = trace.decisions.filter(d => d.category === 'recovery').length;
    trace.metrics.warningCount = trace.stages.filter(s => s.confidence < 0.7).length;

    this.currentTraceId = null;
    return trace;
  }

  /**
   * Get the current trace
   */
  getCurrentTrace(): PipelineTrace | null {
    if (!this.currentTraceId) return null;
    return this.traces.get(this.currentTraceId) || null;
  }

  /**
   * Get a trace by ID
   */
  getTrace(traceId: string): PipelineTrace | null {
    return this.traces.get(traceId) || null;
  }

  /**
   * Get all traces
   */
  getAllTraces(): PipelineTrace[] {
    return Array.from(this.traces.values());
  }

  /**
   * Generate a human-readable explanation of the generation process
   */
  generateExplanation(trace: PipelineTrace): string {
    const lines: string[] = [];

    lines.push(`# Generation Explanation`);
    lines.push(``);
    lines.push(`**Prompt:** ${trace.prompt}`);
    lines.push(`**Total Duration:** ${trace.metrics.totalDuration}ms`);
    lines.push(`**Overall Confidence:** ${(trace.metrics.confidenceScore * 100).toFixed(1)}%`);
    lines.push(``);

    // Stage summary
    lines.push(`## Pipeline Stages`);
    for (const stage of trace.stages) {
      lines.push(`- **${stage.stageName}**: ${stage.duration}ms (confidence: ${(stage.confidence * 100).toFixed(1)}%)`);
      if (stage.notes.length > 0) {
        for (const note of stage.notes) {
          lines.push(`  - ${note}`);
        }
      }
    }
    lines.push(``);

    // Key decisions
    lines.push(`## Key Decisions`);
    const highImpactDecisions = trace.decisions.filter(d => d.impact === 'high');
    for (const decision of highImpactDecisions) {
      lines.push(`- **${decision.category}**: ${decision.decision}`);
      lines.push(`  - Rationale: ${decision.rationale}`);
      lines.push(`  - Confidence: ${(decision.confidence * 100).toFixed(1)}%`);
      if (decision.alternatives.length > 0) {
        lines.push(`  - Alternatives considered: ${decision.alternatives.join(', ')}`);
      }
    }
    lines.push(``);

    // Explanations
    lines.push(`## Explanations`);
    for (const explanation of trace.explanations) {
      lines.push(`- **${explanation.target}**: ${explanation.explanation}`);
      if (explanation.evidence.length > 0) {
        lines.push(`  - Evidence: ${explanation.evidence.join(', ')}`);
      }
    }
    lines.push(``);

    // Metrics summary
    lines.push(`## Metrics Summary`);
    lines.push(`- Total stages: ${trace.stages.length}`);
    lines.push(`- Total decisions: ${trace.metrics.decisionCount}`);
    lines.push(`- Recovery actions: ${trace.metrics.recoveryCount}`);
    lines.push(`- Warnings: ${trace.metrics.warningCount}`);

    return lines.join('\n');
  }

  /**
   * Generate a decision tree visualization
   */
  generateDecisionTree(trace: PipelineTrace): string {
    const lines: string[] = [];

    lines.push(`# Decision Tree`);
    lines.push(``);

    for (const decision of trace.decisions) {
      lines.push(`${decision.category}/${decision.decisionId}`);
      lines.push(`├── Decision: ${decision.decision}`);
      lines.push(`├── Rationale: ${decision.rationale}`);
      lines.push(`├── Confidence: ${(decision.confidence * 100).toFixed(1)}%`);
      lines.push(`├── Impact: ${decision.impact}`);
      
      if (decision.alternatives.length > 0) {
        lines.push(`├── Alternatives:`);
        for (const alt of decision.alternatives) {
          lines.push(`│   ├── ${alt}`);
        }
      }
      
      lines.push(``);
    }

    return lines.join('\n');
  }

  /**
   * Calculate overall confidence from trace
   */
  private calculateOverallConfidence(trace: PipelineTrace): number {
    if (trace.stages.length === 0) return 0;

    const stageConfidence = trace.stages.reduce((sum, stage) => sum + stage.confidence, 0) / trace.stages.length;
    const decisionConfidence = trace.decisions.length > 0
      ? trace.decisions.reduce((sum, decision) => sum + decision.confidence, 0) / trace.decisions.length
      : 1.0;

    return (stageConfidence + decisionConfidence) / 2;
  }

  /**
   * Generate trace ID
   */
  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate decision ID
   */
  private generateDecisionId(): string {
    return `dec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate explanation ID
   */
  private generateExplanationId(): string {
    return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all traces
   */
  clearTraces(): void {
    this.traces.clear();
    this.currentTraceId = null;
  }

  /**
   * Get statistics across all traces
   */
  getStatistics(): {
    totalTraces: number;
    averageDuration: number;
    averageConfidence: number;
    totalDecisions: number;
    commonDecisions: Map<string, number>;
  } {
    const traces = this.getAllTraces();
    
    if (traces.length === 0) {
      return {
        totalTraces: 0,
        averageDuration: 0,
        averageConfidence: 0,
        totalDecisions: 0,
        commonDecisions: new Map(),
      };
    }

    const totalDuration = traces.reduce((sum, t) => sum + t.metrics.totalDuration, 0);
    const totalConfidence = traces.reduce((sum, t) => sum + t.metrics.confidenceScore, 0);
    const totalDecisions = traces.reduce((sum, t) => sum + t.metrics.decisionCount, 0);

    const commonDecisions = new Map<string, number>();
    for (const trace of traces) {
      for (const decision of trace.decisions) {
        const key = `${decision.category}:${decision.decision}`;
        const count = commonDecisions.get(key) || 0;
        commonDecisions.set(key, count + 1);
      }
    }

    return {
      totalTraces: traces.length,
      averageDuration: totalDuration / traces.length,
      averageConfidence: totalConfidence / traces.length,
      totalDecisions,
      commonDecisions,
    };
  }

  /**
   * Export trace as JSON
   */
  exportTrace(traceId: string): string | null {
    const trace = this.getTrace(traceId);
    if (!trace) return null;

    return JSON.stringify(trace, null, 2);
  }

  /**
   * Import trace from JSON
   */
  importTrace(json: string): string | null {
    try {
      const trace = JSON.parse(json) as PipelineTrace;
      this.traces.set(trace.traceId, trace);
      return trace.traceId;
    } catch (error) {
      return null;
    }
  }
}

export const pipelineObservability = new PipelineObservability();

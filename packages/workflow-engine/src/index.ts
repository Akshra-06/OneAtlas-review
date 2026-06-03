import { logger } from '@oneatlas/ai-engine';
import { ModelRouter, UnderstandingOrchestrator } from '@oneatlas/ai-engine';
import type { GenerationResult } from '@oneatlas/shared';
import type { PipelineExecuteOptions } from './pipeline/pipeline.executor';

import { pipelineExecutor } from './pipeline/pipeline.executor';
import { stateStore } from './state/state.store';
import { cacheService } from './optimization/cache.service';
import { retryService, withRetry } from './optimization/retry.service';
import { tokenTracker } from './optimization/token.tracker';

export { pipelineExecutor };
export { stateStore };
export { cacheService };
export { retryService, withRetry };
export { tokenTracker };

export interface RunPipelineOptions extends PipelineExecuteOptions {
  // Reserved for future options (e.g. regenerateParts, cacheKey)
}

/**
 * Top-level entry point for the generation pipeline.
 *
 * Accepts a raw user prompt, runs the UnderstandingOrchestrator to produce
 * an AppUnderstanding, then executes all PIPELINE_STEPS in sequence.
 *
 * The caller can pass onStageComplete to receive progress events suitable
 * for streaming as SSE back to the client.
 *
 * Returns the final GenerationResult synchronously (awaitable).
 */
export async function runGenerationPipeline(
  rawPrompt: string,
  projectId: string,
  orgId: string,
  options: RunPipelineOptions = {},
): Promise<GenerationResult> {
  // 1. Understand the prompt
  const router = new ModelRouter();
  const orchestrator = new UnderstandingOrchestrator(router);
  const { data: understanding } = await orchestrator.process(rawPrompt);
  console.log("[PIPELINE] Understanding complete, starting stateStore.init");
  try {
    const runId = await stateStore.init(projectId, orgId, rawPrompt);
    console.log("[PIPELINE] stateStore.init done, runId:", runId);
    const result = await pipelineExecutor.execute(runId, understanding, projectId, orgId, { onStageComplete: options.onStageComplete });
    console.log("[PIPELINE] executor done, result appName:", (result as any)?.appName);
    return result;
  } catch (err) {
    console.error("[PIPELINE] FATAL ERROR:", err);
    throw err;
  }

  // Attach the raw prompt to metadata so the pipeline can access it
  if (!understanding.metadata) {
    (understanding as any).metadata = {};
  }
  (understanding as any).metadata.rawPrompt = rawPrompt;

  // 2. Initialise pipeline state
  const runId = await stateStore.init(projectId, orgId, rawPrompt);

  // 3. Execute all pipeline steps, awaiting the full result
console.log("[PIPELINE] Starting executor with runId:", runId, "understanding:", !!understanding);
  const result = await pipelineExecutor.execute(
    runId,
    understanding,
    projectId,
    orgId,
    { onStageComplete: options.onStageComplete },
  );

  return result;
}

export { PIPELINE_STEPS } from './pipeline/generation.pipeline';
export type { PipelineContext } from './pipeline/generation.pipeline';
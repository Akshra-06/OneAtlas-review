import type { AppUnderstanding } from '@oneatlas/shared';
import { logger } from '@oneatlas/ai-engine';


import {
  pipelineExecutor,
} from './pipeline/pipeline.executor';

import {
  stateStore,
} from './state/state.store';

import {
  cacheService,
} from './optimization/cache.service';

import {
  retryService,
  withRetry,
} from './optimization/retry.service';

import {
  tokenTracker,
} from './optimization/token.tracker';

export {
  pipelineExecutor,
};

export {
  stateStore,
};

export {
  cacheService,
};

export {
  retryService,
  withRetry,
};

export {
  tokenTracker,
};

export async function runGenerationPipeline(
  understanding: AppUnderstanding,
  projectId: string,
  orgId: string,
): Promise<{ runId: string }> {
  const rawPrompt =
    understanding.metadata?.rawPrompt ?? '';

  const runId =
    await stateStore.init(
      projectId,
      orgId,
      rawPrompt,
    );

  void pipelineExecutor
    .execute(
      runId,
      understanding,
      projectId,
      orgId,
    )
    .catch((error: unknown) => {
      logger.error('Workflow', 'PIPELINE_FAILED', `Pipeline failed for run ${runId}`, { error: error instanceof Error ? error.message : String(error) });
    });

  return {
    runId,
  };
}

export { PIPELINE_STEPS } from './pipeline/generation.pipeline';
export type { PipelineContext } from './pipeline/generation.pipeline';

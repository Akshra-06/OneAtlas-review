// =============================================================================
// apps/api/src/workers/build.worker.ts
// Build job processor.
// =============================================================================

import type { AppUnderstanding } from "@oneatlas/shared";
import { appEvents } from "../events/emitter";
import { logger } from "../lib/logger";
import { getWorker } from "../lib/queue/bullmq";
import { AIService } from "../services/ai.service";
import { DeploymentService } from "../services/deployment.service";
import { ProjectService } from "../services/project.service";
import {
  drainBuildJobs,
  type BuildJob,
  BUILD_QUEUE_NAME,
} from "../queues/build.queue";
import { createWorkerPool } from "./worker-pool";

export interface BuildWorkerResult {
  jobId: string;
  understanding: AppUnderstanding;
}

const buildLogger = logger.child({ queue: BUILD_QUEUE_NAME });
const buildWorkerPool = createWorkerPool({
  name: "build-worker-pool",
  maxWorkers: 2,
  minWorkers: 1,
  idleTimeoutMs: 10_000,
});

function executeBuildJob(job: BuildJob): Promise<BuildWorkerResult> {
  return buildWorkerPool.submit<BuildWorkerResult>({
    id: job.id,
    priority: job.priority ?? 0,
    timeoutMs: 300_000,
    execute: async () => processBuildJob(job),
  });
}

export async function processBuildJob(job: BuildJob): Promise<BuildWorkerResult> {
  const log = buildLogger.child({
    jobId: job.id,
    orgId: job.payload.orgId,
    projectId: job.payload.projectId,
  });

  const aiService = new AIService();
  const projectService = new ProjectService();
  const deploymentService = new DeploymentService();
  const startedAt = new Date().toISOString();

  log.info("worker.job.started", {
    type: job.type,
    priority: job.priority ?? 0,
  });

  appEvents.emit("ai.started", {
    orgId: job.payload.orgId,
    projectId: job.payload.projectId,
    userId: job.payload.triggeredByUserId,
    provider: "bullmq",
    model: "build-worker",
    metadata: {
      jobId: job.id,
      projectType: job.payload.projectType,
      startedAt,
    },
  });

  const latestDeployment = await deploymentService.getLatest(
    job.payload.orgId,
    job.payload.projectId
  );

  if (latestDeployment && latestDeployment.status === "QUEUED") {
    await deploymentService.updateStatus(
      job.payload.orgId,
      latestDeployment.id,
      "BUILDING"
    );
  }

  await projectService.update(job.payload.orgId, job.payload.projectId, {
    status: "ACTIVE",
    metadata: {
      buildStatus: "running",
      buildJobId: job.id,
      buildStartedAt: startedAt,
      buildPrompt: job.payload.prompt,
      buildProjectType: job.payload.projectType,
    },
  });

  try {
    const understanding = await aiService.understandPrompt(job.payload.prompt);

    await projectService.update(job.payload.orgId, job.payload.projectId, {
      metadata: {
        buildStatus: "completed",
        buildJobId: job.id,
        buildCompletedAt: new Date().toISOString(),
      },
    });

    if (latestDeployment && latestDeployment.status === "BUILDING") {
      await deploymentService.updateStatus(
        job.payload.orgId,
        latestDeployment.id,
        "DEPLOYING"
      );
    }

    appEvents.emit("ai.completed", {
      orgId: job.payload.orgId,
      projectId: job.payload.projectId,
      userId: job.payload.triggeredByUserId,
      provider: "bullmq",
      model: "build-worker",
      metadata: {
        jobId: job.id,
        projectType: job.payload.projectType,
      },
    });

    log.info("worker.job.completed", { type: job.type });

    return {
      jobId: job.id,
      understanding,
    };
  } catch (error) {
    await projectService.update(job.payload.orgId, job.payload.projectId, {
      metadata: {
        buildStatus: "failed",
        buildJobId: job.id,
        buildFailedAt: new Date().toISOString(),
      },
    });

    if (latestDeployment) {
      try {
        await deploymentService.updateStatus(
          job.payload.orgId,
          latestDeployment.id,
          "FAILED",
          {
            errorMessage: error instanceof Error ? error.message : "Unknown build failure",
          }
        );
      } catch {
        // Best-effort status update.
      }
    }

    appEvents.emit("ai.failed", {
      orgId: job.payload.orgId,
      projectId: job.payload.projectId,
      userId: job.payload.triggeredByUserId,
      provider: "bullmq",
      model: "build-worker",
      metadata: {
        jobId: job.id,
        projectType: job.payload.projectType,
      },
    });

    log.error("worker.job.failed", {
      error,
      type: job.type,
    });

    throw error;
  }
}

export function startBuildWorker() {
  return getWorker<BuildJob, BuildWorkerResult>(
    BUILD_QUEUE_NAME,
    async (bullJob) => executeBuildJob(bullJob.data),
    { concurrency: 2 }
  );
}

export const buildBullWorker = startBuildWorker();

export async function runBuildWorker(
  batchSize = 1
): Promise<BuildWorkerResult[]> {
  const jobs = await drainBuildJobs(batchSize);
  const settled = await Promise.allSettled(jobs.map((job) => executeBuildJob(job)));
  const results: BuildWorkerResult[] = [];

  for (const item of settled) {
    if (item.status === "fulfilled") {
      results.push(item.value);
    }
  }

  return results;
}

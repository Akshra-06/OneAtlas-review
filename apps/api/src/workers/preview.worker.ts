// =============================================================================
// apps/api/src/workers/preview.worker.ts
// Preview job processor.
// =============================================================================

import { appEvents } from "../events/emitter";
import { logger } from "../lib/logger";
import { getWorker } from "../lib/queue/client";
import { ProjectService } from "../services/project.service";
import {
  drainPreviewJobs,
  type PreviewJob,
  PREVIEW_QUEUE_NAME,
} from "../queues/preview.queue";

export interface PreviewWorkerResult {
  jobId: string;
  status: "started" | "stopped" | "validated";
  previewUrl?: string;
}

const previewLogger = logger.child({ queue: PREVIEW_QUEUE_NAME });

function buildPreviewUrl(project: { slug: string; subdomain?: string | null }, job: PreviewJob): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://preview.oneatlas.app";
  const projectKey = project.subdomain ?? project.slug;
  return `${baseUrl.replace(/\/$/, "")}/preview/${projectKey}/${job.id}?action=${job.payload.action}`;
}

export async function processPreviewJob(job: PreviewJob): Promise<PreviewWorkerResult> {
  const log = previewLogger.child({
    jobId: job.id,
    orgId: job.payload.orgId,
    projectId: job.payload.projectId,
  });

  const projectService = new ProjectService();
  log.info("worker.job.started", { type: job.type, action: job.payload.action });

  const project = await projectService.getById(job.payload.orgId, job.payload.projectId);
  if (!project) {
    throw new Error(`Project ${job.payload.projectId} not found in org ${job.payload.orgId}`);
  }

  const previewUrl = buildPreviewUrl(project, job);

  const statusByAction: Record<PreviewJob["payload"]["action"], PreviewWorkerResult["status"]> = {
    start: "started",
    stop: "stopped",
    validate: "validated",
  };

  const status = statusByAction[job.payload.action];

  await projectService.update(job.payload.orgId, job.payload.projectId, {
    status: "ACTIVE",
    metadata: {
      previewStatus: status,
      previewJobId: job.id,
      previewUrl,
      previewAction: job.payload.action,
      previewUpdatedAt: new Date().toISOString(),
    },
  });

  appEvents.emit("project.updated", {
    orgId: job.payload.orgId,
    projectId: job.payload.projectId,
    userId: job.payload.orgId,
    name: project.name,
    metadata: {
      previewStatus: status,
      previewUrl,
    },
  });

  log.info("worker.job.completed", { type: job.type, action: job.payload.action, previewUrl });

  return { jobId: job.id, status, previewUrl };
}

export function startPreviewWorker() {
  return getWorker<PreviewJob, PreviewWorkerResult>(
    PREVIEW_QUEUE_NAME,
    async (bullJob) => processPreviewJob(bullJob.data),
    { concurrency: 5 }
  );
}

export const previewBullWorker = startPreviewWorker();

export async function runPreviewWorker(
  batchSize = 1
): Promise<PreviewWorkerResult[]> {
  const jobs = await drainPreviewJobs(batchSize);
  const results: PreviewWorkerResult[] = [];

  for (const job of jobs) {
    try {
      results.push(await processPreviewJob(job));
    } catch {
      // Logged by processPreviewJob; continue.
    }
  }

  return results;
}

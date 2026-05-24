// =============================================================================
// apps/api/src/queues/preview.queue.ts
// Preview job queue adapter.
// =============================================================================

import { getQueue, type QueueJobRecord } from "../lib/queue/client";

export const PREVIEW_QUEUE_NAME = "preview" as const;

export interface PreviewJobPayload {
  orgId: string;
  projectId: string;
  action: "start" | "stop" | "validate";
}

export interface PreviewJob extends QueueJobRecord {
  type: typeof PREVIEW_QUEUE_NAME;
  payload: PreviewJobPayload;
}

export interface PreviewJobOptions {
  id?: string;
  maxRetries?: number;
}

const previewJobs: PreviewJob[] = [];

function getPreviewQueue() {
  return getQueue<PreviewJob>(PREVIEW_QUEUE_NAME);
}

function createPreviewJob(
  payload: PreviewJobPayload,
  options: PreviewJobOptions = {}
): PreviewJob {
  return {
    id: options.id ?? crypto.randomUUID(),
    type: PREVIEW_QUEUE_NAME,
    createdAt: new Date().toISOString(),
    attempts: 0,
    maxRetries: options.maxRetries ?? 3,
    payload,
  };
}

export async function addPreviewJob(
  payload: PreviewJobPayload,
  options: PreviewJobOptions = {}
): Promise<PreviewJob> {
  const job = createPreviewJob(payload, options);
  const queue = getPreviewQueue();

  if (queue) {
    await queue.add(PREVIEW_QUEUE_NAME, job, {
      jobId: job.id,
      attempts: job.maxRetries,
      backoff: {
        type: "custom",
        delay: 1_000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  } else {
    previewJobs.push(job);
  }

  return job;
}

export async function enqueuePreviewJob(
  payload: PreviewJobPayload,
  options: PreviewJobOptions = {}
): Promise<PreviewJob> {
  return addPreviewJob(payload, options);
}

export async function drainPreviewJobs(limit = 1): Promise<PreviewJob[]> {
  return previewJobs.splice(0, Math.max(0, limit));
}

export async function getPreviewQueueSize(): Promise<number> {
  const queue = getPreviewQueue();
  if (queue) {
    const counts = await queue.getJobCounts("waiting", "active", "delayed", "paused");
    return (
      (counts.waiting ?? 0) +
      (counts.active ?? 0) +
      (counts.delayed ?? 0) +
      (counts.paused ?? 0)
    );
  }

  return previewJobs.length;
}

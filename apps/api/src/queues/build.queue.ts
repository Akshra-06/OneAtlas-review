// =============================================================================
// apps/api/src/queues/build.queue.ts
// Build job queue adapter.
// =============================================================================

import { getQueue, type QueueJobRecord } from "../lib/queue/bullmq";

export const BUILD_QUEUE_NAME = "build" as const;

export interface BuildJobPayload {
  orgId: string;
  projectId: string;
  prompt: string;
  projectType: string;
  triggeredByUserId: string;
}

export interface BuildJob extends QueueJobRecord {
  type: typeof BUILD_QUEUE_NAME;
  payload: BuildJobPayload;
  priority?: number;
}

export interface BuildJobOptions {
  id?: string;
  maxRetries?: number;
  priority?: number;
}

const buildJobs: BuildJob[] = [];

function getBuildQueue() {
  return getQueue<BuildJob>(BUILD_QUEUE_NAME);
}

function createBuildJob(
  payload: BuildJobPayload,
  options: BuildJobOptions = {}
): BuildJob {
  return {
    id: options.id ?? crypto.randomUUID(),
    type: BUILD_QUEUE_NAME,
    createdAt: new Date().toISOString(),
    attempts: 0,
    maxRetries: options.maxRetries ?? 3,
    priority: options.priority,
    payload,
  };
}

export async function addBuildJob(
  payload: BuildJobPayload,
  options: BuildJobOptions = {}
): Promise<BuildJob> {
  const job = createBuildJob(payload, options);
  const queue = getBuildQueue();

  if (queue) {
    await queue.add(BUILD_QUEUE_NAME, job, {
      jobId: job.id,
      priority: job.priority,
      attempts: job.maxRetries,
      backoff: {
        type: "custom",
        delay: 1_000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });
  } else {
    buildJobs.push(job);
  }

  return job;
}

export async function enqueueBuildJob(
  payload: BuildJobPayload,
  options: BuildJobOptions = {}
): Promise<BuildJob> {
  return addBuildJob(payload, options);
}

export async function drainBuildJobs(limit = 1): Promise<BuildJob[]> {
  return buildJobs.splice(0, Math.max(0, limit));
}

export async function getBuildQueueSize(): Promise<number> {
  const queue = getBuildQueue();
  if (queue) {
    const counts = await queue.getJobCounts("waiting", "active", "delayed", "paused");
    return (
      (counts.waiting ?? 0) +
      (counts.active ?? 0) +
      (counts.delayed ?? 0) +
      (counts.paused ?? 0)
    );
  }

  return buildJobs.length;
}

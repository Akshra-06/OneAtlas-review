// =============================================================================
// apps/api/src/queues/deploy.queue.ts
// Deploy job queue adapter.
// =============================================================================

import { getQueue, type QueueJobRecord } from "../lib/queue/client";

export const DEPLOY_QUEUE_NAME = "deploy" as const;

export interface DeployJobPayload {
  orgId: string;
  projectId: string;
  deploymentId: string;
  triggeredByUserId: string;
}

export interface DeployJob extends QueueJobRecord {
  type: typeof DEPLOY_QUEUE_NAME;
  payload: DeployJobPayload;
}

export interface DeployJobOptions {
  id?: string;
  maxRetries?: number;
}

const deployJobs: DeployJob[] = [];

function getDeployQueue() {
  return getQueue<DeployJob>(DEPLOY_QUEUE_NAME);
}

function createDeployJob(
  payload: DeployJobPayload,
  options: DeployJobOptions = {}
): DeployJob {
  return {
    id: options.id ?? crypto.randomUUID(),
    type: DEPLOY_QUEUE_NAME,
    createdAt: new Date().toISOString(),
    attempts: 0,
    maxRetries: options.maxRetries ?? 3,
    payload,
  };
}

export async function addDeployJob(
  payload: DeployJobPayload,
  options: DeployJobOptions = {}
): Promise<DeployJob> {
  const job = createDeployJob(payload, options);
  const queue = getDeployQueue();

  if (queue) {
    await queue.add(DEPLOY_QUEUE_NAME, job, {
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
    deployJobs.push(job);
  }

  return job;
}

export async function enqueueDeployJob(
  payload: DeployJobPayload,
  options: DeployJobOptions = {}
): Promise<DeployJob> {
  return addDeployJob(payload, options);
}

export async function drainDeployJobs(limit = 1): Promise<DeployJob[]> {
  return deployJobs.splice(0, Math.max(0, limit));
}

export async function getDeployQueueSize(): Promise<number> {
  const queue = getDeployQueue();
  if (queue) {
    const counts = await queue.getJobCounts("waiting", "active", "delayed", "paused");
    return (
      (counts.waiting ?? 0) +
      (counts.active ?? 0) +
      (counts.delayed ?? 0) +
      (counts.paused ?? 0)
    );
  }

  return deployJobs.length;
}

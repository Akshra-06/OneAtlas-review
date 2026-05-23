// =============================================================================
// apps/api/src/queues/workflow.queue.ts
// Workflow execution queue adapter.
// =============================================================================

import { getQueue, type QueueJobRecord } from "../lib/queue/client";

export const WORKFLOW_QUEUE_NAME = "workflow" as const;

export interface WorkflowSchedule {
  cron: string;
  timezone?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  action: string;
  input?: Record<string, unknown>;
}

export interface WorkflowJobPayload {
  orgId: string;
  projectId: string;
  workflowId: string;
  triggeredByUserId: string;
  inputData?: Record<string, unknown>;
  steps?: WorkflowStep[];
  schedule?: WorkflowSchedule;
}

export interface WorkflowJob extends QueueJobRecord {
  type: typeof WORKFLOW_QUEUE_NAME;
  payload: WorkflowJobPayload;
}

export interface WorkflowJobOptions {
  id?: string;
  maxRetries?: number;
  schedule?: WorkflowSchedule;
}

const workflowJobs: WorkflowJob[] = [];

function getWorkflowQueue() {
  return getQueue<WorkflowJob>(WORKFLOW_QUEUE_NAME);
}

function createWorkflowJob(
  payload: WorkflowJobPayload,
  options: WorkflowJobOptions = {}
): WorkflowJob {
  return {
    id: options.id ?? crypto.randomUUID(),
    type: WORKFLOW_QUEUE_NAME,
    createdAt: new Date().toISOString(),
    attempts: 0,
    maxRetries: options.maxRetries ?? 3,
    payload: {
      ...payload,
      schedule: options.schedule ?? payload.schedule,
    },
  };
}

export async function addWorkflowJob(
  payload: WorkflowJobPayload,
  options: WorkflowJobOptions = {}
): Promise<WorkflowJob> {
  const job = createWorkflowJob(payload, options);
  const queue = getWorkflowQueue();

  if (queue) {
    const repeat = job.payload.schedule
      ? {
          pattern: job.payload.schedule.cron,
          tz: job.payload.schedule.timezone,
          startDate: job.payload.schedule.startDate
            ? new Date(job.payload.schedule.startDate)
            : undefined,
          endDate: job.payload.schedule.endDate
            ? new Date(job.payload.schedule.endDate)
            : undefined,
          limit: job.payload.schedule.limit,
        }
      : undefined;

    await queue.add(WORKFLOW_QUEUE_NAME, job, {
      jobId: job.id,
      attempts: job.maxRetries,
      backoff: {
        type: "custom",
        delay: 1_000,
      },
      repeat,
      removeOnComplete: true,
      removeOnFail: false,
    });
  } else {
    workflowJobs.push(job);
  }

  return job;
}

export async function enqueueWorkflowJob(
  payload: WorkflowJobPayload,
  options: WorkflowJobOptions = {}
): Promise<WorkflowJob> {
  return addWorkflowJob(payload, options);
}

export async function drainWorkflowJobs(limit = 1): Promise<WorkflowJob[]> {
  return workflowJobs.splice(0, Math.max(0, limit));
}

export async function getWorkflowQueueSize(): Promise<number> {
  const queue = getWorkflowQueue();
  if (queue) {
    const counts = await queue.getJobCounts("waiting", "active", "delayed", "paused");
    return (
      (counts.waiting ?? 0) +
      (counts.active ?? 0) +
      (counts.delayed ?? 0) +
      (counts.paused ?? 0)
    );
  }

  return workflowJobs.length;
}

// =============================================================================
// apps/api/src/workers/workflow.worker.ts
// Workflow execution job processor.
// =============================================================================

import { appEvents } from "../events/emitter";
import { logger } from "../lib/logger";
import { getWorker } from "../lib/queue/bullmq";
import { WorkflowService } from "../services/workflow.service";
import {
  drainWorkflowJobs,
  type WorkflowJob,
  type WorkflowStep,
  WORKFLOW_QUEUE_NAME,
} from "../queues/workflow.queue";
import type { WorkflowRun } from "@oneatlas/db";

export interface WorkflowWorkerResult {
  jobId: string;
  run: WorkflowRun;
}

const workflowLogger = logger.child({ queue: WORKFLOW_QUEUE_NAME });

type StepTraceEntry = {
  stepId: string;
  name: string;
  status: "running" | "completed" | "failed";
  startedAt: string;
  finishedAt?: string;
  error?: string;
};

async function executeWorkflowStep(
  step: WorkflowStep,
  context: Record<string, unknown>
): Promise<Record<string, unknown>> {
  switch (step.action) {
    case "set":
      return { ...context, ...(step.input ?? {}) };
    case "append":
      return {
        ...context,
        appended: [...(Array.isArray(context.appended) ? (context.appended as unknown[]) : []), step.input ?? {}],
      };
    case "delay":
      return { ...context, delayed: true, delayMs: step.input?.delayMs ?? 0 };
    case "webhook":
      return { ...context, webhookDelivered: true, webhookTarget: step.input?.url ?? null };
    default:
      return { ...context, [`step_${step.id}`]: step.input ?? null };
  }
}

export async function processWorkflowJob(
  job: WorkflowJob
): Promise<WorkflowWorkerResult> {
  const log = workflowLogger.child({
    jobId: job.id,
    orgId: job.payload.orgId,
    projectId: job.payload.projectId,
    workflowId: job.payload.workflowId,
  });

  const workflowService = new WorkflowService();
  log.info("worker.job.started", { type: job.type });

  appEvents.emit("workflow.started", {
    orgId: job.payload.orgId,
    projectId: job.payload.projectId,
    workflowId: job.payload.workflowId,
    userId: job.payload.triggeredByUserId,
    status: "RUNNING",
    metadata: { jobId: job.id },
  });

  const workflow = await workflowService.getById(job.payload.orgId, job.payload.workflowId);
  if (!workflow) {
    throw new Error(`Workflow ${job.payload.workflowId} not found in org ${job.payload.orgId}`);
  }

  const steps = job.payload.steps ?? [];
  const trace: StepTraceEntry[] = [];
  let context: Record<string, unknown> = {
    ...(job.payload.inputData ?? {}),
  };

  const run = await workflowService.createRun(job.payload.orgId, job.payload.workflowId, {
    status: "RUNNING",
    inputData: job.payload.inputData ?? {},
    trace: [],
    startedAt: new Date(),
  } as never);

  try {
    for (const step of steps) {
      const startedAt = new Date().toISOString();
      trace.push({
        stepId: step.id,
        name: step.name,
        status: "running",
        startedAt,
      });

      context = await executeWorkflowStep(step, context);

      const traceIndex = trace.length - 1;
      const completedTrace = trace[traceIndex];

      if (completedTrace) {
        trace[traceIndex] = {
          ...completedTrace,
          status: "completed",
          finishedAt: new Date().toISOString(),
        };
      }

      await workflowService.updateRun(job.payload.orgId, run.id, {
        trace: trace as never,
        outputData: context as never,
      });
    }

    const completedRun = await workflowService.updateRun(job.payload.orgId, run.id, {
      status: "SUCCESS",
      trace: trace as never,
      outputData: context as never,
      finishedAt: new Date(),
      duration: Date.now() - new Date(run.createdAt).getTime(),
    } as never);

    await workflowService.incrementRunStats(job.payload.orgId, job.payload.workflowId, "success");

    appEvents.emit("workflow.completed", {
      orgId: job.payload.orgId,
      projectId: job.payload.projectId,
      workflowId: job.payload.workflowId,
      userId: job.payload.triggeredByUserId,
      status: "SUCCESS",
      metadata: { jobId: job.id, runId: completedRun.id },
    });

    log.info("worker.job.completed", { type: job.type, runId: completedRun.id });

    return {
      jobId: job.id,
      run: completedRun,
    };
  } catch (error) {
    const failureMessage = error instanceof Error ? error.message : "Unknown workflow failure";

    for (const traceEntry of trace) {
      if (traceEntry.status === "running") {
        traceEntry.status = "failed";
        traceEntry.error = failureMessage;
        traceEntry.finishedAt = new Date().toISOString();
      }
    }

    const failedRun = await workflowService.updateRun(job.payload.orgId, run.id, {
      status: "FAILED",
      trace: trace as never,
      errorMessage: failureMessage,
      finishedAt: new Date(),
      duration: Date.now() - new Date(run.createdAt).getTime(),
    } as never);

    await workflowService.incrementRunStats(job.payload.orgId, job.payload.workflowId, "failed");

    appEvents.emit("workflow.failed", {
      orgId: job.payload.orgId,
      projectId: job.payload.projectId,
      workflowId: job.payload.workflowId,
      userId: job.payload.triggeredByUserId,
      status: "FAILED",
      metadata: { jobId: job.id, runId: failedRun.id, error: failureMessage },
    });

    log.error("worker.job.failed", { error, type: job.type, runId: failedRun.id });

    throw error;
  }
}

export function startWorkflowWorker() {
  return getWorker<WorkflowJob, WorkflowWorkerResult>(
    WORKFLOW_QUEUE_NAME,
    async (bullJob) => processWorkflowJob(bullJob.data),
    { concurrency: 10 }
  );
}

export const workflowBullWorker = startWorkflowWorker();

export async function runWorkflowWorker(
  batchSize = 1
): Promise<WorkflowWorkerResult[]> {
  const jobs = await drainWorkflowJobs(batchSize);
  const results: WorkflowWorkerResult[] = [];

  for (const job of jobs) {
    try {
      results.push(await processWorkflowJob(job));
    } catch {
      // Logged by processWorkflowJob; continue.
    }
  }

  return results;
}

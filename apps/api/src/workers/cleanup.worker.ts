// =============================================================================
// apps/api/src/workers/cleanup.worker.ts
// Cleanup job processor.
// =============================================================================

import { prisma } from "@oneatlas/db";
import { appEvents } from "../events/emitter";
import { logger } from "../lib/logger";
import { deleteWorker, removeDnsRecord, buildWorkerName } from "../lib/cloudflare";
import { getWorker, type QueueJobRecord } from "../lib/queue/client";
import { DeploymentService } from "../services/deployment.service";
import { ProjectService } from "../services/project.service";

export type CleanupJobKind = "deployment-sync" | "orphaned-preview";

export interface CleanupJob {
  id: string;
  orgId: string;
  kind: CleanupJobKind;
  payload: {
    deploymentId?: string;
    projectId?: string;
  };
}

export interface CleanupWorkerResult {
  jobId: string;
  kind: CleanupJobKind;
  completed: boolean;
}

const cleanupLogger = logger.child({ queue: "cleanup" });

export interface CleanupJob extends QueueJobRecord {
  orgId: string;
  kind: CleanupJobKind;
  payload: {
    deploymentId?: string;
    projectId?: string;
  };
}

async function cleanupOrphanedPreview(
  job: Pick<CleanupJob, "orgId" | "kind" | "payload">
): Promise<void> {
  const projectService = new ProjectService();
  const projectId = job.payload.projectId;

  if (!projectId) {
    return;
  }

  const project = await projectService.getById(job.orgId, projectId);
  if (!project) {
    return;
  }

  await projectService.update(job.orgId, projectId, {
    metadata: {
      previewStatus: "stopped",
      previewCleanedAt: new Date().toISOString(),
    },
  });

  if (project.subdomain) {
    await removeDnsRecord(project.subdomain).catch(() => undefined);
  }

  if (project.slug) {
    const deployment = await prisma.deployment.findFirst({
      where: { projectId, project: { orgId: job.orgId } },
      orderBy: { version: "desc" },
    });

    if (deployment?.cfWorkerName) {
      await deleteWorker(deployment.cfWorkerName).catch(() => undefined);
    } else if (deployment) {
      const workerName = buildWorkerName(project.slug, deployment.env as "PREVIEW" | "PRODUCTION", deployment.version);
      await deleteWorker(workerName).catch(() => undefined);
    }
  }

  appEvents.emit("project.updated", {
    orgId: job.orgId,
    projectId,
    userId: job.orgId,
    name: project.name,
    metadata: {
      previewStatus: "stopped",
      previewCleanedAt: new Date().toISOString(),
    },
  });
}

export async function processCleanupJob(
  job: CleanupJob
): Promise<CleanupWorkerResult> {
  const log = cleanupLogger.child({ jobId: job.id, orgId: job.orgId, kind: job.kind });
  log.info("worker.job.started", { type: job.kind });

  const deploymentService = new DeploymentService();

  if (job.kind === "deployment-sync") {
    if (!job.payload.deploymentId) {
      throw new Error("cleanup job is missing deploymentId");
    }

    await deploymentService.syncDeployStatus(job.payload.deploymentId);
    log.info("worker.job.completed", { type: job.kind });

    return {
      jobId: job.id,
      kind: job.kind,
      completed: true,
    };
  }

  await cleanupOrphanedPreview({
    orgId: job.orgId,
    kind: job.kind,
    payload: job.payload,
  });

  log.info("worker.job.completed", { type: job.kind });

  return {
    jobId: job.id,
    kind: job.kind,
    completed: true,
  };
}

export function startCleanupWorker() {
  return getWorker<CleanupJob, CleanupWorkerResult>(
    "cleanup",
    async (bullJob) => processCleanupJob(bullJob.data),
    { concurrency: 1 }
  );
}

export const cleanupBullWorker = startCleanupWorker();

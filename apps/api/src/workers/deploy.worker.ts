// =============================================================================
// apps/api/src/workers/deploy.worker.ts
// Deploy job processor.
// =============================================================================

import { prisma } from "@oneatlas/db";
import { appEvents } from "../events/emitter";
import { logger } from "../lib/logger";
import { addDnsRecord, deleteWorker, deployWorker, removeDnsRecord, buildWorkerName } from "../lib/cloudflare";
import type { DeploymentResult } from "../lib/deploymentService";
import { getWorker } from "../lib/queue/bullmq";
import { DeploymentService } from "../services/deployment.service";
import {
  drainDeployJobs,
  type DeployJob,
  DEPLOY_QUEUE_NAME,
} from "../queues/deploy.queue";
import { createWorkerPool } from "./worker-pool";

export interface DeployWorkerResult {
  jobId: string;
  result: DeploymentResult;
}

const deployLogger = logger.child({ queue: DEPLOY_QUEUE_NAME });
const deployWorkerPool = createWorkerPool({
  name: "deploy-worker-pool",
  maxWorkers: 3,
  minWorkers: 1,
  idleTimeoutMs: 10_000,
});

function executeDeployJob(job: DeployJob): Promise<DeployWorkerResult> {
  return deployWorkerPool.submit<DeployWorkerResult>({
    id: job.id,
    priority: 0,
    timeoutMs: 600_000,
    execute: async () => processDeployJob(job),
  });
}

function buildWorkerScript(params: {
  projectSlug: string;
  orgSlug: string;
  codeSnapshot: Record<string, unknown>;
  apiBaseUrl: string;
}): string {
  return `const APP_CONFIG = ${JSON.stringify({
    projectSlug: params.projectSlug,
    orgSlug: params.orgSlug,
    pages: params.codeSnapshot.pages ?? [],
    apiRoutes: params.codeSnapshot.apiRoutes ?? [],
    metadata: params.codeSnapshot.metadata ?? {},
    apiBase: params.apiBaseUrl,
  })};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/__config") {
      return new Response(JSON.stringify(APP_CONFIG), { headers: { "Content-Type": "application/json" } });
    }
    return new Response("OneAtlas worker placeholder", { status: 200 });
  },
};`;
}

export async function processDeployJob(job: DeployJob): Promise<DeployWorkerResult> {
  const log = deployLogger.child({
    jobId: job.id,
    orgId: job.payload.orgId,
    projectId: job.payload.projectId,
    deploymentId: job.payload.deploymentId,
  });

  const deploymentService = new DeploymentService();

  log.info("worker.job.started", { type: job.type });

  appEvents.emit("deployment.started", {
    orgId: job.payload.orgId,
    projectId: job.payload.projectId,
    deploymentId: job.payload.deploymentId,
    userId: job.payload.triggeredByUserId,
    status: "BUILDING",
    metadata: { jobId: job.id },
  });

  const deployment = await prisma.deployment.findFirst({
    where: { id: job.payload.deploymentId, project: { orgId: job.payload.orgId } },
    include: {
      project: {
        include: {
          org: { select: { slug: true } },
        },
      },
    },
  });

  if (!deployment) {
    throw new Error(`Deployment ${job.payload.deploymentId} not found`);
  }

  if (deployment.status !== "QUEUED") {
    throw new Error(`Deployment ${deployment.id} is ${deployment.status}, expected QUEUED`);
  }

  const project = deployment.project;
  const codeSnapshot = (deployment.codeSnapshot ?? project.generatedCode ?? {}) as Record<string, unknown>;
  const workerName = buildWorkerName(project.slug, deployment.env as "PREVIEW" | "PRODUCTION", deployment.version);
  const script = buildWorkerScript({
    projectSlug: project.slug,
    orgSlug: project.org.slug,
    codeSnapshot,
    apiBaseUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://api.oneatlas.app",
  });

  await deploymentService.updateStatus(job.payload.orgId, deployment.id, "BUILDING");

  let deployedWorker = false;
  let dnsCreated = false;

  try {
    const deployed = await deployWorker({ workerName, script });
    deployedWorker = true;

    let deployedUrl = deployed.deployedUrl;

    if (deployment.env === "PRODUCTION") {
      await addDnsRecord(project.subdomain, workerName);
      dnsCreated = true;
      deployedUrl = `https://${project.subdomain}.${process.env.NEXT_PUBLIC_APP_DOMAIN ?? "oneatlas.app"}`;
    }

    const buildDuration = Date.now() - new Date(deployment.createdAt).getTime();

    await deploymentService.updateStatus(job.payload.orgId, deployment.id, "LIVE", {
      deployedUrl,
      deployedAt: new Date(),
    });

    appEvents.emit("deployment.completed", {
      orgId: job.payload.orgId,
      projectId: job.payload.projectId,
      deploymentId: job.payload.deploymentId,
      userId: job.payload.triggeredByUserId,
      status: "LIVE",
      metadata: { jobId: job.id, workerName, deployedUrl, buildDuration },
    });

    log.info("worker.job.completed", { type: job.type, workerName, deployedUrl });

    return {
      jobId: job.id,
      result: {
        deploymentId: deployment.id,
        status: "LIVE",
        deployedUrl,
        workerName,
        buildDuration,
      },
    };
  } catch (error) {
    if (dnsCreated) {
      await removeDnsRecord(project.subdomain).catch(() => undefined);
    }

    if (deployedWorker) {
      await deleteWorker(workerName).catch(() => undefined);
    }

    await deploymentService.updateStatus(job.payload.orgId, deployment.id, "FAILED", {
      errorMessage: error instanceof Error ? error.message : "Unknown deployment failure",
    }).catch(() => undefined);

    appEvents.emit("deployment.failed", {
      orgId: job.payload.orgId,
      projectId: job.payload.projectId,
      deploymentId: job.payload.deploymentId,
      userId: job.payload.triggeredByUserId,
      status: "FAILED",
      metadata: {
        jobId: job.id,
        workerName,
        error: error instanceof Error ? error.message : "Unknown deployment failure",
      },
    });

    log.error("worker.job.failed", { error, type: job.type, workerName });
    throw error;
  }
}

export function startDeployWorker() {
  return getWorker<DeployJob, DeployWorkerResult>(
    DEPLOY_QUEUE_NAME,
    async (bullJob) => executeDeployJob(bullJob.data),
    { concurrency: 3 }
  );
}

export const deployBullWorker = startDeployWorker();

export async function runDeployWorker(
  batchSize = 1
): Promise<DeployWorkerResult[]> {
  const jobs = await drainDeployJobs(batchSize);
  const settled = await Promise.allSettled(jobs.map((job) => executeDeployJob(job)));
  const results: DeployWorkerResult[] = [];

  for (const item of settled) {
    if (item.status === "fulfilled") {
      results.push(item.value);
    }
  }

  return results;
}

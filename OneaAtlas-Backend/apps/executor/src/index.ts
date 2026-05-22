import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables FIRST before any other imports that may read env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { Redis } from '@upstash/redis';
import { prisma } from '@oneatlas/db';
import { ProcessRegistry } from './process.registry';
import { WorkspaceManager } from './workspace.manager';
import { ProcessExecutor } from './process.executor';
import { DbProvisioner } from './db.provisioner';
import { ProxyRouter } from './proxy.router';
import { CleanupSweeper } from './cleanup.sweeper';
import { RuntimeEvent } from './types';
import { ErrorClassifier } from './error.classifier';
import RepairEngine from './repair.engine';
import RuntimeMonitor from './runtime.monitor';
import TelemetryManager from './telemetry/telemetry.manager';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

// Module-scoped component instances (assigned in main before use)
let errorClassifier: ErrorClassifier;
let repairEngine: RepairEngine;
let telemetry: TelemetryManager;
let runtimeMonitor: RuntimeMonitor;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log('================================================================');
  console.log('                OneAtlas Execution Engine                       ');
  console.log('================================================================');

  // Initialize core services
  const registry = new ProcessRegistry();
  const workspaceManager = new WorkspaceManager();
  const executor = new ProcessExecutor(registry, workspaceManager);
  const dbProvisioner = new DbProvisioner();

  // Initialize Stage 2 self-healing components
  errorClassifier = new ErrorClassifier();
  repairEngine = new RepairEngine();
  telemetry = new TelemetryManager(prisma);
  runtimeMonitor = new RuntimeMonitor(registry, executor);
  runtimeMonitor.start();

  // Warm node_modules base template (runs pnpm install if needed)
  workspaceManager.ensureBaseTemplateWarmed();

  // Start HTTP reverse proxy on port 3002
  const proxyRouter = new ProxyRouter(registry, workspaceManager, executor, 3002);
  proxyRouter.start();

  // Start cleanup sweeper for idle / zombie processes
  const sweeper = new CleanupSweeper(registry, workspaceManager);
  sweeper.start();

  console.log('[Executor] Polling Redis queue:deploy for tasks...');

  // ── WORKER LOOP ─────────────────────────────────────────────────────────────
  while (true) {
    try {
      const rawJob = await redis.lmove(
        'queue:deploy',
        'queue:deploy:processing',
        'right',
        'left'
      );

      if (!rawJob) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        continue;
      }

      console.log('[Executor] Dequeued task:', JSON.stringify(rawJob));
      const job = (typeof rawJob === 'string' ? JSON.parse(rawJob) : rawJob) as any;
      const { deploymentId } = job.payload;

      await processDeployment(deploymentId, executor, dbProvisioner, workspaceManager, registry, rawJob);
    } catch (loopError) {
      console.error('[Executor] Worker loop error:', loopError);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DEPLOYMENT HANDLER
// ─────────────────────────────────────────────────────────────────────────────

async function processDeployment(
  deploymentId: string,
  executor: ProcessExecutor,
  dbProvisioner: DbProvisioner,
  workspaceManager: WorkspaceManager,
  registry: ProcessRegistry,
  rawJob: any
) {
  const startTime = Date.now();
  let logBuffer = '';

  const appendLog = (source: 'stdout' | 'stderr' | 'system', line: string): void => {
    const formatted = `[${new Date().toISOString()}] [${source.toUpperCase()}] ${line}\n`;
    logBuffer += formatted;
    console.log(`[${deploymentId}] ${formatted.trim()}`);
  };

  const publishEvent = async (event: RuntimeEvent, details?: any): Promise<void> => {
    const payload = JSON.stringify({ event, details, timestamp: new Date().toISOString() });
    await redis.publish(`events:deployment:${deploymentId}`, payload);
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { buildLog: logBuffer }
    });
  };

  try {
    // 1. Fetch deployment record
    const deployment = await prisma.deployment.findUnique({
      where: { id: deploymentId },
      include: { project: true }
    });

    if (!deployment) {
      appendLog('stderr', `Deployment ${deploymentId} not found.`);
      await redis.lrem('queue:deploy:processing', 1, rawJob);
      return;
    }

    appendLog('system', `Starting build for project: ${deployment.project.name}`);

    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: 'BUILDING', buildLog: logBuffer }
    });

    // 2. Resolve generated code
    const code = (deployment.codeSnapshot || deployment.project.generatedCode) as any;
    if (!code?.files) {
      throw new Error('No generated code found on project or deployment snapshot.');
    }

    const appId = deployment.projectId;
    const dbSchema = `tenant_${appId.toLowerCase()}`;

    // 3. Provision workspace
    appendLog('system', 'Provisioning sandbox workspace...');
    const { workspacePath } = workspaceManager.provisionWorkspace(
      appId,
      deployment.id,
      code.files,
      dbSchema
    );

    // 4. Provision isolated DB schema
    await publishEvent('PRISMA_GENERATE_STARTED');
    const tenantDbUrl = await dbProvisioner.provision(appId, workspacePath, dbSchema, appendLog);

    // 5. Build the app
    const executorOptions = {
      appId,
      generationId: deployment.id,
      port: 0,
      workspacePath,
      dbSchema,
      env: {
        DATABASE_URL: tenantDbUrl,
        NEXT_PUBLIC_APP_ID: appId
      },
      onEvent: (event: RuntimeEvent, details: any) => publishEvent(event, details),
      onLog: appendLog
    };

    let buildSuccess = await executor.build(executorOptions);

    // ── SELF-HEALING REPAIR LOOP ───────────────────────────────────────────────
    if (!buildSuccess) {
      appendLog('system', 'Build failed. Starting self-healing repair pipeline...');

      await prisma.deployment.update({
        where: { id: deploymentId },
        data: { status: 'REPAIRING' }
      });

      let diagnostics = errorClassifier.classify(logBuffer);
      let repaired = false;
      let repairCount = 0;

      for (let iteration = 1; iteration <= 3; iteration++) {
        appendLog('system', `[Repair] Iteration ${iteration}/3 — ${diagnostics.length} diagnostic(s) found.`);

        const repairResult = await repairEngine.repair(workspacePath, diagnostics, iteration);

        if (repairResult) {
          appendLog('system', `[Repair] Applied: ${repairResult.step} (files: ${repairResult.filesChanged.join(', ')})`);
          repairCount++;
        } else {
          appendLog('system', `[Repair] No repair strategy matched for current diagnostics.`);
        }

        // Update status to show retry in progress
        await prisma.deployment.update({
          where: { id: deploymentId },
          data: { status: 'BUILD_RETRY' }
        });

        buildSuccess = await executor.build(executorOptions);

        if (buildSuccess) {
          appendLog('system', `[Repair] Build succeeded after ${iteration} repair iteration(s).`);
          repaired = true;
          break;
        }

        // Re-classify with fresh log output for next iteration
        diagnostics = errorClassifier.classify(logBuffer);
      }

      if (!repaired) {
        appendLog('system', '[SafeMode] Repair loop exhausted. Falling back to golden template preview.');
        workspaceManager.resetToGoldenTemplate(workspacePath);

        await prisma.deployment.update({
          where: { id: deploymentId },
          data: { status: 'BUILD_RETRY', errorMessage: 'Fallback preview mode' }
        });

        buildSuccess = await executor.build(executorOptions);

        if (!buildSuccess) {
          appendLog('stderr', '[SafeMode] Golden template build failed. Deployment failed.');
          await prisma.deployment.update({
            where: { id: deploymentId },
            data: { status: 'FAILED', errorMessage: 'Fallback preview build failed.' }
          });
          await publishEvent('BUILD_FAILED', { error: 'Fallback preview build failed' });
          await telemetry.recordFailure(deploymentId, 'BUILD', logBuffer);
          return;
        }
      }
    }

    // 6. Deploy — allocate port and start process
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: { status: 'DEPLOYING', buildLog: logBuffer }
    });

    const port = await registry.allocatePort();
    executorOptions.port = port;

    appendLog('system', `Spawning Next.js runtime on port ${port}...`);
    await executor.start(executorOptions);

    // Register with runtime health monitor
    runtimeMonitor.register(appId, executorOptions);

    // 7. Mark LIVE
    const previewUrl = `http://${appId}.preview.localhost:3002`;
    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: 'LIVE',
        deployedUrl: previewUrl,
        buildLog: logBuffer,
        deployedAt: new Date()
      }
    });

    appendLog('system', `Deployment LIVE: ${previewUrl}`);
    await publishEvent('PREVIEW_READY', { url: previewUrl });

    // Write aggregated success telemetry (single write at completion)
    await telemetry.recordSuccess(deploymentId, {
      buildDurationMs: Date.now() - startTime,
      previewUptimeSec: 0
    });

  } catch (error: any) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    appendLog('stderr', `Fatal deployment error: ${errorMsg}`);

    await prisma.deployment.update({
      where: { id: deploymentId },
      data: {
        status: 'FAILED',
        errorMessage: errorMsg,
        buildLog: logBuffer
      }
    });

    await publishEvent('BUILD_FAILED', { error: errorMsg });
    await telemetry.recordFailure(deploymentId, 'RUNTIME', logBuffer);

  } finally {
    await redis.lrem('queue:deploy:processing', 1, rawJob);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

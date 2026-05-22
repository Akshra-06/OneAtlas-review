import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { ProcessRegistry } from './process.registry';
import { WorkspaceManager } from './workspace.manager';

import { prisma } from '@oneatlas/db';

export class CleanupSweeper {
  private sweepInterval: NodeJS.Timeout | null = null;

  constructor(
    private registry: ProcessRegistry,
    private workspaceManager: WorkspaceManager,
    private intervalMs: number = 15 * 1000 // Run every 15 seconds
  ) {}

  /**
   * Starts the sweeper cron.
   */
  public start(): void {
    if (this.sweepInterval) return;
    
    console.log('[CleanupSweeper] Periodic cleanup sweeper started.');
    this.sweepInterval = setInterval(() => this.sweep(), this.intervalMs);
  }

  /**
   * Stops the sweeper.
   */
  public stop(): void {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
      this.sweepInterval = null;
    }
  }

  /**
   * Sweeps workspaces and processes to clean up orphans, zombies, and inactive runtimes.
   */
  public sweep(): void {
    console.log('[CleanupSweeper] Running periodic sweep...');
    const workspacesDir = path.join(__dirname, '..', '.workspaces');
    
    if (!fs.existsSync(workspacesDir)) return;

    const workspaces = fs.readdirSync(workspacesDir);
    const now = Date.now();

    for (const appId of workspaces) {
      const workspacePath = path.join(workspacesDir, appId);
      if (!fs.statSync(workspacePath).isDirectory()) continue;

      const meta = this.workspaceManager.readMetadata(workspacePath);
      if (!meta) continue;

      const lastActive = new Date(meta.lastActiveAt).getTime();
      const createdAt = new Date(meta.createdAt).getTime();

      // 1. Idle timeout sweep (15 minutes)
      const isIdle = (now - lastActive) > 15 * 60 * 1000;
      if (isIdle && this.registry.has(appId)) {
        console.log(`[CleanupSweeper] App ${appId} is idle. Stopping runner process.`);
        this.registry.kill(appId);
        this.workspaceManager.updateMetadata(workspacePath, { runtimeStatus: 'stopped', allocatedPort: 0 });
      }

      // 2. Hard runtime limit sweep (60 minutes)
      const isExpired = (now - createdAt) > 60 * 60 * 1000;
      if (isExpired) {
        if (this.registry.has(appId)) {
          console.log(`[CleanupSweeper] App ${appId} exceeded hard max lifetime (60 mins). Purging running process.`);
          this.registry.kill(appId);
        }
        
        // Remove workspace folder to free disk space
        console.log(`[CleanupSweeper] Deleting expired workspace directory for app ${appId}.`);
        try {
          fs.rmSync(workspacePath, { recursive: true, force: true });
        } catch (err: unknown) {
          console.error(`[CleanupSweeper] Failed to clean directory for ${appId}:`, err);
        }
        continue;
      }

      // 3. Database undeployment / rollback check:
      // If the app is currently running in our memory registry, verify its status in the DB.
      // If it is no longer LIVE, stop it.
      if (this.registry.has(appId)) {
        prisma.deployment.findUnique({
          where: { id: meta.generationId },
          select: { status: true }
        }).then((deployment) => {
          if (!deployment || deployment.status !== 'LIVE') {
            console.log(`[CleanupSweeper] App ${appId} deployment state in DB is "${deployment?.status ?? 'missing'}". Stopping running process.`);
            this.registry.kill(appId);
            this.workspaceManager.updateMetadata(workspacePath, { runtimeStatus: 'stopped', allocatedPort: 0 });
          }
        }).catch((err: unknown) => {
          console.error(`[CleanupSweeper] Failed to check database deployment status for ${appId}:`, err);
        });
      }

      // 4. Zombie process detector:
      // If the app is marked running in workspace metadata, but NOT in our memory Registry
      // it means the executor process restarted or got out of sync. We must free the port and kill it.
      if (meta.runtimeStatus === 'running' && !this.registry.has(appId)) {
        if (meta.allocatedPort > 0) {
          console.log(`[CleanupSweeper] Zombie detected: port ${meta.allocatedPort} is marked occupied by ${appId} but unregistered. Purging port...`);
          this.killProcessOnPort(meta.allocatedPort);
        }
        this.workspaceManager.updateMetadata(workspacePath, { runtimeStatus: 'stopped', allocatedPort: 0 });
      }
    }
  }

  /**
   * Cross-platform port cleaner.
   */
  private killProcessOnPort(port: number): void {
    try {
      if (process.platform === 'win32') {
        const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
        const lines = output.split('\n');
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          // Columns: Proto, Local Address, Foreign Address, State, PID
          if (parts.length >= 5 && parts[1]?.endsWith(`:${port}`)) {
            const pid = parts[4];
            if (pid && pid !== '0') {
              console.log(`[CleanupSweeper] Killing zombie process PID ${pid} on port ${port}`);
              execSync(`taskkill /pid ${pid} /F /T`, { stdio: 'ignore' });
            }
          }
        }
      } else {
        console.log(`[CleanupSweeper] Killing process occupying port ${port}`);
        execSync(`lsof -t -i:${port} | xargs kill -9`, { stdio: 'ignore' });
      }
    } catch {
      // ignore errors if port is already free
    }
  }
}
export default CleanupSweeper;

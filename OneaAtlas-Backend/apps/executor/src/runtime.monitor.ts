import * as net from 'node:net';
import { execSync } from 'node:child_process';
import { ProcessRegistry } from './process.registry';
import { ProcessExecutor } from './process.executor';
import { ExecutorOptions } from './types';

export class RuntimeMonitor {
  private optionsMap = new Map<string, ExecutorOptions>();
  private restartAttempts = new Map<string, { count: number; lastAttempt: Date }>();
  private intervalId: NodeJS.Timeout | null = null;
  private memoryLimitMb = 512;

  constructor(
    private registry: ProcessRegistry,
    private executor: ProcessExecutor
  ) {}

  /**
   * Starts the background health check worker.
   */
  public start(intervalMs: number = 10000): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.checkHealth().catch((err) =>
        console.error('[RuntimeMonitor] Error in checkHealth loop:', err)
      );
    }, intervalMs);

    console.log('[RuntimeMonitor] Health check daemon started.');
  }

  /**
   * Stops the background health check worker.
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Registers a running workspace config for health tracking and crash recovery.
   */
  public register(appId: string, options: ExecutorOptions): void {
    this.optionsMap.set(appId, options);
  }

  /**
   * Removes a workspace from tracking.
   */
  public deregister(appId: string): void {
    this.optionsMap.delete(appId);
    this.restartAttempts.delete(appId);
  }

  /**
   * Evaluates runtime metrics and schedules reboots for unresponsive/crashed applications.
   */
  private async checkHealth(): Promise<void> {
    const activeProcesses = this.registry.getAll();

    for (const active of activeProcesses) {
      const { appId, port, process: childProc } = active;

      // 1. Process termination check
      if (childProc.killed || childProc.exitCode !== null) {
        console.log(`[RuntimeMonitor] Dead process detected for app ${appId}. Initializing recovery...`);
        this.handleCrash(appId);
        continue;
      }

      // 2. Health check connection polling
      const healthy = await this.pollPort(port);
      if (!healthy) {
        console.warn(`[RuntimeMonitor] Port check failed for app ${appId} on port ${port}.`);
        this.handleCrash(appId);
        continue;
      }

      // 3. Memory limit checks
      if (childProc.pid !== undefined) {
        const memUsage = this.getProcessMemoryUsage(childProc.pid);
        if (memUsage > this.memoryLimitMb) {
          console.warn(
            `[RuntimeMonitor] App ${appId} (PID: ${childProc.pid}) memory usage limit exceeded: ${memUsage}MB / ${this.memoryLimitMb}MB. Recycling process...`
          );
          active.process.kill('SIGTERM'); // Trigger close event to kick off recovery
        }
      }
    }
  }

  /**
   * Connects to local port to verify HTTP services are responsive.
   */
  private pollPort(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(2000);

      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });

      socket.connect(port, '127.0.0.1');
    });
  }

  /**
   * Calculates memory utilization of spawned server processes.
   */
  private getProcessMemoryUsage(pid: number): number {
    try {
      if (process.platform === 'win32') {
        const output = execSync(
          `powershell -NoProfile -Command "(Get-Process -Id ${pid} -ErrorAction SilentlyContinue).WorkingSet64"`,
          { encoding: 'utf8' }
        );
        const bytes = parseInt(output.trim(), 10);
        if (isNaN(bytes)) return 0;
        return Math.round(bytes / (1024 * 1024));
      } else {
        const output = execSync(`ps -o rss= -p ${pid}`, { encoding: 'utf8' });
        const kb = parseInt(output.trim(), 10);
        if (isNaN(kb)) return 0;
        return Math.round(kb / 1024);
      }
    } catch {
      return 0;
    }
  }

  /**
   * Spawns reboots with exponential backoff on crash detection.
   */
  private async handleCrash(appId: string): Promise<void> {
    const options = this.optionsMap.get(appId);
    if (!options) {
      return;
    }

    // Clean up registry references
    this.registry.kill(appId);

    const attemptInfo = this.restartAttempts.get(appId) || { count: 0, lastAttempt: new Date() };
    const now = new Date();

    // Clear counters if last restart attempt was over 5 minutes ago
    if (now.getTime() - attemptInfo.lastAttempt.getTime() > 5 * 60 * 1000) {
      attemptInfo.count = 0;
    }

    if (attemptInfo.count >= 3) {
      console.error(`[RuntimeMonitor] App ${appId} hit max restart limit (3). Halting recovery.`);
      await options.onLog('stderr', `[RuntimeMonitor] App crashed repeatedly. Max recovery retries exceeded.`);
      await options.onEvent('PROCESS_EXITED', { error: 'Terminal crash status' });
      this.deregister(appId);
      return;
    }

    attemptInfo.count++;
    attemptInfo.lastAttempt = now;
    this.restartAttempts.set(appId, attemptInfo);

    const backoffMs = Math.pow(2, attemptInfo.count) * 1000;
    await options.onLog(
      'system',
      `[RuntimeMonitor] App crash detected. Restarting in ${backoffMs}ms (Attempt ${attemptInfo.count}/3)...`
    );

    setTimeout(async () => {
      try {
        console.log(`[RuntimeMonitor] Executing recovery restart for app ${appId}...`);
        await this.executor.start(options);
      } catch (err: any) {
        console.error(`[RuntimeMonitor] Recovery restart execution failed for app ${appId}:`, err);
        await options.onLog('stderr', `[RuntimeMonitor] Restart failed: ${err.message}`);
      }
    }, backoffMs);
  }
}
export default RuntimeMonitor;

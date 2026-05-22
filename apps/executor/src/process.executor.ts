import { spawn } from 'node:child_process';
import * as http from 'node:http';
import { Executor } from './executor.interface';
import { ExecutorOptions, RuntimeEvent } from './types';
import { ProcessRegistry } from './process.registry';
import { WorkspaceManager } from './workspace.manager';

export class ProcessExecutor implements Executor {
  constructor(
    private registry: ProcessRegistry,
    private workspaceManager: WorkspaceManager
  ) {}

  /**
   * Helper to execute a command asynchronously while streaming output.
   */
  private runCommand(
    command: string,
    args: string[],
    cwd: string,
    env: Record<string, string>,
    onLog: (source: 'stdout' | 'stderr', line: string) => void
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, {
        cwd,
        env: { ...process.env, ...env },
        shell: process.platform === 'win32'
      });

      proc.stdout.on('data', (data) => {
        const text = data.toString();
        const lines = text.split(/\r?\n/);
        for (const line of lines) {
          if (line.trim()) onLog('stdout', line.trim());
        }
      });

      proc.stderr.on('data', (data) => {
        const text = data.toString();
        const lines = text.split(/\r?\n/);
        for (const line of lines) {
          if (line.trim()) onLog('stderr', line.trim());
        }
      });

      proc.on('close', (code) => {
        resolve(code ?? 0);
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Builds the application inside the workspace.
   */
  public async build(options: ExecutorOptions): Promise<boolean> {
    const { workspacePath, dbSchema, env, onEvent, onLog } = options;

    try {
      this.workspaceManager.updateMetadata(workspacePath, {
        buildStatus: 'building',
        runtimeStatus: 'idle'
      });

      // 1. Dependency check / fast install
      await onEvent('INSTALL_STARTED');
      onLog('system', '[ProcessExecutor] Aligning packages cache...');
      const installCode = await this.runCommand(
        'pnpm',
        ['install', '--offline', '--reporter=silent'],
        workspacePath,
        env,
        onLog
      );
      if (installCode !== 0) {
        // If offline fails, fall back to online install
        onLog('system', '[ProcessExecutor] Package offline alignment missed. Fetching dependencies online...');
        const onlineCode = await this.runCommand(
          'pnpm',
          ['install', '--reporter=silent'],
          workspacePath,
          env,
          onLog
        );
        if (onlineCode !== 0) {
          throw new Error(`pnpm install failed with exit code ${onlineCode}`);
        }
      }
      await onEvent('INSTALL_COMPLETED');

      // 2. Prisma Generate
      await onEvent('PRISMA_GENERATE_STARTED');
      onLog('system', '[ProcessExecutor] Generating database client...');
      const prismaCode = await this.runCommand(
        'npx',
        ['prisma', 'generate'],
        workspacePath,
        env,
        onLog
      );
      if (prismaCode !== 0) {
        throw new Error(`prisma generate failed with exit code ${prismaCode}`);
      }

      // 3. Next.js Compile Build
      await onEvent('BUILD_STARTED');
      onLog('system', '[ProcessExecutor] Building Next.js compilation artifact...');
      const buildCode = await this.runCommand(
        'npx',
        ['next', 'build'],
        workspacePath,
        env,
        onLog
      );

      if (buildCode !== 0) {
        await onEvent('BUILD_FAILED', { exitCode: buildCode });
        this.workspaceManager.updateMetadata(workspacePath, { buildStatus: 'failed' });
        return false;
      }

      await onEvent('BUILD_COMPLETED');
      this.workspaceManager.updateMetadata(workspacePath, { buildStatus: 'success' });
      return true;
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : String(err);
      onLog('stderr', `[ProcessExecutor] Build failed: ${msg}`);
      await onEvent('BUILD_FAILED', { error: msg });
      this.workspaceManager.updateMetadata(workspacePath, { buildStatus: 'failed' });
      return false;
    }
  }

  /**
   * Spawns the Next.js production runner process.
   */
  public async start(options: ExecutorOptions): Promise<void> {
    const { appId, generationId, port, workspacePath, dbSchema, env, onEvent, onLog } = options;

    onLog('system', `[ProcessExecutor] Spawning next start process on port ${port}...`);
    await onEvent('RUNTIME_STARTED');

    const proc = spawn('npx', ['next', 'start', '-p', String(port)], {
      cwd: workspacePath,
      env: {
        ...process.env,
        ...env,
        PORT: String(port)
      },
      shell: process.platform === 'win32'
    });

    // Handle stdout
    proc.stdout.on('data', (data) => {
      const text = data.toString();
      const lines = text.split(/\r?\n/);
      for (const line of lines) {
        if (line.trim()) onLog('stdout', line.trim());
      }
    });

    // Handle stderr
    proc.stderr.on('data', (data) => {
      const text = data.toString();
      const lines = text.split(/\r?\n/);
      for (const line of lines) {
        if (line.trim()) onLog('stderr', line.trim());
      }
    });

    // Register active process in the registry
    this.registry.register(
      appId,
      generationId,
      proc,
      port,
      dbSchema,
      // Idle Timeout callback
      async () => {
        onLog('system', `[ProcessExecutor] Idle timeout (15 mins) hit for app ${appId}. Stopping process.`);
        await this.stop(appId);
      },
      // Hard Limit callback
      async () => {
        onLog('system', `[ProcessExecutor] Hard lifetime limit (60 mins) hit for app ${appId}. Recycling process.`);
        await this.stop(appId);
      }
    );

    this.workspaceManager.updateMetadata(workspacePath, {
      runtimeStatus: 'running',
      allocatedPort: port
    });

    // Set up process termination handler
    proc.on('close', async (code) => {
      onLog('system', `[ProcessExecutor] Next.js server exited with code ${code}`);
      await onEvent('PROCESS_EXITED', { exitCode: code });
      this.workspaceManager.updateMetadata(workspacePath, {
        runtimeStatus: code === 0 ? 'stopped' : 'crashed',
        allocatedPort: 0
      });
      this.registry.kill(appId);
    });

    // Poll endpoint to verify server is listening before resolving
    const isListening = await this.pollServerListening(port);
    if (!isListening) {
      proc.kill();
      throw new Error(`Next.js server failed to bind to port ${port} within timeout.`);
    }

    onLog('system', `[ProcessExecutor] Next.js server live on port ${port}.`);
    await onEvent('PREVIEW_READY', { url: `http://${appId}.preview.localhost:3002` });
  }

  /**
   * Stops the execution of a running workspace.
   */
  public async stop(appId: string): Promise<void> {
    const active = this.registry.get(appId);
    if (active) {
      const workspacePath = active.process.spawnfile; // Approximation of folder or retrieve
      this.registry.kill(appId);
    }
  }

  /**
   * Checks if process is alive in registry.
   */
  public async isAlive(appId: string): Promise<boolean> {
    return this.registry.has(appId);
  }

  /**
   * Polls the port using http requests to verify next start has fully booted.
   */
  private pollServerListening(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 30; // 30 attempts, 500ms delay = 15 seconds

      const check = () => {
        attempts++;
        const req = http.request({
          host: '127.0.0.1',
          port: port,
          path: '/',
          method: 'GET',
          timeout: 500
        }, (res) => {
          resolve(true);
          req.destroy();
        });

        req.on('error', () => {
          req.destroy();
          if (attempts >= maxAttempts) {
            resolve(false);
          } else {
            setTimeout(check, 500);
          }
        });

        req.end();
      };

      setTimeout(check, 500);
    });
  }
}
export default ProcessExecutor;

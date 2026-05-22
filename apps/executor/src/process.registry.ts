import { ChildProcess } from 'node:child_process';
import * as net from 'node:net';
import { RuntimeMetadata } from './types';

export interface ActiveProcess {
  appId: string;
  generationId: string;
  process: ChildProcess;
  port: number;
  dbSchema: string;
  createdAt: Date;
  lastActiveAt: Date;
  idleTimeoutTimer: NodeJS.Timeout;
  hardLimitTimer: NodeJS.Timeout;
}

export class ProcessRegistry {
  private registry = new Map<string, ActiveProcess>();
  private startPort = 4000;
  private endPort = 5000;

  constructor() {}

  /**
   * Checks if a local port is free.
   */
  private isPortFree(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.once('error', () => {
        resolve(false);
      });
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      server.listen(port);
    });
  }

  /**
   * Finds a free port in the registry port range.
   */
  public async allocatePort(): Promise<number> {
    // Check ports in the registry map first to avoid race conditions
    const activePorts = new Set(Array.from(this.registry.values()).map(p => p.port));

    for (let port = this.startPort; port <= this.endPort; port++) {
      if (activePorts.has(port)) {
        continue;
      }
      if (await this.isPortFree(port)) {
        return port;
      }
    }
    throw new Error('No free ports available in the dynamic runtime range (4000-5000).');
  }

  /**
   * Registers a spawned Next.js process.
   */
  public register(
    appId: string,
    generationId: string,
    proc: ChildProcess,
    port: number,
    dbSchema: string,
    onIdleTimeout: () => void,
    onHardLimit: () => void
  ): ActiveProcess {
    this.kill(appId); // Ensure previous instance is cleaned up

    const idleMs = 15 * 60 * 1000; // 15 mins
    const hardMs = 60 * 60 * 1000; // 60 mins

    const idleTimeoutTimer = setTimeout(onIdleTimeout, idleMs);
    const hardLimitTimer = setTimeout(onHardLimit, hardMs);

    const active: ActiveProcess = {
      appId,
      generationId,
      process: proc,
      port,
      dbSchema,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      idleTimeoutTimer,
      hardLimitTimer,
    };

    this.registry.set(appId, active);
    return active;
  }

  /**
   * Records HTTP request activity to reset the idle timeout.
   */
  public recordActivity(appId: string, onIdleTimeout: () => void): void {
    const active = this.registry.get(appId);
    if (!active) return;

    active.lastActiveAt = new Date();
    clearTimeout(active.idleTimeoutTimer);

    const idleMs = 15 * 60 * 1000;
    active.idleTimeoutTimer = setTimeout(onIdleTimeout, idleMs);
  }

  /**
   * Terminates an active process.
   */
  public kill(appId: string): boolean {
    const active = this.registry.get(appId);
    if (!active) return false;

    // Clear timers
    clearTimeout(active.idleTimeoutTimer);
    clearTimeout(active.hardLimitTimer);

    // Terminate process
    try {
      if (process.platform === 'win32') {
        // Windows taskkill to ensure sub-processes spawned by cmd/sh are killed too
        const { execSync } = require('node:child_process');
        execSync(`taskkill /pid ${active.process.pid} /T /F`, { stdio: 'ignore' });
      } else {
        active.process.kill('SIGKILL');
      }
    } catch {
      // Process might already be dead
    }

    this.registry.delete(appId);
    return true;
  }

  /**
   * Retreives registry entry.
   */
  public get(appId: string): ActiveProcess | undefined {
    return this.registry.get(appId);
  }

  /**
   * Retrieves all running apps in the registry.
   */
  public getAll(): ActiveProcess[] {
    return Array.from(this.registry.values());
  }

  /**
   * Checks if an appId is active in the registry.
   */
  public has(appId: string): boolean {
    return this.registry.has(appId);
  }
}
export default ProcessRegistry;

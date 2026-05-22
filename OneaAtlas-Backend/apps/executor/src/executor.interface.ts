import { ExecutorOptions } from './types';

export interface Executor {
  /**
   * Builds the application (dependency installation, prisma generate, next build).
   * Returns true if compilation succeeded, false otherwise.
   */
  build(options: ExecutorOptions): Promise<boolean>;

  /**
   * Spawns the runtime process/container for the application.
   */
  start(options: ExecutorOptions): Promise<void>;

  /**
   * Terminates the runtime execution.
   */
  stop(appId: string): Promise<void>;

  /**
   * Checks if the runtime is currently active.
   */
  isAlive(appId: string): Promise<boolean>;
}

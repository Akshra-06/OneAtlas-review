import { prisma as _prisma } from '@oneatlas/db';

type PrismaClientType = typeof _prisma;

export interface TelemetrySuccess {
  buildDurationMs: number;
  startupTimeMs?: number;
  repairCount?: number;
  previewUptimeSec?: number;
  memoryUsageMb?: number;
  crashCount?: number;
  repairedErrors?: any;
}

/**
 * TelemetryManager — aggregates and persists deployment lifecycle metrics.
 * Writes are done once at completion/failure to minimise DB write noise.
 */
export class TelemetryManager {
  constructor(private prisma: PrismaClientType) {}

  /**
   * Records telemetry for a successfully deployed application.
   */
  public async recordSuccess(deploymentId: string, data: TelemetrySuccess): Promise<void> {
    try {
      await this.prisma.deploymentTelemetry.upsert({
        where: { deploymentId },
        create: {
          deploymentId,
          buildDurationMs: data.buildDurationMs,
          startupTimeMs: data.startupTimeMs ?? 0,
          repairCount: data.repairCount ?? 0,
          previewUptimeSec: data.previewUptimeSec ?? 0,
          memoryUsageMb: data.memoryUsageMb ?? 0,
          crashCount: data.crashCount ?? 0,
          repairedErrors: data.repairedErrors ?? null,
          failureCategory: null,
        },
        update: {
          buildDurationMs: data.buildDurationMs,
          startupTimeMs: data.startupTimeMs ?? 0,
          repairCount: data.repairCount ?? 0,
          previewUptimeSec: data.previewUptimeSec ?? 0,
          memoryUsageMb: data.memoryUsageMb ?? 0,
          crashCount: data.crashCount ?? 0,
          repairedErrors: data.repairedErrors ?? null,
          failureCategory: null,
        },
      });
      console.log(`[TelemetryManager] Success telemetry recorded for deployment ${deploymentId}.`);
    } catch (err) {
      console.error(`[TelemetryManager] Failed to write success telemetry for ${deploymentId}:`, err);
    }
  }

  /**
   * Records telemetry when a deployment ultimately fails.
   * @param failureCategory - High-level error category: 'BUILD', 'RUNTIME', 'PRISMA', etc.
   * @param logBuffer       - The raw build log text for post-mortem analysis.
   */
  public async recordFailure(
    deploymentId: string,
    failureCategory: string,
    logBuffer: string
  ): Promise<void> {
    try {
      // Extract a concise error summary from the last 40 lines of the log
      const lastLines = logBuffer.trim().split('\n').slice(-40).join('\n');

      await this.prisma.deploymentTelemetry.upsert({
        where: { deploymentId },
        create: {
          deploymentId,
          buildDurationMs: 0,
          failureCategory,
          repairedErrors: { logTail: lastLines },
        },
        update: {
          failureCategory,
          repairedErrors: { logTail: lastLines },
        },
      });
      console.log(`[TelemetryManager] Failure telemetry recorded for deployment ${deploymentId} (category: ${failureCategory}).`);
    } catch (err) {
      console.error(`[TelemetryManager] Failed to write failure telemetry for ${deploymentId}:`, err);
    }
  }

  /**
   * Increments crash counter for a running deployment (called by RuntimeMonitor on crash recovery).
   */
  public async incrementCrashCount(deploymentId: string): Promise<void> {
    try {
      const existing = await this.prisma.deploymentTelemetry.findUnique({
        where: { deploymentId },
        select: { crashCount: true },
      });

      if (existing) {
        await this.prisma.deploymentTelemetry.update({
          where: { deploymentId },
          data: { crashCount: existing.crashCount + 1 },
        });
      }
    } catch (err) {
      console.error(`[TelemetryManager] Failed to increment crash count for ${deploymentId}:`, err);
    }
  }

  /**
   * Updates the repair count for a deployment (called after each successful repair iteration).
   */
  public async incrementRepairCount(deploymentId: string): Promise<void> {
    try {
      const existing = await this.prisma.deploymentTelemetry.findUnique({
        where: { deploymentId },
        select: { repairCount: true },
      });

      if (existing) {
        await this.prisma.deploymentTelemetry.update({
          where: { deploymentId },
          data: { repairCount: existing.repairCount + 1 },
        });
      }
    } catch (err) {
      console.error(`[TelemetryManager] Failed to increment repair count for ${deploymentId}:`, err);
    }
  }
}
export default TelemetryManager;

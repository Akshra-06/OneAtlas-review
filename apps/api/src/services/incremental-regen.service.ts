// =============================================================================
// apps/api/src/services/incremental-regen.service.ts
// Incremental regeneration orchestration service.
// =============================================================================

import { prisma } from "@oneatlas/db";
import { appEvents } from "../events/emitter";
import { logger } from "../lib/logger";
import type { JsonObject } from "../realtime/server";
import { DependencyGraph } from "../utils/dependency-graph";
import {
  detectSpecChanges,
  getChangedPaths,
  ComponentType,
  type ChangedComponent as DetectedChangedComponent,
} from "../utils/change-detector";

export type ChangedComponent = DetectedChangedComponent;

/** Re-exported component type classification. */
export { ComponentType };

/** A regeneration stage that can be executed independently. */
export interface Stage {
  order: number;
  components: string[];
  canRunInParallel: boolean;
}

/** Ordered regeneration plan. */
export interface RegenPlan {
  stages: Stage[];
  totalComponents: number;
  estimatedTimeMs: number;
}

/** Result of executing a regeneration plan. */
export interface RegenResult {
  success: boolean;
  rebuilt: string[];
  failed: string[];
  durationMs: number;
}

interface ComponentRecord {
  id: string;
  type: ComponentType;
  order: number;
}

type RegenProgressMetadata = JsonObject & {
  regenStatus: "running" | "completed" | "failed";
  regenStage?: number;
  regenComponent?: string;
  regenProgress?: number;
  regenTotal?: number;
  regenFailed?: string[];
  regenRebuilt?: string[];
  regenError?: string;
};

const COMPONENT_PRIORITY: Record<ComponentType, number> = {
  [ComponentType.ENTITY]: 0,
  [ComponentType.LAYOUT]: 1,
  [ComponentType.COMPONENT]: 2,
  [ComponentType.API_ROUTE]: 3,
  [ComponentType.PAGE]: 4,
  [ComponentType.WORKFLOW]: 5,
};

const COMPONENT_ESTIMATES: Record<ComponentType, number> = {
  [ComponentType.ENTITY]: 600,
  [ComponentType.LAYOUT]: 500,
  [ComponentType.COMPONENT]: 700,
  [ComponentType.API_ROUTE]: 900,
  [ComponentType.PAGE]: 1_200,
  [ComponentType.WORKFLOW]: 1_500,
};

function inferComponentType(componentId: string): ComponentType {
  const normalized = componentId.toLowerCase();

  if (normalized.startsWith("entity:") || normalized.startsWith("entities.")) {
    return ComponentType.ENTITY;
  }
  if (normalized.startsWith("layout:") || normalized.includes("layout")) {
    return ComponentType.LAYOUT;
  }
  if (normalized.startsWith("page:") || normalized.includes("page")) {
    return ComponentType.PAGE;
  }
  if (normalized.startsWith("api:") || normalized.startsWith("route:") || normalized.includes("api-route") || normalized.includes("route")) {
    return ComponentType.API_ROUTE;
  }
  if (normalized.startsWith("workflow:") || normalized.includes("workflow")) {
    return ComponentType.WORKFLOW;
  }

  return ComponentType.COMPONENT;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function buildProgressMetadata(
  status: RegenProgressMetadata["regenStatus"],
  extra: Partial<RegenProgressMetadata> = {}
): RegenProgressMetadata {
  return {
    regenStatus: status,
    ...extra,
  };
}

/**
 * Incremental regeneration orchestration.
 */
export class IncrementalRegenService {
  /**
   * Compare two app specs and return only the changed components.
   * @param projectId - Project identifier.
   * @param orgId - Organization identifier.
   * @param newSpec - New application spec.
   * @param oldSpec - Previous application spec.
   */
  async detectChanges(
    projectId: string,
    orgId: string,
    newSpec: unknown,
    oldSpec: unknown
  ): Promise<ChangedComponent[]> {
    try {
      logger.info("regen.detect_changes.start", {
        projectId,
        orgId,
        changedPaths: getChangedPaths(oldSpec, newSpec).length,
      });

      const changes = detectSpecChanges(oldSpec, newSpec);

      logger.info("regen.detect_changes.complete", {
        projectId,
        orgId,
        changedComponents: changes.length,
      });

      return changes;
    } catch (error) {
      logger.error("regen.detect_changes.failed", { projectId, orgId, error });
      throw error;
    }
  }

  /**
   * Resolve all nodes that need rebuilding after a change.
   * @param changed - Changed components.
   * @param graph - Dependency graph.
   */
  getAffectedComponents(
    changed: ChangedComponent[],
    graph: DependencyGraph
  ): string[] {
    const affected = new Set<string>();

    for (const component of changed) {
      affected.add(component.id);

      for (const dependent of graph.getAffectedNodes(component.id)) {
        affected.add(dependent);
      }
    }

    return Array.from(affected);
  }

  /**
   * Create an ordered regeneration plan.
   * @param projectId - Project identifier.
   * @param orgId - Organization identifier.
   * @param affectedComponents - Components that must be rebuilt.
   */
  async planRegeneration(
    projectId: string,
    orgId: string,
    affectedComponents: string[]
  ): Promise<RegenPlan> {
    try {
      const uniqueComponents = Array.from(new Set(affectedComponents));

      if (uniqueComponents.length === 0) {
        return { stages: [], totalComponents: 0, estimatedTimeMs: 0 };
      }

      const graph = new DependencyGraph();
      const records: ComponentRecord[] = uniqueComponents.map((componentId) => {
        const type = inferComponentType(componentId);
        graph.addNode(componentId, { type, order: COMPONENT_PRIORITY[type] });
        return {
          id: componentId,
          type,
          order: COMPONENT_PRIORITY[type],
        };
      });

      for (const later of records) {
        for (const earlier of records) {
          if (later.id === earlier.id) {
            continue;
          }

          if (later.order > earlier.order) {
            graph.addEdge(later.id, earlier.id);
          }
        }
      }

      const topoOrder = graph.getTopologicalOrder();
      const orderIndex = new Map<string, number>();
      topoOrder.forEach((componentId, index) => orderIndex.set(componentId, index));

      const stageBuckets = new Map<number, string[]>();
      for (const record of records) {
        const bucket = stageBuckets.get(record.order) ?? [];
        bucket.push(record.id);
        stageBuckets.set(record.order, bucket);
      }

      const stages: Stage[] = Array.from(stageBuckets.entries())
        .sort(([left], [right]) => left - right)
        .map(([order, components]) => ({
          order,
          components: components.sort((left, right) => (orderIndex.get(left) ?? 0) - (orderIndex.get(right) ?? 0)),
          canRunInParallel: components.length > 1,
        }));

      const estimatedTimeMs = stages.reduce((total, stage) => {
        const stageCost = stage.components.reduce((max, componentId) => {
          const type = inferComponentType(componentId);
          const estimate = COMPONENT_ESTIMATES[type];
          return Math.max(max, estimate);
        }, 0);

        return total + stageCost;
      }, 0);

      logger.info("regen.plan.created", {
        projectId,
        orgId,
        stages: stages.length,
        totalComponents: uniqueComponents.length,
      });

      return {
        stages,
        totalComponents: uniqueComponents.length,
        estimatedTimeMs,
      };
    } catch (error) {
      logger.error("regen.plan.failed", { projectId, orgId, error });
      throw error;
    }
  }

  /**
   * Execute a regeneration plan stage by stage.
   * @param plan - Regeneration plan.
   * @param projectId - Project identifier.
   * @param orgId - Organization identifier.
   */
  async executeRegenPlan(
    plan: RegenPlan,
    projectId: string,
    orgId: string
  ): Promise<RegenResult> {
    const startedAt = Date.now();
    const rebuilt = new Set<string>();
    const failed = new Set<string>();

    try {
      logger.info("regen.execute.start", {
        projectId,
        orgId,
        stages: plan.stages.length,
        totalComponents: plan.totalComponents,
      });

      await prisma.project.update({
        where: { id: projectId },
        data: {
          metadata: {
            regenStatus: "running",
            regenStage: 0,
            regenProgress: 0,
            regenTotal: plan.totalComponents,
          } as never,
        },
      });

      let processed = 0;

      for (const stage of plan.stages) {
        logger.info("regen.stage.start", {
          projectId,
          orgId,
          stage: stage.order,
          components: stage.components.length,
        });

        appEvents.emit("project.updated", {
          orgId,
          projectId,
          userId: "system",
          metadata: buildProgressMetadata("running", {
            regenStage: stage.order,
            regenProgress: processed,
            regenTotal: plan.totalComponents,
          }),
        });

        const settled = await Promise.allSettled(
          stage.components.map(async (componentId) => {
            logger.info("regen.component.start", {
              projectId,
              orgId,
              componentId,
              stage: stage.order,
            });

            await delay(0);

            // TODO: Implement in Phase 2
            rebuilt.add(componentId);

            logger.info("regen.component.complete", {
              projectId,
              orgId,
              componentId,
              stage: stage.order,
            });

            appEvents.emit("project.updated", {
              orgId,
              projectId,
              userId: "system",
              metadata: buildProgressMetadata("running", {
                regenStage: stage.order,
                regenComponent: componentId,
                regenProgress: processed + 1,
                regenTotal: plan.totalComponents,
              }),
            });
          })
        );

        for (let index = 0; index < settled.length; index += 1) {
          const result = settled[index];
          const componentId = stage.components[index];

          if (!result || !componentId) {
            continue;
          }

          if (result.status === "fulfilled") {
            processed += 1;
            continue;
          }

          failed.add(componentId);
          logger.error("regen.component.failed", {
            projectId,
            orgId,
            componentId,
            stage: stage.order,
            error: result.reason,
          });

          appEvents.emit("project.updated", {
            orgId,
            projectId,
            userId: "system",
            metadata: buildProgressMetadata("failed", {
              regenStage: stage.order,
              regenComponent: componentId,
              regenProgress: processed,
              regenTotal: plan.totalComponents,
              regenFailed: Array.from(failed),
            }),
          });
        }

        await prisma.project.update({
          where: { id: projectId },
          data: {
            metadata: {
              regenStatus: failed.size > 0 ? "failed" : "running",
              regenStage: stage.order,
              regenProgress: processed,
              regenTotal: plan.totalComponents,
              regenFailed: Array.from(failed),
              regenRebuilt: Array.from(rebuilt),
            } as never,
          },
        });

        logger.info("regen.stage.complete", {
          projectId,
          orgId,
          stage: stage.order,
        });
      }

      const durationMs = Date.now() - startedAt;
      const success = failed.size === 0;

      await prisma.project.update({
        where: { id: projectId },
        data: {
          metadata: {
            regenStatus: success ? "completed" : "failed",
            regenProgress: plan.totalComponents,
            regenTotal: plan.totalComponents,
            regenFailed: Array.from(failed),
            regenRebuilt: Array.from(rebuilt),
          } as never,
        },
      });

      appEvents.emit("project.updated", {
        orgId,
        projectId,
        userId: "system",
        metadata: buildProgressMetadata(success ? "completed" : "failed", {
          regenProgress: plan.totalComponents,
          regenTotal: plan.totalComponents,
          regenFailed: Array.from(failed),
          regenRebuilt: Array.from(rebuilt),
        }),
      });

      logger.info("regen.execute.complete", {
        projectId,
        orgId,
        rebuilt: rebuilt.size,
        failed: failed.size,
        durationMs,
      });

      return {
        success,
        rebuilt: Array.from(rebuilt),
        failed: Array.from(failed),
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      logger.error("regen.execute.failed", { projectId, orgId, error });

      await prisma.project.update({
        where: { id: projectId },
        data: {
          metadata: {
            regenStatus: "failed",
            regenFailed: Array.from(failed),
            regenRebuilt: Array.from(rebuilt),
            regenError: error instanceof Error ? error.message : String(error),
          } as never,
        },
      }).catch(() => undefined);

      return {
        success: false,
        rebuilt: Array.from(rebuilt),
        failed: Array.from(failed),
        durationMs,
      };
    }
  }
}

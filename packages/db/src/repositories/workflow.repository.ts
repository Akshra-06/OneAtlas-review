// =============================================================================
// packages/db/src/repositories/workflow.repository.ts
// Data-access layer for Workflow and WorkflowRun models.
// Workflow is org-scoped via its parent Project.orgId.
// WorkflowRun has a direct orgId column.
// =============================================================================

import { prisma } from "../client";
import type {
  Prisma,
  Workflow,
  WorkflowRun,
  WorkflowStatus,
  WorkflowRunStatus,
} from "@prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FindWorkflowsParams {
  orgId: string;
  projectId: string;
  status?: WorkflowStatus;
  page?: number;
  limit?: number;
}

export interface FindWorkflowRunsParams {
  orgId: string;
  workflowId: string;
  status?: WorkflowRunStatus;
  page?: number;
  limit?: number;
}

export interface WorkflowWithRuns extends Workflow {
  runs: WorkflowRun[];
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class WorkflowRepository {
  // -------------------------------------------------------------------------
  // Workflow CRUD
  // -------------------------------------------------------------------------

  /** Find a workflow by id, scoped to org via project. */
  async findById(id: string, orgId: string): Promise<Workflow | null> {
    return prisma.workflow.findFirst({
      where: { id, project: { orgId } },
    });
  }

  /** List workflows for a project within an org. */
  async findMany(
    params: FindWorkflowsParams
  ): Promise<{ data: Workflow[]; total: number }> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.WorkflowWhereInput = {
      projectId: params.projectId,
      project: { orgId: params.orgId },
      ...(params.status ? { status: params.status } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.workflow.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.workflow.count({ where }),
    ]);

    return { data, total };
  }

  /** Create a workflow under a project (org-scoped). */
  async create(
    projectId: string,
    orgId: string,
    data: Omit<Prisma.WorkflowCreateInput, "project">
  ): Promise<Workflow> {
    // Verify project belongs to the org
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
    });
    if (!project) {
      throw new Error(`Project ${projectId} not found in org ${orgId}`);
    }

    return prisma.workflow.create({
      data: {
        ...data,
        project: { connect: { id: projectId } },
      },
    });
  }

  /** Update a workflow (verified via org scope). */
  async update(
    id: string,
    orgId: string,
    data: Prisma.WorkflowUpdateInput
  ): Promise<Workflow> {
    const workflow = await prisma.workflow.findFirst({
      where: { id, project: { orgId } },
    });
    if (!workflow) {
      throw new Error(`Workflow ${id} not found in org ${orgId}`);
    }

    return prisma.workflow.update({ where: { id }, data });
  }

  /** Delete a workflow (verified via org scope). */
  async delete(id: string, orgId: string): Promise<Workflow> {
    const workflow = await prisma.workflow.findFirst({
      where: { id, project: { orgId } },
    });
    if (!workflow) {
      throw new Error(`Workflow ${id} not found in org ${orgId}`);
    }

    return prisma.workflow.delete({ where: { id } });
  }

  /** Find a workflow with its recent runs. */
  async findByIdWithRuns(
    id: string,
    orgId: string,
    runLimit = 10
  ): Promise<WorkflowWithRuns | null> {
    return prisma.workflow.findFirst({
      where: { id, project: { orgId } },
      include: {
        runs: {
          orderBy: { createdAt: "desc" },
          take: runLimit,
        },
      },
    });
  }

  // -------------------------------------------------------------------------
  // WorkflowRun CRUD
  // -------------------------------------------------------------------------

  /** Find a workflow run by id, scoped by orgId. */
  async findRunById(
    runId: string,
    orgId: string
  ): Promise<WorkflowRun | null> {
    return prisma.workflowRun.findFirst({
      where: { id: runId, orgId },
    });
  }

  /** List runs for a workflow, scoped by orgId. */
  async findRuns(
    params: FindWorkflowRunsParams
  ): Promise<{ data: WorkflowRun[]; total: number }> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.WorkflowRunWhereInput = {
      workflowId: params.workflowId,
      orgId: params.orgId,
      ...(params.status ? { status: params.status } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.workflowRun.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.workflowRun.count({ where }),
    ]);

    return { data, total };
  }

  /** Create a workflow run. */
  async createRun(
    workflowId: string,
    orgId: string,
    data?: Omit<Prisma.WorkflowRunCreateInput, "workflow" | "orgId">
  ): Promise<WorkflowRun> {
    return prisma.workflowRun.create({
      data: {
        ...data,
        orgId,
        workflow: { connect: { id: workflowId } },
      },
    });
  }

  /** Update a workflow run status and optional output data. */
  async updateRun(
    runId: string,
    orgId: string,
    data: Prisma.WorkflowRunUpdateInput
  ): Promise<WorkflowRun> {
    const run = await prisma.workflowRun.findFirst({
      where: { id: runId, orgId },
    });
    if (!run) {
      throw new Error(`WorkflowRun ${runId} not found in org ${orgId}`);
    }

    return prisma.workflowRun.update({ where: { id: runId }, data });
  }

  // -------------------------------------------------------------------------
  // Stats helpers
  // -------------------------------------------------------------------------

  /**
   * Increment the totalRuns counter and the success/failed counter
   * on the parent workflow. Called after a run completes.
   */
  async incrementRunStats(
    workflowId: string,
    orgId: string,
    outcome: "success" | "failed"
  ): Promise<Workflow> {
    const workflow = await prisma.workflow.findFirst({
      where: { id: workflowId, project: { orgId } },
    });
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found in org ${orgId}`);
    }

    return prisma.workflow.update({
      where: { id: workflowId },
      data: {
        totalRuns: { increment: 1 },
        ...(outcome === "success"
          ? { successRuns: { increment: 1 } }
          : { failedRuns: { increment: 1 } }),
        lastRunAt: new Date(),
      },
    });
  }
}

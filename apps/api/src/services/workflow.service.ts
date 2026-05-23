// =============================================================================
// apps/api/src/services/workflow.service.ts
// Workflow orchestration service.
// =============================================================================

import {
  WorkflowRepository,
  type FindWorkflowRunsParams,
  type FindWorkflowsParams,
  type Workflow,
  type WorkflowRun,
  type WorkflowRunStatus,
  type WorkflowStatus,
  type WorkflowWithRuns,
} from "@oneatlas/db";

type CreateWorkflowData = Parameters<WorkflowRepository["create"]>[2];
type UpdateWorkflowData = Parameters<WorkflowRepository["update"]>[2];
type CreateWorkflowRunData = Parameters<WorkflowRepository["createRun"]>[2];
type UpdateWorkflowRunData = Parameters<WorkflowRepository["updateRun"]>[2];

export class WorkflowService {
  constructor(private readonly workflows = new WorkflowRepository()) {}

  async getById(orgId: string, workflowId: string): Promise<Workflow | null> {
    return this.workflows.findById(workflowId, orgId);
  }

  async listByProject(
    orgId: string,
    projectId: string,
    params: Omit<FindWorkflowsParams, "orgId" | "projectId"> = {}
  ): Promise<{ data: Workflow[]; total: number }> {
    return this.workflows.findMany({ orgId, projectId, ...params });
  }

  async getWithRuns(
    orgId: string,
    workflowId: string,
    runLimit = 10
  ): Promise<WorkflowWithRuns | null> {
    return this.workflows.findByIdWithRuns(workflowId, orgId, runLimit);
  }

  async create(
    orgId: string,
    projectId: string,
    data: CreateWorkflowData
  ): Promise<Workflow> {
    return this.workflows.create(projectId, orgId, data);
  }

  async update(
    orgId: string,
    workflowId: string,
    data: UpdateWorkflowData
  ): Promise<Workflow> {
    return this.workflows.update(workflowId, orgId, data);
  }

  async delete(orgId: string, workflowId: string): Promise<Workflow> {
    return this.workflows.delete(workflowId, orgId);
  }

  async getRunById(orgId: string, runId: string): Promise<WorkflowRun | null> {
    return this.workflows.findRunById(runId, orgId);
  }

  async listRuns(
    orgId: string,
    workflowId: string,
    params: Omit<FindWorkflowRunsParams, "orgId" | "workflowId"> = {}
  ): Promise<{ data: WorkflowRun[]; total: number }> {
    return this.workflows.findRuns({ orgId, workflowId, ...params });
  }

  async createRun(
    orgId: string,
    workflowId: string,
    data?: CreateWorkflowRunData
  ): Promise<WorkflowRun> {
    return this.workflows.createRun(workflowId, orgId, data);
  }

  async updateRun(
    orgId: string,
    runId: string,
    data: UpdateWorkflowRunData
  ): Promise<WorkflowRun> {
    return this.workflows.updateRun(runId, orgId, data);
  }

  async incrementRunStats(
    orgId: string,
    workflowId: string,
    outcome: "success" | "failed"
  ): Promise<Workflow> {
    return this.workflows.incrementRunStats(workflowId, orgId, outcome);
  }
}

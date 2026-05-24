// =============================================================================
// apps/api/src/services/deployment.service.ts
// Deployment orchestration service.
// =============================================================================

import {
  DeploymentRepository,
  type Deployment,
  type DeploymentEnv,
  type DeploymentStatus,
  type DeploymentWithTelemetry,
} from "@oneatlas/db";
import {
  runDeployment,
  runUndeploy,
  syncDeployStatus,
  type DeploymentResult,
} from "../lib/deploymentService";

export interface ListDeploymentsParams {
  projectId: string;
  status?: DeploymentStatus;
  env?: DeploymentEnv;
  page?: number;
  limit?: number;
}

type CreateDeploymentData = Parameters<DeploymentRepository["create"]>[2];
type UpdateDeploymentData = Parameters<DeploymentRepository["update"]>[2];
type UpdateDeploymentStatusExtra = Parameters<DeploymentRepository["updateStatus"]>[3];
type UpsertTelemetryData = Parameters<DeploymentRepository["upsertTelemetry"]>[2];
type DeploymentTelemetryRecord = Awaited<ReturnType<DeploymentRepository["upsertTelemetry"]>>;

export class DeploymentService {
  constructor(private readonly deployments = new DeploymentRepository()) {}

  async getById(orgId: string, deploymentId: string): Promise<Deployment | null> {
    return this.deployments.findById(deploymentId, orgId);
  }

  async getByIdWithTelemetry(
    orgId: string,
    deploymentId: string
  ): Promise<DeploymentWithTelemetry | null> {
    return this.deployments.findByIdWithTelemetry(deploymentId, orgId);
  }

  async listByProject(
    orgId: string,
    params: ListDeploymentsParams
  ): Promise<{ data: Deployment[]; total: number }> {
    return this.deployments.findMany({ orgId, ...params });
  }

  async getLatest(orgId: string, projectId: string): Promise<Deployment | null> {
    return this.deployments.findLatest(projectId, orgId);
  }

  async getLive(orgId: string, projectId: string): Promise<Deployment | null> {
    return this.deployments.findLive(projectId, orgId);
  }

  async create(
    orgId: string,
    projectId: string,
    data: CreateDeploymentData
  ): Promise<Deployment> {
    return this.deployments.create(projectId, orgId, data);
  }

  async update(
    orgId: string,
    deploymentId: string,
    data: UpdateDeploymentData
  ): Promise<Deployment> {
    return this.deployments.update(deploymentId, orgId, data);
  }

  async updateStatus(
    orgId: string,
    deploymentId: string,
    status: DeploymentStatus,
    extra?: UpdateDeploymentStatusExtra
  ): Promise<Deployment> {
    return this.deployments.updateStatus(deploymentId, orgId, status, extra);
  }

  async delete(orgId: string, deploymentId: string): Promise<Deployment> {
    return this.deployments.delete(deploymentId, orgId);
  }

  async getNextVersion(orgId: string, projectId: string): Promise<number> {
    return this.deployments.getNextVersion(projectId, orgId);
  }

  async upsertTelemetry(
    orgId: string,
    deploymentId: string,
    data: UpsertTelemetryData
  ): Promise<DeploymentTelemetryRecord> {
    return this.deployments.upsertTelemetry(deploymentId, orgId, data);
  }

  async getTelemetry(
    orgId: string,
    deploymentId: string
  ): Promise<Awaited<ReturnType<DeploymentRepository["findTelemetry"]>>> {
    return this.deployments.findTelemetry(deploymentId, orgId);
  }

  async runDeployment(
    deploymentId: string,
    triggeredByUserId: string
  ): Promise<DeploymentResult> {
    return runDeployment(deploymentId, triggeredByUserId);
  }

  async runUndeploy(
    deploymentId: string,
    triggeredByUserId: string
  ): Promise<void> {
    return runUndeploy(deploymentId, triggeredByUserId);
  }

  async syncDeployStatus(deploymentId: string): Promise<void> {
    return syncDeployStatus(deploymentId);
  }
}

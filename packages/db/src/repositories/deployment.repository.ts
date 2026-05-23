// =============================================================================
// packages/db/src/repositories/deployment.repository.ts
// Data-access layer for Deployment and DeploymentTelemetry models.
// Deployment has no direct orgId — tenant isolation is enforced via
// the parent Project.orgId join on every query.
// =============================================================================

import { prisma } from "../client";
import type {
  Prisma,
  Deployment,
  DeploymentTelemetry,
  DeploymentStatus,
  DeploymentEnv,
} from "@prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FindDeploymentsParams {
  orgId: string;
  projectId: string;
  status?: DeploymentStatus;
  env?: DeploymentEnv;
  page?: number;
  limit?: number;
}

export interface DeploymentWithTelemetry extends Deployment {
  telemetry: DeploymentTelemetry | null;
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class DeploymentRepository {
  // -------------------------------------------------------------------------
  // Core CRUD
  // -------------------------------------------------------------------------

  /** Find a deployment by id, scoped to org via project. */
  async findById(id: string, orgId: string): Promise<Deployment | null> {
    return prisma.deployment.findFirst({
      where: { id, project: { orgId } },
    });
  }

  /** Find a deployment with its telemetry record. */
  async findByIdWithTelemetry(
    id: string,
    orgId: string
  ): Promise<DeploymentWithTelemetry | null> {
    return prisma.deployment.findFirst({
      where: { id, project: { orgId } },
      include: { telemetry: true },
    });
  }

  /** List deployments for a project within an org. */
  async findMany(
    params: FindDeploymentsParams
  ): Promise<{ data: Deployment[]; total: number }> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.DeploymentWhereInput = {
      projectId: params.projectId,
      project: { orgId: params.orgId },
      ...(params.status ? { status: params.status } : {}),
      ...(params.env ? { env: params.env } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.deployment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.deployment.count({ where }),
    ]);

    return { data, total };
  }

  /** Get the latest deployment for a project (any status). */
  async findLatest(
    projectId: string,
    orgId: string
  ): Promise<Deployment | null> {
    return prisma.deployment.findFirst({
      where: { projectId, project: { orgId } },
      orderBy: { version: "desc" },
    });
  }

  /** Get the current live deployment for a project. */
  async findLive(
    projectId: string,
    orgId: string
  ): Promise<Deployment | null> {
    return prisma.deployment.findFirst({
      where: {
        projectId,
        project: { orgId },
        status: "LIVE",
      },
    });
  }

  /** Create a new deployment for a project. */
  async create(
    projectId: string,
    orgId: string,
    data: Omit<Prisma.DeploymentCreateInput, "project">
  ): Promise<Deployment> {
    // Verify project belongs to the org
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
    });
    if (!project) {
      throw new Error(`Project ${projectId} not found in org ${orgId}`);
    }

    return prisma.deployment.create({
      data: {
        ...data,
        project: { connect: { id: projectId } },
      },
    });
  }

  /** Update deployment fields (status, buildLog, etc.). */
  async update(
    id: string,
    orgId: string,
    data: Prisma.DeploymentUpdateInput
  ): Promise<Deployment> {
    const deployment = await prisma.deployment.findFirst({
      where: { id, project: { orgId } },
    });
    if (!deployment) {
      throw new Error(`Deployment ${id} not found in org ${orgId}`);
    }

    return prisma.deployment.update({ where: { id }, data });
  }

  /** Update deployment status specifically (convenience method). */
  async updateStatus(
    id: string,
    orgId: string,
    status: DeploymentStatus,
    extra?: { errorMessage?: string; deployedUrl?: string; deployedAt?: Date }
  ): Promise<Deployment> {
    const deployment = await prisma.deployment.findFirst({
      where: { id, project: { orgId } },
    });
    if (!deployment) {
      throw new Error(`Deployment ${id} not found in org ${orgId}`);
    }

    return prisma.deployment.update({
      where: { id },
      data: { status, ...extra },
    });
  }

  /** Delete a deployment (verified via org scope). */
  async delete(id: string, orgId: string): Promise<Deployment> {
    const deployment = await prisma.deployment.findFirst({
      where: { id, project: { orgId } },
    });
    if (!deployment) {
      throw new Error(`Deployment ${id} not found in org ${orgId}`);
    }

    return prisma.deployment.delete({ where: { id } });
  }

  /** Get the next version number for a project's deployments. */
  async getNextVersion(projectId: string, orgId: string): Promise<number> {
    const latest = await this.findLatest(projectId, orgId);
    return (latest?.version ?? 0) + 1;
  }

  // -------------------------------------------------------------------------
  // Telemetry
  // -------------------------------------------------------------------------

  /** Create or update telemetry for a deployment. */
  async upsertTelemetry(
    deploymentId: string,
    orgId: string,
    data: Omit<Prisma.DeploymentTelemetryCreateInput, "deployment">
  ): Promise<DeploymentTelemetry> {
    // Verify deployment belongs to org
    const deployment = await prisma.deployment.findFirst({
      where: { id: deploymentId, project: { orgId } },
    });
    if (!deployment) {
      throw new Error(`Deployment ${deploymentId} not found in org ${orgId}`);
    }

    return prisma.deploymentTelemetry.upsert({
      where: { deploymentId },
      create: {
        ...data,
        deployment: { connect: { id: deploymentId } },
      },
      update: data,
    });
  }

  /** Find telemetry for a deployment. */
  async findTelemetry(
    deploymentId: string,
    orgId: string
  ): Promise<DeploymentTelemetry | null> {
    return prisma.deploymentTelemetry.findFirst({
      where: {
        deploymentId,
        deployment: { project: { orgId } },
      },
    });
  }
}

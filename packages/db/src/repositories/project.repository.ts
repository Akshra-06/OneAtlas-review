// =============================================================================
// packages/db/src/repositories/project.repository.ts
// Data-access layer for Project and ProjectEnvVar models.
// Every query is scoped by orgId — multi-tenant, no exceptions.
// =============================================================================

import { prisma } from "../client";
import type {
  Prisma,
  Project,
  ProjectEnvVar,
  ProjectStatus,
} from "@prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FindProjectsParams {
  orgId: string;
  status?: ProjectStatus;
  page?: number;
  limit?: number;
}

export interface ProjectWithRelations extends Project {
  deployments?: { id: string; status: string }[];
  workflows?: { id: string; name: string }[];
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class ProjectRepository {
  // -------------------------------------------------------------------------
  // Core CRUD
  // -------------------------------------------------------------------------

  /** Find a project by id, scoped to org. */
  async findById(id: string, orgId: string): Promise<Project | null> {
    return prisma.project.findFirst({
      where: { id, orgId },
    });
  }

  /** Find a project by slug within an org. */
  async findBySlug(slug: string, orgId: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { orgId_slug: { orgId, slug } },
    });
  }

  /** Find a project by its unique subdomain. */
  async findBySubdomain(subdomain: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { subdomain },
    });
  }

  /** List projects for an org with optional status filter. */
  async findMany(
    params: FindProjectsParams
  ): Promise<{ data: Project[]; total: number }> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      orgId: params.orgId,
      ...(params.status ? { status: params.status } : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.count({ where }),
    ]);

    return { data, total };
  }

  /** Create a new project within an org. */
  async create(
    orgId: string,
    data: Omit<Prisma.ProjectCreateInput, "org">
  ): Promise<Project> {
    return prisma.project.create({
      data: {
        ...data,
        org: { connect: { id: orgId } },
      },
    });
  }

  /** Update a project (must belong to org). */
  async update(
    id: string,
    orgId: string,
    data: Prisma.ProjectUpdateInput
  ): Promise<Project> {
    // Verify ownership first, then update
    const project = await prisma.project.findFirst({
      where: { id, orgId },
    });
    if (!project) {
      throw new Error(`Project ${id} not found in org ${orgId}`);
    }

    return prisma.project.update({ where: { id }, data });
  }

  /** Soft-delete by setting status to DELETED. */
  async softDelete(id: string, orgId: string): Promise<Project> {
    const project = await prisma.project.findFirst({
      where: { id, orgId },
    });
    if (!project) {
      throw new Error(`Project ${id} not found in org ${orgId}`);
    }

    return prisma.project.update({
      where: { id },
      data: { status: "DELETED" },
    });
  }

  /** Hard-delete a project (cascades dependents). */
  async delete(id: string, orgId: string): Promise<Project> {
    const project = await prisma.project.findFirst({
      where: { id, orgId },
    });
    if (!project) {
      throw new Error(`Project ${id} not found in org ${orgId}`);
    }

    return prisma.project.delete({ where: { id } });
  }

  /** Count projects in an org, optionally by status. */
  async count(orgId: string, status?: ProjectStatus): Promise<number> {
    return prisma.project.count({
      where: { orgId, ...(status ? { status } : {}) },
    });
  }

  // -------------------------------------------------------------------------
  // Project with relations
  // -------------------------------------------------------------------------

  /** Fetch a project with its deployments and workflows. */
  async findByIdWithRelations(
    id: string,
    orgId: string
  ): Promise<ProjectWithRelations | null> {
    return prisma.project.findFirst({
      where: { id, orgId },
      include: {
        deployments: {
          select: { id: true, status: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        workflows: {
          select: { id: true, name: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  // -------------------------------------------------------------------------
  // Environment variables (scoped via project → orgId)
  // -------------------------------------------------------------------------

  /** List env vars for a project (after verifying org ownership). */
  async findEnvVars(
    projectId: string,
    orgId: string
  ): Promise<ProjectEnvVar[]> {
    return prisma.projectEnvVar.findMany({
      where: { project: { id: projectId, orgId } },
      orderBy: { key: "asc" },
    });
  }

  /** Upsert an env var on a project. */
  async upsertEnvVar(
    projectId: string,
    orgId: string,
    key: string,
    value: string,
    isSecret = true
  ): Promise<ProjectEnvVar> {
    // Verify org ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
    });
    if (!project) {
      throw new Error(`Project ${projectId} not found in org ${orgId}`);
    }

    return prisma.projectEnvVar.upsert({
      where: { projectId_key: { projectId, key } },
      create: { projectId, key, value, isSecret },
      update: { value, isSecret },
    });
  }

  /** Delete an env var from a project. */
  async deleteEnvVar(
    projectId: string,
    orgId: string,
    key: string
  ): Promise<ProjectEnvVar> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
    });
    if (!project) {
      throw new Error(`Project ${projectId} not found in org ${orgId}`);
    }

    return prisma.projectEnvVar.delete({
      where: { projectId_key: { projectId, key } },
    });
  }
}

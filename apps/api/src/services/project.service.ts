// =============================================================================
// apps/api/src/services/project.service.ts
// Project orchestration service.
// =============================================================================

import {
  ProjectRepository,
  type Project,
  type ProjectStatus,
  type ProjectWithRelations,
} from "@oneatlas/db";

type CreateProjectData = Parameters<ProjectRepository["create"]>[1];
type UpdateProjectData = Parameters<ProjectRepository["update"]>[2];

export interface ListProjectsParams {
  status?: ProjectStatus;
  page?: number;
  limit?: number;
}

export class ProjectService {
  constructor(private readonly projects = new ProjectRepository()) {}

  async getById(orgId: string, projectId: string): Promise<Project | null> {
    return this.projects.findById(projectId, orgId);
  }

  async getBySlug(orgId: string, slug: string): Promise<Project | null> {
    return this.projects.findBySlug(slug, orgId);
  }

  async getBySubdomain(subdomain: string): Promise<Project | null> {
    return this.projects.findBySubdomain(subdomain);
  }

  async listByOrg(
    orgId: string,
    params: ListProjectsParams = {}
  ): Promise<{ data: Project[]; total: number }> {
    return this.projects.findMany({ orgId, ...params });
  }

  async getWithRelations(
    orgId: string,
    projectId: string
  ): Promise<ProjectWithRelations | null> {
    return this.projects.findByIdWithRelations(projectId, orgId);
  }

  async create(
    orgId: string,
    data: CreateProjectData
  ): Promise<Project> {
    return this.projects.create(orgId, data);
  }

  async update(
    orgId: string,
    projectId: string,
    data: UpdateProjectData
  ): Promise<Project> {
    return this.projects.update(projectId, orgId, data);
  }

  async softDelete(orgId: string, projectId: string): Promise<Project> {
    return this.projects.softDelete(projectId, orgId);
  }

  async delete(orgId: string, projectId: string): Promise<Project> {
    return this.projects.delete(projectId, orgId);
  }

  async count(orgId: string, status?: ProjectStatus): Promise<number> {
    return this.projects.count(orgId, status);
  }
}

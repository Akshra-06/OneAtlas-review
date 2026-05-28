import { Project, ApiResponse } from "@/types";
import { apiFetch } from "./api";

interface PaginatedProjects {
  data: Project[];
}

type ProjectsResponse = ApiResponse<Project[] | PaginatedProjects>;

export async function getProjects(orgId: string, token?: string): Promise<Project[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const json = await apiFetch<ProjectsResponse>(`/orgs/${orgId}/projects`, {
    headers,
  });

  if (!Array.isArray(json.data) && Array.isArray(json.data.data)) {
    return json.data.data;
  }

  if (Array.isArray(json.data)) {
    return json.data;
  }

  return [];
}

// POST create project
export async function createProject(
  orgId: string,
  token?: string,
  payload?: Pick<Project, "name" | "description" | "prompt" | "type">
): Promise<Project> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const json = await apiFetch<ApiResponse<Project>>(`/orgs/${orgId}/projects`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  return json.data;
}

// DELETE project
export async function deleteProject(orgId: string, projectId: string, token?: string): Promise<void> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  await apiFetch<void>(`/orgs/${orgId}/projects/${projectId}`, {
    method: "DELETE",
    headers,
  });
}

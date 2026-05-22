import { Project, ApiResponse } from "@/types";
import { apiFetch } from "./api";

export async function getProjects(orgId: string, token?: string): Promise<Project[]> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const json = await apiFetch<any>(`/orgs/${orgId}/projects`, {
    headers,
  });

  // Response shape: { success: true, data: { data: Project[], pagination: {...} } }
  if (json?.data?.data && Array.isArray(json.data.data)) {
    return json.data.data;
  }
  // Flat array fallback
  if (Array.isArray(json?.data)) {
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
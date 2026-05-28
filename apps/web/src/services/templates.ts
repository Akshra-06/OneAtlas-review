import { ApiResponse } from "@/types";
import { apiFetch } from "./api";

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  domain: string;
  icon: string;
}

export type DashboardConfig = {
  layout: Record<string, unknown>;
  theme: Record<string, unknown>;
  widgets: unknown[];
};

export async function listTemplates(orgId?: string): Promise<DashboardTemplate[]> {
  const query = orgId ? `?orgId=${encodeURIComponent(orgId)}` : "";
  const json = await apiFetch<ApiResponse<DashboardTemplate[]>>(
    `/templates${query}`
  );

  return json.data;
}

export async function getDashboardData<T>(
  orgId: string,
  projectId: string,
  templateId: string
): Promise<T> {
  const json = await apiFetch<ApiResponse<T>>(
    `/orgs/${orgId}/projects/${projectId}/dashboard?templateId=${encodeURIComponent(
      templateId
    )}`,
    { cache: "no-store" }
  );

  return json.data;
}

export async function getDashboardConfig(
  orgId: string,
  projectId: string
): Promise<DashboardConfig> {
  const json = await apiFetch<ApiResponse<DashboardConfig>>(
    `/orgs/${orgId}/projects/${projectId}/dashboard/config`
  );

  return json.data;
}

export async function saveDashboardConfig(
  orgId: string,
  projectId: string,
  config: DashboardConfig
): Promise<DashboardConfig> {
  const json = await apiFetch<ApiResponse<DashboardConfig>>(
    `/orgs/${orgId}/projects/${projectId}/dashboard/config`,
    {
      method: "POST",
      body: JSON.stringify(config),
    }
  );

  return json.data;
}

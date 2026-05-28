import { auth } from "@clerk/nextjs/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL + "/api/v1";

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const { getToken } = await auth();
    const token = await getToken();
    if (token) return { Authorization: `Bearer ${token}` };
  } catch {}
  return {};
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeader();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...headers },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || "API Error");
  return data.data;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const headers = await getAuthHeader();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || "API Error");
  return data.data;
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const headers = await getAuthHeader();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || "API Error");
  return data.data;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const headers = await getAuthHeader();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...headers },
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error?.message || "API Error");
  return data.data;
}

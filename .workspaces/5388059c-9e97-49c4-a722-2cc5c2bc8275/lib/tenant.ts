import { NextRequest } from "next/server";

export async function getTenantId(request: NextRequest): Promise<string> {
  const headerTenant = request.headers.get("x-org-id") ?? request.headers.get("x-tenant-id");
  if (headerTenant) return headerTenant;
  return "demo-tenant";
}

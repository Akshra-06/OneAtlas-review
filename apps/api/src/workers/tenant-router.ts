/**
 * Tenant Router - Cloudflare Durable Object
 * Routes requests to correct tenant's API based on subdomain
 * Enables multi-tenant architecture with edge isolation
 *
 * Usage: crm.oneatlas.app → routes to CRM tenant's API
 *        hr.oneatlas.app  → routes to HR tenant's API
 */

// Use simple type aliases for Durable Objects to avoid missing dev-type packages
// during Next.js type-check. For stricter typing, install @cloudflare/workers-types
// and update imports.
type DurableObjectNamespace = any;
type DurableObjectState = any;

export interface Env {
  TENANT_ROUTER: DurableObjectNamespace;
  DATABASE_URL: string;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  ENVIRONMENT: string;
}

/**
 * Main Worker - Routes requests to Durable Objects
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname;

    // Extract tenant ID from subdomain
    // Examples:
    // - crm.oneatlas.app → crm
    // - hr.oneatlas.app  → hr
    // - api.oneatlas.app → api (not a tenant)
    const parts = hostname.split(".");
    const [subdomain] = parts;

    // Skip reserved subdomains
    const reserved = ["api", "www", "admin", "mail", "staging-api"];
    if (!subdomain || reserved.includes(subdomain) || hostname === "oneatlas.app") {
      return new Response("Not a tenant subdomain", { status: 404 });
    }

    try {
      // Get or create Durable Object for this tenant
      const id = env.TENANT_ROUTER.idFromName(subdomain);
      const router = env.TENANT_ROUTER.get(id);

      // Forward request to tenant-specific handler
      return router.fetch(request);
    } catch (error) {
      console.error(`[TenantRouter] Error routing ${subdomain}:`, error);
      return new Response("Routing failed", { status: 500 });
    }
  },
};

/**
 * TenantRouter Durable Object - Handles per-tenant logic
 */
export class TenantRouter {
  state: DurableObjectState;
  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const tenantId = this.state.id.name;

    // Get tenant metadata (cached in Durable Object state)
    let tenantMetadata = (await this.state.storage?.get(
      `tenant:${tenantId}`
    )) as Record<string, unknown> | undefined;

    // If not in cache, fetch from database
    if (!tenantMetadata) {
      tenantMetadata = await this.fetchTenantMetadata(tenantId);
      if (!tenantMetadata) {
        return new Response("Tenant not found", { status: 404 });
      }
      // Cache for 1 hour
      await this.state.storage?.put(
        `tenant:${tenantId}`,
        tenantMetadata,
        ({ expirationTtl: 3600 } as any)
      );
    }

    // Validate tenant is active
    if ((tenantMetadata as Record<string, unknown>).status !== "active") {
      return new Response("Tenant is inactive", { status: 403 });
    }

    // Add tenant context headers
    const headers = new Headers(request.headers);
    headers.set("X-Tenant-ID", tenantId);
    headers.set("X-Tenant-Name", String((tenantMetadata as Record<string, unknown>).name || tenantId));
    headers.set("X-Forwarded-Host", new URL(request.url).hostname);

    // Construct API request
    const apiUrl = new URL(url.pathname + url.search, this.getApiBaseUrl());

    try {
      const response = await fetch(new Request(apiUrl, {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method)
          ? undefined
          : request.body,
        cf: ({
          cacheTtl: 60,
          cacheEverything: url.pathname === "/health",
        } as any),
      } as any));

      // Log successful request (fire-and-forget)
      this.logRequest(tenantId, request, response.status);

      return response;
    } catch (error) {
      console.error(`[Tenant ${tenantId}] Request failed:`, error);
      return new Response("Service unavailable", { status: 503 });
    }
  }

  /**
   * Fetch tenant metadata from database
   */
  private async fetchTenantMetadata(
    tenantId: string
  ): Promise<Record<string, unknown> | undefined> {
    try {
      // In production, query your database
      // For now, return mock data
      const mockTenants: Record<string, Record<string, unknown>> = {
        crm: {
          id: "crm",
          name: "CRM Application",
          status: "active",
          tier: "pro",
        },
        hr: {
          id: "hr",
          name: "HR Management",
          status: "active",
          tier: "pro",
        },
        ops: {
          id: "ops",
          name: "Operations",
          status: "active",
          tier: "pro",
        },
      };

      return mockTenants[tenantId] || undefined;
    } catch (error) {
      console.error(`[TenantRouter] Error fetching tenant ${tenantId}:`, error);
      return undefined;
    }
  }

  /**
   * Get API base URL based on environment
   */
  private getApiBaseUrl(): string {
    const env = this.env.ENVIRONMENT || "production";
    if (env === "staging") {
      return "https://staging-api.oneatlas.app";
    }
    return "https://api.oneatlas.app";
  }

  /**
   * Log request to analytics (fire-and-forget)
   */
  private logRequest(
    tenantId: string,
    request: Request,
    status: number
  ): void {
    const url = new URL(request.url);
    // Send to analytics service asynchronously
    // This doesn't block the response
    void fetch("https://analytics.oneatlas.app/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId,
        path: url.pathname,
        method: request.method,
        status,
        timestamp: new Date().toISOString(),
      }),
    }).catch((err) => console.error("Analytics logging failed:", err));
  }
}

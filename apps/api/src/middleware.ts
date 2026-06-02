// =============================================================================
// apps/api/src/middleware.ts
//
// Clerk auth middleware + request logging + rate limiting enforcement.
// Replaces the original middleware.ts completely.
// =============================================================================

import { clerkMiddleware, createRouteMatcher, createClerkClient } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { RATE_LIMITS } from "@oneatlas/shared";
import { extractBearerToken, verifyApiKey } from "./lib/apiKeys";
import { withCors } from "./lib/cors";

// ── Route matchers ────────────────────────────────────────────────────────────

const isPublicRoute = createRouteMatcher([
  "/api/webhooks/(.*)",
  "/api/health",
  "/api/ready",
  "/api/v1/ai/health",
  "/api/v1/ai/complete",
  "/api/v1/templates/preview",
]);

const isAiRoute = createRouteMatcher([
  "/api/v1/orgs/:orgId/projects/:projectId/generate",
]);

const isDeployRoute = createRouteMatcher([
  "/api/v1/orgs/:orgId/projects/:projectId/deployments",
]);

// ── Rate limiters (lazy-initialised so missing Redis just skips limiting) ─────

let defaultLimiter: Ratelimit | null = null;
let aiLimiter: Ratelimit | null = null;
let deployLimiter: Ratelimit | null = null;

async function getRedis(): Promise<any | null> {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  try {
    // Dynamically import to defer Node-only code. Works on Node runtime;
    // gracefully fails on Edge (rate limiting will be skipped).
    const mod = await import("@upstash/redis");
    const RedisClient = (mod as any).Redis ?? (mod as any).default ?? mod;
    return new RedisClient({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (err) {
    console.warn("getRedis: Redis unavailable (expected on Edge runtime)", err);
    return null;
  }
}

async function getLimiters() {
  const redis = await getRedis();
  if (!redis) return { defaultLimiter: null, aiLimiter: null, deployLimiter: null };

  if (!defaultLimiter) {
    defaultLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMITS.DEFAULT.requests,
        `${RATE_LIMITS.DEFAULT.windowMs}ms`
      ),
      prefix: "rl:default",
    });
  }
  if (!aiLimiter) {
    aiLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMITS.AI_GENERATE.requests,
        `${RATE_LIMITS.AI_GENERATE.windowMs}ms`
      ),
      prefix: "rl:ai",
    });
  }
  if (!deployLimiter) {
    deployLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        RATE_LIMITS.DEPLOY.requests,
        `${RATE_LIMITS.DEPLOY.windowMs}ms`
      ),
      prefix: "rl:deploy",
    });
  }

  return { defaultLimiter, aiLimiter, deployLimiter };
}

// ── Logger ────────────────────────────────────────────────────────────────────

function log(fields: Record<string, unknown>) {
  // In production, ship to BetterStack / Logtail via their SDK.
  // For now: structured JSON to stdout which any log aggregator can ingest.
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...fields }));
}


export default clerkMiddleware(async (auth, req: NextRequest) => {
  try {
    const startMs = Date.now();
    const requestId = crypto.randomUUID();

  // Attach request ID so route handlers can read it from headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-request-id", requestId);

  // Temporary diagnostics as requested
  const originHeader = req.headers.get("origin");
  const hasAuthHeader = req.headers.has("Authorization");
  console.log(`[middleware] Incoming request: method=${req.method} path=${req.nextUrl.pathname} origin=${originHeader} hasAuthHeader=${hasAuthHeader}`);

  // ── DEV BYPASS — must be first, before any auth check ───────────────────
  if (process.env.NODE_ENV === 'development' && process.env.DEV_BYPASS_AUTH === 'true') {
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("x-request-id", requestId);
    return res;
  }

  // ── Preflight CORS checks ─────────────────────────────────────────────────
  if (req.method === "OPTIONS") {
    const origin = req.headers.get("origin") ?? "*";
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-request-id",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Public routes — log and pass through
  if (isPublicRoute(req)) {
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("x-request-id", requestId);

    log({
      requestId,
      method: req.method,
      path: req.nextUrl.pathname,
      public: true,
      latencyMs: Date.now() - startMs,
    });

    const origin = req.headers.get("origin") ?? "*";
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-request-id");

    return res;
  }

  // ── API Key auth (Bearer oa_live_* / oa_test_*) ───────────────────────────
  const bearerToken = extractBearerToken(req.headers.get("authorization"));
  if (bearerToken?.startsWith("oa_")) {
    try {
      const apiKeyAuth = await verifyApiKey(bearerToken);
      // Attach resolved identity to headers so route handlers can read it
      requestHeaders.set("x-api-key-user-id", apiKeyAuth.userId);
      requestHeaders.set("x-api-key-org-id", apiKeyAuth.orgId);
      requestHeaders.set("x-auth-type", "api-key");

      log({
        requestId,
        method: req.method,
        path: req.nextUrl.pathname,
        authType: "api-key",
        orgId: apiKeyAuth.orgId,
        latencyMs: Date.now() - startMs,
      });

      const res = NextResponse.next({ request: { headers: requestHeaders } });
      res.headers.set("x-request-id", requestId);
      return res;
    } catch {
      return withCors(
        NextResponse.json(
          { success: false, error: { code: "UNAUTHORIZED", message: "Invalid API key", status: 401 } },
          { status: 401 }
        ),
        req.headers.get("origin") ?? undefined
      );
    }
  }

  // ── Clerk JWT Bearer token (cross-origin web app → API) ──────────────────
  // When the web app runs on a different port/origin, Clerk session cookies
  // are not forwarded. The frontend sends getToken() result as a Bearer JWT.
  // We verify it directly using Clerk's SDK and inject the session into headers.
  if (bearerToken && !bearerToken.startsWith("oa_")) {
    try {
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
        publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      });

      const requestState = await clerkClient.authenticateRequest(req, {
        jwtKey: process.env.CLERK_JWT_KEY,
        authorizedParties: [
          "http://localhost:3000",
          "http://localhost:3001",
          "http://127.0.0.1:3000",
          "http://127.0.0.1:3001",
          process.env.NEXT_PUBLIC_APP_URL,
          process.env.NEXT_PUBLIC_API_URL,
        ].filter(Boolean) as string[],
      });

      if (requestState.status === "signed-in" && requestState.toAuth().userId) {
        const resolvedAuth = requestState.toAuth();
        // Inject clerk session data into headers so auth() in route handlers resolves
        requestHeaders.set("x-clerk-user-id", resolvedAuth.userId!);
        requestHeaders.set("x-clerk-org-id", resolvedAuth.orgId ?? "");
        requestHeaders.set("x-clerk-org-role", resolvedAuth.orgRole ?? "");
        requestHeaders.set("x-clerk-org-slug", resolvedAuth.orgSlug ?? "");
        requestHeaders.set("x-auth-type", "clerk-jwt");

        log({
          requestId,
          method: req.method,
          path: req.nextUrl.pathname,
          authType: "clerk-jwt",
          clerkUserId: resolvedAuth.userId,
          orgId: resolvedAuth.orgId,
          latencyMs: Date.now() - startMs,
        });

        // Forward Clerk's internal auth headers so auth() resolves in route handlers
        requestState.headers.forEach((value: string, key: string) => {
          requestHeaders.set(key, value);
        });

        const res = NextResponse.next({ request: { headers: requestHeaders } });
        res.headers.set("x-request-id", requestId);

        // Also set on response headers so cookies/session updates propagate back to client
        requestState.headers.forEach((value: string, key: string) => {
          res.headers.set(key, value);
        });
        return res;
      }
    } catch (err) {
      console.error("[middleware] Clerk JWT verification failed:", err);
      // Fall through to cookie-based auth check
    }
  }

  // Require valid Clerk session for all /api/v1/* routes (cookie-based, same-origin)
  const session = await auth();
  if (!session.userId) {
    log({
      requestId,
      method: req.method,
      path: req.nextUrl.pathname,
      status: 401,
      latencyMs: Date.now() - startMs,
    });
    return withCors(
      NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No valid session", status: 401 } },
        { status: 401 }
      ),
      req.headers.get("origin") ?? undefined
    );
  }

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const { defaultLimiter: dl, aiLimiter: al, deployLimiter: depl } = await getLimiters();

  if (dl || al || depl) {
    // Key: per-user + per-org (extracted from path segment)
    const orgIdMatch = req.nextUrl.pathname.match(/\/orgs\/([^/]+)/);
    const orgId = orgIdMatch?.[1] ?? "global";
    const rateLimitKey = `${session.userId}:${orgId}`;

    let limiter = dl;
    if (al && isAiRoute(req))     limiter = al;
    if (depl && isDeployRoute(req)) limiter = depl;

    if (limiter) {
      const { success, limit, remaining, reset } = await limiter.limit(rateLimitKey);

      if (!success) {
        log({
          requestId,
          clerkUserId: session.userId,
          orgId,
          method: req.method,
          path: req.nextUrl.pathname,
          status: 429,
          rateLimited: true,
          latencyMs: Date.now() - startMs,
        });

        return withCors(
          NextResponse.json(
            {
              success: false,
              error: {
                code: "RATE_LIMIT_EXCEEDED",
                message: "Too many requests. Please slow down.",
                status: 429,
                retryAfter: Math.ceil((reset - Date.now()) / 1000),
              },
            },
            {
              status: 429,
              headers: {
                "X-RateLimit-Limit": String(limit),
                "X-RateLimit-Remaining": String(remaining),
                "X-RateLimit-Reset": String(reset),
                "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
              },
            }
          ),
          req.headers.get("origin") ?? undefined
        );
      }
    }
  }

  // ── Pass through ──────────────────────────────────────────────────────────
  const res = NextResponse.next({ request: { headers: requestHeaders } });
  res.headers.set("x-request-id", requestId);

  // CORS headers — allow the web app origin to read responses
  const origin = req.headers.get("origin") ?? "*";
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-request-id");

  // Log after headers are set — latency includes rate-limit check
  log({
    requestId,
    clerkUserId: session.userId,
    method: req.method,
    path: req.nextUrl.pathname,
    orgId: req.nextUrl.pathname.match(/\/orgs\/([^/]+)/)?.[1],
    latencyMs: Date.now() - startMs,
  });

    return res;
  } catch (err) {
    try {
      console.error('[middleware] uncaught error', err);
    } catch (e) {
      // ignore
    }
    return new NextResponse(JSON.stringify({ success: false, error: String(err) }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

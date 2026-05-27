// =============================================================================
// apps/api/src/app/api/v1/integrations/github/callback/route.ts
// GET /api/v1/integrations/github/callback - handle GitHub OAuth callback
// =============================================================================

export const runtime = "nodejs";

import { createCipheriv, createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@oneatlas/db";
import { requireOrgMember } from "../../../../../../lib/auth";
import { logger } from "../../../../../../lib/logger";

const STATE_COOKIE_NAME = "github_oauth_state";

interface StoredOAuthState {
  state: string;
  orgId: string;
  userId: string;
}

interface GitHubTokenResponse {
  access_token?: string;
  token_type?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

function frontendRedirect(status: "success" | "error", value: string): NextResponse {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3000";
  const redirectUrl = new URL("/integrations/github", frontendUrl);
  redirectUrl.searchParams.set(status, value);
  return NextResponse.redirect(redirectUrl);
}

function parseStoredState(value: string | undefined): StoredOAuthState | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    const stateValue = parsed && typeof parsed === "object" && "state" in parsed ? parsed.state : null;
    const orgIdValue = parsed && typeof parsed === "object" && "orgId" in parsed ? parsed.orgId : null;
    const userIdValue = parsed && typeof parsed === "object" && "userId" in parsed ? parsed.userId : null;

    if (
      typeof stateValue === "string" &&
      typeof orgIdValue === "string" &&
      typeof userIdValue === "string"
    ) {
      return { state: stateValue, orgId: orgIdValue, userId: userIdValue };
    }
  } catch {
    return null;
  }

  return null;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function encryptToken(token: string): string {
  const secret = requireEnv("APP_SECRET");
  const key = createHash("sha256").update(secret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`;
}

async function exchangeCodeForToken(code: string): Promise<GitHubTokenResponse> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: requireEnv("GITHUB_CLIENT_ID"),
      client_secret: requireEnv("GITHUB_CLIENT_SECRET"),
      code,
      redirect_uri: requireEnv("GITHUB_REDIRECT_URI"),
    }),
  });

  const payload: unknown = await response.json();
  if (typeof payload === "object" && payload !== null) {
    return payload as GitHubTokenResponse;
  }

  return { error: "invalid_response" };
}

export async function GET(req: NextRequest) {
  const storedState = parseStoredState(req.cookies.get(STATE_COOKIE_NAME)?.value);
  const responseWithClearedCookie = (response: NextResponse): NextResponse => {
    response.cookies.delete(STATE_COOKIE_NAME);
    return response;
  };

  try {
    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");

    if (!code || !state || !storedState || storedState.state !== state) {
      logger.warn("github.oauth.invalid_state", { hasCode: Boolean(code) });
      return responseWithClearedCookie(frontendRedirect("error", "invalid_state"));
    }

    const auth = await requireOrgMember(storedState.orgId);
    if (auth.userId !== storedState.userId) {
      logger.warn("github.oauth.user_mismatch", {
        orgId: storedState.orgId,
        userId: auth.userId,
      });
      return responseWithClearedCookie(frontendRedirect("error", "invalid_state"));
    }

    const tokenResponse = await exchangeCodeForToken(code);
    if (!tokenResponse.access_token || tokenResponse.error) {
      logger.warn("github.oauth.token_exchange_failed", {
        orgId: auth.orgId,
        userId: auth.userId,
        githubError: tokenResponse.error,
      });
      return responseWithClearedCookie(frontendRedirect("error", "token_exchange_failed"));
    }

    const encryptedToken = encryptToken(tokenResponse.access_token);
    await prisma.integration.upsert({
      where: { orgId_provider: { orgId: auth.orgId, provider: "GITHUB" } },
      create: {
        orgId: auth.orgId,
        provider: "GITHUB",
        name: "GitHub",
        accessToken: encryptedToken,
        metadata: {
          userId: auth.userId,
          scope: tokenResponse.scope ?? null,
          tokenType: tokenResponse.token_type ?? null,
          connectedAt: new Date().toISOString(),
        },
        isActive: true,
      },
      update: {
        accessToken: encryptedToken,
        metadata: {
          userId: auth.userId,
          scope: tokenResponse.scope ?? null,
          tokenType: tokenResponse.token_type ?? null,
          connectedAt: new Date().toISOString(),
        },
        isActive: true,
      },
    });

    logger.info("github.oauth.connected", {
      orgId: auth.orgId,
      userId: auth.userId,
    });

    return responseWithClearedCookie(frontendRedirect("success", "github_connected"));
  } catch (error) {
    logger.error("github.oauth.callback_failed", {
      orgId: storedState?.orgId,
      userId: storedState?.userId,
      error,
    });
    return responseWithClearedCookie(frontendRedirect("error", "github_connection_failed"));
  }
}

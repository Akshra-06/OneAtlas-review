// =============================================================================
// apps/api/src/app/api/v1/integrations/github/route.ts
// GET /api/v1/integrations/github - initiate GitHub OAuth flow
// =============================================================================

export const runtime = "nodejs";

import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ValidationError } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../lib/auth";
import { errorResponse } from "../../../../../lib/response";
import { logger } from "../../../../../lib/logger";

const STATE_COOKIE_NAME = "github_oauth_state";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

export async function GET(req: NextRequest) {
  try {
    const orgId = req.nextUrl.searchParams.get("orgId");
    if (!orgId) {
      throw new ValidationError("orgId is required");
    }

    const auth = await requireOrgMember(orgId);
    const state = randomBytes(32).toString("hex");
    const clientId = requireEnv("GITHUB_CLIENT_ID");
    const redirectUri = requireEnv("GITHUB_REDIRECT_URI");

    const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
    authorizeUrl.searchParams.set("client_id", clientId);
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    authorizeUrl.searchParams.set("scope", "repo webhook");
    authorizeUrl.searchParams.set("state", state);

    const response = NextResponse.redirect(authorizeUrl);
    response.cookies.set({
      name: STATE_COOKIE_NAME,
      value: JSON.stringify({ state, orgId: auth.orgId, userId: auth.userId }),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 10 * 60,
    });

    logger.info("github.oauth.started", {
      orgId: auth.orgId,
      userId: auth.userId,
    });

    return response;
  } catch (error) {
    logger.error("github.oauth.start_failed", { error });
    return errorResponse(error);
  }
}

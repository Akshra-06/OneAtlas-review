// =============================================================================
// apps/api/src/app/api/v1/integrations/github/repos/route.ts
// GET /api/v1/integrations/github/repos - list GitHub repositories
// =============================================================================

export const runtime = "nodejs";

import { createDecipheriv, createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { prisma } from "@oneatlas/db";
import { NotFoundError, ValidationError } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../lib/auth";
import { ok, errorResponse } from "../../../../../../lib/response";
import { logger } from "../../../../../../lib/logger";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  html_url: string;
}

interface RepoResponse {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  url: string;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function decryptToken(encryptedToken: string): string {
  const [ivValue, authTagValue, encryptedValue] = encryptedToken.split(":");
  if (!ivValue || !authTagValue || !encryptedValue) {
    throw new Error("Invalid encrypted GitHub token");
  }

  const key = createHash("sha256").update(requireEnv("APP_SECRET")).digest();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivValue, "base64"));
  decipher.setAuthTag(Buffer.from(authTagValue, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedValue, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

function isGitHubRepo(value: unknown): value is GitHubRepo {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value &&
    "full_name" in value &&
    "private" in value &&
    "default_branch" in value &&
    "html_url" in value &&
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.full_name === "string" &&
    typeof value.private === "boolean" &&
    typeof value.default_branch === "string" &&
    typeof value.html_url === "string"
  );
}

function getMetadataUserId(metadata: unknown): string | null {
  if (
    typeof metadata === "object" &&
    metadata !== null &&
    "userId" in metadata &&
    typeof metadata.userId === "string"
  ) {
    return metadata.userId;
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const orgId = req.nextUrl.searchParams.get("orgId");
    if (!orgId) {
      throw new ValidationError("orgId is required");
    }

    const auth = await requireOrgMember(orgId);
    const page = req.nextUrl.searchParams.get("page") ?? "1";
    const perPage = req.nextUrl.searchParams.get("limit") ?? "30";

    const integration = await prisma.integration.findUnique({
      where: { orgId_provider: { orgId: auth.orgId, provider: "GITHUB" } },
      select: { accessToken: true, metadata: true },
    });

    if (
      !integration?.accessToken ||
      getMetadataUserId(integration.metadata) !== auth.userId
    ) {
      throw new NotFoundError("GitHub integration");
    }

    const token = decryptToken(integration.accessToken);
    const reposUrl = new URL("https://api.github.com/user/repos");
    reposUrl.searchParams.set("page", page);
    reposUrl.searchParams.set("per_page", perPage);
    reposUrl.searchParams.set("sort", "updated");

    const githubResponse = await fetch(reposUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!githubResponse.ok) {
      logger.warn("github.repos.fetch_failed", {
        orgId: auth.orgId,
        userId: auth.userId,
        status: githubResponse.status,
      });
      throw new Error("Failed to fetch GitHub repositories");
    }

    const payload: unknown = await githubResponse.json();
    const repos: RepoResponse[] = Array.isArray(payload)
      ? payload.filter(isGitHubRepo).map((repo) => ({
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          private: repo.private,
          default_branch: repo.default_branch,
          url: repo.html_url,
        }))
      : [];

    return ok({
      repos,
      page: Number(page),
      limit: Number(perPage),
    });
  } catch (error) {
    logger.error("github.repos.failed", { error });
    return errorResponse(error);
  }
}

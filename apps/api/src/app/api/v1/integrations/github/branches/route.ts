// =============================================================================
// apps/api/src/app/api/v1/integrations/github/branches/route.ts
// GET /api/v1/integrations/github/branches - list GitHub repository branches
// =============================================================================

export const runtime = "nodejs";

import { createDecipheriv, createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { prisma } from "@oneatlas/db";
import { NotFoundError, RateLimitError, ValidationError } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../lib/auth";
import { ok, errorResponse } from "../../../../../../lib/response";
import { logger } from "../../../../../../lib/logger";

interface LinkedRepo {
  owner: string;
  repo: string;
  fullName: string;
}

interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
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

function metadataString(metadata: unknown, key: string): string | null {
  if (
    typeof metadata === "object" &&
    metadata !== null &&
    key in metadata &&
    typeof metadata[key as keyof typeof metadata] === "string"
  ) {
    return metadata[key as keyof typeof metadata] as string;
  }

  return null;
}

function parseLinkedRepo(repoFullName: string): LinkedRepo {
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) {
    throw new ValidationError("Linked GitHub repository is invalid");
  }

  return { owner, repo, fullName: repoFullName };
}

function githubHeaders(token: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function assertNotRateLimited(response: Response): void {
  if (response.status === 429 || response.status === 403) {
    throw new RateLimitError("GitHub API rate limit exceeded. Please try again later.");
  }
}

function isGitHubBranch(value: unknown): value is GitHubBranch {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "commit" in value &&
    typeof value.name === "string" &&
    typeof value.commit === "object" &&
    value.commit !== null &&
    "sha" in value.commit &&
    "url" in value.commit &&
    typeof value.commit.sha === "string" &&
    typeof value.commit.url === "string"
  );
}

async function getLinkedIntegration(orgId: string, projectId: string) {
  const integration = await prisma.integration.findUnique({
    where: { orgId_provider: { orgId, provider: "GITHUB" } },
    select: { accessToken: true, metadata: true },
  });

  const metadata = integration?.metadata;
  if (
    !integration?.accessToken ||
    metadataString(metadata, "projectId") !== projectId
  ) {
    throw new NotFoundError("Linked GitHub repository");
  }

  const repoFullName = metadataString(metadata, "repo_full_name");
  if (!repoFullName) {
    throw new NotFoundError("Linked GitHub repository");
  }

  return {
    token: decryptToken(integration.accessToken),
    linkedRepo: parseLinkedRepo(repoFullName),
  };
}

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get("projectId");
    const orgId = req.nextUrl.searchParams.get("orgId");

    if (!projectId || !orgId) {
      throw new ValidationError("projectId and orgId are required");
    }

    const auth = await requireOrgMember(orgId);
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId: auth.orgId, status: { not: "DELETED" } },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundError("Project");
    }

    const { token, linkedRepo } = await getLinkedIntegration(auth.orgId, projectId);
    const response = await fetch(
      `https://api.github.com/repos/${linkedRepo.owner}/${linkedRepo.repo}/branches`,
      { headers: githubHeaders(token) }
    );

    assertNotRateLimited(response);
    if (!response.ok) {
      throw new Error("Failed to fetch GitHub branches");
    }

    const payload: unknown = await response.json();
    const branches = Array.isArray(payload)
      ? payload.filter(isGitHubBranch).map((branch) => ({
          name: branch.name,
          last_commit: {
            sha: branch.commit.sha,
            url: branch.commit.url,
          },
        }))
      : [];

    logger.info("github.branches.completed", {
      orgId: auth.orgId,
      userId: auth.userId,
      projectId,
      repo: linkedRepo.fullName,
      branches: branches.length,
    });

    return ok({ branches });
  } catch (error) {
    logger.error("github.branches.failed", { error });
    return errorResponse(error);
  }
}

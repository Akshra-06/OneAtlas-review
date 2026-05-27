// =============================================================================
// apps/api/src/app/api/v1/integrations/github/push/route.ts
// POST /api/v1/integrations/github/push - push project files to GitHub
// =============================================================================

export const runtime = "nodejs";

import { createDecipheriv, createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { prisma } from "@oneatlas/db";
import { NotFoundError, RateLimitError, ValidationError } from "@oneatlas/shared";
import { z } from "zod";
import { requireOrgMember } from "../../../../../../lib/auth";
import { ok, errorResponse } from "../../../../../../lib/response";
import { logger } from "../../../../../../lib/logger";

interface LinkedRepo {
  owner: string;
  repo: string;
  fullName: string;
}

interface GitHubContentResponse {
  sha: string;
  type: string;
}

interface FailedFile {
  path: string;
  error: string;
}

const pushSchema = z.object({
  projectId: z.string().min(1),
  orgId: z.string().min(1),
  branch: z.string().min(1),
  commitMessage: z.string().min(1),
  files: z.array(
    z.object({
      path: z.string().min(1),
      content: z.string(),
    })
  ),
});

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
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function encodePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

function assertNotRateLimited(response: Response): void {
  if (response.status === 429 || response.status === 403) {
    throw new RateLimitError("GitHub API rate limit exceeded. Please try again later.");
  }
}

function isGitHubContentResponse(value: unknown): value is GitHubContentResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "sha" in value &&
    "type" in value &&
    typeof value.sha === "string" &&
    typeof value.type === "string"
  );
}

async function getGitHubFileSha(
  token: string,
  linkedRepo: LinkedRepo,
  path: string,
  branch: string
): Promise<string | null> {
  const url = new URL(
    `https://api.github.com/repos/${linkedRepo.owner}/${linkedRepo.repo}/contents/${encodePath(path)}`
  );
  url.searchParams.set("ref", branch);

  const response = await fetch(url, { headers: githubHeaders(token) });
  if (response.status === 404) return null;
  assertNotRateLimited(response);

  if (!response.ok) {
    throw new Error(`Failed to read ${path} from GitHub`);
  }

  const payload: unknown = await response.json();
  return isGitHubContentResponse(payload) && payload.type === "file"
    ? payload.sha
    : null;
}

async function putGitHubFile(params: {
  token: string;
  linkedRepo: LinkedRepo;
  path: string;
  branch: string;
  commitMessage: string;
  content: string;
  sha: string | null;
}): Promise<void> {
  const response = await fetch(
    `https://api.github.com/repos/${params.linkedRepo.owner}/${params.linkedRepo.repo}/contents/${encodePath(params.path)}`,
    {
      method: "PUT",
      headers: githubHeaders(params.token),
      body: JSON.stringify({
        message: params.commitMessage,
        content: Buffer.from(params.content, "utf8").toString("base64"),
        branch: params.branch,
        ...(params.sha ? { sha: params.sha } : {}),
      }),
    }
  );

  assertNotRateLimited(response);

  if (!response.ok) {
    throw new Error(`Failed to write ${params.path} to GitHub`);
  }
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

export async function POST(req: NextRequest) {
  try {
    const body = pushSchema.parse(await req.json());
    const auth = await requireOrgMember(body.orgId, "MEMBER");

    const project = await prisma.project.findFirst({
      where: { id: body.projectId, orgId: auth.orgId, status: { not: "DELETED" } },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundError("Project");
    }

    const { token, linkedRepo } = await getLinkedIntegration(auth.orgId, body.projectId);
    const failedFiles: FailedFile[] = [];
    let committedFiles = 0;

    for (const file of body.files) {
      try {
        const sha = await getGitHubFileSha(token, linkedRepo, file.path, body.branch);
        await putGitHubFile({
          token,
          linkedRepo,
          path: file.path,
          branch: body.branch,
          commitMessage: body.commitMessage,
          content: file.content,
          sha,
        });
        committedFiles += 1;
      } catch (error) {
        if (error instanceof RateLimitError) throw error;

        const message = error instanceof Error ? error.message : "Unknown GitHub error";
        failedFiles.push({ path: file.path, error: message });
        logger.warn("github.push.file_failed", {
          orgId: auth.orgId,
          userId: auth.userId,
          projectId: body.projectId,
          repo: linkedRepo.fullName,
          path: file.path,
          error: message,
        });
      }
    }

    logger.info("github.push.completed", {
      orgId: auth.orgId,
      userId: auth.userId,
      projectId: body.projectId,
      repo: linkedRepo.fullName,
      committedFiles,
      failedFiles: failedFiles.length,
      branch: body.branch,
    });

    return ok({
      success: failedFiles.length === 0,
      committed_files: committedFiles,
      branch: body.branch,
      failed_files: failedFiles,
    });
  } catch (error) {
    logger.error("github.push.failed", { error });
    return errorResponse(error);
  }
}

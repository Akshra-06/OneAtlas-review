// =============================================================================
// apps/api/src/app/api/v1/integrations/github/status/route.ts
// GET /api/v1/integrations/github/status - fetch latest GitHub Actions run
// =============================================================================

export const runtime = "nodejs";

import { createDecipheriv, createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { prisma } from "@oneatlas/db";
import { NotFoundError, ValidationError } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../lib/auth";
import { ok, errorResponse } from "../../../../../../lib/response";
import { logger } from "../../../../../../lib/logger";

type BuildStatus = "queued" | "in_progress" | "success" | "failure" | "none";

interface LinkedRepo {
  owner: string;
  repo: string;
  fullName: string;
  defaultBranch: string;
}

interface GitHubWorkflowRun {
  id: number;
  status: string | null;
  conclusion: string | null;
  head_branch: string | null;
  head_sha: string | null;
  created_at: string | null;
  run_started_at: string | null;
  updated_at: string | null;
  html_url: string | null;
}

interface GitHubWorkflowRunsResponse {
  workflow_runs: GitHubWorkflowRun[];
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

function parseLinkedRepo(repoFullName: string, defaultBranch: string | null): LinkedRepo {
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) {
    throw new ValidationError("Linked GitHub repository is invalid");
  }

  return {
    owner,
    repo,
    fullName: repoFullName,
    defaultBranch: defaultBranch ?? "main",
  };
}

function githubHeaders(token: string): HeadersInit {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGitHubWorkflowRun(value: unknown): value is GitHubWorkflowRun {
  return (
    isObject(value) &&
    typeof value.id === "number" &&
    (typeof value.status === "string" || value.status === null) &&
    (typeof value.conclusion === "string" || value.conclusion === null) &&
    (typeof value.head_branch === "string" || value.head_branch === null) &&
    (typeof value.head_sha === "string" || value.head_sha === null) &&
    (typeof value.created_at === "string" || value.created_at === null) &&
    (typeof value.run_started_at === "string" || value.run_started_at === null) &&
    (typeof value.updated_at === "string" || value.updated_at === null) &&
    (typeof value.html_url === "string" || value.html_url === null)
  );
}

function isGitHubWorkflowRunsResponse(value: unknown): value is GitHubWorkflowRunsResponse {
  return (
    isObject(value) &&
    Array.isArray(value.workflow_runs) &&
    value.workflow_runs.every(isGitHubWorkflowRun)
  );
}

function mapRunStatus(run: GitHubWorkflowRun): BuildStatus {
  if (run.status === "queued") return "queued";
  if (run.status === "in_progress" || run.status === "waiting" || run.status === "requested") {
    return "in_progress";
  }

  if (run.status === "completed") {
    return run.conclusion === "success" ? "success" : "failure";
  }

  return "in_progress";
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
    linkedRepo: parseLinkedRepo(repoFullName, metadataString(metadata, "default_branch")),
  };
}

export async function GET(req: NextRequest) {
  try {
    const projectId = req.nextUrl.searchParams.get("projectId");
    const orgId = req.nextUrl.searchParams.get("orgId");
    const requestedBranch = req.nextUrl.searchParams.get("branch");

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
    const branch = requestedBranch ?? linkedRepo.defaultBranch;
    const runsUrl = new URL(
      `https://api.github.com/repos/${linkedRepo.owner}/${linkedRepo.repo}/actions/runs`
    );
    runsUrl.searchParams.set("per_page", "1");
    if (requestedBranch) {
      runsUrl.searchParams.set("branch", requestedBranch);
    }

    const response = await fetch(runsUrl, { headers: githubHeaders(token) });
    if (!response.ok) {
      throw new Error("Failed to fetch GitHub Actions status");
    }

    const payload: unknown = await response.json();
    if (!isGitHubWorkflowRunsResponse(payload)) {
      throw new Error("Invalid GitHub Actions response");
    }

    const latestRun = payload.workflow_runs[0] ?? null;

    logger.info("github.status.checked", {
      orgId: auth.orgId,
      userId: auth.userId,
      projectId,
      repo: linkedRepo.fullName,
      branch,
      runId: latestRun?.id?.toString(),
    });

    if (!latestRun) {
      return ok({
        status: "none" satisfies BuildStatus,
        run_id: null,
        branch,
        commit_sha: null,
        started_at: null,
        completed_at: null,
        url: null,
      });
    }

    return ok({
      status: mapRunStatus(latestRun),
      run_id: latestRun.id,
      branch: latestRun.head_branch ?? branch,
      commit_sha: latestRun.head_sha,
      started_at: latestRun.run_started_at ?? latestRun.created_at,
      completed_at: latestRun.status === "completed" ? latestRun.updated_at : null,
      url: latestRun.html_url,
    });
  } catch (error) {
    logger.error("github.status.failed", { error });
    return errorResponse(error);
  }
}

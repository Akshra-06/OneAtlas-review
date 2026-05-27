// =============================================================================
// apps/api/src/app/api/v1/integrations/github/diff/route.ts
// GET /api/v1/integrations/github/diff - diff project files against GitHub
// =============================================================================

export const runtime = "nodejs";

import { createDecipheriv, createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { prisma } from "@oneatlas/db";
import { NotFoundError, RateLimitError, ValidationError } from "@oneatlas/shared";
import { requireOrgMember } from "../../../../../../lib/auth";
import { ok, errorResponse } from "../../../../../../lib/response";
import { logger } from "../../../../../../lib/logger";

interface ProjectFile {
  path: string;
  content: string;
}

interface ProjectFileCandidate {
  path?: unknown;
  filePath?: unknown;
  content?: unknown;
}

interface LinkedRepo {
  owner: string;
  repo: string;
  fullName: string;
  branch: string;
}

interface GitHubBranchResponse {
  commit: {
    commit: {
      tree: {
        sha: string;
      };
    };
  };
}

interface GitHubTreeItem {
  path: string;
  type: string;
  sha: string;
}

interface GitHubTreeResponse {
  tree: GitHubTreeItem[];
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

function parseLinkedRepo(repoFullName: string, branch: string | null): LinkedRepo {
  const [owner, repo] = repoFullName.split("/");
  if (!owner || !repo) {
    throw new ValidationError("Linked GitHub repository is invalid");
  }

  return { owner, repo, fullName: repoFullName, branch: branch ?? "main" };
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

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isProjectFileCandidate(value: unknown): value is ProjectFileCandidate {
  if (!isObject(value)) return false;

  const pathValue = typeof value.path === "string" ? value.path : value.filePath;
  return typeof pathValue === "string" && typeof value.content === "string";
}

function normalizeProjectFile(value: unknown): ProjectFile | null {
  if (!isProjectFileCandidate(value)) return null;

  const pathValue = typeof value.path === "string" ? value.path : value.filePath;
  const contentValue = value.content;
  return typeof pathValue === "string" && typeof contentValue === "string"
    ? { path: pathValue, content: contentValue }
    : null;
}

function extractProjectFiles(generatedCode: unknown): ProjectFile[] {
  if (!isObject(generatedCode) || !Array.isArray(generatedCode.files)) {
    return [];
  }

  return generatedCode.files
    .map(normalizeProjectFile)
    .filter((file): file is ProjectFile => file !== null);
}

function isGitHubBranchResponse(value: unknown): value is GitHubBranchResponse {
  return (
    isObject(value) &&
    isObject(value.commit) &&
    isObject(value.commit.commit) &&
    isObject(value.commit.commit.tree) &&
    typeof value.commit.commit.tree.sha === "string"
  );
}

function isGitHubTreeResponse(value: unknown): value is GitHubTreeResponse {
  return (
    isObject(value) &&
    Array.isArray(value.tree) &&
    value.tree.every(
      (item) =>
        isObject(item) &&
        typeof item.path === "string" &&
        typeof item.type === "string" &&
        typeof item.sha === "string"
    )
  );
}

function gitBlobSha(content: string): string {
  const contentBuffer = Buffer.from(content, "utf8");
  return createHash("sha1")
    .update(Buffer.concat([Buffer.from(`blob ${contentBuffer.length}\0`), contentBuffer]))
    .digest("hex");
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

async function fetchGitHubTree(token: string, linkedRepo: LinkedRepo): Promise<Map<string, string>> {
  const branchResponse = await fetch(
    `https://api.github.com/repos/${linkedRepo.owner}/${linkedRepo.repo}/branches/${encodeURIComponent(linkedRepo.branch)}`,
    { headers: githubHeaders(token) }
  );

  assertNotRateLimited(branchResponse);
  if (!branchResponse.ok) {
    throw new Error("Failed to fetch GitHub branch");
  }

  const branchPayload: unknown = await branchResponse.json();
  if (!isGitHubBranchResponse(branchPayload)) {
    throw new Error("Invalid GitHub branch response");
  }

  const treeResponse = await fetch(
    `https://api.github.com/repos/${linkedRepo.owner}/${linkedRepo.repo}/git/trees/${branchPayload.commit.commit.tree.sha}?recursive=1`,
    { headers: githubHeaders(token) }
  );

  assertNotRateLimited(treeResponse);
  if (!treeResponse.ok) {
    throw new Error("Failed to fetch GitHub tree");
  }

  const treePayload: unknown = await treeResponse.json();
  if (!isGitHubTreeResponse(treePayload)) {
    throw new Error("Invalid GitHub tree response");
  }

  return new Map(
    treePayload.tree
      .filter((item) => item.type === "blob")
      .map((item) => [item.path, item.sha])
  );
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
      select: { generatedCode: true },
    });

    if (!project) {
      throw new NotFoundError("Project");
    }

    const { token, linkedRepo } = await getLinkedIntegration(auth.orgId, projectId);
    const currentFiles = extractProjectFiles(project.generatedCode);
    const githubFiles = await fetchGitHubTree(token, linkedRepo);
    const currentFileMap = new Map(currentFiles.map((file) => [file.path, file.content]));

    const added = currentFiles
      .filter((file) => !githubFiles.has(file.path))
      .map((file) => file.path);
    const changed = currentFiles
      .filter((file) => githubFiles.get(file.path) !== undefined)
      .filter((file) => githubFiles.get(file.path) !== gitBlobSha(file.content))
      .map((file) => file.path);
    const deleted = Array.from(githubFiles.keys()).filter((path) => !currentFileMap.has(path));

    logger.info("github.diff.completed", {
      orgId: auth.orgId,
      userId: auth.userId,
      projectId,
      repo: linkedRepo.fullName,
      added: added.length,
      changed: changed.length,
      deleted: deleted.length,
    });

    return ok({
      changed,
      added,
      deleted,
      total_changes: changed.length + added.length + deleted.length,
    });
  } catch (error) {
    logger.error("github.diff.failed", { error });
    return errorResponse(error);
  }
}

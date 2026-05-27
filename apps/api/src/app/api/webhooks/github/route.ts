// =============================================================================
// apps/api/src/app/api/webhooks/github/route.ts
// POST /api/webhooks/github - receive GitHub webhook events
// =============================================================================

export const runtime = "nodejs";

import { createHmac, timingSafeEqual } from "node:crypto";
import { EventEmitter } from "node:events";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@oneatlas/db";
import { logger } from "../../../../lib/logger";
import { appEvents as emitter } from "../../../../events/emitter";

interface GitHubRepository {
  name: string;
  full_name: string;
}

interface GitHubCommit {
  id: string;
  message: string;
  timestamp: string;
  url: string;
  author?: {
    name?: string;
    email?: string;
    username?: string;
  };
}

interface GitHubPushPayload {
  ref: string;
  repository: GitHubRepository;
  commits: GitHubCommit[];
}

interface GitHubDeploymentPayload {
  repository?: GitHubRepository;
  deployment?: {
    id?: number;
    ref?: string;
    sha?: string;
    environment?: string;
  };
}

interface GitHubReleasePayload {
  action?: string;
  repository?: GitHubRepository;
  release?: {
    id?: number;
    tag_name?: string;
    name?: string | null;
    html_url?: string;
  };
}

interface GitHubPushEventPayload {
  repo: string;
  branch: string;
  commits: GitHubCommit[];
  orgId: string | null;
}

function jsonOk(data: { ok: true }) {
  return NextResponse.json(data, { status: 200 });
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !signature?.startsWith("sha256=")) {
    return false;
  }

  const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
  const expectedBuffer = Buffer.from(expected, "utf8");
  const signatureBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, signatureBuffer);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isGitHubRepository(value: unknown): value is GitHubRepository {
  return (
    isObject(value) &&
    typeof value.name === "string" &&
    typeof value.full_name === "string"
  );
}

function isGitHubCommit(value: unknown): value is GitHubCommit {
  if (!isObject(value)) return false;

  const author = value.author;
  const hasValidAuthor =
    author === undefined ||
    (isObject(author) &&
      (author.name === undefined || typeof author.name === "string") &&
      (author.email === undefined || typeof author.email === "string") &&
      (author.username === undefined || typeof author.username === "string"));

  return (
    typeof value.id === "string" &&
    typeof value.message === "string" &&
    typeof value.timestamp === "string" &&
    typeof value.url === "string" &&
    hasValidAuthor
  );
}

function isGitHubPushPayload(value: unknown): value is GitHubPushPayload {
  return (
    isObject(value) &&
    typeof value.ref === "string" &&
    isGitHubRepository(value.repository) &&
    Array.isArray(value.commits) &&
    value.commits.every(isGitHubCommit)
  );
}

function branchFromRef(ref: string): string {
  return ref.startsWith("refs/heads/") ? ref.slice("refs/heads/".length) : ref;
}

async function findOrgIdForRepo(repoFullName: string): Promise<string | null> {
  const integration = await prisma.integration.findFirst({
    where: {
      provider: "GITHUB",
      metadata: {
        path: ["repo_full_name"],
        equals: repoFullName,
      },
    },
    select: { orgId: true },
  });

  return integration?.orgId ?? null;
}

async function handlePush(payload: unknown): Promise<void> {
  if (!isGitHubPushPayload(payload)) {
    logger.warn("github.webhook.push.invalid_payload");
    return;
  }

  const repo = payload.repository.full_name;
  const branch = branchFromRef(payload.ref);
  const orgId = await findOrgIdForRepo(repo);

  logger.info("github.webhook.push", {
    orgId: orgId ?? undefined,
    repo,
    branch,
    commitCount: payload.commits.length,
  });

  const githubEmitter: EventEmitter = emitter;
  githubEmitter.emit("github.push", {
    repo,
    branch,
    commits: payload.commits,
    orgId,
  } satisfies GitHubPushEventPayload);
}

function handleDeployment(payload: unknown): void {
  const deploymentPayload = payload as GitHubDeploymentPayload;
  logger.info("github.webhook.deployment", {
    repo: deploymentPayload.repository?.full_name,
    deploymentId: deploymentPayload.deployment?.id?.toString(),
    ref: deploymentPayload.deployment?.ref,
    sha: deploymentPayload.deployment?.sha,
    environment: deploymentPayload.deployment?.environment,
  });
}

function handleRelease(payload: unknown): void {
  const releasePayload = payload as GitHubReleasePayload;
  logger.info("github.webhook.release", {
    action: releasePayload.action,
    repo: releasePayload.repository?.full_name,
    releaseId: releasePayload.release?.id,
    tag: releasePayload.release?.tag_name,
    name: releasePayload.release?.name,
    url: releasePayload.release?.html_url,
  });
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const eventType = req.headers.get("x-github-event") ?? "unknown";
  logger.info("github.webhook.received", { eventType });

  if (eventType === "ping") {
    return jsonOk({ ok: true });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody) as unknown;
  } catch (error) {
    logger.warn("github.webhook.invalid_json", { eventType, error });
    return jsonOk({ ok: true });
  }

  if (eventType === "push") {
    await handlePush(payload);
  } else if (eventType === "deployment") {
    handleDeployment(payload);
  } else if (eventType === "release") {
    handleRelease(payload);
  }

  return jsonOk({ ok: true });
}

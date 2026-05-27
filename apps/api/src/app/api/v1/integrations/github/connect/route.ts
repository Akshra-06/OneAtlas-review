// =============================================================================
// apps/api/src/app/api/v1/integrations/github/connect/route.ts
// POST /api/v1/integrations/github/connect - connect repository to project
// =============================================================================

export const runtime = "nodejs";

import { createDecipheriv, createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { prisma } from "@oneatlas/db";
import { NotFoundError } from "@oneatlas/shared";
import { z } from "zod";
import { requireOrgMember } from "../../../../../../lib/auth";
import { ok, errorResponse } from "../../../../../../lib/response";
import { logger } from "../../../../../../lib/logger";

interface GitHubHookResponse {
  id: number;
}

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
interface JsonObject {
  [key: string]: JsonValue;
}

const connectSchema = z.object({
  projectId: z.string().min(1),
  orgId: z.string().min(1),
  repo_full_name: z.string().min(1),
  default_branch: z.string().min(1),
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

function getWebhookUrl(req: NextRequest): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  return new URL("/api/webhooks/github", baseUrl).toString();
}

function metadataToJsonObject(metadata: unknown): JsonObject {
  if (typeof metadata === "object" && metadata !== null && !Array.isArray(metadata)) {
    return metadata as JsonObject;
  }

  return {};
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

function isGitHubHookResponse(value: unknown): value is GitHubHookResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "number"
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = connectSchema.parse(await req.json());
    const auth = await requireOrgMember(body.orgId, "MEMBER");

    const project = await prisma.project.findFirst({
      where: { id: body.projectId, orgId: auth.orgId, status: { not: "DELETED" } },
      select: { id: true },
    });

    if (!project) {
      throw new NotFoundError("Project");
    }

    const integration = await prisma.integration.findUnique({
      where: { orgId_provider: { orgId: auth.orgId, provider: "GITHUB" } },
      select: { id: true, accessToken: true, metadata: true },
    });

    if (
      !integration?.accessToken ||
      getMetadataUserId(integration.metadata) !== auth.userId
    ) {
      throw new NotFoundError("GitHub integration");
    }

    const token = decryptToken(integration.accessToken);
    const webhookUrl = getWebhookUrl(req);
    const githubResponse = await fetch(
      `https://api.github.com/repos/${body.repo_full_name}/hooks`,
      {
        method: "POST",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          name: "web",
          active: true,
          events: ["push", "pull_request"],
          config: {
            url: webhookUrl,
            content_type: "json",
            insecure_ssl: "0",
          },
        }),
      }
    );

    const hookPayload: unknown = await githubResponse.json();
    if (!githubResponse.ok || !isGitHubHookResponse(hookPayload)) {
      logger.warn("github.webhook.create_failed", {
        orgId: auth.orgId,
        userId: auth.userId,
        projectId: body.projectId,
        repo: body.repo_full_name,
        status: githubResponse.status,
      });
      throw new Error("Failed to create GitHub webhook");
    }

    const hookId = hookPayload.id;
    const metadata = metadataToJsonObject(integration.metadata);
    const repoMetadata: JsonObject = {
      projectId: body.projectId,
      repo_full_name: body.repo_full_name,
      default_branch: body.default_branch,
      hook_id: hookId,
      status: "connected",
      webhookUrl,
      connectedBy: auth.userId,
      connectedAt: new Date().toISOString(),
    };

    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        metadata: {
          ...metadata,
          ...repoMetadata,
        },
        isActive: true,
      },
    });

    logger.info("github.repo.connected", {
      orgId: auth.orgId,
      userId: auth.userId,
      projectId: body.projectId,
      repo: body.repo_full_name,
      hookId,
    });

    return ok({
      success: true,
      repo: body.repo_full_name,
      hook_id: hookId,
    });
  } catch (error) {
    logger.error("github.connect.failed", { error });
    return errorResponse(error);
  }
}

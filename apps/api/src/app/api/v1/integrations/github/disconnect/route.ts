// =============================================================================
// apps/api/src/app/api/v1/integrations/github/disconnect/route.ts
// DELETE /api/v1/integrations/github/disconnect - disconnect GitHub
// =============================================================================

export const runtime = "nodejs";

import { createDecipheriv, createHash } from "node:crypto";
import { NextRequest } from "next/server";
import { prisma } from "@oneatlas/db";
import { NotFoundError, ValidationError } from "@oneatlas/shared";
import { z } from "zod";
import { requireOrgMember } from "../../../../../../lib/auth";
import { ok, errorResponse } from "../../../../../../lib/response";
import { logger } from "../../../../../../lib/logger";

interface LinkedRepo {
  owner: string;
  repo: string;
  fullName: string;
}

const disconnectSchema = z.object({
  projectId: z.string().min(1),
  orgId: z.string().min(1),
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

function metadataNumber(metadata: unknown, key: string): number | null {
  if (
    typeof metadata === "object" &&
    metadata !== null &&
    key in metadata &&
    typeof metadata[key as keyof typeof metadata] === "number"
  ) {
    return metadata[key as keyof typeof metadata] as number;
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

async function deleteGitHubWebhook(params: {
  token: string;
  linkedRepo: LinkedRepo;
  hookId: number;
}): Promise<boolean> {
  const response = await fetch(
    `https://api.github.com/repos/${params.linkedRepo.owner}/${params.linkedRepo.repo}/hooks/${params.hookId}`,
    {
      method: "DELETE",
      headers: githubHeaders(params.token),
    }
  );

  return response.ok || response.status === 404;
}

export async function DELETE(req: NextRequest) {
  try {
    const body = disconnectSchema.parse(await req.json());
    const auth = await requireOrgMember(body.orgId, "ADMIN");

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

    const metadata = integration?.metadata;
    const repoFullName = metadataString(metadata, "repo_full_name");
    const hookId = metadataNumber(metadata, "hook_id");

    if (
      !integration ||
      metadataString(metadata, "projectId") !== body.projectId ||
      !repoFullName
    ) {
      throw new NotFoundError("GitHub integration");
    }

    const linkedRepo = parseLinkedRepo(repoFullName);

    logger.info("github.disconnect.started", {
      orgId: auth.orgId,
      userId: auth.userId,
      projectId: body.projectId,
      repo: linkedRepo.fullName,
      hookId,
    });

    if (integration.accessToken && hookId !== null) {
      try {
        const webhookDeleted = await deleteGitHubWebhook({
          token: decryptToken(integration.accessToken),
          linkedRepo,
          hookId,
        });

        if (!webhookDeleted) {
          logger.warn("github.disconnect.webhook_delete_failed", {
            orgId: auth.orgId,
            userId: auth.userId,
            projectId: body.projectId,
            repo: linkedRepo.fullName,
            hookId,
          });
        }
      } catch (error) {
        logger.warn("github.disconnect.webhook_delete_error", {
          orgId: auth.orgId,
          userId: auth.userId,
          projectId: body.projectId,
          repo: linkedRepo.fullName,
          hookId,
          error,
        });
      }
    }

    await prisma.integration.delete({
      where: { id: integration.id },
    });

    logger.info("github.disconnect.completed", {
      orgId: auth.orgId,
      userId: auth.userId,
      projectId: body.projectId,
      repo: linkedRepo.fullName,
    });

    return ok({
      success: true,
      message: "GitHub disconnected",
    });
  } catch (error) {
    logger.error("github.disconnect.failed", { error });
    return errorResponse(error);
  }
}

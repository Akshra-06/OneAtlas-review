// =============================================================================
// apps/api/src/services/integration.service.ts
// Integration orchestration service.
// =============================================================================

import { prisma, type Integration, type IntegrationProvider } from "@oneatlas/db";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
interface JsonObject {
  [key: string]: JsonValue;
}

export interface CreateIntegrationInput {
  provider: IntegrationProvider;
  name: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiry?: Date | null;
  metadata?: JsonObject;
  isActive?: boolean;
}

export interface UpdateIntegrationInput {
  provider?: IntegrationProvider;
  name?: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiry?: Date | null;
  metadata?: JsonObject;
  isActive?: boolean;
}

export class IntegrationService {
  async listByOrg(orgId: string): Promise<Integration[]> {
    return prisma.integration.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(orgId: string, integrationId: string): Promise<Integration | null> {
    return prisma.integration.findFirst({
      where: { id: integrationId, orgId },
    });
  }

  async getByProvider(
    orgId: string,
    provider: IntegrationProvider
  ): Promise<Integration | null> {
    return prisma.integration.findFirst({
      where: { orgId, provider },
    });
  }

  async create(orgId: string, data: CreateIntegrationInput): Promise<Integration> {
    return prisma.integration.create({
      data: {
        orgId,
        provider: data.provider,
        name: data.name,
        accessToken: data.accessToken ?? null,
        refreshToken: data.refreshToken ?? null,
        tokenExpiry: data.tokenExpiry ?? null,
        metadata: data.metadata ?? {},
        isActive: data.isActive ?? true,
      },
    });
  }

  async update(
    orgId: string,
    integrationId: string,
    data: UpdateIntegrationInput
  ): Promise<Integration> {
    const integration = await prisma.integration.findFirst({
      where: { id: integrationId, orgId },
      select: { id: true },
    });

    if (!integration) {
      throw new Error(`Integration ${integrationId} not found in org ${orgId}`);
    }

    return prisma.integration.update({
      where: { id: integrationId },
      data,
    });
  }

  async delete(orgId: string, integrationId: string): Promise<Integration> {
    const integration = await prisma.integration.findFirst({
      where: { id: integrationId, orgId },
      select: { id: true },
    });

    if (!integration) {
      throw new Error(`Integration ${integrationId} not found in org ${orgId}`);
    }

    return prisma.integration.delete({
      where: { id: integrationId },
    });
  }

  async setActive(
    orgId: string,
    integrationId: string,
    isActive: boolean
  ): Promise<Integration> {
    return this.update(orgId, integrationId, { isActive });
  }
}

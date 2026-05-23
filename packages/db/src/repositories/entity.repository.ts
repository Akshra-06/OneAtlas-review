// =============================================================================
// packages/db/src/repositories/entity.repository.ts
// Data-access layer for Entity definitions within a Project.
//
// NOTE: There is no dedicated `Entity` table in the current schema.
// Entity definitions are stored inside `Project.metadata` (JSON) or
// `Project.generatedCode` (JSON). This repository encapsulates access to
// that data so consumers don't depend on the storage format.
// When a dedicated Entity model is added to the schema, swap the
// implementation here — callers won't need to change.
//
// All queries are scoped by orgId via the parent Project.
// =============================================================================

import { prisma } from "../client";
import type { Prisma } from "@prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Shape of a single entity definition stored in project metadata. */
export interface EntityDefinition {
  name: string;
  fields: EntityField[];
  displayName?: string;
  description?: string;
}

export interface EntityField {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  defaultValue?: string;
  relation?: {
    entity: string;
    field: string;
  };
}

/** The shape of `Project.metadata` that we expect. */
interface ProjectMetadata {
  entities?: EntityDefinition[];
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class EntityRepository {
  // -------------------------------------------------------------------------
  // Read
  // -------------------------------------------------------------------------

  /** List all entity definitions for a project. */
  async findByProjectId(
    projectId: string,
    orgId: string
  ): Promise<EntityDefinition[]> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
      select: { metadata: true },
    });
    if (!project) {
      throw new Error(`Project ${projectId} not found in org ${orgId}`);
    }

    const metadata = project.metadata as ProjectMetadata;
    return metadata?.entities ?? [];
  }

  /** Find a single entity definition by name. */
  async findByName(
    projectId: string,
    orgId: string,
    entityName: string
  ): Promise<EntityDefinition | null> {
    const entities = await this.findByProjectId(projectId, orgId);
    return entities.find((e) => e.name === entityName) ?? null;
  }

  // -------------------------------------------------------------------------
  // Write (JSON patch on Project.metadata)
  // -------------------------------------------------------------------------

  /** Add or replace an entity definition in the project metadata. */
  async upsert(
    projectId: string,
    orgId: string,
    entity: EntityDefinition
  ): Promise<EntityDefinition> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
      select: { id: true, metadata: true },
    });
    if (!project) {
      throw new Error(`Project ${projectId} not found in org ${orgId}`);
    }

    const metadata = (project.metadata as ProjectMetadata) ?? {};
    const entities = metadata.entities ?? [];
    const idx = entities.findIndex((e) => e.name === entity.name);

    if (idx >= 0) {
      entities[idx] = entity;
    } else {
      entities.push(entity);
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        metadata: { ...metadata, entities } as unknown as Prisma.InputJsonValue,
      },
    });

    return entity;
  }

  /** Remove an entity definition by name. */
  async deleteByName(
    projectId: string,
    orgId: string,
    entityName: string
  ): Promise<void> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
      select: { id: true, metadata: true },
    });
    if (!project) {
      throw new Error(`Project ${projectId} not found in org ${orgId}`);
    }

    const metadata = (project.metadata as ProjectMetadata) ?? {};
    const entities = metadata.entities ?? [];
    const filtered = entities.filter((e) => e.name !== entityName);

    await prisma.project.update({
      where: { id: projectId },
      data: {
        metadata: {
          ...metadata,
          entities: filtered,
        } as unknown as Prisma.InputJsonValue,
      },
    });
  }

  /** Replace all entity definitions for a project at once. */
  async replaceAll(
    projectId: string,
    orgId: string,
    entities: EntityDefinition[]
  ): Promise<EntityDefinition[]> {
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
      select: { id: true, metadata: true },
    });
    if (!project) {
      throw new Error(`Project ${projectId} not found in org ${orgId}`);
    }

    const metadata = (project.metadata as ProjectMetadata) ?? {};

    await prisma.project.update({
      where: { id: projectId },
      data: {
        metadata: { ...metadata, entities } as unknown as Prisma.InputJsonValue,
      },
    });

    return entities;
  }
}

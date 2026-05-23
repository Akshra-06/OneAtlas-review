// =============================================================================
// apps/api/src/services/entity.service.ts
// Entity orchestration service.
// =============================================================================

import { EntityRepository, type EntityDefinition } from "@oneatlas/db";

export class EntityService {
  constructor(private readonly entities = new EntityRepository()) {}

  async listByProject(
    orgId: string,
    projectId: string
  ): Promise<EntityDefinition[]> {
    return this.entities.findByProjectId(projectId, orgId);
  }

  async getByName(
    orgId: string,
    projectId: string,
    entityName: string
  ): Promise<EntityDefinition | null> {
    return this.entities.findByName(projectId, orgId, entityName);
  }

  async upsert(
    orgId: string,
    projectId: string,
    entity: EntityDefinition
  ): Promise<EntityDefinition> {
    return this.entities.upsert(projectId, orgId, entity);
  }

  async deleteByName(
    orgId: string,
    projectId: string,
    entityName: string
  ): Promise<void> {
    return this.entities.deleteByName(projectId, orgId, entityName);
  }

  async replaceAll(
    orgId: string,
    projectId: string,
    entities: EntityDefinition[]
  ): Promise<EntityDefinition[]> {
    return this.entities.replaceAll(projectId, orgId, entities);
  }
}

// =============================================================================
// apps/api/src/services/template.service.ts
// Template orchestration service.
// =============================================================================

import type { EntitySchema, GeneratedFile } from "@oneatlas/shared";

class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotImplementedError";
  }
}

export interface Template {
  id: string;
  name: string;
  description: string;
}

export interface TemplateMatch {
  template: Template;
  confidence: number;
  modifications: Record<string, string>;
}

export interface ModificationRequest {
  template: Template;
  entity: EntitySchema;
  userPrompt: string;
  domain?: string;
}

export interface ModificationResult {
  modifiedTemplate: string;
  modifications: Record<string, string>;
  confidence: number;
}

export class TemplateService {
  private fail(method: string): never {
    throw new NotImplementedError(
      `Template service method ${method} is not implemented yet. The template-engine package is not wired into the API package.`
    );
  }

  async getTemplate(templateId: string): Promise<Template | undefined> {
    return this.fail(`getTemplate(${templateId})`);
  }

  async getAllTemplates(): Promise<Template[]> {
    return this.fail("getAllTemplates");
  }

  async findMatchingTemplates(
    entity: EntitySchema,
    domain?: string
  ): Promise<TemplateMatch[]> {
    return this.fail(`findMatchingTemplates(${entity.name}${domain ? ", domain" : ""})`);
  }

  async modifyTemplate(
    request: ModificationRequest
  ): Promise<ModificationResult> {
    return this.fail(`modifyTemplate(${request.template.id})`);
  }

  async generateValidation(
    entity: EntitySchema,
    domain?: string
  ): Promise<GeneratedFile> {
    return this.fail(`generateValidation(${entity.name}${domain ? ", domain" : ""})`);
  }

  async generatePage(
    entity: EntitySchema,
    domain?: string
  ): Promise<GeneratedFile> {
    return this.fail(`generatePage(${entity.name}${domain ? ", domain" : ""})`);
  }

  async generateApi(
    entity: EntitySchema,
    domain?: string
  ): Promise<GeneratedFile> {
    return this.fail(`generateApi(${entity.name}${domain ? ", domain" : ""})`);
  }

  async canGenerate(entity: EntitySchema, domain?: string): Promise<boolean> {
    return this.fail(`canGenerate(${entity.name}${domain ? ", domain" : ""})`);
  }
}

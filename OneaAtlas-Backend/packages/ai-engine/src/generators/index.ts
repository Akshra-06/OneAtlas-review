import crypto from 'node:crypto';

import type { AppUnderstanding, GeneratedFile, GenerationResult } from '@oneatlas/shared';

import {
  generateFields,
} from './schema/field.generator';

import {
  generateRelationships,
} from './schema/relationship.generator';

import {
  generateEntitySchemas,
} from './schema/entity.generator';

import {
  prismaBuilder,
} from './schema/prisma.builder';

import {
  pageGenerator,
} from './code/page.generator';

import {
  crudGenerator,
} from './code/crud.generator';

import {
  componentGenerator,
} from './code/component.generator';

import {
  routeGenerator,
} from './code/route.generator';

import {
  layoutGenerator,
} from './code/layout.generator';

import {
  validationGenerator,
} from './code/validation.generator';

import {
  supportGenerator,
} from './code/support.generator';

import {
  workflowGenerator,
} from './code/workflow.generator';

import {
  intelligenceGenerationPipeline,
} from './intelligence/intelligence-generation-pipeline';

export class GenerationEngine {
  async generate(
    understanding: AppUnderstanding,
    useIntelligencePipeline: boolean = true,
  ): Promise<GenerationResult> {
    // Use intelligence-driven pipeline if enabled
    if (useIntelligencePipeline) {
      return intelligenceGenerationPipeline.generate(understanding);
    }

    // Fallback to legacy pipeline
    const entitySchemas =
      generateEntitySchemas(understanding);

    const prismaSchema =
      prismaBuilder.build(
        prismaBuilder.normalize(entitySchemas),
      );

    const routeConfig =
      routeGenerator.generate(
        entitySchemas,
        understanding.appName,
      );

    const files: GeneratedFile[] = [];

    for (const entity of entitySchemas) {
      files.push(
        ...pageGenerator.generate(entity),
      );

      files.push(
        ...crudGenerator.generate(entity),
      );

      files.push(
        componentGenerator.generate(entity),
      );

      files.push(
        await validationGenerator.generate(entity),
      );
    }

    files.push(
      ...supportGenerator.generate(),
    );

    files.push(
      ...workflowGenerator.generate(
        understanding,
        entitySchemas,
      ),
    );

    files.push(
      ...layoutGenerator.generate(
        routeConfig,
        understanding.appName,
      ),
    );

    files.push({
      filePath: 'prisma/schema.prisma',
      content: prismaSchema,
      fileType: 'prisma-schema',
    });

    const appId = crypto.randomUUID();
    const generatedAt = new Date().toISOString();
    
    // TODO: Integrate comprehensive validation pipeline
    // Currently ValidationOrchestrator is for AI request validation only
    // Comprehensive output validation will be added in next phase

    return {
      appId,
      appName: understanding.appName,
      prismaSchema,
      files,
      routeConfig,
      entitySchemas,
      generatedAt,
      validation: {
        valid: true,
        issues: [],
      },
    };
  }
}

export const generationEngine =
  new GenerationEngine();

export {
  generateFields,
} from './schema/field.generator';

export {
  generateRelationships,
} from './schema/relationship.generator';

export {
  generateEntitySchemas,
} from './schema/entity.generator';

export {
  prismaBuilder,
} from './schema/prisma.builder';

export {
  pageGenerator,
} from './code/page.generator';

export {
  crudGenerator,
} from './code/crud.generator';

export {
  componentGenerator,
} from './code/component.generator';

export {
  routeGenerator,
} from './code/route.generator';

export {
  layoutGenerator,
} from './code/layout.generator';

export {
  validationGenerator,
} from './code/validation.generator';

export {
  supportGenerator,
} from './code/support.generator';

export {
  workflowGenerator,
} from './code/workflow.generator';

export {
  intelligenceGenerationPipeline,
} from './intelligence/intelligence-generation-pipeline';

import crypto from 'node:crypto';

import type { AppUnderstanding } from '@oneatlas/shared';
import { logger } from '@oneatlas/ai-engine';

import type {
  AppRouteConfig,
  EntitySchema,
  GeneratedFile,
  GenerationResult,
} from '@oneatlas/shared';

import type {
  PipelineStage,
} from '../state/generation.state';

import {
  generateEntitySchemas,
  prismaBuilder,
  pageGenerator,
  crudGenerator,
  componentGenerator,
  routeGenerator,
  layoutGenerator,
  validationGenerator,
  supportGenerator,
  workflowGenerator,
} from '@oneatlas/ai-engine';
import { generatedOutputValidator } from '@oneatlas/validation-engine';
import { errorCorrector } from '@oneatlas/ai-engine';

export interface PipelineContext {
  runId: string;
  projectId: string;
  orgId: string;
  rawPrompt: string;
  understanding?: AppUnderstanding;
  entitySchemas?: EntitySchema[];
  prismaSchema?: string;
  generatedFiles?: GeneratedFile[];
  routeConfig?: AppRouteConfig;
  result?: GenerationResult;
}

export interface PipelineStep {
  stage: PipelineStage;
  name: string;
  run: (
    context: PipelineContext,
  ) => Promise<PipelineContext>;
  shouldSkip?: (
    context: PipelineContext,
  ) => boolean;
}

const generatePageFiles = (
  entities: EntitySchema[],
): GeneratedFile[] => {
  const files = entities.flatMap((entity) =>
    pageGenerator.generate(entity),
  );

  // Validate generated page files
  files.forEach(file => {
    const validation = generatedOutputValidator.validate(file.content, file.fileType);
    if (!validation.isValid) {
      logger.warn('pipeline', 'validation', `Validation failed for ${file.filePath}`, { errors: validation.errors });
      
      // Attempt automatic error correction
      const correction = errorCorrector.correct(file.content, validation.errors);
      if (correction.success) {
        file.content = correction.correctedCode;
        logger.info('pipeline', 'correction', `Auto-corrected ${file.filePath}`, { corrections: correction.corrections });
      }
    }
    if (validation.warnings.length > 0) {
      logger.warn('pipeline', 'validation', `Warnings for ${file.filePath}`, { warnings: validation.warnings });
    }
  });

  return files;
};

const generateApiFiles = (
  entities: EntitySchema[],
): GeneratedFile[] => {
  return entities.flatMap((entity) =>
    crudGenerator.generate(entity),
  );
};

const generateComponentFiles = (
  entities: EntitySchema[],
): GeneratedFile[] => {
  return entities.map((entity) =>
    componentGenerator.generate(entity),
  );
};

const generateValidationFiles = async (
  entities: EntitySchema[],
): Promise<GeneratedFile[]> => {
  const files = await Promise.all(
    entities.map((entity) => validationGenerator.generate(entity)),
  );
  return files;
};

const generateSupportFiles = (): GeneratedFile[] => {
  return supportGenerator.generate();
};

const buildShellConfigFile = (
  routeConfig: AppRouteConfig,
): GeneratedFile => {
  const sidebarNav = [
    { label: 'Dashboard', href: '/', icon: 'Layout' },
    { label: 'Workflows', href: '/workflows', icon: 'CheckSquare' },
    ...routeConfig.sidebarNav,
  ];

  return {
    filePath: 'lib/oneatlas/routes.ts',
    fileType: 'support',
    content: `export type ShellNavItem = { label: string; href: string; icon: string };

export function getShellConfig(): { appName: string; sidebarNav: ShellNavItem[] } {
  return {
    appName: ${JSON.stringify(routeConfig.appName)},
    sidebarNav: ${JSON.stringify(sidebarNav, null, 2)}
  };
}
`,
  };
};

const generateWorkflowFiles = (
  context: PipelineContext,
): GeneratedFile[] => {
  return workflowGenerator.generate(
    context.understanding!,
    context.entitySchemas!,
  );
};

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    stage: 'entity_schema_gen',
    name: 'Entity Schema Generation',
    run: async (context) => {
      const entitySchemas =
        generateEntitySchemas(
          context.understanding!,
        );

      return {
        ...context,
        entitySchemas,
      };
    },
  },
  {
    stage: 'prisma_schema_gen',
    name: 'Prisma Schema Generation',
    run: async (context) => {
      const prismaSchema =
        prismaBuilder.build(
          prismaBuilder.normalize(context.entitySchemas!),
        );

      return {
        ...context,
        prismaSchema,
      };
    },
  },
  {
    stage: 'page_generation',
    name: 'Page Generation',
    run: async (context) => {
      const files =
        generatePageFiles(
          context.entitySchemas!,
        );

      return {
        ...context,
        generatedFiles: [
          ...(context.generatedFiles ?? []),
          ...files,
        ],
      };
    },
  },
  {
    stage: 'api_generation',
    name: 'API Generation',
    run: async (context) => {
      const files =
        generateApiFiles(
          context.entitySchemas!,
        );

      return {
        ...context,
        generatedFiles: [
          ...(context.generatedFiles ?? []),
          ...files,
        ],
      };
    },
  },
  {
    stage: 'api_generation',
    name: 'Validation Module Generation',
    run: async (context) => {
      const files =
        await generateValidationFiles(
          context.entitySchemas!,
        );

      return {
        ...context,
        generatedFiles: [
          ...(context.generatedFiles ?? []),
          ...files,
        ],
      };
    },
  },
  {
    stage: 'support_generation',
    name: 'Runtime Support Generation',
    run: async (context) => {
      const files = generateSupportFiles();

      return {
        ...context,
        generatedFiles: [
          ...(context.generatedFiles ?? []),
          ...files,
        ],
      };
    },
  },
  {
    stage: 'workflow_generation',
    name: 'Business Workflow Generation',
    run: async (context) => {
      const files = generateWorkflowFiles(context);

      return {
        ...context,
        generatedFiles: [
          ...(context.generatedFiles ?? []),
          ...files,
        ],
      };
    },
  },
  {
    stage: 'component_generation',
    name: 'Component Generation',
    run: async (context) => {
      const files =
        generateComponentFiles(
          context.entitySchemas!,
        );

      return {
        ...context,
        generatedFiles: [
          ...(context.generatedFiles ?? []),
          ...files,
        ],
      };
    },
  },
  {
    stage: 'layout_generation',
    name: 'Layout Generation',
    run: async (context) => {
      const routeConfig =
        routeGenerator.generate(
          context.entitySchemas!,
          context.understanding!.appName,
        );

      const files: GeneratedFile[] = [
        buildShellConfigFile(routeConfig),
        ...layoutGenerator.generate(
          routeConfig,
          context.understanding!.appName,
        ),
      ];

      return {
        ...context,
        routeConfig,
        generatedFiles: [
          ...(context.generatedFiles ?? []),
          ...files,
        ],
      };
    },
  },
  {
    stage: 'packaging',
    name: 'Packaging',
    run: async (context) => {
      const result: GenerationResult = {
        appId: crypto.randomUUID(),
        appName:
          context.understanding!.appName,
        prismaSchema:
          context.prismaSchema!,
        files: [
          ...(context.generatedFiles ?? []),
          {
            filePath:
              'prisma/schema.prisma',
            content:
              context.prismaSchema!,
            fileType:
              'prisma-schema',
          },
        ],
        routeConfig:
          context.routeConfig!,
        entitySchemas:
          context.entitySchemas!,
        generatedAt:
          new Date().toISOString(),
      };

      return {
        ...context,
        result,
      };
    },
  },
  {
    stage: 'compile_validation',
    name: 'Compile Validation and Repair',
    run: async (context) => {
      const validation =
        generatedOutputValidator.validateAndRepair(context.result!);

      const result: GenerationResult = {
        ...context.result!,
        prismaSchema: validation.prismaSchema,
        files: validation.files,
        validation: {
          valid: validation.valid,
          issues: validation.issues,
        },
      };

      return {
        ...context,
        prismaSchema: validation.prismaSchema,
        generatedFiles: validation.files.filter(
          (file: GeneratedFile) => file.filePath !== 'prisma/schema.prisma',
        ),
        result,
      };
    },
  },
  {
    stage: 'deployment_handoff',
    name: 'Deployment Handoff',
    run: async (context) => {
      if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        logger.error('Pipeline', 'REDIS_UNCONFIGURED', 'Redis unconfigured. Cannot perform deployment handoff.');
        return context;
      }

      await fetch(
        `${
          process.env.UPSTASH_REDIS_REST_URL
        }/rpush/deploy:queue`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${
              process.env.UPSTASH_REDIS_REST_TOKEN
            }`,
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            value: JSON.stringify(
              context.result,
            ),
          }),
        },
      );

      return context;
    },
  },
];

// =============================================================================
// apps/api/src/validators/deployment.validator.ts
// Deployment request validators for route handlers.
// =============================================================================

import {
  createDeploymentSchema as sharedCreateDeploymentSchema,
} from "@oneatlas/shared";
import { z } from "zod";

export const deploymentStatusSchema = z.enum([
  "QUEUED",
  "BUILDING",
  "DEPLOYING",
  "LIVE",
  "FAILED",
  "ROLLED_BACK",
  "REPAIRING",
  "BUILD_RETRY",
  "PROCESS_CRASHED",
]);

export const deploymentEnvSchema = z.enum(["PREVIEW", "PRODUCTION"]);

export const createDeploymentSchema = sharedCreateDeploymentSchema;

export const updateDeploymentSchema = z.object({
  status: deploymentStatusSchema.optional(),
  env: deploymentEnvSchema.optional(),
  cfDeploymentId: z.string().min(1).max(255).nullable().optional(),
  cfWorkerName: z.string().min(1).max(255).nullable().optional(),
  deployedUrl: z.string().url().nullable().optional(),
  buildLog: z.string().max(100_000).nullable().optional(),
  buildDuration: z.number().int().nonnegative().nullable().optional(),
  errorMessage: z.string().max(100_000).nullable().optional(),
  codeSnapshot: z.unknown().nullable().optional(),
  triggeredBy: z.string().min(1).max(100).nullable().optional(),
  deployedAt: z.coerce.date().nullable().optional(),
});

export type CreateDeploymentInput = z.infer<typeof createDeploymentSchema>;
export type UpdateDeploymentInput = z.infer<typeof updateDeploymentSchema>;
export type DeploymentEnvInput = z.infer<typeof deploymentEnvSchema>;
export type DeploymentStatusInput = z.infer<typeof deploymentStatusSchema>;

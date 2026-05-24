// =============================================================================
// apps/api/src/validators/workflow.validator.ts
// Workflow request validators for route handlers.
// =============================================================================

import {
  createWorkflowSchema as sharedCreateWorkflowSchema,
  updateWorkflowSchema as sharedUpdateWorkflowSchema,
  workflowDefinitionSchema as sharedWorkflowDefinitionSchema,
  workflowEdgeSchema as sharedWorkflowEdgeSchema,
  workflowNodeSchema as sharedWorkflowNodeSchema,
} from "@oneatlas/shared";
import { z } from "zod";

export const workflowNodeSchema = sharedWorkflowNodeSchema;
export const workflowEdgeSchema = sharedWorkflowEdgeSchema;
export const workflowDefinitionSchema = sharedWorkflowDefinitionSchema;

export const createWorkflowSchema = sharedCreateWorkflowSchema;

export const updateWorkflowSchema = sharedUpdateWorkflowSchema.extend({
  timezone: z.string().min(1).max(64).optional(),
});

export type CreateWorkflowInput = z.infer<typeof createWorkflowSchema>;
export type UpdateWorkflowInput = z.infer<typeof updateWorkflowSchema>;

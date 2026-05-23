// =============================================================================
// apps/api/src/validators/project.validator.ts
// Project request validators for route handlers.
// =============================================================================

import {
  createProjectSchema as sharedCreateProjectSchema,
  updateProjectSchema as sharedUpdateProjectSchema,
} from "@oneatlas/shared";
import { z } from "zod";

export const createProjectSchema = sharedCreateProjectSchema;
export const updateProjectSchema = sharedUpdateProjectSchema;

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

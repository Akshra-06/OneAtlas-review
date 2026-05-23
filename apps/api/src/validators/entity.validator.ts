// =============================================================================
// apps/api/src/validators/entity.validator.ts
// Entity definition validators used by generation routes.
// =============================================================================

import { z } from "zod";

export const entityRelationSchema = z.object({
  entity: z.string().min(1).max(100),
  field: z.string().min(1).max(100),
});

export const entityFieldSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(100),
  required: z.boolean(),
  unique: z.boolean().optional(),
  defaultValue: z.string().max(500).optional(),
  relation: entityRelationSchema.optional(),
});

export const createEntitySchema = z.object({
  name: z.string().min(1).max(100),
  displayName: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  fields: z.array(entityFieldSchema).min(1),
});

export const updateEntitySchema = createEntitySchema.partial();

export type CreateEntityInput = z.infer<typeof createEntitySchema>;
export type UpdateEntityInput = z.infer<typeof updateEntitySchema>;

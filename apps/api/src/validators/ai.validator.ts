// =============================================================================
// apps/api/src/validators/ai.validator.ts
// AI generation request validators for route handlers.
// =============================================================================

import {
  generateAppSchema as sharedGenerateAppSchema,
  iterateAppSchema as sharedIterateAppSchema,
} from "@oneatlas/shared";
import { z } from "zod";

const aiModelSchema = z.enum(["FAST", "SMART"]);
const regeneratePartSchema = z.enum(["schema", "pages", "api", "workflows", "all"]);

export const createAiSchema = sharedGenerateAppSchema.extend({
  model: aiModelSchema.default("SMART"),
  regenerateParts: z.array(regeneratePartSchema).default(["all"]),
});

export const updateAiSchema = sharedIterateAppSchema.extend({
  model: aiModelSchema.optional(),
  regenerateParts: z.array(regeneratePartSchema).optional(),
});

export type CreateAiInput = z.infer<typeof createAiSchema>;
export type UpdateAiInput = z.infer<typeof updateAiSchema>;

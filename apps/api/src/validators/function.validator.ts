// =============================================================================
// apps/api/src/validators/function.validator.ts
// Function definition validators for generated code payloads.
// =============================================================================

import { z } from "zod";

export const functionParameterSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.string().min(1).max(100),
  required: z.boolean().default(true),
  description: z.string().max(200).optional(),
});

export const createFunctionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  language: z.enum(["typescript", "javascript"]).default("typescript"),
  parameters: z.array(functionParameterSchema).default([]),
  returnType: z.string().max(100).optional(),
  code: z.string().min(1).max(50_000),
});

export const updateFunctionSchema = createFunctionSchema.partial();

export type CreateFunctionInput = z.infer<typeof createFunctionSchema>;
export type UpdateFunctionInput = z.infer<typeof updateFunctionSchema>;

import { z } from 'zod';

/**
 * Validation schema for Interaction
 * Auto-generated with semantic intelligence
 */

export const InteractionCreateSchema = z.object({
  type: z.string().min(1, "Must be at least 1 characters"),
  dateTime: z.coerce.date(),
  notes: z.string().min(1, "Must be at least 1 characters").max(2000, "Must be no more than 2000 characters").optional(),
  outcome: z.string().min(1, "Must be at least 1 characters").optional(),
});

export const InteractionUpdateSchema = InteractionCreateSchema.partial();

export type InteractionCreateInput = z.infer<typeof InteractionCreateSchema>;
export type InteractionUpdateInput = z.infer<typeof InteractionUpdateSchema>;

/**
 * Helper to validate Interaction data
 */
export async function validateInteraction(data: unknown) {
  try {
    return await InteractionCreateSchema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }
    throw error;
  }
}

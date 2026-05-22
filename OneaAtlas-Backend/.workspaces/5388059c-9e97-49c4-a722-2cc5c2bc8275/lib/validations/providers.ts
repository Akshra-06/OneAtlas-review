import { z } from 'zod';

/**
 * Validation schema for Provider
 * Auto-generated with semantic intelligence
 */

export const ProviderCreateSchema = z.object({
  firstName: z.string().min(1, "Must be at least 1 characters"),
  lastName: z.string().min(1, "Must be at least 1 characters"),
  specialty: z.string().min(1, "Must be at least 1 characters"),
  email: z.string().email("Invalid email address").min(1, "Must be at least 1 characters").optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").min(1, "Must be at least 1 characters").optional(),
  isActive: z.coerce.boolean().optional(),
});

export const ProviderUpdateSchema = ProviderCreateSchema.partial();

export type ProviderCreateInput = z.infer<typeof ProviderCreateSchema>;
export type ProviderUpdateInput = z.infer<typeof ProviderUpdateSchema>;

/**
 * Helper to validate Provider data
 */
export async function validateProvider(data: unknown) {
  try {
    return await ProviderCreateSchema.parseAsync(data);
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

import { z } from 'zod';

/**
 * Validation schema for Organization
 * Auto-generated with semantic intelligence
 */

export const OrganizationCreateSchema = z.object({
  name: z.string().min(1, "Must be at least 1 characters"),
  address: z.string().min(1, "Must be at least 1 characters").optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").min(1, "Must be at least 1 characters").optional(),
  website: z.string().url("Invalid URL").min(1, "Must be at least 1 characters").optional(),
});

export const OrganizationUpdateSchema = OrganizationCreateSchema.partial();

export type OrganizationCreateInput = z.infer<typeof OrganizationCreateSchema>;
export type OrganizationUpdateInput = z.infer<typeof OrganizationUpdateSchema>;

/**
 * Helper to validate Organization data
 */
export async function validateOrganization(data: unknown) {
  try {
    return await OrganizationCreateSchema.parseAsync(data);
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

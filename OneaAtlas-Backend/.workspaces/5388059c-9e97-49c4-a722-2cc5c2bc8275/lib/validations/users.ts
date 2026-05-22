import { z } from 'zod';

/**
 * Validation schema for User
 * Auto-generated with semantic intelligence
 */

export const UserCreateSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Must be at least 1 characters"),
  fullName: z.string().min(1, "Must be at least 1 characters"),
  passwordHash: z.string().min(1, "Must be at least 1 characters"),
  role: z.string().min(1, "Must be at least 1 characters"),
  isActive: z.coerce.boolean().optional(),
});

export const UserUpdateSchema = UserCreateSchema.partial();

export type UserCreateInput = z.infer<typeof UserCreateSchema>;
export type UserUpdateInput = z.infer<typeof UserUpdateSchema>;

/**
 * Helper to validate User data
 */
export async function validateUser(data: unknown) {
  try {
    return await UserCreateSchema.parseAsync(data);
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

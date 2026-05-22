import { z } from 'zod';

/**
 * Validation schema for Patient
 * Auto-generated with semantic intelligence
 */

export const PatientCreateSchema = z.object({
  firstName: z.string().min(1, "Must be at least 1 characters"),
  lastName: z.string().min(1, "Must be at least 1 characters"),
  dateOfBirth: z.coerce.date(),
  gender: z.string().min(1, "Must be at least 1 characters").optional(),
  email: z.string().email("Invalid email address").min(1, "Must be at least 1 characters").optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").min(1, "Must be at least 1 characters").optional(),
  address: z.string().min(1, "Must be at least 1 characters").optional(),
  insuranceNumber: z.string().min(1, "Must be at least 1 characters").optional(),
  isActive: z.coerce.boolean().optional(),
});

export const PatientUpdateSchema = PatientCreateSchema.partial();

export type PatientCreateInput = z.infer<typeof PatientCreateSchema>;
export type PatientUpdateInput = z.infer<typeof PatientUpdateSchema>;

/**
 * Helper to validate Patient data
 */
export async function validatePatient(data: unknown) {
  try {
    return await PatientCreateSchema.parseAsync(data);
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

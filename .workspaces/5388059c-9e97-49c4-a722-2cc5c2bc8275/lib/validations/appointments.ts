import { z } from 'zod';

/**
 * Validation schema for Appointment
 * Auto-generated with semantic intelligence
 */

export const AppointmentCreateSchema = z.object({
  scheduledAt: z.coerce.date(),
  status: z.enum(['Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show', 'Rescheduled']).min(1, "Must be at least 1 characters"), // Current state of this record
  reason: z.string().min(1, "Must be at least 1 characters").optional(),
  notes: z.string().min(1, "Must be at least 1 characters").max(2000, "Must be no more than 2000 characters").optional(),
});

export const AppointmentUpdateSchema = AppointmentCreateSchema.partial();

export type AppointmentCreateInput = z.infer<typeof AppointmentCreateSchema>;
export type AppointmentUpdateInput = z.infer<typeof AppointmentUpdateSchema>;

/**
 * Helper to validate Appointment data
 */
export async function validateAppointment(data: unknown) {
  try {
    return await AppointmentCreateSchema.parseAsync(data);
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

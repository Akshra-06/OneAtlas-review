import { z } from 'zod';

/**
 * Validation schema for Task
 * Auto-generated with semantic intelligence
 */

export const TaskCreateSchema = z.object({
  title: z.string().min(1, "Must be at least 1 characters"),
  description: z.string().min(1, "Must be at least 1 characters").max(2000, "Must be no more than 2000 characters").optional(),
  dueDate: z.coerce.date().optional(),
  status: z.enum(['Todo', 'In Progress', 'In Review', 'Done', 'Blocked']).min(1, "Must be at least 1 characters"), // Current state of this record
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).min(1, "Must be at least 1 characters").optional(), // Relative importance or urgency
});

export const TaskUpdateSchema = TaskCreateSchema.partial();

export type TaskCreateInput = z.infer<typeof TaskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof TaskUpdateSchema>;

/**
 * Helper to validate Task data
 */
export async function validateTask(data: unknown) {
  try {
    return await TaskCreateSchema.parseAsync(data);
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

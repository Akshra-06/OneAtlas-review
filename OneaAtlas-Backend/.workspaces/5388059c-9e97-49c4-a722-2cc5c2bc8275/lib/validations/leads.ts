import { z } from 'zod';

/**
 * Validation schema for Lead
 * Auto-generated with semantic intelligence
 */

export const LeadCreateSchema = z.object({
  firstName: z.string().min(1, "Must be at least 1 characters"),
  lastName: z.string().min(1, "Must be at least 1 characters"),
  contactInfo: z.string().min(1, "Must be at least 1 characters"),
  source: z.string().min(1, "Must be at least 1 characters").optional(),
  status: z.enum(['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']).min(1, "Must be at least 1 characters"), // Current state of this record
  name: z.string().min(1, "Must be at least 1 characters"),
  email: z.string().email("Invalid email address").min(1, "Must be at least 1 characters"),
  company: z.string().min(1, "Must be at least 1 characters"),
  stage: z.enum(['Lead', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost']).min(1, "Must be at least 1 characters"),
  value: z.string().min(1, "Must be at least 1 characters"),
});

export const LeadUpdateSchema = LeadCreateSchema.partial();

export type LeadCreateInput = z.infer<typeof LeadCreateSchema>;
export type LeadUpdateInput = z.infer<typeof LeadUpdateSchema>;

/**
 * Helper to validate Lead data
 */
export async function validateLead(data: unknown) {
  try {
    return await LeadCreateSchema.parseAsync(data);
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

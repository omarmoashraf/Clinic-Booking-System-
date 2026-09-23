import { z } from "zod";

/**
 * Validation schema for PATCH /doctors/me
 * Per API_CONTRACT.md:
 * - bio: optional string
 * - specialtyId: optional UUID
 */
export const updateDoctorProfileSchema = z.object({
  specialtyId: z
    .string()
    .uuid({ message: "Invalid specialty ID" })
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(1000, { message: "Bio must not exceed 1000 characters" })
    .optional()
    .or(z.literal("")),
});

export type UpdateDoctorProfileFormValues = z.infer<
  typeof updateDoctorProfileSchema
>;


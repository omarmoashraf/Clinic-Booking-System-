import { z } from "zod";

/**
 * Validation schema for patient profile form.
 * Matches backend validation constraints from API_CONTRACT.md:
 * - fullName: optional string, trimmed, non-empty, max 150 chars
 * - phone: optional string, trimmed, max 30 chars
 * - dateOfBirth: optional date-only string, YYYY-MM-DD, valid date, not in future
 */
export const updatePatientProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "patients.validationFullNameRequired")
    .max(150, "patients.validationFullNameMax"),
  phone: z
    .string()
    .trim()
    .max(30, "patients.validationPhoneMax")
    .optional()
    .or(z.literal("")),
  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => {
      if (!val || val === "") return true;
      // Must match YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
      const date = new Date(val);
      if (Number.isNaN(date.getTime())) return false;
      // Prevent future birth dates
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      return date <= today;
    }, "patients.validationDateOfBirth"),
});

export type UpdatePatientProfileFormValues = z.infer<typeof updatePatientProfileSchema>;


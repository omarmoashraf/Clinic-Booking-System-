import { z } from "zod";

/**
 * Login Form Validation Schema
 * Conforms to API_CONTRACT.md Auth Module: POST /auth/login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "auth.emailRequired")
    .email("auth.emailInvalid"),
  password: z
    .string()
    .min(1, "auth.passwordRequired"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Register Form Validation Schema
 * Conforms to API_CONTRACT.md Auth Module: POST /auth/register
 */
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "auth.fullNameMinLength")
      .max(100, "auth.fullNameMaxLength"),
    email: z
      .string()
      .trim()
      .min(1, "auth.emailRequired")
      .email("auth.emailInvalid"),
    password: z
      .string()
      .min(8, "auth.passwordMinLength")
      .max(72, "auth.passwordMaxLength"),
    confirmPassword: z
      .string()
      .min(1, "auth.confirmPasswordRequired"),
    phone: z
      .string()
      .trim()
      .max(30, "auth.phoneMaxLength")
      .optional()
      .or(z.literal("")),
    role: z.enum(["PATIENT", "DOCTOR"]),
    specialtyId: z.string().optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "auth.passwordsDoNotMatch",
    path: ["confirmPassword"],
  })
  .refine(
    (data) =>
      data.role !== "DOCTOR" || (Boolean(data.specialtyId) && data.specialtyId !== ""),
    {
      message: "auth.specialtyRequired",
      path: ["specialtyId"],
    }
  );

export type RegisterFormValues = z.infer<typeof registerSchema>;


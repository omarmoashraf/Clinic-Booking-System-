import type { ApiResponse } from "@/types/api";
import type { UserProfile, PatientProfile, UserRole } from "@/types/auth";

export type { UserProfile, PatientProfile, UserRole };

/**
 * Payload for updating patient profile via PATCH /patients/me
 * Aligned strictly with API_CONTRACT.md Patients Module.
 */
export interface UpdatePatientProfilePayload {
  fullName?: string;
  phone?: string;
  dateOfBirth?: string; // YYYY-MM-DD
}

/**
 * Standard API response envelope for patient profile operations
 */
export type PatientProfileResponse = ApiResponse<UserProfile>;


import { apiClient } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { Doctor, UpdateDoctorProfilePayload } from "../types";

/**
 * Updates the authenticated doctor's profile via PATCH /doctors/me
 * Per API_CONTRACT.md:
 * - bio: optional string
 * - specialtyId: optional UUID
 * Returns the updated Doctor record.
 */
export async function updateDoctorProfile(
  payload: UpdateDoctorProfilePayload
): Promise<ApiResponse<Doctor>> {
  return apiClient.patch<ApiResponse<Doctor>>("/doctors/me", payload);
}


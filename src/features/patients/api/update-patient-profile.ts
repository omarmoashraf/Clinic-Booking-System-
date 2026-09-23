import { apiClient } from "../../../lib/api";
import type { ApiResponse } from "../../../types/api";
import type { UserProfile } from "../../../types/auth";
import type { UpdatePatientProfilePayload } from "../types";

/**
 * Update authenticated patient's profile.
 * Endpoint: PATCH /patients/me
 *
 * Backend validation rules (API_CONTRACT.md):
 * - fullName: optional string, trimmed, non-empty, max 150 chars
 * - phone: optional string, trimmed, max 30 chars
 * - dateOfBirth: optional date-only string, exactly YYYY-MM-DD
 *
 * Partial update: only supplied fields change; omitted fields keep current values.
 */
export async function updatePatientProfile(
  payload: UpdatePatientProfilePayload
): Promise<UserProfile> {
  const sanitizedPayload: UpdatePatientProfilePayload = {};

  if (payload.fullName !== undefined && payload.fullName.trim() !== "") {
    sanitizedPayload.fullName = payload.fullName.trim();
  }

  if (payload.phone !== undefined) {
    const trimmed = payload.phone.trim();
    if (trimmed !== "") {
      sanitizedPayload.phone = trimmed;
    }
  }

  if (payload.dateOfBirth !== undefined) {
    const trimmed = payload.dateOfBirth.trim();
    if (trimmed !== "") {
      sanitizedPayload.dateOfBirth = trimmed;
    }
  }

  const response = await apiClient.patch<ApiResponse<UserProfile>>(
    "/patients/me",
    sanitizedPayload
  );
  return response.data;
}


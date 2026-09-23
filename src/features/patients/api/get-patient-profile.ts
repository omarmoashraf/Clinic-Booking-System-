import { apiClient } from "../../../lib/api";
import type { ApiResponse } from "../../../types/api";
import type { UserProfile } from "../../../types/auth";

/**
 * Fetch authenticated user profile merged with patient role data.
 * Endpoint: GET /users/me
 */
export async function getPatientProfile(): Promise<UserProfile> {
  const response = await apiClient.get<ApiResponse<UserProfile>>("/users/me");
  return response.data;
}


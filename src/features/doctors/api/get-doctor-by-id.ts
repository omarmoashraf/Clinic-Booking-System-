import { apiClient } from "../../../lib/api";
import type { ApiResponse } from "../../../types/api";
import type { Doctor } from "../types";

/**
 * Fetch a single doctor by ID from GET /doctors/:id
 * Public endpoint.
 */
export async function getDoctorById(id: string): Promise<ApiResponse<Doctor>> {
  return apiClient.get<ApiResponse<Doctor>>(`/doctors/${encodeURIComponent(id)}`);
}


import { apiClient } from "../../../lib/api";
import type { ApiResponse } from "../../../types/api";
import type { Specialty } from "../types";

/**
 * Fetch a single specialty by ID from GET /specialties/:id
 * Public endpoint.
 */
export async function getSpecialtyById(id: string): Promise<ApiResponse<Specialty>> {
  return apiClient.get<ApiResponse<Specialty>>(`/specialties/${encodeURIComponent(id)}`);
}


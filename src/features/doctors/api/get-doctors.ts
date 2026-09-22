import { apiClient } from "../../../lib/api";
import type { PaginatedApiResponse } from "../../../types/api";
import type { Doctor, GetDoctorsParams } from "../types";

/**
 * Fetch paginated list of doctors from GET /doctors
 * Public endpoint.
 */
export async function getDoctors(
  params?: GetDoctorsParams
): Promise<PaginatedApiResponse<Doctor>> {
  return apiClient.get<PaginatedApiResponse<Doctor>>("/doctors", {
    params: {
      page: params?.page,
      limit: params?.limit,
      specialty: params?.specialty,
    },
  });
}


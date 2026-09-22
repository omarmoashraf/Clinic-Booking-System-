import { apiClient } from "../../../lib/api";
import type { PaginatedApiResponse } from "../../../types/api";
import type { GetSpecialtiesParams, Specialty } from "../types";

/**
 * Fetch paginated list of specialties from GET /specialties
 * Public endpoint.
 */
export async function getSpecialties(
  params?: GetSpecialtiesParams
): Promise<PaginatedApiResponse<Specialty>> {
  return apiClient.get<PaginatedApiResponse<Specialty>>("/specialties", {
    params: {
      page: params?.page,
      limit: params?.limit,
      search: params?.search,
    },
  });
}


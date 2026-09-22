import { apiClient } from "../../../lib/api";
import type { PaginatedApiResponse } from "../../../types/api";
import type { Appointment, GetAppointmentsParams } from "../types";

/**
 * Fetch authenticated user's own appointments from GET /appointments/me
 * Supports pagination (page, limit) and status filtering.
 */
export async function getMyAppointments(
  params?: GetAppointmentsParams
): Promise<PaginatedApiResponse<Appointment>> {
  return apiClient.get<PaginatedApiResponse<Appointment>>("/appointments/me", {
    params: {
      page: params?.page,
      limit: params?.limit,
      status: params?.status,
    },
  });
}

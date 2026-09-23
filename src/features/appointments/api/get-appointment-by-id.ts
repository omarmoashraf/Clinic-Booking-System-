import { apiClient } from "../../../lib/api";
import type { ApiResponse } from "../../../types/api";
import type { Appointment } from "../types";

/**
 * Fetch a single appointment by ID from GET /appointments/:id
 * Available to PATIENT (own), DOCTOR (own), or ADMIN.
 */
export async function getAppointmentById(
  id: string
): Promise<ApiResponse<Appointment>> {
  return apiClient.get<ApiResponse<Appointment>>(
    `/appointments/${encodeURIComponent(id)}`
  );
}


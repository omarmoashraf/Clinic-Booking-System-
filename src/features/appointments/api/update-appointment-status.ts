import { apiClient } from "../../../lib/api";
import type { ApiResponse } from "../../../types/api";
import type { Appointment, UpdateAppointmentStatusPayload } from "../types";

/**
 * Update an appointment status via PATCH /appointments/:id/status
 * Available to DOCTOR (CONFIRMED, COMPLETED, CANCELLED) or PATIENT (CANCELLED).
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED"
): Promise<ApiResponse<Appointment>> {
  const payload: UpdateAppointmentStatusPayload = { status };
  return apiClient.patch<ApiResponse<Appointment>>(
    `/appointments/${encodeURIComponent(appointmentId)}/status`,
    payload
  );
}


import { apiClient } from "../../../lib/api";
import type { ApiResponse } from "../../../types/api";
import type { Appointment, CancelAppointmentPayload } from "../types";

/**
 * Cancel an appointment via PATCH /appointments/:id/status
 * Available to PATIENT (for their own pending/confirmed appointments).
 */
export async function cancelAppointment(
  appointmentId: string
): Promise<ApiResponse<Appointment>> {
  const payload: CancelAppointmentPayload = { status: "CANCELLED" };
  // Pass payload as the direct body argument (2nd param).
  // HttpClient.patch(endpoint, body, config?)
  return apiClient.patch<ApiResponse<Appointment>>(
    `/appointments/${encodeURIComponent(appointmentId)}/status`,
    payload
  );
}

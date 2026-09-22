import { apiClient } from "../../../lib/api";
import type { ApiResponse } from "../../../types/api";
import type { Appointment, CreateAppointmentPayload } from "../types";

/**
 * Book an appointment via POST /appointments
 * Available to authenticated PATIENT accounts.
 *
 * @param payload - Object containing availabilityId and optional notes.
 */
export async function createAppointment(
  payload: CreateAppointmentPayload
): Promise<ApiResponse<Appointment>> {
  const body: { availabilityId: string; notes?: string } = {
    availabilityId: payload.availabilityId,
  };

  const trimmedNotes = payload.notes?.trim();
  if (trimmedNotes) {
    body.notes = trimmedNotes;
  }

  return apiClient.post<ApiResponse<Appointment>>("/appointments", body);
}


import { apiClient } from "@/lib/api";

/**
 * Delete an availability slot for the authenticated doctor via DELETE /doctors/me/availability/:id
 * Per API_CONTRACT.md:
 * - 204 No Content on success
 * - 409 Conflict if slot is already booked
 * - 403 Forbidden if slot belongs to another doctor
 * - 404 Not Found if slot does not exist
 */
export async function deleteDoctorAvailability(slotId: string): Promise<void> {
  return apiClient.delete<void>(`/doctors/me/availability/${encodeURIComponent(slotId)}`);
}


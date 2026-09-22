import { apiClient } from "../../../lib/api";
import type { ApiResponse } from "../../../types/api";
import type { AvailabilitySlot, GetAvailabilityParams } from "../../availability/types";

/**
 * Fetch available slots for a doctor from GET /doctors/:doctorId/availability
 * Public endpoint.
 */
export async function getDoctorAvailability(
  doctorId: string,
  params?: GetAvailabilityParams
): Promise<ApiResponse<AvailabilitySlot[]>> {
  return apiClient.get<ApiResponse<AvailabilitySlot[]>>(
    `/doctors/${encodeURIComponent(doctorId)}/availability`,
    {
      params: {
        from: params?.from,
        to: params?.to,
      },
    }
  );
}


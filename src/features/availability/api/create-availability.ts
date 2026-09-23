import { apiClient } from "@/lib/api";
import type { ApiResponse } from "@/types/api";
import type { AvailabilitySlot, CreateAvailabilityPayload } from "../types";

/**
 * Create a new availability slot for the authenticated doctor via POST /doctors/me/availability
 * Per API_CONTRACT.md:
 * - date: YYYY-MM-DD
 * - startTime: HH:mm
 * - endTime: HH:mm (strictly after startTime)
 * Clinic timezone: Africa/Cairo
 */
export async function createDoctorAvailability(
  payload: CreateAvailabilityPayload
): Promise<ApiResponse<AvailabilitySlot>> {
  return apiClient.post<ApiResponse<AvailabilitySlot>>(
    "/doctors/me/availability",
    payload
  );
}


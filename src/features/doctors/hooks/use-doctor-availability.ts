"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/query/query-keys";
import { getDoctorAvailability } from "../api/get-doctor-availability";
import type { GetAvailabilityParams } from "../../availability/types";

/**
 * TanStack Query hook to fetch available slots for a doctor
 */
export function useDoctorAvailabilityQuery(
  doctorId: string,
  params?: GetAvailabilityParams
) {
  const rangeKey = params?.from ? `${params.from}_${params.to ?? ""}` : "all";

  return useQuery({
    queryKey: queryKeys.doctors.availability(doctorId, rangeKey),
    queryFn: () => getDoctorAvailability(doctorId, params),
    enabled: Boolean(doctorId),
  });
}


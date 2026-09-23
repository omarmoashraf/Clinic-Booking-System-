"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/query/query-keys";
import { getAppointmentById } from "../api/get-appointment-by-id";

/**
 * TanStack Query hook to fetch a single appointment by ID
 */
export function useAppointmentDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.appointments.detail(id),
    queryFn: () => getAppointmentById(id),
    enabled: Boolean(id),
  });
}


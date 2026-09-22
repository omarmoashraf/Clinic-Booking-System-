"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/query/query-keys";
import { getMyAppointments } from "../api/get-my-appointments";
import type { GetAppointmentsParams } from "../types";

/**
 * TanStack Query hook to fetch the current user's appointments
 */
export function useMyAppointmentsQuery(params?: GetAppointmentsParams) {
  return useQuery({
    queryKey: queryKeys.appointments.mine(params as Record<string, unknown>),
    queryFn: () => getMyAppointments(params),
  });
}

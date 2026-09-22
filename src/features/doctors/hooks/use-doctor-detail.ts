"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/query/query-keys";
import { getDoctorById } from "../api/get-doctor-by-id";

/**
 * TanStack Query hook to fetch a doctor by ID
 */
export function useDoctorDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.doctors.detail(id),
    queryFn: () => getDoctorById(id),
    enabled: Boolean(id),
  });
}


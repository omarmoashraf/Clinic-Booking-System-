"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/query/query-keys";
import { getDoctors } from "../api/get-doctors";
import type { GetDoctorsParams } from "../types";

/**
 * TanStack Query hook to fetch doctors
 */
export function useDoctorsQuery(params?: GetDoctorsParams) {
  return useQuery({
    queryKey: queryKeys.doctors.list(params as Record<string, unknown>),
    queryFn: () => getDoctors(params),
  });
}


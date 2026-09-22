"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/query/query-keys";
import { getSpecialties } from "../api/get-specialties";
import type { GetSpecialtiesParams } from "../types";

/**
 * TanStack Query hook to fetch specialties
 */
export function useSpecialtiesQuery(params?: GetSpecialtiesParams) {
  return useQuery({
    queryKey: queryKeys.specialties.list(params as Record<string, unknown>),
    queryFn: () => getSpecialties(params),
  });
}


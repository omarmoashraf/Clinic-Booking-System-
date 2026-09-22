"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/query/query-keys";
import { getSpecialtyById } from "../api/get-specialty-by-id";

/**
 * TanStack Query hook to fetch a single specialty by ID
 */
export function useSpecialtyDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.specialties.detail(id),
    queryFn: () => getSpecialtyById(id),
    enabled: Boolean(id),
  });
}


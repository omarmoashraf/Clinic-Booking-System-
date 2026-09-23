"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { createDoctorAvailability } from "../api/create-availability";
import type { CreateAvailabilityPayload } from "../types";

/**
 * TanStack Mutation hook to create a new availability slot for the authenticated doctor.
 * Invalidates doctor availability queries on success.
 */
export function useCreateAvailabilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAvailabilityPayload) =>
      createDoctorAvailability(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.doctors.availabilities(),
      });
    },
  });
}


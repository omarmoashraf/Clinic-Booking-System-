"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { deleteDoctorAvailability } from "../api/delete-availability";

/**
 * TanStack Mutation hook to delete an availability slot for the authenticated doctor.
 * Invalidates doctor availability queries on success.
 */
export function useDeleteAvailabilityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slotId: string) => deleteDoctorAvailability(slotId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.doctors.availabilities(),
      });
    },
  });
}


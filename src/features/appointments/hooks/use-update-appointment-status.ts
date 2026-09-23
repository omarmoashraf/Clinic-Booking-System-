"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/query/query-keys";
import { updateAppointmentStatus } from "../api/update-appointment-status";

export interface UpdateStatusMutationVariables {
  appointmentId: string;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

/**
 * TanStack Mutation hook to update an appointment's status (confirm, complete, cancel).
 * Automatically invalidates appointments queries upon success.
 */
export function useUpdateAppointmentStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ appointmentId, status }: UpdateStatusMutationVariables) =>
      updateAppointmentStatus(appointmentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.all,
      });
    },
  });
}


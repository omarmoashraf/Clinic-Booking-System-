"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/query/query-keys";
import { cancelAppointment } from "../api/cancel-appointment";

/**
 * TanStack Mutation hook to cancel an appointment
 * Automatically invalidates appointments queries upon success.
 */
export function useCancelAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (appointmentId: string) => cancelAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.all,
      });
    },
  });
}

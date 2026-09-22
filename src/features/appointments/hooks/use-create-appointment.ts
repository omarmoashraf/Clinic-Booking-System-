"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../lib/query/query-keys";
import { createAppointment } from "../api/create-appointment";
import type { CreateAppointmentPayload } from "../types";

/**
 * TanStack Mutation hook to book an appointment via POST /appointments.
 * Automatically invalidates appointments and doctor availability caches on success.
 */
export function useCreateAppointmentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAppointmentPayload) =>
      createAppointment(payload),
    onSuccess: () => {
      // Invalidate my appointments list and dashboard statistics
      queryClient.invalidateQueries({
        queryKey: queryKeys.appointments.all,
      });
      // Invalidate doctor availability so the booked slot disappears immediately
      queryClient.invalidateQueries({
        queryKey: queryKeys.doctors.all,
      });
    },
  });
}


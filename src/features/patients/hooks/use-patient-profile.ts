"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { useAuth } from "@/hooks/use-auth";
import type { UserProfile } from "@/types/auth";
import { getPatientProfile } from "../api/get-patient-profile";
import { updatePatientProfile } from "../api/update-patient-profile";
import type { UpdatePatientProfilePayload } from "../types";

/**
 * TanStack Query hook to retrieve authenticated user profile merged with patient data.
 * Uses queryKey: queryKeys.auth.me()
 */
export function usePatientProfileQuery() {
  const { profile: initialAuthProfile, isAuthenticated } = useAuth();

  return useQuery<UserProfile>({
    queryKey: queryKeys.auth.me(),
    queryFn: () => getPatientProfile(),
    initialData: initialAuthProfile ?? undefined,
    enabled: isAuthenticated,
  });
}

/**
 * TanStack Mutation hook to update patient profile.
 * Automatically synchronizes both TanStack cache and AuthContext state.
 */
export function useUpdatePatientProfileMutation() {
  const queryClient = useQueryClient();
  const { updateProfile } = useAuth();

  return useMutation<UserProfile, Error, UpdatePatientProfilePayload>({
    mutationFn: (payload: UpdatePatientProfilePayload) => updatePatientProfile(payload),
    onSuccess: (updatedProfile) => {
      // 1. Immediately update TanStack Query cache
      queryClient.setQueryData(queryKeys.auth.me(), updatedProfile);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });

      // 2. Synchronize AuthProvider state for global UI (header, sidebar, dashboard)
      updateProfile(updatedProfile);
    },
  });
}


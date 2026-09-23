"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/query-keys";
import { useAuth } from "@/hooks/use-auth";
import type { ApiResponse } from "@/types/api";
import type { Doctor, UpdateDoctorProfilePayload } from "../types";
import { updateDoctorProfile } from "../api/update-doctor-profile";

/**
 * TanStack Mutation hook to update the authenticated doctor's profile.
 * Synchronizes TanStack Query caches and AuthContext state upon success.
 */
export function useUpdateDoctorProfileMutation() {
  const queryClient = useQueryClient();
  const { profile, updateProfile } = useAuth();

  return useMutation<ApiResponse<Doctor>, Error, UpdateDoctorProfilePayload>({
    mutationFn: (payload: UpdateDoctorProfilePayload) => updateDoctorProfile(payload),
    onSuccess: (response) => {
      const updatedDoctor = response.data;

      // 1. Invalidate doctors queries to refresh listings & detail views
      queryClient.invalidateQueries({
        queryKey: queryKeys.doctors.all,
      });

      // 2. Synchronize AuthContext UserProfile so all headers, sidebars, and banners update
      if (profile && updatedDoctor) {
        const newProfile = {
          ...profile,
          doctor: {
            id: updatedDoctor.id,
            specialty: updatedDoctor.specialty ?? { id: "", name: "" },
            bio: updatedDoctor.bio,
          },
        };
        updateProfile(newProfile);
        queryClient.setQueryData(queryKeys.auth.me(), newProfile);
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
  });
}


"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-i18n";
import { DoctorAccountCard } from "@/features/doctors/components/doctor-account-card";
import { DoctorProfileForm } from "@/features/doctors/components/doctor-profile-form";
import { DoctorProfileSkeleton } from "@/features/doctors/components/doctor-profile-skeleton";

/**
 * Doctor Profile Management Page (/doctor/profile)
 * Allows authenticated doctors to view verified account credentials and update
 * their clinical specialty and professional biography.
 * Conforms to API_CONTRACT.md Doctors Module PATCH /doctors/me and DESIGN.md Section 15.
 */
export default function DoctorProfilePage() {
  const { profile, isLoading } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1 text-start">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("doctors.profileTitle")}
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          {t("doctors.profileSubtitle")}
        </p>
      </div>

      {/* Main Content Area */}
      {isLoading || !profile ? (
        <DoctorProfileSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Read-Only Account Identity Card */}
          <DoctorAccountCard profile={profile} />

          {/* Mutable Professional Information Form */}
          <DoctorProfileForm initialProfile={profile} />
        </div>
      )}
    </div>
  );
}

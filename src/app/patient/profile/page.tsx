"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useTranslation } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { usePatientProfileQuery } from "@/features/patients/hooks/use-patient-profile";
import { PatientProfileForm } from "@/features/patients/components/patient-profile-form";
import { PatientProfileSkeleton } from "@/features/patients/components/patient-profile-skeleton";

export default function PatientProfilePage() {
  const { t } = useTranslation();
  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = usePatientProfileQuery();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5 text-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("patients.profile")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("patients.profileSubtitle")}
          </p>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && <PatientProfileSkeleton />}

      {/* Error Fallback */}
      {isError && !isLoading && (
        <div className="max-w-2xl mx-auto py-8 text-start space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("patients.loadError")}</AlertTitle>
            <AlertDescription className="mt-1">
              {error instanceof Error ? error.message : t("patients.loadError")}
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>{t("patients.retry")}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Profile Form */}
      {profile && !isLoading && !isError && (
        <PatientProfileForm initialProfile={profile} />
      )}
    </div>
  );
}


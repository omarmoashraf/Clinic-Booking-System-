"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-i18n";
import { Button, buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMyAppointmentsQuery } from "@/features/appointments/hooks/use-my-appointments";
import { PatientStats } from "@/features/patients/components/patient-stats";
import { NextAppointmentCard } from "@/features/patients/components/next-appointment-card";
import { RecentAppointmentsTable } from "@/features/patients/components/recent-appointments-table";
import { PatientQuickActions } from "@/features/patients/components/patient-quick-actions";
import { PatientDashboardSkeleton } from "@/features/patients/components/patient-dashboard-skeleton";
import { CancelAppointmentDialog } from "@/features/patients/components/cancel-appointment-dialog";
import type { Appointment } from "@/features/appointments/types";

export default function PatientDashboardPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();

  const {
    data: appointmentsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useMyAppointmentsQuery({ limit: 50 });

  const [cancelTarget, setCancelTarget] = React.useState<Appointment | null>(
    null
  );
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

  const handleOpenCancelDialog = React.useCallback((appointment: Appointment) => {
    setCancelTarget(appointment);
    setCancelDialogOpen(true);
  }, []);

  const handleCloseCancelDialog = React.useCallback(() => {
    setCancelDialogOpen(false);
    setCancelTarget(null);
  }, []);

  if (isLoading) {
    return <PatientDashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-start">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertTitle>{t("patients.loadError")}</AlertTitle>
          <AlertDescription className="mt-1">
            {error instanceof Error ? error.message : t("errors.unknown")}
          </AlertDescription>
        </Alert>
        <div className="flex justify-end">
          <Button
            onClick={() => refetch()}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="size-4" />
            <span>{t("patients.retry")}</span>
          </Button>
        </div>
      </div>
    );
  }

  const appointments = appointmentsData?.data ?? [];
  const totalCount = appointmentsData?.meta?.total ?? appointments.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div className="text-start">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {profile?.fullName
              ? `${t("patients.welcome")}, ${profile.fullName}`
              : t("patients.dashboardTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            {t("patients.dashboardSubtitle")}
          </p>
        </div>

        <Link
          href="/patient/doctors"
          className={buttonVariants({
            size: "default",
            className: "gap-2 shrink-0 self-start sm:self-auto shadow-subtle",
          })}
        >
          <Plus className="size-4" />
          <span>{t("appointments.bookNew")}</span>
        </Link>
      </div>

      {/* Real Metric Summary Cards */}
      <PatientStats appointments={appointments} totalCount={totalCount} />

      {/* Next Upcoming Appointment Highlight */}
      <NextAppointmentCard
        appointments={appointments}
        onCancelRequest={handleOpenCancelDialog}
      />

      {/* Quick Action Shortcuts */}
      <PatientQuickActions />

      {/* Recent Appointments Table / Mobile Cards */}
      <RecentAppointmentsTable
        appointments={appointments}
        onCancelRequest={handleOpenCancelDialog}
      />

      {/* Cancellation Confirmation Dialog */}
      <CancelAppointmentDialog
        isOpen={cancelDialogOpen}
        appointment={cancelTarget}
        onClose={handleCloseCancelDialog}
      />
    </div>
  );
}

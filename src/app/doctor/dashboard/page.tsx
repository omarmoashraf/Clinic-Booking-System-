"use client";

import * as React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useMyAppointmentsQuery } from "@/features/appointments/hooks/use-my-appointments";
import type { Appointment } from "@/features/appointments/types";
import { DoctorDashboardSkeleton } from "@/features/doctors/components/dashboard/doctor-dashboard-skeleton";
import { DoctorStats } from "@/features/doctors/components/dashboard/doctor-stats";
import { DoctorNextAppointmentCard } from "@/features/doctors/components/dashboard/doctor-next-appointment-card";
import { DoctorRecentAppointmentsTable } from "@/features/doctors/components/dashboard/doctor-recent-appointments-table";
import { DoctorQuickActions } from "@/features/doctors/components/dashboard/doctor-quick-actions";
import {
  DoctorStatusDialog,
  type DoctorStatusAction,
} from "@/features/doctors/components/dashboard/doctor-status-dialog";

export default function DoctorDashboardPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();

  const {
    data: appointmentsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useMyAppointmentsQuery({ limit: 50 });

  const [targetAppointment, setTargetAppointment] =
    React.useState<Appointment | null>(null);
  const [targetAction, setTargetAction] =
    React.useState<DoctorStatusAction | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleActionRequest = React.useCallback(
    (appointment: Appointment, action: DoctorStatusAction) => {
      setTargetAppointment(appointment);
      setTargetAction(action);
      setDialogOpen(true);
    },
    []
  );

  const handleCloseDialog = React.useCallback(() => {
    setDialogOpen(false);
    setTargetAppointment(null);
    setTargetAction(null);
  }, []);

  if (isLoading) {
    return <DoctorDashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-start">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertTitle>{t("doctors.loadDashboardError")}</AlertTitle>
          <AlertDescription className="mt-1">
            {error instanceof Error ? error.message : t("errors.unknown")}
          </AlertDescription>
        </Alert>
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
            <span>{t("common.retry")}</span>
          </Button>
        </div>
      </div>
    );
  }

  const appointments: Appointment[] = appointmentsData?.data ?? [];
  const totalCount = appointmentsData?.meta?.total ?? appointments.length;
  const specialtyName = profile?.doctor?.specialty?.name;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Dashboard Operational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border">
        <div className="text-start space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t("doctors.dashboardTitle")}
            </h1>
            {specialtyName && (
              <Badge variant="outline" className="text-xs font-normal">
                {specialtyName}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {t("doctors.welcome")}, {profile?.fullName || t("doctors.roleLabel")}.{" "}
            {t("doctors.dashboardSubtitle")}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
          <span>{t("common.retry")}</span>
        </Button>
      </div>

      {/* Operational Metrics Cards */}
      <DoctorStats appointments={appointments} totalCount={totalCount} />

      {/* Primary Focus: Next Patient Consultation Card */}
      <DoctorNextAppointmentCard
        appointments={appointments}
        onActionRequest={handleActionRequest}
      />

      {/* Operational Quick Actions */}
      <DoctorQuickActions />

      {/* Recent & Upcoming Appointments Table */}
      <DoctorRecentAppointmentsTable
        appointments={appointments}
        onActionRequest={handleActionRequest}
      />

      {/* Status Action Dialog (Confirm, Complete, Cancel) */}
      <DoctorStatusDialog
        isOpen={dialogOpen}
        appointment={targetAppointment}
        targetStatus={targetAction}
        onClose={handleCloseDialog}
      />
    </div>
  );
}

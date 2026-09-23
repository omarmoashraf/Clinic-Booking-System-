"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  CheckCircle2,
  FileText,
  Info,
  MapPin,
  RotateCcw,
  User,
  XCircle,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { useAppointmentDetailQuery } from "@/features/appointments/hooks/use-appointment-detail";
import { useTranslation } from "@/hooks/use-i18n";
import {
  DoctorStatusDialog,
  type DoctorStatusAction,
} from "@/features/doctors/components/dashboard/doctor-status-dialog";
import {
  canDoctorCancelAppointment,
  canDoctorCompleteAppointment,
  canDoctorConfirmAppointment,
} from "@/features/appointments/utils/appointment-helpers";

export interface DoctorAppointmentDetailViewProps {
  appointmentId: string;
}

export function DoctorAppointmentDetailView({
  appointmentId,
}: DoctorAppointmentDetailViewProps) {
  const { t } = useTranslation();
  const [targetAction, setTargetAction] = React.useState<DoctorStatusAction | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useAppointmentDetailQuery(appointmentId);

  const appointment = response?.data;

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-8 animate-pulse text-start">
        <div className="h-4 w-36 bg-muted rounded" />
        <div className="p-6 rounded-xl border border-border bg-card space-y-6">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // 2. Error / Not Found State
  if (isError || !appointment) {
    const is404 = (error as { status?: number })?.status === 404;

    return (
      <div className="w-full max-w-2xl mx-auto py-12 text-start">
        <EmptyState
          icon={AlertCircle}
          title={is404 ? t("appointments.notFoundTitle") : t("errors.somethingWentWrong")}
          description={
            is404
              ? t("appointments.notFoundDesc")
              : error instanceof Error
              ? error.message
              : undefined
          }
          action={
            <div className="flex items-center gap-3">
              {!is404 && (
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RotateCcw className="size-3.5 me-1.5" />
                  <span>{t("common.retry")}</span>
                </Button>
              )}
              <Link
                href="/doctor/appointments"
                className={buttonVariants({ size: "sm" })}
              >
                {t("appointments.backToAppointments")}
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  const { patient, availability, status, notes, id, createdAt, updatedAt } =
    appointment;

  const canConfirm = canDoctorConfirmAppointment(appointment);
  const canComplete = canDoctorCompleteAppointment(appointment);
  const canCancel = canDoctorCancelAppointment(appointment);

  const handleOpenAction = (action: DoctorStatusAction) => {
    setTargetAction(action);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setTargetAction(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-start animate-in fade-in duration-200">
      {/* Back navigation link */}
      <div>
        <Link
          href="/doctor/appointments"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <DirectionalIcon
            icon={ArrowLeft}
            className="size-3.5 transition-transform group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5"
          />
          <span>{t("appointments.backToAppointments")}</span>
        </Link>
      </div>

      {/* Main Details Card */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-subtle space-y-6">
        {/* Header: Patient Info, Status & Operational Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {patient.fullName}
              </h1>
              <StatusBadge status={status} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("appointments.bookingId")}: <span className="font-mono">{id}</span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {canConfirm && (
              <Button
                size="sm"
                onClick={() => handleOpenAction("CONFIRMED")}
                className="gap-1.5 shadow-subtle"
              >
                <CheckCircle className="size-4" />
                <span>{t("appointments.confirmAppointment")}</span>
              </Button>
            )}

            {canComplete && (
              <Button
                size="sm"
                onClick={() => handleOpenAction("COMPLETED")}
                className="gap-1.5 bg-success text-success-foreground hover:bg-success/90 shadow-subtle"
              >
                <CheckCircle2 className="size-4" />
                <span>{t("appointments.completeAppointment")}</span>
              </Button>
            )}

            {canCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenAction("CANCELLED")}
                className="text-destructive border-destructive/20 hover:bg-destructive/10 gap-1.5"
              >
                <XCircle className="size-4" />
                <span>{t("appointments.cancelAppointment")}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Details */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-3">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <User className="size-4" />
              <span>{t("appointments.patientDetails")}</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">{t("appointments.patient")}:</span>
                <span className="font-semibold text-foreground">{patient.fullName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-muted-foreground">{patient.id}</span>
              </div>
            </div>
          </div>

          {/* Schedule & Clinic Details */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-3">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Calendar className="size-4" />
              <span>{t("appointments.scheduleDetails")}</span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">{t("patients.appointmentDate")}:</span>
                <span className="font-medium text-foreground">{availability.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">{t("patients.appointmentTime")}:</span>
                <span className="font-medium text-foreground">
                  {availability.startTime} – {availability.endTime}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">{t("appointments.clinicLocation")}:</span>
                <span className="text-foreground flex items-center gap-1">
                  <MapPin className="size-3 text-primary" />
                  {t("appointments.cairoClinic")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Notes Card */}
        <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2">
          <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
            <FileText className="size-4 text-muted-foreground" />
            <span>{t("appointments.consultationNotes")}</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {notes ? notes : t("appointments.noNotes")}
          </p>
        </div>

        {/* Status Lifecycle Notice */}
        <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
          <Info className="size-4 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <span className="font-semibold text-foreground block">
              {t("appointments.statusProgression")}
            </span>
            <p>
              {status === "PENDING" && t("appointments.doctorPendingNotice")}
              {status === "CONFIRMED" && t("appointments.doctorConfirmedNotice")}
              {status === "COMPLETED" && t("appointments.doctorCompletedNotice")}
              {status === "CANCELLED" && t("appointments.doctorCancelledNotice")}
            </p>
          </div>
        </div>

        {/* Meta Timestamps Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border/50 text-[11px] text-muted-foreground">
          <span>
            {t("appointments.bookedOn")}: {new Date(createdAt).toLocaleString()}
          </span>
          <span>
            {t("appointments.lastUpdated")}: {new Date(updatedAt).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Status Transition Dialog */}
      <DoctorStatusDialog
        isOpen={dialogOpen}
        appointment={appointment}
        targetStatus={targetAction}
        onClose={handleCloseDialog}
        onSuccess={() => refetch()}
      />
    </div>
  );
}

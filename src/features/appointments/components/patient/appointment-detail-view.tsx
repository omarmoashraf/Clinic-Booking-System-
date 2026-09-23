"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  FileText,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  XCircle,
  Info,
  CheckCircle,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StatusBadge } from "@/components/shared/status-badge";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { CancelAppointmentDialog } from "@/features/patients/components/cancel-appointment-dialog";
import { useAppointmentDetailQuery } from "@/features/appointments/hooks/use-appointment-detail";
import { canCancelAppointment } from "@/features/appointments/utils/appointment-helpers";
import { useTranslation } from "@/hooks/use-i18n";

export interface AppointmentDetailViewProps {
  appointmentId: string;
}

export function AppointmentDetailView({
  appointmentId,
}: AppointmentDetailViewProps) {
  const { t } = useTranslation();
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

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
      <div className="w-full max-w-2xl mx-auto py-12">
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
                  <span>{t("home.retry")}</span>
                </Button>
              )}
              <Link
                href="/patient/appointments"
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

  const { doctor, availability, status, notes, id, createdAt, updatedAt } = appointment;
  const canCancel = canCancelAppointment(appointment);

  const initials = doctor.fullName
    ? doctor.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "DR";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 text-start animate-in fade-in duration-200">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumbs"
        className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap"
      >
        <Link
          href="/patient/dashboard"
          className="hover:text-foreground transition-colors"
        >
          {t("nav.dashboard")}
        </Link>
        <DirectionalIcon icon={ChevronRight} className="size-3.5 opacity-60" />
        <Link
          href="/patient/appointments"
          className="hover:text-foreground transition-colors"
        >
          {t("nav.myAppointments")}
        </Link>
        <DirectionalIcon icon={ChevronRight} className="size-3.5 opacity-60" />
        <span className="font-semibold text-foreground truncate max-w-48 sm:max-w-xs">
          {doctor.fullName}
        </span>
      </nav>

      {/* Main Details Card */}
      <div className="p-6 sm:p-8 rounded-xl border border-border bg-card shadow-subtle space-y-6">
        {/* Header: Title, Reference & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <span className="text-xs text-muted-foreground block font-mono">
              {t("appointments.bookingId")}: {id}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
              {t("appointments.detailsTitle")}
            </h1>
          </div>
          <StatusBadge status={status} className="self-start sm:self-auto text-sm px-3 py-1" />
        </div>

        {/* State Machine Status Progression Rules Alert */}
        {status === "PENDING" && (
          <Alert className="border-warning/30 bg-warning/5">
            <Info className="size-4 text-warning" />
            <AlertTitle className="text-xs font-semibold uppercase tracking-wider text-warning">
              {t("appointments.statusProgression")}
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground mt-1">
              {t("appointments.pendingNotice")}
            </AlertDescription>
          </Alert>
        )}

        {status === "CONFIRMED" && (
          <Alert className="border-primary/30 bg-primary/5">
            <CheckCircle className="size-4 text-primary" />
            <AlertTitle className="text-xs font-semibold uppercase tracking-wider text-primary">
              {t("appointments.statusProgression")}
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground mt-1">
              {t("appointments.confirmedNotice")}
            </AlertDescription>
          </Alert>
        )}

        {status === "COMPLETED" && (
          <Alert className="border-border bg-muted/40">
            <CheckCircle className="size-4 text-muted-foreground" />
            <AlertTitle className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {t("appointments.statusProgression")}
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground mt-1">
              {t("appointments.completedNotice")}
            </AlertDescription>
          </Alert>
        )}

        {status === "CANCELLED" && (
          <Alert className="border-destructive/30 bg-destructive/5">
            <XCircle className="size-4 text-destructive" />
            <AlertTitle className="text-xs font-semibold uppercase tracking-wider text-destructive">
              {t("appointments.statusProgression")}
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground mt-1">
              {t("appointments.cancelledNotice")}
            </AlertDescription>
          </Alert>
        )}

        {/* Information Grid: Doctor & Schedule */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Doctor Card */}
          <div className="p-5 rounded-xl border border-border/80 bg-muted/20 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary block">
              {t("appointments.doctorDetails")}
            </span>

            <div className="flex items-start gap-3.5">
              <div
                className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0 border border-primary/20"
                aria-hidden="true"
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base text-foreground truncate">
                  {doctor.fullName}
                </h3>
                {doctor.specialty?.name ? (
                  <Badge
                    variant="secondary"
                    className="mt-1 text-xs font-normal inline-flex items-center gap-1"
                  >
                    <Stethoscope className="size-3" />
                    <span>{doctor.specialty.name}</span>
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {t("doctors.generalPractitioner")}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2">
              <Link
                href={`/patient/doctors/${doctor.id}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "w-full text-xs gap-1.5",
                })}
              >
                <Stethoscope className="size-3.5" />
                <span>{t("doctors.viewProfile")}</span>
                <DirectionalIcon icon={ChevronRight} className="size-3.5" />
              </Link>
            </div>
          </div>

          {/* Schedule & Location Card */}
          <div className="p-5 rounded-xl border border-border/80 bg-muted/20 space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary block">
              {t("appointments.scheduleDetails")}
            </span>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Calendar className="size-4" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    {t("patients.appointmentDate")}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {availability.date}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
                  <Clock className="size-4" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    {t("patients.appointmentTime")}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {availability.startTime} – {availability.endTime}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                  <MapPin className="size-4" />
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    {t("appointments.clinicLocation")}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {t("appointments.cairoClinic")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Consultation Notes Section */}
        <div className="p-5 rounded-xl border border-border/80 bg-muted/20 space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              {t("appointments.consultationNotes")}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {notes ? notes : t("appointments.noNotes")}
          </p>
        </div>

        {/* Timestamps */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-4 border-t border-border/60">
          <span>
            {t("appointments.bookedOn")}: {new Date(createdAt).toLocaleDateString()}
          </span>
          <span>
            {t("appointments.lastUpdated")}: {new Date(updatedAt).toLocaleDateString()}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
          <Link
            href="/patient/appointments"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "gap-1.5 text-xs",
            })}
          >
            <DirectionalIcon icon={ArrowLeft} mirror={true} className="size-3.5" />
            <span>{t("appointments.backToAppointments")}</span>
          </Link>

          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCancelDialogOpen(true)}
              className="text-xs text-destructive border-destructive/20 hover:bg-destructive/10 gap-1.5"
            >
              <XCircle className="size-4" />
              <span>{t("appointments.cancelAppointment")}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Cancellation Dialog */}
      <CancelAppointmentDialog
        isOpen={cancelDialogOpen}
        appointment={appointment}
        onClose={() => setCancelDialogOpen(false)}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  FileText,
  User,
  XCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-i18n";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import type { Appointment } from "@/features/appointments/types";
import { getNextDoctorAppointment } from "../../utils/dashboard-helpers";
import type { DoctorStatusAction } from "./doctor-status-dialog";

export interface DoctorNextAppointmentCardProps {
  appointments: Appointment[];
  onActionRequest: (appointment: Appointment, action: DoctorStatusAction) => void;
}

export function DoctorNextAppointmentCard({
  appointments,
  onActionRequest,
}: DoctorNextAppointmentCardProps) {
  const { t } = useTranslation();
  const nextAppointment = React.useMemo(
    () => getNextDoctorAppointment(appointments),
    [appointments]
  );

  if (!nextAppointment) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card shadow-subtle">
        <h2 className="text-base font-semibold text-foreground mb-4 text-start">
          {t("doctors.nextPatient")}
        </h2>
        <EmptyState
          icon={Calendar}
          title={t("doctors.noUpcomingDoctor")}
          description={t("doctors.noUpcomingDoctorDesc")}
          action={
            <Link
              href="/doctor/availability"
              className={buttonVariants({
                size: "sm",
                className: "gap-2",
              })}
            >
              <Clock className="size-4" />
              <span>{t("doctors.manageAvailability")}</span>
            </Link>
          }
        />
      </div>
    );
  }

  const { patient, availability, status, notes } = nextAppointment;

  return (
    <div className="p-6 rounded-xl border border-border bg-card shadow-subtle space-y-5 transition-colors">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {t("doctors.nextPatient")}
          </span>
          <h2 className="text-lg font-bold text-foreground mt-0.5 text-start">
            {patient.fullName}
          </h2>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Patient Info */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/60">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <User className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1 text-start">
            <span className="text-xs text-muted-foreground block">
              {t("appointments.patient")}
            </span>
            <span className="text-sm font-semibold text-foreground truncate block">
              {patient.fullName}
            </span>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/60">
          <div className="size-9 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground shrink-0">
            <Clock className="size-4.5" />
          </div>
          <div className="min-w-0 flex-1 text-start">
            <span className="text-xs text-muted-foreground block">
              {availability.date}
            </span>
            <span className="text-sm font-semibold text-foreground truncate block">
              {availability.startTime} – {availability.endTime}
            </span>
          </div>
        </div>
      </div>

      {/* Notes (if present) */}
      {notes && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/20 border border-border/60 text-xs text-start">
          <FileText className="size-4 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold text-foreground me-1.5">
              {t("appointments.notes")}:
            </span>
            <span className="text-muted-foreground">{notes}</span>
          </div>
        </div>
      )}

      {/* Operational Actions */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-border/50">
        {status === "PENDING" && (
          <Button
            size="sm"
            onClick={() => onActionRequest(nextAppointment, "CONFIRMED")}
            className="gap-1.5 shadow-subtle"
          >
            <CheckCircle className="size-4" />
            <span>{t("appointments.confirmAppointment")}</span>
          </Button>
        )}

        {status === "CONFIRMED" && (
          <Button
            size="sm"
            onClick={() => onActionRequest(nextAppointment, "COMPLETED")}
            className="gap-1.5 bg-success text-success-foreground hover:bg-success/90 shadow-subtle"
          >
            <CheckCircle2 className="size-4" />
            <span>{t("appointments.completeAppointment")}</span>
          </Button>
        )}

        {(status === "PENDING" || status === "CONFIRMED") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onActionRequest(nextAppointment, "CANCELLED")}
            className="text-destructive border-destructive/20 hover:bg-destructive/10 gap-1.5"
          >
            <XCircle className="size-4" />
            <span>{t("appointments.cancelAppointment")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}


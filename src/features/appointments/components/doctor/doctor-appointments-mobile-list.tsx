"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  User,
  XCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-i18n";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import type { Appointment } from "@/features/appointments/types";
import type { DoctorStatusAction } from "@/features/doctors/components/dashboard/doctor-status-dialog";
import {
  canDoctorCancelAppointment,
  canDoctorCompleteAppointment,
  canDoctorConfirmAppointment,
} from "@/features/appointments/utils/appointment-helpers";

export interface DoctorAppointmentsMobileListProps {
  appointments: Appointment[];
  onActionRequest: (appointment: Appointment, action: DoctorStatusAction) => void;
}

export function DoctorAppointmentsMobileList({
  appointments,
  onActionRequest,
}: DoctorAppointmentsMobileListProps) {
  const { t } = useTranslation();

  return (
    <div className="md:hidden space-y-3.5">
      {appointments.map((apt) => {
        const canConfirm = canDoctorConfirmAppointment(apt);
        const canComplete = canDoctorCompleteAppointment(apt);
        const canCancel = canDoctorCancelAppointment(apt);

        return (
          <div
            key={apt.id}
            className="p-4 rounded-xl border border-border bg-card shadow-subtle space-y-3.5 text-start"
          >
            {/* Top Bar: Patient & Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <User className="size-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate">
                    {apt.patient.fullName}
                  </h3>
                  <span className="text-[11px] text-muted-foreground block truncate">
                    {t("appointments.bookingId")}: {apt.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
              <StatusBadge status={apt.status} className="shrink-0" />
            </div>

            {/* Schedule Details */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="size-3.5 shrink-0 text-primary" />
                <span className="truncate">{apt.availability.date}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5 shrink-0 text-secondary-foreground" />
                <span className="truncate">
                  {apt.availability.startTime} – {apt.availability.endTime}
                </span>
              </div>
            </div>

            {/* Notes if available */}
            {apt.notes && (
              <p className="text-xs text-muted-foreground italic border-s-2 border-primary/40 ps-2.5 py-0.5 line-clamp-2">
                {apt.notes}
              </p>
            )}

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
              <Link
                href={`/doctor/appointments/${apt.id}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "h-8 px-2.5 text-xs text-primary gap-1",
                })}
              >
                <span>{t("appointments.viewDetails")}</span>
                <DirectionalIcon icon={ChevronRight} mirror={true} className="size-3.5" />
              </Link>

              <div className="flex items-center gap-1.5">
                {canConfirm && (
                  <Button
                    size="sm"
                    onClick={() => onActionRequest(apt, "CONFIRMED")}
                    className="h-8 px-2.5 text-xs gap-1"
                  >
                    <CheckCircle className="size-3.5" />
                    <span>{t("appointments.confirmAppointment")}</span>
                  </Button>
                )}

                {canComplete && (
                  <Button
                    size="sm"
                    onClick={() => onActionRequest(apt, "COMPLETED")}
                    className="h-8 px-2.5 text-xs bg-success text-success-foreground hover:bg-success/90 gap-1"
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>{t("appointments.completeAppointment")}</span>
                  </Button>
                )}

                {canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onActionRequest(apt, "CANCELLED")}
                    className="h-8 px-2.5 text-xs text-destructive border-destructive/20 hover:bg-destructive/10 gap-1"
                  >
                    <XCircle className="size-3.5" />
                    <span>{t("common.cancel")}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


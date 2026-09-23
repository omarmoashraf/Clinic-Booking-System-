"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ChevronRight,
  FileText,
  Stethoscope,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { canCancelAppointment } from "@/features/appointments/utils/appointment-helpers";
import { useTranslation } from "@/hooks/use-i18n";
import type { Appointment } from "@/features/appointments/types";

export interface AppointmentsMobileListProps {
  appointments: Appointment[];
  onCancelRequest: (appointment: Appointment) => void;
}

export function AppointmentsMobileList({
  appointments,
  onCancelRequest,
}: AppointmentsMobileListProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3.5">
      {appointments.map((apt) => {
        const { doctor, availability, status, notes } = apt;
        const canCancel = canCancelAppointment(apt);

        const initials = doctor.fullName
          ? doctor.fullName
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()
          : "DR";

        return (
          <div
            key={apt.id}
            className="p-4 rounded-xl border border-border bg-card shadow-subtle space-y-3 text-start"
          >
            {/* Header: Doctor & Status */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20"
                  aria-hidden="true"
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate">
                    {doctor.fullName}
                  </h3>
                  {doctor.specialty?.name ? (
                    <Badge
                      variant="secondary"
                      className="mt-0.5 text-[11px] font-normal px-1.5 py-0 inline-flex items-center gap-1"
                    >
                      <Stethoscope className="size-2.5" />
                      <span className="truncate">{doctor.specialty.name}</span>
                    </Badge>
                  ) : (
                    <span className="text-[11px] text-muted-foreground block">
                      {t("doctors.generalPractitioner")}
                    </span>
                  )}
                </div>
              </div>

              <StatusBadge status={status} />
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground py-1 border-y border-border/50">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary shrink-0" />
                <span>{availability.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5 text-secondary-foreground shrink-0" />
                <span>
                  {availability.startTime} – {availability.endTime}
                </span>
              </div>
            </div>

            {/* Notes Excerpt (if any) */}
            {notes && (
              <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
                <FileText className="size-3.5 shrink-0 mt-0.5" />
                <span className="line-clamp-2">{notes}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <Link
                href={`/patient/appointments/${apt.id}`}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "text-xs gap-1.5 flex-1",
                })}
              >
                <span>{t("appointments.viewDetails")}</span>
                <DirectionalIcon icon={ChevronRight} className="size-3.5" />
              </Link>

              {canCancel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancelRequest(apt)}
                  className="text-xs text-destructive border-destructive/20 hover:bg-destructive/10 gap-1.5"
                >
                  <XCircle className="size-3.5" />
                  <span>{t("appointments.actionCancel")}</span>
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}


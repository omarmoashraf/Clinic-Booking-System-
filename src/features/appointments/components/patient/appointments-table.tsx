"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ChevronRight,
  Stethoscope,
  XCircle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { canCancelAppointment } from "@/features/appointments/utils/appointment-helpers";
import { useTranslation } from "@/hooks/use-i18n";
import type { Appointment } from "@/features/appointments/types";

export interface AppointmentsTableProps {
  appointments: Appointment[];
  onCancelRequest: (appointment: Appointment) => void;
}

export function AppointmentsTable({
  appointments,
  onCancelRequest,
}: AppointmentsTableProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-border bg-card shadow-subtle overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent bg-muted/40">
            <TableHead className="w-64 text-start font-semibold">
              {t("appointments.doctor")}
            </TableHead>
            <TableHead className="w-56 text-start font-semibold">
              {t("appointments.dateTime")}
            </TableHead>
            <TableHead className="w-32 text-start font-semibold">
              {t("appointments.status")}
            </TableHead>
            <TableHead className="text-start font-semibold hidden lg:table-cell">
              {t("appointments.notes")}
            </TableHead>
            <TableHead className="w-48 text-end font-semibold">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
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
              <TableRow key={apt.id} className="transition-colors group">
                {/* Doctor Column */}
                <TableCell className="text-start py-3.5">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20"
                      aria-hidden="true"
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-sm text-foreground block truncate">
                        {doctor.fullName}
                      </span>
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
                </TableCell>

                {/* Date & Time Column */}
                <TableCell className="text-start py-3.5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                      <Calendar className="size-3 text-muted-foreground shrink-0" />
                      <span>{availability.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Clock className="size-3 shrink-0" />
                      <span>
                        {availability.startTime} – {availability.endTime}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Status Column */}
                <TableCell className="text-start py-3.5">
                  <StatusBadge status={status} />
                </TableCell>

                {/* Notes Column */}
                <TableCell className="text-start py-3.5 hidden lg:table-cell">
                  {notes ? (
                    <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                      {notes}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                  )}
                </TableCell>

                {/* Actions Column */}
                <TableCell className="text-end py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/patient/appointments/${apt.id}`}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                        className: "h-8 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground",
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
                        className="h-8 px-2 text-xs text-destructive border-destructive/20 hover:bg-destructive/10 gap-1"
                      >
                        <XCircle className="size-3.5" />
                        <span>{t("appointments.actionCancel")}</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}


"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle,
  CheckCircle2,
  ChevronRight,
  User,
  XCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-i18n";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Appointment } from "@/features/appointments/types";
import type { DoctorStatusAction } from "@/features/doctors/components/dashboard/doctor-status-dialog";
import {
  canDoctorCancelAppointment,
  canDoctorCompleteAppointment,
  canDoctorConfirmAppointment,
} from "@/features/appointments/utils/appointment-helpers";

export interface DoctorAppointmentsTableProps {
  appointments: Appointment[];
  onActionRequest: (appointment: Appointment, action: DoctorStatusAction) => void;
}

export function DoctorAppointmentsTable({
  appointments,
  onActionRequest,
}: DoctorAppointmentsTableProps) {
  const { t } = useTranslation();

  return (
    <div className="hidden md:block rounded-xl border border-border bg-card shadow-subtle overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("appointments.patient")}</TableHead>
            <TableHead>{t("appointments.dateTime")}</TableHead>
            <TableHead>{t("appointments.status")}</TableHead>
            <TableHead>{t("appointments.notes")}</TableHead>
            <TableHead className="text-end">
              <span className="sr-only">{t("common.actions")}</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((apt) => {
            const canConfirm = canDoctorConfirmAppointment(apt);
            const canComplete = canDoctorCompleteAppointment(apt);
            const canCancel = canDoctorCancelAppointment(apt);

            return (
              <TableRow key={apt.id} className="hover:bg-muted/40 transition-colors">
                {/* Patient Name */}
                <TableCell className="font-semibold text-foreground text-start">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <User className="size-4" />
                    </div>
                    <span className="truncate max-w-[180px]">{apt.patient.fullName}</span>
                  </div>
                </TableCell>

                {/* Date & Time */}
                <TableCell className="text-muted-foreground whitespace-nowrap text-start">
                  <span className="font-medium text-foreground block">
                    {apt.availability.date}
                  </span>
                  <span className="text-xs text-muted-foreground/80 block mt-0.5">
                    {apt.availability.startTime} – {apt.availability.endTime}
                  </span>
                </TableCell>

                {/* Status Badge */}
                <TableCell className="text-start">
                  <StatusBadge status={apt.status} />
                </TableCell>

                {/* Notes */}
                <TableCell className="text-xs text-muted-foreground text-start max-w-[200px] truncate">
                  {apt.notes || "—"}
                </TableCell>

                {/* Action Buttons & Details Link */}
                <TableCell className="text-end whitespace-nowrap">
                  <div className="flex items-center justify-end gap-1.5">
                    {canConfirm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onActionRequest(apt, "CONFIRMED")}
                        className="h-8 px-2.5 text-xs text-primary border-primary/20 hover:bg-primary/10 gap-1"
                        title={t("appointments.confirmAppointment")}
                      >
                        <CheckCircle className="size-3.5" />
                        <span>{t("appointments.confirmAppointment")}</span>
                      </Button>
                    )}

                    {canComplete && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onActionRequest(apt, "COMPLETED")}
                        className="h-8 px-2.5 text-xs text-success border-success/20 hover:bg-success/10 gap-1"
                        title={t("appointments.completeAppointment")}
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>{t("appointments.completeAppointment")}</span>
                      </Button>
                    )}

                    {canCancel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onActionRequest(apt, "CANCELLED")}
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title={t("appointments.cancelAppointment")}
                      >
                        <XCircle className="size-3.5" />
                        <span className="sr-only">{t("appointments.cancelAppointment")}</span>
                      </Button>
                    )}

                    <Link
                      href={`/doctor/appointments/${apt.id}`}
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                        className: "h-8 px-2 text-xs text-primary gap-1",
                      })}
                      title={t("appointments.viewDetails")}
                    >
                      <span className="hidden lg:inline">{t("appointments.viewDetails")}</span>
                      <DirectionalIcon icon={ChevronRight} mirror={true} className="size-3.5" />
                    </Link>
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


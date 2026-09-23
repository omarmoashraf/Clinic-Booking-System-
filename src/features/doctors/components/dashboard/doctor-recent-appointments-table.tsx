"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  CheckCircle2,
  Clock,
  User,
  XCircle,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-i18n";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import type { Appointment } from "@/features/appointments/types";
import type { DoctorStatusAction } from "./doctor-status-dialog";

export interface DoctorRecentAppointmentsTableProps {
  appointments: Appointment[];
  onActionRequest: (appointment: Appointment, action: DoctorStatusAction) => void;
}

export function DoctorRecentAppointmentsTable({
  appointments,
  onActionRequest,
}: DoctorRecentAppointmentsTableProps) {
  const { t } = useTranslation();

  // Show the latest 5 appointments
  const displayedAppointments = React.useMemo(
    () => appointments.slice(0, 5),
    [appointments]
  );

  return (
    <div className="p-6 rounded-xl border border-border bg-card shadow-subtle space-y-4">
      {/* Header with View All Link */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-border">
        <h2 className="text-base font-semibold text-foreground text-start">
          {t("doctors.recentAppointments")}
        </h2>
        {appointments.length > 0 && (
          <Link
            href="/doctor/appointments"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "gap-1.5 text-xs text-primary",
            })}
          >
            <span>{t("doctors.viewAllAppointments")}</span>
            <DirectionalIcon icon={ArrowRight} className="size-3.5" />
          </Link>
        )}
      </div>

      {displayedAppointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={t("doctors.noRecentAppointments")}
          description={t("doctors.noRecentAppointmentsDesc")}
          className="py-10"
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
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
                {displayedAppointments.map((apt) => {
                  const isPending = apt.status === "PENDING";
                  const isConfirmed = apt.status === "CONFIRMED";

                  return (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          <User className="size-3.5 text-muted-foreground shrink-0" />
                          <span>{apt.patient.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        <span>{apt.availability.date}</span>
                        <span className="text-xs text-muted-foreground/80 block">
                          {apt.availability.startTime} – {apt.availability.endTime}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={apt.status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {apt.notes || "—"}
                      </TableCell>
                      <TableCell className="text-end whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
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

                          {isConfirmed && (
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

                          {(isPending || isConfirmed) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onActionRequest(apt, "CANCELLED")}
                              className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title={t("appointments.cancelAppointment")}
                            >
                              <XCircle className="size-3.5" />
                              <span className="sr-only">
                                {t("appointments.cancelAppointment")}
                              </span>
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

          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {displayedAppointments.map((apt) => {
              const isPending = apt.status === "PENDING";
              const isConfirmed = apt.status === "CONFIRMED";

              return (
                <div
                  key={apt.id}
                  className="p-4 rounded-lg border border-border bg-card/60 space-y-3 text-start"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {apt.patient.fullName}
                    </span>
                    <StatusBadge status={apt.status} />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3.5 shrink-0" />
                    <span>
                      {apt.availability.date} ({apt.availability.startTime} –{" "}
                      {apt.availability.endTime})
                    </span>
                  </div>

                  {apt.notes && (
                    <p className="text-xs text-muted-foreground italic border-s-2 border-primary/30 ps-2">
                      {apt.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
                    {isPending && (
                      <Button
                        size="sm"
                        onClick={() => onActionRequest(apt, "CONFIRMED")}
                        className="h-8 px-2.5 text-xs gap-1"
                      >
                        <CheckCircle className="size-3.5" />
                        <span>{t("appointments.confirmAppointment")}</span>
                      </Button>
                    )}

                    {isConfirmed && (
                      <Button
                        size="sm"
                        onClick={() => onActionRequest(apt, "COMPLETED")}
                        className="h-8 px-2.5 text-xs bg-success text-success-foreground hover:bg-success/90 gap-1"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>{t("appointments.completeAppointment")}</span>
                      </Button>
                    )}

                    {(isPending || isConfirmed) && (
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
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}


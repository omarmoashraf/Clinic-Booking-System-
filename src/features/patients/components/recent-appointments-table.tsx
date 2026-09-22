"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, XCircle } from "lucide-react";
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

export interface RecentAppointmentsTableProps {
  appointments: Appointment[];
  onCancelRequest: (appointment: Appointment) => void;
}

export function RecentAppointmentsTable({
  appointments,
  onCancelRequest,
}: RecentAppointmentsTableProps) {
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
          {t("patients.recentAppointments")}
        </h2>
        {appointments.length > 0 && (
          <Link
            href="/patient/appointments"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "gap-1.5 text-xs text-primary",
            })}
          >
            <span>{t("patients.viewAllAppointments")}</span>
            <DirectionalIcon icon={ArrowRight} className="size-3.5" />
          </Link>
        )}
      </div>

      {displayedAppointments.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={t("patients.noRecentAppointments")}
          description={t("patients.noRecentAppointmentsDesc")}
          className="py-10"
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("appointments.doctor")}</TableHead>
                  <TableHead>{t("appointments.specialty")}</TableHead>
                  <TableHead>{t("appointments.dateTime")}</TableHead>
                  <TableHead>{t("appointments.status")}</TableHead>
                  <TableHead className="text-end">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedAppointments.map((apt) => {
                  const canCancel =
                    apt.status === "PENDING" || apt.status === "CONFIRMED";
                  return (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium text-foreground">
                        {apt.doctor.fullName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {apt.doctor.specialty.name}
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
                      <TableCell className="text-end">
                        {canCancel ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCancelRequest(apt)}
                            className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {t("patients.actionCancel")}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-3">
            {displayedAppointments.map((apt) => {
              const canCancel =
                apt.status === "PENDING" || apt.status === "CONFIRMED";
              return (
                <div
                  key={apt.id}
                  className="p-4 rounded-lg border border-border/80 bg-muted/20 space-y-3 text-start"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm text-foreground">
                        {apt.doctor.fullName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {apt.doctor.specialty.name}
                      </p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>

                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>
                      <span className="font-medium text-foreground me-1">
                        {t("patients.appointmentDate")}:
                      </span>
                      {apt.availability.date}
                    </p>
                    <p>
                      <span className="font-medium text-foreground me-1">
                        {t("patients.appointmentTime")}:
                      </span>
                      {apt.availability.startTime} – {apt.availability.endTime}
                    </p>
                  </div>

                  {canCancel && (
                    <div className="pt-2 border-t border-border/60 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCancelRequest(apt)}
                        className="text-xs text-destructive border-destructive/20 hover:bg-destructive/10 gap-1"
                      >
                        <XCircle className="size-3.5" />
                        <span>{t("patients.actionCancel")}</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}


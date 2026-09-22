"use client";

import * as React from "react";
import { CalendarCheck, CheckCircle2, Clock } from "lucide-react";
import { useTranslation } from "@/hooks/use-i18n";
import type { Appointment } from "@/features/appointments/types";
import { getPatientAppointmentMetrics } from "../utils/dashboard-helpers";

export interface PatientStatsProps {
  appointments: Appointment[];
  totalCount: number;
}

export function PatientStats({ appointments, totalCount }: PatientStatsProps) {
  const { t } = useTranslation();

  const { activeCount, completedCount, totalBookings } = React.useMemo(
    () => getPatientAppointmentMetrics(appointments, totalCount),
    [appointments, totalCount]
  );

  const stats = [
    {
      id: "active",
      label: t("patients.activeAppointments"),
      value: activeCount,
      icon: CalendarCheck,
      iconBg: "bg-primary/10 text-primary",
    },
    {
      id: "completed",
      label: t("patients.completedAppointments"),
      value: completedCount,
      icon: CheckCircle2,
      iconBg: "bg-success-muted text-success-foreground",
    },
    {
      id: "total",
      label: t("patients.totalAppointments"),
      value: totalBookings,
      icon: Clock,
      iconBg: "bg-info-muted text-info-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="flex items-center gap-4 p-4 sm:p-5 rounded-xl border border-border bg-card shadow-subtle transition-colors"
          >
            <div
              className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg}`}
              aria-hidden="true"
            >
              <Icon className="size-6" />
            </div>
            <div className="min-w-0 flex-1 text-start">
              <p className="text-xs font-medium text-muted-foreground truncate">
                {stat.label}
              </p>
              <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import * as React from "react";
import { AlertCircle, Calendar, CalendarCheck, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/hooks/use-i18n";
import type { Appointment } from "@/features/appointments/types";
import { getDoctorAppointmentMetrics } from "../../utils/dashboard-helpers";

export interface DoctorStatsProps {
  appointments: Appointment[];
  totalCount: number;
}

export function DoctorStats({ appointments, totalCount }: DoctorStatsProps) {
  const { t } = useTranslation();

  const { pendingCount, confirmedCount, completedCount, totalSchedule } =
    React.useMemo(
      () => getDoctorAppointmentMetrics(appointments, totalCount),
      [appointments, totalCount]
    );

  const stats = [
    {
      id: "pending",
      label: t("doctors.pendingAttention"),
      value: pendingCount,
      icon: AlertCircle,
      iconBg:
        pendingCount > 0
          ? "bg-warning/15 text-warning-foreground"
          : "bg-muted text-muted-foreground",
    },
    {
      id: "confirmed",
      label: t("doctors.confirmedUpcoming"),
      value: confirmedCount,
      icon: CalendarCheck,
      iconBg: "bg-primary/10 text-primary",
    },
    {
      id: "completed",
      label: t("doctors.completedConsultations"),
      value: completedCount,
      icon: CheckCircle2,
      iconBg: "bg-success-muted text-success-foreground",
    },
    {
      id: "total",
      label: t("doctors.totalSchedule"),
      value: totalSchedule,
      icon: Calendar,
      iconBg: "bg-info-muted text-info-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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


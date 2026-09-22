"use client";

import * as React from "react";
import Link from "next/link";
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  FileText,
  ArrowRight,
  LayoutDashboard,
  Plus,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { useTranslation } from "@/hooks/use-i18n";
import type { Appointment } from "@/features/appointments/types";

export interface BookingSuccessViewProps {
  appointment: Appointment;
  onReset: () => void;
}

export function BookingSuccessView({
  appointment,
  onReset,
}: BookingSuccessViewProps) {
  const { t } = useTranslation();
  const { doctor, availability, status, notes, id } = appointment;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-200">
      {/* Success Banner */}
      <div className="text-center space-y-3">
        <div
          className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto ring-8 ring-primary/5"
          aria-hidden="true"
        >
          <CheckCircle className="size-8 stroke-[2.2]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          {t("appointments.bookingSuccessTitle")}
        </h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
          {t("appointments.bookingSuccessSubtitle")}
        </p>
      </div>

      {/* Confirmed Appointment Card */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-subtle space-y-5 text-start">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/80">
          <div>
            <span className="text-xs text-muted-foreground block font-mono">
              {t("appointments.appointmentRef")}: {id.slice(0, 8)}
            </span>
            <h3 className="text-lg font-bold text-foreground mt-0.5">
              {doctor.fullName}
            </h3>
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Specialty */}
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-muted/30 border border-border/60">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Stethoscope className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-muted-foreground block">
                {t("appointments.specialty")}
              </span>
              <span className="text-sm font-semibold text-foreground truncate block">
                {doctor.specialty?.name || t("doctors.generalPractitioner")}
              </span>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-muted/30 border border-border/60">
            <div className="size-9 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
              <Clock className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-muted-foreground block">
                {availability.date}
              </span>
              <span className="text-sm font-semibold text-foreground truncate block">
                {availability.startTime} – {availability.endTime}
              </span>
            </div>
          </div>

          {/* Clinic Location */}
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-muted/30 border border-border/60 sm:col-span-2">
            <div className="size-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0">
              <MapPin className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-muted-foreground block">
                {t("appointments.clinicLocation")}
              </span>
              <span className="text-sm font-semibold text-foreground block">
                {t("appointments.cairoClinic")}
              </span>
            </div>
          </div>
        </div>

        {/* Notes (if supplied) */}
        {notes && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-muted/20 border border-border/60 text-xs">
            <FileText className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-foreground me-1.5">
                {t("appointments.notes")}:
              </span>
              <span className="text-muted-foreground">{notes}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link
          href="/patient/appointments"
          className={buttonVariants({
            size: "default",
            className: "w-full sm:w-auto gap-2 shadow-subtle",
          })}
        >
          <Calendar className="size-4" />
          <span>{t("appointments.viewMyAppointments")}</span>
          <DirectionalIcon icon={ArrowRight} className="size-4 ms-1" />
        </Link>

        <Link
          href="/patient/dashboard"
          className={buttonVariants({
            variant: "outline",
            size: "default",
            className: "w-full sm:w-auto gap-2",
          })}
        >
          <LayoutDashboard className="size-4" />
          <span>{t("appointments.backToDashboard")}</span>
        </Link>

        <Button
          variant="ghost"
          size="default"
          onClick={onReset}
          className="w-full sm:w-auto gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-4" />
          <span>{t("appointments.bookAnother")}</span>
        </Button>
      </div>
    </div>
  );
}


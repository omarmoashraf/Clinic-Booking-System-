"use client";

import * as React from "react";
import { Stethoscope, Clock, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-i18n";
import type { Doctor } from "../types";
import { cn } from "@/lib/utils";

export interface DoctorProfileHeaderProps {
  doctor: Doctor;
  className?: string;
}

/**
 * Doctor Profile Summary Header
 * Conforms to DESIGN.md Section 12 (Healthcare-specific components).
 */
export function DoctorProfileHeader({
  doctor,
  className,
}: DoctorProfileHeaderProps) {
  const { t } = useTranslation();

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
      className={cn(
        "rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card flex flex-col md:flex-row items-start md:items-center gap-6",
        className
      )}
    >
      {/* Avatar Circle */}
      <div
        className="size-20 sm:size-24 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl sm:text-3xl shrink-0 border-2 border-primary/20 shadow-subtle"
        aria-hidden="true"
      >
        {initials}
      </div>

      {/* Doctor Info */}
      <div className="space-y-3 flex-1 min-w-0 text-start">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            {doctor.fullName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {doctor.specialty?.name ? (
              <Badge
                variant="secondary"
                className="text-xs sm:text-sm font-medium py-0.5 px-2.5 inline-flex items-center gap-1.5"
              >
                <Stethoscope className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{doctor.specialty.name}</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs sm:text-sm font-normal">
                {t("doctors.generalPractitioner")}
              </Badge>
            )}

            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-primary shrink-0" aria-hidden="true" />
              <span>{t("home.trustVerifiedDoctors")}</span>
            </span>
          </div>
        </div>

        {/* Bio */}
        {doctor.bio && (
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl pt-1">
            {doctor.bio}
          </p>
        )}

        {/* Clinic Timezone / Wall-clock Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
          <Clock className="size-3.5 text-primary shrink-0" aria-hidden="true" />
          <span>{t("doctors.clinicHoursNotice")}</span>
        </div>
      </div>
    </div>
  );
}


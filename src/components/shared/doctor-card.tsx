"use client";

import * as React from "react";
import Link from "next/link";
import { Stethoscope, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { useTranslation } from "@/hooks/use-i18n";
import type { Doctor } from "@/features/doctors/types";
import { cn } from "@/lib/utils";

export interface DoctorCardProps {
  doctor: Doctor;
  className?: string;
  basePath?: string;
}

/**
 * Doctor Card Component
 * Conforms to DESIGN.md Section 12 (Healthcare-specific components).
 */
export function DoctorCard({
  doctor,
  className,
  basePath = "/doctors",
}: DoctorCardProps) {
  const { t } = useTranslation();

  // Extract initials for fallback avatar
  const initials = doctor.fullName
    ? doctor.fullName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "DR";

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-subtle hover:shadow-card hover:border-primary/40 transition-all duration-200",
        className
      )}
    >
      <div>
        {/* Doctor Header: Avatar & Info */}
        <div className="flex items-start gap-3.5 mb-4">
          <div
            className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-base shrink-0 border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base text-foreground truncate tracking-tight">
              {doctor.fullName}
            </h3>
            {doctor.specialty?.name ? (
              <Badge
                variant="secondary"
                className="mt-1 text-xs font-normal bg-secondary/80 text-secondary-foreground border-transparent inline-flex items-center gap-1 max-w-full truncate"
              >
                <Stethoscope className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{doctor.specialty.name}</span>
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground mt-1 block">
                {t("doctors.generalPractitioner")}
              </span>
            )}
          </div>
        </div>

        {/* Bio Excerpt */}
        {doctor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {doctor.bio}
          </p>
        )}
      </div>

      {/* Card Actions */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 mt-auto">
        <Link
          href={`${basePath}/${doctor.id}`}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className: "w-full text-xs sm:text-sm flex items-center justify-center gap-1.5",
          })}
        >
          <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
          <span>{t("home.bookAppointment")}</span>
          <DirectionalIcon icon={ArrowRight} className="size-3.5 ms-1" />
        </Link>
      </div>
    </article>
  );
}

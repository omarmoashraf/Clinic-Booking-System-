"use client";

import * as React from "react";
import { Mail, Phone, Calendar, ShieldCheck, Info, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation, useLocale } from "@/hooks/use-i18n";
import type { UserProfile } from "@/types/auth";
import { getInitials } from "@/components/layout/doctor-nav-config";

export interface DoctorAccountCardProps {
  profile: UserProfile;
}

/**
 * Read-only account credentials card for the authenticated doctor.
 * Conforms to API_CONTRACT.md and DESIGN.md Section 15.
 */
export function DoctorAccountCard({ profile }: DoctorAccountCardProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const formattedJoinedDate = React.useMemo(() => {
    if (!profile.createdAt) return "";
    try {
      const d = new Date(profile.createdAt);
      return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(d);
    } catch {
      return profile.createdAt.slice(0, 10);
    }
  }, [profile.createdAt, locale]);

  const initials = getInitials(profile.fullName);

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-subtle space-y-6 text-start">
      {/* Header Profile Identity */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-border/60 pb-5">
        <div
          className="size-16 rounded-full bg-primary/10 text-primary border-2 border-primary/20 flex items-center justify-center font-bold text-xl shrink-0 shadow-subtle"
          aria-hidden="true"
        >
          {initials}
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              {profile.fullName}
            </h2>
            <Badge
              variant="outline"
              className="text-xs font-semibold border-primary/30 text-primary bg-primary/5 gap-1 py-0.5 px-2"
            >
              <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{t("doctors.doctorRoleBadge")}</span>
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {profile.doctor?.specialty?.name || t("doctors.generalPractitioner")}
          </p>
        </div>
      </div>

      {/* Account Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/60">
          <User className="size-4 text-primary shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t("doctors.fullName")}</p>
            <p className="text-sm font-semibold text-foreground truncate">
              {profile.fullName}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/60">
          <Mail className="size-4 text-primary shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t("doctors.email")}</p>
            <p className="text-sm font-semibold text-foreground truncate">
              {profile.email}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/60">
          <Phone className="size-4 text-primary shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t("doctors.phone")}</p>
            <p className="text-sm font-semibold text-foreground truncate" dir="ltr">
              {profile.phone || "—"}
            </p>
          </div>
        </div>

        {/* Member Since */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/60">
          <Calendar className="size-4 text-primary shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t("doctors.memberSince")}</p>
            <p className="text-sm font-semibold text-foreground truncate">
              {formattedJoinedDate || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Verification Notice */}
      <div className="flex items-start gap-2.5 rounded-lg border border-border/80 bg-muted/40 p-3 text-xs text-muted-foreground">
        <Info className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">
          {t("doctors.clinicalVerificationNotice")}
        </p>
      </div>
    </div>
  );
}


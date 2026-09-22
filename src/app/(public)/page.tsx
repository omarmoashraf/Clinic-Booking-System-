"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Award,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Lock,
  RotateCcw,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { DoctorCard } from "@/components/shared/doctor-card";
import { SpecialtyCard } from "@/components/shared/specialty-card";
import { EmptyState } from "@/components/shared/empty-state";
import { useDoctorsQuery } from "@/features/doctors/hooks/use-doctors";
import { useSpecialtiesQuery } from "@/features/specialties/hooks/use-specialties";
import { useTranslation } from "@/hooks/use-i18n";

export default function HomePage() {
  const { t } = useTranslation();

  // Fetch featured specialties (top 6)
  const {
    data: specialtiesData,
    isLoading: isSpecialtiesLoading,
    isError: isSpecialtiesError,
    refetch: refetchSpecialties,
  } = useSpecialtiesQuery({ limit: 6, page: 1 });

  // Fetch featured doctors (top 4)
  const {
    data: doctorsData,
    isLoading: isDoctorsLoading,
    isError: isDoctorsError,
    refetch: refetchDoctors,
  } = useDoctorsQuery({ limit: 4, page: 1 });

  const specialties = specialtiesData?.data ?? [];
  const doctors = doctorsData?.data ?? [];

  return (
    <div className="flex flex-col space-y-16 sm:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-card to-background border-b border-border/60 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="max-w-3xl space-y-6 text-start">
            <Badge
              variant="outline"
              className="px-3 py-1 text-xs font-medium bg-primary/5 text-primary border-primary/20 rounded-full inline-flex items-center gap-1.5"
            >
              <Activity className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{t("home.heroBadge")}</span>
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
              {t("home.heroTitle")}
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
              {t("home.heroDescription")}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/doctors"
                className={buttonVariants({
                  size: "lg",
                  className: "gap-2 font-medium",
                })}
              >
                <span>{t("home.findDoctors")}</span>
                <DirectionalIcon icon={ArrowRight} className="size-4" />
              </Link>
              <Link
                href="/specialties"
                className={buttonVariants({
                  size: "lg",
                  variant: "outline",
                })}
              >
                {t("home.exploreSpecialties")}
              </Link>
            </div>

            {/* Trust Metrics */}
            <div className="pt-8 border-t border-border/70 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="size-4 text-primary shrink-0" aria-hidden="true" />
                <span className="font-medium text-foreground">
                  {t("home.trustVerifiedDoctors")}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CalendarCheck className="size-4 text-primary shrink-0" aria-hidden="true" />
                <span className="font-medium text-foreground">
                  {t("home.trustInstantBooking")}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="size-4 text-primary shrink-0" aria-hidden="true" />
                <span className="font-medium text-foreground">
                  {t("home.trustRealTimeSlots")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 w-full" aria-labelledby="how-it-works-title">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
            {t("home.howItWorksBadge")}
          </Badge>
          <h2 id="how-it-works-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t("home.howItWorksTitle")}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {t("home.howItWorksSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-subtle flex flex-col items-start text-start space-y-3">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              <Stethoscope className="size-5" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-base text-foreground">
              {t("home.step1Title")}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("home.step1Desc")}
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-subtle flex flex-col items-start text-start space-y-3">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              <Clock className="size-5" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-base text-foreground">
              {t("home.step2Title")}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("home.step2Desc")}
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-subtle flex flex-col items-start text-start space-y-3">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              <CheckCircle2 className="size-5" aria-hidden="true" />
            </div>
            <h3 className="font-semibold text-base text-foreground">
              {t("home.step3Title")}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("home.step3Desc")}
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED SPECIALTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 w-full" aria-labelledby="specialties-title">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-2 text-start">
            <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
              {t("home.specialtiesBadge")}
            </Badge>
            <h2 id="specialties-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {t("home.specialtiesTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("home.specialtiesSubtitle")}
            </p>
          </div>
          <Link
            href="/specialties"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "gap-1.5 self-start sm:self-auto",
            })}
          >
            <span>{t("home.viewAllSpecialties")}</span>
            <DirectionalIcon icon={ArrowRight} className="size-4" />
          </Link>
        </div>

        {/* Loading State */}
        {isSpecialtiesLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-5 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-11 rounded-lg" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-3 w-20 pt-2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isSpecialtiesLoading && isSpecialtiesError && (
          <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5 text-center space-y-3 max-w-md mx-auto">
            <p className="text-sm text-destructive font-medium">
              {t("home.specialtiesLoadError")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchSpecialties()}
              className="gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              <span>{t("home.retry")}</span>
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isSpecialtiesLoading && !isSpecialtiesError && specialties.length === 0 && (
          <EmptyState
            icon={Activity}
            title={t("home.noSpecialtiesFound")}
          />
        )}

        {/* Success State */}
        {!isSpecialtiesLoading && !isSpecialtiesError && specialties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialties.map((specialty) => (
              <SpecialtyCard key={specialty.id} specialty={specialty} />
            ))}
          </div>
        )}
      </section>

      {/* 4. FEATURED DOCTORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 w-full" aria-labelledby="doctors-title">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-2 text-start">
            <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
              {t("home.doctorsBadge")}
            </Badge>
            <h2 id="doctors-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {t("home.doctorsTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("home.doctorsSubtitle")}
            </p>
          </div>
          <Link
            href="/doctors"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "gap-1.5 self-start sm:self-auto",
            })}
          >
            <span>{t("home.viewAllDoctors")}</span>
            <DirectionalIcon icon={ArrowRight} className="size-4" />
          </Link>
        </div>

        {/* Loading State */}
        {isDoctorsLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" aria-busy="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 rounded-xl border border-border bg-card space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-12 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-full pt-2" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isDoctorsLoading && isDoctorsError && (
          <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5 text-center space-y-3 max-w-md mx-auto">
            <p className="text-sm text-destructive font-medium">
              {t("home.doctorsLoadError")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchDoctors()}
              className="gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              <span>{t("home.retry")}</span>
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isDoctorsLoading && !isDoctorsError && doctors.length === 0 && (
          <EmptyState
            icon={Users}
            title={t("home.noDoctorsFound")}
          />
        )}

        {/* Success State */}
        {!isDoctorsLoading && !isDoctorsError && doctors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </section>

      {/* 5. WHY CHOOSE US / TRUST PILLARS */}
      <section className="bg-card border-y border-border/80 py-16" aria-labelledby="why-us-title">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
              {t("home.whyUsBadge")}
            </Badge>
            <h2 id="why-us-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {t("home.whyUsTitle")}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("home.whyUsSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-start text-start space-y-3">
              <div className="size-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Award className="size-5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">
                {t("home.feature1Title")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("home.feature1Desc")}
              </p>
            </div>

            <div className="flex flex-col items-start text-start space-y-3">
              <div className="size-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <CalendarCheck className="size-5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">
                {t("home.feature2Title")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("home.feature2Desc")}
              </p>
            </div>

            <div className="flex flex-col items-start text-start space-y-3">
              <div className="size-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Lock className="size-5" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">
                {t("home.feature3Title")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("home.feature3Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/85 text-primary-foreground p-8 sm:p-12 shadow-card flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-start max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t("home.ctaTitle")}
            </h2>
            <p className="text-primary-foreground/90 text-sm sm:text-base leading-relaxed">
              {t("home.ctaSubtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href="/register"
              className={buttonVariants({
                size: "lg",
                variant: "secondary",
                className: "font-semibold shadow-subtle",
              })}
            >
              {t("home.ctaButton")}
            </Link>
            <Link
              href="/doctors"
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className:
                  "border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground font-semibold",
              })}
            >
              {t("home.ctaSecondary")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

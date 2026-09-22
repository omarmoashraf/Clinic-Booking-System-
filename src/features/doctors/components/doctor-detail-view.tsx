"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChevronRight,
  RotateCcw,
  UserX,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { EmptyState } from "@/components/shared/empty-state";
import { DoctorProfileHeader } from "@/features/doctors/components/doctor-profile-header";
import { AvailabilitySlotCard } from "@/features/doctors/components/availability-slot-card";
import { DoctorDetailSkeleton } from "@/features/doctors/components/doctor-detail-skeleton";
import { useDoctorDetailQuery } from "@/features/doctors/hooks/use-doctor-detail";
import { useDoctorAvailabilityQuery } from "@/features/doctors/hooks/use-doctor-availability";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-i18n";
import type { AvailabilitySlot } from "@/features/availability/types";

export interface DoctorDetailViewProps {
  doctorId: string;
  basePath?: string;
  showBreadcrumb?: boolean;
}

export function DoctorDetailView({
  doctorId,
  basePath = "/doctors",
  showBreadcrumb = true,
}: DoctorDetailViewProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const isPatientPortal = basePath.startsWith("/patient");

  // Query doctor detail from GET /doctors/:id
  const {
    data: doctorResponse,
    isLoading: isDoctorLoading,
    isError: isDoctorError,
    error: doctorError,
    refetch: refetchDoctor,
  } = useDoctorDetailQuery(doctorId);

  // Query available slots from GET /doctors/:doctorId/availability
  const {
    data: availabilityResponse,
    isLoading: isAvailabilityLoading,
    isError: isAvailabilityError,
    refetch: refetchAvailability,
  } = useDoctorAvailabilityQuery(doctorId);

  const doctor = doctorResponse?.data;
  const slots = availabilityResponse?.data ?? [];

  // Group available slots by date for intuitive scanning
  const groupedSlots = React.useMemo(() => {
    const list = availabilityResponse?.data ?? [];
    const map = new Map<string, AvailabilitySlot[]>();
    for (const slot of list) {
      const existing = map.get(slot.date) ?? [];
      existing.push(slot);
      map.set(slot.date, existing);
    }
    return map;
  }, [availabilityResponse?.data]);

  const handleBookSlot = (slot: AvailabilitySlot) => {
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(`${basePath}/${doctorId}`);
      router.push(`/login?redirect=${returnUrl}`);
      return;
    }

    if (user?.role === "PATIENT") {
      router.push(
        `/patient/appointments/new?doctorId=${doctorId}&slotId=${slot.id}&date=${slot.date}`
      );
    } else {
      alert("Only patient accounts can book appointments.");
    }
  };

  const containerClasses = isPatientPortal
    ? "w-full space-y-8"
    : "max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 w-full space-y-10";

  // 1. Loading State
  if (isDoctorLoading) {
    return (
      <div className={containerClasses}>
        <div className="h-4 w-36 bg-muted rounded animate-pulse" />
        <DoctorDetailSkeleton />
      </div>
    );
  }

  // 2. Doctor Not Found / Error State
  if (isDoctorError || !doctor) {
    const is404 =
      (doctorError as { status?: number })?.status === 404 ||
      (doctorError as { statusCode?: number })?.statusCode === 404;

    return (
      <div className={containerClasses}>
        <EmptyState
          icon={UserX}
          title={is404 ? t("doctors.doctorNotFound") : t("doctors.loadDetailError")}
          description={is404 ? t("doctors.doctorNotFoundDesc") : undefined}
          action={
            <div className="flex items-center gap-3">
              {!is404 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchDoctor()}
                  className="gap-1.5"
                >
                  <RotateCcw className="size-3.5" />
                  <span>{t("home.retry")}</span>
                </Button>
              )}
              <Link href={basePath} className={buttonVariants({ size: "sm" })}>
                {t("doctors.backToDoctors")}
              </Link>
            </div>
          }
        />
      </div>
    );
  }

  // 3. Success View
  return (
    <div className={containerClasses}>
      {/* Breadcrumbs */}
      {showBreadcrumb && (
        <nav
          aria-label="Breadcrumbs"
          className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap"
        >
          <Link
            href={isPatientPortal ? "/patient/dashboard" : "/"}
            className="hover:text-foreground transition-colors"
          >
            {isPatientPortal ? t("nav.dashboard") : t("nav.home")}
          </Link>
          <DirectionalIcon icon={ChevronRight} className="size-3.5 opacity-60" />
          <Link href={basePath} className="hover:text-foreground transition-colors">
            {t("nav.doctors")}
          </Link>
          <DirectionalIcon icon={ChevronRight} className="size-3.5 opacity-60" />
          <span className="font-semibold text-foreground truncate max-w-48 sm:max-w-xs">
            {doctor.fullName}
          </span>
        </nav>
      )}

      {/* Doctor Summary Header */}
      <DoctorProfileHeader doctor={doctor} />

      {/* Real-time Availability Section */}
      <section
        className="space-y-6 text-start"
        aria-labelledby="availability-heading"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/70 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-xs bg-primary/5 text-primary border-primary/20"
              >
                <Clock className="size-3 shrink-0" aria-hidden="true" />
                <span>{t("home.trustRealTimeSlots")}</span>
              </Badge>
              {!isAvailabilityLoading && slots.length > 0 && (
                <span className="text-xs text-muted-foreground font-medium">
                  ({slots.length} {t("doctors.availableToday").toLowerCase()})
                </span>
              )}
            </div>
            <h2
              id="availability-heading"
              className="text-xl sm:text-2xl font-bold tracking-tight text-foreground"
            >
              {t("doctors.availabilityTitle")}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {t("doctors.availabilitySubtitle")}
            </p>
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-1.5 self-start sm:self-auto">
            <Sparkles
              className="size-3.5 text-primary shrink-0"
              aria-hidden="true"
            />
            <span>{t("home.trustInstantBooking")}</span>
          </div>
        </div>

        {/* Availability Loading */}
        {isAvailabilityLoading && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            aria-busy="true"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-border bg-card space-y-3"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            ))}
          </div>
        )}

        {/* Availability Error */}
        {!isAvailabilityLoading && isAvailabilityError && (
          <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5 text-center space-y-3 max-w-md mx-auto">
            <div className="flex items-center justify-center text-destructive">
              <AlertCircle className="size-5" />
            </div>
            <p className="text-sm font-medium text-destructive">
              {t("doctors.loadAvailabilityError")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchAvailability()}
              className="gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              <span>{t("home.retry")}</span>
            </Button>
          </div>
        )}

        {/* Availability Empty */}
        {!isAvailabilityLoading && !isAvailabilityError && slots.length === 0 && (
          <EmptyState
            icon={Calendar}
            title={t("doctors.noSlotsAvailable")}
            description={t("doctors.noSlotsDesc")}
          />
        )}

        {/* Availability Slots Grouped by Date */}
        {!isAvailabilityLoading && !isAvailabilityError && slots.length > 0 && (
          <div className="space-y-6">
            {Array.from(groupedSlots.entries()).map(([date, dateSlots]) => (
              <div key={date} className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Calendar
                    className="size-4 text-primary shrink-0"
                    aria-hidden="true"
                  />
                  <span>{date}</span>
                  <Badge variant="secondary" className="text-[11px] font-normal">
                    {dateSlots.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {dateSlots.map((slot) => (
                    <AvailabilitySlotCard
                      key={slot.id}
                      slot={slot}
                      onBookSlot={handleBookSlot}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}


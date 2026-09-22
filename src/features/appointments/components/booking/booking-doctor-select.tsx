"use client";

import * as React from "react";
import { Search, Stethoscope, UserCheck, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { DoctorGridSkeleton } from "@/features/doctors/components/doctor-grid-skeleton";
import { useDoctorsQuery } from "@/features/doctors/hooks/use-doctors";
import { useTranslation } from "@/hooks/use-i18n";
import type { Doctor } from "@/features/doctors/types";

export interface BookingDoctorSelectProps {
  selectedDoctor: Doctor | null;
  onSelectDoctor: (doctor: Doctor) => void;
  onChangeDoctor: () => void;
}

export function BookingDoctorSelect({
  selectedDoctor,
  onSelectDoctor,
  onChangeDoctor,
}: BookingDoctorSelectProps) {
  const { t } = useTranslation();
  const [searchName, setSearchName] = React.useState("");

  const { data: doctorsData, isLoading, isError, refetch } = useDoctorsQuery({
    limit: 50,
  });

  const filteredDoctors = React.useMemo(() => {
    const list = doctorsData?.data ?? [];
    const trimmed = searchName.trim().toLowerCase();
    if (!trimmed) return list;
    return list.filter(
      (doc) =>
        doc.fullName.toLowerCase().includes(trimmed) ||
        doc.specialty?.name?.toLowerCase().includes(trimmed)
    );
  }, [doctorsData?.data, searchName]);

  // If a doctor is already chosen, display compact summary card
  if (selectedDoctor) {
    const initials = selectedDoctor.fullName
      ? selectedDoctor.fullName
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "DR";

    return (
      <div className="p-5 rounded-xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div
            className="size-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shrink-0 shadow-subtle"
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className="min-w-0 text-start">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary block">
              {t("appointments.selectedDoctor")}
            </span>
            <h3 className="font-bold text-lg text-foreground truncate mt-0.5">
              {selectedDoctor.fullName}
            </h3>
            {selectedDoctor.specialty?.name && (
              <Badge
                variant="secondary"
                className="mt-1 text-xs font-normal inline-flex items-center gap-1"
              >
                <Stethoscope className="size-3" aria-hidden="true" />
                <span>{selectedDoctor.specialty.name}</span>
              </Badge>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onChangeDoctor}
          className="self-start sm:self-auto shrink-0 text-xs gap-1.5"
        >
          <UserCheck className="size-3.5" />
          <span>{t("appointments.changeDoctor")}</span>
        </Button>
      </div>
    );
  }

  // Doctor Selection Grid
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-start">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {t("appointments.selectDoctorPrompt")}
        </h2>
      </div>

      {/* Doctor Name Search */}
      <div className="relative max-w-md">
        <Search
          className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="text"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          placeholder={t("appointments.searchDoctorPlaceholder")}
          className="ps-9 pe-4 h-10 text-sm"
          aria-label={t("appointments.searchDoctorPlaceholder")}
        />
      </div>

      {/* Loading Skeleton */}
      {isLoading && <DoctorGridSkeleton count={6} />}

      {/* Error State */}
      {!isLoading && isError && (
        <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5 text-center space-y-3 max-w-md mx-auto">
          <p className="text-sm font-medium text-destructive">
            {t("doctors.loadError")}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            {t("home.retry")}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredDoctors.length === 0 && (
        <EmptyState
          icon={Stethoscope}
          title={t("doctors.noDoctorsFound")}
          description={t("doctors.emptyFilterDesc")}
        />
      )}

      {/* Doctors Grid */}
      {!isLoading && !isError && filteredDoctors.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map((doc) => {
            const initials = doc.fullName
              ? doc.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "DR";

            return (
              <div
                key={doc.id}
                className="p-5 rounded-xl border border-border bg-card shadow-subtle hover:border-primary/40 hover:shadow-card transition-all flex flex-col justify-between text-start gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0 border border-primary/20"
                    aria-hidden="true"
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base text-foreground truncate">
                      {doc.fullName}
                    </h3>
                    {doc.specialty?.name ? (
                      <Badge
                        variant="secondary"
                        className="mt-1 text-xs font-normal"
                      >
                        {doc.specialty.name}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground mt-1 block">
                        {t("doctors.generalPractitioner")}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => onSelectDoctor(doc)}
                  className="w-full text-xs gap-1.5 mt-2"
                  size="sm"
                >
                  <span>{t("appointments.chooseThisDoctor")}</span>
                  <DirectionalIcon icon={ArrowRight} className="size-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

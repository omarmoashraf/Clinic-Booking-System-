"use client";

import * as React from "react";
import {
  Calendar,
  Clock,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { useDoctorAvailabilityQuery } from "@/features/doctors/hooks/use-doctor-availability";
import { useTranslation } from "@/hooks/use-i18n";
import type { AvailabilitySlot } from "@/features/availability/types";
import { cn } from "@/lib/utils";

export interface BookingSlotSelectProps {
  doctorId: string;
  selectedSlot: AvailabilitySlot | null;
  onSelectSlot: (slot: AvailabilitySlot) => void;
  onBack: () => void;
}

export function BookingSlotSelect({
  doctorId,
  selectedSlot,
  onSelectSlot,
  onBack,
}: BookingSlotSelectProps) {
  const { t } = useTranslation();

  const {
    data: availabilityData,
    isLoading,
    isError,
    refetch,
  } = useDoctorAvailabilityQuery(doctorId);

  const totalSlots = availabilityData?.data?.length ?? 0;

  // Group slots by date
  const groupedSlots = React.useMemo(() => {
    const list = availabilityData?.data ?? [];
    const map = new Map<string, AvailabilitySlot[]>();
    for (const slot of list) {
      const existing = map.get(slot.date) ?? [];
      existing.push(slot);
      map.set(slot.date, existing);
    }
    return map;
  }, [availabilityData?.data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t("appointments.chooseSlotPrompt")}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("appointments.cairoClinic")}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="self-start sm:self-auto text-xs gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <DirectionalIcon icon={ArrowLeft} mirror={true} className="size-3.5" />
          <span>{t("appointments.changeDoctor")}</span>
        </Button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl border border-border bg-card space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-full rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5 text-center space-y-3 max-w-md mx-auto">
          <p className="text-sm font-medium text-destructive">
            {t("doctors.loadAvailabilityError")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5"
          >
            <RotateCcw className="size-3.5" />
            <span>{t("home.retry")}</span>
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && totalSlots === 0 && (
        <EmptyState
          icon={Calendar}
          title={t("appointments.noSlotsForDoctor")}
          description={t("doctors.noSlotsDesc")}
          action={
            <Button variant="outline" size="sm" onClick={onBack}>
              {t("appointments.changeDoctor")}
            </Button>
          }
        />
      )}

      {/* Grouped Slots View */}
      {!isLoading && !isError && totalSlots > 0 && (
        <div className="space-y-6">
          {Array.from(groupedSlots.entries()).map(([date, dateSlots]) => (
            <div key={date} className="space-y-3 text-start">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Calendar className="size-4 text-primary shrink-0" aria-hidden="true" />
                <span>{date}</span>
                <Badge variant="secondary" className="text-[11px] font-normal">
                  {dateSlots.length}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {dateSlots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => onSelectSlot(slot)}
                      className={cn(
                        "p-4 rounded-xl border text-start transition-all flex items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        isSelected
                          ? "border-primary bg-primary/10 shadow-card ring-2 ring-primary/20"
                          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30 shadow-subtle"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Clock
                          className={cn(
                            "size-4 shrink-0 transition-colors",
                            isSelected ? "text-primary" : "text-muted-foreground"
                          )}
                          aria-hidden="true"
                        />
                        <span
                          className={cn(
                            "text-sm font-semibold truncate",
                            isSelected ? "text-primary" : "text-foreground"
                          )}
                        >
                          {slot.startTime} – {slot.endTime}
                        </span>
                      </div>

                      {isSelected && (
                        <CheckCircle2
                          className="size-4 text-primary shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation, useLocale } from "@/hooks/use-i18n";
import type { AvailabilitySlot } from "../types";
import { DoctorAvailabilitySlotItem } from "./doctor-availability-slot-item";

export interface DoctorAvailabilityGroupProps {
  date: string;
  slots: AvailabilitySlot[];
  onDeleteClick: (slot: AvailabilitySlot) => void;
  deletingSlotId?: string | null;
}

/**
 * Renders a group of slots for a single date under a formatted date header.
 */
export function DoctorAvailabilityGroup({
  date,
  slots,
  onDeleteClick,
  deletingSlotId,
}: DoctorAvailabilityGroupProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();

  const formattedDate = React.useMemo(() => {
    try {
      const d = new Date(`${date}T00:00:00Z`);
      return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(d);
    } catch {
      return date;
    }
  }, [date, locale]);

  return (
    <div className="space-y-3 text-start">
      {/* Date Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-primary shrink-0" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            {formattedDate}
          </h3>
        </div>

        <Badge variant="secondary" className="text-xs font-medium">
          {t("doctors.slotsOnDateCount", { count: slots.length })}
        </Badge>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {slots.map((slot) => (
          <DoctorAvailabilitySlotItem
            key={slot.id}
            slot={slot}
            onDeleteClick={onDeleteClick}
            isDeleting={deletingSlotId === slot.id}
          />
        ))}
      </div>
    </div>
  );
}


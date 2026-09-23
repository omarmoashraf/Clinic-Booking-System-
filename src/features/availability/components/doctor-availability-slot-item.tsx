"use client";

import * as React from "react";
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-i18n";
import type { AvailabilitySlot } from "../types";
import { calculateDurationMinutes } from "../utils/availability-helpers";

export interface DoctorAvailabilitySlotItemProps {
  slot: AvailabilitySlot;
  onDeleteClick: (slot: AvailabilitySlot) => void;
  isDeleting?: boolean;
}

/**
 * Individual slot card for Doctor Availability list
 * Displays time range, computed duration, available badge, and delete trigger.
 */
export function DoctorAvailabilitySlotItem({
  slot,
  onDeleteClick,
  isDeleting,
}: DoctorAvailabilitySlotItemProps) {
  const { t } = useTranslation();
  const duration = calculateDurationMinutes(slot.startTime, slot.endTime);

  return (
    <div className="flex items-center justify-between gap-3 p-3.5 rounded-lg border border-border/80 bg-card hover:border-primary/40 hover:shadow-subtle transition-all duration-150 text-start">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-9 rounded-lg bg-primary/10 text-primary shrink-0">
          <Clock className="size-4" aria-hidden="true" />
        </div>

        <div className="space-y-0.5">
          <div className="text-sm font-semibold text-foreground tracking-tight">
            <span dir="ltr">
              {slot.startTime} – {slot.endTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {t("doctors.minutes", { minutes: duration })}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] py-0 px-1.5 font-normal border-success/30 text-success bg-success/5"
            >
              {t("status.available")}
            </Badge>
          </div>
        </div>
      </div>

      <div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onDeleteClick(slot)}
          disabled={isDeleting}
          className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          aria-label={t("doctors.deleteSlot")}
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}


"use client";

import * as React from "react";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { useTranslation } from "@/hooks/use-i18n";
import type { AvailabilitySlot } from "../../availability/types";
import { cn } from "@/lib/utils";

export interface AvailabilitySlotCardProps {
  slot: AvailabilitySlot;
  onBookSlot?: (slot: AvailabilitySlot) => void;
  className?: string;
}

/**
 * Card representing a single available appointment slot
 * Conforms to DESIGN.md Section 12 (Healthcare-specific components).
 */
export function AvailabilitySlotCard({
  slot,
  onBookSlot,
  className,
}: AvailabilitySlotCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-subtle hover:shadow-card hover:border-primary/40 transition-all duration-200 flex flex-col justify-between gap-3 text-start",
        className
      )}
    >
      <div className="space-y-1.5">
        {/* Date Indicator */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <Calendar className="size-3.5 text-primary shrink-0" aria-hidden="true" />
          <span>{slot.date}</span>
        </div>

        {/* Time Interval */}
        <div className="flex items-center gap-1.5 text-base font-semibold text-foreground tracking-tight">
          <Clock className="size-4 text-primary shrink-0" aria-hidden="true" />
          <span dir="ltr">
            {slot.startTime} – {slot.endTime}
          </span>
        </div>
      </div>

      {/* Book Slot CTA */}
      <div className="pt-2 border-t border-border/50">
        <Button
          size="sm"
          onClick={() => onBookSlot?.(slot)}
          className="w-full gap-1.5 text-xs font-medium"
        >
          <span>{t("doctors.bookSlot")}</span>
          <DirectionalIcon icon={ArrowRight} className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}


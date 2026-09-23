"use client";

import * as React from "react";
import { Clock, Plus, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-i18n";

export interface DoctorAvailabilityHeaderProps {
  totalSlotsCount: number;
  onAddSlotClick: () => void;
  isFormOpen?: boolean;
}

/**
 * Operational header for Doctor Availability Management
 * Displays title, active slots count badge, clinic timezone notice, and Add Slot trigger.
 */
export function DoctorAvailabilityHeader({
  totalSlotsCount,
  onAddSlotClick,
  isFormOpen,
}: DoctorAvailabilityHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1 text-start">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t("doctors.availabilityManagementTitle")}
            </h1>
            <Badge variant="outline" className="font-semibold text-xs py-0.5 px-2">
              {t("doctors.activeSlotsCount", { count: totalSlotsCount })}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {t("doctors.availabilityManagementSubtitle")}
          </p>
        </div>

        <div className="shrink-0">
          <Button
            onClick={onAddSlotClick}
            variant={isFormOpen ? "outline" : "default"}
            className="gap-2 w-full sm:w-auto"
            aria-expanded={isFormOpen}
          >
            <Plus className="size-4 shrink-0" aria-hidden="true" />
            <span>{t("doctors.addSlot")}</span>
          </Button>
        </div>
      </div>

      {/* Cairo Timezone Notice Banner */}
      <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground text-start">
        <Globe className="size-4 text-primary shrink-0" aria-hidden="true" />
        <Clock className="size-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
        <span>{t("doctors.cairoTimezoneNotice")}</span>
      </div>
    </div>
  );
}


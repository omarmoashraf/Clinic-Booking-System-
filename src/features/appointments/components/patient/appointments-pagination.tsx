"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { useTranslation } from "@/hooks/use-i18n";

export interface AppointmentsPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
  disabled?: boolean;
}

export function AppointmentsPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
  disabled = false,
}: AppointmentsPaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Appointments Pagination"
      className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border text-xs text-muted-foreground"
    >
      <div>
        <span>
          {t("appointments.showing")} {t("appointments.page")} {page}{" "}
          {t("appointments.of")} {totalPages} ({totalItems} {t("appointments.title").toLowerCase()})
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
          className="h-8 gap-1 text-xs"
          aria-label={t("appointments.previous")}
        >
          <DirectionalIcon icon={ChevronLeft} mirror={true} className="size-3.5" />
          <span>{t("appointments.previous")}</span>
        </Button>

        <span className="px-2 font-medium text-foreground">
          {page} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= totalPages}
          className="h-8 gap-1 text-xs"
          aria-label={t("appointments.next")}
        >
          <span>{t("appointments.next")}</span>
          <DirectionalIcon icon={ChevronRight} mirror={true} className="size-3.5" />
        </Button>
      </div>
    </nav>
  );
}


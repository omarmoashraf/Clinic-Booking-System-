"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { useTranslation } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";

export interface DoctorPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Doctor Pagination Controls
 * Conforms to DESIGN.md Section 12 (Navigation).
 */
export function DoctorPagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  className,
}: DoctorPaginationProps) {
  const { t } = useTranslation();

  if (totalPages <= 1) {
    return null;
  }

  const canGoPrevious = page > 1 && !disabled;
  const canGoNext = page < totalPages && !disabled;

  return (
    <nav
      className={cn(
        "flex items-center justify-center gap-3 pt-6 border-t border-border/60",
        className
      )}
      aria-label="Pagination Navigation"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={!canGoPrevious}
        className="gap-1.5"
        aria-label={t("common.previous")}
      >
        <DirectionalIcon icon={ChevronLeft} className="size-4" />
        <span className="hidden sm:inline">{t("common.previous")}</span>
      </Button>

      <span className="text-sm font-medium text-muted-foreground px-3" aria-current="page">
        {t("common.page")} <span className="font-semibold text-foreground">{page}</span>{" "}
        {t("common.of")} <span className="font-semibold text-foreground">{totalPages}</span>
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={!canGoNext}
        className="gap-1.5"
        aria-label={t("common.next")}
      >
        <span className="hidden sm:inline">{t("common.next")}</span>
        <DirectionalIcon icon={ChevronRight} className="size-4" />
      </Button>
    </nav>
  );
}


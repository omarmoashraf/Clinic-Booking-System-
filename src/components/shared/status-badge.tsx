"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  APPOINTMENT_STATUS_TOKENS,
  type AppointmentStatusType,
} from "@/config/tokens";
import { I18nContext } from "@/providers/i18n-provider";
import type { Locale } from "@/lib/i18n/config";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: AppointmentStatusType;
  locale?: Locale;
}

export function StatusBadge({
  status,
  locale: propLocale,
  className,
  ...props
}: StatusBadgeProps) {
  const i18nContext = React.useContext(I18nContext);
  const activeLocale = propLocale ?? i18nContext?.locale ?? "en";

  const token = APPOINTMENT_STATUS_TOKENS[status] ?? APPOINTMENT_STATUS_TOKENS.PENDING;
  const label = activeLocale === "ar" ? token.labelAr : token.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        token.badgeClass,
        className
      )}
      {...props}
    >
      <span
        className={cn("size-1.5 rounded-full shrink-0", token.dotClass)}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}

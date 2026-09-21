"use client";

import * as React from "react";
import { Languages } from "lucide-react";
import { useLocale } from "@/hooks/use-i18n";
import { LOCALE_LABELS, type Locale } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface LanguageSwitcherProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  showLabel?: boolean;
}

/**
 * LanguageSwitcher component
 * Provides an accessible toggle button to switch between English and Arabic.
 */
export function LanguageSwitcher({
  className,
  variant = "outline",
  size = "sm",
  showLabel = true,
  ...props
}: LanguageSwitcherProps) {
  const { locale, setLocale } = useLocale();

  const nextLocale: Locale = locale === "en" ? "ar" : "en";
  const targetLabel = LOCALE_LABELS[nextLocale].nativeName;
  const ariaLabel =
    locale === "en"
      ? "Switch to Arabic language"
      : "التبديل إلى اللغة الإنجليزية";

  const handleToggle = () => {
    setLocale(nextLocale);
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleToggle}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        "inline-flex items-center gap-2 font-medium transition-colors",
        className
      )}
      {...props}
    >
      <Languages className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      {showLabel && (
        <span lang={nextLocale} dir={LOCALE_LABELS[nextLocale].dir}>
          {targetLabel}
        </span>
      )}
    </Button>
  );
}


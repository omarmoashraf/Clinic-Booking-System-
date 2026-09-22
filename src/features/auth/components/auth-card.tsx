"use client";

import * as React from "react";
import Link from "next/link";
import { Activity } from "lucide-react";
import { useTranslation } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";

export interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Reusable Auth Card container
 * Conforms to DESIGN.md Section 13 (Public & Auth Experience).
 */
export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  className,
}: AuthCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "w-full max-w-md mx-auto rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card space-y-6",
        className
      )}
    >
      {/* Brand & Heading */}
      <div className="text-center space-y-2.5">
        <Link
          href="/"
          className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 mx-auto"
          aria-label={t("common.appName")}
        >
          <Activity className="size-6" aria-hidden="true" />
        </Link>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Form Body */}
      <div>{children}</div>

      {/* Optional Card Footer */}
      {footer && (
        <div className="pt-4 border-t border-border/60 text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
}


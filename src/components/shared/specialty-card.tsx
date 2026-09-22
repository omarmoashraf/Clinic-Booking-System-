"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
  Smile,
  Stethoscope,
  ArrowRight,
} from "lucide-react";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { useTranslation } from "@/hooks/use-i18n";
import type { Specialty } from "@/features/specialties/types";
import { cn } from "@/lib/utils";

export interface SpecialtyCardProps {
  specialty: Specialty;
  className?: string;
}

/**
 * Returns a specialty-themed icon based on common medical names
 */
function renderSpecialtyIcon(name: string, className?: string) {
  const lower = name.toLowerCase();
  if (lower.includes("cardio") || lower.includes("heart")) return <Heart className={className} />;
  if (lower.includes("neuro") || lower.includes("brain")) return <Brain className={className} />;
  if (lower.includes("ophthalm") || lower.includes("eye")) return <Eye className={className} />;
  if (lower.includes("ortho") || lower.includes("bone")) return <Bone className={className} />;
  if (lower.includes("pediatr") || lower.includes("child")) return <Baby className={className} />;
  if (lower.includes("dent") || lower.includes("tooth")) return <Smile className={className} />;
  if (lower.includes("general") || lower.includes("internal")) return <Stethoscope className={className} />;
  return <Activity className={className} />;
}

/**
 * Specialty Card Component
 * Conforms to DESIGN.md Section 13 (Public Experience).
 */
export function SpecialtyCard({ specialty, className }: SpecialtyCardProps) {
  const { t } = useTranslation();

  return (
    <Link
      href={`/doctors?specialty=${encodeURIComponent(specialty.name)}`}
      className={cn(
        "group relative flex flex-col justify-between p-5 rounded-xl border border-border bg-card shadow-subtle hover:shadow-card hover:border-primary/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className
      )}
      aria-label={specialty.name}
    >
      <div className="flex items-center gap-3.5 mb-3">
        <div
          className="size-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200"
          aria-hidden="true"
        >
          {renderSpecialtyIcon(specialty.name, "size-5")}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate">
            {specialty.name}
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors pt-2 border-t border-border/50">
        <span>{t("home.findDoctors")}</span>
        <DirectionalIcon
          icon={ArrowRight}
          className="size-3.5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform duration-200"
        />
      </div>
    </Link>
  );
}

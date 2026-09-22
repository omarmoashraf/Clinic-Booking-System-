"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { useTranslation } from "@/hooks/use-i18n";
import { cn } from "@/lib/utils";

export type BookingStep = "doctor" | "slot" | "confirm" | "success";

export interface BookingStepperProps {
  currentStep: BookingStep;
  className?: string;
}

const STEPS: { key: BookingStep; labelKey: string }[] = [
  { key: "doctor", labelKey: "appointments.stepDoctor" },
  { key: "slot", labelKey: "appointments.stepDateSlot" },
  { key: "confirm", labelKey: "appointments.stepConfirm" },
  { key: "success", labelKey: "appointments.stepSuccess" },
];

export function BookingStepper({ currentStep, className }: BookingStepperProps) {
  const { t } = useTranslation();

  const stepIndexMap: Record<BookingStep, number> = {
    doctor: 0,
    slot: 1,
    confirm: 2,
    success: 3,
  };

  const currentIndex = stepIndexMap[currentStep];

  return (
    <nav
      aria-label="Booking Progress"
      className={cn("w-full py-4", className)}
    >
      <ol className="flex items-center justify-between w-full relative">
        {STEPS.map((step, index) => {
          const isCompleted = currentIndex > index;
          const isCurrent = currentIndex === index;

          return (
            <li
              key={step.key}
              aria-current={isCurrent ? "step" : undefined}
              className="flex-1 flex flex-col items-center relative text-center group"
            >
              {/* Connecting Line (before the node, except first) */}
              {index > 0 && (
                <div
                  className={cn(
                    "absolute top-4 end-1/2 w-full h-0.5 -z-10 transition-colors duration-300",
                    isCompleted || isCurrent
                      ? "bg-primary"
                      : "bg-border"
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Step Circle Indicator */}
              <div
                className={cn(
                  "size-8 sm:size-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-200 border-2 z-10",
                  isCompleted
                    ? "bg-primary text-primary-foreground border-primary"
                    : isCurrent
                    ? "bg-background text-primary border-primary ring-4 ring-primary/15"
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                {isCompleted ? (
                  <Check className="size-4 stroke-[2.5]" aria-hidden="true" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <span
                className={cn(
                  "mt-2 text-[11px] sm:text-xs font-medium max-w-20 sm:max-w-none truncate px-1 transition-colors",
                  isCurrent
                    ? "text-primary font-semibold"
                    : isCompleted
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {t(step.labelKey)}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}


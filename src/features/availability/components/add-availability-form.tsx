"use client";

import * as React from "react";
import { AlertCircle, Calendar, Clock, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "@/hooks/use-i18n";
import type { AvailabilitySlot } from "../types";
import {
  computeEndTime,
  findOverlappingSlot,
  getTodayCairoDate,
  validateTimeInterval,
} from "../utils/availability-helpers";
import { useCreateAvailabilityMutation } from "../hooks/use-create-availability";

export interface AddAvailabilityFormProps {
  existingSlots: AvailabilitySlot[];
  onSlotCreated?: (newSlot: AvailabilitySlot) => void;
  onCancel?: () => void;
  className?: string;
}

const DURATION_PRESETS = [30, 45, 60] as const;

/**
 * Accessible form component to create a new availability slot
 * Includes preset durations, real-time client overlap warnings, and API conflict handling.
 */
export function AddAvailabilityForm({
  existingSlots,
  onSlotCreated,
  onCancel,
  className,
}: AddAvailabilityFormProps) {
  const { t } = useTranslation();
  const todayCairo = React.useMemo(() => getTodayCairoDate(), []);

  const [date, setDate] = React.useState<string>(todayCairo);
  const [startTime, setStartTime] = React.useState<string>("09:00");
  const [endTime, setEndTime] = React.useState<string>("09:30");
  const [activePreset, setActivePreset] = React.useState<number | null>(30);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const createMutation = useCreateAvailabilityMutation();

  // Update endTime when preset or startTime changes
  const handlePresetSelect = (durationMinutes: number) => {
    setActivePreset(durationMinutes);
    if (startTime) {
      const computed = computeEndTime(startTime, durationMinutes);
      if (computed) setEndTime(computed);
    }
  };

  const handleStartTimeChange = (newStartTime: string) => {
    setStartTime(newStartTime);
    setServerError(null);
    if (activePreset && newStartTime) {
      const computed = computeEndTime(newStartTime, activePreset);
      if (computed) setEndTime(computed);
    }
  };

  const handleEndTimeChange = (newEndTime: string) => {
    setEndTime(newEndTime);
    setActivePreset(null); // Custom duration
    setServerError(null);
  };

  // Validation
  const intervalValidation = React.useMemo(
    () => validateTimeInterval(startTime, endTime),
    [startTime, endTime]
  );

  const isPastDate = Boolean(date && date < todayCairo);

  // Client-side overlap detection
  const overlappingSlot = React.useMemo(() => {
    if (!date || !startTime || !endTime || !intervalValidation.isValid) {
      return undefined;
    }
    return findOverlappingSlot(existingSlots, { date, startTime, endTime });
  }, [date, startTime, endTime, existingSlots, intervalValidation.isValid]);

  const isFormValid =
    Boolean(date) &&
    !isPastDate &&
    intervalValidation.isValid &&
    !createMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setServerError(null);

    try {
      const response = await createMutation.mutateAsync({
        date,
        startTime,
        endTime,
      });

      if (onSlotCreated && response.data) {
        onSlotCreated(response.data);
      }

      // Advance startTime by duration for quick contiguous slot creation
      if (activePreset && endTime) {
        setStartTime(endTime);
        const nextEnd = computeEndTime(endTime, activePreset);
        if (nextEnd) setEndTime(nextEnd);
      }
    } catch (err: unknown) {
      const httpErr = err as { status?: number; message?: string };
      if (httpErr.status === 409) {
        setServerError(t("doctors.slotOverlapError"));
      } else {
        setServerError(httpErr.message || t("doctors.loadAvailabilityError"));
      }
    }
  };

  return (
    <div
      className={`rounded-xl border border-border bg-card p-5 sm:p-6 shadow-card space-y-5 text-start ${
        className ?? ""
      }`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-3">
        <div className="space-y-0.5">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            {t("doctors.addSlotTitle")}
          </h2>
          <p className="text-xs text-muted-foreground">
            {t("doctors.addSlotDesc")}
          </p>
        </div>

        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            aria-label={t("common.cancel")}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date Selection */}
        <div className="space-y-1.5">
          <Label htmlFor="slot-date" className="text-xs font-medium">
            {t("doctors.slotDate")}
          </Label>
          <div className="relative">
            <Calendar
              className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <Input
              id="slot-date"
              type="date"
              min={todayCairo}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setServerError(null);
              }}
              className="ps-9 font-mono text-sm"
              required
            />
          </div>
          {isPastDate && (
            <p className="text-xs text-destructive font-medium">
              {t("doctors.pastDateError")}
            </p>
          )}
        </div>

        {/* Quick Duration Presets */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">{t("doctors.duration")}</Label>
          <div className="flex items-center gap-2 flex-wrap">
            {DURATION_PRESETS.map((duration) => {
              const isSelected = activePreset === duration;
              return (
                <Button
                  key={duration}
                  type="button"
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => handlePresetSelect(duration)}
                  className="text-xs font-medium h-8 px-3"
                >
                  {t("doctors.minutes", { minutes: duration })}
                </Button>
              );
            })}
            <Button
              type="button"
              size="sm"
              variant={activePreset === null ? "default" : "outline"}
              onClick={() => setActivePreset(null)}
              className="text-xs font-medium h-8 px-3"
            >
              {t("doctors.custom")}
            </Button>
          </div>
        </div>

        {/* Time Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Time */}
          <div className="space-y-1.5">
            <Label htmlFor="start-time" className="text-xs font-medium">
              {t("doctors.startTime")}
            </Label>
            <div className="relative">
              <Clock
                className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="ps-9 font-mono text-sm"
                required
              />
            </div>
          </div>

          {/* End Time */}
          <div className="space-y-1.5">
            <Label htmlFor="end-time" className="text-xs font-medium">
              {t("doctors.endTime")}
            </Label>
            <div className="relative">
              <Clock
                className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
                aria-hidden="true"
              />
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => handleEndTimeChange(e.target.value)}
                className="ps-9 font-mono text-sm"
                required
              />
            </div>
          </div>
        </div>

        {/* Client Time Interval Error */}
        {!intervalValidation.isValid && (
          <p className="text-xs text-destructive font-medium">
            {t("doctors.endTimeBeforeStartTime")}
          </p>
        )}

        {/* Client Overlap Warning Alert */}
        {overlappingSlot && (
          <Alert className="py-2.5 border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200">
            <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <AlertTitle className="text-xs font-semibold">
              {t("doctors.slotOverlapError")}
            </AlertTitle>
            <AlertDescription className="text-xs">
              {t("doctors.slotOverlapWarning", {
                date: overlappingSlot.date,
                time: `${overlappingSlot.startTime} – ${overlappingSlot.endTime}`,
              })}
            </AlertDescription>
          </Alert>
        )}

        {/* Server Conflict / Error Alert */}
        {serverError && (
          <Alert variant="destructive" className="py-2.5">
            <AlertCircle className="size-4" aria-hidden="true" />
            <AlertDescription className="text-xs">
              {serverError}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              disabled={createMutation.isPending}
            >
              {t("common.cancel")}
            </Button>
          )}

          <Button
            type="submit"
            size="sm"
            disabled={!isFormValid}
            className="gap-2"
          >
            {createMutation.isPending ? (
              <>
                <Spinner className="size-4" />
                <span>{t("doctors.creatingSlot")}</span>
              </>
            ) : (
              <>
                <Plus className="size-4" aria-hidden="true" />
                <span>{t("doctors.createSlot")}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

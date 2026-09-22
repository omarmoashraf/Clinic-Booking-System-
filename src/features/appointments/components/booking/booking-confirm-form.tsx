"use client";

import * as React from "react";
import {
  Clock,
  MapPin,
  Stethoscope,
  AlertCircle,
  RotateCcw,
  ArrowLeft,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { StatusBadge } from "@/components/shared/status-badge";
import { useCreateAppointmentMutation } from "@/features/appointments/hooks/use-create-appointment";
import { HttpError } from "@/lib/api/http-error";
import { useTranslation } from "@/hooks/use-i18n";
import type { Doctor } from "@/features/doctors/types";
import type { AvailabilitySlot } from "@/features/availability/types";
import type { Appointment } from "@/features/appointments/types";

export interface BookingConfirmFormProps {
  doctor: Doctor;
  slot: AvailabilitySlot;
  onSuccess: (appointment: Appointment) => void;
  onBack: () => void;
  onConflict: () => void;
}

const MAX_NOTES_LENGTH = 1000;

export function BookingConfirmForm({
  doctor,
  slot,
  onSuccess,
  onBack,
  onConflict,
}: BookingConfirmFormProps) {
  const { t } = useTranslation();
  const [notes, setNotes] = React.useState("");
  const [conflictError, setConflictError] = React.useState(false);
  const [generalError, setGeneralError] = React.useState<string | null>(null);

  const { mutate: bookAppointment, isPending } = useCreateAppointmentMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(false);
    setGeneralError(null);

    bookAppointment(
      {
        availabilityId: slot.id,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: (response) => {
          onSuccess(response.data);
        },
        onError: (err) => {
          const isConflict =
            (HttpError.isHttpError(err) && (err.status === 409 || err.isConflict)) ||
            (err as { status?: number })?.status === 409;

          if (isConflict) {
            setConflictError(true);
          } else {
            setGeneralError(
              err instanceof Error ? err.message : t("errors.unknown")
            );
          }
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto text-start">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {t("appointments.stepConfirm")}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t("appointments.bookingSummary")}
        </p>
      </div>

      {/* Appointment Summary Card */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-subtle space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-border/80 gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {t("appointments.appointmentDetails")}
            </span>
            <h3 className="text-lg font-bold text-foreground mt-0.5">
              {doctor.fullName}
            </h3>
          </div>
          <StatusBadge status="PENDING" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Doctor Specialty */}
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-muted/40 border border-border/60">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Stethoscope className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-muted-foreground block">
                {t("appointments.specialty")}
              </span>
              <span className="text-sm font-semibold text-foreground truncate block">
                {doctor.specialty?.name || t("doctors.generalPractitioner")}
              </span>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-muted/40 border border-border/60">
            <div className="size-9 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center shrink-0">
              <Clock className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-muted-foreground block">
                {slot.date}
              </span>
              <span className="text-sm font-semibold text-foreground truncate block">
                {slot.startTime} – {slot.endTime}
              </span>
            </div>
          </div>

          {/* Clinic Location */}
          <div className="flex items-center gap-3 p-3.5 rounded-lg bg-muted/40 border border-border/60 sm:col-span-2">
            <div className="size-9 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0">
              <MapPin className="size-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs text-muted-foreground block">
                {t("appointments.clinicLocation")}
              </span>
              <span className="text-sm font-semibold text-foreground block">
                {t("appointments.cairoClinic")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 409 Slot Conflict Alert */}
      {conflictError && (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/5">
          <AlertCircle className="size-4 text-destructive" />
          <AlertTitle>{t("appointments.slotConflictTitle")}</AlertTitle>
          <AlertDescription className="mt-1 text-sm space-y-3">
            <p>{t("appointments.slotConflictDesc")}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onConflict}
              className="gap-1.5 bg-background text-foreground border-destructive/40 hover:bg-destructive/10"
            >
              <RotateCcw className="size-3.5" />
              <span>{t("appointments.pickAnotherSlot")}</span>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* General Error Alert */}
      {!conflictError && generalError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t("errors.somethingWentWrong")}</AlertTitle>
          <AlertDescription className="mt-1 text-sm">
            {generalError}
          </AlertDescription>
        </Alert>
      )}

      {/* Optional Patient Notes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="booking-notes" className="font-semibold text-foreground">
            {t("appointments.addNotes")}{" "}
            <span className="text-muted-foreground font-normal">
              {t("appointments.notesOptional")}
            </span>
          </label>
          <span
            className={`font-mono ${
              notes.length > MAX_NOTES_LENGTH * 0.9
                ? "text-destructive font-semibold"
                : "text-muted-foreground"
            }`}
          >
            {notes.length} / {MAX_NOTES_LENGTH}
          </span>
        </div>

        <textarea
          id="booking-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, MAX_NOTES_LENGTH))}
          placeholder={t("appointments.notesPlaceholder")}
          rows={3}
          disabled={isPending}
          className="w-full rounded-xl border border-border bg-background p-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 resize-y"
          aria-describedby="booking-notes-help"
        />
        <p id="booking-notes-help" className="text-xs text-muted-foreground">
          {t("appointments.notesMaxLength")}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isPending}
          className="gap-1.5 text-xs sm:text-sm"
        >
          <DirectionalIcon icon={ArrowLeft} mirror={true} className="size-4" />
          <span>{t("appointments.changeSlot")}</span>
        </Button>

        <Button
          type="submit"
          disabled={isPending || conflictError}
          className="gap-2 text-xs sm:text-sm shadow-subtle min-w-40"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>{t("appointments.bookingSlot")}</span>
            </>
          ) : (
            <>
              <CheckCircle className="size-4" />
              <span>{t("appointments.confirmAndBook")}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

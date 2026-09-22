"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "@/hooks/use-i18n";
import { useCancelAppointmentMutation } from "@/features/appointments/hooks/use-cancel-appointment";
import type { Appointment } from "@/features/appointments/types";

export interface CancelAppointmentDialogProps {
  isOpen: boolean;
  appointment: Appointment | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CancelAppointmentDialog({
  isOpen,
  appointment,
  onClose,
  onSuccess,
}: CancelAppointmentDialogProps) {
  const { t } = useTranslation();
  const cancelMutation = useCancelAppointmentMutation();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [prevIsOpen, setPrevIsOpen] = React.useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setErrorMessage(null);
    }
  }

  if (!appointment) return null;

  const handleConfirmCancel = async () => {
    setErrorMessage(null);
    try {
      await cancelMutation.mutateAsync(appointment.id);
      onSuccess?.();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t("errors.unknown");
      setErrorMessage(message);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("appointments.confirmCancelTitle")}</DialogTitle>
          <DialogDescription>
            {t("appointments.confirmCancelDesc")}
          </DialogDescription>
        </DialogHeader>

        {/* Appointment Summary Box */}
        <div className="p-3.5 rounded-lg bg-muted/50 border border-border text-xs space-y-1.5 text-start">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("appointments.doctor")}:</span>
            <span className="font-semibold text-foreground">
              {appointment.doctor.fullName}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("appointments.specialty")}:</span>
            <span className="text-foreground">
              {appointment.doctor.specialty.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("patients.appointmentDate")}:</span>
            <span className="font-medium text-foreground">
              {appointment.availability.date}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("patients.appointmentTime")}:</span>
            <span className="font-medium text-foreground">
              {appointment.availability.startTime} – {appointment.availability.endTime}
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={cancelMutation.isPending}
          >
            {t("appointments.keepAppointment")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmCancel}
            disabled={cancelMutation.isPending}
            className="gap-2"
          >
            {cancelMutation.isPending ? (
              <>
                <Spinner size="sm" />
                <span>{t("patients.cancelling")}</span>
              </>
            ) : (
              <span>{t("appointments.cancelAppointment")}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

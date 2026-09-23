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
import { useUpdateAppointmentStatusMutation } from "@/features/appointments/hooks/use-update-appointment-status";
import type { Appointment } from "@/features/appointments/types";

export type DoctorStatusAction = "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface DoctorStatusDialogProps {
  isOpen: boolean;
  appointment: Appointment | null;
  targetStatus: DoctorStatusAction | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DoctorStatusDialog({
  isOpen,
  appointment,
  targetStatus,
  onClose,
  onSuccess,
}: DoctorStatusDialogProps) {
  const { t } = useTranslation();
  const updateMutation = useUpdateAppointmentStatusMutation();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const [prevIsOpen, setPrevIsOpen] = React.useState(isOpen);
  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setErrorMessage(null);
    }
  }

  if (!appointment || !targetStatus) return null;

  const isCancel = targetStatus === "CANCELLED";
  const isConfirm = targetStatus === "CONFIRMED";
  const isComplete = targetStatus === "COMPLETED";

  const title = isConfirm
    ? t("appointments.confirmActionTitle")
    : isComplete
    ? t("appointments.completeActionTitle")
    : t("appointments.confirmCancelTitle");

  const description = isConfirm
    ? t("appointments.confirmActionDesc")
    : isComplete
    ? t("appointments.completeActionDesc")
    : t("appointments.confirmCancelDesc");

  const actionButtonText = isConfirm
    ? t("appointments.confirmAppointment")
    : isComplete
    ? t("appointments.completeAppointment")
    : t("appointments.cancelAppointment");

  const loadingText = isConfirm
    ? t("appointments.confirming")
    : isComplete
    ? t("appointments.completing")
    : t("patients.cancelling");

  const handleConfirmAction = async () => {
    setErrorMessage(null);
    try {
      await updateMutation.mutateAsync({
        appointmentId: appointment.id,
        status: targetStatus,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : t("appointments.updateStatusError");
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Patient & Appointment Summary */}
        <div className="p-3.5 rounded-lg bg-muted/50 border border-border text-xs space-y-1.5 text-start">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("appointments.patient")}:</span>
            <span className="font-semibold text-foreground">
              {appointment.patient.fullName}
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
          {appointment.notes && (
            <div className="pt-1.5 border-t border-border/60">
              <span className="text-muted-foreground block mb-0.5">
                {t("appointments.notes")}:
              </span>
              <p className="text-foreground italic">{appointment.notes}</p>
            </div>
          )}
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
            disabled={updateMutation.isPending}
          >
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant={isCancel ? "destructive" : "default"}
            onClick={handleConfirmAction}
            disabled={updateMutation.isPending}
            className="gap-2"
          >
            {updateMutation.isPending ? (
              <>
                <Spinner size="sm" />
                <span>{loadingText}</span>
              </>
            ) : (
              <span>{actionButtonText}</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


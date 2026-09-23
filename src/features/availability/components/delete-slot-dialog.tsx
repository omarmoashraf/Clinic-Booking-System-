"use client";

import * as React from "react";
import { AlertCircle, Trash2 } from "lucide-react";
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
import type { AvailabilitySlot } from "../types";
import { useDeleteAvailabilityMutation } from "../hooks/use-delete-availability";

export interface DeleteSlotDialogProps {
  slot: AvailabilitySlot | null;
  isOpen: boolean;
  onClose: () => void;
  onSlotDeleted?: (slotId: string) => void;
}

/**
 * Confirmation dialog for deleting an availability slot
 * Gracefully handles 409 Conflict if the slot has already been claimed by a patient.
 */
export function DeleteSlotDialog({
  slot,
  isOpen,
  onClose,
  onSlotDeleted,
}: DeleteSlotDialogProps) {
  const { t } = useTranslation();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const deleteMutation = useDeleteAvailabilityMutation();

  const handleClose = () => {
    setErrorMsg(null);
    onClose();
  };

  if (!slot) return null;

  const handleConfirmDelete = async () => {
    setErrorMsg(null);
    try {
      await deleteMutation.mutateAsync(slot.id);
      if (onSlotDeleted) {
        onSlotDeleted(slot.id);
      }
      handleClose();
    } catch (err: unknown) {
      const httpErr = err as { status?: number; message?: string };
      if (httpErr.status === 409) {
        setErrorMsg(t("doctors.cannotDeleteBookedSlot"));
      } else {
        setErrorMsg(httpErr.message || t("doctors.loadAvailabilityError"));
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md text-start">
        <DialogHeader>
          <div className="flex items-center gap-2.5 text-destructive mb-1">
            <div className="size-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
              <Trash2 className="size-4 text-destructive" aria-hidden="true" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-semibold text-foreground">
              {t("doctors.deleteSlotConfirmTitle")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground pt-1">
            {t("doctors.deleteSlotConfirmDesc", {
              date: slot.date,
              time: `${slot.startTime} – ${slot.endTime}`,
            })}
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <Alert variant="destructive" className="py-2.5">
            <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
            <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="flex-row items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={deleteMutation.isPending}
          >
            {t("doctors.cancelDelete")}
          </Button>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirmDelete}
            disabled={deleteMutation.isPending}
            className="gap-1.5"
          >
            {deleteMutation.isPending ? (
              <>
                <Spinner className="size-3.5" />
                <span>{t("doctors.deletingSlot")}</span>
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" aria-hidden="true" />
                <span>{t("doctors.confirmDelete")}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

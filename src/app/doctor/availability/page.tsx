"use client";

import * as React from "react";
import { AlertCircle, Calendar, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/shared/empty-state";
import { useDoctorAvailabilityQuery } from "@/features/doctors/hooks/use-doctor-availability";
import type { AvailabilityFilterRange, AvailabilitySlot } from "@/features/availability/types";
import {
  getDateRangeForFilter,
  groupSlotsByDate,
} from "@/features/availability/utils/availability-helpers";
import { DoctorAvailabilityHeader } from "@/features/availability/components/doctor-availability-header";
import { AddAvailabilityForm } from "@/features/availability/components/add-availability-form";
import { DoctorAvailabilityFilters } from "@/features/availability/components/doctor-availability-filters";
import { DoctorAvailabilityGroup } from "@/features/availability/components/doctor-availability-group";
import { DeleteSlotDialog } from "@/features/availability/components/delete-slot-dialog";
import { DoctorAvailabilitySkeleton } from "@/features/availability/components/doctor-availability-skeleton";

/**
 * Doctor Availability Management Page (/doctor/availability)
 * Allows the authenticated doctor to view, filter, add, and delete bookable consultation slots.
 * Conforms to API_CONTRACT.md Availability Module and DESIGN.md Sections 12 & 15.
 */
export default function DoctorAvailabilityPage() {
  const { profile } = useAuth();
  const { t } = useTranslation();

  const doctorId = profile?.doctor?.id ?? "";

  // Filter state
  const [selectedFilter, setSelectedFilter] =
    React.useState<AvailabilityFilterRange>("all");
  const [customFrom, setCustomFrom] = React.useState<string>("");
  const [customTo, setCustomTo] = React.useState<string>("");

  // Add Slot Form toggling
  const [isFormOpen, setIsFormOpen] = React.useState<boolean>(false);

  // Deletion Dialog State
  const [slotToDelete, setSlotToDelete] =
    React.useState<AvailabilitySlot | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState<boolean>(false);

  // Compute date bounds query parameters
  const queryParams = React.useMemo(
    () => getDateRangeForFilter(selectedFilter, customFrom, customTo),
    [selectedFilter, customFrom, customTo]
  );

  // Fetch filtered slots for schedule display
  const {
    data: availabilityData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDoctorAvailabilityQuery(doctorId, queryParams);

  // Fetch all slots to provide comprehensive overlap detection in the creation form
  const { data: allSlotsData } = useDoctorAvailabilityQuery(doctorId);

  const displayedSlots = React.useMemo(
    () => availabilityData?.data ?? [],
    [availabilityData?.data]
  );

  const allSlots = React.useMemo(
    () => allSlotsData?.data ?? displayedSlots,
    [allSlotsData?.data, displayedSlots]
  );

  // Group displayed slots by date
  const groupedSlots = React.useMemo(
    () => groupSlotsByDate(displayedSlots),
    [displayedSlots]
  );

  const handleSlotCreated = () => {
    toast.success(t("doctors.slotCreatedSuccess"));
    refetch();
  };

  const handleDeleteClick = (slot: AvailabilitySlot) => {
    setSlotToDelete(slot);
    setDeleteDialogOpen(true);
  };

  const handleSlotDeleted = () => {
    toast.success(t("doctors.slotDeletedSuccess"));
    setSlotToDelete(null);
    refetch();
  };

  const handleCustomDatesChange = (from: string, to: string) => {
    setCustomFrom(from);
    setCustomTo(to);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <DoctorAvailabilityHeader
        totalSlotsCount={allSlots.length}
        onAddSlotClick={() => setIsFormOpen((prev) => !prev)}
        isFormOpen={isFormOpen}
      />

      {/* Add Slot Form (Collapsible / Actionable) */}
      {isFormOpen && (
        <AddAvailabilityForm
          existingSlots={allSlots}
          onSlotCreated={handleSlotCreated}
          onCancel={() => setIsFormOpen(false)}
        />
      )}

      {/* Date Filter Bar */}
      <DoctorAvailabilityFilters
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        customFrom={customFrom}
        customTo={customTo}
        onCustomDatesChange={handleCustomDatesChange}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <DoctorAvailabilitySkeleton />
      ) : isError ? (
        <Alert variant="destructive" className="text-start">
          <AlertCircle className="size-4" aria-hidden="true" />
          <AlertTitle>{t("common.error")}</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              {error instanceof Error
                ? error.message
                : t("doctors.loadAvailabilityError")}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <RefreshCw
                className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span>{t("common.retry")}</span>
            </Button>
          </AlertDescription>
        </Alert>
      ) : groupedSlots.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={t("doctors.noAvailabilitySlots")}
          description={t("doctors.noAvailabilitySlotsDesc")}
          action={
            <Button
              size="sm"
              onClick={() => setIsFormOpen(true)}
              className="gap-1.5"
            >
              <Plus className="size-4" aria-hidden="true" />
              <span>{t("doctors.addSlot")}</span>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {groupedSlots.map((group) => (
            <DoctorAvailabilityGroup
              key={group.date}
              date={group.date}
              slots={group.slots}
              onDeleteClick={handleDeleteClick}
              deletingSlotId={slotToDelete?.id}
            />
          ))}
        </div>
      )}

      {/* Delete Slot Confirmation Dialog */}
      <DeleteSlotDialog
        slot={slotToDelete}
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSlotToDelete(null);
        }}
        onSlotDeleted={handleSlotDeleted}
      />
    </div>
  );
}

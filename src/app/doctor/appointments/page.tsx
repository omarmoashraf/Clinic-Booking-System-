"use client";

import * as React from "react";
import { AlertCircle, Calendar, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/shared/empty-state";
import {
  AppointmentsFilterTabs,
  type StatusTabKey,
} from "@/features/appointments/components/patient/appointments-filter-tabs";
import { AppointmentsPagination } from "@/features/appointments/components/patient/appointments-pagination";
import { AppointmentsListSkeleton } from "@/features/appointments/components/patient/appointments-list-skeleton";
import { DoctorAppointmentsTable } from "@/features/appointments/components/doctor/doctor-appointments-table";
import { DoctorAppointmentsMobileList } from "@/features/appointments/components/doctor/doctor-appointments-mobile-list";
import {
  DoctorStatusDialog,
  type DoctorStatusAction,
} from "@/features/doctors/components/dashboard/doctor-status-dialog";
import { useMyAppointmentsQuery } from "@/features/appointments/hooks/use-my-appointments";
import { filterDoctorAppointmentsBySearch } from "@/features/appointments/utils/appointment-helpers";
import { useTranslation } from "@/hooks/use-i18n";
import type { Appointment, AppointmentStatus } from "@/features/appointments/types";

const PAGE_SIZE = 10;

export default function DoctorAppointmentsPage() {
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = React.useState<StatusTabKey>("ALL");
  const [page, setPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState("");

  const [targetAppointment, setTargetAppointment] =
    React.useState<Appointment | null>(null);
  const [targetAction, setTargetAction] =
    React.useState<DoctorStatusAction | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Map "ALL" tab to undefined query param
  const queryStatus =
    selectedStatus === "ALL" ? undefined : (selectedStatus as AppointmentStatus);

  const {
    data: appointmentsData,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useMyAppointmentsQuery({
    page,
    limit: PAGE_SIZE,
    status: queryStatus,
  });

  const totalItems =
    appointmentsData?.meta?.total ?? appointmentsData?.data?.length ?? 0;
  const totalPages = appointmentsData?.meta?.totalPages ?? 1;

  // Filter client-side by patient name, notes, or date
  const displayedAppointments = React.useMemo(() => {
    const list = appointmentsData?.data ?? [];
    return filterDoctorAppointmentsBySearch(list, searchQuery);
  }, [appointmentsData?.data, searchQuery]);

  const handleStatusChange = (status: StatusTabKey) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const handleActionRequest = React.useCallback(
    (appointment: Appointment, action: DoctorStatusAction) => {
      setTargetAppointment(appointment);
      setTargetAction(action);
      setDialogOpen(true);
    },
    []
  );

  const handleCloseDialog = React.useCallback(() => {
    setDialogOpen(false);
    setTargetAppointment(null);
    setTargetAction(null);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-start animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t("appointments.doctorAppointmentsTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("appointments.doctorAppointmentsSubtitle")}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
          <span>{t("common.retry")}</span>
        </Button>
      </div>

      {/* Toolbar: Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <AppointmentsFilterTabs
          selectedStatus={selectedStatus}
          onSelectStatus={handleStatusChange}
          className="self-start md:self-auto"
        />

        <div className="relative w-full md:w-72">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("appointments.searchDoctorAppointmentsPlaceholder")}
            className="ps-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* Content Rendering: Loading / Error / Empty / List */}
      {isLoading ? (
        <AppointmentsListSkeleton />
      ) : isError ? (
        <div className="p-8 rounded-xl border border-destructive/20 bg-destructive/5 text-start space-y-3">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>{t("errors.somethingWentWrong")}</AlertTitle>
            <AlertDescription className="mt-1">
              {error instanceof Error ? error.message : t("errors.unknown")}
            </AlertDescription>
          </Alert>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-2"
            >
              <RefreshCw className="size-3.5" />
              <span>{t("common.retry")}</span>
            </Button>
          </div>
        </div>
      ) : displayedAppointments.length === 0 ? (
        <div className="p-8 rounded-xl border border-border bg-card shadow-subtle">
          <EmptyState
            icon={Calendar}
            title={
              searchQuery || selectedStatus !== "ALL"
                ? t("appointments.noAppointmentsMatch")
                : t("doctors.noRecentAppointments")
            }
            description={
              searchQuery || selectedStatus !== "ALL"
                ? t("doctors.emptyFilterDesc")
                : t("doctors.noRecentAppointmentsDesc")
            }
            action={
              (searchQuery || selectedStatus !== "ALL") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedStatus("ALL");
                    setSearchQuery("");
                    setPage(1);
                  }}
                >
                  {t("doctors.clearFilters")}
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <DoctorAppointmentsTable
            appointments={displayedAppointments}
            onActionRequest={handleActionRequest}
          />

          {/* Mobile Card List View */}
          <DoctorAppointmentsMobileList
            appointments={displayedAppointments}
            onActionRequest={handleActionRequest}
          />

          {/* Pagination Controls */}
          <AppointmentsPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={setPage}
            disabled={isFetching}
          />
        </div>
      )}

      {/* Status Action Dialog (Confirm, Complete, Cancel) */}
      <DoctorStatusDialog
        isOpen={dialogOpen}
        appointment={targetAppointment}
        targetStatus={targetAction}
        onClose={handleCloseDialog}
      />
    </div>
  );
}


"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, RotateCcw, Search, Calendar, AlertCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/shared/empty-state";
import { AppointmentsFilterTabs, type StatusTabKey } from "@/features/appointments/components/patient/appointments-filter-tabs";
import { AppointmentsTable } from "@/features/appointments/components/patient/appointments-table";
import { AppointmentsMobileList } from "@/features/appointments/components/patient/appointments-mobile-list";
import { AppointmentsPagination } from "@/features/appointments/components/patient/appointments-pagination";
import { AppointmentsListSkeleton } from "@/features/appointments/components/patient/appointments-list-skeleton";
import { CancelAppointmentDialog } from "@/features/patients/components/cancel-appointment-dialog";
import { useMyAppointmentsQuery } from "@/features/appointments/hooks/use-my-appointments";
import { filterAppointmentsBySearch } from "@/features/appointments/utils/appointment-helpers";
import { useTranslation } from "@/hooks/use-i18n";
import type { Appointment, AppointmentStatus } from "@/features/appointments/types";

const PAGE_SIZE = 10;

export default function PatientAppointmentsPage() {
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = React.useState<StatusTabKey>("ALL");
  const [page, setPage] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState("");

  const [cancelTarget, setCancelTarget] = React.useState<Appointment | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

  // Fetch appointments for active status and page
  const queryStatus = selectedStatus === "ALL" ? undefined : (selectedStatus as AppointmentStatus);
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

  const totalItems = appointmentsData?.meta?.total ?? appointmentsData?.data?.length ?? 0;
  const totalPages = appointmentsData?.meta?.totalPages ?? 1;

  // Filter client-side by doctor/specialty search query
  const displayedAppointments = React.useMemo(() => {
    const list = appointmentsData?.data ?? [];
    return filterAppointmentsBySearch(list, searchQuery);
  }, [appointmentsData?.data, searchQuery]);

  const handleStatusChange = (status: StatusTabKey) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const handleOpenCancel = React.useCallback((appointment: Appointment) => {
    setCancelTarget(appointment);
    setCancelDialogOpen(true);
  }, []);

  const handleCloseCancel = React.useCallback(() => {
    setCancelDialogOpen(false);
    setCancelTarget(null);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 text-start animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {t("appointments.myAppointments")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("patients.viewAppointmentsDesc")}
          </p>
        </div>

        <Link
          href="/patient/appointments/new"
          className={buttonVariants({
            size: "default",
            className: "gap-2 self-start sm:self-auto shadow-subtle shrink-0",
          })}
        >
          <Plus className="size-4" />
          <span>{t("appointments.bookNew")}</span>
        </Link>
      </div>

      {/* Toolbar: Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <AppointmentsFilterTabs
          selectedStatus={selectedStatus}
          onSelectStatus={handleStatusChange}
          className="self-start md:self-auto"
        />

        <div className="relative w-full md:w-72 shrink-0">
          <Search
            className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("appointments.searchPlaceholder")}
            className="ps-9 pe-4 h-9 text-xs sm:text-sm"
            aria-label={t("appointments.searchPlaceholder")}
          />
        </div>
      </div>

      {/* 1. Loading State */}
      {isLoading && <AppointmentsListSkeleton />}

      {/* 2. Error State */}
      {!isLoading && isError && (
        <Alert variant="destructive" className="max-w-md mx-auto my-6">
          <AlertCircle className="size-4" />
          <AlertTitle>{t("errors.somethingWentWrong")}</AlertTitle>
          <AlertDescription className="mt-1 text-sm space-y-2">
            <p>{error instanceof Error ? error.message : t("patients.loadError")}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="gap-1.5 bg-background text-foreground"
            >
              <RotateCcw className="size-3.5" />
              <span>{t("home.retry")}</span>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* 3. Empty State */}
      {!isLoading && !isError && displayedAppointments.length === 0 && (
        <EmptyState
          icon={Calendar}
          title={
            searchQuery || selectedStatus !== "ALL"
              ? t("appointments.noAppointmentsMatch")
              : t("appointments.noAppointmentsYet")
          }
          description={
            searchQuery || selectedStatus !== "ALL"
              ? undefined
              : t("appointments.noAppointmentsDesc")
          }
          action={
            searchQuery || selectedStatus !== "ALL" ? (
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
            ) : (
              <Link
                href="/patient/appointments/new"
                className={buttonVariants({ size: "sm", className: "gap-1.5" })}
              >
                <Plus className="size-4" />
                <span>{t("appointments.bookNew")}</span>
              </Link>
            )
          }
        />
      )}

      {/* 4. Appointments Content: Desktop Table + Mobile Cards */}
      {!isLoading && !isError && displayedAppointments.length > 0 && (
        <div className={`space-y-4 transition-opacity duration-200 ${isFetching ? "opacity-60" : "opacity-100"}`}>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <AppointmentsTable
              appointments={displayedAppointments}
              onCancelRequest={handleOpenCancel}
            />
          </div>

          {/* Mobile Card List View */}
          <div className="md:hidden">
            <AppointmentsMobileList
              appointments={displayedAppointments}
              onCancelRequest={handleOpenCancel}
            />
          </div>

          {/* Pagination Controls */}
          <AppointmentsPagination
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={isFetching}
          />
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      <CancelAppointmentDialog
        isOpen={cancelDialogOpen}
        appointment={cancelTarget}
        onClose={handleCloseCancel}
      />
    </div>
  );
}

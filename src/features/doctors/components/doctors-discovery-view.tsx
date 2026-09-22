"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ArrowLeft, RotateCcw, Search, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { DoctorCard } from "@/components/shared/doctor-card";
import { EmptyState } from "@/components/shared/empty-state";
import { DoctorFilters } from "@/features/doctors/components/doctor-filters";
import { DoctorGridSkeleton } from "@/features/doctors/components/doctor-grid-skeleton";
import { DoctorPagination } from "@/features/doctors/components/doctor-pagination";
import { useDoctorsQuery } from "@/features/doctors/hooks/use-doctors";
import { useTranslation } from "@/hooks/use-i18n";

const PAGE_SIZE = 12;

export interface DoctorsDiscoveryViewProps {
  basePath?: string;
  showBreadcrumb?: boolean;
}

function DoctorsDiscoveryInner({
  basePath = "/doctors",
  showBreadcrumb = true,
}: DoctorsDiscoveryViewProps) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlSpecialty = searchParams.get("specialty") ?? "";
  const [selectedSpecialty, setSelectedSpecialty] = React.useState(urlSpecialty);
  const [searchName, setSearchName] = React.useState("");
  const [page, setPage] = React.useState(1);

  // Sync state if URL changes externally
  const [prevUrlSpecialty, setPrevUrlSpecialty] = React.useState(urlSpecialty);
  if (prevUrlSpecialty !== urlSpecialty) {
    setPrevUrlSpecialty(urlSpecialty);
    setSelectedSpecialty(urlSpecialty);
    setPage(1);
  }

  // Fetch doctors from API using active filters and pagination
  const {
    data: doctorsData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useDoctorsQuery({
    page,
    limit: PAGE_SIZE,
    specialty: selectedSpecialty || undefined,
  });

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setPage(1);

    const params = new URLSearchParams(searchParams.toString());
    if (specialty) {
      params.set("specialty", specialty);
    } else {
      params.delete("specialty");
    }
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
  };

  const handleClearFilters = () => {
    setSelectedSpecialty("");
    setSearchName("");
    setPage(1);
    router.replace(pathname, { scroll: false });
  };

  const meta = doctorsData?.meta;
  const totalDoctors = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;

  // Apply client-side doctor name filtering over the fetched page
  const filteredDoctors = React.useMemo(() => {
    const list = doctorsData?.data ?? [];
    const trimmed = searchName.trim().toLowerCase();
    if (!trimmed) return list;
    return list.filter((doc) =>
      doc.fullName.toLowerCase().includes(trimmed)
    );
  }, [doctorsData?.data, searchName]);

  const hasActiveFilters = Boolean(selectedSpecialty || searchName.trim());
  const isPatientPortal = basePath.startsWith("/patient");

  return (
    <div className="w-full space-y-8">
      {/* Header & Breadcrumb */}
      <div className="space-y-4">
        {showBreadcrumb && (
          <Link
            href={isPatientPortal ? "/patient/dashboard" : "/"}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            <DirectionalIcon
              icon={ArrowLeft}
              mirror={true}
              className="size-3.5 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5 transition-transform"
            />
            <span>{isPatientPortal ? t("nav.dashboard") : t("nav.home")}</span>
          </Link>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 text-start max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-xs bg-primary/5 text-primary border-primary/20"
              >
                <Stethoscope className="size-3 shrink-0" aria-hidden="true" />
                <span>{t("doctors.title")}</span>
              </Badge>
              {!isLoading && totalDoctors > 0 && (
                <span className="text-xs text-muted-foreground font-medium">
                  ({totalDoctors} {t("doctors.allSpecialties").toLowerCase()})
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {t("doctors.discoveryTitle")}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("doctors.discoverySubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <DoctorFilters
        selectedSpecialty={selectedSpecialty}
        onSpecialtyChange={handleSpecialtyChange}
        searchName={searchName}
        onSearchNameChange={(val) => {
          setSearchName(val);
          setPage(1);
        }}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main Content Area */}
      {/* 1. Loading State */}
      {isLoading && <DoctorGridSkeleton count={PAGE_SIZE} />}

      {/* 2. Error State */}
      {!isLoading && isError && (
        <div className="p-8 rounded-xl border border-destructive/30 bg-destructive/5 text-center space-y-4 max-w-md mx-auto my-8">
          <p className="text-sm font-medium text-destructive">
            {t("doctors.loadError")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RotateCcw className="size-3.5" />
            <span>{t("home.retry")}</span>
          </Button>
        </div>
      )}

      {/* 3. Empty State */}
      {!isLoading && !isError && filteredDoctors.length === 0 && (
        <EmptyState
          icon={hasActiveFilters ? Search : Stethoscope}
          title={t("doctors.noDoctorsFound")}
          description={
            hasActiveFilters
              ? t("doctors.emptyFilterDesc")
              : undefined
          }
          action={
            hasActiveFilters ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                <span>{t("doctors.clearFilters")}</span>
              </Button>
            ) : undefined
          }
        />
      )}

      {/* 4. Doctors Grid (Success) */}
      {!isLoading && !isError && filteredDoctors.length > 0 && (
        <div className="space-y-8">
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-200 ${
              isFetching ? "opacity-60" : "opacity-100"
            }`}
          >
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                basePath={basePath}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          <DoctorPagination
            page={page}
            totalPages={totalPages}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={isFetching}
          />
        </div>
      )}
    </div>
  );
}

function DoctorDiscoveryFallback() {
  return (
    <div className="w-full space-y-8">
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-20 bg-muted rounded" />
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-4 w-96 bg-muted rounded" />
      </div>
      <DoctorGridSkeleton count={PAGE_SIZE} />
    </div>
  );
}

export function DoctorsDiscoveryView(props: DoctorsDiscoveryViewProps) {
  return (
    <React.Suspense fallback={<DoctorDiscoveryFallback />}>
      <DoctorsDiscoveryInner {...props} />
    </React.Suspense>
  );
}


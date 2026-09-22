"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ArrowLeft, RotateCcw, Search, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DirectionalIcon } from "@/components/shared/directional-icon";
import { SpecialtyCard } from "@/components/shared/specialty-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SpecialtySearch } from "@/features/specialties/components/specialty-search";
import { SpecialtyGridSkeleton } from "@/features/specialties/components/specialty-grid-skeleton";
import { SpecialtyPagination } from "@/features/specialties/components/specialty-pagination";
import { useSpecialtiesQuery } from "@/features/specialties/hooks/use-specialties";
import { useDebounce } from "@/hooks/use-debounce";
import { useTranslation } from "@/hooks/use-i18n";

const PAGE_SIZE = 12;

function SpecialtiesCatalogContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlSearch = searchParams.get("search") ?? "";
  const urlPage = Number.parseInt(searchParams.get("page") ?? "1", 10) || 1;

  const [search, setSearch] = React.useState(urlSearch);
  const [page, setPage] = React.useState(urlPage);

  // Sync state if URL changes externally
  const [prevUrlSearch, setPrevUrlSearch] = React.useState(urlSearch);
  if (prevUrlSearch !== urlSearch) {
    setPrevUrlSearch(urlSearch);
    setSearch(urlSearch);
  }

  const debouncedSearch = useDebounce(search.trim(), 350);

  // Reset page to 1 when search term changes
  const [prevDebouncedSearch, setPrevDebouncedSearch] = React.useState(debouncedSearch);
  if (prevDebouncedSearch !== debouncedSearch) {
    setPrevDebouncedSearch(debouncedSearch);
    setPage(1);
  }

  // Synchronize URL query parameters with active search & pagination
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    if (page > 1) {
      params.set("page", String(page));
    } else {
      params.delete("page");
    }

    const newQuery = params.toString();
    const currentQuery = searchParams.toString();
    if (newQuery !== currentQuery) {
      router.replace(`${pathname}${newQuery ? `?${newQuery}` : ""}`, { scroll: false });
    }
  }, [debouncedSearch, page, pathname, router, searchParams]);

  // Fetch specialties from API using server-side search and pagination
  const {
    data: specialtiesData,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useSpecialtiesQuery({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const handleClearSearch = () => {
    setSearch("");
    setPage(1);
  };

  const meta = specialtiesData?.meta;
  const totalSpecialties = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 1;
  const specialties = specialtiesData?.data ?? [];

  const hasSearch = Boolean(debouncedSearch);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 w-full space-y-8">
      {/* Header & Breadcrumb */}
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
        >
          <DirectionalIcon
            icon={ArrowLeft}
            mirror={true}
            className="size-3.5 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5 transition-transform"
          />
          <span>{t("nav.home")}</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 text-start max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-xs bg-primary/5 text-primary border-primary/20"
              >
                <Sparkles className="size-3 shrink-0" aria-hidden="true" />
                <span>{t("specialties.title")}</span>
              </Badge>
              {!isLoading && totalSpecialties > 0 && (
                <span className="text-xs text-muted-foreground font-medium">
                  ({totalSpecialties} {t("specialties.title").toLowerCase()})
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {t("specialties.pageTitle")}
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t("specialties.pageSubtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Search Toolbar */}
      <SpecialtySearch
        value={search}
        onChange={(val) => setSearch(val)}
        onClear={handleClearSearch}
      />

      {/* Main Content Area */}
      {/* 1. Loading State */}
      {isLoading && <SpecialtyGridSkeleton count={PAGE_SIZE} />}

      {/* 2. Error State */}
      {!isLoading && isError && (
        <div className="p-8 rounded-xl border border-destructive/30 bg-destructive/5 text-center space-y-4 max-w-md mx-auto my-8">
          <p className="text-sm font-medium text-destructive">
            {t("specialties.loadError")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RotateCcw className="size-3.5" />
            <span>{t("common.retry")}</span>
          </Button>
        </div>
      )}

      {/* 3. Empty State */}
      {!isLoading && !isError && specialties.length === 0 && (
        <EmptyState
          icon={hasSearch ? Search : Sparkles}
          title={t("specialties.noSpecialtiesFound")}
          description={
            hasSearch
              ? t("specialties.noSpecialtiesMatch", { query: debouncedSearch })
              : t("specialties.emptyCatalog")
          }
          action={
            hasSearch ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearSearch}
                className="gap-1.5"
              >
                <RotateCcw className="size-3.5" />
                <span>{t("specialties.clearSearch")}</span>
              </Button>
            ) : undefined
          }
        />
      )}

      {/* 4. Specialties Grid (Success) */}
      {!isLoading && !isError && specialties.length > 0 && (
        <div className="space-y-8">
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${
              isFetching ? "opacity-60" : "opacity-100"
            }`}
          >
            {specialties.map((specialty) => (
              <SpecialtyCard key={specialty.id} specialty={specialty} />
            ))}
          </div>

          {/* Pagination Controls */}
          <SpecialtyPagination
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

function SpecialtyCatalogFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 w-full space-y-8">
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-20 bg-muted rounded" />
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-4 w-96 bg-muted rounded" />
      </div>
      <SpecialtyGridSkeleton count={PAGE_SIZE} />
    </div>
  );
}

export default function SpecialtiesPage() {
  return (
    <React.Suspense fallback={<SpecialtyCatalogFallback />}>
      <SpecialtiesCatalogContent />
    </React.Suspense>
  );
}


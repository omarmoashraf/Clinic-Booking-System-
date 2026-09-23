"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Save,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/use-i18n";
import { useSpecialtiesQuery } from "@/features/specialties/hooks/use-specialties";
import type { UserProfile } from "@/types/auth";
import {
  updateDoctorProfileSchema,
  type UpdateDoctorProfileFormValues,
} from "../schemas";
import { useUpdateDoctorProfileMutation } from "../hooks/use-doctor-profile";

export interface DoctorProfileFormProps {
  initialProfile: UserProfile;
  className?: string;
}

/**
 * Form to update mutable professional fields for the authenticated doctor:
 * - specialtyId (UUID)
 * - bio (optional string, max 1000 chars)
 * Conforms to API_CONTRACT.md Doctors Module PATCH /doctors/me and DESIGN.md Section 15.
 */
export function DoctorProfileForm({
  initialProfile,
  className,
}: DoctorProfileFormProps) {
  const { t } = useTranslation();
  const [successBanner, setSuccessBanner] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const initialSpecialtyId = initialProfile.doctor?.specialty?.id || "";
  const initialBio = initialProfile.doctor?.bio || "";

  const [selectedSpecialtyId, setSelectedSpecialtyId] = React.useState(initialSpecialtyId);
  const [bioValue, setBioValue] = React.useState(initialBio);

  const { data: specialtiesData, isLoading: isLoadingSpecialties } =
    useSpecialtiesQuery({ limit: 100 });
  const specialties = specialtiesData?.data ?? [];

  const updateMutation = useUpdateDoctorProfileMutation();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateDoctorProfileFormValues>({
    resolver: zodResolver(updateDoctorProfileSchema),
    defaultValues: {
      specialtyId: initialSpecialtyId,
      bio: initialBio,
    },
  });

  const bioLength = bioValue.length;

  const onSubmit = async (values: UpdateDoctorProfileFormValues) => {
    setServerError(null);
    setSuccessBanner(false);

    try {
      await updateMutation.mutateAsync({
        specialtyId: values.specialtyId ? values.specialtyId : undefined,
        bio: values.bio !== undefined ? values.bio : undefined,
      });

      setSuccessBanner(true);
      const nextSpecialtyId = values.specialtyId || "";
      const nextBio = values.bio || "";
      setSelectedSpecialtyId(nextSpecialtyId);
      setBioValue(nextBio);
      reset({
        specialtyId: nextSpecialtyId,
        bio: nextBio,
      });
    } catch (err: unknown) {
      const httpErr = err as { status?: number; message?: string };
      setServerError(httpErr.message || t("doctors.profileUpdateError"));
    }
  };

  const handleReset = () => {
    reset({
      specialtyId: initialSpecialtyId,
      bio: initialBio,
    });
    setSelectedSpecialtyId(initialSpecialtyId);
    setBioValue(initialBio);
    setServerError(null);
    setSuccessBanner(false);
  };

  return (
    <div
      className={`rounded-xl border border-border bg-card p-6 shadow-subtle space-y-6 text-start ${
        className ?? ""
      }`}
    >
      <div className="space-y-1 border-b border-border/60 pb-4">
        <h2 className="text-lg font-semibold text-foreground tracking-tight">
          {t("doctors.professionalInfoTitle")}
        </h2>
        <p className="text-xs text-muted-foreground">
          {t("doctors.professionalInfoSubtitle")}
        </p>
      </div>

      {/* Success Notification Alert */}
      {successBanner && (
        <Alert className="border-success/40 bg-success/10 text-success-foreground py-3">
          <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
          <AlertTitle className="text-xs font-semibold text-success">
            {t("common.success")}
          </AlertTitle>
          <AlertDescription className="text-xs text-success/90">
            {t("doctors.profileUpdatedSuccess")}
          </AlertDescription>
        </Alert>
      )}

      {/* Server Error Alert */}
      {serverError && (
        <Alert variant="destructive" className="py-3">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          <AlertTitle className="text-xs font-semibold">
            {t("common.error")}
          </AlertTitle>
          <AlertDescription className="text-xs">
            {serverError}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Specialty Selector */}
        <div className="space-y-2">
          <Label htmlFor="doctor-specialty" className="text-xs font-medium">
            {t("doctors.selectSpecialty")}
          </Label>
          <div className="w-full">
            <Select
              value={selectedSpecialtyId || ""}
              onValueChange={(val) => {
                const str = String(val ?? "");
                setSelectedSpecialtyId(str);
                setValue("specialtyId", str, { shouldDirty: true });
                setServerError(null);
                setSuccessBanner(false);
              }}
            >
              <SelectTrigger id="doctor-specialty" className="w-full h-10 text-sm">
                <div className="flex items-center gap-2 truncate">
                  <Stethoscope className="size-4 text-primary shrink-0" aria-hidden="true" />
                  <SelectValue
                    placeholder={
                      isLoadingSpecialties
                        ? t("common.loading")
                        : t("doctors.selectSpecialtyPlaceholder")
                    }
                  />
                </div>
              </SelectTrigger>
              <SelectContent>
                {specialties.map((spec) => (
                  <SelectItem key={spec.id} value={spec.id}>
                    {spec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {errors.specialtyId && (
            <p className="text-xs text-destructive font-medium">
              {errors.specialtyId.message}
            </p>
          )}
        </div>

        {/* Bio Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="doctor-bio" className="text-xs font-medium">
              {t("doctors.bio")}
            </Label>
            <span
              className={`text-xs font-mono ${
                bioLength > 1000
                  ? "text-destructive font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {t("doctors.charactersCount", { current: bioLength, max: 1000 })}
            </span>
          </div>

          <div className="relative">
            <textarea
              id="doctor-bio"
              {...register("bio")}
              rows={5}
              placeholder={t("doctors.bioPlaceholder")}
              onChange={(e) => {
                setBioValue(e.target.value);
                register("bio").onChange(e);
                setServerError(null);
                setSuccessBanner(false);
              }}
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2.5 text-sm shadow-subtle transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive text-foreground placeholder:text-muted-foreground"
            />
          </div>
          {errors.bio && (
            <p className="text-xs text-destructive font-medium">
              {errors.bio.message}
            </p>
          )}
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!isDirty || updateMutation.isPending}
            className="gap-1.5"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            <span>{t("common.cancel")}</span>
          </Button>

          <Button
            type="submit"
            size="sm"
            disabled={!isDirty || updateMutation.isPending || bioLength > 1000}
            className="gap-2"
          >
            {updateMutation.isPending ? (
              <>
                <Spinner className="size-4" />
                <span>{t("doctors.savingProfile")}</span>
              </>
            ) : (
              <>
                <Save className="size-4" aria-hidden="true" />
                <span>{t("doctors.saveProfile")}</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

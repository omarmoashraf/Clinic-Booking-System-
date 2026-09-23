"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Phone,
  Calendar,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useTranslation } from "@/hooks/use-i18n";
import { HttpError } from "@/lib/api/http-error";
import {
  updatePatientProfileSchema,
  type UpdatePatientProfileFormValues,
} from "../schemas";
import { useUpdatePatientProfileMutation } from "../hooks/use-patient-profile";
import type { UserProfile } from "@/types/auth";

export interface PatientProfileFormProps {
  initialProfile: UserProfile;
}

export function PatientProfileForm({ initialProfile }: PatientProfileFormProps) {
  const { t, locale } = useTranslation();
  const [successBanner, setSuccessBanner] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const updateMutation = useUpdatePatientProfileMutation();

  // Max selectable date for birth date is today
  const maxBirthDate = React.useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdatePatientProfileFormValues>({
    resolver: zodResolver(updatePatientProfileSchema),
    defaultValues: {
      fullName: initialProfile.fullName || "",
      phone: initialProfile.phone || "",
      dateOfBirth: initialProfile.patient?.dateOfBirth || "",
    },
  });

  // When initialProfile changes externally, reset the form values
  React.useEffect(() => {
    reset({
      fullName: initialProfile.fullName || "",
      phone: initialProfile.phone || "",
      dateOfBirth: initialProfile.patient?.dateOfBirth || "",
    });
  }, [initialProfile, reset]);

  const onSubmit = async (values: UpdatePatientProfileFormValues) => {
    setServerError(null);
    setSuccessBanner(false);

    try {
      const updated = await updateMutation.mutateAsync({
        fullName: values.fullName,
        phone: values.phone ?? "",
        dateOfBirth: values.dateOfBirth ?? "",
      });

      // Update form default state with saved values
      reset({
        fullName: updated.fullName,
        phone: updated.phone || "",
        dateOfBirth: updated.patient?.dateOfBirth || "",
      });

      setSuccessBanner(true);
    } catch (err: unknown) {
      if (HttpError.isHttpError(err)) {
        setServerError(err.message);
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError(t("patients.updateError"));
      }
    }
  };

  // Format member since date
  const memberSinceFormatted = React.useMemo(() => {
    try {
      const date = new Date(initialProfile.createdAt);
      return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return initialProfile.createdAt;
    }
  }, [initialProfile.createdAt, locale]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-start">
      {/* Primary Editable Profile Details */}
      <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-subtle space-y-6">
        <div className="border-b border-border pb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>{t("patients.personalInfo")}</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("patients.manageProfileDesc")}
          </p>
        </div>

        {/* Success Feedback Alert */}
        {successBanner && (
          <Alert className="border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <AlertTitle className="text-sm font-semibold">
              {t("patients.profileUpdated")}
            </AlertTitle>
          </Alert>
        )}

        {/* Error Feedback Alert */}
        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm font-semibold">
              {t("patients.loadError")}
            </AlertTitle>
            <AlertDescription className="text-xs mt-1">
              {serverError}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
              {t("patients.fullName")} <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="fullName"
                type="text"
                placeholder={t("patients.fullNamePlaceholder")}
                maxLength={150}
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
                className={errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}
                {...register("fullName")}
              />
            </div>
            {errors.fullName?.message && (
              <p id="fullName-error" className="text-xs text-destructive mt-1 font-medium">
                {t(errors.fullName.message as never)}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span>{t("patients.phone")}</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t("patients.phonePlaceholder")}
              maxLength={30}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              className={errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}
              {...register("phone")}
            />
            {errors.phone?.message && (
              <p id="phone-error" className="text-xs text-destructive mt-1 font-medium">
                {t(errors.phone.message as never)}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-sm font-medium text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              <span>{t("patients.dateOfBirth")}</span>
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              max={maxBirthDate}
              aria-invalid={Boolean(errors.dateOfBirth)}
              aria-describedby={errors.dateOfBirth ? "dateOfBirth-error" : undefined}
              className={errors.dateOfBirth ? "border-destructive focus-visible:ring-destructive" : ""}
              {...register("dateOfBirth")}
            />
            {errors.dateOfBirth?.message && (
              <p id="dateOfBirth-error" className="text-xs text-destructive mt-1 font-medium">
                {t(errors.dateOfBirth.message as never)}
              </p>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center gap-3">
            <Button
              type="submit"
              disabled={updateMutation.isPending || !isDirty}
              className="min-w-32"
            >
              {updateMutation.isPending ? (
                <>
                  <Spinner className="h-4 w-4 me-2" />
                  <span>{t("patients.saving")}</span>
                </>
              ) : (
                <span>{t("patients.saveChanges")}</span>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Read-Only Account Details Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-subtle space-y-6 h-fit">
        <div className="border-b border-border pb-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
            <span>{t("patients.accountDetails")}</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {t("patients.accountDetailsDesc")}
          </p>
        </div>

        <div className="space-y-4 text-sm">
          {/* Email Address */}
          <div>
            <span className="text-xs font-medium text-muted-foreground block mb-1">
              {t("patients.email")}
            </span>
            <div className="flex items-center gap-2 text-foreground font-medium p-2.5 rounded-lg bg-muted/40 border border-border/50 select-all">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
              <span className="truncate">{initialProfile.email}</span>
            </div>
          </div>

          {/* Role */}
          <div>
            <span className="text-xs font-medium text-muted-foreground block mb-1">
              {t("patients.roleLabel")}
            </span>
            <Badge variant="outline" className="font-medium bg-primary/5 text-primary border-primary/20">
              {t("patients.roleLabel")}
            </Badge>
          </div>

          {/* Account Status */}
          <div>
            <span className="text-xs font-medium text-muted-foreground block mb-1">
              {t("patients.accountStatus")}
            </span>
            {initialProfile.isActive ? (
              <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 me-1.5" />
                {t("patients.statusActive")}
              </Badge>
            ) : (
              <Badge variant="destructive">
                {t("patients.statusInactive")}
              </Badge>
            )}
          </div>

          {/* Member Since */}
          <div>
            <span className="text-xs font-medium text-muted-foreground block mb-1">
              {t("patients.joinedDate")}
            </span>
            <div className="flex items-center gap-2 text-foreground text-xs p-2 rounded-lg bg-muted/40 border border-border/50">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
              <span>{memberSinceFormatted}</span>
            </div>
          </div>

          {/* Administrative Notice */}
          <div className="pt-2">
            <div className="p-3 rounded-lg border border-border/60 bg-muted/30 text-xs text-muted-foreground flex gap-2">
              <Info className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" aria-hidden="true" />
              <span>{t("patients.readOnlyNotice")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


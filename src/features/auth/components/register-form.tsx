"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User,
  Mail,
  Lock,
  Phone,
  Stethoscope,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSpecialtiesQuery } from "@/features/specialties/hooks/use-specialties";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-i18n";
import { HttpError } from "@/lib/api";
import { registerSchema, type RegisterFormValues } from "../schemas";
import { cn } from "@/lib/utils";

export function RegisterForm() {
  const { t } = useTranslation();
  const { register: registerUser, login } = useAuth();
  const router = useRouter();

  const [selectedRole, setSelectedRole] = React.useState<"PATIENT" | "DOCTOR">("PATIENT");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      role: "PATIENT",
      specialtyId: "",
    },
  });

  const isDoctor = selectedRole === "DOCTOR";

  // Fetch specialties when doctor role is active
  const { data: specialtiesData, isLoading: isSpecialtiesLoading } =
    useSpecialtiesQuery({ limit: 100 });
  const specialties = specialtiesData?.data ?? [];

  const onSubmit = async (values: RegisterFormValues) => {
    setApiError(null);
    try {
      await registerUser({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        phone: values.phone?.trim() || undefined,
        role: values.role,
        specialtyId: values.role === "DOCTOR" ? values.specialtyId : undefined,
      });

      // Seamless auto-login upon successful registration
      try {
        const profile = await login({
          email: values.email.trim(),
          password: values.password,
        });

        if (profile.role === "DOCTOR") {
          router.push("/doctor/dashboard");
        } else {
          router.push("/patient/dashboard");
        }
      } catch {
        // If auto-login fails, redirect to sign-in page with success banner
        router.push("/login?registered=true");
      }
    } catch (err) {
      if (HttpError.isHttpError(err)) {
        if (err.status === 409) {
          setApiError(t("auth.emailAlreadyExists"));
          return;
        }
        if (err.status === 429) {
          setApiError(t("auth.rateLimitError"));
          return;
        }
      }
      setApiError(t("auth.genericAuthError"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Top-level API Error banner */}
      {apiError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      {/* Role Selection Segment */}
      <div className="space-y-2 text-start">
        <Label className="text-xs font-semibold">{t("auth.role")}</Label>
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t("auth.role")}>
          <button
            type="button"
            role="radio"
            aria-checked={selectedRole === "PATIENT"}
            onClick={() => {
              setSelectedRole("PATIENT");
              setValue("role", "PATIENT", { shouldValidate: true });
              setValue("specialtyId", "");
            }}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              selectedRole === "PATIENT"
                ? "border-primary bg-primary/5 text-primary shadow-subtle"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            <User className="size-5 mb-1 text-inherit" aria-hidden="true" />
            <span className="text-xs font-semibold">{t("auth.rolePatient")}</span>
          </button>

          <button
            type="button"
            role="radio"
            aria-checked={selectedRole === "DOCTOR"}
            onClick={() => {
              setSelectedRole("DOCTOR");
              setValue("role", "DOCTOR", { shouldValidate: true });
            }}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              selectedRole === "DOCTOR"
                ? "border-primary bg-primary/5 text-primary shadow-subtle"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            <Stethoscope className="size-5 mb-1 text-inherit" aria-hidden="true" />
            <span className="text-xs font-semibold">{t("auth.roleDoctor")}</span>
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {isDoctor ? t("auth.doctorDescription") : t("auth.patientDescription")}
        </p>
      </div>

      {/* Full Name Input */}
      <div className="space-y-1.5 text-start">
        <Label htmlFor="fullName" className="text-xs font-semibold">
          {t("auth.fullName")}
        </Label>
        <div className="relative">
          <User
            className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder={t("auth.fullNamePlaceholder")}
            className="ps-9 h-10 text-sm"
            aria-invalid={Boolean(errors.fullName)}
            {...register("fullName")}
          />
        </div>
        {errors.fullName?.message && (
          <p className="text-xs text-destructive font-medium">
            {t(errors.fullName.message)}
          </p>
        )}
      </div>

      {/* Email Input */}
      <div className="space-y-1.5 text-start">
        <Label htmlFor="email" className="text-xs font-semibold">
          {t("auth.email")}
        </Label>
        <div className="relative">
          <Mail
            className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t("auth.emailPlaceholder")}
            className="ps-9 h-10 text-sm"
            aria-invalid={Boolean(errors.email)}
            {...register("email")}
          />
        </div>
        {errors.email?.message && (
          <p className="text-xs text-destructive font-medium">
            {t(errors.email.message)}
          </p>
        )}
      </div>

      {/* Phone Input (Optional) */}
      <div className="space-y-1.5 text-start">
        <Label htmlFor="phone" className="text-xs font-semibold">
          {t("auth.phone")}{" "}
          <span className="text-[10px] text-muted-foreground font-normal">
            (optional)
          </span>
        </Label>
        <div className="relative">
          <Phone
            className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder={t("auth.phonePlaceholder")}
            className="ps-9 h-10 text-sm"
            aria-invalid={Boolean(errors.phone)}
            {...register("phone")}
          />
        </div>
        {errors.phone?.message && (
          <p className="text-xs text-destructive font-medium">
            {t(errors.phone.message)}
          </p>
        )}
      </div>

      {/* Specialty Dropdown (Doctor only) */}
      {isDoctor && (
        <div className="space-y-1.5 text-start">
          <Label htmlFor="specialtyId" className="text-xs font-semibold">
            {t("auth.specialty")}
          </Label>
          <Controller
            control={control}
            name="specialtyId"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={(val) => field.onChange(String(val ?? ""))}
              >
                <SelectTrigger id="specialtyId" className="w-full h-10 text-sm">
                  <SelectValue
                    placeholder={
                      isSpecialtiesLoading
                        ? t("common.loading")
                        : t("auth.selectSpecialty")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((spec) => (
                    <SelectItem key={spec.id} value={spec.id}>
                      {spec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.specialtyId?.message && (
            <p className="text-xs text-destructive font-medium">
              {t(errors.specialtyId.message)}
            </p>
          )}
        </div>
      )}

      {/* Password Input */}
      <div className="space-y-1.5 text-start">
        <Label htmlFor="password" className="text-xs font-semibold">
          {t("auth.password")}
        </Label>
        <div className="relative">
          <Lock
            className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={t("auth.passwordPlaceholder")}
            className="ps-9 pe-9 h-10 text-sm"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute end-2.5 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.password?.message && (
          <p className="text-xs text-destructive font-medium">
            {t(errors.password.message)}
          </p>
        )}
      </div>

      {/* Confirm Password Input */}
      <div className="space-y-1.5 text-start">
        <Label htmlFor="confirmPassword" className="text-xs font-semibold">
          {t("auth.confirmPassword")}
        </Label>
        <div className="relative">
          <Lock
            className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder={t("auth.confirmPasswordPlaceholder")}
            className="ps-9 pe-9 h-10 text-sm"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute end-2.5 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showConfirmPassword ? t("auth.hidePassword") : t("auth.showPassword")}
          >
            {showConfirmPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword?.message && (
          <p className="text-xs text-destructive font-medium">
            {t(errors.confirmPassword.message)}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-10 text-sm font-semibold mt-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Spinner size="sm" className="me-2 text-primary-foreground" />
            <span>{t("auth.creatingAccount")}</span>
          </>
        ) : (
          <span>{t("auth.createAccount")}</span>
        )}
      </Button>
    </form>
  );
}


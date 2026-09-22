"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-i18n";
import { HttpError } from "@/lib/api";
import { loginSchema, type LoginFormValues } from "../schemas";

export function LoginForm() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showPassword, setShowPassword] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const isRegistered = searchParams.get("registered") === "true";
  const redirectUrl = searchParams.get("redirect");
  const isGuestBooking = Boolean(redirectUrl && redirectUrl.includes("/doctors/"));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setApiError(null);
    try {
      const profile = await login(values);

      // Sanitize redirect target to prevent open-redirect vulnerabilities
      if (
        redirectUrl &&
        redirectUrl.startsWith("/") &&
        !redirectUrl.startsWith("//")
      ) {
        router.push(redirectUrl);
        return;
      }

      // Default role-specific dashboards
      if (profile.role === "DOCTOR") {
        router.push("/doctor/dashboard");
      } else if (profile.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/patient/dashboard");
      }
    } catch (err) {
      if (HttpError.isHttpError(err)) {
        if (err.status === 401) {
          setApiError(t("auth.invalidCredentials"));
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
      {/* Informational banners */}
      {isRegistered && (
        <Alert className="border-primary/30 bg-primary/5 text-primary">
          <CheckCircle className="size-4" />
          <AlertDescription>{t("auth.registeredSuccessBanner")}</AlertDescription>
        </Alert>
      )}

      {isGuestBooking && !isRegistered && (
        <Alert className="border-primary/20 bg-primary/5 text-foreground">
          <Calendar className="size-4 text-primary" />
          <AlertDescription>{t("auth.guestBookingNotice")}</AlertDescription>
        </Alert>
      )}

      {/* Top-level API Error banner */}
      {apiError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

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

      {/* Password Input */}
      <div className="space-y-1.5 text-start">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-xs font-semibold">
            {t("auth.password")}
          </Label>
        </div>
        <div className="relative">
          <Lock
            className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
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

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-10 text-sm font-semibold mt-2"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Spinner size="sm" className="me-2 text-primary-foreground" />
            <span>{t("auth.signingIn")}</span>
          </>
        ) : (
          <span>{t("auth.signIn")}</span>
        )}
      </Button>
    </form>
  );
}

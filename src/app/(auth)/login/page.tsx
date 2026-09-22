"use client";

import * as React from "react";
import Link from "next/link";
import { AuthCard } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/hooks/use-i18n";

function LoginPageContent() {
  const { t } = useTranslation();

  return (
    <AuthCard
      title={t("auth.loginTitle")}
      subtitle={t("auth.loginSubtitle")}
      footer={
        <span>
          {t("auth.dontHaveAccount")}{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline ms-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            {t("auth.createAccount")}
          </Link>
        </span>
      }
    >
      <LoginForm />
    </AuthCard>
  );
}

function LoginFallback() {
  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card space-y-6 animate-pulse">
      <div className="flex flex-col items-center space-y-2">
        <Skeleton className="size-12 rounded-xl" />
        <Skeleton className="h-6 w-48 rounded" />
        <Skeleton className="h-4 w-64 rounded" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg mt-4" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<LoginFallback />}>
      <LoginPageContent />
    </React.Suspense>
  );
}


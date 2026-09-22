"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "../lib/query/query-client";

export interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Provider wrapping the application in TanStack Query's QueryClientProvider.
 * Conditionally loads ReactQueryDevtools in development.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Uses getQueryClient() to ensure SSR safety and singleton browser reuse
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}


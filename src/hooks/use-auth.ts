"use client";

import * as React from "react";
import { AuthContext } from "../providers/auth-provider";
import type { AuthContextValue } from "../types/auth";

/**
 * Access the application authentication state and actions.
 * Throws an error if invoked outside an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


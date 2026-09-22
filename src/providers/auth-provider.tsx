"use client";

import * as React from "react";
import type {
  AuthContextValue,
  AuthStatus,
  AuthUser,
  LoginCredentials,
  RegisterPayload,
  UserProfile,
} from "../types/auth";
import {
  authService,
  isAdmin as checkIsAdmin,
  isDoctor as checkIsDoctor,
  isPatient as checkIsPatient,
  tokenRefreshManager,
} from "../lib/auth";

export const AuthContext = React.createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
  initialProfile?: UserProfile | null;
  initialStatus?: AuthStatus;
}

export function AuthProvider({
  children,
  initialUser = null,
  initialProfile = null,
  initialStatus = "loading",
}: AuthProviderProps) {
  const [status, setStatus] = React.useState<AuthStatus>(initialStatus);
  const [user, setUser] = React.useState<AuthUser | null>(initialUser);
  const [profile, setProfile] = React.useState<UserProfile | null>(initialProfile);

  // Run session restoration and bind session expiration listener on mount
  React.useEffect(() => {
    let isMounted = true;

    // Listen to token refresh expiry
    const unsubscribe = tokenRefreshManager.onSessionExpired(() => {
      if (isMounted) {
        setUser(null);
        setProfile(null);
        setStatus("unauthenticated");
      }
    });

    async function initSession() {
      try {
        const session = await authService.restoreSession();
        if (!isMounted) return;

        if (session) {
          setUser(session.user);
          setProfile(session.profile);
          setStatus("authenticated");
        } else {
          setUser(null);
          setProfile(null);
          setStatus("unauthenticated");
        }
      } catch {
        if (!isMounted) return;
        setUser(null);
        setProfile(null);
        setStatus("unauthenticated");
      }
    }

    initSession();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = React.useCallback(async (credentials: LoginCredentials) => {
    setStatus("loading");
    try {
      const result = await authService.login(credentials);
      setUser(result.user);
      setProfile(result.profile);
      setStatus("authenticated");
      return result.profile;
    } catch (error) {
      setUser(null);
      setProfile(null);
      setStatus("unauthenticated");
      throw error;
    }
  }, []);

  const register = React.useCallback(async (payload: RegisterPayload) => {
    return authService.register(payload);
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setProfile(null);
      setStatus("unauthenticated");
    }
  }, []);

  const refreshSession = React.useCallback(async (): Promise<boolean> => {
    const success = await authService.refreshSession();
    if (success) {
      try {
        const freshProfile = await authService.getMe();
        setUser({ id: freshProfile.id, role: freshProfile.role });
        setProfile(freshProfile);
        setStatus("authenticated");
        return true;
      } catch {
        setUser(null);
        setProfile(null);
        setStatus("unauthenticated");
        return false;
      }
    } else {
      setUser(null);
      setProfile(null);
      setStatus("unauthenticated");
      return false;
    }
  }, []);

  const value = React.useMemo<AuthContextValue>(() => {
    const role = user?.role;
    return {
      status,
      user,
      profile,
      isAuthenticated: status === "authenticated",
      isLoading: status === "loading",
      isPatient: checkIsPatient(role),
      isDoctor: checkIsDoctor(role),
      isAdmin: checkIsAdmin(role),
      login,
      register,
      logout,
      refreshSession,
    };
  }, [status, user, profile, login, register, logout, refreshSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


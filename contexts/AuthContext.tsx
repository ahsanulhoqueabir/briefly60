"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  AuthContextType,
  AuthState,
  LoginPayload,
  SignUpPayload,
} from "@/types/auth.types";
import { LocalStorageService } from "@/services/localstorage.services";

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: {},
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Helper function for error handling
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAuthError = (error: any, context: string) => {
    console.error(`Auth error in ${context}:`, error);

    // Show user-friendly error message using dynamic import
    if (typeof window !== "undefined") {
      import("sonner")
        .then(({ toast }) => {
          const message = error?.message || "An error occurred";
          toast.error(message);
        })
        .catch(() => {
          // Fallback if toast fails
          console.warn("Toast notification failed for auth error");
        });
    }
  };

  const refreshUser = async () => {
    const token = LocalStorageService.getAuthToken();
    if (!token) {
      setAuthState((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.user) {
        setAuthState((prev) => ({
          ...prev,
          user: data.user,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  useEffect(() => {
    // Check if user is logged in from localStorage
    const checkAuth = async () => {
      const token = LocalStorageService.getAuthToken();

      if (token) {
        try {
          const data = await fetch("/api/auth/me", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then((res) => res.json());

          if (data.success && data.user) {
            setAuthState({
              user: data.user,
              loading: false,
              error: {},
            });
            setIsAuthenticated(true);
          } else {
            LocalStorageService.removeAuthToken();
            setAuthState({
              user: null,
              loading: false,
              error: {},
            });
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          LocalStorageService.removeAuthToken();
          setAuthState({
            user: null,
            loading: false,
            error: {},
          });
        }
      } else {
        setAuthState({
          user: null,
          loading: false,
          error: {},
        });
      }
    };

    checkAuth();
  }, []);

  const signInWithEmail = async (data: LoginPayload) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: {} }));

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Login failed");
      }

      LocalStorageService.setAuthToken(result.token);
      setAuthState({
        user: result.user,
        loading: false,
        error: {},
      });
      setIsAuthenticated(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Email sign-in failed";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: {
          details: message,
        },
      }));
      throw error;
    }
  };

  const signUpWithEmail = async (data: SignUpPayload) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: {} }));

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          confirm_password: data.confirm_password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Sign-up failed");
      }

      LocalStorageService.setAuthToken(result.token);

      setAuthState({
        user: result.user,
        loading: false,
        error: {},
      });
      setIsAuthenticated(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign-up failed";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: {
          details: message,
        },
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: {} }));

      LocalStorageService.removeAuthToken();

      setAuthState({
        user: null,
        loading: false,
        error: {},
      });
      setIsAuthenticated(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Sign-out failed";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: {
          details: message,
        },
      }));
      throw error;
    }
  };

  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: {} }));
  };

  const contextValue: AuthContextType = {
    ...authState,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    clearError,
    isAuthenticated,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

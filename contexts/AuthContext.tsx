"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/config/firebase";
import { firebaseAuthService } from "@/services/auth/firebase";
import { AuthContextType, AuthState } from "@/types/auth";

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
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: User | null) => {
        if (firebaseUser) {
          try {
            // Sync with Directus and get user data
            const user = await firebaseAuthService.syncUserWithDirectus(
              firebaseUser
            );
            setAuthState({
              user,
              loading: false,
              error: null,
            });
          } catch (error) {
            console.error("Error syncing user:", error);
            setAuthState({
              user: null,
              loading: false,
              error: "Failed to sync user data",
            });
          }
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null,
          });
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      // This will trigger the onAuthStateChanged listener
      await firebaseAuthService.signInWithGoogle();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Google sign-in failed";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      // This will trigger the onAuthStateChanged listener
      await firebaseAuthService.signInWithEmail(email, password);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Email sign-in failed";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      throw error;
    }
  };

  const signUpWithEmail = async (
    name: string,
    email: string,
    password: string
  ) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      // This will trigger the onAuthStateChanged listener
      await firebaseAuthService.signUpWithEmail(name, email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign-up failed";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      await firebaseAuthService.signOut();
      // onAuthStateChanged will handle the state update
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Sign-out failed";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      throw error;
    }
  };

  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }));
  };

  const contextValue: AuthContextType = {
    ...authState,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

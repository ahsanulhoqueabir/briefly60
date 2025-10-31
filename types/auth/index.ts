export interface B60User {
  id: string;
  status?: "published" | "draft" | "archived";
  sort?: number;
  user_created?: string;
  date_created?: string;
  user_updated?: string;
  date_updated?: string;
  name: string;
  email: string;
  password?: string;
  subscription?: string;
  firebase_uid?: string;
  provider: "email" | "google";
  avatar_url?: string;
  email_verified: boolean;
  last_login?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  firebase_uid?: string;
  provider: "email" | "google";
  avatar_url?: string;
  email_verified: boolean;
  subscription?: string;
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export interface FirebaseAuthResult {
  user: AuthUser;
  isNewUser: boolean;
}

export interface DirectusAuthResponse {
  success: boolean;
  user?: B60User;
  message?: string;
}

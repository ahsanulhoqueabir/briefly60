export interface LoginPayload {
  email: string;
  password: string;
  turnstileToken?: string;
}

export interface SignUpPayload extends LoginPayload {
  name: string;
  confirm_password: string;
  turnstileToken?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  confirm_password: string;
}

export type Plan = "free" | "pro" | "enterprise";

export type UserRole = "superadmin" | "admin" | "editor" | "user";

export interface Subscription {
  id: string;
  plan: Plan;
  status: "active" | "inactive" | "canceled";
  start_date: string;
  end_date: string;
  amount: number;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  plan: Plan;
  rbac?: UserRole;
  subscriptions?: Subscription[];
  bookmarkedNewsIds?: string[]; // Array of news IDs that the user has bookmarked
  quizzes?: string[];
  preferences?: {
    language?: string;
    notifications?: boolean;
    theme?: "light" | "dark" | "system";
  };
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: {
    success?: boolean;
    error?: number;
    details?: string;
  };
}

export interface AuthContextType extends AuthState {
  signInWithEmail: (data: LoginPayload) => Promise<void>;
  signUpWithEmail: (data: SignUpPayload) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  forgotPassword: (
    email: string,
    turnstileToken: string,
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (
    token: string,
    password: string,
    confirmPassword: string,
    turnstileToken: string,
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateLanguagePreference: (
    language: "bn" | "en",
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
}

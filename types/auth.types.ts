export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignUpPayload extends LoginPayload {
  first_name: string;
  confirm_password: string;
}

export type Plan = "free" | "pro" | "enterprise";

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
  first_name: string;
  image?: string;
  plan: Plan;
  subscriptions?: Subscription[];
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
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginSchema,
  signUpSchema,
  LoginFormData,
  SignUpFormData,
  calculatePasswordStrength,
} from "@/lib/validation";

interface AuthFormProps {
  mode: "login" | "register";
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const { signInWithEmail, signUpWithEmail, loading, error, clearError } =
    useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    strength: "weak" | "medium" | "strong" | "very-strong";
    score: number;
  } | null>(null);

  const isLogin = mode === "login";

  // Setup form with React Hook Form and Zod
  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  const form = isLogin ? loginForm : signUpForm;

  // Clear any existing auth errors when component mounts
  useEffect(() => {
    clearError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Monitor password strength for sign up
  useEffect(() => {
    if (!isLogin) {
      const subscription = signUpForm.watch((value, { name }) => {
        if (name === "password" && value.password) {
          setPasswordStrength(calculatePasswordStrength(value.password));
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [isLogin, signUpForm]);

  const generateStrongPassword = () => {
    const length = 16;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    // Ensure at least one of each required character type
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    // Set both password fields
    signUpForm.setValue("password", password, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
    signUpForm.setValue("confirm_password", password, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // Show password temporarily
    setShowPassword(true);
    setShowConfirmPassword(true);

    // Hide after 3 seconds
    setTimeout(() => {
      setShowPassword(false);
      setShowConfirmPassword(false);
    }, 3000);
  };

  const onSubmit = async (data: LoginFormData | SignUpFormData) => {
    try {
      if (isLogin) {
        await signInWithEmail(data as LoginFormData);
      } else {
        await signUpWithEmail(data as SignUpFormData);
      }

      // Redirect to return URL if provided, otherwise go to home page
      const redirectPath = returnUrl || "/";
      router.push(redirectPath);
    } catch (error) {
      // Error is handled by the auth context
      console.error("Authentication error:", error);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return "bg-muted";
    switch (passwordStrength.strength) {
      case "weak":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "strong":
        return "bg-blue-500";
      case "very-strong":
        return "bg-green-500";
      default:
        return "bg-muted";
    }
  };

  const getPasswordStrengthWidth = () => {
    if (!passwordStrength) return "0%";
    return `${(passwordStrength.score / 7) * 100}%`;
  };

  return (
    <div className="flex flex-col justify-center py-8 sm:py-6 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold tracking-tight bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {isLogin ? "Welcome Back" : "Join Briefly60"}
        </h2>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          {isLogin ? (
            <>
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Sign up here
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Sign in here
              </Link>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-2">
        <div className="bg-card border border-border py-8 px-4 shadow-xl shadow-black/5 sm:rounded-2xl sm:px-10 backdrop-blur-sm">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Field (Register only) */}
            {!isLogin && (
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-foreground"
                >
                  Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    {...signUpForm.register("name")}
                    className={cn(
                      "appearance-none block w-full pl-10 pr-3 py-2.5 bg-background border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200",
                      signUpForm.formState.errors.name
                        ? "border-red-500 focus:ring-red-500"
                        : "border-input hover:border-blue-400",
                    )}
                    placeholder="Enter your name"
                  />
                </div>
                {signUpForm.formState.errors.name && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {signUpForm.formState.errors.name.message}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...(isLogin
                    ? loginForm.register("email")
                    : signUpForm.register("email"))}
                  className={cn(
                    "appearance-none block w-full pl-10 pr-3 py-2.5 bg-background border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200",
                    (
                      isLogin
                        ? loginForm.formState.errors.email
                        : signUpForm.formState.errors.email
                    )
                      ? "border-red-500 focus:ring-red-500"
                      : "border-input hover:border-blue-400",
                  )}
                  placeholder="you@example.com"
                />
              </div>
              {(isLogin
                ? loginForm.formState.errors.email
                : signUpForm.formState.errors.email) && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {
                    (isLogin
                      ? loginForm.formState.errors.email
                      : signUpForm.formState.errors.email
                    )?.message
                  }
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Password
                </label>
                {!isLogin && (
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1 group"
                  >
                    <svg
                      className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Generate Strong
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  {...(isLogin
                    ? loginForm.register("password")
                    : signUpForm.register("password"))}
                  className={cn(
                    "appearance-none block w-full pl-10 pr-10 py-2.5 bg-background border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200",
                    (
                      isLogin
                        ? loginForm.formState.errors.password
                        : signUpForm.formState.errors.password
                    )
                      ? "border-red-500 focus:ring-red-500"
                      : "border-input hover:border-blue-400",
                  )}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center group"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </button>
              </div>
              {(isLogin
                ? loginForm.formState.errors.password
                : signUpForm.formState.errors.password) && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {
                    (isLogin
                      ? loginForm.formState.errors.password
                      : signUpForm.formState.errors.password
                    )?.message
                  }
                </p>
              )}
              {/* Password Strength Indicator (Sign Up only) */}
              {!isLogin && passwordStrength && (
                <div className="mt-2.5 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground font-medium">
                      Password strength:
                    </span>
                    <span
                      className={cn(
                        "font-semibold capitalize",
                        passwordStrength.strength === "weak" &&
                          "text-red-600 dark:text-red-400",
                        passwordStrength.strength === "medium" &&
                          "text-yellow-600 dark:text-yellow-400",
                        passwordStrength.strength === "strong" &&
                          "text-blue-600 dark:text-blue-400",
                        passwordStrength.strength === "very-strong" &&
                          "text-green-600 dark:text-green-400",
                      )}
                    >
                      {passwordStrength.strength.replace("-", " ")}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500 ease-out",
                        getPasswordStrengthColor(),
                      )}
                      style={{ width: getPasswordStrengthWidth() }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field (Register only) */}
            {!isLogin && (
              <div className="space-y-2">
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-foreground"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...signUpForm.register("confirm_password")}
                    className={cn(
                      "appearance-none block w-full pl-10 pr-10 py-2.5 bg-background border rounded-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200",
                      signUpForm.formState.errors.confirm_password
                        ? "border-red-500 focus:ring-red-500"
                        : "border-input hover:border-blue-400",
                    )}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center group"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                  </button>
                </div>
                {signUpForm.formState.errors.confirm_password && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {signUpForm.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>
            )}

            {/* Forgot Password Link (Login only) */}
            {isLogin && (
              <div className="flex justify-end -mt-2">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            )}

            {/* Error Display */}
            {(error?.error || error?.details) && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span className="flex-1">{error.error || error.details}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !form.formState.isValid}
                className={cn(
                  "w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-background transition-all duration-200 transform active:scale-[0.98]",
                  (loading || !form.formState.isValid) &&
                    "opacity-60 cursor-not-allowed hover:from-blue-600 hover:to-blue-700",
                )}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </span>
                  </>
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          {/* Terms and Privacy (Register only) */}
          {!isLogin && (
            <div className="mt-6">
              <p className="text-xs text-center text-muted-foreground leading-relaxed">
                By signing up, you agree to our{" "}
                <Link
                  href="/terms"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors underline-offset-2 hover:underline"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors underline-offset-2 hover:underline"
                >
                  Privacy Policy
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;

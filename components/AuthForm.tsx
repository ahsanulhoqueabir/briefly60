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
    if (!passwordStrength) return "bg-gray-200";
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
        return "bg-gray-200";
    }
  };

  const getPasswordStrengthWidth = () => {
    if (!passwordStrength) return "0%";
    return `${(passwordStrength.score / 7) * 100}%`;
  };

  return (
    <div className="flex flex-col justify-center py-10 sm:py-5 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold">
          {isLogin ? "Sign in to your account" : "Create your account"}
        </h2>
        <p className="mt-2 text-center text-sm">
          {isLogin ? (
            <>
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up here
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign in here
              </Link>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-2">
        <div className="py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field (Register only) */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="first_name"
                    type="text"
                    {...signUpForm.register("first_name")}
                    className={cn(
                      "appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                      signUpForm.formState.errors.first_name
                        ? "border-red-300"
                        : "border-gray-300",
                    )}
                    placeholder="Enter your name"
                  />
                </div>
                {signUpForm.formState.errors.first_name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {signUpForm.formState.errors.first_name.message}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...form.register("email")}
                  className={cn(
                    "appearance-none block w-full pl-10 pr-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                    form.formState.errors.email
                      ? "border-red-300"
                      : "border-gray-300",
                  )}
                  placeholder="Enter your email"
                />
              </div>
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  {...form.register("password")}
                  className={cn(
                    "appearance-none block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                    form.formState.errors.password
                      ? "border-red-300"
                      : "border-gray-300",
                  )}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {form.formState.errors.password.message}
                </p>
              )}
              {/* Password Strength Indicator (Sign Up only) */}
              {!isLogin && passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600">Password strength:</span>
                    <span
                      className={cn(
                        "font-medium capitalize",
                        passwordStrength.strength === "weak" && "text-red-600",
                        passwordStrength.strength === "medium" &&
                          "text-yellow-600",
                        passwordStrength.strength === "strong" &&
                          "text-blue-600",
                        passwordStrength.strength === "very-strong" &&
                          "text-green-600",
                      )}
                    >
                      {passwordStrength.strength.replace("-", " ")}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
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
              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...signUpForm.register("confirm_password")}
                    className={cn(
                      "appearance-none block w-full pl-10 pr-10 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",
                      signUpForm.formState.errors.confirm_password
                        ? "border-red-300"
                        : "border-gray-300",
                    )}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </div>
                {signUpForm.formState.errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {signUpForm.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>
            )}

            {/* Forgot Password Link (Login only) */}
            {isLogin && (
              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            )}

            {/* Error Display */}
            {(error?.error || error?.details) && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-start gap-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{error.error || error.details}</span>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || !form.formState.isValid}
                className={cn(
                  "w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors",
                  (loading || !form.formState.isValid) &&
                    "opacity-50 cursor-not-allowed",
                )}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isLogin ? (
                  "Sign In"
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>
          </form>

          {/* Terms and Privacy (Register only) */}
          {!isLogin && (
            <div className="mt-6">
              <p className="text-xs text-center text-gray-600">
                By signing up, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-blue-600 hover:text-blue-500"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-500"
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

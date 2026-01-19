import { z } from "zod";

/**
 * Strong password validation rules:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const strongPasswordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password must be less than 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    "Password must contain at least one special character (!@#$%^&*...)",
  );

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Sign Up Schema
 */
export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .trim(),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .toLowerCase()
      .trim(),
    password: strongPasswordValidation,
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;

/**
 * Update Password Schema
 */
export const updatePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: strongPasswordValidation,
    confirm_new_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "New passwords do not match",
    path: ["confirm_new_password"],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: "New password must be different from current password",
    path: ["new_password"],
  });

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

/**
 * Forgot Password Schema
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset Password Schema
 */
export const resetPasswordSchema = z
  .object({
    password: strongPasswordValidation,
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * Update Profile Schema
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim()
    .optional(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim()
    .optional(),
  image: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  preferences: z
    .object({
      language: z.string().optional(),
      notifications: z.boolean().optional(),
      theme: z.enum(["light", "dark"]).optional(),
    })
    .optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

/**
 * Admin Create User Schema
 */
export const adminCreateUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .trim(),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .toLowerCase()
      .trim(),
    password: strongPasswordValidation,
    confirm_password: z.string().min(1, "Please confirm password"),
    rbac: z.enum(["superadmin", "admin", "editor", "user"]),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type AdminCreateUserFormData = z.infer<typeof adminCreateUserSchema>;

/**
 * Helper function to validate strong password
 */
export function validateStrongPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (password.length > 128) {
    errors.push("Password must be less than 128 characters");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Password strength calculator
 * Returns: weak, medium, strong, very-strong
 */
export function calculatePasswordStrength(password: string): {
  strength: "weak" | "medium" | "strong" | "very-strong";
  score: number;
} {
  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  // Determine strength
  let strength: "weak" | "medium" | "strong" | "very-strong" = "weak";
  if (score >= 7) strength = "very-strong";
  else if (score >= 5) strength = "strong";
  else if (score >= 3) strength = "medium";

  return { strength, score };
}

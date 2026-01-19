import { LoginPayload, SignUpPayload } from "@/types/auth.types";
import { JWTService, TokenUser } from "./jwt.service";
import { PasswordService } from "@/lib/password";
import { validateStrongPassword } from "@/lib/validation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User.model";
import Subscription from "@/models/Subscription.model";
import Bookmark from "@/models/Bookmark.model";
import crypto from "crypto";

export class AuthService {
  /**
   * Login user with email and password
   */
  static async login(data: LoginPayload) {
    try {
      await dbConnect();

      // Find user by email and include password field
      const user = await User.findOne({ email: data.email }).select(
        "+password",
      );

      if (!user) {
        return {
          success: false,
          error: "Invalid email or password",
        };
      }

      // Verify password
      const isPasswordValid = await PasswordService.comparePassword(
        data.password,
        user.password,
      );

      if (!isPasswordValid) {
        return {
          success: false,
          error: "Invalid email or password",
        };
      }

      // Prepare user data for token
      const tokenUser: TokenUser = {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        rbac: user.rbac,
        image: user.image,
      };

      // Generate JWT token
      const token = JWTService.generateJWTToken(tokenUser);

      // Get user's active subscription
      const activeSubscription = await Subscription.findOne({
        user_id: user._id,
        is_active: true,
      }).sort({ end_date: -1 });

      // Get bookmarked news IDs
      const bookmarks = await Bookmark.find({ user_id: user._id })
        .select("news_id")
        .lean();

      const bookmarkedNewsIds = bookmarks.map((bookmark) =>
        bookmark.news_id.toString(),
      );

      // Return user without password
      const userResponse = user.toJSON();

      return {
        success: true,
        user: {
          id: userResponse._id,
          email: userResponse.email,
          name: userResponse.name,
          image: userResponse.image,
          rbac: userResponse.rbac,
          preferences: userResponse.preferences,
          plan: activeSubscription?.plan_snapshot.plan_id || "free",
          bookmarkedNewsIds,
        },
        token,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  }

  /**
   * Create a new user account
   */
  static async createAccount(data: SignUpPayload) {
    try {
      await dbConnect();

      // Check if user already exists
      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        return {
          success: false,
          error: "User with this email already exists",
        };
      }

      // Validate password strength
      const passwordValidation = validateStrongPassword(data.password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.errors[0], // Return first error
        };
      }

      // Hash password
      const hashedPassword = await PasswordService.hashPassword(data.password);

      // Create new user
      const newUser = await User.create({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        rbac: "user",
      });

      // Prepare user data for token
      const tokenUser: TokenUser = {
        id: newUser._id.toString(),
        email: newUser.email,
        name: newUser.name,
        rbac: newUser.rbac,
        image: newUser.image,
      };

      // Generate JWT token
      const token = JWTService.generateJWTToken(tokenUser);

      // Return user without password
      const userResponse = newUser.toJSON();

      return {
        success: true,
        user: {
          id: userResponse._id,
          email: userResponse.email,
          name: userResponse.name,
          image: userResponse.image,
          rbac: userResponse.rbac,
          preferences: userResponse.preferences,
          plan: "free",
          bookmarkedNewsIds: [], // New users have no bookmarks
        },
        token,
      };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Account creation failed",
      };
    }
  }

  /**
   * Get user by ID with subscription info and bookmarked news IDs
   */
  static async getUserbyId(userId: string) {
    try {
      await dbConnect();

      const user = await User.findById(userId);

      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      // Get user's active subscription
      const activeSubscription = await Subscription.findOne({
        user_id: user._id,
        is_active: true,
      }).sort({ end_date: -1 });

      // Get bookmarked news IDs
      const bookmarks = await Bookmark.find({ user_id: user._id })
        .select("news_id")
        .lean();

      const bookmarkedNewsIds = bookmarks.map((bookmark) =>
        bookmark.news_id.toString(),
      );

      const userResponse = user.toJSON();

      return {
        success: true,
        user: {
          id: userResponse._id,
          email: userResponse.email,
          name: userResponse.name,
          image: userResponse.image,
          rbac: userResponse.rbac,
          preferences: userResponse.preferences,
          plan: activeSubscription?.plan_snapshot.plan_id || "free",
          bookmarkedNewsIds, // Array of news IDs that user has bookmarked
        },
      };
    } catch (error) {
      console.error("Get user error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get user",
      };
    }
  }

  /**
   * Request password reset (forgot password)
   */
  static async forgotPassword(email: string) {
    try {
      await dbConnect();

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        // Don't reveal if user exists or not for security
        return {
          success: true,
          message:
            "If a user with that email exists, a password reset link has been sent",
        };
      }

      // Generate a secure random token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Hash the token before storing in database
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Set token and expiry (1 hour from now)
      user.reset_password_token = hashedToken;
      user.reset_password_expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      // In production, send email with resetToken (not hashedToken)
      // For now, we'll return the token in response (remove this in production)
      // Email should contain: ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}

      console.log("Password reset token:", resetToken);
      console.log(
        "Reset link:",
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`,
      );

      return {
        success: true,
        message:
          "If a user with that email exists, a password reset link has been sent",
        // Remove this in production - only for development
        resetToken:
          process.env.NODE_ENV === "development" ? resetToken : undefined,
      };
    } catch (error) {
      console.error("Forgot password error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process password reset request",
      };
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string) {
    try {
      await dbConnect();

      // Hash the token to match stored hash
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // Find user with valid token and not expired
      const user = await User.findOne({
        reset_password_token: hashedToken,
        reset_password_expires: { $gt: new Date() },
      }).select("+reset_password_token +reset_password_expires");

      if (!user) {
        return {
          success: false,
          error: "Invalid or expired reset token",
        };
      }

      // Validate password strength
      const passwordValidation = validateStrongPassword(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.errors[0],
        };
      }

      // Hash new password
      const hashedPassword = await PasswordService.hashPassword(newPassword);

      // Update password and clear reset token fields
      user.password = hashedPassword;
      user.reset_password_token = undefined;
      user.reset_password_expires = undefined;
      await user.save();

      return {
        success: true,
        message: "Password has been reset successfully",
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to reset password",
      };
    }
  }
}

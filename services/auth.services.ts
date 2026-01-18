import { LoginPayload, SignUpPayload } from "@/types/auth.types";
import { JWTService, TokenUser } from "./jwt.service";
import { PasswordService } from "@/lib/password";
import { validateStrongPassword } from "@/lib/validation";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User.model";
import Subscription from "@/models/Subscription.model";

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
          plan: activeSubscription?.plan || "free",
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
        name: data.first_name,
        rbac: "user",
      });

      // Create free subscription for the user
      await Subscription.create({
        user_id: newUser._id,
        plan: "free",
        start_date: new Date(),
        is_active: true,
        description: "Free plan - Default subscription",
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
   * Get user by ID with subscription info
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
          plan: activeSubscription?.plan || "free",
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
}

import connectDB from "@/lib/mongodb";
import User, { IUser } from "@/models/User.model";
import { UpdateProfilePayload } from "@/types/profile.types";
import { uploadDocumentFromBase64 } from "@/services/cloudinary.services";
import { Types } from "mongoose";

export class ProfileService {
  /**
   * Format user object for response
   */
  private static formatUser(user: IUser) {
    return {
      ...user.toObject(),
      _id: user._id.toString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Validate base64 image data
   */
  private static isBase64Image(data: string): boolean {
    return typeof data === "string" && data.startsWith("data:image/");
  }

  /**
   * Validate image URL
   */
  private static isImageUrl(url: string): boolean {
    return typeof url === "string" && url.startsWith("http");
  }

  /**
   * Get user profile by ID
   */
  static async getUserById(user_id: string) {
    try {
      await connectDB();

      if (!Types.ObjectId.isValid(user_id)) {
        throw new Error("Invalid user ID");
      }

      const user = await User.findById(user_id).select("-password");

      if (!user) {
        throw new Error("User not found");
      }

      return this.formatUser(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  }

  /**
   * Update user profile
   * Handles base64 image upload automatically
   */
  static async updateProfile(user_id: string, payload: UpdateProfilePayload) {
    try {
      await connectDB();

      if (!Types.ObjectId.isValid(user_id)) {
        throw new Error("Invalid user ID");
      }

      // Validate at least one field is provided
      if (!payload.name && !payload.image && !payload.preferences) {
        throw new Error("No fields provided for update");
      }

      // Build update object
      const update_fields: Record<string, unknown> = {};

      // Handle name
      if (payload.name) {
        if (
          typeof payload.name !== "string" ||
          payload.name.trim().length === 0
        ) {
          throw new Error("Invalid name provided");
        }
        update_fields.name = payload.name.trim();
      }

      // Handle image - check if it's base64 or URL
      if (payload.image) {
        if (this.isBase64Image(payload.image)) {
          // Upload base64 image to Cloudinary
          try {
            const cloudinary_url = await uploadDocumentFromBase64(
              payload.image,
              "profile-images",
              `profile-${user_id}`,
            );
            update_fields.image = cloudinary_url;
          } catch (upload_error) {
            console.error("Cloudinary upload error:", upload_error);
            throw new Error("Failed to upload profile image");
          }
        } else if (this.isImageUrl(payload.image)) {
          // Direct URL provided
          update_fields.image = payload.image;
        } else if (payload.image === "") {
          // Remove image
          update_fields.image = "";
        } else {
          throw new Error("Invalid image format provided");
        }
      }

      // Handle preferences
      if (payload.preferences) {
        if (
          typeof payload.preferences !== "object" ||
          payload.preferences === null
        ) {
          throw new Error("Invalid preferences provided");
        }

        // Validate theme
        if (
          payload.preferences.theme &&
          !["light", "dark"].includes(payload.preferences.theme)
        ) {
          throw new Error("Invalid theme value");
        }

        // Validate notifications
        if (
          payload.preferences.notifications !== undefined &&
          typeof payload.preferences.notifications !== "boolean"
        ) {
          throw new Error("Invalid notifications value");
        }

        // Update nested preferences fields
        if (payload.preferences.language !== undefined) {
          update_fields["preferences.language"] = payload.preferences.language;
        }
        if (payload.preferences.notifications !== undefined) {
          update_fields["preferences.notifications"] =
            payload.preferences.notifications;
        }
        if (payload.preferences.theme !== undefined) {
          update_fields["preferences.theme"] = payload.preferences.theme;
        }
      }

      // Update user
      const updated_user = await User.findByIdAndUpdate(
        user_id,
        { $set: update_fields },
        { new: true, runValidators: true },
      ).select("-password");

      if (!updated_user) {
        throw new Error("User not found");
      }

      return this.formatUser(updated_user);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  static async deleteUser(user_id: string): Promise<void> {
    try {
      await connectDB();

      if (!Types.ObjectId.isValid(user_id)) {
        throw new Error("Invalid user ID");
      }

      const result = await User.findByIdAndDelete(user_id);

      if (!result) {
        throw new Error("User not found");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
}

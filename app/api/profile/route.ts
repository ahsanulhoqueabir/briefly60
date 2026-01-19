import { withAuth } from "@/middleware/verify-auth";
import { ProfileService } from "@/services/profile.services";
import { NextResponse } from "next/server";

/**
 * GET /api/profile
 * Get current user profile
 */
export const GET = withAuth(async (request, user) => {
  try {
    const profile = await ProfileService.getUserById(user!.id);

    return NextResponse.json(
      {
        success: true,
        user: profile,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get profile error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.message === "User not found" ? 404 : 500 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch profile",
      },
      { status: 500 },
    );
  }
});

/**
 * PUT /api/profile
 * Update user profile
 * Automatically handles base64 image upload to Cloudinary
 */
export const PUT = withAuth(async (request, user) => {
  try {
    const body = await request.json();

    // Update profile using service (handles base64 image upload automatically)
    const updated_user = await ProfileService.updateProfile(user!.id, body);

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        user: updated_user,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update profile error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile",
      },
      { status: 500 },
    );
  }
});

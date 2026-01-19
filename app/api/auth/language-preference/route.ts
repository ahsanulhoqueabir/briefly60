import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/middleware/verify-auth";
import { AuthService } from "@/services/auth.services";

/**
 * PUT /api/auth/language-preference
 * Update user's language preference
 */
export const PUT = withAuth(async (request: NextRequest, user) => {
  try {
    // Parse request body
    const body = await request.json();
    const { language } = body;

    // Validate language
    if (!language || !["bn", "en"].includes(language)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid language. Must be 'bn' or 'en'",
        },
        { status: 400 },
      );
    }

    // Update language preference
    const result = await AuthService.updateLanguagePreference(
      user!.id,
      language,
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      language: result.language,
    });
  } catch (error) {
    console.error("Language preference update error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update language preference",
      },
      { status: 500 },
    );
  }
});

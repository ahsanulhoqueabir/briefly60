import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstile } from "@/lib/turnstile";
import { AuthService } from "@/services/auth.services";
import { forgotPasswordSchema } from "@/lib/validation";
import { ZodError } from "zod";

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Verify Turnstile token
    if (!body.turnstileToken) {
      return NextResponse.json(
        {
          success: false,
          error: "CAPTCHA token is required",
        },
        { status: 400 },
      );
    }

    const isTurnstileValid = await verifyTurnstile(body.turnstileToken);

    if (!isTurnstileValid) {
      return NextResponse.json(
        {
          success: false,
          error: "CAPTCHA verification failed",
        },
        { status: 400 },
      );
    }

    // Validate request body
    const validatedData = forgotPasswordSchema.parse(body);

    // Process forgot password request
    const result = await AuthService.forgotPassword(validatedData.email);

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
      // Only in development - remove in production
      ...(process.env.NODE_ENV === "development" && result.resetToken
        ? { resetToken: result.resetToken }
        : {}),
    });
  } catch (error) {
    console.error("Forgot password API error:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0].message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process password reset request",
      },
      { status: 500 },
    );
  }
}

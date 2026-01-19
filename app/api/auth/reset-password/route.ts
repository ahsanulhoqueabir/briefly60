import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/services/auth.services";
import { resetPasswordSchema } from "@/lib/validation";
import { ZodError } from "zod";

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract token from request (can be in body or query params)
    const token = body.token || request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Reset token is required",
        },
        { status: 400 },
      );
    }

    // Validate password fields
    const validatedData = resetPasswordSchema.parse({
      password: body.password,
      confirm_password: body.confirm_password,
    });

    // Process password reset
    const result = await AuthService.resetPassword(
      token,
      validatedData.password,
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
    });
  } catch (error) {
    console.error("Reset password API error:", error);

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
        error: "Failed to reset password",
      },
      { status: 500 },
    );
  }
}

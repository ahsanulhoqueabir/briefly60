import { JWTService } from "@/services/jwt.service";
import { JwtPayload } from "@/types/jwt.types";
import { NextRequest, NextResponse } from "next/server";

/**
 * JWT Authentication Middleware
 * Validates JWT tokens and attaches user data to the request
 */
export async function authMiddleware(request: NextRequest): Promise<{
  success: boolean;
  user?: JwtPayload;
  error?: string;
  response?: NextResponse;
}> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        success: false,
        error: "Missing or invalid authorization token",
        response: NextResponse.json(
          {
            success: false,
            message: "Authentication required",
            error: "MISSING_TOKEN",
          },
          { status: 401 }
        ),
      };
    }

    const token = authHeader.split(" ")[1];

    // Validate token using JWTService
    const validationResult = JWTService.verifyToken(token);

    if (!validationResult.valid) {
      return {
        success: false,
        error: validationResult.error || "Invalid token",
        response: NextResponse.json(
          {
            success: false,
            message: validationResult.error || "Invalid or expired token",
            error: "INVALID_TOKEN",
          },
          { status: 401 }
        ),
      };
    }

    return {
      success: true,
      user: validationResult.user,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      response: NextResponse.json(
        {
          success: false,
          message: "Authentication failed",
          error: "AUTH_ERROR",
        },
        { status: 500 }
      ),
    };
  }
}

export function withAuth(
  handler: (request: NextRequest, user: JwtPayload) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResult = await authMiddleware(request);

    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    return handler(request, authResult.user);
  };
}

import { JWTService } from "@/services/jwt.service";
import { JwtPayload, UserRole } from "@/types/jwt.types";
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

/**
 * Higher-order function that wraps API routes with authentication
 */
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

/**
 * Role-based access control middleware
 * Checks if user has required role to access the route
 */
export function withRole(
  allowedRoles: UserRole[],
  handler: (
    request: NextRequest,
    user: JwtPayload,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: any
  ) => Promise<NextResponse>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return async (request: NextRequest, context?: any) => {
    const authResult = await authMiddleware(request);

    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    // Check if user has required role
    if (!allowedRoles.includes(authResult.user.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Insufficient permissions.",
          error: "INSUFFICIENT_PERMISSIONS",
          requiredRoles: allowedRoles,
          userRole: authResult.user.role,
        },
        { status: 403 }
      );
    }

    return handler(request, authResult.user, context);
  };
}

/**
 * Check if user has admin access (admin or superadmin)
 */
export function withAdmin(
  handler: (
    request: NextRequest,
    user: JwtPayload,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: any
  ) => Promise<NextResponse>
) {
  return withRole(["admin", "superadmin"], handler);
}

/**
 * Check if user has superadmin access
 */
export function withSuperAdmin(
  handler: (
    request: NextRequest,
    user: JwtPayload,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: any
  ) => Promise<NextResponse>
) {
  return withRole(["superadmin"], handler);
}

/**
 * Check if user has editor or higher access
 */
export function withEditor(
  handler: (
    request: NextRequest,
    user: JwtPayload,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: any
  ) => Promise<NextResponse>
) {
  return withRole(["editor", "admin", "superadmin"], handler);
}

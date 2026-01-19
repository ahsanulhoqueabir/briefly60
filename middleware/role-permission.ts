import { NextRequest } from "next/server";
import { JWTService } from "@/services/jwt.service";
import { UserRole } from "@/types/auth.types";
import { hasPermission, Permission } from "@/lib/role-permissions";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

export const checkPermission = async (
  req: NextRequest,
  requiredPermission: Permission,
): Promise<{
  authorized: boolean;
  user?: {
    userId: string;
    email: string;
    role: UserRole;
  };
  error?: string;
}> => {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        authorized: false,
        error: "No authorization token provided",
      };
    }

    const token = authHeader.split(" ")[1];
    const decoded = JWTService.verifyToken(token);

    if (!decoded.valid || !decoded.user) {
      return {
        authorized: false,
        error: decoded.error || "Invalid token",
      };
    }

    const user = {
      userId: decoded.user.id,
      email: decoded.user.email,
      role: decoded.user.role as UserRole,
    };

    // Check if user has the required permission
    const hasRequiredPermission = hasPermission(user.role, requiredPermission);

    if (!hasRequiredPermission) {
      return {
        authorized: false,
        user,
        error: `Access denied. Required permission: ${requiredPermission}`,
      };
    }

    return {
      authorized: true,
      user,
    };
  } catch (error) {
    console.error("Permission check error:", error);
    return {
      authorized: false,
      error: "Authentication failed",
    };
  }
};

export const requirePermissions = (permissions: Permission[]) => {
  return async (
    req: NextRequest,
  ): Promise<{
    authorized: boolean;
    user?: {
      userId: string;
      email: string;
      role: UserRole;
    };
    error?: string;
  }> => {
    try {
      const authHeader = req.headers.get("authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return {
          authorized: false,
          error: "No authorization token provided",
        };
      }

      const token = authHeader.split(" ")[1];
      const decoded = JWTService.verifyToken(token);

      if (!decoded.valid || !decoded.user) {
        return {
          authorized: false,
          error: decoded.error || "Invalid token",
        };
      }

      const user = {
        userId: decoded.user.id,
        email: decoded.user.email,
        role: decoded.user.role as UserRole,
      };

      // Check if user has all required permissions
      const hasAllPermissions = permissions.every((permission) =>
        hasPermission(user.role, permission),
      );

      if (!hasAllPermissions) {
        return {
          authorized: false,
          user,
          error: "Access denied. Insufficient permissions",
        };
      }

      return {
        authorized: true,
        user,
      };
    } catch (error) {
      console.error("Permission check error:", error);
      return {
        authorized: false,
        error: "Authentication failed",
      };
    }
  };
};

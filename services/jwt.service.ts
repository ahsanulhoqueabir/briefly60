import { jwtSecret } from "@/config/env";
import * as jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { JwtVerifyResult, UserRole } from "@/types/jwt.types";

export interface TokenUser {
  id: string;
  email: string;
  name: string;
  rbac: "superadmin" | "admin" | "editor" | "user";
  image?: string;
}

export class JWTService {
  /**
   * Generate JWT token for authenticated user
   */
  static generateJWTToken(user: TokenUser): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.rbac || "user",
      },
      jwtSecret.secret,
      { expiresIn: jwtSecret.expiresIn } as jwt.SignOptions,
    );
  }

  /**
   * Verify JWT token (only decode and validate, no DB fetch)
   */
  static verifyToken(token: string): JwtVerifyResult {
    try {
      const decoded = jwt.verify(token, jwtSecret.secret) as JwtPayload & {
        id: string;
        email: string;
        role: UserRole;
        name?: string;
      };
      if (
        !decoded ||
        typeof decoded.id !== "string" ||
        typeof decoded.email !== "string"
      ) {
        return {
          valid: false,
          error: "Invalid token payload",
        };
      }

      return {
        valid: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role || "user",
          name: decoded.name,
        },
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Invalid token",
      };
    }
  }

  /**
   * Decode any JWT token without verifying its signature.
   * Returns the decoded payload or `null` if decoding fails or token is invalid.
   */
  static decodeToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.decode(token);
      return (decoded as JwtPayload) ?? null;
    } catch {
      return null;
    }
  }
}

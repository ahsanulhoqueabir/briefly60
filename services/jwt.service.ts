import { jwtSecret } from "@/config/env";
import * as jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { JwtVerifyResult } from "@/types/jwt.types";
import { User } from "@/types/auth.types";

export class JWTService {
  /**
   * Generate JWT token for authenticated user
   */
  static generateJWTToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        plan_expires: user.subscriptions
          ? new Date(
              Math.max(
                ...user.subscriptions.map((sub) =>
                  new Date(sub.end_date).getTime()
                )
              )
            )
          : undefined,
      },
      jwtSecret.secret,
      { expiresIn: jwtSecret.expiresIn } as jwt.SignOptions
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
        plan_expires?: Date;
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
          plan_expires: decoded.plan_expires,
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

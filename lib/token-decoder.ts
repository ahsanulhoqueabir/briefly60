import { JWTService } from "@/services/jwt.service";
import { UserRole } from "@/types/auth.types";
import { LocalStorageService } from "@/services/localstorage.services";

/**
 * Client-side token decoder (does not verify signature)
 * This is safe for UI rendering decisions, but server must still verify
 */
export const decodeUserRole = (): UserRole | null => {
  try {
    const token = LocalStorageService.getAuthToken();
    if (!token) return null;

    const decoded = JWTService.decodeToken(token);
    if (!decoded || !decoded.role) return null;

    return decoded.role as UserRole;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const decodeUserFromToken = (): {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
} | null => {
  try {
    const token = LocalStorageService.getAuthToken();
    if (!token) return null;

    const decoded = JWTService.decodeToken(token);
    if (!decoded || !decoded.id || !decoded.email) return null;

    return {
      id: decoded.id,
      email: decoded.email,
      role: (decoded.role as UserRole) || "user",
      name: decoded.name,
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export type UserRole = "superadmin" | "admin" | "editor" | "user";

export interface JwtTokenResponse {
  token: string;
  expiresIn: number;
}

export interface JwtVerifyResult {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name?: string;
  };
  error?: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  iat?: number;
  exp?: number;
}

export interface JwtValidateResult {
  valid: boolean;
  user?: JwtPayload;
  error?: string;
}

export interface JwtRefreshResult {
  success: boolean;
  token?: string;
  expiresIn?: number;
  error?: string;
}

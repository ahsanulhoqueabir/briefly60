export interface JwtTokenResponse {
  token: string;
  expiresIn: number;
}

export interface JwtVerifyResult {
  valid: boolean;
  user?: {
    id: string;
    email: string;
    plan_expires?: Date;
  };
  error?: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  plan_expires?: Date;
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

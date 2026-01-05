export class LocalStorageService {
  private static AUTH_TOKEN_KEY = "b60_auth_token";
  static setAuthToken(token: string) {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }

  static getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  static removeAuthToken() {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
  }
}

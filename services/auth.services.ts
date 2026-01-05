import directusApi from "@/lib/directus";
import { LoginPayload, SignUpPayload } from "@/types/auth.types";
import { JWTService } from "./jwt.service";
import { directus } from "@/config/env";

export class AuthService {
  static async login(data: LoginPayload) {
    try {
      const res = await directusApi.post("/auth/login", data);
      const user = res.data?.data;
      const decodedToken = JWTService.decodeToken(user.access_token);
      if (!decodedToken) {
        return {
          success: false,
          error: "Invalid token received",
        };
      }
      const userId = decodedToken.id;
      const userResponse = await this.getUserbyId(userId);
      const token = JWTService.generateJWTToken(userResponse.user);

      return {
        success: true,
        user: userResponse.user,
        token,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }
  static async createAccount(data: SignUpPayload) {
    try {
      const res = await directusApi.post("/users", {
        ...data,
        role: directus.generalRoleId,
      });
      const user = res.data?.data;
      const token = JWTService.generateJWTToken(user);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          image: user.image,
          plan: user.plan,
        },
        token,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  static async getUserbyId(userId: string) {
    try {
      const res = await directusApi.get(
        `/users/${userId}?fields=id,email,first_name,image,plan,subscriptions.*`
      );
      const user = res.data?.data;
      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }
}

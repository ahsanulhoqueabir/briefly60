import { B60User, AuthUser } from "@/types/auth";

class ApiService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  async createUser(userData: Partial<B60User>): Promise<B60User> {
    const response = await this.makeRequest("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (!response.success) {
      throw new Error(response.error || "Failed to create user");
    }

    return response.user;
  }

  async getUserByEmail(email: string): Promise<B60User | null> {
    try {
      const response = await this.makeRequest(
        `/api/users?email=${encodeURIComponent(email)}`
      );

      return response.success ? response.user : null;
    } catch {
      return null;
    }
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<B60User | null> {
    try {
      const response = await this.makeRequest(
        `/api/users?firebase_uid=${encodeURIComponent(firebaseUid)}`
      );

      return response.success ? response.user : null;
    } catch {
      return null;
    }
  }

  async updateUser(
    userId: string,
    updates: Partial<B60User>
  ): Promise<B60User> {
    const response = await this.makeRequest(`/api/users?id=${userId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });

    if (!response.success) {
      throw new Error(response.error || "Failed to update user");
    }

    return response.user;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.updateUser(userId, {
      last_login: new Date().toISOString(),
    });
  }

  transformToAuthUser(directusUser: B60User): AuthUser {
    return {
      id: directusUser.id,
      name: directusUser.name,
      email: directusUser.email,
      firebase_uid: directusUser.firebase_uid,
      provider: directusUser.provider,
      avatar_url: directusUser.avatar_url,
      email_verified: directusUser.email_verified,
      subscription: directusUser.subscription,
    };
  }
}

export const apiService = new ApiService();

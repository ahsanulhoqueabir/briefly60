import { B60User, AuthUser } from "@/types/auth";

const DIRECTUS_API_URL =
  process.env.NEXT_PUBLIC_DIRECTUS_API_URL ||
  process.env.DIRECTUS_URL ||
  "http://localhost:8055";
const DIRECTUS_TOKEN =
  process.env.DIRECTUS_TOKEN || process.env.DIRECTUS_STATIC_TOKEN;

class DirectusService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${DIRECTUS_API_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(DIRECTUS_TOKEN && { Authorization: `Bearer ${DIRECTUS_TOKEN}` }),
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`Directus API error: ${response.status}`);
    }

    return response.json();
  }

  async createUser(userData: Partial<B60User>): Promise<B60User> {
    const response = await this.makeRequest("/items/b60_user", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return response.data;
  }

  async getUserByEmail(email: string): Promise<B60User | null> {
    try {
      const response = await this.makeRequest(
        `/items/b60_user?filter[email][_eq]=${encodeURIComponent(
          email
        )}&limit=1`
      );
      return response.data?.[0] || null;
    } catch {
      return null;
    }
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<B60User | null> {
    try {
      const response = await this.makeRequest(
        `/items/b60_user?filter[firebase_uid][_eq]=${encodeURIComponent(
          firebaseUid
        )}&limit=1`
      );
      return response.data?.[0] || null;
    } catch {
      return null;
    }
  }

  async updateUser(
    userId: string,
    updates: Partial<B60User>
  ): Promise<B60User> {
    const response = await this.makeRequest(`/items/b60_user/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return response.data;
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

export const directusService = new DirectusService();

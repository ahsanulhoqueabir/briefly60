import directusApi from "@/lib/directus";
import {
  AdminUser,
  AdminUserFilters,
  AdminApiResponse,
  BulkActionPayload,
  BulkActionResult,
  UserStatus,
  AdminDashboardStats,
} from "@/types/admin.types";

/**
 * Admin service for managing users in Directus
 */
export class AdminUserService {
  /**
   * Get all users with filters and pagination
   */
  static async getUsers(
    filters: AdminUserFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<AdminApiResponse<AdminUser[]>> {
    try {
      const params: Record<string, string | number> = {
        limit,
        offset: (page - 1) * limit,
        meta: "filter_count",
        sort: "-date_created",
      };

      // Build filter object
      const directusFilter: Record<string, unknown> = {};

      if (filters.status) {
        directusFilter.status = { _eq: filters.status };
      }

      if (filters.plan) {
        directusFilter.plan = { _eq: filters.plan };
      }

      if (filters.search) {
        directusFilter._or = [
          { first_name: { _contains: filters.search } },
          { email: { _contains: filters.search } },
        ];
      }

      if (filters.registered_from || filters.registered_to) {
        const dateFilter: Record<string, string> = {};
        if (filters.registered_from) {
          dateFilter._gte = filters.registered_from;
        }
        if (filters.registered_to) {
          dateFilter._lte = filters.registered_to;
        }
        directusFilter.date_created = dateFilter;
      }

      if (Object.keys(directusFilter).length > 0) {
        params.filter = JSON.stringify(directusFilter);
      }

      const response = await directusApi.get(`/users`, {
        params,
      });

      const total = response.data.meta?.filter_count || 0;

      return {
        data: response.data.data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  /**
   * Get single user by ID
   */
  static async getUserById(id: string): Promise<AdminUser> {
    try {
      const response = await directusApi.get(`/users/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update user status
   */
  static async updateUserStatus(
    id: string,
    status: UserStatus
  ): Promise<AdminUser> {
    try {
      const response = await directusApi.patch(`/users/${id}`, { status });
      return response.data.data;
    } catch (error) {
      console.error(`Error updating user status ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete user (soft delete by setting status to inactive)
   */
  static async deleteUser(id: string): Promise<void> {
    try {
      // Soft delete: set status to inactive
      await directusApi.patch(`/users/${id}`, { status: "inactive" });
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Permanently delete user (hard delete)
   */
  static async permanentlyDeleteUser(id: string): Promise<void> {
    try {
      await directusApi.delete(`/users/${id}`);
    } catch (error) {
      console.error(`Error permanently deleting user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Suspend/Ban user
   */
  static async banUser(id: string): Promise<AdminUser> {
    try {
      return await this.updateUserStatus(id, "banned");
    } catch (error) {
      console.error(`Error banning user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Activate user
   */
  static async activateUser(id: string): Promise<AdminUser> {
    try {
      return await this.updateUserStatus(id, "active");
    } catch (error) {
      console.error(`Error activating user ${id}:`, error);
      throw error;
    }
  }

  /**
   * Bulk update user status
   */
  static async bulkUpdateStatus(
    ids: string[],
    status: UserStatus
  ): Promise<BulkActionResult> {
    const result: BulkActionResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const id of ids) {
      try {
        await this.updateUserStatus(id, status);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors?.push({
          id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return result;
  }

  /**
   * Bulk delete users (soft delete)
   */
  static async bulkDelete(ids: string[]): Promise<BulkActionResult> {
    const result: BulkActionResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const id of ids) {
      try {
        await this.deleteUser(id);
        result.success++;
      } catch (error) {
        result.failed++;
        result.errors?.push({
          id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return result;
  }

  /**
   * Bulk action handler
   */
  static async bulkAction(
    payload: BulkActionPayload
  ): Promise<BulkActionResult> {
    switch (payload.action) {
      case "activate":
        return await this.bulkUpdateStatus(payload.ids, "active");
      case "deactivate":
        return await this.bulkUpdateStatus(payload.ids, "inactive");
      case "ban":
        return await this.bulkUpdateStatus(payload.ids, "banned");
      case "delete":
        return await this.bulkDelete(payload.ids);
      default:
        throw new Error(`Unknown bulk action: ${payload.action}`);
    }
  }

  /**
   * Get user preferences
   */
  static async getUserPreferences(
    userId: string
  ): Promise<Record<string, unknown> | null> {
    try {
      // Assuming preferences are stored in a separate collection
      const response = await directusApi.get(`/items/user_preferences`, {
        params: {
          filter: JSON.stringify({ user_id: { _eq: userId } }),
        },
      });

      return response.data.data[0] || null;
    } catch (error) {
      console.error(`Error fetching preferences for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<Partial<AdminDashboardStats>> {
    try {
      // Total users
      const totalResponse = await directusApi.get(`/users`, {
        params: {
          meta: "filter_count",
          limit: 0,
        },
      });

      // Active users
      const activeResponse = await directusApi.get(`/users`, {
        params: {
          meta: "filter_count",
          limit: 0,
          filter: JSON.stringify({ status: { _eq: "active" } }),
        },
      });

      // Users created today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayResponse = await directusApi.get(`/users`, {
        params: {
          meta: "filter_count",
          limit: 0,
          filter: JSON.stringify({
            date_created: { _gte: today.toISOString() },
          }),
        },
      });

      return {
        total_users: totalResponse.data.meta?.filter_count || 0,
        active_users: activeResponse.data.meta?.filter_count || 0,
        users_today: todayResponse.data.meta?.filter_count || 0,
      };
    } catch (error) {
      console.error("Error fetching user dashboard stats:", error);
      throw error;
    }
  }

  /**
   * Get user activity/stats
   */
  static async getUserActivity(userId: string): Promise<{
    total_articles_read: number;
    last_login: string | null;
    activity_count: number;
  } | null> {
    try {
      // This would require tracking user activity in a separate collection
      // For now, returning placeholder
      return {
        total_articles_read: 0,
        last_login: null,
        activity_count: 0,
      };
    } catch (error) {
      console.error(`Error fetching activity for user ${userId}:`, error);
      return null;
    }
  }
}

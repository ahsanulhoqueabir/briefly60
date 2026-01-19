import dbConnect from "@/lib/mongodb";
import User, { IUser } from "@/models/User.model";
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
 * Admin service for managing users in MongoDB
 */
export class AdminUserService {
  /**
   * Format user for admin response
   */
  private static formatUser(user: IUser): AdminUser {
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      plan: "free" as const, // Default plan - you might want to add this field to User model
      image: user.image || undefined,
      rbac: user.rbac,
      preferences: user.preferences
        ? {
            categories: [],
            language:
              user.preferences.language === "en" ||
              user.preferences.language === "bn"
                ? user.preferences.language
                : "en",
            notifications_enabled: user.preferences.notifications || false,
            theme:
              user.preferences.theme === "light" ||
              user.preferences.theme === "dark"
                ? user.preferences.theme
                : "light",
          }
        : undefined,
      // AdminUser specific fields
      status: "active" as const, // Default status - you might want to add this field to User model
      role: user.rbac,
      date_created: user.createdAt.toISOString(),
    };
  }

  /**
   * Build MongoDB filter from admin filters
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static buildFilter(filters: AdminUserFilters): Record<string, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (filters.search) {
      filter.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.registered_from || filters.registered_to) {
      filter.createdAt = {};
      if (filters.registered_from) {
        filter.createdAt.$gte = new Date(filters.registered_from);
      }
      if (filters.registered_to) {
        filter.createdAt.$lte = new Date(filters.registered_to);
      }
    }

    return filter;
  }

  /**
   * Get all users with filters and pagination
   */
  static async getUsers(
    filters: AdminUserFilters = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<AdminApiResponse<AdminUser[]>> {
    try {
      await dbConnect();

      const mongoFilter = this.buildFilter(filters);
      const offset = (page - 1) * limit;

      // Get users with pagination
      const users = await User.find(mongoFilter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec();

      // Get total count
      const totalCount = await User.countDocuments(mongoFilter);

      const formattedUsers = users.map((user) => this.formatUser(user));

      return {
        data: formattedUsers,
        meta: {
          page: page,
          limit: limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        success: true,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        data: [],
        meta: {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0,
        },
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get single user by ID
   */
  static async getUserById(
    id: string,
  ): Promise<AdminApiResponse<AdminUser | null>> {
    try {
      await dbConnect();

      const user = await User.findById(id).exec();

      if (!user) {
        return {
          data: null,
          success: false,
          error: "User not found",
        };
      }

      return {
        data: this.formatUser(user),
        success: true,
      };
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update user (basic info)
   */
  static async updateUser(
    id: string,
    data: Partial<Pick<AdminUser, "name" | "email" | "rbac">>,
  ): Promise<AdminApiResponse<AdminUser | null>> {
    try {
      await dbConnect();

      // Build update data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.email) updateData.email = data.email;
      if (data.rbac) updateData.rbac = data.rbac;

      const user = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).exec();

      if (!user) {
        return {
          data: null,
          success: false,
          error: "User not found",
        };
      }

      return {
        data: this.formatUser(user),
        success: true,
      };
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete user (hard delete)
   */
  static async deleteUser(id: string): Promise<AdminApiResponse<boolean>> {
    try {
      await dbConnect();

      const result = await User.findByIdAndDelete(id).exec();

      if (!result) {
        return {
          data: false,
          success: false,
          error: "User not found",
        };
      }

      return {
        data: true,
        success: true,
      };
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update user role (RBAC) - Only superadmin can change roles
   */
  static async updateUserRole(
    id: string,
    rbac: IUser["rbac"],
    adminUserId: string,
  ): Promise<AdminApiResponse<AdminUser | null>> {
    try {
      await dbConnect();

      // Check if admin making the change is superadmin
      const adminUser = await User.findById(adminUserId).exec();
      if (!adminUser || adminUser.rbac !== "superadmin") {
        return {
          data: null,
          success: false,
          error: "Only superadmin can change user roles",
        };
      }

      // Prevent changing own role
      if (adminUserId === id) {
        return {
          data: null,
          success: false,
          error: "You cannot change your own role",
        };
      }

      return await this.updateUser(id, { rbac });
    } catch (error) {
      console.error(`Error updating user role ${id}:`, error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  /**
   * Update user status
   */
  static async updateUserStatus(
    id: string,
    status: UserStatus,
  ): Promise<AdminApiResponse<AdminUser | null>> {
    try {
      await dbConnect();

      // Note: Since our User model doesn't have a status field,
      // we'll use the rbac field for now or you can add a status field to the User model
      // For now, mapping status to appropriate action
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {};

      if (status === "banned") {
        // You might want to add a banned field to User model
        // For now, we'll just update a custom field or handle it differently
        updateData.rbac = "user"; // demote banned users
      }

      const user = await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).exec();

      if (!user) {
        return {
          data: null,
          success: false,
          error: "User not found",
        };
      }

      return {
        data: this.formatUser(user),
        success: true,
      };
    } catch (error) {
      console.error(`Error updating user status ${id}:`, error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
  /**
   * Bulk delete users
   */
  static async bulkDelete(ids: string[]): Promise<BulkActionResult> {
    const result: BulkActionResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    await dbConnect();

    for (const id of ids) {
      try {
        const deleteResult = await User.findByIdAndDelete(id).exec();
        if (deleteResult) {
          result.success++;
        } else {
          result.failed++;
          result.errors?.push({
            id,
            error: "User not found",
          });
        }
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
   * Bulk update user roles
   */
  static async bulkUpdateRole(
    ids: string[],
    rbac: IUser["rbac"],
  ): Promise<BulkActionResult> {
    const result: BulkActionResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    await dbConnect();

    for (const id of ids) {
      try {
        const user = await User.findByIdAndUpdate(
          id,
          { rbac },
          { new: true, runValidators: true },
        ).exec();
        if (user) {
          result.success++;
        } else {
          result.failed++;
          result.errors?.push({
            id,
            error: "User not found",
          });
        }
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
    payload: BulkActionPayload,
  ): Promise<BulkActionResult> {
    switch (payload.action) {
      case "delete":
        return await this.bulkDelete(payload.ids);
      case "promote":
        return await this.bulkUpdateRole(payload.ids, "admin");
      case "demote":
        return await this.bulkUpdateRole(payload.ids, "user");
      default:
        throw new Error(`Unknown bulk action: ${payload.action}`);
    }
  }

  /**
   * Get user preferences
   */
  static async getUserPreferences(
    userId: string,
  ): Promise<IUser["preferences"] | null> {
    try {
      await dbConnect();

      const user = await User.findById(userId).select("preferences").exec();
      return user?.preferences || null;
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
      await dbConnect();

      // Get user counts using aggregation
      const stats = await User.aggregate([
        {
          $group: {
            _id: "$rbac",
            count: { $sum: 1 },
          },
        },
      ]).exec();

      // Get total count
      const totalCount = await User.countDocuments().exec();

      // Get users created today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCount = await User.countDocuments({
        createdAt: { $gte: today },
      }).exec();

      // Process stats
      const roleCounts: Record<string, number> = {};
      stats.forEach((stat) => {
        roleCounts[stat._id] = stat.count;
      });

      return {
        total_users: totalCount,
        admin_users: roleCounts.admin || 0,
        regular_users: roleCounts.user || 0,
        users_today: todayCount,
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

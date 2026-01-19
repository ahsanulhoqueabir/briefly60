import { withAdmin } from "@/middleware/verify-auth";
import { checkPermission } from "@/middleware/role-permission";
import { AdminArticleService } from "@/services/admin-article.service";
import { AdminUserService } from "@/services/admin-user.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/dashboard/stats - Get dashboard statistics
 * Requires: view_dashboard permission (admin, superadmin, or editor)
 */
export const GET = async (request: NextRequest) => {
  try {
    // Check if user has permission to view dashboard
    const dashboardAuth = await checkPermission(request, "view_dashboard");

    if (!dashboardAuth.authorized) {
      return NextResponse.json(
        {
          success: false,
          message: dashboardAuth.error || "Access denied",
        },
        { status: 403 },
      );
    }

    const user = dashboardAuth.user!;

    // Fetch article stats (available to all dashboard users)
    const articleStats = await AdminArticleService.getDashboardStats();

    // Check if user can view user stats
    const statsAuth = await checkPermission(request, "view_stats");
    const userStats = statsAuth.authorized
      ? await AdminUserService.getDashboardStats()
      : {
          total_users: 0,
          admin_users: 0,
          regular_users: 0,
          active_users: 0,
          users_today: 0,
        };

    return NextResponse.json({
      success: true,
      data: {
        articles: articleStats,
        users: userStats,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};

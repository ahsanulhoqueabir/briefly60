import { withAdmin } from "@/middleware/verify-auth";
import { AdminArticleService } from "@/services/admin-article.service";
import { AdminUserService } from "@/services/admin-user.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/dashboard/stats - Get dashboard statistics
 * Requires: admin or superadmin role
 */
export const GET = withAdmin(async (request: NextRequest) => {
  try {
    // Fetch both article and user stats in parallel
    const [articleStats, userStats] = await Promise.all([
      AdminArticleService.getDashboardStats(),
      AdminUserService.getDashboardStats(),
    ]);

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
      { status: 500 }
    );
  }
});

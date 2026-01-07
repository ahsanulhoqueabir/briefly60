import { withAdmin } from "@/middleware/verify-auth";
import { AdminArticleService } from "@/services/admin-article.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/dashboard/categories - Get all categories
 * Requires: admin or superadmin role
 */
export const GET = withAdmin(async (request: NextRequest) => {
  try {
    const categories = await AdminArticleService.getCategories();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch categories",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});

import { withAdmin } from "@/middleware/verify-auth";
import { AdminArticleService } from "@/services/admin-article.service";
import { BulkArticleAction } from "@/types/admin.types";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/dashboard/articles/bulk - Bulk actions on articles
 * Requires: admin or superadmin role
 */
export const POST = withAdmin(async (request: NextRequest) => {
  try {
    const body = await request.json();

    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing or invalid 'ids' field. Must be a non-empty array.",
        },
        { status: 400 }
      );
    }

    if (!body.action) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing 'action' field",
        },
        { status: 400 }
      );
    }

    const validActions: BulkArticleAction[] = [
      "delete",
      "publish",
      "unpublish",
      "archive",
    ];
    if (!validActions.includes(body.action)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid action. Must be one of: ${validActions.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const result = await AdminArticleService.bulkAction({
      ids: body.ids,
      action: body.action,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Bulk ${body.action} completed. Success: ${result.success}, Failed: ${result.failed}`,
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to perform bulk action",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});

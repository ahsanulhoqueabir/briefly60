import { withAdmin } from "@/middleware/verify-auth";
import { AdminUserService } from "@/services/admin-user.service";
import { BulkUserAction } from "@/types/admin.types";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/dashboard/users/bulk - Bulk actions on users
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

    const validActions: BulkUserAction[] = ["delete", "activate", "ban"];
    if (!validActions.includes(body.action)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid action. Must be one of: ${validActions.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const result = await AdminUserService.bulkAction({
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

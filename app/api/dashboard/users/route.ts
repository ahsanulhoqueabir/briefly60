import { withAdmin } from "@/middleware/verify-auth";
import { AdminUserService } from "@/services/admin-user.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/dashboard/users - Get users list with filters and pagination
 * Requires: admin or superadmin role
 */
export const GET = withAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Parse filters
    const filters = {
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") as
        | "active"
        | "inactive"
        | "banned"
        | undefined,
      plan: searchParams.get("plan") as
        | "free"
        | "pro"
        | "enterprise"
        | undefined,
      rbac: searchParams.get("rbac") as
        | "superadmin"
        | "admin"
        | "editor"
        | "user"
        | undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
    };

    // Remove undefined values
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters];
      }
    });

    const response = await AdminUserService.getUsers(filters, page, limit);

    return NextResponse.json({
      success: true,
      ...response,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});

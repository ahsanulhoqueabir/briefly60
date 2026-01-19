import { withAdmin } from "@/middleware/verify-auth";
import { checkPermission } from "@/middleware/role-permission";
import { AdminUserService } from "@/services/admin-user.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/dashboard/users - Get users list with filters and pagination
 * Requires: view_users permission (admin or superadmin)
 */
export const GET = async (request: NextRequest) => {
  try {
    // Check permission
    const auth = await checkPermission(request, "view_users");

    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          message: auth.error || "Access denied",
        },
        { status: 403 },
      );
    }

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

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
};

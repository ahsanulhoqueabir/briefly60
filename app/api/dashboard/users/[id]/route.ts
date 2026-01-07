import { withAdmin } from "@/middleware/verify-auth";
import { AdminUserService } from "@/services/admin-user.service";
import { JwtPayload } from "@/types/jwt.types";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/dashboard/users/[id] - Get user details
 * Requires: admin or superadmin role
 */
export const GET = withAdmin(
  async (
    request: NextRequest,
    user: JwtPayload,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await params;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            message: "User ID is required",
          },
          { status: 400 }
        );
      }

      const userData = await AdminUserService.getUserById(id);

      if (!userData) {
        return NextResponse.json(
          {
            success: false,
            message: "User not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: userData,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch user",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * PATCH /api/dashboard/users/[id] - Update user
 * Requires: admin or superadmin role
 */
export const PATCH = withAdmin(
  async (
    request: NextRequest,
    user: JwtPayload,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await params;
      const body = await request.json();

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            message: "User ID is required",
          },
          { status: 400 }
        );
      }

      // Handle status update
      if (body.status) {
        const validStatuses = ["active", "inactive", "banned"];
        if (!validStatuses.includes(body.status)) {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid status. Must be one of: ${validStatuses.join(
                ", "
              )}`,
            },
            { status: 400 }
          );
        }

        await AdminUserService.updateUserStatus(id, body.status);

        return NextResponse.json({
          success: true,
          message: `User status updated to ${body.status}`,
        });
      }

      // For other updates, you can add more logic here
      return NextResponse.json(
        {
          success: false,
          message: "No valid update fields provided",
        },
        { status: 400 }
      );
    } catch (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update user",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/dashboard/users/[id] - Delete user
 * Requires: admin or superadmin role
 */
export const DELETE = withAdmin(
  async (
    request: NextRequest,
    user: JwtPayload,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    try {
      const { id } = await params;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            message: "User ID is required",
          },
          { status: 400 }
        );
      }

      await AdminUserService.deleteUser(id);

      return NextResponse.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to delete user",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

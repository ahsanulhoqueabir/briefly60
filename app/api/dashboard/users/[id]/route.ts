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
    { params }: { params: Promise<{ id: string }> },
  ) => {
    try {
      const { id } = await params;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            message: "User ID is required",
          },
          { status: 400 },
        );
      }

      const userData = await AdminUserService.getUserById(id);

      if (!userData) {
        return NextResponse.json(
          {
            success: false,
            message: "User not found",
          },
          { status: 404 },
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
        { status: 500 },
      );
    }
  },
);

/**
 * PATCH /api/dashboard/users/[id] - Update user
 * Requires: admin or superadmin role
 * Role updates require: superadmin role only
 */
export const PATCH = withAdmin(
  async (
    request: NextRequest,
    user: JwtPayload,
    { params }: { params: Promise<{ id: string }> },
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
          { status: 400 },
        );
      }

      // Handle role update - Only superadmin can change roles
      if (body.role || body.rbac) {
        const newRole = body.role || body.rbac;
        const validRoles = ["superadmin", "admin", "editor", "user"];

        if (!validRoles.includes(newRole)) {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
            },
            { status: 400 },
          );
        }

        const result = await AdminUserService.updateUserRole(
          id,
          newRole,
          user.id,
        );

        if (!result.success) {
          return NextResponse.json(
            {
              success: false,
              message: result.error || "Failed to update user role",
            },
            { status: 403 },
          );
        }

        return NextResponse.json({
          success: true,
          message: `User role updated to ${newRole}`,
          data: result.data,
        });
      }

      // Handle status update
      if (body.status) {
        const validStatuses = ["active", "inactive", "banned"];
        if (!validStatuses.includes(body.status)) {
          return NextResponse.json(
            {
              success: false,
              message: `Invalid status. Must be one of: ${validStatuses.join(
                ", ",
              )}`,
            },
            { status: 400 },
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
        { status: 400 },
      );
    } catch (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update user",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
);

/**
 * DELETE /api/dashboard/users/[id] - Delete user
 * Requires: admin or superadmin role
 */
export const DELETE = withAdmin(
  async (
    request: NextRequest,
    user: JwtPayload,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    try {
      const { id } = await params;

      if (!id) {
        return NextResponse.json(
          {
            success: false,
            message: "User ID is required",
          },
          { status: 400 },
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
        { status: 500 },
      );
    }
  },
);

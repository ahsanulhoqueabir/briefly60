import { withAuth } from "@/middleware/verify-auth";
import { AuthService } from "@/services/auth.services";
import { NextResponse } from "next/server";

export const GET = withAuth(async (request, user) => {
  try {
    const userData = await AuthService.getUserbyId(user!.id);
    if (userData?.success) {
      return NextResponse.json(
        {
          success: true,
          user: userData.user,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
          error: "USER_NOT_FOUND",
        },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user data",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
});

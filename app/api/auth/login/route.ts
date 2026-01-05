import { AuthService } from "@/services/auth.services";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 }
      );
    }

    const res = await AuthService.login({ email, password });

    if (res.success) {
      return NextResponse.json(
        {
          success: true,
          user: res.user,
          token: res.token,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: res.error || "Invalid credentials",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Login failed",
        details: error instanceof Error ? error.message : null,
      },
      { status: 500 }
    );
  }
}

import { verifyTurnstile } from "@/lib/turnstile";
import { AuthService } from "@/services/auth.services";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password, name, confirm_password, turnstileToken } =
      await req.json();

    if (!email || !password || !turnstileToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, password, and CAPTCHA token are required",
        },
        { status: 400 },
      );
    }

    const isTurnstileValid = await verifyTurnstile(turnstileToken);

    if (!isTurnstileValid) {
      return NextResponse.json(
        {
          success: false,
          error: "CAPTCHA verification failed",
        },
        { status: 400 },
      );
    }
    if (password !== confirm_password) {
      return NextResponse.json(
        {
          success: false,
          error: "Passwords do not match",
        },
        { status: 400 },
      );
    }

    const res = await AuthService.createAccount({
      email,
      password,
      name,
      confirm_password,
    });

    if (res.success) {
      return NextResponse.json(
        {
          success: true,
          user: res.user,
          token: res.token,
        },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          error: res.error || "Invalid credentials",
        },
        { status: 401 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Login failed",
        details: error instanceof Error ? error.message : null,
      },
      { status: 500 },
    );
  }
}

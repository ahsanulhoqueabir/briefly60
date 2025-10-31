import { NextRequest, NextResponse } from "next/server";
import { firebaseAuthService } from "@/services/auth/firebase";

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    let result;

    if (action === "signin") {
      result = await firebaseAuthService.signInWithEmail(email, password);
    } else if (action === "signup") {
      if (!name) {
        return NextResponse.json(
          { error: "Name is required for signup" },
          { status: 400 }
        );
      }
      result = await firebaseAuthService.signUpWithEmail(name, email, password);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      isNewUser: result.isNewUser,
    });
  } catch (error) {
    console.error("Email auth error:", error);
    const message =
      error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

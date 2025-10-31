import { NextResponse } from "next/server";
import { firebaseAuthService } from "@/services/auth/firebase";

export async function POST() {
  try {
    await firebaseAuthService.signOut();

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Clear the session cookie
    response.cookies.delete("session");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}

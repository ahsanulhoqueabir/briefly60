import { withAuth } from "@/middleware/verify-auth";
import { QuizService } from "@/services/quiz.services";
import { NextResponse } from "next/server";

/**
 * GET /api/quiz/history
 * Get user's quiz attempt history
 */
export const GET = withAuth(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = parseInt(searchParams.get("skip") || "0");

    const result = await QuizService.getUserQuizHistory(user!.id, limit, skip);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Get quiz history error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch quiz history",
      },
      { status: 500 },
    );
  }
});

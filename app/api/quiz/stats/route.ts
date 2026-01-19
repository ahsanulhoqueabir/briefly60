import { withAuth } from "@/middleware/verify-auth";
import { QuizService } from "@/services/quiz.services";
import { NextResponse } from "next/server";

/**
 * GET /api/quiz/stats
 * Get user's quiz statistics
 */
export const GET = withAuth(async (request, user) => {
  try {
    const result = await QuizService.getUserQuizHistory(user!.id, 100, 0);

    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch quiz stats",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        stats: {
          total_attempts: result.data.total,
          average_score: result.data.average_score,
          highest_score: result.data.best_score,
          total_correct: 0,
          total_questions: 0,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get quiz stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch quiz stats",
      },
      { status: 500 },
    );
  }
});

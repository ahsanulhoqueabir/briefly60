import { QuizService } from "@/services/quiz.services";
import { authMiddleware } from "@/middleware/verify-auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/quiz/article/[id]
 * Get user's quiz attempts for a specific article
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Authenticate the user
    const authResult = await authMiddleware(request);

    if (!authResult.success || !authResult.user) {
      return (
        authResult.response ||
        NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          { status: 401 },
        )
      );
    }

    const { id: articleId } = await params;

    const result = await QuizService.getArticleAttempts(
      authResult.user.id,
      articleId,
    );

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Get article attempts error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching article attempts.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

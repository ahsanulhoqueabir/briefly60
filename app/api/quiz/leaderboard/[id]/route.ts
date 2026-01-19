import { QuizService } from "@/services/quiz.services";
import { NextResponse } from "next/server";

/**
 * GET /api/quiz/leaderboard/[id]
 * Get quiz leaderboard for a specific article
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: articleId } = await params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await QuizService.getArticleLeaderboard(articleId, limit);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Get leaderboard error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching leaderboard.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

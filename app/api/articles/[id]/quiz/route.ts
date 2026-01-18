import { ArticleService } from "@/services/article.service";
import { NextResponse } from "next/server";

/**
 * GET /api/articles/[id]/quiz
 * Get quiz questions for a specific article
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await ArticleService.getArticleQuiz(id);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error) {
    console.error("Get article quiz error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching quiz questions.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

import { ArticleService } from "@/services/article.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/articles/trending
 * Get trending articles (most quizzed in last 7 days)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await ArticleService.getTrendingArticles(limit);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Get trending articles error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching trending articles.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

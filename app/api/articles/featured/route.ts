import { NewsService } from "@/services/news.services";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/articles/featured - Get featured articles
 *
 * Featured articles are:
 * - Published status
 * - High importance (>= 7)
 * - Low clickbait score (<= 3)
 * - Sorted by importance (descending)
 *
 * Query Parameters:
 * - limit: number (default: 10)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");
    const limitNum = limit ? parseInt(limit, 10) : 10;

    const articles = await NewsService.getFeaturedArticles(limitNum);

    return NextResponse.json({ data: articles }, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in GET /api/articles/featured:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch featured articles",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

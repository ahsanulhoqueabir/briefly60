import { ArticleService } from "@/services/article.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/articles/search - Search articles
 *
 * Searches in:
 * - title
 * - description
 * - content
 *
 * Uses MongoDB text search index
 *
 * Query Parameters:
 * - q: search query (required)
 * - limit: number (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          message: "Search query (q) is required",
        },
        { status: 400 },
      );
    }

    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await ArticleService.searchArticles(query, limit);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Search articles error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while searching articles.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

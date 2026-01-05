import { NewsService } from "@/services/news.services";
import {
  ArticleQueryParams,
  ArticleStatus,
  SortParams,
} from "@/types/news.types";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/articles/search - Search articles
 *
 * Searches in:
 * - title
 * - corrected_title
 * - content
 * - summary_60_bn
 * - summary_60_en
 *
 * Query Parameters:
 * - q: search query (required)
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - status: published | draft | archived
 * - category: string
 * - sort_by: date_created | date_updated | published_at | importance | clickbait_score
 * - sort_order: asc | desc
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Search query (q) is required" },
        { status: 400 }
      );
    }

    // Build additional parameters
    const params: Omit<ArticleQueryParams, "search"> = {};

    const page = searchParams.get("page");
    if (page) {
      params.page = parseInt(page, 10);
    }

    const limit = searchParams.get("limit");
    if (limit) {
      params.limit = parseInt(limit, 10);
    }

    const status = searchParams.get("status");
    if (status && ["published", "draft", "archived"].includes(status)) {
      params.status = status as ArticleStatus;
    }

    const category = searchParams.get("category");
    if (category) {
      params.category = category;
    }

    const sortBy = searchParams.get("sort_by");
    if (
      sortBy &&
      [
        "date_created",
        "date_updated",
        "published_at",
        "importance",
        "clickbait_score",
      ].includes(sortBy)
    ) {
      params.sort_by = sortBy as SortParams["sort_by"];
    }

    const sortOrder = searchParams.get("sort_order");
    if (sortOrder && ["asc", "desc"].includes(sortOrder)) {
      params.sort_order = sortOrder as SortParams["sort_order"];
    }

    const result = await NewsService.searchArticles(query, params);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in GET /api/articles/search:", error);

    return NextResponse.json(
      {
        error: "Failed to search articles",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

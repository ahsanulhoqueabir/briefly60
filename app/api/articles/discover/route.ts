import { NewsService } from "@/services/news.services";
import { ArticleQueryParams } from "@/types/news.types";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering - no caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET /api/articles/discover - Advanced filtering for discover page
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const queryParams: ArticleQueryParams = {
      status: "published",
    };

    // Pagination
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    if (page) queryParams.page = parseInt(page);
    if (limit) queryParams.limit = parseInt(limit);

    // Source filter
    const source_name = searchParams.get("source_name");
    if (source_name) queryParams.source_name = source_name;

    // Category filter
    const category = searchParams.get("category");
    if (category) queryParams.category = category;

    // Date range filters
    const published_after = searchParams.get("published_after");
    const published_before = searchParams.get("published_before");
    if (published_after) queryParams.published_after = published_after;
    if (published_before) queryParams.published_before = published_before;

    // Importance range
    const importance_min = searchParams.get("importance_min");
    const importance_max = searchParams.get("importance_max");
    if (importance_min) queryParams.importance_min = parseInt(importance_min);
    if (importance_max) queryParams.importance_max = parseInt(importance_max);

    // Clickbait score range
    const clickbait_min = searchParams.get("clickbait_min");
    const clickbait_max = searchParams.get("clickbait_max");
    if (clickbait_min) queryParams.clickbait_min = parseInt(clickbait_min);
    if (clickbait_max) queryParams.clickbait_max = parseInt(clickbait_max);

    // Search query
    const search = searchParams.get("search");
    if (search) queryParams.search = search;

    // Keywords filter
    const keywords = searchParams.get("keywords");
    if (keywords) {
      queryParams.keywords = keywords.split(",").map((k) => k.trim());
    }

    // Sorting
    const sort_by = searchParams.get("sort_by");
    const sort_order = searchParams.get("sort_order");
    if (sort_by) queryParams.sort_by = sort_by as ArticleQueryParams["sort_by"];
    if (sort_order)
      queryParams.sort_order = sort_order as ArticleQueryParams["sort_order"];

    const result = await NewsService.getArticles(queryParams);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error in discover API:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch articles";

    return NextResponse.json(
      {
        error: "Failed to fetch articles",
        message: errorMessage,
        data: [],
        meta: {
          total_count: 0,
          filter_count: 0,
          page: 1,
          limit: 20,
          total_pages: 0,
        },
      },
      { status: 500 },
    );
  }
}

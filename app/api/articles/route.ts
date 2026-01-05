import { NewsService } from "@/services/news.services";
import { ArticleQueryParams, SortParams } from "@/types/news.types";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/articles - Fetch articles with advanced filtering
 *
 * Query Parameters:
 * - status: published | draft | archived
 * - category: string
 * - published_after: ISO date string
 * - published_before: ISO date string
 * - importance_min: number (0-10)
 * - importance_max: number (0-10)
 * - clickbait_max: number
 * - search: string (searches in title, content, summaries)
 * - keywords: comma-separated keywords
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - sort_by: date_created | date_updated | published_at | importance | clickbait_score
 * - sort_order: asc | desc
 * - fields: comma-separated field names
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Build query parameters from search params
    const queryParams: ArticleQueryParams = {};

    // Status filter
    const status = searchParams.get("status");
    if (status && ["published", "draft", "archived"].includes(status)) {
      queryParams.status = status as "published" | "draft" | "archived";
    }

    // Category filter
    const category = searchParams.get("category");
    if (category) {
      queryParams.category = category;
    }

    // Date range filters
    const publishedAfter = searchParams.get("published_after");
    if (publishedAfter) {
      queryParams.published_after = publishedAfter;
    }

    const publishedBefore = searchParams.get("published_before");
    if (publishedBefore) {
      queryParams.published_before = publishedBefore;
    }

    // Importance filters
    const importanceMin = searchParams.get("importance_min");
    if (importanceMin) {
      queryParams.importance_min = parseInt(importanceMin, 10);
    }

    const importanceMax = searchParams.get("importance_max");
    if (importanceMax) {
      queryParams.importance_max = parseInt(importanceMax, 10);
    }

    // Clickbait filter
    const clickbaitMax = searchParams.get("clickbait_max");
    if (clickbaitMax) {
      queryParams.clickbait_max = parseInt(clickbaitMax, 10);
    }

    // Search
    const search = searchParams.get("search");
    if (search) {
      queryParams.search = search;
    }

    // Keywords (comma-separated)
    const keywords = searchParams.get("keywords");
    if (keywords) {
      queryParams.keywords = keywords.split(",").map((k) => k.trim());
    }

    // Pagination
    const page = searchParams.get("page");
    if (page) {
      queryParams.page = parseInt(page, 10);
    }

    const limit = searchParams.get("limit");
    if (limit) {
      queryParams.limit = parseInt(limit, 10);
    }

    // Sorting
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
      queryParams.sort_by = sortBy as SortParams["sort_by"];
    }

    const sortOrder = searchParams.get("sort_order");
    if (sortOrder && ["asc", "desc"].includes(sortOrder)) {
      queryParams.sort_order = sortOrder as SortParams["sort_order"];
    }

    // Fields selection
    const fields = searchParams.get("fields");
    if (fields) {
      queryParams.fields = fields.split(",").map((f) => f.trim());
    }

    // Fetch articles
    const result = await NewsService.getArticles(queryParams);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in GET /api/articles:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch articles",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

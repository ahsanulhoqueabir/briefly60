import { withEditor } from "@/middleware/verify-auth";
import { ArticleService } from "@/services/article.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/articles - Fetch articles with filtering and pagination
 *
 * Query Parameters:
 * - status: published | draft | archived
 * - category: string
 * - source: string
 * - importance: low | medium | high | breaking
 * - search: string (searches in title, description, content)
 * - page: number (default: 1)
 * - limit: number (default: 20)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const options = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: Math.min(parseInt(searchParams.get("limit") || "20"), 100),
      category: searchParams.get("category") || undefined,
      source: searchParams.get("source") || undefined,
      importance: searchParams.get("importance") as
        | "low"
        | "medium"
        | "high"
        | "breaking"
        | undefined,
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || "published",
    };

    const result = await ArticleService.getArticles(options);

    if (result.success) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Get articles error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching articles.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/articles - Create a new article (Editor/Admin only)
 */
export const POST = withEditor(async (req: Request) => {
  try {
    const body = await req.json();

    const result = await ArticleService.createArticle(body);

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error("Create article error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while creating the article.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
});

import { withAdmin, withEditor } from "@/middleware/verify-auth";
import { ArticleService } from "@/services/article.service";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/articles/[id] - Get a single article by ID
 *
 * Query Parameters:
 * - includeQuiz: boolean (optional, default: false)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const includeQuiz = searchParams.get("includeQuiz") === "true";

    const result = await ArticleService.getArticleById(id, includeQuiz);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 404 });
    }
  } catch (error) {
    console.error("Get article error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while fetching the article.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/articles/[id] - Update an article (Editor/Admin only)
 */
export const PATCH = withEditor(
  async (
    request: NextRequest,
    user: any,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    try {
      const { id } = await params;
      const body = await request.json();

      const result = await ArticleService.updateArticle(id, body);

      if (result.success) {
        return NextResponse.json(result, { status: 200 });
      } else {
        return NextResponse.json(result, { status: 400 });
      }
    } catch (error) {
      console.error("Update article error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "An error occurred while updating the article.",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
);

/**
 * DELETE /api/articles/[id] - Delete an article (Admin only)
 */
export const DELETE = withAdmin(
  async (
    request: NextRequest,
    user: any,
    { params }: { params: Promise<{ id: string }> },
  ) => {
    try {
      const { id } = await params;

      const result = await ArticleService.deleteArticle(id);

      if (result.success) {
        return NextResponse.json(result, { status: 200 });
      } else {
        return NextResponse.json(result, { status: 404 });
      }
    } catch (error) {
      console.error("Delete article error:", error);
      return NextResponse.json(
        {
          success: false,
          message: "An error occurred while deleting the article.",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 },
      );
    }
  },
);

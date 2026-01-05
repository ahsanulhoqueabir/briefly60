import { NewsService } from "@/services/news.services";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/articles/[id] - Get a single article by ID
 *
 * Query Parameters:
 * - fields: comma-separated field names (optional)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;

    // Fields selection
    const fields = searchParams.get("fields");
    const fieldArray = fields
      ? fields.split(",").map((f) => f.trim())
      : undefined;

    const article = await NewsService.getArticleById(id, fieldArray);

    return NextResponse.json(article, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in GET /api/articles/[id]:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch article",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/articles/[id] - Update an article
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedArticle = await NewsService.updateArticle({
      id,
      ...body,
    });

    return NextResponse.json(updatedArticle, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in PATCH /api/articles/[id]:", error);

    return NextResponse.json(
      {
        error: "Failed to update article",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/articles/[id] - Delete an article
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await NewsService.deleteArticle(id);

    return NextResponse.json(
      { message: "Article deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in DELETE /api/articles/[id]:", error);

    return NextResponse.json(
      {
        error: "Failed to delete article",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

import { withAuth } from "@/middleware/verify-auth";
import { BookmarkService } from "@/services/bookmark.services";
import { NextResponse } from "next/server";

/**
 * GET /api/bookmarks
 * Get user's bookmarks
 */
export const GET = withAuth(async (request, user) => {
  try {
    const result = await BookmarkService.getBookmarks(user!.id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch bookmarks",
      },
      { status: 500 },
    );
  }
});

/**
 * POST /api/bookmarks
 * Toggle bookmark (create or remove)
 */
export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json();
    const { news_id } = body;

    if (!news_id) {
      return NextResponse.json(
        { success: false, message: "Article ID is required" },
        { status: 400 },
      );
    }

    const result = await BookmarkService.toggleBookmark(news_id, user!.id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: result.error === "ARTICLE_NOT_FOUND" ? 404 : 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        isBookmarked: result.isBookmarked,
      },
      { status: result.isBookmarked ? 201 : 200 },
    );
  } catch (error) {
    console.error("Toggle bookmark error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to toggle bookmark",
      },
      { status: 500 },
    );
  }
});

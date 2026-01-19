import { withAuth } from "@/middleware/verify-auth";
import { BookmarkService } from "@/services/bookmark.services";
import { JwtPayload } from "@/types/jwt.types";
import { NextResponse } from "next/server";

export const POST = withAuth(async (req: Request, user?: JwtPayload) => {
  try {
    const body = await req.json();

    // Validate news ID
    if (!body.news) {
      return NextResponse.json(
        {
          success: false,
          message: "News ID is required to toggle bookmark.",
          error: "MISSING_NEWS_ID",
        },
        { status: 400 },
      );
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required to toggle bookmark.",
          error: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }

    // Toggle bookmark (create if doesn't exist, delete if exists)
    const result = await BookmarkService.toggleBookmark(body.news, user!.id);

    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          message: result.message,
          isBookmarked: result.isBookmarked,
          bookmarkId: result.bookmarkId,
        },
        { status: 200 },
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          error: result.error,
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Toggle bookmark API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing the request.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});

export const GET = withAuth(async (req: Request, user?: JwtPayload) => {
  try {
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required to get bookmarks.",
          error: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const newsId = searchParams.get("newsId");

    // If newsId is provided, check if this specific news is bookmarked
    if (newsId) {
      const result = await BookmarkService.checkBookmark(newsId, user.id);
      if (result.success) {
        return NextResponse.json({
          success: true,
          isBookmarked: result.isBookmarked,
          bookmarkId: result.bookmarkId,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            message: result.message,
            error: result.error,
          },
          { status: 400 },
        );
      }
    }

    // Otherwise, get all bookmarks for the user
    const result = await BookmarkService.getBookmarks(user.id);
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          error: result.error,
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Get bookmarks API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing the request.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});

export const DELETE = withAuth(async (req: Request, user?: JwtPayload) => {
  try {
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required to delete a bookmark.",
          error: "UNAUTHORIZED",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const bookmarkId = searchParams.get("bookmarkId");

    if (!bookmarkId) {
      return NextResponse.json(
        {
          success: false,
          message: "Bookmark ID is required to delete a bookmark.",
          error: "MISSING_BOOKMARK_ID",
        },
        { status: 400 },
      );
    }

    const result = await BookmarkService.deleteBookmark(bookmarkId);
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          error: result.error,
        },
        { status: result.error === "BOOKMARK_NOT_FOUND" ? 404 : 400 },
      );
    }
  } catch (error) {
    console.error("Delete bookmark API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while processing the request.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
});

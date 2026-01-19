import { authMiddleware } from "@/middleware/verify-auth";
import { BookmarkService } from "@/services/bookmark.services";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/bookmarks/[id]
 * Delete a bookmark by bookmark ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authResult = await authMiddleware(request);

    if (!authResult.success || !authResult.user) {
      return authResult.response!;
    }

    const { id } = await params;
    const result = await BookmarkService.deleteBookmark(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Bookmark deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete bookmark error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete bookmark",
      },
      { status: 500 },
    );
  }
}

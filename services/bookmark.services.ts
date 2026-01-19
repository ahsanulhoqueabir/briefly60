import dbConnect from "@/lib/mongodb";
import Bookmark from "@/models/Bookmark.model";
import Article from "@/models/Article.model";
import mongoose from "mongoose";

export class BookmarkService {
  /**
   * Toggle bookmark - Create if doesn't exist, delete if exists
   */
  static async toggleBookmark(newsId: string, userId: string) {
    try {
      await dbConnect();

      // Validate ObjectId format
      if (
        !mongoose.Types.ObjectId.isValid(newsId) ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        return {
          success: false,
          message: "Invalid news ID or user ID format.",
          error: "INVALID_ID_FORMAT",
        };
      }

      // Check if news article exists
      const article = await Article.findById(newsId).select(
        "title source_name source_url",
      );
      if (!article) {
        return {
          success: false,
          message: "News article not found.",
          error: "ARTICLE_NOT_FOUND",
        };
      }

      // Check if bookmark already exists
      const existingBookmark = await Bookmark.findOne({
        user_id: userId,
        news_id: newsId,
      });

      if (existingBookmark) {
        // Bookmark exists, delete it
        await Bookmark.findByIdAndDelete(existingBookmark._id);
        return {
          success: true,
          message: "Bookmark removed successfully.",
          isBookmarked: false,
          bookmarkId: null,
        };
      } else {
        // Bookmark doesn't exist, create it
        const newBookmark = await Bookmark.create({
          user_id: userId,
          news_id: newsId,
          news_title: article.title,
          news_source: article.source_name,
          news_url: article.source_url,
        });

        return {
          success: true,
          message: "Bookmark created successfully.",
          isBookmarked: true,
          bookmarkId: newBookmark._id.toString(),
        };
      }
    } catch (error) {
      console.error("Toggle bookmark error:", error);
      return {
        success: false,
        message: "Failed to toggle bookmark.",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get all bookmarked news IDs for a user
   */
  static async getBookmarkedNewsIds(userId: string) {
    try {
      await dbConnect();

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return {
          success: false,
          message: "Invalid user ID format.",
          error: "INVALID_USER_ID",
          data: [],
        };
      }

      const bookmarks = await Bookmark.find({ user_id: userId })
        .select("news_id")
        .lean();

      const newsIds = bookmarks.map((bookmark) => bookmark.news_id.toString());

      return {
        success: true,
        data: newsIds,
      };
    } catch (error) {
      console.error("Get bookmarked news IDs error:", error);
      return {
        success: false,
        message: "Failed to fetch bookmarked news IDs.",
        error: error instanceof Error ? error.message : String(error),
        data: [],
      };
    }
  }

  /**
   * Get all bookmarks with full details for a user
   */
  static async getBookmarks(userId: string) {
    try {
      await dbConnect();

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return {
          success: false,
          message: "Invalid user ID format.",
          error: "INVALID_USER_ID",
          data: [],
        };
      }

      const bookmarks = await Bookmark.find({ user_id: userId })
        .sort({ bookmarked_at: -1 })
        .lean();

      return {
        success: true,
        data: bookmarks,
      };
    } catch (error) {
      console.error("Get bookmarks error:", error);
      return {
        success: false,
        message: "Failed to fetch bookmarks.",
        error: error instanceof Error ? error.message : String(error),
        data: [],
      };
    }
  }

  /**
   * Check if a specific news article is bookmarked by user
   */
  static async checkBookmark(newsId: string, userId: string) {
    try {
      await dbConnect();

      // Validate ObjectId format
      if (
        !mongoose.Types.ObjectId.isValid(newsId) ||
        !mongoose.Types.ObjectId.isValid(userId)
      ) {
        return {
          success: false,
          message: "Invalid news ID or user ID format.",
          error: "INVALID_ID_FORMAT",
          isBookmarked: false,
          bookmarkId: null,
        };
      }

      const bookmark = await Bookmark.findOne({
        user_id: userId,
        news_id: newsId,
      });

      return {
        success: true,
        isBookmarked: !!bookmark,
        bookmarkId: bookmark ? bookmark._id.toString() : null,
      };
    } catch (error) {
      console.error("Check bookmark error:", error);
      return {
        success: false,
        message: "Failed to check bookmark status.",
        error: error instanceof Error ? error.message : String(error),
        isBookmarked: false,
        bookmarkId: null,
      };
    }
  }

  /**
   * Delete a bookmark by ID
   */
  static async deleteBookmark(bookmarkId: string) {
    try {
      await dbConnect();

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(bookmarkId)) {
        return {
          success: false,
          message: "Invalid bookmark ID format.",
          error: "INVALID_BOOKMARK_ID",
        };
      }

      const deletedBookmark = await Bookmark.findByIdAndDelete(bookmarkId);

      if (!deletedBookmark) {
        return {
          success: false,
          message: "Bookmark not found.",
          error: "BOOKMARK_NOT_FOUND",
        };
      }

      return {
        success: true,
        message: "Bookmark deleted successfully.",
      };
    } catch (error) {
      console.error("Delete bookmark error:", error);
      return {
        success: false,
        message: "Failed to delete bookmark.",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

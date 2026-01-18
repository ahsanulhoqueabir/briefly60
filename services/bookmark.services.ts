import directusApi from "@/lib/directus";

export class BookmarkService {
  static async toggleBookmark(news: string, userId: string) {
    try {
      // Check if bookmark already exists
      const checkResponse = await directusApi.get("/items/bookmarks", {
        params: {
          filter: {
            _and: [
              {
                news: {
                  _eq: news.trim(),
                },
              },
              {
                user: {
                  _eq: userId,
                },
              },
            ],
          },
          limit: 1,
        },
      });

      const existingBookmark = checkResponse.data.data[0];

      if (existingBookmark) {
        // Bookmark exists, delete it
        await directusApi.delete(`/items/bookmarks/${existingBookmark.id}`);
        return {
          success: true,
          message: "Bookmark removed successfully.",
          isBookmarked: false,
          bookmarkId: null,
        };
      } else {
        // Bookmark doesn't exist, create it
        const createResponse = await directusApi.post("/items/bookmarks", {
          news: news.trim(),
          user: userId,
        });
        return {
          success: true,
          message: "Bookmark created successfully.",
          isBookmarked: true,
          bookmarkId: createResponse.data.data.id,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Failed to toggle bookmark.",
        error: error,
      };
    }
  }

  static async createBookmark(news: string, userId: string) {
    try {
      const is_already_bookmarked = await directusApi.get(
        `/items/bookmarks?filter[news][_eq]=${news.trim()}&filter[user][_eq]=${userId}&limit=1`
      );

      if (is_already_bookmarked.data.data.length > 0) {
        return {
          success: false,
          message: "This news is already bookmarked.",
        };
      }
      await directusApi.post("/items/bookmarks", {
        news,
        user: userId,
      });
      return {
        success: true,
        message: "Bookmark created successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to create bookmark.",
        error: error,
      };
    }
  }

  static async getBookmarks(userId: string) {
    try {
      const response = await directusApi.get("/items/bookmarks", {
        params: {
          filter: {
            user: {
              _eq: userId,
            },
          },
          fields: ["id", "news"],
        },
      });
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch bookmarks.",
        error: error,
      };
    }
  }

  static async deleteBookmark(bookmarkId: string) {
    try {
      await directusApi.delete(`/items/bookmarks/${bookmarkId}`);
      return {
        success: true,
        message: "Bookmark deleted successfully.",
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to delete bookmark.",
        error: error,
      };
    }
  }

  static async checkBookmark(newsId: string, userId: string) {
    try {
      const response = await directusApi.get("/items/bookmarks", {
        params: {
          filter: {
            _and: [
              {
                news: {
                  _eq: newsId,
                },
              },
              {
                user: {
                  _eq: userId,
                },
              },
            ],
          },
          limit: 1,
        },
      });
      return {
        success: true,
        isBookmarked: response.data.data.length > 0,
        bookmarkId: response.data.data[0]?.id || null,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to check bookmark status.",
        error: error,
      };
    }
  }
}

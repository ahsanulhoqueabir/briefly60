import dbConnect from "@/lib/mongodb";
import Article, { IArticle } from "@/models/Article.model";
import {
  Article as ArticleType,
  ArticleStatus,
  CreateArticlePayload,
} from "@/types/news.types";
import {
  AdminArticleFilters,
  AdminApiResponse,
  BulkActionPayload,
  BulkActionResult,
  ArticleFormData,
  AdminDashboardStats,
} from "@/types/admin.types";
import mongoose from "mongoose";

/**
 * Admin service for managing articles in MongoDB
 */
export class AdminArticleService {
  /**
   * Convert MongoDB article to API response format
   */
  private static formatArticle(article: IArticle): ArticleType {
    return {
      ...article.toObject(),
      _id: article._id.toString(),
      published_at: article.published_at.toISOString(),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
  }

  /**
   * Build MongoDB filter from admin filters
   * Converts frontend filters to MongoDB query format
   */
  private static buildFilter(
    filters: AdminArticleFilters,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Record<string, any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (filters.status) {
      filter.status = filters.status;
    }

    if (filters.category) {
      filter.category = { $regex: filters.category, $options: "i" };
    }

    if (filters.source_name) {
      filter.source_name = { $regex: filters.source_name, $options: "i" };
    }

    // Search across multiple fields with case-insensitive regex
    if (filters.search) {
      filter.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { content: { $regex: filters.search, $options: "i" } },
        { corrected_title: { $regex: filters.search, $options: "i" } },
      ];
    }

    if (filters.date_from || filters.date_to) {
      filter.published_at = {};
      if (filters.date_from) {
        filter.published_at.$gte = new Date(filters.date_from);
      }
      if (filters.date_to) {
        filter.published_at.$lte = new Date(filters.date_to);
      }
    }

    if (
      filters.importance_min !== undefined ||
      filters.importance_max !== undefined
    ) {
      filter.importance = {};
      if (filters.importance_min !== undefined) {
        filter.importance.$gte = filters.importance_min;
      }
      if (filters.importance_max !== undefined) {
        filter.importance.$lte = filters.importance_max;
      }
    }

    if (
      filters.clickbait_min !== undefined ||
      filters.clickbait_max !== undefined
    ) {
      filter.clickbait_score = {};
      if (filters.clickbait_min !== undefined) {
        filter.clickbait_score.$gte = filters.clickbait_min;
      }
      if (filters.clickbait_max !== undefined) {
        filter.clickbait_score.$lte = filters.clickbait_max;
      }
    }

    return filter;
  }

  /**
   * Get all articles with filters and pagination
   * Queries MongoDB directly with provided filters
   * @param filters - Search and filter criteria
   * @param page - Current page number (1-indexed)
   * @param limit - Number of items per page
   * @returns Paginated articles with metadata
   */
  static async getArticles(
    filters: AdminArticleFilters = {},
    page: number = 1,
    limit: number = 20,
  ): Promise<AdminApiResponse<ArticleType[]>> {
    try {
      await dbConnect();

      // Build MongoDB query from filters
      const mongoFilter = this.buildFilter(filters);
      const offset = (page - 1) * limit;

      // Execute database query with pagination
      const articles = await Article.find(mongoFilter)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .exec();

      // Get total count for pagination
      const totalCount = await Article.countDocuments(mongoFilter);

      const formattedArticles = articles.map((article) =>
        this.formatArticle(article),
      );

      return {
        data: formattedArticles,
        meta: {
          page: page,
          limit: limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        success: true,
      };
    } catch (error) {
      console.error("Error fetching articles:", error);
      return {
        data: [],
        meta: {
          page: page,
          limit: limit,
          total: 0,
          totalPages: 0,
        },
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get single article by ID
   */
  static async getArticleById(
    id: string,
  ): Promise<AdminApiResponse<ArticleType | null>> {
    try {
      await dbConnect();

      const article = await Article.findById(id).exec();

      if (!article) {
        return {
          data: null,
          success: false,
          error: "Article not found",
        };
      }

      return {
        data: this.formatArticle(article),
        success: true,
      };
    } catch (error) {
      console.error(`Error fetching article ${id}:`, error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Create new article
   */
  static async createArticle(
    data: ArticleFormData,
  ): Promise<AdminApiResponse<ArticleType | null>> {
    try {
      await dbConnect();

      const payload: CreateArticlePayload = {
        ...data,
        status: data.status || "draft",
        published_at: data.published_at || new Date().toISOString(),
        summary_60_bn: data.content.substring(0, 300) + "...", // Default Bengali summary
        summary_60_en: data.content.substring(0, 300) + "...", // Default English summary
      };

      const article = new Article(payload);
      const savedArticle = await article.save();

      return {
        data: this.formatArticle(savedArticle),
        success: true,
      };
    } catch (error) {
      console.error("Error creating article:", error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update existing article
   */
  static async updateArticle(
    id: string,
    data: Partial<ArticleFormData>,
  ): Promise<AdminApiResponse<ArticleType | null>> {
    try {
      await dbConnect();

      const article = await Article.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).exec();

      if (!article) {
        return {
          data: null,
          success: false,
          error: "Article not found",
        };
      }

      return {
        data: this.formatArticle(article),
        success: true,
      };
    } catch (error) {
      console.error(`Error updating article ${id}:`, error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete single article
   */
  static async deleteArticle(id: string): Promise<AdminApiResponse<boolean>> {
    try {
      await dbConnect();

      const result = await Article.findByIdAndDelete(id).exec();

      if (!result) {
        return {
          data: false,
          success: false,
          error: "Article not found",
        };
      }

      return {
        data: true,
        success: true,
      };
    } catch (error) {
      console.error(`Error deleting article ${id}:`, error);
      return {
        data: false,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Publish/Unpublish article
   */
  static async togglePublishStatus(
    id: string,
    status: ArticleStatus,
  ): Promise<AdminApiResponse<ArticleType | null>> {
    try {
      return await this.updateArticle(id, { status });
    } catch (error) {
      console.error(`Error toggling publish status for ${id}:`, error);
      return {
        data: null,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Bulk delete articles
   */
  static async bulkDelete(ids: string[]): Promise<BulkActionResult> {
    const result: BulkActionResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    await dbConnect();

    for (const id of ids) {
      try {
        const deleteResult = await Article.findByIdAndDelete(id).exec();
        if (deleteResult) {
          result.success++;
        } else {
          result.failed++;
          result.errors?.push({
            id,
            error: "Article not found",
          });
        }
      } catch (error: any) {
        result.failed++;
        result.errors?.push({
          id,
          error: error.message || "Unknown error",
        });
      }
    }

    return result;
  }

  /**
   * Bulk update article status
   */
  static async bulkUpdateStatus(
    ids: string[],
    status: ArticleStatus,
  ): Promise<BulkActionResult> {
    const result: BulkActionResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    await dbConnect();

    for (const id of ids) {
      try {
        const article = await Article.findByIdAndUpdate(
          id,
          { status },
          { new: true, runValidators: true },
        ).exec();
        if (article) {
          result.success++;
        } else {
          result.failed++;
          result.errors?.push({
            id,
            error: "Article not found",
          });
        }
      } catch (error: any) {
        result.failed++;
        result.errors?.push({
          id,
          error: error.message || "Unknown error",
        });
      }
    }

    return result;
  }

  /**
   * Bulk action handler
   */
  static async bulkAction(
    payload: BulkActionPayload,
  ): Promise<BulkActionResult> {
    switch (payload.action) {
      case "delete":
        return await this.bulkDelete(payload.ids);
      case "publish":
        return await this.bulkUpdateStatus(payload.ids, "published");
      case "unpublish":
        return await this.bulkUpdateStatus(payload.ids, "draft");
      case "archive":
        return await this.bulkUpdateStatus(payload.ids, "archived");
      default:
        throw new Error(`Unknown bulk action: ${payload.action}`);
    }
  }

  /**
   * Get article categories (distinct values)
   */
  static async getCategories(): Promise<string[]> {
    try {
      await dbConnect();

      const categories = await Article.distinct("category").exec();
      return categories.filter(Boolean); // Remove null/undefined values
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback to manual categories
      return [
        "politics",
        "business",
        "technology",
        "sports",
        "entertainment",
        "health",
        "science",
        "education",
        "world",
        "national",
      ];
    }
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<Partial<AdminDashboardStats>> {
    try {
      await dbConnect();

      // Get article counts using aggregation
      const stats = await Article.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]).exec();

      // Get total count
      const totalCount = await Article.countDocuments().exec();

      // Get articles created today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCount = await Article.countDocuments({
        createdAt: { $gte: today },
      }).exec();

      // Process stats
      const statusCounts: Record<string, number> = {};
      stats.forEach((stat) => {
        statusCounts[stat._id] = stat.count;
      });

      return {
        total_articles: totalCount,
        published_articles: statusCounts.published || 0,
        draft_articles: statusCounts.draft || 0,
        articles_today: todayCount,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }
}

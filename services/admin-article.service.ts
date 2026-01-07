import directusApi from "@/lib/directus";
import {
  Article,
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

/**
 * Admin service for managing articles in Directus
 */
export class AdminArticleService {
  private static readonly COLLECTION = "b60_articles";

  /**
   * Get all articles with filters and pagination
   */
  static async getArticles(
    filters: AdminArticleFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<AdminApiResponse<Article[]>> {
    try {
      const params: any = {
        limit,
        offset: (page - 1) * limit,
        meta: "filter_count",
        sort: "-date_created",
      };

      // Build filter object
      const directusFilter: any = {};

      if (filters.status) {
        directusFilter.status = { _eq: filters.status };
      }

      if (filters.category) {
        directusFilter.category = { _icontains: filters.category };
      }

      if (filters.source_name) {
        directusFilter.source_name = { _icontains: filters.source_name };
      }

      if (filters.search) {
        directusFilter._or = [
          { title: { _icontains: filters.search } },
          { content: { _icontains: filters.search } },
          { corrected_title: { _icontains: filters.search } },
        ];
      }

      if (filters.date_from || filters.date_to) {
        directusFilter.published_at = {};
        if (filters.date_from) {
          directusFilter.published_at._gte = filters.date_from;
        }
        if (filters.date_to) {
          directusFilter.published_at._lte = filters.date_to;
        }
      }

      if (filters.importance_min !== undefined) {
        directusFilter.importance = { _gte: filters.importance_min };
      }

      if (filters.importance_max !== undefined) {
        if (directusFilter.importance) {
          directusFilter.importance._lte = filters.importance_max;
        } else {
          directusFilter.importance = { _lte: filters.importance_max };
        }
      }

      if (filters.clickbait_min !== undefined) {
        directusFilter.clickbait_score = { _gte: filters.clickbait_min };
      }

      if (filters.clickbait_max !== undefined) {
        if (directusFilter.clickbait_score) {
          directusFilter.clickbait_score._lte = filters.clickbait_max;
        } else {
          directusFilter.clickbait_score = { _lte: filters.clickbait_max };
        }
      }

      if (Object.keys(directusFilter).length > 0) {
        params.filter = JSON.stringify(directusFilter);
      }

      const response = await directusApi.get(`/items/${this.COLLECTION}`, {
        params,
      });

      const total = response.data.meta?.filter_count || 0;

      return {
        data: response.data.data,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching articles:", error);
      throw error;
    }
  }

  /**
   * Get single article by ID
   */
  static async getArticleById(id: string): Promise<Article> {
    try {
      const response = await directusApi.get(`/items/${this.COLLECTION}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching article ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new article
   */
  static async createArticle(data: ArticleFormData): Promise<Article> {
    try {
      const payload: CreateArticlePayload = {
        ...data,
        status: data.status || "draft",
        published_at: data.published_at || new Date().toISOString(),
      };

      const response = await directusApi.post(
        `/items/${this.COLLECTION}`,
        payload
      );
      return response.data.data;
    } catch (error) {
      console.error("Error creating article:", error);
      throw error;
    }
  }

  /**
   * Update existing article
   */
  static async updateArticle(
    id: string,
    data: Partial<ArticleFormData>
  ): Promise<Article> {
    try {
      const response = await directusApi.patch(
        `/items/${this.COLLECTION}/${id}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error updating article ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete single article
   */
  static async deleteArticle(id: string): Promise<void> {
    try {
      await directusApi.delete(`/items/${this.COLLECTION}/${id}`);
    } catch (error) {
      console.error(`Error deleting article ${id}:`, error);
      throw error;
    }
  }

  /**
   * Publish/Unpublish article
   */
  static async togglePublishStatus(
    id: string,
    status: ArticleStatus
  ): Promise<Article> {
    try {
      return await this.updateArticle(id, { status });
    } catch (error) {
      console.error(`Error toggling publish status for ${id}:`, error);
      throw error;
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

    for (const id of ids) {
      try {
        await this.deleteArticle(id);
        result.success++;
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
    status: ArticleStatus
  ): Promise<BulkActionResult> {
    const result: BulkActionResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const id of ids) {
      try {
        await this.updateArticle(id, { status });
        result.success++;
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
    payload: BulkActionPayload
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
      const response = await directusApi.get(`/items/${this.COLLECTION}`, {
        params: {
          aggregate: JSON.stringify({
            countDistinct: ["category"],
          }),
          groupBy: ["category"],
        },
      });

      return response.data.data.map((item: any) => item.category);
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
      // Total articles
      const totalResponse = await directusApi.get(`/items/${this.COLLECTION}`, {
        params: {
          meta: "filter_count",
          limit: 0,
        },
      });

      // Published articles
      const publishedResponse = await directusApi.get(
        `/items/${this.COLLECTION}`,
        {
          params: {
            meta: "filter_count",
            limit: 0,
            filter: JSON.stringify({ status: { _eq: "published" } }),
          },
        }
      );

      // Draft articles
      const draftResponse = await directusApi.get(`/items/${this.COLLECTION}`, {
        params: {
          meta: "filter_count",
          limit: 0,
          filter: JSON.stringify({ status: { _eq: "draft" } }),
        },
      });

      // Articles created today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayResponse = await directusApi.get(`/items/${this.COLLECTION}`, {
        params: {
          meta: "filter_count",
          limit: 0,
          filter: JSON.stringify({
            date_created: { _gte: today.toISOString() },
          }),
        },
      });

      return {
        total_articles: totalResponse.data.meta?.filter_count || 0,
        published_articles: publishedResponse.data.meta?.filter_count || 0,
        draft_articles: draftResponse.data.meta?.filter_count || 0,
        articles_today: todayResponse.data.meta?.filter_count || 0,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  }
}
